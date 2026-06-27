from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.base import BaseRepository
from app.models.models import ProcessingJob
from app.schemas.schemas import ProcessingJobCreate

class ProcessingJobUpdate(ProcessingJobCreate):
    status: Optional[str] = None
    processed_records: Optional[int] = None
    created_records: Optional[int] = None
    updated_records: Optional[int] = None
    errors_count: Optional[int] = None
    finished_at: Optional[str] = None

class RepositoryProcessingJob(BaseRepository[ProcessingJob, ProcessingJobCreate, ProcessingJobUpdate]):
    async def get_by_source_file_id(self, db: AsyncSession, source_file_id: str) -> Optional[ProcessingJob]:
        result = await db.execute(select(ProcessingJob).filter(ProcessingJob.source_file_id == source_file_id))
        return result.scalars().first()

job_repository = RepositoryProcessingJob(ProcessingJob)
