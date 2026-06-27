from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from pydantic import BaseModel
import uuid
from uuid import UUID
from app.models.models import SourceFile, ProcessingJob
from app.services.processing_manager import processing_manager

router = APIRouter()

class ParseRequest(BaseModel):
    url: str

@router.post("/")
async def run_parser(
    request: ParseRequest, 
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db)
):
    source_file = SourceFile(
        filename=request.url,
        file_path=request.url,
        file_type="html",
        status="UPLOADED"
    )
    db.add(source_file)
    await db.commit()
    await db.refresh(source_file)
    
    job = ProcessingJob(
        source_file_id=source_file.id,
        status="RUNNING"
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    
    async def process_background(url: str, source_id: UUID):
        from app.database.session import AsyncSessionLocal
        async with AsyncSessionLocal() as bg_db:
            await processing_manager.process_file(bg_db, url, "html", source_id)

    # Run processing pipeline in background
    background_tasks.add_task(process_background, request.url, source_file.id)
    
    return {"message": "Web parsing job started", "job_id": job.id, "source_file_id": source_file.id}
