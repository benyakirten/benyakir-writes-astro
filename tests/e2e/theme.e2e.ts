import { expect, test } from "@playwright/test";

test("initial dark system preference applies across pages without a manual theme control", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("benyakir-theme-preference", "light"));
  await page.emulateMedia({ colorScheme: "dark" });
  for (const route of ["/", "/projects/", "/author/", "/portfolio/"]) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    await expect(page.locator("html")).toHaveCSS("color", "rgb(202, 209, 226)");
    await expect(page.locator("html")).toHaveCSS("background-color", "rgb(17, 27, 50)");
    await expect(page.locator(".theme-control, [data-theme-select]")).toHaveCount(0);
    await expect(page.locator(".sidebar-logo img")).toHaveCSS("filter", "invert(1)");
    if (route !== "/portfolio/") {
      await expect(page.locator(".latest-card").first()).toHaveCSS(
        "background-color",
        route === "/author/" ? "rgba(0, 0, 0, 0)" : "rgb(17, 27, 50)",
      );
      await expect(page.locator(".latest-card").first()).toHaveCSS("color", "rgb(202, 209, 226)");
    }
  }
});

test("system preference updates cards, gradients, badges, and icons live without reloading", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const colors = () =>
    page.evaluate(() => {
      const style = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing ${selector}`);
        return getComputedStyle(element);
      };
      return {
        page: style(".site-main").backgroundImage,
        sidebar: style(".sidebar").backgroundImage,
        card: style(".latest-card").backgroundColor,
        shadow: style(".latest-card").boxShadow,
        arrow: style(".latest-card-arrow").backgroundColor,
        pill: style(".tag-pill").backgroundColor,
        heading: style(".lead-heading").backgroundImage,
        wheel: style(".sidebar-logo img").filter,
      };
    });
  const waitForCardTransition = () =>
    expect
      .poll(() =>
        page
          .locator(".latest-card")
          .first()
          .evaluate((element) => element.getAnimations().length),
      )
      .toBe(0);
  const light = await colors();
  await page.evaluate(() => {
    document.documentElement.dataset.themeTestMarker = "preserved";
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await waitForCardTransition();
  const dark = await colors();
  for (const key of Object.keys(light) as (keyof typeof light)[]) {
    expect(dark[key], key).not.toBe(light[key]);
  }
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await waitForCardTransition();
  expect(await colors()).toEqual(light);
  await expect(page.locator("html")).toHaveAttribute("data-theme-test-marker", "preserved");
});

test("author publication dates and calendar icons follow the page text color in both themes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/author/");
  const dates = page.locator(".author-date");
  expect(await dates.count()).toBeGreaterThan(0);
  for (const colorScheme of ["dark", "light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    const textColor = await page
      .locator("html")
      .evaluate((element) => getComputedStyle(element).color);
    for (const date of await dates.all()) {
      await expect(date).toHaveCSS("color", textColor);
      await expect(date.locator("time")).toHaveCSS("color", textColor);
      await expect(date.locator("svg")).toHaveCSS("stroke", textColor);
    }
  }
});

test("portfolio tab colors follow live system preference changes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/portfolio/");
  const tabs = page.getByRole("tablist", { name: "Portfolio Sections" });
  const light = await tabs.evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect
    .poll(() => tabs.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(light);
  await expect(tabs.locator('[aria-selected="true"]')).toHaveCSS("color", "rgb(202, 209, 226)");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(tabs).toHaveCSS("background-color", light);
});

test("Shiki dual-theme markup follows the system without overriding its inline light colors", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  // Isolate the CSS contract from the imported article corpus using Shiki-shaped markup.
  await page.locator(".page-content").evaluate((element) => {
    element.insertAdjacentHTML(
      "beforeend",
      '<pre class="astro-code" data-code-theme-test style="background-color:#fff;color:#24292e;--shiki-dark:#e1e4e8;--shiki-dark-bg:#24292e"><code><span style="color:#d73a49;--shiki-dark:#f97583">const</span></code></pre>',
    );
  });
  const code = page.locator("[data-code-theme-test]");
  const keyword = code.locator("span");
  await expect(code).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(keyword).toHaveCSS("color", "rgb(215, 58, 73)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(code).toHaveCSS("background-color", "rgb(36, 41, 46)");
  await expect(keyword).toHaveCSS("color", "rgb(249, 117, 131)");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(keyword).toHaveCSS("color", "rgb(215, 58, 73)");
});
