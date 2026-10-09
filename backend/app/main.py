from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import init_db
from app.routes import auth, users, activities, leaderboard

app = FastAPI(
    title="FitArena API",
    description="Fitness gamification platform — Move. Compete. Level Up.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "FitArena API"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(activities.router)
app.include_router(leaderboard.router)
