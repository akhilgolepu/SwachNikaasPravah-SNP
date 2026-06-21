"""
Inference API — serves YOLO-annotated frames and MJPEG video streams.

Endpoints:
  GET /{drain_id}/frame       — single JPEG snapshot with YOLO boxes
  GET /{drain_id}/raw-frame   — single JPEG snapshot (no inference)
  GET /{drain_id}/stream      — continuous MJPEG stream with YOLO boxes
  GET /{drain_id}/raw-stream  — continuous MJPEG stream (no inference)
  GET /{drain_id}/detections  — JSON detection results
"""
import io, datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Drain
from ..inference import get_inference_engine

router = APIRouter(prefix="/api/v1/inference", tags=["inference"])


@router.get("/{drain_id}/frame")
async def get_inference_frame(drain_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns a single JPEG frame with YOLO bounding boxes drawn.
    Uses real video files from backend/videos/ or synthetic fallback.
    """
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")

    engine = get_inference_engine()

    # Get frame from video feed (or synthetic fallback)
    frame = engine.get_video_frame(drain_id)

    # Run YOLO inference
    detections = engine.run(frame)

    # Draw bounding boxes
    annotated = engine.draw(frame, detections)

    # Encode to JPEG
    import cv2
    _, jpeg_buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])

    return StreamingResponse(
        io.BytesIO(jpeg_buf.tobytes()),
        media_type="image/jpeg",
        headers={
            "X-Drain-Id": drain_id,
            "X-Detections": str(len(detections)),
            "X-Timestamp": datetime.datetime.now().isoformat(),
        }
    )


@router.get("/{drain_id}/raw-frame")
async def get_raw_frame(drain_id: str, db: AsyncSession = Depends(get_db)):
    """Returns a raw (unannotated) JPEG frame from the video feed."""
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")

    engine = get_inference_engine()
    frame = engine.get_video_frame(drain_id)

    import cv2
    _, jpeg_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])

    return StreamingResponse(
        io.BytesIO(jpeg_buf.tobytes()),
        media_type="image/jpeg",
    )


@router.get("/{drain_id}/stream")
async def get_inference_stream(drain_id: str, db: AsyncSession = Depends(get_db)):
    """
    Continuous MJPEG stream with YOLO inference overlay.
    The browser <img> tag natively supports multipart/x-mixed-replace —
    it will auto-update with each new frame without polling.
    """
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")

    engine = get_inference_engine()

    return StreamingResponse(
        engine.generate_mjpeg_stream(drain_id, with_inference=True),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "X-Drain-Id": drain_id,
        },
    )


@router.get("/{drain_id}/raw-stream")
async def get_raw_stream(drain_id: str, db: AsyncSession = Depends(get_db)):
    """
    Continuous MJPEG stream of the raw video feed (no YOLO inference).
    """
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")

    engine = get_inference_engine()

    return StreamingResponse(
        engine.generate_mjpeg_stream(drain_id, with_inference=False),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "X-Drain-Id": drain_id,
        },
    )


@router.get("/{drain_id}/detections")
async def get_detections(drain_id: str, db: AsyncSession = Depends(get_db)):
    """Returns structured JSON detection results (no image)."""
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")

    engine = get_inference_engine()
    frame = engine.get_video_frame(drain_id)
    detections = engine.run(frame)

    return {
        "drain_id": drain_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "detections": [
            {
                "class": d.class_name,
                "confidence": d.confidence,
                "bbox": [d.x1, d.y1, d.x2, d.y2],
            }
            for d in detections
        ],
    }
