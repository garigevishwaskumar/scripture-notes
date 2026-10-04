"""
Enterprise Test Suite for ScriptureNotes FastAPI Backend
"""
import os

# Guarantee isolated in-memory test database for test runs
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SUPABASE_JWT_SECRET"] = "test-secret"

import pytest
import jwt
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_headers():
    token = jwt.encode(
        {"sub": "user_enterprise_999", "email": "tester@example.com"},
        "test-secret",
        algorithm="HS256"
    )
    return {"Authorization": f"Bearer {token}"}

def test_healthz(client):
    res = client.get("/healthz")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["bible_indexed"] is True
    assert data["total_verses"] == 31102

def test_get_books(client):
    res = client.get("/api/bible/books")
    assert res.status_code == 200
    data = res.json()
    assert data["total_books"] == 66
    assert data["books"][0]["id"] == "genesis"

def test_get_chapter_verses(client):
    res = client.get("/api/bible/books/GEN/chapters/1")
    assert res.status_code == 200
    data = res.json()
    assert data["chapter_number"] == 1
    assert data["verse_count"] > 0
    assert "beginning" in data["verses"][0].lower()

def test_scripture_search(client):
    res = client.get("/api/bible/search?q=light")
    assert res.status_code == 200
    data = res.json()
    assert data["total_results"] > 0
    assert len(data["results"]) > 0

def test_note_lifecycle_with_jwt_auth(client, auth_headers):
    # 1. Upsert note with JWT
    res = client.post(
        "/api/notes/GEN/1",
        json={"content": "God created heaven and earth.", "tags": "creation,faith"},
        headers=auth_headers
    )
    assert res.status_code == 200
    note_data = res.json()
    assert note_data["user_id"] == "user_enterprise_999"
    assert note_data["book_id"] == "genesis"
    assert note_data["content"] == "God created heaven and earth."

    # 2. Fetch chapter note with JWT
    fetch_res = client.get("/api/notes/GEN/1", headers=auth_headers)
    assert fetch_res.status_code == 200
    assert fetch_res.json()["content"] == "God created heaven and earth."

    # 3. List notes
    list_res = client.get("/api/notes", headers=auth_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 4. Export markdown
    export_res = client.get("/api/notes/export/markdown", headers=auth_headers)
    assert export_res.status_code == 200
    assert "Genesis Chapter 1" in export_res.text

    # 5. Delete note
    del_res = client.delete("/api/notes/GEN/1", headers=auth_headers)
    assert del_res.status_code == 204
