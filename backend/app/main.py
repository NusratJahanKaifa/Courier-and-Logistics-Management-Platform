import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models

from app.routers.auth import router as auth_router
from app.routers.parcels import router as parcels_router
from app.routers.users import router as users_router


Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Courier & Logistics Management Platform",
    description="API for courier and parcel management",
    version="1.0.0",
)

def get_allowed_origins() -> list[str]:
    origins = os.getenv(
        "FRONTEND_URL",
        "https://comforting-axolotl-d296aa.netlify.app,http://localhost:5173",
    )
    return [
        origin.strip().rstrip("/")
        for origin in origins.split(",")
        if origin.strip()
    ]
print("ALLOWED CORS ORIGINS:", get_allowed_origins())
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(parcels_router)
app.include_router(users_router)


@app.get("/")
def home():
    return {
        "message": "Courier & Logistics Management API is running"
    }

