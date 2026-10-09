"""Unit tests for the scoring engine — covers all NEOGOV scoring rules."""

import pytest

from app.services.scoring import calculate_activity_points


class TestRunningScoring:
    def test_1km_running(self):
        assert calculate_activity_points("running", distance_km=1) == 100

    def test_5_2km_running(self):
        assert calculate_activity_points("running", distance_km=5.2) == 520

    def test_zero_km(self):
        assert calculate_activity_points("running", distance_km=0) == 0


class TestWalkingScoring:
    def test_1_55km_walking(self):
        assert calculate_activity_points("walking", distance_km=1.55) == 77

    def test_1km_walking(self):
        assert calculate_activity_points("walking", distance_km=1) == 50


class TestCyclingScoring:
    def test_2km_cycling(self):
        assert calculate_activity_points("cycling", distance_km=2) == 50

    def test_10km_cycling(self):
        assert calculate_activity_points("cycling", distance_km=10) == 250


class TestSwimmingScoring:
    def test_1min_55sec(self):
        assert calculate_activity_points("swimming", duration_minutes=1, duration_seconds=55) == 15

    def test_30min(self):
        assert calculate_activity_points("swimming", duration_minutes=30) == 450

    def test_zero_minutes(self):
        assert calculate_activity_points("swimming", duration_minutes=0) == 0


class TestGymScoring:
    def test_10min_59sec(self):
        assert calculate_activity_points("gym", duration_minutes=10, duration_seconds=59) == 50

    def test_60min(self):
        assert calculate_activity_points("gym", duration_minutes=60) == 300


class TestStepsScoring:
    def test_399_steps(self):
        assert calculate_activity_points("steps", steps=399) == 3

    def test_999_steps(self):
        assert calculate_activity_points("steps", steps=999) == 9

    def test_8500_steps(self):
        assert calculate_activity_points("steps", steps=8500) == 85

    def test_zero_steps(self):
        assert calculate_activity_points("steps", steps=0) == 0

    def test_99_steps(self):
        assert calculate_activity_points("steps", steps=99) == 0


class TestInvalidActivity:
    def test_unknown_type(self):
        with pytest.raises(ValueError):
            calculate_activity_points("unknown", distance_km=1)

    def test_missing_distance(self):
        with pytest.raises(ValueError):
            calculate_activity_points("running")

    def test_missing_duration(self):
        with pytest.raises(ValueError):
            calculate_activity_points("swimming")

    def test_missing_steps(self):
        with pytest.raises(ValueError):
            calculate_activity_points("steps")
