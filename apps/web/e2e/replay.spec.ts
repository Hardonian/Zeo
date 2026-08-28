import { test, expect } from "@playwright/test";

test.describe("Replay Viewer", () => {
  test("should load replay page", async ({ page }) => {
    await page.goto("/replay");

    // Check page title
    await expect(page.locator("h1")).toContainText("Replay Viewer");

    // Check for upload input
    await expect(page.locator('input[type="file"]')).toBeVisible();

    // Check for sample dataset button
    await expect(page.locator("button", { hasText: "Load Sample Dataset" })).toBeVisible();
  });

  test("should show error for invalid JSON", async ({ page }) => {
    await page.goto("/replay");

    // Upload invalid JSON
    const input = page.locator('input[type="file"]');

    // Create a file with invalid JSON content
    const invalidJson = "not valid json";
    const buffer = Buffer.from(invalidJson);

    await input.setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer,
    });

    // Check error message
    await expect(page.locator("text=Failed to parse dataset")).toBeVisible();
  });
});
