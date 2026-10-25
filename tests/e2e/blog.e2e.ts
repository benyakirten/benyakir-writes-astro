import { expect, test } from "@playwright/test";

test("the former blog URL redirects to the single home listing", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1, name: "Latest Posts" })).toBeVisible();
  await expect(page.locator(".latest-card-link")).toHaveCount(12);
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await expect(page.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute("href", "/");
});

test("clicking card padding navigates to the post", async ({ page }) => {
  await page.goto("/");
  const link = page.locator(".latest-card-link").first();
  const destination = new URL((await link.getAttribute("href")) ?? "/", page.url()).href;
  const bounds = await link.boundingBox();
  if (!bounds) throw new Error("Blog card has no rendered bounds");
  await link.click({ position: { x: bounds.width - 8, y: bounds.height - 8 } });
  await expect(page).toHaveURL(destination);
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Blog" }),
  ).toHaveAttribute("href", "/");
});
