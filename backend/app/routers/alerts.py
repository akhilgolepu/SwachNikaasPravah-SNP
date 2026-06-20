"""
Alerts API — GET /api/v1/alerts, GET /api/v1/alerts/active, POST dismiss
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import BlockageAlert
from ..schemas import AlertOut

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
async def list_alerts(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Retrieve all alerts (newest first), with optional limit."""
    result = await db.execute(
        select(BlockageAlert).order_by(BlockageAlert.detected_at.desc()).limit(limit)
    )
    return result.scalars().all()


@router.get("/active", response_model=list[AlertOut])
async def active_alerts(db: AsyncSession = Depends(get_db)):
    """Retrieve only unresolved / recent alerts."""
    result = await db.execute(
        select(BlockageAlert)
        .order_by(BlockageAlert.detected_at.desc())
        .limit(40)
    )
    return result.scalars().all()


@router.delete("/{alert_id}")
async def dismiss_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    """Dismiss (delete) an alert by ID."""
    result = await db.execute(select(BlockageAlert).where(BlockageAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if alert:
        await db.delete(alert)
        await db.commit()
    return {"status": "ok"}
