from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.activity import Activity
from app.models.leaderboard_snapshot import LeaderboardSnapshot
from app.schemas.user import UserProfile
from app.services.auth import get_current_user
from app.services.leaderboard import get_user_rank

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    activities = db.query(Activity).filter(Activity.user_id == current_user.id).all()
    total_points = sum(a.points for a in activities)
    total_activities = len(activities)
    rank_info = get_user_rank(db, current_user.id)

    return UserProfile(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        fitness_goal=current_user.fitness_goal,
        created_at=current_user.created_at,
        total_points=total_points,
        current_rank=rank_info["rank"] if rank_info else None,
        total_activities=total_activities,
    )


@router.get("/me/activities")
def get_my_activities(
    activity_type: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Activity).filter(Activity.user_id == current_user.id)

    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)

    total = query.count()
    offset = (page - 1) * page_size
    activities = (
        query.order_by(Activity.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = []
    for a in activities:
        items.append({
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
        "activities": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/me/dashboard")
def get_my_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.dashboard import get_dashboard_data
    return get_dashboard_data(db, current_user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Activity).filter(Activity.user_id == current_user.id).delete()
    db.query(LeaderboardSnapshot).filter(
        LeaderboardSnapshot.user_id == current_user.id
    ).delete()
    db.delete(current_user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _normalize(a: Activity) -> str:
    if a.activity_type in ("running", "walking", "cycling") and a.distance_km is not None:
        return f"{a.distance_km} km"
    if a.activity_type in ("swimming", "gym") and a.duration_minutes is not None:
        secs = a.duration_seconds or 0
        return f"{a.duration_minutes} min {secs} sec"
    if a.activity_type == "steps" and a.steps is not None:
        return f"{a.steps:,} steps"
    return ""
