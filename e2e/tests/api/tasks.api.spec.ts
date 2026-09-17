import { test, expect } from "../fixtures";

/**
 * API-level tests, separate from the UI suite. Playwright's
 * `request` fixture lets us test the backend contract directly -
 * faster and more precise than driving everything through the UI,
 * which is exactly why real frameworks split these two suites.
 */
const API_URL = "http://localhost:8000";

test.describe("Tasks API", () => {
  test.beforeEach(async ({ request }) => {
    await request.delete(`${API_URL}/tasks`);
  });

  test("GET /tasks returns an empty list initially", async ({ request }) => {
    const res = await request.get(`${API_URL}/tasks`);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test("POST /tasks creates a task with defaults", async ({ request }) => {
    const res = await request.post(`${API_URL}/tasks`, {
      data: { title: "Ship the CI pipeline" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      title: "Ship the CI pipeline",
      priority: "medium",
      completed: false,
    });
    expect(body.id).toBeTruthy();
  });

  test("POST /tasks rejects an empty title", async ({ request }) => {
    const res = await request.post(`${API_URL}/tasks`, { data: { title: "" } });
    expect(res.status()).toBe(422);
  });

  test("POST /tasks rejects an invalid priority", async ({ request }) => {
    const res = await request.post(`${API_URL}/tasks`, {
      data: { title: "Valid title", priority: "urgent" },
    });
    expect(res.status()).toBe(422);
  });

  test("PATCH /tasks/:id toggles completed", async ({ request }) => {
    const created = await (
      await request.post(`${API_URL}/tasks`, { data: { title: "Toggle me" } })
    ).json();

    const res = await request.patch(`${API_URL}/tasks/${created.id}`, {
      data: { completed: true },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).completed).toBe(true);
  });

  test("PATCH /tasks/:id returns 404 for an unknown id", async ({ request }) => {
    const res = await request.patch(`${API_URL}/tasks/does-not-exist`, {
      data: { completed: true },
    });
    expect(res.status()).toBe(404);
  });

  test("DELETE /tasks/:id removes the task", async ({ request }) => {
    const created = await (
      await request.post(`${API_URL}/tasks`, { data: { title: "Delete me" } })
    ).json();

    const del = await request.delete(`${API_URL}/tasks/${created.id}`);
    expect(del.status()).toBe(204);

    const list = await (await request.get(`${API_URL}/tasks`)).json();
    expect(list).toEqual([]);
  });

  test("GET /tasks?completed=true filters correctly", async ({ request }) => {
    const a = await (await request.post(`${API_URL}/tasks`, { data: { title: "A" } })).json();
    await request.post(`${API_URL}/tasks`, { data: { title: "B" } });
    await request.patch(`${API_URL}/tasks/${a.id}`, { data: { completed: true } });

    const res = await request.get(`${API_URL}/tasks?completed=true`);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("A");
  });
});
