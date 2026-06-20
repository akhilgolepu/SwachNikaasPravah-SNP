"""
Drains API — GET /api/v1/drains, GET /api/v1/drains/{id}, PATCH /api/v1/drains/{id}
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Drain
from ..schemas import DrainOut
import json

router = APIRouter(prefix="/api/v1/drains", tags=["drains"])


@router.get("", response_model=list[DrainOut])
async def list_drains(db: AsyncSession = Depends(get_db)):
    """Retrieve all monitored drains with current state."""
    result = await db.execute(select(Drain).order_by(Drain.risk_index.desc()))
    drains = result.scalars().all()
    return [_drain_to_out(d) for d in drains]


@router.get("/{drain_id}", response_model=DrainOut)
async def get_drain(drain_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a single drain's telemetry."""
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")
    return _drain_to_out(drain)


@router.patch("/{drain_id}", response_model=DrainOut)
async def update_drain(drain_id: str, status: str | None = None, db: AsyncSession = Depends(get_db)):
    """Update drain status (e.g., dismiss)."""
    result = await db.execute(select(Drain).where(Drain.id == drain_id))
    drain = result.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {drain_id} not found")
    if status:
        drain.status = status
    await db.commit()
    await db.refresh(drain)
    return _drain_to_out(drain)


def _drain_to_out(d: Drain) -> DrainOut:
    return DrainOut(
        id=d.id, name=d.name, ward=d.ward, city=d.city,
        lat=d.lat, lng=d.lng, type=d.type,
        blockage_pct=d.blockage_pct,
        rainfall_forecast_mm=d.rainfall_forecast_mm,
        topo_risk=d.topo_risk,
        risk_index=d.risk_index,
        status=d.status, uptime=d.uptime,
        last_frame_at=d.last_frame_at,
        detected=json.loads(d.detected_json) if d.detected_json else [],
    )
