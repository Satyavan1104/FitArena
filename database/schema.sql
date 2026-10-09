-- FitArena Database Schema
-- SQLite reference schema — tables are auto-created by SQLAlchemy on startup.
-- This file documents the schema for reference and manual inspection.

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fitness_goal VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_first_last_name ON users(first_name, last_name);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    distance_km REAL,
    duration_minutes INTEGER,
    duration_seconds INTEGER,
    steps INTEGER,
    points INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS ix_activities_user_id_created_at ON activities(user_id, created_at);
CREATE INDEX IF NOT EXISTS ix_activities_user_id_type ON activities(user_id, activity_type);

-- Leaderboard snapshots table (for rank trend tracking)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    snapshot_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_snapshots_user_date ON leaderboard_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS ix_snapshots_user_id ON leaderboard_snapshots(user_id);
