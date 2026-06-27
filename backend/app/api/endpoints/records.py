from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database.session import get_db
from app.schemas.schemas import RawRecordResponse
from app.models.models import RawRecord, NeedsReview, Clinic, Price, PriceHistory

router = APIRouter()


class ResolveRequest(BaseModel):
    service_id: UUID


@router.get("/", response_model=List[RawRecordResponse])
async def get_raw_records(
    source_file_id: Optional[UUID] = None,
    job_id: Optional[UUID] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(RawRecord)
    if source_file_id:
        query = query.filter(RawRecord.source_file_id == source_file_id)
    if status:
        query = query.filter(RawRecord.status == status)
    
    result = await db.execute(query)
    records = result.scalars().all()
    return records


@router.post("/{record_id}/resolve")
async def resolve_record(record_id: UUID, body: ResolveRequest, db: AsyncSession = Depends(get_db)):
    """Moderator confirms the mapping: raw record -> canonical service.
    Creates a Price entry so the data appears in search results."""
    
    raw = await db.scalar(select(RawRecord).where(RawRecord.id == record_id))
    if not raw:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Get the first active clinic to associate
    clinic = await db.scalar(select(Clinic).where(Clinic.is_active == True))
    if not clinic:
        raise HTTPException(status_code=400, detail="No active clinic found")
    
    # Determine price value
    price_value = raw.cleaned_price
    if price_value is None:
        # Try to extract from raw_price
        import re
        digits = re.sub(r'[^\d.,]', '', raw.raw_price)
        digits = digits.replace(',', '.').replace(' ', '')
        try:
            price_value = float(digits)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Cannot parse price from: {raw.raw_price}")
    
    # Check if price already exists for this clinic+service
    existing = await db.scalar(
        select(Price).where(
            Price.clinic_id == clinic.id,
            Price.service_id == body.service_id
        )
    )
    
    if existing:
        # Update price and record history
        if float(existing.price) != float(price_value):
            db.add(PriceHistory(
                price_id=existing.id,
                old_price=existing.price,
                new_price=price_value
            ))
        existing.price = price_value
        existing.last_updated = datetime.utcnow()
    else:
        # Create new price
        db.add(Price(
            clinic_id=clinic.id,
            service_id=body.service_id,
            price=price_value,
            currency="KZT",
            source_url=None,
            last_updated=datetime.utcnow(),
            is_available=True
        ))
    
    # Mark raw record as resolved
    raw.status = "MATCHED"
    
    # Mark any NeedsReview entries as resolved
    reviews = await db.execute(
        select(NeedsReview).where(NeedsReview.raw_record_id == record_id)
    )
    for review in reviews.scalars().all():
        review.status = "RESOLVED"
    
    await db.commit()
    
    return {"message": "Record resolved and price published", "record_id": str(record_id)}
