# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> Task Tracker - core workflow >> deletes a task
- Location: tests\tasks.spec.ts:22:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('empty-state')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('empty-state') with timeout 5000ms
  - waiting for getByTestId('empty-state')

```

```yaml
- navigation:
  - button "Tasks" [disabled]
  - button "Dashboard"
- main:
  - heading "Task Tracker" [level=1]
  - paragraph:
    - text: System-under-test for the Playwright automation suite in
    - code: /e2e
    - text: .
  - textbox "What needs doing?"
  - combobox:
    - option "Low"
    - option "Medium" [selected]
    - option "High"
  - button "Add task"
  - list:
    - listitem:
      - checkbox "Write Playwright suite"
      - text: Write Playwright suitehigh
      - button "Delete"
    - listitem:
      - checkbox "Task A"
      - text: Task Alow
      - button "Delete"
    - listitem:
      - checkbox "Review PR"
      - text: Review PRmedium
      - button "Delete"
    - listitem:
      - checkbox "Task B"
      - text: Task Bhigh
      - button "Delete"
```

# Test source

```ts
  1  | import { test, expect } from "./fixtures";
  2  | 
  3  | test.describe("Task Tracker - core workflow", () => {
  4  |   test("shows an empty state with no tasks", async ({ taskPage }) => {
  5  |     await expect(taskPage.emptyState).toBeVisible();
  6  |   });
  7  | 
  8  |   test("creates a task and shows it in the list", async ({ taskPage }) => {
  9  |     await taskPage.addTask("Write Playwright suite", "high");
  10 |     await expect(taskPage.taskByTitle("Write Playwright suite")).toBeVisible();
  11 |     await expect(taskPage.taskByTitle("Write Playwright suite").getByTestId("task-priority")).toHaveText("high");
  12 |   });
  13 | 
  14 |   test("toggles a task as completed", async ({ taskPage }) => {
  15 |     await taskPage.addTask("Review PR");
  16 |     expect(await taskPage.isCompleted("Review PR")).toBe(false);
  17 | 
  18 |     await taskPage.toggleTask("Review PR");
  19 |     expect(await taskPage.isCompleted("Review PR")).toBe(true);
  20 |   });
  21 | 
  22 |   test("deletes a task", async ({ taskPage }) => {
  23 |     await taskPage.addTask("Temporary task");
  24 |     await taskPage.deleteTask("Temporary task");
> 25 |     await expect(taskPage.emptyState).toBeVisible();
     |                                       ^ Error: expect(locator).toBeVisible() failed
  26 |   });
  27 | 
  28 |   test("supports multiple tasks with independent state", async ({ taskPage }) => {
  29 |     await taskPage.addTask("Task A", "low");
  30 |     await taskPage.addTask("Task B", "high");
  31 | 
  32 |     await taskPage.toggleTask("Task A");
  33 | 
  34 |     expect(await taskPage.isCompleted("Task A")).toBe(true);
  35 |     expect(await taskPage.isCompleted("Task B")).toBe(false);
  36 |     expect(await taskPage.taskCount()).toBe(2);
  37 |   });
  38 | });
  39 | 
  40 | test.describe("Task Tracker - regression guardrails", () => {
  41 |   // Regression test for a real class of bug: empty/whitespace-only
  42 |   // titles should never create a task. Written as its own describe
  43 |   // block so it's easy to point to in a case study as "here's a bug
  44 |   // class this suite prevents."
  45 |   test("does not submit a task with a blank title", async ({ taskPage }) => {
  46 |     await taskPage.submitButton.click();
  47 |     await expect(taskPage.emptyState).toBeVisible();
  48 |   });
  49 | 
  50 |   test("does not submit a task with only whitespace", async ({ taskPage }) => {
  51 |     await taskPage.titleInput.fill("   ");
  52 |     await taskPage.submitButton.click();
  53 |     await expect(taskPage.emptyState).toBeVisible();
  54 |   });
  55 | });
  56 | 
```