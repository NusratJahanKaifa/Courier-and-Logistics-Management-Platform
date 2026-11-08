import os
import secrets

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.database import Base, engine, SessionLocal
from app import models
from app.auth import hash_password
from app.routers.auth import router as auth_router
from app.routers.parcels import router as parcels_router
from app.routers.users import router as users_router

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Courier & Logistics Management Platform",
    description="API for courier and parcel management",
    version="1.0.0",
)
class AdminSetupRequest(BaseModel):
    name: str
    email: str
    password: str


@app.post("/temporary-admin-setup")
def temporary_admin_setup(
    data: AdminSetupRequest,
    x_admin_setup_secret: str = Header(default=""),
):
    expected_secret = os.getenv("ADMIN_SETUP_SECRET")

    if not expected_secret or not secrets.compare_digest(
        x_admin_setup_secret,
        expected_secret,
    ):
        raise HTTPException(
            status_code=404,
            detail="Not found",
        )

    if len(data.name.strip()) < 2 or len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Invalid name or password",
        )

    db = SessionLocal()

    try:
        email = data.email.strip().lower()

        existing_user = db.query(models.User).filter(
            models.User.email == email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email already exists. No changes made.",
            )

        admin = models.User(
            name=data.name.strip(),
            email=email,
            hashed_password=hash_password(data.password),
            role="admin",
        )

        db.add(admin)
        db.commit()

        return {"message": "Admin account created successfully"}

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
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
