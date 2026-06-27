from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.models import Clinic
from pydantic import BaseModel

class ClinicCreate(BaseModel):
    name: str
    slug: str
    city: str
    address: str
    phone: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    working_hours: Optional[str] = None
    rating: Optional[float] = None
    has_online_booking: bool = False

class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    working_hours: Optional[str] = None
    rating: Optional[float] = None
    has_online_booking: Optional[bool] = None
    is_active: Optional[bool] = None

class RepositoryClinic(BaseRepository[Clinic, ClinicCreate, ClinicUpdate]):
    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[Clinic]:
        result = await db.execute(select(Clinic).filter(Clinic.slug == slug))
        return result.scalars().first()

clinic_repository = RepositoryClinic(Clinic)
