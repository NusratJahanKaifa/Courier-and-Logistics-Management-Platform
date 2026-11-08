
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from app.database import get_db
from app.models import User, PasswordResetToken
from app.schemas import UserCreate, UserResponse, TokenResponse
from app.auth import (
    hash_password,
    verify_password,
    verify_access_token,
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.email_utils import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role="user",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not user or not verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_access_token(token)

    if not payload or not payload.get("sub"):
        raise credentials_exception

    try:
        user_id = int(payload["sub"])
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_exception

    return user


def get_admin_user(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


@router.get("/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    # Use the same response whether or not the account exists.
    generic_message = {
        "message": (
            "If the account exists, password reset instructions "
            "will be provided."
        )
    }

    if not user:
        return generic_message

    # Invalidate earlier unused reset tokens.
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.is_used.is_(False),
    ).update(
        {"is_used": True},
        synchronize_session=False,
    )

    reset_token = create_password_reset_token(user.id)
    payload = verify_password_reset_token(reset_token)

    if not payload:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process password reset request.",
        )

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_jti=payload["jti"],
        expires_at=datetime.fromtimestamp(
            payload["exp"], tz=timezone.utc
        ),
        is_used=False,
    )

    try:
        db.add(reset_record)
        db.commit()
        db.refresh(reset_record)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process password reset request.",
        )

    try:
        send_password_reset_email(
            recipient_email=user.email,
            reset_token=reset_token,
        )
    except Exception:
        # Invalidate the reset token if email delivery fails.
        try:
            reset_record.is_used = True
            db.commit()
        except Exception:
            db.rollback()

        # Do not expose email delivery details to the requester.
        return generic_message

    return generic_message


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    payload = verify_password_reset_token(request.token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    try:
        user_id = int(payload["sub"])
        token_jti = payload["jti"]
        expires_at = datetime.fromtimestamp(
            payload["exp"], tz=timezone.utc
        )
    except (ValueError, TypeError, KeyError, OverflowError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token.",
        )

    reset_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.token_jti == token_jti,
        PasswordResetToken.is_used.is_(False),
    ).first()

    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used password reset token.",
        )

    stored_expiry = reset_record.expires_at
    if stored_expiry.tzinfo is None:
        stored_expiry = stored_expiry.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)

    if stored_expiry <= now or expires_at <= now:
        reset_record.is_used = True
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired.",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        reset_record.is_used = True
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token.",
        )

    try:
        user.hashed_password = hash_password(request.new_password)
        reset_record.is_used = True

        # Invalidate every other unused reset token for this user.
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user_id,
            PasswordResetToken.id != reset_record.id,
            PasswordResetToken.is_used.is_(False),
        ).update(
            {"is_used": True},
            synchronize_session=False,
        )

        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset password. Please try again.",
        )

    return {
        "message": "Password has been reset successfully."
    }
@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(
        request.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = hash_password(
        request.new_password
    )

    db.commit()

    return {"message": "Password changed successfully"}