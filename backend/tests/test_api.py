def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert data["docs"] == "/docs"

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}

def test_ready_endpoint(client):
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "READY"}

def test_metrics_endpoint_format(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text or "http_request_duration_seconds" in response.text

def test_create_item_success(client, valid_item_payload):
    response = client.post("/api/items", json=valid_item_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == valid_item_payload["name"]
    assert data["sku"] == valid_item_payload["sku"]
    assert data["status"] == "IN_STOCK"

def test_create_item_duplicate_sku_conflict(client, valid_item_payload):
    res1 = client.post("/api/items", json=valid_item_payload)
    assert res1.status_code == 201
    # Duplicate SKU creation must fail with 409
    res2 = client.post("/api/items", json=valid_item_payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]

def test_create_item_validation_error(client):
    # Missing required name and sku, negative quantity
    bad_payload = {"quantity": -5}
    response = client.post("/api/items", json=bad_payload)
    assert response.status_code == 422

def test_get_item_by_id(client, valid_item_payload):
    create_res = client.post("/api/items", json=valid_item_payload)
    item_id = create_res.json()["id"]

    get_res = client.get(f"/api/items/{item_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == item_id
    assert get_res.json()["sku"] == valid_item_payload["sku"]

def test_get_item_unknown_not_found(client):
    response = client.get("/api/items/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Item not found"

def test_list_items_with_category_and_status_filter(client):
    # Item 1: IN_STOCK (qty 50, reorder 10)
    client.post("/api/items", json={
        "name": "Datadog Pro", "sku": "SKU-DD-01", "category": "DevOps", "quantity": 50, "reorder_level": 10
    })
    # Item 2: LOW (qty 5, reorder 10)
    client.post("/api/items", json={
        "name": "Figma Org", "sku": "SKU-FG-01", "category": "Design", "quantity": 5, "reorder_level": 10
    })
    # Item 3: OUT_OF_STOCK (qty 0, reorder 5)
    client.post("/api/items", json={
        "name": "Slack Business", "sku": "SKU-SL-01", "category": "Collaboration", "quantity": 0, "reorder_level": 5
    })

    # Filter by category
    res_devops = client.get("/api/items?category=DevOps")
    assert res_devops.status_code == 200
    assert len(res_devops.json()) == 1
    assert res_devops.json()[0]["sku"] == "SKU-DD-01"

    # Filter by status
    res_low = client.get("/api/items?status=LOW")
    assert res_low.status_code == 200
    assert len(res_low.json()) == 1
    assert res_low.json()[0]["sku"] == "SKU-FG-01"

    res_out = client.get("/api/items?status=OUT_OF_STOCK")
    assert res_out.status_code == 200
    assert len(res_out.json()) == 1
    assert res_out.json()[0]["sku"] == "SKU-SL-01"

def test_issue_stock_success(client, valid_item_payload):
    create_res = client.post("/api/items", json=valid_item_payload)
    item_id = create_res.json()["id"]

    # Issue 15 units (started with 50)
    issue_res = client.post(f"/api/items/{item_id}/issue", json={"quantity": 15})
    assert issue_res.status_code == 200
    assert issue_res.json()["quantity"] == 35
    assert issue_res.json()["status"] == "IN_STOCK"

def test_issue_stock_insufficient_conflict(client, valid_item_payload):
    create_res = client.post("/api/items", json=valid_item_payload)
    item_id = create_res.json()["id"]

    # Valid payload has 50; attempt to issue 55
    issue_res = client.post(f"/api/items/{item_id}/issue", json={"quantity": 55})
    assert issue_res.status_code == 409
    assert "Cannot issue 55 units: only 50 available" in issue_res.json()["detail"]

def test_update_item_success_and_conflict(client, valid_item_payload):
    item1 = client.post("/api/items", json=valid_item_payload).json()
    item2 = client.post("/api/items", json={
        "name": "Sentry Business", "sku": "SKU-SEN-01", "category": "DevOps", "quantity": 10
    }).json()

    # Update item 1 name and quantity
    res = client.put(f"/api/items/{item1['id']}", json={"name": "GitHub Enterprise Plus", "quantity": 100})
    assert res.status_code == 200
    assert res.json()["name"] == "GitHub Enterprise Plus"
    assert res.json()["quantity"] == 100

    # Updating item 1 with item 2's SKU triggers 409
    conflict_res = client.put(f"/api/items/{item1['id']}", json={"sku": "SKU-SEN-01"})
    assert conflict_res.status_code == 409

    # Updating non-existent item triggers 404
    not_found_res = client.put("/api/items/9999", json={"name": "Ghost"})
    assert not_found_res.status_code == 404

def test_delete_item_success_then_404(client, valid_item_payload):
    create_res = client.post("/api/items", json=valid_item_payload)
    item_id = create_res.json()["id"]

    del_res = client.delete(f"/api/items/{item_id}")
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = client.get(f"/api/items/{item_id}")
    assert get_res.status_code == 404

    # Subsequent DELETE returns 404
    del_res2 = client.delete(f"/api/items/{item_id}")
    assert del_res2.status_code == 404

def test_stats_counts(client):
    # Create 1 In Stock (qty 20, reorder 10)
    client.post("/api/items", json={"name": "A", "sku": "A1", "quantity": 20, "reorder_level": 10})
    # Create 1 Low (qty 8, reorder 10)
    client.post("/api/items", json={"name": "B", "sku": "B1", "quantity": 8, "reorder_level": 10})
    # Create 1 Out of Stock (qty 0, reorder 10)
    client.post("/api/items", json={"name": "C", "sku": "C1", "quantity": 0, "reorder_level": 10})

    stats_res = client.get("/api/items/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total"] == 3
    assert stats["in_stock"] == 1
    assert stats["low"] == 1
    assert stats["out_of_stock"] == 1
