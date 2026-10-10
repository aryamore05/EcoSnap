"""Tests for EcoSnap backend API."""

import io


class TestHealth:
    """Backend health endpoint."""

    def test_health_returns_online(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["backend"] == "online"

    def test_health_includes_ai_status(self, client):
        resp = client.get("/health")
        data = resp.json()
        assert data["ai_service"] in ("online", "offline", "demo")

    def test_health_message_is_present(self, client):
        resp = client.get("/health")
        data = resp.json()
        assert isinstance(data["message"], str)
        assert len(data["message"]) > 0


class TestFileValidation:
    """Image file validation on the /analyze endpoint."""

    def test_rejects_non_image_file(self, client):
        resp = client.post(
            "/analyze",
            files={"file": ("test.txt", io.BytesIO(b"hello"), "text/plain")},
        )
        assert resp.status_code == 400
        assert "Unsupported file type" in resp.json()["detail"]

    def test_rejects_empty_file(self, client):
        resp = client.post(
            "/analyze",
            files={"file": ("empty.png", io.BytesIO(b""), "image/png")},
        )
        assert resp.status_code == 400
        assert "Empty file" in resp.json()["detail"]


class TestAnalyzeDemoMode:
    """AI analysis in demo mode (no Ollama required)."""

    def test_demo_analysis_returns_result(self, client, sample_image_bytes):
        resp = client.post(
            "/analyze",
            files={"file": ("test.png", io.BytesIO(sample_image_bytes), "image/png")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "item_name" in data
        assert "category" in data
        assert "confidence" in data
        assert "disposal_action" in data

    def test_demo_result_has_valid_category(self, client, sample_image_bytes):
        resp = client.post(
            "/analyze",
            files={"file": ("test.png", io.BytesIO(sample_image_bytes), "image/png")},
        )
        data = resp.json()
        valid = {
            "Plastic", "Paper and cardboard", "Glass", "Metal",
            "Organic waste", "Electronic waste", "Mixed or unknown waste",
        }
        assert data["category"] in valid

    def test_demo_result_has_valid_confidence(self, client, sample_image_bytes):
        resp = client.post(
            "/analyze",
            files={"file": ("test.png", io.BytesIO(sample_image_bytes), "image/png")},
        )
        data = resp.json()
        valid = {"Likely", "Uncertain", "Needs manual verification"}
        assert data["confidence"] in valid


class TestObservations:
    """Saving and retrieving observations."""

    def test_save_and_retrieve_observation(self, client):
        payload = {
            "item_name": "Plastic bottle",
            "category": "Plastic",
            "explanation": "A clear plastic water bottle.",
            "confidence": "Likely",
            "disposal_action": "Recycle in plastic bin.",
            "safety_warnings": "No special precautions.",
            "needs_professional": False,
            "image_filename": "test.jpg",
        }
        save_resp = client.post("/observations", json=payload)
        assert save_resp.status_code == 201
        saved = save_resp.json()
        assert saved["id"] > 0
        assert saved["item_name"] == "Plastic bottle"

        list_resp = client.get("/observations")
        assert list_resp.status_code == 200
        items = list_resp.json()
        assert any(o["id"] == saved["id"] for o in items)

    def test_delete_observation(self, client):
        payload = {
            "item_name": "Glass jar",
            "category": "Glass",
            "explanation": "A clear glass jar.",
            "confidence": "Likely",
            "disposal_action": "Recycle in glass bin.",
            "safety_warnings": "",
            "needs_professional": False,
        }
        save_resp = client.post("/observations", json=payload)
        oid = save_resp.json()["id"]

        del_resp = client.delete(f"/observations/{oid}")
        assert del_resp.status_code == 204

    def test_delete_nonexistent_observation(self, client):
        resp = client.delete("/observations/99999")
        assert resp.status_code == 404


class TestStats:
    """Activity statistics."""

    def test_empty_stats(self, client):
        resp = client.get("/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_observations"] == 0
        assert data["total_items_collected"] == 0
        assert data["total_cleanups"] == 0

    def test_stats_after_activity(self, client):
        # Add an observation
        client.post("/observations", json={
            "item_name": "Can",
            "category": "Metal",
            "explanation": "Aluminum can.",
            "confidence": "Likely",
            "disposal_action": "Recycle.",
            "safety_warnings": "",
            "needs_professional": False,
        })

        # Record a cleanup
        client.post("/cleanup", json={
            "description": "Collected cans at the park",
            "items_collected": 5,
        })

        resp = client.get("/stats")
        data = resp.json()
        assert data["total_observations"] == 1
        assert data["total_items_collected"] == 5
        assert data["total_cleanups"] == 1
        assert "Metal" in data["category_breakdown"]


class TestCleanup:
    """Cleanup activity recording."""

    def test_record_cleanup(self, client):
        resp = client.post("/cleanup", json={
            "description": "Beach cleanup",
            "items_collected": 12,
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["id"] > 0
        assert data["description"] == "Beach cleanup"
        assert data["items_collected"] == 12

    def test_cleanup_validation_min_items(self, client):
        resp = client.post("/cleanup", json={
            "description": "Test",
            "items_collected": 0,
        })
        assert resp.status_code == 422
