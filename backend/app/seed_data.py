"""
Seed data — populates the database on first run.
Same 12 drains + 5 crews from the original mockData.ts + initial tickets.
"""
from .models import Drain, Crew, Ticket, BlockageAlert
from .risk_engine import compute_ri, ri_status
import json, datetime


def _drain(
    id: str, name: str, ward: str, city: str,
    lat: float, lng: float, dtype: str,
    blockage_pct: float, rainfall_mm: float, topo_risk: float,
    uptime: float, last_frame: str, detected: list[str],
) -> Drain:
    ri = compute_ri(blockage_pct, rainfall_mm, topo_risk)
    return Drain(
        id=id, name=name, ward=ward, city=city,
        lat=lat, lng=lng, type=dtype,
        blockage_pct=blockage_pct,
        rainfall_forecast_mm=rainfall_mm,
        topo_risk=topo_risk,
        risk_index=ri,
        status=ri_status(ri),
        uptime=uptime,
        last_frame_at=last_frame,
        detected_json=json.dumps(detected),
    )


SEED_DRAINS: list[Drain] = [
    _drain("HYD-GCB-014", "Gachibowli Jn. Main Outfall", "Gachibowli", "Hyderabad", 17.4401, 78.3489, "Stormwater", 78, 45, 0.82, 99.4, "2s ago", ["plastic", "silt"]),
    _drain("HYD-KKD-007", "Kukatpally Y-Junction", "Kukatpally", "Hyderabad", 17.4849, 78.4138, "Combined", 62, 38, 0.71, 98.1, "1s ago", ["plastic"]),
    _drain("HYD-BJR-021", "Banjara Hills Rd No. 12", "Banjara Hills", "Hyderabad", 17.4156, 78.4347, "Stormwater", 24, 12, 0.31, 99.9, "1s ago", []),
    _drain("HYD-MDP-003", "Madhapur HITEC Underpass", "Madhapur", "Hyderabad", 17.4483, 78.3915, "Box Culvert", 88, 52, 0.91, 97.7, "3s ago", ["plastic", "debris", "silt"]),
    _drain("HYD-SEC-019", "Secunderabad Clock Tower", "Secunderabad", "Hyderabad", 17.4399, 78.4983, "Combined", 41, 18, 0.45, 99.2, "1s ago", ["silt"]),
    _drain("HYD-AMP-012", "Ameerpet Metro Outfall", "Ameerpet", "Hyderabad", 17.4374, 78.4482, "Stormwater", 56, 28, 0.60, 98.8, "2s ago", ["plastic"]),
    _drain("HYD-JHL-005", "Jubilee Hills Check Post", "Jubilee Hills", "Hyderabad", 17.4239, 78.4070, "Stormwater", 15, 8, 0.22, 99.7, "1s ago", []),
    _drain("HYD-KHJ-009", "Khairatabad Flyover", "Khairatabad", "Hyderabad", 17.4126, 78.4664, "Combined", 69, 33, 0.75, 96.4, "4s ago", ["plastic", "silt"]),
    _drain("MUM-BKC-002", "BKC Connector Drain", "Bandra-Kurla", "Mumbai", 19.0656, 72.8691, "Box Culvert", 71, 62, 0.88, 98.3, "2s ago", ["plastic", "debris"]),
    _drain("MUM-AND-011", "Andheri Sub-Station Inlet", "Andheri West", "Mumbai", 19.1197, 72.8468, "Stormwater", 49, 41, 0.58, 99.1, "1s ago", ["plastic"]),
    _drain("MUM-DAD-006", "Dadar TT Outfall", "Dadar", "Mumbai", 19.0186, 72.8430, "Combined", 33, 22, 0.40, 99.5, "1s ago", []),
    _drain("MUM-WOR-018", "Worli Sea Face Box", "Worli", "Mumbai", 19.0094, 72.8175, "Box Culvert", 84, 68, 0.93, 97.2, "3s ago", ["plastic", "silt", "debris"]),
]

SEED_CREWS: list[Crew] = [
    Crew(id="C-01", name="Crew Alpha", lead="R. Subramanyam", distance_km=1.2, available=True, members=4),
    Crew(id="C-02", name="Crew Bravo", lead="K. Lakshmi", distance_km=2.7, available=True, members=5),
    Crew(id="C-03", name="Crew Charlie", lead="M. Ibrahim", distance_km=3.4, available=False, members=3),
    Crew(id="C-04", name="Crew Delta", lead="S. Venkatesh", distance_km=4.9, available=True, members=4),
    Crew(id="C-05", name="Crew Echo", lead="A. Pradeep", distance_km=6.1, available=True, members=6),
]


def _initial_tickets() -> list[Ticket]:
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + " IST"
    return [
        Ticket(id="TKT-2418", drain_id="HYD-MDP-003", drain_name="Madhapur HITEC Underpass", ward="Madhapur", risk_index=compute_ri(88, 52, 0.91), created_at="4 min ago", status="open", evidence_frame=now_str),
        Ticket(id="TKT-2417", drain_id="MUM-WOR-018", drain_name="Worli Sea Face Box", ward="Worli", risk_index=compute_ri(84, 68, 0.93), created_at="11 min ago", status="assigned", crew="Crew Alpha", eta_min=18, evidence_frame=now_str),
        Ticket(id="TKT-2416", drain_id="HYD-GCB-014", drain_name="Gachibowli Jn. Main Outfall", ward="Gachibowli", risk_index=compute_ri(78, 45, 0.82), created_at="22 min ago", status="in_progress", crew="Crew Bravo", eta_min=6, evidence_frame=now_str),
        Ticket(id="TKT-2415", drain_id="MUM-BKC-002", drain_name="BKC Connector Drain", ward="Bandra-Kurla", risk_index=compute_ri(71, 62, 0.88), created_at="38 min ago", status="resolved", crew="Crew Delta", evidence_frame=now_str),
    ]


SEED_TICKETS = _initial_tickets()


def _initial_alerts() -> list[BlockageAlert]:
    return [
        BlockageAlert(drain_id="HYD-MDP-003", drain_name="Madhapur HITEC Underpass", ward="Madhapur", risk_index=86, kind="blockage", message="Critical blockage detected — plastic + silt"),
        BlockageAlert(drain_id="MUM-WOR-018", drain_name="Worli Sea Face Box", ward="Worli", risk_index=83, kind="weather", message="68mm/6h forecast — high cascade risk"),
    ]


SEED_ALERTS = _initial_alerts()
