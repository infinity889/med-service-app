from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.schemas.schemas import ProcessingJobResponse
from app.repositories.job_repo import job_repository

router = APIRouter()

@router.get("/", response_model=List[ProcessingJobResponse])
async def read_jobs(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    jobs = await job_repository.get_multi(db, skip=skip, limit=limit)
    return jobs

@router.get("/{job_id}", response_model=ProcessingJobResponse)
async def read_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    job = await job_repository.get(db, id=job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
