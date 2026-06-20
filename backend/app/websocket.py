"""
WebSocket connection manager — broadcasts real-time alerts to all connected
ICCC dashboard clients.
"""
import asyncio, json, random, datetime
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select
from .database import async_session
from .models import Drain, BlockageAlert
from .risk_engine import compute_ri, ri_status, check_persistence


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts."""

    def __init__(self):
        self.active: list[WebSocket] = []
        self._storm_mode = False

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        """Send JSON to every connected client."""
        payload = json.dumps(data, default=str)
        dead: list[WebSocket] = []
        for ws in self.active:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    @property
    def storm_mode(self) -> bool:
        return self._storm_mode

    @storm_mode.setter
    def storm_mode(self, value: bool):
        self._storm_mode = value


manager = ConnectionManager()


async def handle_websocket(ws: WebSocket):
    """Per-connection handler — keeps the socket alive, handles incoming msgs."""
    await manager.connect(ws)
    try:
        # Send initial connection confirmation
        await ws.send_text(json.dumps({
            "event": "CONNECTED",
            "message": "WebSocket connected to DrainageAI ICCC",
            "timestamp": datetime.datetime.now().isoformat(),
        }))
        # Keep alive — listen for client messages (e.g., ping)
        while True:
            data = await ws.receive_text()
            # Client can send {"action": "ping"} to keep alive
            if data:
                msg = json.loads(data)
                if msg.get("action") == "ping":
                    await ws.send_text(json.dumps({"event": "PONG"}))
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)


async def alert_generator_loop():
    """
    Background task — periodically generates simulated blockage alerts.
    Runs every ~30 seconds. In storm mode, runs more aggressively.
    """
    await asyncio.sleep(5)  # Wait for app startup
    while True:
        interval = 15 if manager.storm_mode else 45
        await asyncio.sleep(interval)

        try:
            async with async_session() as session:
                result = await session.execute(
                    select(Drain).where(Drain.status.notin_(["dispatched", "dismissed"]))
                )
                candidates = result.scalars().all()
                if not candidates:
                    continue

                target = random.choice(candidates)

                # Simulate blockage growth
                bump = random.randint(5, 20)
                new_blockage = min(99, target.blockage_pct + bump)
                new_ri = compute_ri(new_blockage, target.rainfall_forecast_mm, target.topo_risk)

                # Apply temporal persistence filter
                persisted = check_persistence(target.id, new_blockage)

                # Update drain in DB
                target.blockage_pct = new_blockage
                target.risk_index = new_ri
                target.status = ri_status(new_ri)
                target.last_frame_at = "now"
                session.add(target)

                # Only create alert if persistence check passes
                if persisted:
                    detected_str = ", ".join(target.detected) if target.detected else "debris"
                    alert = BlockageAlert(
                        drain_id=target.id,
                        drain_name=target.name,
                        ward=target.ward,
                        risk_index=new_ri,
                        kind="blockage",
                        message=f"Blockage rising to {int(new_blockage)}% — {detected_str}",
                    )
                    session.add(alert)

                await session.commit()

                # Broadcast via WebSocket
                ws_payload = {
                    "event": "BLOCKAGE_ALERT" if persisted else "DRAIN_UPDATE",
                    "drain_id": target.id,
                    "drain_name": target.name,
                    "ward": target.ward,
                    "risk_index": new_ri,
                    "blockage_pct": new_blockage,
                    "status": ri_status(new_ri),
                    "kind": "blockage",
                    "message": f"Blockage rising to {int(new_blockage)}% — {', '.join(target.detected) or 'debris'}",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "persisted": persisted,
                }
                await manager.broadcast(ws_payload)

        except Exception as e:
            print(f"[alert_generator] Error: {e}")
