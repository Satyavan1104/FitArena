from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.activity import Activity
from app.schemas.activity import (
    ActivityCreate,
    ActivityResponse,
    BulkActivityCreate,
    BulkActivityResponse,
)
from app.services.auth import get_current_user
from app.services.scoring import calculate_activity_points, normalize_metric

router = APIRouter(prefix="/api/activities", tags=["activities"])


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    points = calculate_activity_points(
        payload.activity_type,
        distance_km=payload.distance_km,
        duration_minutes=payload.duration_minutes,
        duration_seconds=payload.duration_seconds,
        steps=payload.steps,
    )

    activity = Activity(
        user_id=current_user.id,
        activity_type=payload.activity_type,
        distance_km=payload.distance_km,
        duration_minutes=payload.duration_minutes,
        duration_seconds=payload.duration_seconds,
        steps=payload.steps,
        points=points,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return ActivityResponse(
        id=activity.id,
        activity_type=activity.activity_type,
        distance_km=activity.distance_km,
        duration_minutes=activity.duration_minutes,
        duration_seconds=activity.duration_seconds,
        steps=activity.steps,
        points=activity.points,
        created_at=activity.created_at,
        normalized_metric=normalize_metric(
            activity.activity_type,
            distance_km=activity.distance_km,
            duration_minutes=activity.duration_minutes,
            duration_seconds=activity.duration_seconds,
            steps=activity.steps,
        ),
    )


@router.post("/bulk", response_model=BulkActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activities_bulk(
    payload: BulkActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.activities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one activity is required",
        )

    computed = []
    for item in payload.activities:
        points = calculate_activity_points(
            item.activity_type,
            distance_km=item.distance_km,
            duration_minutes=item.duration_minutes,
            duration_seconds=item.duration_seconds,
            steps=item.steps,
        )
        computed.append((item, points))

    try:
        activities = []
        for item, points in computed:
            activity = Activity(
                user_id=current_user.id,
                activity_type=item.activity_type,
                distance_km=item.distance_km,
                duration_minutes=item.duration_minutes,
                duration_seconds=item.duration_seconds,
                steps=item.steps,
                points=points,
            )
            db.add(activity)
            activities.append(activity)

        db.commit()

        total_points = sum(a.points for a in activities)
        activity_summaries = [
            {"activity_type": a.activity_type, "points": a.points}
            for a in activities
        ]

        return BulkActivityResponse(
            message="Activities added successfully",
            activities_added=len(activities),
            total_points_earned=total_points,
            activities=activity_summaries,
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save activities",
        )
