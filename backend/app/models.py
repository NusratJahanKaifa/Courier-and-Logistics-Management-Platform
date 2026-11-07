
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Float,
    Boolean,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(
        String(50), unique=True, index=True, nullable=False
    )
    sender_name = Column(String(100), nullable=False)
    receiver_name = Column(String(100), nullable=False)
    receiver_phone = Column(String(20), nullable=False)
    pickup_address = Column(String(255), nullable=False)
    delivery_address = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    weight = Column(Float, nullable=False)
    status = Column(String(30), default="Pending", nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    user = relationship("User")

    # Parcel status history
    status_history = relationship(
        "ParcelStatusHistory",
        back_populates="parcel",
        cascade="all, delete-orphan",
        order_by="ParcelStatusHistory.created_at",
    )


class ParcelStatusHistory(Base):
    __tablename__ = "parcel_status_history"

    id = Column(Integer, primary_key=True, index=True)

    parcel_id = Column(
        Integer,
        ForeignKey("parcels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status = Column(String(30), nullable=False)

    location = Column(String(255), nullable=True)

    description = Column(String(500), nullable=True)

    rider_name = Column(String(100), nullable=True)

    rider_phone = Column(String(20), nullable=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    parcel = relationship(
        "Parcel",
        back_populates="status_history",
    )


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_jti = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User")
