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

  test("cleans up MutationObserver on pagehide", async ({ page }) => {
    await page.goto("http://localhost:5173/test-host.html");
    await expect(page.locator("text=page fragment exists")).toBeVisible();

    const disconnectCalled = await page.evaluate(() => {
      let called = false;
      const orig = MutationObserver.prototype.disconnect;
      MutationObserver.prototype.disconnect = function () {
        called = true;
        return orig.call(this);
      };
      window.dispatchEvent(new Event("pagehide"));
      MutationObserver.prototype.disconnect = orig;
      return called;
    });

    expect(disconnectCalled).toBe(true);
  });

  test("does not inject observed assets after pagehide cleanup", async ({ page }) => {
    await page.goto("http://localhost:5173/test-host.html");
    await expect(page.locator("text=page fragment exists")).toBeVisible();

    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));

    await page.click("text=Click to inject observed element");

    await expect(page.locator("text=observed fragment exists")).not.toBeVisible();
  });
});
