from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Index

from app.database import Base


class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = (
        Index("ix_activities_user_id_created_at", "user_id", "created_at"),
        Index("ix_activities_user_id_type", "user_id", "activity_type"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(50), nullable=False)
    distance_km = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    steps = Column(Integer, nullable=True)
    points = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
