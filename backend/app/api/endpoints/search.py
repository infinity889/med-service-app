from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import asc, desc, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.models import Category, Clinic, Price, Service, ServiceAlias

router = APIRouter()


class SearchResult(BaseModel):
    id: UUID
    serviceId: UUID
    serviceName: str
    clinicName: str
    price: float
    city: str
    updatedAt: datetime
    category: str
    address: str
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    working_hours: Optional[str] = None
    rating: Optional[float] = None
    sourceUrl: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[SearchResult])
async def search_prices(
    query: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    price_min: Optional[float] = Query(default=None, ge=0),
    price_max: Optional[float] = Query(default=None, ge=0),
    sortBy: str = Query(default="price_asc"),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Price.id.label("id"),
            Service.id.label("serviceId"),
            Service.canonical_name.label("serviceName"),
            Clinic.name.label("clinicName"),
            Price.price.label("price"),
            Clinic.city.label("city"),
            Clinic.address.label("address"),
            Clinic.phone.label("phone"),
            Clinic.latitude.label("latitude"),
            Clinic.longitude.label("longitude"),
            Price.last_updated.label("updatedAt"),
            Category.name.label("category"),
            Clinic.working_hours.label("working_hours"),
            Clinic.rating.label("rating"),
            Price.source_url.label("sourceUrl"),
        )
        .join(Service, Price.service_id == Service.id)
        .join(Clinic, Price.clinic_id == Clinic.id)
        .join(Category, Service.category_id == Category.id)
        .where(
            Price.is_available.is_(True),
            Clinic.is_active.is_(True),
            Price.last_updated >= datetime.utcnow() - timedelta(days=30)
        )
        .limit(limit)
    )

    if query and query.strip():
        pattern = f"%{query.strip()}%"
        alias_exists = (
            select(ServiceAlias.id)
            .where(
                ServiceAlias.service_id == Service.id,
                ServiceAlias.alias_name.ilike(pattern),
            )
            .exists()
        )
        stmt = stmt.where(
            or_(
                Service.canonical_name.ilike(pattern),
                Clinic.name.ilike(pattern),
                alias_exists,
            )
        )

    if city:
        stmt = stmt.where(Clinic.city == city)

    if category:
        stmt = stmt.where(Category.name == category)

    if price_min is not None:
        stmt = stmt.where(Price.price >= price_min)

    if price_max is not None:
        stmt = stmt.where(Price.price <= price_max)

    if sortBy == "price_desc":
        stmt = stmt.order_by(desc(Price.price))
    elif sortBy == "date_desc":
        stmt = stmt.order_by(desc(Price.last_updated))
    else:
        stmt = stmt.order_by(asc(Price.price))

    result = await db.execute(stmt)
    rows = result.mappings().all()

    return [
        SearchResult(
            id=row["id"],
            serviceId=row["serviceId"],
            serviceName=row["serviceName"],
            clinicName=row["clinicName"],
            price=float(row["price"] if isinstance(row["price"], Decimal) else row["price"]),
            city=row["city"],
            address=row["address"],
            phone=row["phone"],
            latitude=float(row["latitude"]) if row["latitude"] is not None else None,
            longitude=float(row["longitude"]) if row["longitude"] is not None else None,
            updatedAt=row["updatedAt"],
            category=row["category"],
            working_hours=row["working_hours"],
            rating=float(row["rating"]) if row["rating"] is not None else None,
            sourceUrl=row["sourceUrl"],
        )
        for row in rows
    ]

class Suggestion(BaseModel):
    name: str

@router.get("/suggest", response_model=List[Suggestion])
async def suggest_services(
    q: str = Query(..., min_length=2),
    limit: int = Query(default=10, le=20),
    db: AsyncSession = Depends(get_db)
):
    pattern = f"%{q.strip()}%"
    stmt = (
        select(Service.canonical_name.label("name"))
        .where(Service.canonical_name.ilike(pattern))
        .distinct()
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.mappings().all()
    return [{"name": row["name"]} for row in rows]

