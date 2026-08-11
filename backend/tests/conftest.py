import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.database import Base, get_db
from app.config import settings

TEST_DATABASE_URL = (os.getenv("TEST_DATABASE_URL", settings.DATABASE_URL) or "").strip().strip('"').strip("'")

if TEST_DATABASE_URL.startswith("postgres://"):
    TEST_DATABASE_URL = TEST_DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not TEST_DATABASE_URL:
    TEST_DATABASE_URL = "sqlite:///./test_clm.db"

connect_args = {}
engine_kwargs = {"echo": False}

if TEST_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    temp_engine = create_engine(TEST_DATABASE_URL, connect_args=connect_args, **engine_kwargs)
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
except Exception as e:
    print(f"[Test DB Notice] Remote PostgreSQL unreachable locally ({e}). Using local test DB.")
    TEST_DATABASE_URL = "sqlite:///./test_clm.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(TEST_DATABASE_URL, connect_args=connect_args, **engine_kwargs)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    if TEST_DATABASE_URL.startswith("sqlite") and os.path.exists("./test_clm.db"):
        os.remove("./test_clm.db")

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
