import asyncio
from sqlalchemy import select, func
from app.database.session import SessionLocal
from app.models.models import Category, Service, Price

async def main():
    async with SessionLocal() as db:
        # Get all categories with their services and avg price
        stmt = (
            select(
                Category.id.label('category_id'),
                Category.name.label('category_name'),
                Service.id.label('service_id'),
                Service.canonical_name.label('service_name'),
                func.avg(Price.price).label('avg_price')
            )
            .join(Service, Service.category_id == Category.id)
            .outerjoin(Price, Price.service_id == Service.id)
            .group_by(Category.id, Category.name, Service.id, Service.canonical_name)
            .order_by(Category.name, Service.canonical_name)
        )
        res = await db.execute(stmt)
        rows = res.all()
        print(f"Total combinations: {len(rows)}")
        if rows:
            print(rows[:5])

asyncio.run(main())
