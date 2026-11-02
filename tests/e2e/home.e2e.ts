import { expect, test } from "@playwright/test";

test("home contains only the twelve newest blog posts", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator(".latest-card-link");
  await expect(cards).toHaveCount(12);
  for (const card of await cards.all()) {
    await expect(card).toHaveAttribute("href", /^\/post\/[^/]+\/$/);
  }
  const dates = await page
    .locator(".latest-card time")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("datetime") ?? ""));
  expect(dates).toEqual([...dates].sort().reverse());
});

test("cards use Gatsby's full-width grid and animate the shadow and arrow", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const grid = await page.locator(".latest-grid").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      columns: style.gridTemplateColumns.split(" ").map(Number.parseFloat),
      gap: style.gap,
    };
  });
  expect(grid.columns).toHaveLength(2);
  expect(Math.min(...grid.columns)).toBeGreaterThan(600);
  expect(grid.gap).toBe("38.4px");
  const card = page.locator(".latest-card").first();
  const arrow = card.locator("[data-arrow]");
  await expect(card.locator(".latest-mobile-tags")).toBeHidden();
  await expect(card.locator(".latest-desktop-tags .tag-pill")).toHaveCount(3);
  await expect(card).toHaveCSS("box-shadow", /2px 6px 0px 0px/);
  await expect(card).toHaveCSS("transition-duration", "0.3s");
  await expect(arrow).toHaveCSS("opacity", "0");
  await expect(arrow).toHaveCSS("bottom", "-12px");
  await expect(arrow).toHaveCSS("height", "8px");
  await card.hover();
  await expect(card).toHaveCSS("box-shadow", /2px 16px 0px 0px/);
  await expect(arrow).toHaveCSS("opacity", "1");
  await expect(arrow).toHaveCSS(
    "clip-path",
    "polygon(0% 35%, 99% 35%, 99% 0px, 100% 50%, 99% 100%, 99% 65%, 0% 65%)",
  );
  await page.screenshot({
    path: testInfo.outputPath("home-hover.png"),
    fullPage: true,
  });
});

test("phone cards use a single column and show the tag count", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const columns = await page
    .locator(".latest-grid")
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" "));
  expect(columns).toHaveLength(1);
  await expect(page.locator(".latest-desktop-tags").first()).toBeHidden();
  await expect(page.locator(".latest-mobile-tags").first()).toBeVisible();
});
