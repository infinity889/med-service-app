from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.models import Category
from app.schemas.schemas import CategoryCreate

class CategoryUpdate(CategoryCreate):
    pass

class RepositoryCategory(BaseRepository[Category, CategoryCreate, CategoryUpdate]):
    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Category]:
        result = await db.execute(select(Category).filter(Category.name == name))
        return result.scalars().first()

category_repository = RepositoryCategory(Category)
