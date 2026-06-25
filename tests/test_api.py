def test_list_items_empty(client):
    response = client.get("/api/items")

    assert response.status_code == 200
    assert response.json() == []


def test_create_and_list_item(client):
    create_response = client.post(
        "/api/items",
        json={
            "title": "Add dark mode",
            "body": "Would help for late-night triage.",
            "category": "idea",
        },
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["title"] == "Add dark mode"
    assert created["status"] == "new"

    list_response = client.get("/api/items?status=new")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1


def test_review_item(client):
    create_response = client.post(
        "/api/items",
        json={"title": "Fix typo", "body": "Button label is wrong.", "category": "bug"},
    )
    item_id = create_response.json()["id"]

    review_response = client.post(f"/api/items/{item_id}/review")

    assert review_response.status_code == 200
    assert review_response.json()["status"] == "reviewed"


def test_review_missing_item_returns_404(client):
    response = client.post("/api/items/999/review")

    assert response.status_code == 404
