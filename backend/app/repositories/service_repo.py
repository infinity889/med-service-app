from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.models import Service
from app.schemas.schemas import ServiceCreate

class ServiceUpdate(ServiceCreate):
    pass

class RepositoryService(BaseRepository[Service, ServiceCreate, ServiceUpdate]):
    async def get_by_canonical_name(self, db: AsyncSession, canonical_name: str) -> Optional[Service]:
        result = await db.execute(select(Service).filter(Service.canonical_name == canonical_name))
        return result.scalars().first()

service_repository = RepositoryService(Service)
