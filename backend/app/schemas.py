"""
Pydantic schemas for API request / response serialization.
"""
from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel


# ── Drain ────────────────────────────────────────────────────────────────────
class DrainOut(BaseModel):
    id: str
    name: str
    ward: str
    city: str
    lat: float
    lng: float
    type: str
    blockage_pct: float
    rainfall_forecast_mm: float
    topo_risk: float
    risk_index: int
    status: str
    uptime: float
    last_frame_at: str
    detected: list[str]

    model_config = {"from_attributes": True}


# ── Alert ────────────────────────────────────────────────────────────────────
class AlertOut(BaseModel):
    id: int
    drain_id: str
    drain_name: str
    ward: str
    risk_index: int
    kind: str
    message: str
    detected_at: datetime

    model_config = {"from_attributes": True}


# ── Crew ─────────────────────────────────────────────────────────────────────
class CrewOut(BaseModel):
    id: str
    name: str
    lead: str
    distance_km: float
    available: bool
    members: int

    model_config = {"from_attributes": True}


# ── Ticket ───────────────────────────────────────────────────────────────────
class TicketOut(BaseModel):
    id: str
    drain_id: str
    drain_name: str
    ward: str
    risk_index: int
    created_at: str
    status: str
    crew: str | None = None
    eta_min: int | None = None
    evidence_frame: str

    model_config = {"from_attributes": True}


# ── Requests ─────────────────────────────────────────────────────────────────
class DispatchRequest(BaseModel):
    drain_id: str
    crew_name: str


class StormToggleResponse(BaseModel):
    storm_mode: bool
    message: str


class WebSocketAlert(BaseModel):
    """Payload pushed to clients via WebSocket."""
    event: str = "BLOCKAGE_ALERT"
    drain_id: str
    drain_name: str
    ward: str
    risk_index: int
    kind: str
    message: str
    timestamp: datetime
