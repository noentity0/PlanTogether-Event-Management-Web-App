from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import client, database
from app.routes.auth import router as auth_router
from app.routes.events import router as events_router


settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    await database.users.create_index("email", unique=True)
    await database.events.create_index("starts_at")
    await database.events.create_index("created_by")
    yield
    client.close()


app = FastAPI(
    title="PlanTogether API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(events_router)


@app.get("/")
async def root() -> dict:
    return {"message": "PlanTogether backend is running"}
