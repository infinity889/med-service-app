from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.schemas.schemas import ClinicResponse, ClinicCreate, ClinicBase, ClinicDetailResponse
from app.repositories.clinic_repo import clinic_repository, ClinicUpdate
from app.models.models import Price, Service
from sqlalchemy import select

router = APIRouter()

@router.get("/", response_model=List[ClinicResponse])
async def read_clinics(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    clinics = await clinic_repository.get_multi(db, skip=skip, limit=limit)
    return clinics

@router.get("/{clinic_id}", response_model=ClinicDetailResponse)
async def read_clinic(clinic_id: UUID, db: AsyncSession = Depends(get_db)):
    clinic = await clinic_repository.get(db, id=clinic_id)
    if clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
        
    # Fetch prices with service names
    stmt = (
        select(Price, Service.canonical_name.label("service_name"))
        .join(Service, Price.service_id == Service.id)
        .where(Price.clinic_id == clinic_id, Price.is_available == True)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    prices_data = []
    for price_obj, service_name in rows:
        prices_data.append({
            "id": price_obj.id,
            "service_id": price_obj.service_id,
            "service_name": service_name,
            "price": float(price_obj.price),
            "currency": price_obj.currency,
            "duration_days": price_obj.duration_days,
            "is_available": price_obj.is_available
        })
        
    clinic_dict = {
        "id": clinic.id,
        "name": clinic.name,
        "slug": clinic.slug,
        "city": clinic.city,
        "address": clinic.address,
        "phone": clinic.phone,
        "website": clinic.website,
        "logo_url": clinic.logo_url,
        "working_hours": clinic.working_hours,
        "rating": float(clinic.rating) if clinic.rating is not None else None,
        "has_online_booking": clinic.has_online_booking,
        "latitude": float(clinic.latitude) if clinic.latitude is not None else None,
        "longitude": float(clinic.longitude) if clinic.longitude is not None else None,
        "is_active": clinic.is_active,
        "created_at": clinic.created_at,
        "updated_at": clinic.updated_at,
        "prices": prices_data
    }
    return clinic_dict

@router.post("/", response_model=ClinicResponse)
async def create_clinic(clinic_in: ClinicCreate, db: AsyncSession = Depends(get_db)):
    existing = await clinic_repository.get_by_slug(db, slug=clinic_in.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Clinic with this slug already exists")
    clinic = await clinic_repository.create(db, obj_in=clinic_in)
    return clinic
