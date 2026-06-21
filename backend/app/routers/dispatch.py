"""
Dispatch & Tickets API — POST dispatch, GET tickets, POST resolve/escalate, GET crews
"""
import random, datetime, json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Drain, Crew, Ticket, BlockageAlert
from ..schemas import DispatchRequest, TicketOut, CrewOut
from ..risk_engine import compute_ri, ri_status
from ..websocket import manager

router = APIRouter(prefix="/api/v1", tags=["dispatch"])


# ── Crews ────────────────────────────────────────────────────────────────────
@router.get("/crews", response_model=list[CrewOut])
async def list_crews(db: AsyncSession = Depends(get_db)):
    """List all field crews sorted by distance."""
    result = await db.execute(select(Crew).order_by(Crew.distance_km))
    return result.scalars().all()


# ── Tickets ──────────────────────────────────────────────────────────────────
@router.get("/tickets", response_model=list[TicketOut])
async def list_tickets(db: AsyncSession = Depends(get_db)):
    """List all tickets (newest first)."""
    result = await db.execute(select(Ticket).order_by(Ticket.created_at.desc()))
    return result.scalars().all()


# ── Dispatch ─────────────────────────────────────────────────────────────────
@router.post("/dispatch", response_model=TicketOut)
async def dispatch_crew(req: DispatchRequest, db: AsyncSession = Depends(get_db)):
    """Dispatch a field crew to a drain — creates or updates a ticket."""
    # Validate drain
    drain_res = await db.execute(select(Drain).where(Drain.id == req.drain_id))
    drain = drain_res.scalar_one_or_none()
    if not drain:
        raise HTTPException(404, f"Drain {req.drain_id} not found")

    # Validate crew
    crew_res = await db.execute(select(Crew).where(Crew.name == req.crew_name))
    crew = crew_res.scalar_one_or_none()
    if not crew:
        raise HTTPException(404, f"Crew {req.crew_name} not found")
    if not crew.available:
        raise HTTPException(409, f"Crew {req.crew_name} is currently engaged")

    eta_min = round(8 + random.random() * 20)

    # Check for existing open/assigned ticket
    existing_res = await db.execute(
        select(Ticket).where(
            Ticket.drain_id == req.drain_id,
            Ticket.status.in_(["open", "assigned"]),
        )
    )
    existing = existing_res.scalar_one_or_none()

    if existing:
        existing.status = "in_progress"
        existing.crew = req.crew_name
        existing.eta_min = eta_min
        ticket = existing
    else:
        # Count tickets for ID generation
        count_res = await db.execute(select(Ticket))
        count = len(count_res.scalars().all())
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + " IST"
        ticket = Ticket(
            id=f"TKT-{2419 + count}",
            drain_id=drain.id,
            drain_name=drain.name,
            ward=drain.ward,
            risk_index=drain.risk_index,
            created_at="just now",
            status="in_progress",
            crew=req.crew_name,
            eta_min=eta_min,
            evidence_frame=now_str,
        )
        db.add(ticket)

    # Update drain status
    drain.status = "dispatched"

    # Mark crew as engaged
    crew.available = False

    # Create dispatch alert
    alert = BlockageAlert(
        drain_id=drain.id,
        drain_name=drain.name,
        ward=drain.ward,
        risk_index=drain.risk_index,
        kind="dispatch",
        message=f"{req.crew_name} dispatched — ETA {eta_min}m",
    )
    db.add(alert)

    await db.commit()
    await db.refresh(ticket)

    # Broadcast via WebSocket
    await manager.broadcast({
        "event": "DISPATCH",
        "drain_id": drain.id,
        "drain_name": drain.name,
        "ward": drain.ward,
        "risk_index": drain.risk_index,
        "crew": req.crew_name,
        "eta_min": eta_min,
        "ticket_id": ticket.id,
        "kind": "dispatch",
        "message": f"{req.crew_name} dispatched — ETA {eta_min}m",
        "timestamp": datetime.datetime.now().isoformat(),
    })

    return ticket


# ── Resolve ──────────────────────────────────────────────────────────────────
@router.post("/tickets/{ticket_id}/resolve", response_model=TicketOut)
async def resolve_ticket(ticket_id: str, db: AsyncSession = Depends(get_db)):
    """Resolve a ticket — clears drain, frees crew."""
    ticket_res = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = ticket_res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, f"Ticket {ticket_id} not found")

    ticket.status = "resolved"

    # Reset drain
    drain_res = await db.execute(select(Drain).where(Drain.id == ticket.drain_id))
    drain = drain_res.scalar_one_or_none()
    if drain:
        drain.status = "ok"
        drain.risk_index = 15
        drain.blockage_pct = 10

    # Free crew
    if ticket.crew:
        crew_res = await db.execute(select(Crew).where(Crew.name == ticket.crew))
        crew = crew_res.scalar_one_or_none()
        if crew:
            crew.available = True

    # Alert
    alert = BlockageAlert(
        drain_id=ticket.drain_id,
        drain_name=ticket.drain_name,
        ward=ticket.ward,
        risk_index=15,
        kind="blockage",
        message=f"Ticket {ticket_id} resolved — site cleared by {ticket.crew or 'field crew'}",
    )
    db.add(alert)

    await db.commit()
    await db.refresh(ticket)

    await manager.broadcast({
        "event": "TICKET_RESOLVED",
        "ticket_id": ticket_id,
        "drain_id": ticket.drain_id,
        "drain_name": ticket.drain_name,
        "timestamp": datetime.datetime.now().isoformat(),
    })

    return ticket


# ── Escalate ─────────────────────────────────────────────────────────────────
@router.post("/tickets/{ticket_id}/escalate", response_model=TicketOut)
async def escalate_ticket(ticket_id: str, db: AsyncSession = Depends(get_db)):
    """Escalate a ticket to Senior Engineer."""
    ticket_res = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = ticket_res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, f"Ticket {ticket_id} not found")

    new_ri = min(100, ticket.risk_index + 15)
    ticket.risk_index = new_ri
    ticket.status = "escalated"

    # Update drain
    drain_res = await db.execute(select(Drain).where(Drain.id == ticket.drain_id))
    drain = drain_res.scalar_one_or_none()
    if drain:
        drain.risk_index = new_ri
        drain.status = "critical"

    alert = BlockageAlert(
        drain_id=ticket.drain_id,
        drain_name=ticket.drain_name,
        ward=ticket.ward,
        risk_index=new_ri,
        kind="weather",
        message=f"CRITICAL ESCALATION for ticket {ticket_id} — Senior Engineer requested.",
    )
    db.add(alert)

    await db.commit()
    await db.refresh(ticket)

    await manager.broadcast({
        "event": "TICKET_ESCALATED",
        "ticket_id": ticket_id,
        "drain_id": ticket.drain_id,
        "risk_index": new_ri,
        "timestamp": datetime.datetime.now().isoformat(),
    })

    return ticket
