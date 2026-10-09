from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.leaderboard import get_leaderboard, get_user_rank

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("")
def get_global_leaderboard(db: Session = Depends(get_db)):
    return get_leaderboard(db, limit=100)


@router.get("/me")
def get_my_leaderboard_position(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rank_info = get_user_rank(db, current_user.id)
    if rank_info is None:
        return {
            "rank": None,
            "total_points": 0,
            "message": "No activities yet. Log your first activity to enter the leaderboard.",
        }
    return rank_info
