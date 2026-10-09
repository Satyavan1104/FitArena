from datetime import datetime, timezone

from sqlalchemy import Column, Integer, DateTime, Index

from app.database import Base


class LeaderboardSnapshot(Base):
    """Stores a daily snapshot of each user's rank for trend calculation."""

    __tablename__ = "leaderboard_snapshots"
    __table_args__ = (
        Index("ix_snapshots_user_date", "user_id", "snapshot_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    rank = Column(Integer, nullable=False)
    total_points = Column(Integer, nullable=False)
    snapshot_date = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
