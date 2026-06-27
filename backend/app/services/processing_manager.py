import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.parsers.factory import ParserFactory
from app.cleaners.cleaner import DataCleaner
from app.validators.validator import RecordValidator
from app.ai.matcher import ai_matcher
from app.repositories.service_repo import service_repository
from app.schemas.schemas import RawRecordCreate
from app.models.models import RawRecord, NeedsReview, Service, ProcessingJob, Clinic, Price, PriceHistory
from sqlalchemy import select
from datetime import datetime

logger = logging.getLogger(__name__)

class ProcessingManager:
    def __init__(self):
        self.parser_factory = ParserFactory()
        self.cleaner = DataCleaner()
        self.validator = RecordValidator()

    async def process_file(self, db: AsyncSession, file_path: str, file_type: str, source_file_id: UUID) -> None:
        """
        Main pipeline:
        Upload (Done before this step) -> Validation (File level, assumed ok if we are here)
        -> ParserFactory -> Parser -> RawRecord -> Cleaning -> Validation -> AI Matching -> Database
        """
        logger.info(f"Starting pipeline for source_file_id: {source_file_id}")
        
        job = await db.scalar(select(ProcessingJob).where(ProcessingJob.source_file_id == source_file_id))
        
        try:
            # 1. ParserFactory & Parser
            parser = self.parser_factory.get_parser(file_type)
            
            # Run the synchronous parser in a threadpool to avoid blocking the async loop
            # and to allow Playwright sync_api to run without throwing 'loop already running' errors
            import asyncio
            loop = asyncio.get_running_loop()
            raw_records = await loop.run_in_executor(None, parser.parse, file_path, source_file_id)
            
            logger.info(f"Parsed {len(raw_records)} records from {file_path}.")
            
            # Note: For very large files (e.g. thousands of records), processing with AI sequentially might take time.
            # In a full production app, this loop would be handled by Celery/Redis queue workers.
            
            existing_services = await service_repository.get_multi(db, limit=1000) # Load all for MVP
            
            errors = 0
            for raw_rec in raw_records:
                # Deduplication check
                exist_stmt = select(RawRecord).where(
                    RawRecord.source_file_id == source_file_id,
                    RawRecord.raw_service_name == raw_rec.raw_service_name,
                    RawRecord.raw_price == raw_rec.raw_price
                )
                db_record = await db.scalar(exist_stmt)
                
                if db_record:
                    db_record.status = "PENDING"
                else:
                    db_record = RawRecord(
                        source_file_id=raw_rec.source_file_id,
                        raw_service_name=raw_rec.raw_service_name,
                        raw_price=raw_rec.raw_price,
                        status="PENDING"
                    )
                    db.add(db_record)
                
                await db.flush() # flush to get ID
            
                try:
                    # 2. Cleaning
                    cleaned_name = self.cleaner.clean_service_name(db_record.raw_service_name)
                    cleaned_price, currency = self.cleaner.clean_price(db_record.raw_price)
                    
                    db_record.cleaned_service_name = cleaned_name
                    db_record.cleaned_price = cleaned_price
                    
                    # 3. Validation
                    is_valid, err_msg = self.validator.validate(cleaned_name, cleaned_price)
                    if not is_valid:
                        db_record.status = "ERROR"
                        db_record.error_message = err_msg
                        continue
                    
                    # 4. AI Matching
                    match_result = await ai_matcher.match(cleaned_name, existing_services)
                    
                    # 5. Database logic based on matching
                    if match_result.action == 'EXACT_MATCH':
                        db_record.status = "MATCHED"
                        # For MVP, get the first active clinic to associate this parsed data
                        clinic = await db.scalar(select(Clinic).where(Clinic.is_active == True))
                        if clinic and match_result.service_id:
                            # Create or update price
                            existing_price = await db.scalar(
                                select(Price).where(
                                    Price.clinic_id == clinic.id,
                                    Price.service_id == match_result.service_id
                                )
                            )
                            if existing_price:
                                if float(existing_price.price) != float(cleaned_price):
                                    db.add(PriceHistory(
                                        price_id=existing_price.id,
                                        old_price=existing_price.price,
                                        new_price=cleaned_price
                                    ))
                                existing_price.price = cleaned_price
                                existing_price.last_updated = datetime.utcnow()
                            else:
                                db.add(Price(
                                    clinic_id=clinic.id,
                                    service_id=match_result.service_id,
                                    price=cleaned_price,
                                    currency=currency,
                                    source_url=file_path,
                                    last_updated=datetime.utcnow(),
                                    is_available=True
                                ))
                    elif match_result.action == 'NEEDS_REVIEW':
                        db_record.status = "NEEDS_REVIEW"
                        needs_rev = NeedsReview(
                            raw_record_id=db_record.id,
                            suggested_service_id=match_result.service_id,
                            similarity_score=match_result.similarity
                        )
                        db.add(needs_rev)
                    elif match_result.action == 'NEW_SERVICE':
                        db_record.status = "NEW_SERVICE"
                        # Create new service or put it somewhere for admin to approve
                        
                except Exception as e:
                    db_record.status = "ERROR"
                    db_record.error_message = str(e)
                    errors += 1
                    logger.error(f"Error processing record {db_record.id}: {str(e)}")
                
            if job:
                job.status = "COMPLETED"
                job.finished_at = datetime.utcnow()
                job.processed_records = len(raw_records)
                job.errors_count = errors
                
        except Exception as e:
            logger.error(f"Pipeline failed for source_file_id {source_file_id}: {str(e)}")
            if job:
                job.status = "FAILED"
                job.finished_at = datetime.utcnow()
                
        await db.commit()
        logger.info(f"Finished pipeline for source_file_id: {source_file_id}")

processing_manager = ProcessingManager()
