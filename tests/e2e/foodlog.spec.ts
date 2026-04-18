// import { test, expect } from "@playwright/test";

// test.describe("Food Logging", () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto("http://localhost:5173");
//     await page.fill('input[name="email"]', "newuser@example.com");
//     await page.fill('input[name="password"]', "password123");
//     await page.click('button[type="submit"]');
//     await expect(page).toHaveURL(/dashboard/);

//     await page.goto("http://localhost:5173/food/add");
//     await page.fill('input[name="foodName"]', "Banana");
//     await page.fill('input[name="calories"]', "100");
//     await page.fill('input[name="protein"]', "1");
//     await page.fill('input[name="carbs"]', "27");
//     await page.fill('input[name="fat"]', "0");
//     await page.click('button[type="submit"]');
//   });

//   test("User can add a food log entry", async ({ page }) => {
//     await page.goto("http://localhost:5173/food/add");
//     await page.fill('input[name="foodName"]', "Banana");
//     await page.fill('input[name="calories"]', "100");
//     await page.fill('input[name="protein"]', "1");
//     await page.fill('input[name="carbs"]', "27");
//     await page.fill('input[name="fat"]', "0");
//     await page.click('button[type="submit"]');
//     // Expect to be redirected or see the new entry
//     await expect(page.getByText("Banana")).toBeVisible();
//   });

//   test("User can edit a food log entry", async ({ page }) => {
//     await page.goto("http://localhost:5173/dashboard");
//     await page.getByText("Banana").click();
//     await page.click('button[data-testid="edit-food-log"]');
//     await page.fill('input[name="calories"]', "110");
//     await page.click('button[type="submit"]');
//     await expect(page.getByText("110")).toBeVisible();
//   });

//   test("User can delete a food log entry", async ({ page }) => {
//     await page.goto("http://localhost:5173/dashboard");
//     await page.getByText("Banana").click();
//     await page.click('button[data-testid="delete-food-log"]');
//     await page.click('button[data-testid="confirm-delete"]');
//     await expect(page.getByText("Banana")).not.toBeVisible();
//   });
// });
