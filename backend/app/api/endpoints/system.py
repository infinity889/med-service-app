from fastapi import APIRouter
from app.database.session import engine, Base
import app.models.models
from sqlalchemy import text

router = APIRouter()

@router.delete("/reset_db")
async def reset_database():
    """
    WARNING: This endpoint drops all tables and recreates them, 
    deleting ALL data. Use only for testing/development.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        await conn.run_sync(Base.metadata.create_all)
    
    # After reset, we must re-seed demo data
    import sys
    import subprocess
    import os
    
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    env = os.environ.copy()
    env["PYTHONPATH"] = backend_dir
    subprocess.run([sys.executable, "app/seed_demo_data.py"], cwd=backend_dir, env=env)
    
    return {"message": "Database has been completely reset and seeded with demo data."}
