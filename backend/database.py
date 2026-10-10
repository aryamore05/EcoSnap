"""SQLite database layer for EcoSnap."""

from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from typing import Any

DB_PATH = os.getenv("DATABASE_PATH", "ecosnap.db")

_SCHEMA = """
CREATE TABLE IF NOT EXISTS observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    explanation TEXT NOT NULL,
    confidence TEXT NOT NULL,
    disposal_action TEXT NOT NULL,
    safety_warnings TEXT DEFAULT '',
    needs_professional INTEGER DEFAULT 0,
    image_filename TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cleanups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    items_collected INTEGER NOT NULL,
    created_at TEXT NOT NULL
);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    conn = get_connection()
    try:
        conn.executescript(_SCHEMA)
        conn.commit()
    finally:
        conn.close()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# --- Observations ---


def insert_observation(data: dict[str, Any]) -> dict[str, Any]:
    conn = get_connection()
    try:
        cursor = conn.execute(
            """INSERT INTO observations
               (item_name, category, explanation, confidence, disposal_action,
                safety_warnings, needs_professional, image_filename, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["item_name"],
                data["category"],
                data["explanation"],
                data["confidence"],
                data["disposal_action"],
                data.get("safety_warnings", ""),
                1 if data.get("needs_professional") else 0,
                data.get("image_filename"),
                _now(),
            ),
        )
        conn.commit()
        return get_observation(cursor.lastrowid)  # type: ignore[arg-type]
    finally:
        conn.close()


def get_observation(oid: int) -> dict[str, Any] | None:
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM observations WHERE id = ?", (oid,)).fetchone()
        return _row_to_observation(row) if row else None
    finally:
        conn.close()


def get_all_observations(limit: int = 100) -> list[dict[str, Any]]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM observations ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [_row_to_observation(r) for r in rows]
    finally:
        conn.close()


def delete_observation(oid: int) -> bool:
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM observations WHERE id = ?", (oid,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# --- Cleanups ---


def insert_cleanup(description: str, items_collected: int) -> dict[str, Any]:
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO cleanups (description, items_collected, created_at) VALUES (?, ?, ?)",
            (description, items_collected, _now()),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM cleanups WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return _row_to_cleanup(row)
    finally:
        conn.close()


def get_recent_cleanups(limit: int = 10) -> list[dict[str, Any]]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM cleanups ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [_row_to_cleanup(r) for r in rows]
    finally:
        conn.close()


# --- Stats ---


def get_stats() -> dict[str, Any]:
    conn = get_connection()
    try:
        total_obs = conn.execute("SELECT COUNT(*) FROM observations").fetchone()[0]
        total_cleanups = conn.execute("SELECT COUNT(*) FROM cleanups").fetchone()[0]
        total_items = conn.execute(
            "SELECT COALESCE(SUM(items_collected), 0) FROM cleanups"
        ).fetchone()[0]

        category_rows = conn.execute(
            "SELECT category, COUNT(*) as count FROM observations GROUP BY category"
        ).fetchall()
        breakdown = {row["category"]: row["count"] for row in category_rows}

        recent_obs = conn.execute(
            "SELECT * FROM observations ORDER BY created_at DESC LIMIT 10"
        ).fetchall()
        recent_cleanups = conn.execute(
            "SELECT * FROM cleanups ORDER BY created_at DESC LIMIT 10"
        ).fetchall()

        return {
            "total_observations": total_obs,
            "total_items_collected": total_items,
            "total_cleanups": total_cleanups,
            "category_breakdown": breakdown,
            "recent_observations": [_row_to_observation(r) for r in recent_obs],
            "recent_cleanups": [_row_to_cleanup(r) for r in recent_cleanups],
        }
    finally:
        conn.close()


# --- Helpers ---


def _row_to_observation(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "item_name": row["item_name"],
        "category": row["category"],
        "explanation": row["explanation"],
        "confidence": row["confidence"],
        "disposal_action": row["disposal_action"],
        "safety_warnings": row["safety_warnings"],
        "needs_professional": bool(row["needs_professional"]),
        "image_filename": row["image_filename"],
        "created_at": row["created_at"],
    }


def _row_to_cleanup(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "description": row["description"],
        "items_collected": row["items_collected"],
        "created_at": row["created_at"],
    }
