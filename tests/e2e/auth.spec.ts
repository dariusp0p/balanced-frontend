import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("User can sign up", async ({ page }) => {
    await page.goto("http://localhost:5173/signup");

    await page.fill('input[name="name"]', "New User");
    await page.fill('input[name="email"]', "newuser@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);
  });

  test("User can log in", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    await page.fill('input[name="email"]', "newuser@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);
  });

  test("Shows error on invalid login", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    await page.fill('input[name="email"]', "wronguser@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});
