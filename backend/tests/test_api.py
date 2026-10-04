"""
FastAPI Test Suite for ScriptureNotes Backend
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_check(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["bible_indexed"] is True
    assert data["total_verses"] == 31102

def test_get_all_books(client):
    response = client.get("/api/bible/books")
    assert response.status_code == 200
    data = response.json()
    assert data["total_books"] == 66
    assert any(b["id"] == "genesis" for b in data["books"])
    assert any(b["id"] == "revelation" for b in data["books"])

def test_get_book_metadata(client):
    response = client.get("/api/bible/books/genesis")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Genesis"
    assert data["chapterCount"] == 50

def test_get_chapter_verses_by_abbreviation(client):
    # Tests abbreviation GEN resolving to Genesis
    response = client.get("/api/bible/books/GEN/chapters/1")
    assert response.status_code == 200
    data = response.json()
    assert data["chapter_number"] == 1
    assert data["verse_count"] == 31
    assert "In the beginning God created the heaven and the earth." in data["verses"][0]

def test_search_verses(client):
    response = client.get("/api/bible/search?q=light")
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] > 0
    assert len(data["results"]) <= data["page_size"]
    assert any("light" in r["text"].lower() for r in data["results"])

def test_notes_crud_lifecycle(client):
    test_user = "test_l7_user"
    book_id = "genesis"
    chapter = 1

    # 1. Create / Upsert Note
    payload = {
        "content": "Genesis chapter 1 speaks of divine creation and sovereignty.",
        "tags": "creation,reflection,theology",
        "user_id": test_user
    }
    create_res = client.post(f"/api/notes/{book_id}/{chapter}", json=payload)
    assert create_res.status_code == 200
    created_note = create_res.json()
    assert created_note["content"] == payload["content"]
    assert created_note["book_id"] == "genesis"

    # 2. Get Note
    get_res = client.get(f"/api/notes/{book_id}/{chapter}?user_id={test_user}")
    assert get_res.status_code == 200
    assert get_res.json()["content"] == payload["content"]

    # 3. List Notes
    list_res = client.get(f"/api/notes?user_id={test_user}")
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 4. Export Markdown
    export_res = client.get(f"/api/notes/export/markdown?user_id={test_user}")
    assert export_res.status_code == 200
    assert "Genesis Chapter 1" in export_res.text

    # 5. Delete Note
    del_res = client.delete(f"/api/notes/{book_id}/{chapter}?user_id={test_user}")
    assert del_res.status_code == 204

    # 6. Verify Note is Deleted
    verify_res = client.get(f"/api/notes/{book_id}/{chapter}?user_id={test_user}")
    assert verify_res.status_code == 404
