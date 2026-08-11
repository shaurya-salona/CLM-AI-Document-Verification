from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Configure PostgreSQL connection pooling
connect_args = {}
engine_kwargs = {
    "echo": False,
    "pool_pre_ping": True,  # Checks connection health before executing queries
    "pool_size": 10,        # Maintains up to 10 persistent connections
    "max_overflow": 20      # Allows up to 20 overflow connections during high traffic
}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine_kwargs = {"echo": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

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
