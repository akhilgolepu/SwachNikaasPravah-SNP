"""
Inference API — serves processed frames with YOLO bounding boxes.
USER: Plug your trained model and real RTSP frames here.
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
    Returns a JPEG frame with YOLO bounding boxes drawn.

    Currently uses a synthetic frame + placeholder/COCO model.
    USER: Replace generate_sample_frame() with actual RTSP capture.
    """
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")

    engine = get_inference_engine()

    # Generate or capture frame
    # USER: Replace this with cv2.VideoCapture(rtsp_url).read()
    frame = engine.generate_sample_frame()

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
    """
    Returns a raw (unannotated) JPEG frame.
    USER: Replace with actual RTSP frame capture.
    """
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")

    engine = get_inference_engine()
    frame = engine.generate_sample_frame()

    import cv2
    _, jpeg_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])

    return StreamingResponse(
        io.BytesIO(jpeg_buf.tobytes()),
        media_type="image/jpeg",
    )


@router.get("/{drain_id}/detections")
async def get_detections(drain_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns structured JSON detection results (no image).
    """
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")

    engine = get_inference_engine()
    frame = engine.generate_sample_frame()
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
