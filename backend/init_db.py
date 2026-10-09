"""Initialize the SQLite database — creates tables only, no seed data."""

from app.database import init_db

if __name__ == "__main__":
    init_db()
    print("Database initialized. Tables created successfully.")
