import { expect, test } from "@playwright/test";

for (const width of [1920, 2560]) {
  test(`large ${width}px screens show three cards across`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1080 });
    for (const route of ["/", "/projects/", "/author/"]) {
      await page.goto(route);
      const columns = await page
        .locator(".latest-grid")
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" "));
      expect(columns).toHaveLength(3);
      if (route === "/" && width === 1920) {
        await page.screenshot({ path: testInfo.outputPath("home-wide.png") });
      }
    }
  });
}

test("wider sidebar contains the entire wheel and rotates it in both directions of travel", async ({
  page,
}) => {
  await page.goto("/");
  const sidebar = page.getByRole("navigation", { name: "Main navigation" });
  const wheel = sidebar.locator(".sidebar-logo img");
  const collapsed = await sidebar.boundingBox();
  const logo = await wheel.boundingBox();
  if (!collapsed || !logo) throw new Error("Sidebar and wheel must have rendered bounds");
  expect(collapsed.x + collapsed.width).toBeCloseTo(64, 0);
  expect(logo.x).toBeGreaterThanOrEqual(0);
  expect(logo.x + logo.width).toBeLessThan(collapsed.x + collapsed.width);
  const original = await wheel.evaluate((element) => getComputedStyle(element).transform);
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await expect(sidebar).toHaveCSS("--wheel-angle", "-90deg");
  await expect.poll(() => wheel.evaluate((element) => element.getAnimations().length)).toBe(0);
  const opened = await wheel.evaluate((element) => getComputedStyle(element).transform);
  expect(opened).not.toBe(original);
  await page.getByRole("button", { name: "Close navigation", exact: true }).click();
  await expect(sidebar).toHaveCSS("--wheel-angle", "-180deg");
  await expect.poll(() => wheel.evaluate((element) => element.getAnimations().length)).toBe(0);
  expect(await wheel.evaluate((element) => getComputedStyle(element).transform)).not.toBe(opened);
  const closedLogo = await wheel.boundingBox();
  if (!closedLogo) throw new Error("Wheel must remain visible after closing");
  expect(closedLogo.x).toBeGreaterThanOrEqual(0);
  expect(closedLogo.x + closedLogo.width).toBeLessThan(64);
});

for (const route of ["/projects/", "/author/"]) {
  test(`${route} uses specialized whole-card links, badges or covers, and hover arrows`, async ({
    page,
  }, testInfo) => {
    await page.goto(route);
    await expect(page.locator(".content-card")).toHaveCount(0);
    const card = page.locator(".latest-card").first();
    await expect(card).toBeVisible();
    if (route === "/projects/") {
      await expect(card).toHaveClass(/project-card/);
      await expect(card.locator(".tech-pill").first()).toBeVisible();
    } else {
      await expect(card).toHaveClass(/author-card/);
      await expect(page.locator(".author-cover img").first()).toBeVisible();
    }
    const bounds = await card.boundingBox();
    if (!bounds) throw new Error("Card must be visible");
    expect(bounds.x).toBeGreaterThanOrEqual(80);
    expect(bounds.y).toBeGreaterThan(32);
    await card.hover();
    await expect(card).toHaveCSS("box-shadow", /2px 16px 0px 0px/);
    await expect(card.locator("[data-arrow]")).toHaveCSS("opacity", "1");
    await expect(card.locator("[data-arrow]")).toHaveCSS(
      "clip-path",
      "polygon(0% 35%, 99% 35%, 99% 0px, 100% 50%, 99% 100%, 99% 65%, 0% 65%)",
    );
    const link = page.locator(".latest-card-link").first();
    const destination = new URL((await link.getAttribute("href")) ?? "/", page.url()).href;
    await page.screenshot({ path: testInfo.outputPath("listing.png") });
    await link.click({
      position: { x: bounds.width - 8, y: bounds.height - 8 },
    });
    await expect(page).toHaveURL(destination);
  });
}

for (const route of [
  "/post/the-writers-ide-part-4-pagination-and-blocking-the-main-thread/",
  "/project/array-stream-plus/",
  "/book/the-human-automata/",
  "/story/the-human-error/",
]) {
  test(`${route} has shared page margins`, async ({ page }) => {
    await page.goto(route);
    const bounds = await page.locator(".article").boundingBox();
    if (!bounds) throw new Error("Article must have rendered bounds");
    expect(bounds.x).toBeGreaterThanOrEqual(80);
    expect(bounds.y).toBeGreaterThanOrEqual(32);
  });
}

test("listing pages retain their margins without horizontal overflow on smaller screens", async ({
  page,
}) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/", "/projects/", "/author/", "/portfolio/"]) {
      await page.goto(route);
      const layout = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(layout.document, `${route} at ${width}px`).toBeLessThanOrEqual(layout.viewport);
    }
  }
});

test("portfolio restores working source-style tabs and project cards", async ({ page }) => {
  await page.goto("/portfolio/");
  await page.getByRole("tab", { name: "Recent Projects" }).click();
  await expect(
    page.getByRole("tabpanel", { name: "Recent Projects" }).locator(".project-card").first(),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Work History" }).click();
  await expect(page.getByRole("tabpanel", { name: "Work History" })).toContainText(
    "Independent Contractor",
  );
  await page.getByRole("tab", { name: "About Me" }).click();
  await expect(page.getByRole("tabpanel", { name: "About Me" })).toBeVisible();
});
