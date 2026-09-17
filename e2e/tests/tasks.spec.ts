import { test, expect } from "./fixtures";

test.describe("Task Tracker - core workflow", () => {
  test("shows an empty state with no tasks", async ({ taskPage }) => {
    await expect(taskPage.emptyState).toBeVisible();
  });

  test("creates a task and shows it in the list", async ({ taskPage }) => {
    await taskPage.addTask("Write Playwright suite", "high");
    await expect(taskPage.taskByTitle("Write Playwright suite")).toBeVisible();
    await expect(taskPage.taskByTitle("Write Playwright suite").getByTestId("task-priority")).toHaveText("high");
  });

  test("toggles a task as completed", async ({ taskPage }) => {
    await taskPage.addTask("Review PR");
    expect(await taskPage.isCompleted("Review PR")).toBe(false);

    await taskPage.toggleTask("Review PR");
    expect(await taskPage.isCompleted("Review PR")).toBe(true);
  });

  test("deletes a task", async ({ taskPage }) => {
    await taskPage.addTask("Temporary task");
    await taskPage.deleteTask("Temporary task");
    await expect(taskPage.emptyState).toBeVisible();
  });

  test("supports multiple tasks with independent state", async ({ taskPage }) => {
    await taskPage.addTask("Task A", "low");
    await taskPage.addTask("Task B", "high");

    await taskPage.toggleTask("Task A");

    expect(await taskPage.isCompleted("Task A")).toBe(true);
    expect(await taskPage.isCompleted("Task B")).toBe(false);
    expect(await taskPage.taskCount()).toBe(2);
  });
});

test.describe("Task Tracker - regression guardrails", () => {
  // Regression test for a real class of bug: empty/whitespace-only
  // titles should never create a task. Written as its own describe
  // block so it's easy to point to in a case study as "here's a bug
  // class this suite prevents."
  test("does not submit a task with a blank title", async ({ taskPage }) => {
    await taskPage.submitButton.click();
    await expect(taskPage.emptyState).toBeVisible();
  });

  test("does not submit a task with only whitespace", async ({ taskPage }) => {
    await taskPage.titleInput.fill("   ");
    await taskPage.submitButton.click();
    await expect(taskPage.emptyState).toBeVisible();
  });
});
