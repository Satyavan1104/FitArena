"""Central scoring engine for FitArena.

All point calculations are performed here — never in the frontend.
Flooring rules are implemented as specified in the NEOGOV assignment.
"""

import math

from app.schemas.activity import DISTANCE_ACTIVITIES, DURATION_ACTIVITIES, STEPS_ACTIVITIES

RATE_RUNNING = 100  # points per km
RATE_WALKING = 50   # points per km
RATE_CYCLING = 25   # points per km
RATE_SWIMMING = 15  # points per minute
RATE_GYM = 5        # points per minute
RATE_STEPS = 1      # point per 100 steps

DISTANCE_RATES = {
    "running": RATE_RUNNING,
    "walking": RATE_WALKING,
    "cycling": RATE_CYCLING,
}

DURATION_RATES = {
    "swimming": RATE_SWIMMING,
    "gym": RATE_GYM,
}


def calculate_activity_points(
    activity_type: str,
    distance_km: float | None = None,
    duration_minutes: int | None = None,
    duration_seconds: int | None = None,
    steps: int | None = None,
) -> int:
    """Calculate points for a single activity using the official scoring rules."""

    if activity_type in DISTANCE_ACTIVITIES:
        if distance_km is None:
            raise ValueError(f"{activity_type} requires distance_km")
        rate = DISTANCE_RATES[activity_type]
        return math.floor(distance_km * rate)

    if activity_type in DURATION_ACTIVITIES:
        if duration_minutes is None:
            raise ValueError(f"{activity_type} requires duration_minutes")
        complete_minutes = int(duration_minutes)
        rate = DURATION_RATES[activity_type]
        return complete_minutes * rate

    if activity_type in STEPS_ACTIVITIES:
        if steps is None:
            raise ValueError("steps requires steps value")
        complete_blocks = int(steps) // 100
        return complete_blocks * RATE_STEPS

    raise ValueError(f"Unknown activity type: {activity_type}")


def normalize_metric(
    activity_type: str,
    distance_km: float | None = None,
    duration_minutes: int | None = None,
    duration_seconds: int | None = None,
    steps: int | None = None,
) -> str:
    """Return a human-readable metric string for display."""

    if activity_type in DISTANCE_ACTIVITIES and distance_km is not None:
        return f"{distance_km} km"
    if activity_type in DURATION_ACTIVITIES and duration_minutes is not None:
        secs = duration_seconds or 0
        return f"{duration_minutes} min {secs} sec"
    if activity_type in STEPS_ACTIVITIES and steps is not None:
        return f"{steps:,} steps"
    return ""
