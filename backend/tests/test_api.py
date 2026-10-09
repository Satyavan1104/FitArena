"""API integration tests for major endpoints."""

import pytest


class TestAuth:
    def test_register_success(self, client):
        response = client.post(
            "/api/auth/register",
            json={
                "first_name": "Jane",
                "last_name": "Doe",
                "email": "jane@example.com",
                "password": "password123",
                "confirm_password": "password123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "jane@example.com"

    def test_register_duplicate_email(self, client):
        payload = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com",
            "password": "password123",
            "confirm_password": "password123",
        }
        client.post("/api/auth/register", json=payload)
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 409

    def test_register_duplicate_name(self, client):
        client.post(
            "/api/auth/register",
            json={
                "first_name": "Jane",
                "last_name": "Doe",
                "email": "jane1@example.com",
                "password": "password123",
                "confirm_password": "password123",
            },
        )
        response = client.post(
            "/api/auth/register",
            json={
                "first_name": "Jane",
                "last_name": "Doe",
                "email": "jane2@example.com",
                "password": "password123",
                "confirm_password": "password123",
            },
        )
        assert response.status_code == 409

    def test_register_duplicate_email_is_case_insensitive(self, client):
        payload = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com",
            "password": "password123",
            "confirm_password": "password123",
        }
        client.post("/api/auth/register", json=payload)

        response = client.post(
            "/api/auth/register",
            json={
                **payload,
                "email": "JANE@example.com",
            },
        )

        assert response.status_code == 409

    def test_login_success(self, client):
        client.post(
            "/api/auth/register",
            json={
                "first_name": "Jane",
                "last_name": "Doe",
                "email": "jane@example.com",
                "password": "password123",
                "confirm_password": "password123",
            },
        )
        response = client.post(
            "/api/auth/login",
            json={"email": "jane@example.com", "password": "password123"},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_wrong_password(self, client):
        client.post(
            "/api/auth/register",
            json={
                "first_name": "Jane",
                "last_name": "Doe",
                "email": "jane@example.com",
                "password": "password123",
                "confirm_password": "password123",
            },
        )
        response = client.post(
            "/api/auth/login",
            json={"email": "jane@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_get_me(self, client, auth_headers):
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"


class TestAccountDeletion:
    def test_delete_my_account_removes_account_and_associated_data(self, client, auth_headers):
        client.post(
            "/api/activities",
            json={"activity_type": "running", "distance_km": 5},
            headers=auth_headers,
        )

        response = client.delete("/api/users/me", headers=auth_headers)

        assert response.status_code == 204
        assert client.get("/api/auth/me", headers=auth_headers).status_code == 401
        assert client.get("/api/leaderboard").json() == []

    def test_delete_account_requires_authentication(self, client):
        response = client.delete("/api/users/me")

        assert response.status_code == 401


class TestActivities:
    def test_create_activity(self, client, auth_headers):
        response = client.post(
            "/api/activities",
            json={"activity_type": "running", "distance_km": 5.2},
            headers=auth_headers,
        )
        assert response.status_code == 201
        assert response.json()["points"] == 520

    def test_invalid_activity_type(self, client, auth_headers):
        response = client.post(
            "/api/activities",
            json={"activity_type": "unknown", "distance_km": 1},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_missing_metric(self, client, auth_headers):
        response = client.post(
            "/api/activities",
            json={"activity_type": "running"},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_negative_distance(self, client, auth_headers):
        response = client.post(
            "/api/activities",
            json={"activity_type": "running", "distance_km": -5},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_invalid_seconds(self, client, auth_headers):
        response = client.post(
            "/api/activities",
            json={
                "activity_type": "swimming",
                "duration_minutes": 10,
                "duration_seconds": 75,
            },
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_wrong_metric_for_activity(self, client, auth_headers):
        response = client.post(
            "/api/activities",
            json={"activity_type": "running", "steps": 1000},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_bulk_activities(self, client, auth_headers):
        response = client.post(
            "/api/activities/bulk",
            json={
                "activities": [
                    {"activity_type": "running", "distance_km": 5.2},
                    {"activity_type": "walking", "distance_km": 3.5},
                    {"activity_type": "gym", "duration_minutes": 45, "duration_seconds": 30},
                    {"activity_type": "steps", "steps": 8500},
                ]
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["activities_added"] == 4
        assert data["total_points_earned"] == 1005

    def test_unauthenticated_activity(self, client):
        response = client.post(
            "/api/activities",
            json={"activity_type": "running", "distance_km": 5},
        )
        assert response.status_code == 401


class TestLeaderboard:
    def test_empty_leaderboard(self, client, auth_headers):
        response = client.get("/api/leaderboard")
        assert response.status_code == 200
        assert response.json() == []

    def test_leaderboard_with_data(self, client, auth_headers):
        client.post(
            "/api/activities",
            json={"activity_type": "running", "distance_km": 10},
            headers=auth_headers,
        )
        response = client.get("/api/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["total_points"] == 1000
        assert data[0]["rank"] == 1


class TestDashboard:
    def test_dashboard_data(self, client, auth_headers):
        client.post(
            "/api/activities",
            json={"activity_type": "running", "distance_km": 5},
            headers=auth_headers,
        )
        response = client.get("/api/users/me/dashboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_points"] == 500
        assert data["total_activities"] == 1
        assert data["current_rank"] == 1

    def test_dashboard_data_after_bulk_activities(self, client, auth_headers):
        client.post(
            "/api/activities/bulk",
            json={
                "activities": [
                    {"activity_type": "running", "distance_km": 5.2},
                    {"activity_type": "walking", "distance_km": 3.5},
                    {"activity_type": "gym", "duration_minutes": 45, "duration_seconds": 30},
                    {"activity_type": "steps", "steps": 8500},
                ]
            },
            headers=auth_headers,
        )

        response = client.get("/api/users/me/dashboard", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["total_activities"] == 4
        assert data["total_points"] == 1005
        assert len(data["recent_activities"]) == 4
        assert len(data["activity_breakdown"]) == 4
        assert len(data["points_over_time"]) == 1


class TestActivityHistory:
    def test_my_activities(self, client, auth_headers):
        client.post(
            "/api/activities",
            json={"activity_type": "running", "distance_km": 5},
            headers=auth_headers,
        )
        response = client.get("/api/users/me/activities", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["activities"][0]["activity_type"] == "running"


class TestHealth:
    def test_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
