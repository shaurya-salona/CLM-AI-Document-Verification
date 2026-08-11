import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

db_url = (settings.DATABASE_URL or os.getenv("DATABASE_URL", "")).strip().strip('"').strip("'")

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if not db_url:
    db_url = "sqlite:///./clm_database.db"

connect_args = {}
engine_kwargs = {"echo": False}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20
    })

try:
    temp_engine = create_engine(db_url, connect_args=connect_args, **engine_kwargs)
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
except Exception as e:
    print(f"[DB Notice] Remote PostgreSQL unreachable locally ({e}). Using local database.")
    db_url = "sqlite:///./clm_database.db"
    connect_args = {"check_same_thread": False}
    engine_kwargs = {"echo": False}
    engine = create_engine(db_url, connect_args=connect_args, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    FastAPI dependency that provides a transactional database session per request.
    Automatically closes session upon request completion to prevent memory leaks.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
