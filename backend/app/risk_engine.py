"""
Risk-Index computation — mirrors the PRD formula:
    RI = 0.5·A_b + 0.3·R_f_norm + 0.2·V_t·100
"""


def compute_ri(blockage_pct: float, rainfall_forecast_mm: float, topo_risk: float) -> int:
    """
    Compute the unified Risk Index (0-100).

    Args:
        blockage_pct: Percentage of drain area blocked (0-100).
        rainfall_forecast_mm: Anticipated 6-hour rainfall volume in mm.
        topo_risk: Local topological vulnerability score (0.0-1.0).

    Returns:
        Integer risk score 0-100.
    """
    rf_norm = min(rainfall_forecast_mm / 70.0, 1.0) * 100
    return round(0.5 * blockage_pct + 0.3 * rf_norm + 0.2 * topo_risk * 100)


def ri_status(ri: int) -> str:
    """Map RI to risk status category."""
    if ri >= 70:
        return "critical"
    if ri >= 45:
        return "warning"
    return "ok"


# ── Temporal Persistence Filter ──────────────────────────────────────────────
# Tracks consecutive high-blockage readings per drain to filter transient objects.
# A blockage event fires only after N consecutive readings above threshold.

_persistence_buffer: dict[str, list[float]] = {}
PERSISTENCE_WINDOW = 5       # consecutive readings required
BLOCKAGE_THRESHOLD = 40.0    # minimum blockage_pct to start tracking


def check_persistence(drain_id: str, blockage_pct: float) -> bool:
    """
    Feed a blockage reading into the persistence filter.

    Returns True if the blockage has persisted for PERSISTENCE_WINDOW
    consecutive readings above BLOCKAGE_THRESHOLD.
    """
    buf = _persistence_buffer.setdefault(drain_id, [])

    if blockage_pct >= BLOCKAGE_THRESHOLD:
        buf.append(blockage_pct)
        if len(buf) > PERSISTENCE_WINDOW:
            buf.pop(0)
        return len(buf) >= PERSISTENCE_WINDOW
    else:
        buf.clear()
        return False


def reset_persistence(drain_id: str | None = None):
    """Clear persistence buffer for a drain (or all drains)."""
    if drain_id:
        _persistence_buffer.pop(drain_id, None)
    else:
        _persistence_buffer.clear()
