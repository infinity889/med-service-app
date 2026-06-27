from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.models import Clinic, Service, Price, NeedsReview, ProcessingJob

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    clinics_count = await db.scalar(select(func.count(Clinic.id)).where(Clinic.is_active == True))
    services_count = await db.scalar(select(func.count(Service.id)))
    parsed_prices_count = await db.scalar(select(func.count(Price.id)))
    avg_price = await db.scalar(select(func.avg(Price.price)))
    
    return {
        "totalClinics": clinics_count or 0,
        "totalServices": services_count or 0,
        "totalPrices": parsed_prices_count or 0,
        "averagePrice": float(avg_price) if avg_price else 0
    }

@router.get("/chart")
async def get_dashboard_chart(db: AsyncSession = Depends(get_db)) -> List[Dict[str, Any]]:
    # Get parsed records per day for the last 7 days from ProcessingJob
    chart_data = []
    
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        
        # Calculate avg price for the day (mock logic based on actual prices)
        # For a real app, this might track average price history. 
        # Since we just need `averagePrice` for the chart:
        stmt = select(func.avg(Price.price)).where(
            func.date(Price.last_updated) <= target_date
        )
        avg = await db.scalar(stmt)
        
        chart_data.append({
            "date": target_date.strftime("%d.%m"),
            "averagePrice": float(avg) if avg else 0
        })
        
    return chart_data
