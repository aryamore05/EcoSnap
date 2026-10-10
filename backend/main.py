"""FastAPI application for EcoSnap."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from . import database
from .ai_service import analyze_image, check_ollama_health, DEMO_MODE, OLLAMA_MODEL
from .models import (
    AnalysisResult,
    CleanupCreate,
    CleanupResponse,
    HealthResponse,
    ObservationCreate,
    ObservationResponse,
    StatsResponse,
)

# --- Config ---

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

ACCEPTED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# --- Lifespan ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="EcoSnap API",
    description="AI-powered environmental waste identification assistant",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# --- Endpoints ---


@app.get("/health", response_model=HealthResponse)
async def health():
    """Check backend and AI service status."""
    ai_status, model_name = await check_ollama_health()

    if ai_status == "online":
        message = f"AI model '{model_name}' is ready."
    elif ai_status == "demo":
        message = "Running in demo mode. Install Ollama and the vision model for real AI analysis."
    else:
        message = "Ollama is not running or the model is not installed."

    return HealthResponse(
        backend="online",
        ai_service=ai_status,
        model_name=model_name,
        message=message,
    )


@app.post("/analyze", response_model=AnalysisResult)
async def analyze(file: UploadFile = File(...)):
    """Analyze an uploaded waste photograph using the local vision model."""
    if file.content_type not in ACCEPTED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a JPEG, PNG, or WebP image.",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10 MB.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file. Please upload a valid image.",
        )

    try:
        result = await analyze_image(file_bytes, file.filename or "upload")
        return result
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while analyzing the image. Please try again.",
        )


@app.get("/observations", response_model=list[ObservationResponse])
async def list_observations():
    """Retrieve all saved observations."""
    return database.get_all_observations()


@app.post("/observations", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
async def create_observation(obs: ObservationCreate):
    """Save a new observation."""
    result = database.insert_observation(obs.model_dump())
    return result


@app.delete("/observations/{oid}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_observation(oid: int):
    """Delete a saved observation."""
    if not database.delete_observation(oid):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found.",
        )


@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Return the user's activity statistics."""
    return database.get_stats()


@app.post("/cleanup", response_model=CleanupResponse, status_code=status.HTTP_201_CREATED)
async def record_cleanup(cleanup: CleanupCreate):
    """Record a cleanup activity."""
    return database.insert_cleanup(cleanup.description, cleanup.items_collected)
