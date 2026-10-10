"""Test fixtures for EcoSnap backend tests."""

import os
import sys
import tempfile

import pytest

# Set demo mode and temp database before importing the app
os.environ["DEMO_MODE"] = "true"
os.environ["DATABASE_PATH"] = tempfile.mktemp(suffix=".db")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def client():
    """Create a test client with a fresh in-memory database."""
    from fastapi.testclient import TestClient
    from backend import database
    from backend.main import app

    database.init_db()
    with TestClient(app) as c:
        yield c

    # Clean up test database
    db_path = os.environ.get("DATABASE_PATH", "ecosnap.db")
    if os.path.exists(db_path):
        os.remove(db_path)


@pytest.fixture
def sample_image_bytes():
    """Minimal valid PNG (1x1 pixel) for testing uploads."""
    return bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108020000"
        "009077530000000c4944415408d63008c0030000400010000cf"
        "ff0f00000049454e44ae426082"
    )
