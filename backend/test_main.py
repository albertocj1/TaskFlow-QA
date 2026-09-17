from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def setup_function():
    client.delete("/tasks")


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_create_task_defaults_to_medium_priority():
    res = client.post("/tasks", json={"title": "Write unit tests"})
    assert res.status_code == 201
    body = res.json()
    assert body["priority"] == "medium"
    assert body["completed"] is False


def test_create_task_rejects_empty_title():
    res = client.post("/tasks", json={"title": ""})
    assert res.status_code == 422


def test_create_task_rejects_bad_priority():
    res = client.post("/tasks", json={"title": "x", "priority": "urgent"})
    assert res.status_code == 422


def test_patch_unknown_task_returns_404():
    res = client.patch("/tasks/does-not-exist", json={"completed": True})
    assert res.status_code == 404


def test_delete_then_list_is_empty():
    created = client.post("/tasks", json={"title": "Temp"}).json()
    client.delete(f"/tasks/{created['id']}")
    assert client.get("/tasks").json() == []


def test_filter_by_completed():
    a = client.post("/tasks", json={"title": "A"}).json()
    client.post("/tasks", json={"title": "B"})
    client.patch(f"/tasks/{a['id']}", json={"completed": True})

    res = client.get("/tasks", params={"completed": True})
    body = res.json()
    assert len(body) == 1
    assert body[0]["title"] == "A"
