from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
import shutil
import os
import uuid
from uuid import UUID
from app.models.models import SourceFile, ProcessingJob
from app.services.processing_manager import processing_manager

router = APIRouter()

@router.post("/")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename.endswith(('.xlsx', '.xls', '.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Invalid file format. Only Excel, PDF, and DOCX are supported.")
    
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{uuid.uuid4()}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_type = file.filename.split('.')[-1].lower()
    
    source_file = SourceFile(
        filename=file.filename,
        file_path=file_path,
        file_type=file_type,
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
    
    # Вспомогательная функция для запуска в бэкграунде с новой сессией
    async def process_background(file_path: str, file_type: str, source_id: UUID):
        from app.database.session import AsyncSessionLocal
        async with AsyncSessionLocal() as bg_db:
            await processing_manager.process_file(bg_db, file_path, file_type, source_id)

    # Run processing pipeline in background
    background_tasks.add_task(process_background, file_path, file_type, source_file.id)
    
    return {"message": "File uploaded successfully, processing started", "job_id": job.id, "source_file_id": source_file.id}
