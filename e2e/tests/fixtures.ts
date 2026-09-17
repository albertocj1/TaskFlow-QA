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
 *    that are really just isolation bugs)
 *  - an X-Test-Worker header on every request (API and browser-driven
 *    alike), so the backend partitions storage per worker. Without this,
 *    parallel workers all share one task list and race each other's
 *    resets - see backend/main.py's get_worker_key/get_store.
 */
export const test = base.extend<Fixtures>({
  page: async ({ page }, use, testInfo) => {
    await page.setExtraHTTPHeaders({ "X-Test-Worker": String(testInfo.workerIndex) });
    await use(page);
  },

  request: async ({ playwright }, use, testInfo) => {
    const context = await playwright.request.newContext({
      extraHTTPHeaders: { "X-Test-Worker": String(testInfo.workerIndex) },
    });
    await use(context);
    await context.dispose();
  },

  taskPage: async ({ page, request }, use) => {
    await request.delete(`${API_URL}/tasks`);
    const taskPage = new TaskPage(page);
    await taskPage.goto();
    await use(taskPage);
  },
});

export { expect } from "@playwright/test";
