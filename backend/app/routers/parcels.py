
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Parcel, User, ParcelStatusHistory
from app.schemas import (
    ParcelCreate,
    ParcelUpdate,
    ParcelResponse,
    ParcelListResponse,
    PublicParcelTrackingResponse,
)
from app.routers.auth import get_current_user, get_admin_user


router = APIRouter(prefix="/parcels", tags=["Parcels"])


VALID_STATUSES = {
    "Pending",
    "Picked Up",
    "In Transit",
    "Ready for Delivery",
    "Delivered",
    "Cancelled",
}


def generate_tracking_number(db: Session) -> str:
    last_parcel = db.query(Parcel).order_by(Parcel.id.desc()).first()
    next_id = 1 if last_parcel is None else last_parcel.id + 1
    return f"CR-{next_id:06d}"


@router.post("/", response_model=ParcelResponse, status_code=201)
def create_parcel(
    parcel_data: ParcelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parcel = Parcel(
        tracking_number=generate_tracking_number(db),
        sender_name=parcel_data.sender_name,
        receiver_name=parcel_data.receiver_name,
        receiver_phone=parcel_data.receiver_phone,
        pickup_address=parcel_data.pickup_address,
        delivery_address=parcel_data.delivery_address,
        category=parcel_data.category,
        weight=parcel_data.weight,
        status="Pending",
        user_id=current_user.id,
    )

    try:
        db.add(parcel)
        db.flush()

        history = ParcelStatusHistory(
            parcel_id=parcel.id,
            status="Pending",
            location=parcel.pickup_address,
            description="Parcel booking has been created.",
        )

        db.add(history)
        db.commit()
        db.refresh(parcel)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create parcel. Please try again.",
        )

    return parcel


@router.get("/", response_model=ParcelListResponse)
def get_parcels(
    search: str | None = Query(default=None, max_length=100),
    category: str | None = Query(default=None, max_length=50),
    status: str | None = Query(default=None),
    start_date: date | None = None,
    end_date: date | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be after end_date",
        )

    allowed_sort_fields = {
        "id": Parcel.id,
        "tracking_number": Parcel.tracking_number,
        "sender_name": Parcel.sender_name,
        "receiver_name": Parcel.receiver_name,
        "category": Parcel.category,
        "status": Parcel.status,
        "created_at": Parcel.created_at,
        "weight": Parcel.weight,
    }

    if sort_by not in allowed_sort_fields:
        raise HTTPException(
            status_code=400,
            detail="Invalid sort_by field",
        )

    order = order.lower()

    if order not in {"asc", "desc"}:
        raise HTTPException(
            status_code=400,
            detail="Order must be asc or desc",
        )

    if status and status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Invalid parcel status",
        )

    query = db.query(Parcel)

    if current_user.role != "admin":
        query = query.filter(Parcel.user_id == current_user.id)

    if search and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            Parcel.tracking_number.ilike(search_term)
            | Parcel.sender_name.ilike(search_term)
            | Parcel.receiver_name.ilike(search_term)
        )

    if category and category.strip():
        query = query.filter(Parcel.category == category.strip())

    if status:
        query = query.filter(Parcel.status == status)

    if start_date:
        start_datetime = datetime.combine(
            start_date,
            time.min,
            tzinfo=timezone.utc,
        )
        query = query.filter(Parcel.created_at >= start_datetime)

    if end_date:
        end_datetime = datetime.combine(
            end_date + timedelta(days=1),
            time.min,
            tzinfo=timezone.utc,
        )
        query = query.filter(Parcel.created_at < end_datetime)

    sort_column = allowed_sort_fields[sort_by]
    query = query.order_by(
        sort_column.desc() if order == "desc" else sort_column.asc()
    )

    total = query.count()
    offset = (page - 1) * limit
    parcels = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "parcels": parcels,
    }


@router.get(
    "/track/{tracking_number}",
    response_model=PublicParcelTrackingResponse,
)
def track_parcel(
    tracking_number: str,
    db: Session = Depends(get_db),
):
    tracking_number = tracking_number.strip()

    if not tracking_number:
        raise HTTPException(
            status_code=400,
            detail="Please provide a tracking ID.",
        )

    parcel = (
        db.query(Parcel)
        .filter(Parcel.tracking_number == tracking_number)
        .first()
    )

    if parcel is None:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found. Please check your tracking ID.",
        )

    return parcel


@router.get("/{parcel_id}", response_model=ParcelResponse)
def get_parcel(
    parcel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id).first()

    if parcel is None:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found",
        )

    if current_user.role != "admin" and parcel.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot access this parcel",
        )

    return parcel


@router.put("/{parcel_id}", response_model=ParcelResponse)
def update_parcel(
    parcel_id: int,
    parcel_data: ParcelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id).first()

    if parcel is None:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found",
        )

    if current_user.role != "admin" and parcel.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot update this parcel",
        )

    update_data = parcel_data.model_dump(exclude_unset=True)

    # Extract status history information
    location = update_data.pop("location", None)
    description = update_data.pop("description", None)
    rider_name = update_data.pop("rider_name", None)
    rider_phone = update_data.pop("rider_phone", None)

    # Only admins can change parcel status
    if current_user.role != "admin":
        update_data.pop("status", None)

    old_status = parcel.status
    new_status = update_data.get("status")

    # Update parcel information
    for field, value in update_data.items():
        setattr(parcel, field, value)

    try:
        # Create history when admin changes status
        if (
            current_user.role == "admin"
            and new_status is not None
            and new_status != old_status
        ):
            history = ParcelStatusHistory(
                parcel_id=parcel.id,
                status=new_status,
                location=location,
                description=description or (
                    f"Parcel status changed from {old_status} to {new_status}."
                ),
                rider_name=rider_name,
                rider_phone=rider_phone,
            )

            db.add(history)

        db.commit()
        db.refresh(parcel)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update parcel. Please try again.",
        )

    return parcel
@router.delete("/{parcel_id}", status_code=204)
def delete_parcel(
    parcel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id).first()

    if parcel is None:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found",
        )

    try:
        db.delete(parcel)
        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to delete parcel. Please try again.",
        )

    return None
