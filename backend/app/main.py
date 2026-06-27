from fastapi import FastAPI
from app.config.settings import settings
from app.core.logger import logger
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import clinics, jobs, records, search, services, upload, parser_run, dashboard
from app.database.session import engine, Base
from sqlalchemy import text

# Импортируем все модели, чтобы Base.metadata знал о них до create_all
import app.models.models  # noqa: F401

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Medical Service Price processing"
)

# Разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clinics.router, prefix="/api/clinics", tags=["Clinics"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(parser_run.router, prefix="/api/parser/run", tags=["Parser"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(records.router, prefix="/api/records", tags=["Records"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application...")
    # Автоматически создаём все таблицы, если они ещё не существуют
    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created.")

@app.get("/")
async def root():
    return {"message": "Medical Service Price API is running", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
