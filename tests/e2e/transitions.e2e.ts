import { expect, test, type Page } from "@playwright/test";

const post =
  "/post/the-writers-ide-part-4-pagination-and-blocking-the-main-thread/";

async function checkChrome(page: Page) {
  const toggle = page.locator("[data-sidebar-toggle]");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Shift+?");
  await expect(page.locator("[data-shortcuts-dialog]")).toBeVisible();
  await page.keyboard.press("Shift+?");
  await expect(page.locator("[data-shortcuts-dialog]")).toBeHidden();
  await page.keyboard.press("ControlOrMeta+/");
  const search = page.getByRole("dialog", { name: "Site search" });
  await expect(search).toBeVisible();
  await search.getByRole("searchbox").fill("javascript");
  await expect(search.locator(".search-result").first()).toBeVisible();
  await search
    .getByRole("button", { name: "Close search", exact: true })
    .click();
}

test("client navigation updates metadata and history and reinitializes site controls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.set(window, "navigationMarker", "same-document");
    Reflect.set(window, "pageLoads", 0);
    document.addEventListener("astro:page-load", () => {
      Reflect.set(
        window,
        "pageLoads",
        Number(Reflect.get(window, "pageLoads")) + 1,
      );
    });
  });
  await page.locator(`.latest-card-link[href="${post}"]`).click();
  await expect(page).toHaveURL(post);
  await expect(page.locator(".article h1")).toContainText("part 4");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://www.benyakir-writes.com${post}`,
  );
  await expect(page).toHaveTitle(/part 4/);
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "pageLoads")))
    .toBe(1);
  await checkChrome(page);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Latest Posts", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "pageLoads")))
    .toBe(2);
  await checkChrome(page);
  await page.goForward();
  await expect(page).toHaveURL(post);
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, "pageLoads")))
    .toBe(3);
  await checkChrome(page);
  expect(
    await page.evaluate(() => Reflect.get(window, "navigationMarker")),
  ).toBe("same-document");
  expect(errors).toEqual([]);
});

test("portfolio tabs work after entering and revisiting through client navigation", async ({
  page,
}) => {
  await page.goto("/");
  for (let visit = 0; visit < 2; visit++) {
    await page.locator("[data-sidebar-toggle]").click();
    await page.getByRole("link", { name: "Portfolio", exact: true }).click();
    await expect(
      page.getByRole("tab", { name: "About Me", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: "Work History", exact: true }).click();
    await expect(
      page.getByRole("tabpanel", { name: "Work History", exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/section=history/);
    await page.locator("[data-sidebar-toggle]").click();
    await page.getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL("/");
  }
});

test("client navigation falls back when native view transitions are unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "startViewTransition", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("/");
  await page.evaluate(() =>
    Reflect.set(window, "navigationMarker", "fallback"),
  );
  await page.locator(`.latest-card-link[href="${post}"]`).click();
  await expect(
    page.getByRole("navigation", { name: "Post series", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => Reflect.get(window, "navigationMarker")),
  ).toBe("fallback");
  await checkChrome(page);
});

test("reduced-motion navigation disables view transition animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(`.latest-card-link[href="${post}"]`).click();
  await expect(page).toHaveURL(post);
  const animations = await page.evaluate(() => {
    return document.getAnimations().filter((animation) => {
      const effect = animation.effect;
      return (
        effect instanceof KeyframeEffect &&
        effect.pseudoElement?.startsWith("::view-transition")
      );
    }).length;
  });
  expect(animations).toBe(0);
  await checkChrome(page);
});

test("ordinary navigation remains available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await page.locator(`.latest-card-link[href="${post}"]`).click();
  await expect(page).toHaveURL(post);
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Blog", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Latest Posts", exact: true }),
  ).toBeVisible();
  await context.close();
});
