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
**1.System Architecture Diagram**
<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/901b5680-fdbe-4a8a-9b60-5b44aefc6bed" />
Illustrates the overall FitArena architecture, connecting the React + Vite frontend, FastAPI backend, and SQLite database.
Highlights authentication, API routing, activity scoring, dashboard analytics, and leaderboard services.
Shows how data flows between users, backend services, and the database.

**2.Database Schema & ER Diagram**
<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/cb433747-5136-4093-8869-eeaa79acd89a" />
Defines the SQLite database structure, including Users, Activities, and Leaderboard Snapshots tables.
Shows primary keys, foreign keys, data types, constraints, and indexing for data integrity.
Illustrates the relationships between users, their workout activities, and leaderboard records.

**3.Frontend Component Architecture Diagram**
<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/8237f9cd-68c8-41c5-99ca-30a1192d767b" />
Shows the React frontend structure, from the root App.jsx component to layouts, navigation, and individual pages.
Explains the roles of authentication context, protected routes, centralized API clients, and reusable UI components.
Visualizes how dashboard charts, activity forms, history, and leaderboard views interact with the backend API.

**4.Activity Scoring & Normalization Flowchart**
<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/89c352a9-ad34-4434-85ab-2c4a15bb751d" />
Explains how FitArena validates workout submissions and calculates points based on activity type.
Covers distance-based, duration-based, and step-based scoring, including rounding and input validation rules.
Shows how calculated points are saved to SQLite and used to update dashboard statistics and leaderboard rankings.

**5.API Request & Response Flow**
<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/0a559ff9-3692-4bb9-8a98-71272e44565c" />
Visualizes the request and response flow between the React client, FastAPI backend, business services, and SQLite database.
Demonstrates registration, workout logging, validation, authentication, database operations, and dashboard data retrieval.
Highlights HTTP response codes for successful operations and validation errors.

**6.Leaderboard Calculation & Trend Flow**
<img width="1376" height="768" alt="image" src="https://github.com/user-attachments/assets/11ca8051-f139-4d47-a5da-cc82fb8447b0" />
Illustrates how FitArena aggregates activity points and calculates total scores for each user.
Explains how users are ranked by points and how current rankings are compared with previous snapshots to track changes.
Shows how leaderboard data and rank trends are delivered to the frontend for visualization.

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

**Screenshots**

**1.Resister page**
<img width="1600" height="791" alt="image" src="https://github.com/user-attachments/assets/1c001a6e-dfed-48b4-94b1-978e334c73b6" />

**2.Login page**
<img width="1600" height="782" alt="image" src="https://github.com/user-attachments/assets/dcb7b0e8-86e0-4847-9c7f-51c0ed41e21a" />

**3.Profile **
<img width="1600" height="780" alt="image" src="https://github.com/user-attachments/assets/9e4a79eb-44d2-4703-b0ea-b22c570aa475" />

**4.Dashboard**
<img width="1600" height="789" alt="image" src="https://github.com/user-attachments/assets/9bc849ec-53b4-42e4-b140-f90a8325724f" />

**5.Global Leaderboard**
<img width="1600" height="790" alt="image" src="https://github.com/user-attachments/assets/22873782-5d28-4f86-8386-2844c6ba46e7" />

**6.Activity** 
<img width="1600" height="782" alt="image" src="https://github.com/user-attachments/assets/672df5ca-41b5-4ca6-8e2f-fbda86dc0f44" />

**7.Activity History **
<img width="1600" height="782" alt="image" src="https://github.com/user-attachments/assets/acea03d5-d0fd-4732-a74a-89552af5be48" />

**8.User login Database** 
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/3e5ad7b5-97d6-4899-8653-c2d03b94c6b1" />

**9.Activity Database**
<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/44f68ee6-dba1-4dd4-8ba6-740c852082b8" />

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
