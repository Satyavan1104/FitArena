from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, field_validator, model_validator


ActivityType = Literal["running", "walking", "cycling", "swimming", "gym", "steps"]

DISTANCE_ACTIVITIES = {"running", "walking", "cycling"}
DURATION_ACTIVITIES = {"swimming", "gym"}
STEPS_ACTIVITIES = {"steps"}


class ActivityCreate(BaseModel):
    activity_type: ActivityType
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None
    duration_seconds: Optional[int] = None
    steps: Optional[int] = None

    @field_validator("distance_km")
    @classmethod
    def validate_distance(cls, v):
        if v is not None and v < 0:
            raise ValueError("Distance cannot be negative")
        return v

    @field_validator("duration_minutes")
    @classmethod
    def validate_minutes(cls, v):
        if v is not None and v < 0:
            raise ValueError("Duration minutes cannot be negative")
        return v

    @field_validator("duration_seconds")
    @classmethod
    def validate_seconds(cls, v):
        if v is not None and (v < 0 or v > 59):
            raise ValueError("Seconds must be between 0 and 59")
        return v

    @field_validator("steps")
    @classmethod
    def validate_steps(cls, v):
        if v is not None and v < 0:
            raise ValueError("Steps cannot be negative")
        return v

    @model_validator(mode="after")
    def validate_metric_match(self):
        at = self.activity_type
        if at in DISTANCE_ACTIVITIES:
            if self.distance_km is None:
                raise ValueError(f"{at} requires distance_km")
            if self.duration_minutes or self.duration_seconds or self.steps:
                raise ValueError(f"{at} only accepts distance_km")
        elif at in DURATION_ACTIVITIES:
            if self.duration_minutes is None:
                raise ValueError(f"{at} requires duration_minutes")
            if self.distance_km is not None or self.steps is not None:
                raise ValueError(f"{at} only accepts duration_minutes and duration_seconds")
        elif at in STEPS_ACTIVITIES:
            if self.steps is None:
                raise ValueError("steps requires steps value")
            if self.distance_km is not None or self.duration_minutes or self.duration_seconds:
                raise ValueError("steps only accepts steps value")
        return self


class BulkActivityCreate(BaseModel):
    activities: list[ActivityCreate]


class ActivityResponse(BaseModel):
    id: int
    activity_type: str
    distance_km: Optional[float] = None
    duration_minutes: Optional[int] = None
    duration_seconds: Optional[int] = None
    steps: Optional[int] = None
    points: int
    created_at: datetime
    normalized_metric: str = ""

    model_config = {"from_attributes": True}


class BulkActivityResponse(BaseModel):
    message: str
    activities_added: int
    total_points_earned: int
    activities: list[dict]


class ActivityHistoryResponse(BaseModel):
    activities: list[ActivityResponse]
    total: int
    page: int
    page_size: int
