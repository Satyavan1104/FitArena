from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.user import User
from app.services.leaderboard import get_user_rank


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_dashboard_data(db: Session, user: User) -> dict:
    user_id = user.id

    activities = db.query(Activity).filter(Activity.user_id == user_id).all()

    total_points = sum(a.points for a in activities)
    total_activities = len(activities)

    now = _utcnow_naive()
    week_ago = now - timedelta(days=7)
    weekly_points = sum(
        a.points for a in activities if a.created_at >= week_ago
    )

    rank_info = get_user_rank(db, user_id)
    current_rank = rank_info["rank"] if rank_info else None

    recent = sorted(activities, key=lambda a: a.created_at, reverse=True)[:5]

    points_over_time = _get_points_over_time(activities, days=30)

    breakdown = _get_activity_breakdown(activities)

    recent_list = []
    for a in recent:
        recent_list.append({
            "id": a.id,
            "activity_type": a.activity_type,
            "distance_km": a.distance_km,
            "duration_minutes": a.duration_minutes,
            "duration_seconds": a.duration_seconds,
            "steps": a.steps,
            "points": a.points,
            "created_at": a.created_at.isoformat(),
            "normalized_metric": _normalize(a),
        })

    return {
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "fitness_goal": user.fitness_goal,
            "created_at": user.created_at.isoformat(),
        },
        "total_points": total_points,
        "current_rank": current_rank,
        "total_activities": total_activities,
        "weekly_points": weekly_points,
        "recent_activities": recent_list,
        "points_over_time": points_over_time,
        "activity_breakdown": breakdown,
    }


def _get_points_over_time(activities: list[Activity], days: int = 30) -> list[dict]:
    if not activities:
        return []

    now = _utcnow_naive()
    start = now - timedelta(days=days)

    daily_totals: dict[str, int] = {}
    for a in activities:
        if a.created_at >= start:
            day_key = a.created_at.strftime("%Y-%m-%d")
            daily_totals[day_key] = daily_totals.get(day_key, 0) + a.points

    sorted_days = sorted(daily_totals.keys())
    cumulative = 0
    result = []
    for day in sorted_days:
        cumulative += daily_totals[day]
        result.append({"date": day, "points": cumulative})

    return result


def _get_activity_breakdown(activities: list[Activity]) -> list[dict]:
    if not activities:
        return []

    type_totals: dict[str, int] = {}
    for a in activities:
        type_totals[a.activity_type] = type_totals.get(a.activity_type, 0) + a.points

    grand_total = sum(type_totals.values())
    result = []
    for atype, pts in sorted(type_totals.items(), key=lambda x: x[1], reverse=True):
        pct = round((pts / grand_total) * 100, 1) if grand_total > 0 else 0
        result.append({
            "activity_type": atype,
            "points": pts,
            "percentage": pct,
        })
    return result


def _normalize(a: Activity) -> str:
    if a.activity_type in ("running", "walking", "cycling") and a.distance_km is not None:
        return f"{a.distance_km} km"
    if a.activity_type in ("swimming", "gym") and a.duration_minutes is not None:
        secs = a.duration_seconds or 0
        return f"{a.duration_minutes} min {secs} sec"
    if a.activity_type == "steps" and a.steps is not None:
        return f"{a.steps:,} steps"
    return ""
