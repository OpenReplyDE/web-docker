import { test, expect } from "@playwright/test";

test.describe("WebDocker", () => {
  test("renders with fragment loaded on page (page)", async ({ page }) => {
    await page.goto("http://localhost:5173/test-host.html");

    await expect(page.locator("text=page fragment exists")).toBeVisible();
  });

  test("renders with fragment loaded on page(observed)", async ({ page }) => {
    await page.goto("http://localhost:5173/test-host.html");

    await page.click("text=Click to inject observed element");

    await expect(page.locator("text=observed fragment exists")).toBeVisible();
  });
});
