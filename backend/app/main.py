import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models

from app.routers.auth import router as auth_router
from app.routers.parcels import router as parcels_router
from app.routers.users import router as users_router

import secrets
from fastapi import Header, HTTPException
from pydantic import BaseModel, EmailStr, Field
from app.database import SessionLocal
from app.auth import hash_password
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

class AdminRecoveryRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=12, max_length=128)


@app.post("/temporary-admin-password-reset")
def temporary_admin_password_reset(
    request: AdminRecoveryRequest,
    x_admin_recovery_secret: str = Header(default=""),
):
    expected_secret = os.getenv("ADMIN_RECOVERY_SECRET")

    if not expected_secret or not secrets.compare_digest(
        x_admin_recovery_secret, expected_secret
    ):
        raise HTTPException(status_code=404, detail="Not found")

    db = SessionLocal()

    try:
        email = str(request.email).strip().lower()

        user = db.query(models.User).filter(
            models.User.email == email,
            models.User.role == "admin",
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Admin account not found",
            )

        user.hashed_password = hash_password(request.new_password)
        db.commit()

        return {"message": "Admin password updated successfully"}

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
