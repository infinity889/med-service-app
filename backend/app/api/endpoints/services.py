from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.schemas.schemas import ServiceResponse, ServiceCreate
from app.repositories.service_repo import service_repository

router = APIRouter()

@router.get("/", response_model=List[ServiceResponse])
async def read_services(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    services = await service_repository.get_multi(db, skip=skip, limit=limit)
    return services

@router.get("/{service_id}", response_model=ServiceResponse)
async def read_service(service_id: UUID, db: AsyncSession = Depends(get_db)):
    service = await service_repository.get(db, id=service_id)
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/", response_model=ServiceResponse)
async def create_service(service_in: ServiceCreate, db: AsyncSession = Depends(get_db)):
    existing = await service_repository.get_by_canonical_name(db, canonical_name=service_in.canonical_name)
    if existing:
        raise HTTPException(status_code=400, detail="Service with this canonical name already exists")
    service = await service_repository.create(db, obj_in=service_in)
    return service
