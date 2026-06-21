"""
SQLAlchemy ORM models — maps to the TRD database schema.
"""
import datetime, json
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


class Drain(Base):
    __tablename__ = "drains"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    ward: Mapped[str] = mapped_column(String(100))
    city: Mapped[str] = mapped_column(String(50))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    type: Mapped[str] = mapped_column(String(50))  # Stormwater | Combined | Box Culvert
    blockage_pct: Mapped[float] = mapped_column(Float, default=0)
    rainfall_forecast_mm: Mapped[float] = mapped_column(Float, default=0)
    topo_risk: Mapped[float] = mapped_column(Float, default=0)  # 0-1
    risk_index: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="ok")  # critical|warning|ok|dispatched|dismissed
    uptime: Mapped[float] = mapped_column(Float, default=99.0)
    last_frame_at: Mapped[str] = mapped_column(String(50), default="1s ago")
    detected_json: Mapped[str] = mapped_column(Text, default="[]")  # JSON array of detected classes

    @property
    def detected(self) -> list[str]:
        return json.loads(self.detected_json) if self.detected_json else []

    @detected.setter
    def detected(self, value: list[str]):
        self.detected_json = json.dumps(value)


class BlockageAlert(Base):
    __tablename__ = "blockage_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    drain_id: Mapped[str] = mapped_column(String(50))
    drain_name: Mapped[str] = mapped_column(String(200), default="")
    ward: Mapped[str] = mapped_column(String(100), default="")
    risk_index: Mapped[int] = mapped_column(Integer, default=0)
    kind: Mapped[str] = mapped_column(String(20), default="blockage")  # blockage|weather|dispatch
    message: Mapped[str] = mapped_column(Text, default="")
    detected_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )


class Crew(Base):
    __tablename__ = "crews"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    lead: Mapped[str] = mapped_column(String(100))
    distance_km: Mapped[float] = mapped_column(Float, default=0)
    available: Mapped[bool] = mapped_column(Boolean, default=True)
    members: Mapped[int] = mapped_column(Integer, default=4)


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    drain_id: Mapped[str] = mapped_column(String(50))
    drain_name: Mapped[str] = mapped_column(String(200))
    ward: Mapped[str] = mapped_column(String(100))
    risk_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[str] = mapped_column(String(50), default="just now")
    status: Mapped[str] = mapped_column(String(20), default="open")  # open|assigned|in_progress|resolved|escalated
    crew: Mapped[str | None] = mapped_column(String(100), nullable=True)
    eta_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    evidence_frame: Mapped[str] = mapped_column(String(100), default="")
