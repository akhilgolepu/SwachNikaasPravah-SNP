"""
DrainageAI — FastAPI Backend Entry Point

Serves REST API, WebSocket, and YOLO inference endpoints for the
ICCC Command Center dashboard.

Run with: uvicorn app.main:app --reload --port 8000
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .database import init_db, async_session
from .models import Drain, Crew, Ticket, BlockageAlert
from .seed_data import SEED_DRAINS, SEED_CREWS, SEED_TICKETS, SEED_ALERTS
from .websocket import handle_websocket, alert_generator_loop
from .routers import drains, alerts, dispatch, weather, inference


async def seed_if_empty():
    """Populate database with initial data on first launch."""
    async with async_session() as session:
        result = await session.execute(select(Drain).limit(1))
        if result.scalar_one_or_none() is not None:
            return  # Already seeded

        print("[startup] Seeding database with initial drain data...")
        for d in SEED_DRAINS:
            session.add(Drain(
                id=d.id, name=d.name, ward=d.ward, city=d.city,
                lat=d.lat, lng=d.lng, type=d.type,
                blockage_pct=d.blockage_pct,
                rainfall_forecast_mm=d.rainfall_forecast_mm,
                topo_risk=d.topo_risk,
                risk_index=d.risk_index,
                status=d.status, uptime=d.uptime,
                last_frame_at=d.last_frame_at,
                detected_json=d.detected_json,
            ))
        for c in SEED_CREWS:
            session.add(Crew(
                id=c.id, name=c.name, lead=c.lead,
                distance_km=c.distance_km,
                available=c.available, members=c.members,
            ))
        for t in SEED_TICKETS:
            session.add(Ticket(
                id=t.id, drain_id=t.drain_id, drain_name=t.drain_name,
                ward=t.ward, risk_index=t.risk_index,
                created_at=t.created_at, status=t.status,
                crew=t.crew, eta_min=t.eta_min,
                evidence_frame=t.evidence_frame,
            ))
        for a in SEED_ALERTS:
            session.add(BlockageAlert(
                drain_id=a.drain_id, drain_name=a.drain_name,
                ward=a.ward, risk_index=a.risk_index,
                kind=a.kind, message=a.message,
            ))
        await session.commit()
        print("[startup] Database seeded successfully.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle — runs on startup and shutdown."""
    # Startup
    await init_db()
    await seed_if_empty()

    # Launch background alert generator
    task = asyncio.create_task(alert_generator_loop())
    print("[startup] DrainageAI backend ready on http://localhost:8000")
    print("[startup] WebSocket available at ws://localhost:8000/api/v1/stream/alerts")
    print("[startup] Swagger docs at http://localhost:8000/docs")

    yield

    # Shutdown
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="DrainageAI — ICCC Backend",
    description="Real-time AI-powered drainage monitoring API for Indian smart cities.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST routers
app.include_router(drains.router)
app.include_router(alerts.router)
app.include_router(dispatch.router)
app.include_router(weather.router)
app.include_router(inference.router)


# WebSocket endpoint
@app.websocket("/api/v1/stream/alerts")
async def websocket_endpoint(ws: WebSocket):
    await handle_websocket(ws)


# Health check
@app.get("/api/v1/health")
async def health():
    return {
        "status": "ok",
        "service": "DrainageAI ICCC Backend",
        "version": "1.0.0",
    }
