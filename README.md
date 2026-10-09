# FitArena — Move. Compete. Level Up.

A modern fitness gamification platform where users record activities, earn normalized points, track trends, and compete on a global leaderboard.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Recent Updates](#recent-updates)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Scoring Logic](#scoring-logic)
9. [Installation](#installation)
10. [Environment Variables](#environment-variables)
11. [Running the Frontend](#running-the-frontend)
12. [Running the Backend](#running-the-backend)
13. [Running with Docker Compose](#running-with-docker-compose)
14. [Running Tests](#running-tests)
15. [Screenshots](#screenshots)
16. [Design Decisions](#design-decisions)
17. [Edge Cases](#edge-cases)
18. [Future Improvements](#future-improvements)

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

The database starts empty — no demo accounts or seeded data. The reviewer creates a real account, logs activities, and watches the dashboard and leaderboard populate dynamically.

---

## Recent Updates

Recent improvements added to the project include:

- Docker-based local setup for the full stack using `docker-compose.yml`
- Automatic database initialization on backend startup
- Health endpoint at `/api/health` for quick service verification
- Bulk activity submission support for logging multiple workouts in a single request
- Improved personal dashboard analytics, including weekly totals, recent activity feed, and sport breakdown charts
- Account deletion flow for self-service cleanup from the profile screen
- More resilient empty-state, loading-state, and error-state UX in the frontend

This README has been refreshed to match the current application behavior and the latest developer workflow.

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

```
fitarena/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth context provider
│   │   ├── pages/             # Route-level page components
│   │   ├── services/          # Centralized API client
│   │   └── utils/             # Helper functions
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                   # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── routes/            # API route handlers
│   │   └── services/          # Business logic (scoring, auth, leaderboard, dashboard)
│   ├── tests/                 # pytest tests
│   ├── init_db.py             # Database initialization script
│   └── requirements.txt
│
├── database/
│   └── schema.sql             # SQL reference schema
│
├── docker-compose.yml
├── DESIGN.md
├── README.md
└── .gitignore
```

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

### Quick Start (recommended)

Use Docker Compose to run both the backend and frontend together:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

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

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://127.0.0.1:8000/api
```

### Backend (optional — defaults are provided in `app/config.py`)
```
DATABASE_URL=sqlite:///./fitarena.db
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

---

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

## Design Decisions

1. **JWT over sessions**: Stateless authentication simplifies the architecture and works well with a SPA frontend.

2. **Service layer separation**: Business logic (scoring, leaderboard, dashboard aggregation) lives in dedicated service modules, keeping route handlers thin.

3. **Centralized scoring**: A single `calculate_activity_points()` function ensures scoring rules are never duplicated. The frontend shows previews only for UX.

4. **SQL aggregation for leaderboard**: Rankings are computed via `SUM(points) GROUP BY user_id` rather than loading all activities into Python.

5. **Atomic bulk submission**: Bulk activity insertion validates all items first, then commits in a single transaction. If any item is invalid, the entire batch is rejected.

6. **Empty database by design**: No seed data ensures the reviewer experiences the full registration → login → activity logging flow.

7. **Tailwind CSS custom theme**: A charcoal + blue color palette with custom animations creates a modern SaaS aesthetic without looking generic.

8. **Responsive sidebar → bottom nav**: Desktop uses a fixed sidebar; mobile uses a bottom navigation bar for thumb-friendly access.

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

---

## Future Improvements

1. **Password reset flow**: Implement email-based password reset (currently shows "Coming soon")
2. **Leaderboard snapshots**: Schedule periodic snapshots for accurate rank trend tracking
3. **Activity editing**: Allow users to edit or delete logged activities
4. **Profile editing**: Allow users to update their fitness goal and avatar
5. **Social features**: Follow other users, share activities
6. **Achievements/badges**: Gamification milestones (1000 points, 50 activities, etc.)
7. **Data export**: Export activity history as CSV
8. **Mobile app**: React Native companion app
9. **Dark mode**: System-wide dark theme toggle
10. **Internationalization**: Multi-language support

---

## File-by-File Purpose Reference

This project is intentionally organized into a frontend app, a backend API, a SQLite database, and a few operational/config files. Generated dependency folders like `frontend/node_modules` and `backend/venv` are excluded from this summary because they are installed toolchain artifacts, not app source files.

### Root project files

- `README.md` — Main project documentation and setup guide.
- `DESIGN.md` — Architecture overview, database model, and API design notes.
- `Cmd.txt` — Quick local command list for running backend, frontend, and SQLite inspection.
- `docker-compose.yml` — Starts the backend and frontend together in Docker.
- `package-lock.json` — Lockfile for the root workspace dependencies.
- `database/schema.sql` — SQL reference schema for the database tables and indexes.
- `database/fitarena.db` — Local SQLite database file used by the application.
- `backend/Dockerfile` — Container definition for the FastAPI backend service.
- `backend/requirements.txt` — Python dependencies for the backend.
- `backend/init_db.py` — Creates database tables without inserting demo data.
- `frontend/Dockerfile` — Container definition for the Vite React frontend service.
- `frontend/package.json` — Frontend scripts, dependencies, and build configuration.
- `frontend/index.html` — HTML entry point for the Vite app.
- `frontend/vite.config.js` — Vite configuration and dev-server setup.
- `frontend/tailwind.config.js` — Tailwind theme, colors, spacing, and custom style setup.
- `frontend/public/favicon.svg` — Small browser icon for the app.

### Backend source tree (`backend/app`)

- `backend/app/main.py` — FastAPI application entry point; registers middleware, startup hook, health route, and routers.
- `backend/app/config.py` — Environment configuration for the database URL, JWT settings, and CORS origins.
- `backend/app/database.py` — SQLAlchemy engine/session setup and database initialization logic.

#### Models

- `backend/app/models/user.py` — SQLAlchemy model for the `users` table.
- `backend/app/models/activity.py` — SQLAlchemy model for user activities and stored points.
- `backend/app/models/leaderboard_snapshot.py` — SQLAlchemy model for leaderboard snapshots used for rank-trend calculations.
- `backend/app/models/__init__.py` — Packages the model modules for import discovery.

#### Schemas

- `backend/app/schemas/user.py` — Validation models for user registration, login, and auth responses.
- `backend/app/schemas/activity.py` — Validation models for single and bulk activity submissions.
- `backend/app/schemas/__init__.py` — Schema package initializer.

#### Routes

- `backend/app/routes/auth.py` — Register/login/me endpoints; handles authentication flow and JWT issuance.
- `backend/app/routes/users.py` — Returns profile and dashboard-related user data.
- `backend/app/routes/activities.py` — Creates single or bulk activities and validates each workout.
- `backend/app/routes/leaderboard.py` — Returns leaderboard data and current-user rank.
- `backend/app/routes/__init__.py` — Router package initializer.

#### Services

- `backend/app/services/auth.py` — Core authentication logic, password hashing, token creation, and user lookup.
- `backend/app/services/dashboard.py` — Aggregates dashboard statistics: total points, counts, weekly totals, recent activity, and chart data.
- `backend/app/services/leaderboard.py` — Calculates ranking data and trend comparisons for the leaderboard.
- `backend/app/services/scoring.py` — Central scoring engine for all supported fitness activities and floor rules.
- `backend/app/services/__init__.py` — Service package initializer.

#### Tests

- `backend/tests/conftest.py` — Shared pytest fixtures and test setup.
- `backend/tests/test_api.py` — API-level tests for auth, user routes, activities, and leaderboard.
- `backend/tests/test_scoring.py` — Unit tests for scoring math, floor logic, and edge cases.
- `backend/tests/__init__.py` — Test package initializer.

### Frontend source tree (`frontend/src`)

- `frontend/src/main.jsx` — Bootstraps the React app, wraps it in `BrowserRouter`, and attaches the auth provider.
- `frontend/src/App.jsx` — Main route configuration, protected-route guard, and app-wide route map.
- `frontend/src/index.css` — Global CSS, custom theme variables, base styles, and Tailwind directives.

#### Components

- `frontend/src/components/Layout.jsx` — Shared shell for authenticated pages, including sidebar/top navigation layout.
- `frontend/src/components/Sidebar.jsx` — Sidebar navigation links for dashboard, leaderboard, history, and profile.
- `frontend/src/components/TopBar.jsx` — Top bar with page title and user status controls.
- `frontend/src/components/ProtectedRoute.jsx` — Guards pages that require login and redirects unauthenticated users.
- `frontend/src/components/StatCard.jsx` — Reusable KPI card showing totals and metrics.
- `frontend/src/components/ActivityChart.jsx` — Reusable chart for points-over-time visualization.
- `frontend/src/components/SportBreakdown.jsx` — Donut chart for per-activity points distribution.
- `frontend/src/components/LeaderboardTable.jsx` — Table view for leaderboard ranking and rank trends.
- `frontend/src/components/ActivityIcon.jsx` — Icon mapping for each activity type.
- `frontend/src/components/EmptyState.jsx` — Empty-state UI for no-data screens.
- `frontend/src/components/ErrorState.jsx` — Error display with retry action support.
- `frontend/src/components/LoadingSkeleton.jsx` — Skeleton loaders for dashboard and activity-history states.
- `frontend/src/components/ErrorBoundary.jsx` — Global React error boundary for safe failure handling.
- `frontend/src/components/Toast.jsx` — Generic toast notification component (if used by the app flow).

#### Context and utilities

- `frontend/src/context/AuthContext.jsx` — Global authentication context for login, register, logout, and session restore.
- `frontend/src/services/api.js` — Centralized Axios instance with JWT auth headers and 401 redirect handling.
- `frontend/src/utils/helpers.js` — Shared helper functions for daily greeting, date formatting, and points formatting.

#### Pages

- `frontend/src/pages/Login.jsx` — Sign-in screen with validation and redirect handling.
- `frontend/src/pages/Register.jsx` — Account creation screen for new users.
- `frontend/src/pages/Dashboard.jsx` — Personal overview with stat cards, recent activities, chart panels, and quick actions.
- `frontend/src/pages/AddActivity.jsx` — Activity logging form for single and bulk tracking.
- `frontend/src/pages/ActivityHistory.jsx` — Searchable, filterable activity log with pagination.
- `frontend/src/pages/Leaderboard.jsx` — Global ranking page with podium and leaderboard table.
- `frontend/src/pages/Profile.jsx` — User profile page with account details and options like logout or delete account.

### Additional notes

- The project intentionally separates the UI from business logic: the frontend displays data, while the backend computes scoring and ranking.
- The database is intentionally empty at startup so that a reviewer can create a real account, log activities, and watch the dashboard populate organically.
- `frontend/node_modules` and `backend/venv` are runtime-installed dependencies and are not part of the custom application source.

---

This file purpose reference is designed so a new developer can quickly understand what each part of the FitArena project does without needing to read the entire codebase first.
