"""
Weather API — mock IMD weather data + storm toggle
"""
import datetime, json
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Drain, BlockageAlert
from ..schemas import StormToggleResponse
from ..risk_engine import compute_ri, ri_status
from ..websocket import manager
import random

router = APIRouter(prefix="/api/v1/weather", tags=["weather"])


@router.get("/forecast")
async def get_forecast(db: AsyncSession = Depends(get_db)):
    """Mock IMD weather forecast for all monitored zones."""
    result = await db.execute(select(Drain))
    drains = result.scalars().all()

    wards: dict[str, dict] = {}
    for d in drains:
        if d.ward not in wards:
            wards[d.ward] = {
                "ward": d.ward,
                "city": d.city,
                "rainfall_6h_mm": d.rainfall_forecast_mm,
                "confidence": round(0.7 + random.random() * 0.25, 2),
                "source": "IMD Hyderabad / Mumbai Radar",
            }

    return {
        "timestamp": datetime.datetime.now().isoformat(),
        "source": "India Meteorological Department (Simulated)",
        "forecasts": list(wards.values()),
    }


@router.post("/storm", response_model=StormToggleResponse)
async def toggle_storm(db: AsyncSession = Depends(get_db)):
    """Toggle storm simulation mode — bumps rainfall and blockage across all drains."""
    is_storm = not manager.storm_mode
    manager.storm_mode = is_storm

    result = await db.execute(select(Drain))
    drains = result.scalars().all()

    if is_storm:
        for d in drains:
            d.rainfall_forecast_mm = min(120, d.rainfall_forecast_mm + 35)
            d.blockage_pct = min(99, d.blockage_pct + round(random.random() * 18))
            d.risk_index = compute_ri(d.blockage_pct, d.rainfall_forecast_mm, d.topo_risk)
            d.status = ri_status(d.risk_index)

        alert = BlockageAlert(
            drain_id="SYS",
            drain_name="IMD WEATHER FUSION",
            ward="ALL WARDS",
            risk_index=95,
            kind="weather",
            message="FLASH FLOOD WARNING — 60+mm/6h across monitored network",
        )
        db.add(alert)
        await db.commit()

        await manager.broadcast({
            "event": "STORM_ACTIVATED",
            "message": "FLASH FLOOD WARNING — 60+mm/6h across monitored network",
            "risk_index": 95,
            "timestamp": datetime.datetime.now().isoformat(),
        })

        return StormToggleResponse(storm_mode=True, message="Storm mode activated — all drains elevated")
    else:
        # Reset to original values (re-seed would be better, but this works)
        from ..seed_data import SEED_DRAINS
        for seed in SEED_DRAINS:
            for d in drains:
                if d.id == seed.id:
                    d.blockage_pct = seed.blockage_pct
                    d.rainfall_forecast_mm = seed.rainfall_forecast_mm
                    d.risk_index = seed.risk_index
                    d.status = seed.status
                    break
        await db.commit()

        await manager.broadcast({
            "event": "STORM_DEACTIVATED",
            "message": "Storm mode deactivated — network returning to baseline",
            "timestamp": datetime.datetime.now().isoformat(),
        })

        return StormToggleResponse(storm_mode=False, message="Storm mode deactivated")
