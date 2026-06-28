import asyncio
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import AsyncSessionLocal
from app.models.models import Service, Alias, Category, Price, Clinic

async def test():
    async with AsyncSessionLocal() as db:
        pass
