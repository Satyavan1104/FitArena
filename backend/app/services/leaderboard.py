from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.user import User
from app.models.leaderboard_snapshot import LeaderboardSnapshot


def get_leaderboard(db: Session, limit: int = 100):
    """Return leaderboard rows ordered by total points desc, with trend info."""

    totals = (
        db.query(
            Activity.user_id,
            func.sum(Activity.points).label("total_points"),
            func.count(Activity.id).label("activity_count"),
        )
        .group_by(Activity.user_id)
        .order_by(func.sum(Activity.points).desc())
        .limit(limit)
        .all()
    )

    if not totals:
        return []

    user_ids = [t.user_id for t in totals]
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    user_map = {u.id: u for u in users}

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    yesterday = now - timedelta(days=1)

    prev_ranks = {}
    for uid in user_ids:
        snap = (
            db.query(LeaderboardSnapshot)
            .filter(LeaderboardSnapshot.user_id == uid)
            .filter(LeaderboardSnapshot.snapshot_date >= yesterday)
            .order_by(LeaderboardSnapshot.snapshot_date.desc())
            .first()
        )
        if snap:
            prev_ranks[uid] = snap.rank

    results = []
    current_rank = 0
    prev_points = None
    for idx, t in enumerate(totals):
        if prev_points is not None and t.total_points == prev_points:
            pass
        else:
            current_rank = idx + 1
        prev_points = t.total_points

        user = user_map.get(t.user_id)
        if not user:
            continue

        old_rank = prev_ranks.get(t.user_id)
        if old_rank is not None and old_rank != current_rank:
            trend = old_rank - current_rank
        else:
            trend = 0

        results.append({
            "rank": current_rank,
            "user_id": t.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "fitness_goal": user.fitness_goal,
            "total_points": t.total_points,
            "activity_count": t.activity_count,
            "trend": trend,
        })

    return results


def get_user_rank(db: Session, user_id: int) -> dict | None:
    """Return the current rank and total points for a specific user."""

    totals = (
        db.query(
            Activity.user_id,
            func.sum(Activity.points).label("total_points"),
        )
        .group_by(Activity.user_id)
        .order_by(func.sum(Activity.points).desc())
        .all()
    )

    current_rank = 0
    prev_points = None
    for idx, t in enumerate(totals):
        if prev_points is not None and t.total_points == prev_points:
            pass
        else:
            current_rank = idx + 1
        prev_points = t.total_points
        if t.user_id == user_id:
            return {
                "rank": current_rank,
                "total_points": t.total_points,
            }
    return None


def take_leaderboard_snapshot(db: Session):
    """Snapshot current rankings for trend tracking. Called periodically."""

    totals = (
        db.query(
            Activity.user_id,
            func.sum(Activity.points).label("total_points"),
        )
        .group_by(Activity.user_id)
        .order_by(func.sum(Activity.points).desc())
        .all()
    )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    current_rank = 0
    prev_points = None
    for idx, t in enumerate(totals):
        if prev_points is not None and t.total_points == prev_points:
            pass
        else:
            current_rank = idx + 1
        prev_points = t.total_points

        snap = LeaderboardSnapshot(
            user_id=t.user_id,
            rank=current_rank,
            total_points=t.total_points,
            snapshot_date=now,
        )
        db.add(snap)

    db.commit()
