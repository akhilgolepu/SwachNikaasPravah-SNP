"""
YOLO Inference Engine — Real video feed + trained drain-detection model.

Uses the trained drain_premium_model (YOLOv8s fine-tuned on 6 drain classes)
and reads real video files from backend/videos/ to simulate live CCTV feeds.

Detection classes (from data.yaml):
  0: closed manhole (not overflowing)
  1: drainage overflow (repair)
  2: fake manhole
  3: open drainage (not overflowing)
  4: open drainage (overflowing)
  5: open manhole (not overflowing)
"""
import os
import time
import threading
import numpy as np
import cv2
from dataclasses import dataclass
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = os.getenv(
    "YOLO_MODEL_PATH",
    str(BACKEND_DIR / "models" / "drain_detector.pt"),
)
VIDEOS_DIR = BACKEND_DIR / "videos"

# ── Class names matching data.yaml ───────────────────────────────────────────
CLASS_NAMES = {
    0: "closed manhole",
    1: "drainage overflow",
    2: "fake manhole",
    3: "open drainage",
    4: "open drainage (overflow)",
    5: "open manhole",
}

# ── Class colors (BGR for OpenCV) ────────────────────────────────────────────
CLASS_COLORS = {
    "closed manhole":           (180, 180, 50),   # Teal
    "drainage overflow":        (50, 50, 255),     # Red — critical
    "fake manhole":             (200, 200, 200),   # Grey
    "open drainage":            (50, 200, 255),    # Orange
    "open drainage (overflow)": (0, 0, 255),       # Bright red — most critical
    "open manhole":             (0, 180, 255),     # Amber
}
DEFAULT_COLOR = (255, 255, 0)  # Cyan fallback


@dataclass
class Detection:
    """Single bounding box detection."""
    class_name: str
    confidence: float
    x1: int
    y1: int
    x2: int
    y2: int


class VideoFeedManager:
    """
    Manages looping video file playback for multiple drain camera feeds.
    Each drain_id is mapped to a video file (round-robin across available videos).
    Thread-safe frame access via locks.
    """

    def __init__(self, videos_dir: Path):
        self.videos_dir = videos_dir
        self._caps: dict[str, cv2.VideoCapture] = {}
        self._locks: dict[str, threading.Lock] = {}
        self._video_files: list[Path] = []
        self._drain_video_map: dict[str, Path] = {}
        self._scan_videos()

    def _scan_videos(self):
        """Discover all MP4/AVI/MKV files in the videos directory."""
        if not self.videos_dir.exists():
            print(f"[video] Videos directory not found: {self.videos_dir}")
            return
        extensions = {".mp4", ".avi", ".mkv", ".mov", ".webm"}
        self._video_files = sorted([
            f for f in self.videos_dir.iterdir()
            if f.suffix.lower() in extensions
        ])
        if self._video_files:
            print(f"[video] Found {len(self._video_files)} video files:")
            for f in self._video_files:
                print(f"  → {f.name}")
        else:
            print(f"[video] No video files found in {self.videos_dir}")
            print(f"[video] Place MP4 files as feed_1.mp4, feed_2.mp4, etc.")

    def _get_video_for_drain(self, drain_id: str) -> Path | None:
        """Map a drain_id to a video file (round-robin)."""
        if not self._video_files:
            return None
        if drain_id not in self._drain_video_map:
            idx = len(self._drain_video_map) % len(self._video_files)
            self._drain_video_map[drain_id] = self._video_files[idx]
        return self._drain_video_map[drain_id]

    def get_frame(self, drain_id: str) -> np.ndarray | None:
        """
        Get the next frame from the video mapped to this drain_id.
        Loops the video when it reaches the end.
        Returns a BGR numpy array resized to 640x480, or None if no video.
        """
        video_path = self._get_video_for_drain(drain_id)
        if video_path is None:
            return None

        key = str(video_path)

        # Lazy-init capture + lock
        if key not in self._caps:
            cap = cv2.VideoCapture(str(video_path))
            if not cap.isOpened():
                print(f"[video] Failed to open: {video_path}")
                return None
            self._caps[key] = cap
            self._locks[key] = threading.Lock()

        lock = self._locks[key]
        cap = self._caps[key]

        with lock:
            ret, frame = cap.read()
            if not ret:
                # Loop: reset to beginning
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()
                if not ret:
                    return None

            # Resize to standard CCTV resolution
            frame = cv2.resize(frame, (640, 480))
            return frame

    def release_all(self):
        """Release all video captures."""
        for cap in self._caps.values():
            cap.release()
        self._caps.clear()


class InferenceEngine:
    """Wraps Ultralytics YOLO with trained drain-detection weights + video feeds."""

    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self._load_attempted = False
        self.video_manager = VideoFeedManager(VIDEOS_DIR)

    def _load_model(self):
        """Lazy-load the YOLO model on first inference call."""
        if self._load_attempted:
            return
        self._load_attempted = True
        try:
            from ultralytics import YOLO
            if os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
                print(f"[inference] ✓ Loaded trained drain-detection model from {self.model_path}")
            else:
                # Fallback to base YOLOv8n if custom model not found
                self.model = YOLO("yolov8n.pt")
                print(f"[inference] Custom model not found at {self.model_path}")
                print(f"[inference] Falling back to YOLOv8n base model")
        except Exception as e:
            print(f"[inference] Could not load YOLO model: {e}")
            print("[inference] Running in placeholder mode — no real detections")
            self.model = None

    def get_video_frame(self, drain_id: str) -> np.ndarray:
        """
        Get a frame from the video feed for this drain.
        Falls back to a synthetic frame if no videos are available.
        """
        frame = self.video_manager.get_frame(drain_id)
        if frame is not None:
            return frame
        # Fallback: generate synthetic frame
        return self._generate_fallback_frame()

    def run(self, frame: np.ndarray, conf_threshold: float = 0.25) -> list[Detection]:
        """
        Run YOLO inference on a single BGR frame.
        Returns list of Detection objects with drain-specific class names.
        """
        self._load_model()

        if self.model is None:
            # Placeholder detections for demo when model isn't available
            h, w = frame.shape[:2]
            return [
                Detection("drainage overflow", 0.92, int(w * 0.15), int(h * 0.50), int(w * 0.45), int(h * 0.85)),
                Detection("open drainage (overflow)", 0.87, int(w * 0.55), int(h * 0.55), int(w * 0.80), int(h * 0.82)),
            ]

        results = self.model(frame, conf=conf_threshold, verbose=False)
        detections: list[Detection] = []

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                # Use our trained class names, fall back to model's built-in names
                cls_name = CLASS_NAMES.get(cls_id, self.model.names.get(cls_id, f"class_{cls_id}"))
                conf = float(box.conf[0])
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]
                detections.append(Detection(cls_name, conf, x1, y1, x2, y2))

        return detections

    def draw(self, frame: np.ndarray, detections: list[Detection]) -> np.ndarray:
        """Draw bounding boxes and labels on the frame with drain-specific styling."""
        annotated = frame.copy()

        for det in detections:
            color = CLASS_COLORS.get(det.class_name, DEFAULT_COLOR)

            # Draw box with thicker lines for critical classes
            thickness = 3 if "overflow" in det.class_name else 2
            cv2.rectangle(annotated, (det.x1, det.y1), (det.x2, det.y2), color, thickness)

            # Label with confidence
            label = f"{det.class_name} {det.confidence:.0%}"
            font_scale = 0.45
            (tw, th), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 1)

            # Label background
            cv2.rectangle(
                annotated,
                (det.x1, det.y1 - th - 10),
                (det.x1 + tw + 6, det.y1),
                color, -1,
            )
            # Label text
            cv2.putText(
                annotated, label,
                (det.x1 + 3, det.y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), 1, cv2.LINE_AA,
            )

        # Add CCTV-style overlay
        h, w = annotated.shape[:2]
        ts = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(annotated, f"SNP DRAIN-CAM | {ts}", (10, 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1, cv2.LINE_AA)
        cv2.putText(annotated, f"DETECTIONS: {len(detections)}", (w - 180, 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1, cv2.LINE_AA)

        return annotated

    def annotate_with_yolo(self, frame: np.ndarray) -> np.ndarray:
        """Convenience: run inference + draw in one call. Returns annotated frame."""
        detections = self.run(frame)
        return self.draw(frame, detections)

    def generate_mjpeg_stream(self, drain_id: str, with_inference: bool = True):
        """
        Generator that yields MJPEG frames continuously from the video feed.
        Used for multipart/x-mixed-replace streaming.
        """
        while True:
            frame = self.get_video_frame(drain_id)

            if with_inference:
                frame = self.annotate_with_yolo(frame)

            _, jpeg_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_bytes = jpeg_buf.tobytes()

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )

            # ~10 FPS for smooth but not CPU-crushing playback
            time.sleep(0.1)

    def _generate_fallback_frame(self, width: int = 640, height: int = 480) -> np.ndarray:
        """Synthetic drain-camera frame when no videos are available."""
        frame = np.zeros((height, width, 3), dtype=np.uint8)

        # Dark gradient background
        for y in range(height):
            intensity = int(15 + (y / height) * 25)
            frame[y, :] = [intensity + 10, intensity, max(0, intensity - 5)]

        # Drain grate lines
        grate_y = int(height * 0.7)
        for x in range(0, width, 15):
            cv2.line(frame, (x, grate_y), (x, grate_y + 50), (30, 30, 30), 2)
        cv2.rectangle(frame, (30, grate_y), (width - 30, grate_y + 50), (40, 40, 40), 2)

        # Debris blobs
        cv2.ellipse(frame, (int(width * 0.3), int(height * 0.72)), (45, 28), 0, 0, 360, (50, 70, 90), -1)
        cv2.ellipse(frame, (int(width * 0.65), int(height * 0.74)), (35, 22), 15, 0, 360, (60, 55, 45), -1)

        # Noise
        noise = np.random.randint(0, 12, frame.shape, dtype=np.uint8)
        frame = cv2.add(frame, noise)

        # Timestamp
        ts = f"SNP RTSP SIM | {time.strftime('%H:%M:%S')}"
        cv2.putText(frame, ts, (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (180, 180, 180), 1)

        return frame


# ── Singleton ────────────────────────────────────────────────────────────────
_engine: InferenceEngine | None = None


def get_inference_engine() -> InferenceEngine:
    """Singleton accessor."""
    global _engine
    if _engine is None:
        _engine = InferenceEngine()
    return _engine
