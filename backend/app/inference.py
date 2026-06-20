"""
YOLO Inference Wrapper — pluggable ML pipeline.

By default loads YOLOv8n pre-trained on COCO. The user replaces
YOLO_MODEL_PATH with their custom drain-detection weights (.pt file).

Usage:
    from .inference import get_inference_engine
    engine = get_inference_engine()
    detections = engine.run(frame_bgr)
    annotated = engine.draw(frame_bgr, detections)
"""
import os
import numpy as np
from dataclasses import dataclass

# Model path — swap this to your custom weights
YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")

_engine = None


@dataclass
class Detection:
    """Single bounding box detection."""
    class_name: str
    confidence: float
    x1: int
    y1: int
    x2: int
    y2: int


class InferenceEngine:
    """Wraps Ultralytics YOLO for drain-blockage inference."""

    def __init__(self, model_path: str = YOLO_MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self._load_attempted = False

    def _load_model(self):
        """Lazy-load the YOLO model on first inference call."""
        if self._load_attempted:
            return
        self._load_attempted = True
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_path)
            print(f"[inference] Loaded YOLO model from {self.model_path}")
        except Exception as e:
            print(f"[inference] Could not load YOLO model: {e}")
            print("[inference] Running in placeholder mode — no real detections")
            self.model = None

    def run(self, frame: np.ndarray, conf_threshold: float = 0.25) -> list[Detection]:
        """
        Run inference on a single BGR frame.

        Returns list of Detection objects.
        If the model is not loaded, returns placeholder detections
        to keep the API functional.
        """
        self._load_model()

        if self.model is None:
            # Placeholder detections for demo when model isn't available
            h, w = frame.shape[:2]
            return [
                Detection("plastic", 0.94, int(w * 0.18), int(h * 0.55), int(w * 0.46), int(h * 0.85)),
                Detection("silt", 0.81, int(w * 0.55), int(h * 0.60), int(w * 0.77), int(h * 0.82)),
            ]

        results = self.model(frame, conf=conf_threshold, verbose=False)
        detections: list[Detection] = []

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                cls_name = self.model.names.get(cls_id, f"class_{cls_id}")
                conf = float(box.conf[0])
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]
                detections.append(Detection(cls_name, conf, x1, y1, x2, y2))

        return detections

    def draw(self, frame: np.ndarray, detections: list[Detection]) -> np.ndarray:
        """Draw bounding boxes and labels on the frame."""
        import cv2
        annotated = frame.copy()

        # Color map for known drain-debris classes
        colors = {
            "plastic": (59, 59, 255),     # Red (BGR)
            "silt": (36, 165, 245),       # Amber
            "debris": (0, 165, 255),      # Orange
            "leaves": (0, 200, 0),        # Green
        }
        default_color = (255, 255, 0)  # Cyan for unknown classes

        for det in detections:
            color = colors.get(det.class_name, default_color)
            cv2.rectangle(annotated, (det.x1, det.y1), (det.x2, det.y2), color, 2)
            label = f"{det.class_name} {det.confidence:.2f}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(annotated, (det.x1, det.y1 - th - 8), (det.x1 + tw + 4, det.y1), color, -1)
            cv2.putText(annotated, label, (det.x1 + 2, det.y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        return annotated

    def generate_sample_frame(self, width: int = 640, height: int = 480) -> np.ndarray:
        """
        Generate a synthetic drain-camera frame for demo purposes.
        USER: Replace this with actual RTSP frame capture.
        """
        import cv2

        # Dark scene simulating nighttime CCTV
        frame = np.zeros((height, width, 3), dtype=np.uint8)

        # Sky gradient
        for y in range(height // 2):
            intensity = int(30 + (y / (height // 2)) * 15)
            frame[y, :] = [intensity + 10, intensity, intensity - 5 if intensity > 5 else 0]

        # Ground / drain area
        for y in range(height // 2, height):
            progress = (y - height // 2) / (height // 2)
            r = int(10 + progress * 20)
            g = int(15 + progress * 25)
            b = int(30 + progress * 40)
            frame[y, :] = [b, g, r]

        # Drain grate lines
        grate_y = int(height * 0.75)
        for x in range(0, width, 15):
            cv2.line(frame, (x, grate_y), (x, grate_y + 40), (30, 30, 30), 2)
        cv2.rectangle(frame, (40, grate_y), (width - 40, grate_y + 40), (40, 40, 40), 2)

        # Simulated debris blobs
        cv2.ellipse(frame, (int(width * 0.3), int(height * 0.7)), (40, 25), 0, 0, 360, (50, 70, 90), -1)
        cv2.ellipse(frame, (int(width * 0.65), int(height * 0.72)), (30, 20), 15, 0, 360, (60, 55, 45), -1)

        # Noise overlay
        noise = np.random.randint(0, 15, frame.shape, dtype=np.uint8)
        frame = cv2.add(frame, noise)

        # Timestamp overlay
        ts = "DrainageAI RTSP SIM"
        cv2.putText(frame, ts, (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (180, 180, 180), 1)

        return frame


def get_inference_engine() -> InferenceEngine:
    """Singleton accessor."""
    global _engine
    if _engine is None:
        _engine = InferenceEngine()
    return _engine
