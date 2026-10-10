"""Pydantic models / response schemas for EcoSnap API."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


WasteCategory = Literal[
    "Plastic",
    "Paper and cardboard",
    "Glass",
    "Metal",
    "Organic waste",
    "Electronic waste",
    "Mixed or unknown waste",
]

ConfidenceLabel = Literal["Likely", "Uncertain", "Needs manual verification"]


class AnalysisResult(BaseModel):
    """Structured result returned by the AI waste analysis."""

    item_name: str = Field(..., description="Likely name of the identified item")
    category: WasteCategory = Field(..., description="Waste category")
    explanation: str = Field(..., description="Short explanation of the identification")
    confidence: ConfidenceLabel = Field(..., description="Confidence expressed as a label, not a fabricated number")
    disposal_action: str = Field(..., description="Suggested disposal or recycling action")
    safety_warnings: str = Field("", description="Relevant safety warnings")
    needs_professional: bool = Field(False, description="Whether a professional or authorised service should handle this")


class ObservationCreate(BaseModel):
    """Payload for creating a saved observation."""

    item_name: str
    category: WasteCategory
    explanation: str
    confidence: ConfidenceLabel
    disposal_action: str
    safety_warnings: str = ""
    needs_professional: bool = False
    image_filename: Optional[str] = None


class ObservationResponse(ObservationCreate):
    """A saved observation with ID and timestamp."""

    id: int
    created_at: str

    model_config = {"from_attributes": True}


class CleanupCreate(BaseModel):
    """Payload for recording a cleanup activity."""

    description: str = Field(..., min_length=1, max_length=500, description="What the cleanup involved")
    items_collected: int = Field(..., ge=1, le=10000, description="Number of items actually collected")


class CleanupResponse(CleanupCreate):
    """A recorded cleanup activity with ID and timestamp."""

    id: int
    created_at: str

    model_config = {"from_attributes": True}


class StatsResponse(BaseModel):
    """User activity statistics."""

    total_observations: int
    total_items_collected: int
    total_cleanups: int
    category_breakdown: dict[str, int]
    recent_observations: list[ObservationResponse]
    recent_cleanups: list[CleanupResponse]


class HealthResponse(BaseModel):
    """Backend and AI service health status."""

    backend: Literal["online"]
    ai_service: Literal["online", "offline", "demo"]
    model_name: Optional[str]
    message: str
