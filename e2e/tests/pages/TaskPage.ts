import { expect, Locator, Page } from "@playwright/test";

export type Priority = "low" | "medium" | "high";

/**
 * Page Object for the Task Tracker screen.
 *
 * Keeping selectors and interactions here (not in the spec files) means
 * a UI refactor only requires updating this one file, not every test
 * that touches the task list.
 */
export class TaskPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly prioritySelect: Locator;
  readonly submitButton: Locator;
  readonly taskItems: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByTestId("task-title-input");
    this.prioritySelect = page.getByTestId("task-priority-select");
    this.submitButton = page.getByTestId("task-submit-button");
    this.taskItems = page.getByTestId("task-item");
    this.emptyState = page.getByTestId("empty-state");
  }

  async goto() {
    await this.page.goto("/");
  }

  async addTask(title: string, priority: Priority = "medium") {
    await this.titleInput.fill(title);
    await this.prioritySelect.selectOption(priority);
    await this.submitButton.click();
    // Wait for the new task to actually appear rather than sleeping -
    // avoids flakiness from network timing.
    await expect(this.taskItems.filter({ hasText: title })).toBeVisible();
  }

  taskByTitle(title: string): Locator {
    return this.taskItems.filter({ hasText: title });
  }

  async toggleTask(title: string) {
    await this.taskByTitle(title).getByTestId("task-checkbox").click();
  }

  async deleteTask(title: string) {
    await this.taskByTitle(title).getByTestId("task-delete-button").click();
    await expect(this.taskByTitle(title)).toHaveCount(0);
  }

  async isCompleted(title: string): Promise<boolean> {
    const attr = await this.taskByTitle(title).getAttribute("data-completed");
    return attr === "true";
  }

  async taskCount(): Promise<number> {
    return this.taskItems.count();
  }
}
