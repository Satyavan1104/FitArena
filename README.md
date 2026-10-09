# FitArena — Move. Compete. Level Up.

A modern fitness gamification platform where users record activities, earn normalized points, track trends, and compete on a global leaderboard.

---

## Project Overview

FitArena is a full-stack web application that allows users to:

- Register and authenticate securely
- Record six types of fitness activities (running, walking, cycling, swimming, gym, daily steps)
- Automatically convert activities into normalized points via a centralized backend scoring engine
- View a personal dashboard with real-time statistics, trend charts, and activity breakdowns
- Compete on a global leaderboard with podium display and rank trends
- Log single or multiple activities in one submission with live point previews
- Browse searchable, filterable activity history

---

## Features

### Authentication
- JWT-based authentication with bcrypt password hashing
- Register with first name, last name, email, password, and optional fitness goal
- Login with email/password
- Protected routes — unauthenticated users redirected to login
- Duplicate prevention for both email and first+last name combination

### Dashboard
- Personalized greeting based on time of day
- Four animated stat cards: Total Points, Current Rank, Activities, This Week
- Points-over-time area chart with 7-day, 30-day, and all-time filters
- Activity breakdown donut chart showing percentage distribution by sport
- Recent activities list with activity-specific icons and point indicators

### Add Activity
- **Single Activity Mode**: Select one activity, enter metric, see live point preview
- **Multiple Activities Mode**: Select any combination of activities, enter metrics for each, see live per-activity and total point summary
- All six activity types supported with dynamic input fields
- Frontend preview is for UX only — backend recalculates all points
- Success screen showing points earned with "View Dashboard" and "Add More" options

### Leaderboard
- Top 3 podium with large avatars and rank numbers
- Full ranking table for users ranked 4+ with trend indicators (up/down/unchanged)
- Dynamically calculated from activity data using SQL aggregation
- Empty states when no users or no activities exist
- Tied rankings handled consistently (same points = same rank)

### Activity History
- Searchable, filterable by activity type
- Paginated results
- Empty state, loading skeleton, and error state

### Profile
- Display user info, fitness goal, member since date
- Total points, current rank, total activities
- Logout option
- Delete account option for removing personal data and activity history

---

## Tech Stack

### Frontend
- **React 18** — UI library
- **Vite 6** — Build tool and dev server
- **React Router 6** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Recharts 2** — Charts and visualizations
- **Axios** — HTTP client
- **Lucide React** — Icon library

### Backend
- **Python 3.12**
- **FastAPI** — Web framework
- **Pydantic 2** — Data validation
- **SQLAlchemy 2** — ORM
- **SQLite** — Database
- **Uvicorn** — ASGI server
- **passlib + bcrypt** — Password hashing
- **PyJWT** — JWT token generation

### Testing
- **pytest** — Backend unit and integration tests

---

## Architecture

<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/901b5680-fdbe-4a8a-9b60-5b44aefc6bed" />

<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/cb433747-5136-4093-8869-eeaa79acd89a" />


<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/8237f9cd-68c8-41c5-99ca-30a1192d767b" />

<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/89c352a9-ad34-4434-85ab-2c4a15bb751d" />

<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/0a559ff9-3692-4bb9-8a98-71272e44565c" />

<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/11ca8051-f139-4d47-a5da-cc82fb8447b0" />

---

**Data flow:**

```
React Frontend → Axios (HTTP) → FastAPI Routes → Services → SQLAlchemy ORM → SQLite
```

Route handlers are thin — business logic lives in service modules (scoring, auth, leaderboard, dashboard). This separation keeps the codebase maintainable and testable.

---

## Database Schema

### Users

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| fitness_goal | VARCHAR(100) | NULLABLE |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Unique constraints:** `email` (unique index), `(first_name, last_name)` (composite unique index)

### Activities

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE |
| activity_type | VARCHAR(50) | NOT NULL |
| distance_km | REAL | NULLABLE |
| duration_minutes | INTEGER | NULLABLE |
| duration_seconds | INTEGER | NULLABLE |
| steps | INTEGER | NULLABLE |
| points | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Indexes:** `(user_id, created_at)`, `(user_id, activity_type)`, `user_id`

### Leaderboard Snapshots

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | NOT NULL |
| rank | INTEGER | NOT NULL |
| total_points | INTEGER | NOT NULL |
| snapshot_date | DATETIME | NOT NULL |

**Indexes:** `(user_id, snapshot_date)`, `user_id`

Leaderboard totals are never stored as a primary source — they are always calculated dynamically via `SUM(points) GROUP BY user_id`.

---

## API Endpoints

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current authenticated user |

### Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get authenticated user's profile with stats |
| GET | `/api/users/me/activities` | Get authenticated user's activity history (paginated) |
| GET | `/api/users/me/dashboard` | Get aggregated dashboard data |

### Activities

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/activities` | Log a single activity |
| POST | `/api/activities/bulk` | Log multiple activities atomically |

### Leaderboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leaderboard` | Get global leaderboard |
| GET | `/api/leaderboard/me` | Get current user's rank position |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

### Sample API Requests

**Register:**
```bash
POST /api/auth/register
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "fitness_goal": "Improve Fitness"
}
```

**Login:**
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Log Activity:**
```bash
POST /api/activities
Authorization: Bearer <token>
{
  "activity_type": "running",
  "distance_km": 5.2
}
```

**Bulk Activities:**
```bash
POST /api/activities/bulk
Authorization: Bearer <token>
{
  "activities": [
    {"activity_type": "running", "distance_km": 5.2},
    {"activity_type": "walking", "distance_km": 3.5},
    {"activity_type": "gym", "duration_minutes": 45, "duration_seconds": 30},
    {"activity_type": "steps", "steps": 8500}
  ]
}
```

**Get Dashboard:**
```bash
GET /api/users/me/dashboard
Authorization: Bearer <token>
```

**Get Leaderboard:**
```bash
GET /api/leaderboard
```

---

## Scoring Logic

All scoring is handled centrally in `backend/app/services/scoring.py`. The frontend never performs authoritative calculations.

| Activity | Metric | Rate | Flooring Rule |
|----------|--------|------|---------------|
| Running | Distance (km) | 100 pts/km | `floor(km × 100)` |
| Walking | Distance (km) | 50 pts/km | `floor(km × 50)` |
| Cycling | Distance (km) | 25 pts/km | `floor(km × 25)` |
| Swimming | Duration (min:sec) | 15 pts/min | Only completed minutes count |
| Gym | Duration (min:sec) | 5 pts/min | Only completed minutes count |
| Daily Steps | Step count | 1 pt/100 steps | `floor(steps / 100) × 1` |

**Examples:**
- 1.55 km walking → 1.55 × 50 = 77.5 → **77 points**
- 1 min 55 sec swimming → 1 minute → **15 points**
- 10 min 59 sec gym → 10 minutes → **50 points**
- 399 steps → 300 counted → **3 points**
- 999 steps → 900 counted → **9 points**

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Docker Desktop (optional, for the containerized setup)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## Environment Variables
```

## Running the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173`.

Vite is configured to proxy `/api` requests to `http://127.0.0.1:8000`, so you can also use the default `VITE_API_URL=/api` for local development.

---

## Running the Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`.

Tables are created automatically on startup. To manually initialize the database:

```bash
python init_db.py
```

This creates tables only — no demo data is inserted.

---

## Running with Docker Compose

```bash
docker compose up --build
```

This starts both services together using the project’s configured Docker setup:

- `backend` on `http://localhost:8000`
- `frontend` on `http://localhost:5173`

To stop the stack:

```bash
docker compose down
```

---

## Running Tests

```bash
cd backend
source venv/bin/activate
pytest
```

Tests cover:
- Scoring engine (all activity types, flooring rules, edge cases)
- Authentication (register, login, duplicate prevention)
- Activity creation (single, bulk, validation errors)
- Leaderboard (empty state, populated state)
- Dashboard data aggregation
- Activity history

---

## Screenshots

*Screenshots will be added after running the application locally.*

---

## Edge Cases

- **Duplicate registration**: Returns HTTP 409 for duplicate email or duplicate first+last name
- **Invalid activity metrics**: Pydantic validates metric-type matching (e.g., distance for running, duration for swimming)
- **Negative values**: Rejected at the Pydantic schema level
- **Invalid seconds**: Must be 0–59, rejected otherwise
- **Missing metric**: Returns 422 with clear error message
- **Flooring behavior**: Only completed minutes and complete 100-step blocks count
- **Empty leaderboard**: Shows appropriate empty state with CTA
- **Tied rankings**: Users with equal points share the same rank number
- **Non-existent user**: Authentication prevents unauthorized access
- **Concurrent requests**: SQLite handles writes sequentially; bulk operations are transactional

-
