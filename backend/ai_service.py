"""AI waste analysis service using Ollama with a vision-language model.

Reads OLLAMA_URL and OLLAMA_MODEL from environment variables.
Uses the Ollama /api/chat endpoint with the configured vision model (default: llava:7b).
The model must be pulled before first use:  ollama pull llava:7b

When DEMO_MODE=true, returns a clearly-labelled demo result without calling Ollama.
This is the ONLY path that returns fake results. If Ollama is unreachable, analyze_image
raises RuntimeError with a user-facing message — it never silently returns demo data.
"""

from __future__ import annotations

import base64
import json
import os
from typing import Any

import httpx

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llava:7b")
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

# Timeout for the model inference call.  CPU-only inference on a 7B model
# can take 30–60+ seconds, so we allow up to 3 minutes.
INFERENCE_TIMEOUT = 180

ANALYSIS_PROMPT = """You are EcoSnap, an environmental waste identification assistant.
Analyze this image and identify what waste item is shown.

Respond with ONLY a JSON object (no markdown fences, no explanation before or after the JSON) with these exact fields:

{
  "item_name": "The likely name of the item shown (e.g. 'Plastic water bottle', 'Cardboard box')",
  "category": "One of: Plastic, Paper and cardboard, Glass, Metal, Organic waste, Electronic waste, Mixed or unknown waste",
  "explanation": "A brief 1-2 sentence explanation of why you identified it this way",
  "confidence": "One of: Likely, Uncertain, Needs manual verification",
  "disposal_action": "Practical steps for responsible disposal or recycling",
  "safety_warnings": "Any relevant safety precautions, or empty string if none",
  "needs_professional": true or false
}

Rules:
- If you cannot identify the item, set category to "Mixed or unknown waste" and confidence to "Needs manual verification".
- Do NOT fabricate numerical confidence scores. Use only the descriptive labels above.
- For hazardous, medical, chemical, or sharp waste: set needs_professional to true and warn the user not to touch it.
- NEVER tell users to burn waste, mix chemicals, or handle dangerous materials.
- Disposal guidance should be general. Remind users to check local rules where appropriate.
- Output ONLY the JSON object, nothing else."""

VALID_CATEGORIES = {
    "Plastic",
    "Paper and cardboard",
    "Glass",
    "Metal",
    "Organic waste",
    "Electronic waste",
    "Mixed or unknown waste",
}

VALID_CONFIDENCE = {"Likely", "Uncertain", "Needs manual verification"}


def _encode_image(file_bytes: bytes) -> str:
    return base64.b64encode(file_bytes).decode("utf-8")


def _parse_ai_response(text: str) -> dict[str, Any]:
    """Extract and parse the JSON object from the AI response."""
    text = text.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (opening fence) and last line if it's a closing fence
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        lines = lines[1:]
        text = "\n".join(lines).strip()

    # Find the JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("AI response did not contain a JSON object")

    json_str = text[start : end + 1]
    data = json.loads(json_str)

    # Validate required fields
    required = ["item_name", "category", "explanation", "confidence", "disposal_action"]
    for field in required:
        if field not in data:
            raise ValueError(f"AI response missing required field: {field}")

    # Set defaults for optional fields
    data.setdefault("safety_warnings", "")
    data.setdefault("needs_professional", False)

    # Normalize category to a valid value
    if data["category"] not in VALID_CATEGORIES:
        data["category"] = "Mixed or unknown waste"

    # Normalize confidence to a valid label
    if data["confidence"] not in VALID_CONFIDENCE:
        data["confidence"] = "Needs manual verification"

    # Ensure needs_professional is a bool
    data["needs_professional"] = bool(data["needs_professional"])

    # Ensure strings are strings
    for str_field in ("item_name", "explanation", "disposal_action", "safety_warnings"):
        if not isinstance(data[str_field], str):
            data[str_field] = str(data[str_field])

    return data


def _demo_result() -> dict[str, Any]:
    """Return a clearly-labelled demo result for testing without Ollama.

    This is ONLY called when DEMO_MODE=true in the environment.
    It is never used as a silent fallback for a failed Ollama connection.
    """
    return {
        "item_name": "Demo result — no real analysis",
        "category": "Mixed or unknown waste",
        "explanation": "This is a demo result. No real AI analysis was performed. Set DEMO_MODE=false and install Ollama with a vision model to get real waste identification.",
        "confidence": "Needs manual verification",
        "disposal_action": "This is a demo result. No disposal guidance is provided. Configure Ollama for real analysis.",
        "safety_warnings": "This is a demo result. No safety assessment was performed.",
        "needs_professional": False,
    }


async def check_ollama_health() -> tuple[str, str | None]:
    """Check if Ollama is running and the configured model is available.

    Returns (status, model_name) where status is 'online', 'offline', or 'demo'.
    - 'demo'  : DEMO_MODE=true is set in the environment (explicitly chosen)
    - 'online': Ollama is reachable AND the configured model is installed
    - 'offline': Ollama is not reachable or the model is not installed
    """
    if DEMO_MODE:
        return "demo", OLLAMA_MODEL

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code != 200:
                return "offline", None

            tags = response.json()
            models = [m.get("name", "") for m in tags.get("models", [])]

            model_available = any(
                m == OLLAMA_MODEL or m.startswith(OLLAMA_MODEL.split(":")[0])
                for m in models
            )

            if model_available:
                return "online", OLLAMA_MODEL
            return "offline", None
    except (httpx.ConnectError, httpx.TimeoutException):
        return "offline", None
    except Exception:
        return "offline", None


async def analyze_image(file_bytes: bytes, filename: str) -> dict[str, Any]:
    """Analyze a waste image using the configured Ollama vision model.

    Returns a dict with keys: item_name, category, explanation, confidence,
    disposal_action, safety_warnings, needs_professional.

    Raises:
        RuntimeError: If Ollama is unreachable, the model is not installed,
                      or the response cannot be parsed. The error message is
                      safe to show to end users and does not expose internal paths.
    """
    if DEMO_MODE:
        return _demo_result()

    image_b64 = _encode_image(file_bytes)

    try:
        async with httpx.AsyncClient(timeout=INFERENCE_TIMEOUT) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": ANALYSIS_PROMPT,
                            "images": [image_b64],
                        }
                    ],
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.3},
                },
            )

            if response.status_code == 404:
                raise RuntimeError(
                    f"Model '{OLLAMA_MODEL}' not found in Ollama. "
                    f"Pull it first by running: ollama pull {OLLAMA_MODEL}"
                )

            response.raise_for_status()

            data = response.json()
            # /api/chat returns the text in message.content
            ai_text = data.get("message", {}).get("content", "")

            if not ai_text:
                raise RuntimeError("The AI model returned an empty response. Please try again with a clearer photo.")

            return _parse_ai_response(ai_text)

    except httpx.ConnectError:
        raise RuntimeError(
            f"Could not connect to Ollama at {OLLAMA_URL}. "
            "Make sure Ollama is running — start it with: ollama serve"
        )
    except httpx.TimeoutException:
        raise RuntimeError(
            "The AI model took too long to respond. This can happen on CPU-only "
            "inference or with large models. Try again, use a smaller model, or "
            "enable GPU acceleration."
        )
    except RuntimeError:
        raise
    except ValueError as e:
        raise RuntimeError(
            f"The AI model returned an unparseable response: {e}. "
            "Please try again with a different photo."
        )
    except Exception as e:
        # Generic catch — never expose internal filesystem or server details
        raise RuntimeError(
            "An unexpected error occurred while contacting the AI model. "
            "Please try again."
        )
