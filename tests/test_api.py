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


def test_list_items_filters_by_category(client):
    client.post(
        "/api/items",
        json={"title": "A bug", "body": "Body", "category": "bug"},
    )
    client.post(
        "/api/items",
        json={"title": "An idea", "body": "Body", "category": "idea"},
    )

    response = client.get("/api/items?category=bug")

    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["category"] == "bug"


def test_list_items_invalid_category_returns_422(client):
    response = client.get("/api/items?category=nonsense")

    assert response.status_code == 422


def test_list_items_composes_status_and_category(client):
    client.post(
        "/api/items",
        json={"title": "New bug", "body": "Body", "category": "bug"},
    )
    reviewed = client.post(
        "/api/items",
        json={"title": "Reviewed bug", "body": "Body", "category": "bug"},
    )
    client.post(f"/api/items/{reviewed.json()['id']}/review")
    client.post(
        "/api/items",
        json={"title": "New idea", "body": "Body", "category": "idea"},
    )

    response = client.get("/api/items?status=new&category=bug")

    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["title"] == "New bug"
    assert items[0]["status"] == "new"
    assert items[0]["category"] == "bug"


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


def test_stats_returns_counts(client):
    client.post(
        "/api/items",
        json={"title": "New bug", "body": "Body", "category": "bug"},
    )
    reviewed = client.post(
        "/api/items",
        json={"title": "Done bug", "body": "Body", "category": "bug"},
    )
    client.post(f"/api/items/{reviewed.json()['id']}/review")

    response = client.get("/api/stats")

    assert response.status_code == 200
    assert response.json() == {"total": 2, "reviewed": 1, "percent_reviewed": 50}


def test_stats_with_no_matching_items_returns_zero(client):
    response = client.get("/api/stats?status=reviewed")

    assert response.status_code == 200
    assert response.json() == {"total": 0, "reviewed": 0, "percent_reviewed": 0}
