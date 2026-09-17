import { test as base } from "@playwright/test";
import { TaskPage } from "./pages/TaskPage";

const API_URL = "http://localhost:8000";

type Fixtures = {
  taskPage: TaskPage;
};

/**
 * Extends the base Playwright test with:
 *  - an authenticated-and-ready TaskPage object
 *  - an automatic backend reset, so tests never depend on leftover
 *    state from a previous run (a common source of "flaky" tests
 *    that are really just isolation bugs).
 */
export const test = base.extend<Fixtures>({
  taskPage: async ({ page, request }, use) => {
    await request.delete(`${API_URL}/tasks`);
    const taskPage = new TaskPage(page);
    await taskPage.goto();
    await use(taskPage);
  },
});

export { expect } from "@playwright/test";
