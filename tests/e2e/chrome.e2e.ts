import { expect, test } from "@playwright/test";

async function openSidebar(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await expect.poll(async () => (await page.locator("[data-sidebar]").boundingBox())?.x).toBe(0);
  await expect
    .poll(() =>
      page.locator(".sidebar-logo img").evaluate((element) => element.getAnimations().length),
    )
    .toBe(0);
}

test("source SVG icons have explicit 24px dimensions in the sidebar and search", async ({
  page,
}) => {
  await page.goto("/");
  await openSidebar(page);
  const wheel = await page.locator(".sidebar-logo img").boundingBox();
  expect(wheel?.width).toBeCloseTo(25.6, 1);
  expect(wheel?.height).toBeCloseTo(25.6, 1);
  for (const selector of [
    "[data-search-open] svg",
    "[data-shortcuts-open] svg",
    ".sidebar-arrow svg",
  ]) {
    await expect(page.locator(selector)).toHaveCSS("width", "24px");
    await expect(page.locator(selector)).toHaveCSS("height", "24px");
  }
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Site search" });
  await dialog.getByRole("searchbox", { name: "Search this site" }).fill("java");
  await expect(dialog.locator(".search-group-eye svg").first()).toBeVisible();
  for (const selector of [".search-icon svg", ".search-close svg", ".search-group-eye svg"]) {
    await expect(dialog.locator(selector).first()).toHaveCSS("width", "24px");
    await expect(dialog.locator(selector).first()).toHaveCSS("height", "24px");
  }
});

test("an early search shortcut is queued until the island hydrates", async ({ page }) => {
  let release!: () => void;
  const hydration = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/_astro/SearchIsland.*.js", async (route) => {
    await hydration;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.keyboard.press("ControlOrMeta+/");
    await expect(page.locator("html")).toHaveAttribute("data-pending-site-search", "true");
    release();
    await expect(page.getByRole("dialog", { name: "Site search" })).toBeVisible();
    await page.getByRole("searchbox", { name: "Search this site" }).fill("java");
    await expect(page.locator(".search-completion")).toHaveAttribute("data-suggestion", "script");
  } finally {
    release();
  }
});

test("typeahead is drawn after the typed prefix and supports Tab, Enter, and Escape", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+/");
  const dialog = page.getByRole("dialog", { name: "Site search" });
  const input = dialog.getByRole("searchbox", { name: "Search this site" });
  await input.fill("java");
  const completion = dialog.locator(".search-completion");
  await expect(completion).toHaveAttribute("data-suggestion", "script");
  await expect
    .poll(() => completion.evaluate((element) => getComputedStyle(element, "::after").visibility))
    .toBe("visible");
  await expect
    .poll(() => completion.evaluate((element) => getComputedStyle(element, "::after").content))
    .toBe('"script"');
  await page.evaluate(() => document.fonts.ready);
  const geometry = await input.evaluate((element) => {
    const input = element as HTMLInputElement;
    const wrapper = input.parentElement!;
    const mirror = wrapper.querySelector(".search-completion")!;
    const range = document.createRange();
    range.selectNodeContents(mirror);
    const text = range.getBoundingClientRect();
    const inputBox = input.getBoundingClientRect();
    return {
      inputWidth: inputBox.width,
      wrapperWidth: wrapper.getBoundingClientRect().width,
      prefixLeft: text.left,
      inputLeft: inputBox.left,
      suffixLeft: mirror.getBoundingClientRect().right,
      prefixRight: text.right,
    };
  });
  expect(geometry.inputWidth).toBeCloseTo(geometry.wrapperWidth, 1);
  expect(geometry.prefixLeft).toBeCloseTo(geometry.inputLeft, 1);
  expect(geometry.suffixLeft).toBeCloseTo(geometry.prefixRight, 1);
  await expect(dialog.locator(".search-groups")).toBeVisible();
  await dialog.screenshot({ path: testInfo.outputPath("autocomplete.png") });
  await input.press("Tab");
  await expect(input).toHaveValue("javascript");
  await input.fill("pyth");
  await expect(completion).toHaveAttribute("data-suggestion", "on");
  await input.press("Enter");
  await expect(input).toHaveValue("python");
  await input.press("Escape");
  await expect(input).toHaveValue("");
  await expect(dialog).toBeVisible();
  await input.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("sidebar background clicks toggle it while controls do not", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.locator("[data-sidebar]");
  await page.mouse.click(32, 100);
  await expect(sidebar).toHaveClass(/open/);
  await expect.poll(async () => (await sidebar.boundingBox())?.x).toBe(0);
  await page.mouse.click(210, 100);
  await expect(sidebar).not.toHaveClass(/open/);
  await expect.poll(async () => (await sidebar.boundingBox())?.x).toBe(-176);
  await page.mouse.click(32, 100);
  await expect(sidebar).toHaveClass(/open/);
  const angle = await sidebar.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--wheel-angle"),
  );
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Site search" })).toBeVisible();
  await expect(sidebar).toHaveClass(/open/);
  await page.getByRole("button", { name: "Close search", exact: true }).click();
  await page.getByRole("button", { name: "Shortcuts", exact: true }).click();
  await expect(page.locator("[data-shortcuts-dialog]")).toBeVisible();
  await expect(sidebar).toHaveClass(/open/);
  await page.getByRole("button", { name: "Close shortcuts", exact: true }).click();
  const author = page.getByRole("link", { name: "Author", exact: true });
  await author.evaluate((element) =>
    element.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    }),
  );
  await author.click();
  await expect(sidebar).toHaveClass(/open/);
  expect(
    await sidebar.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--wheel-angle"),
    ),
  ).toBe(angle);
});

test("search and shortcut underlines animate on hover and focus", async ({ page }) => {
  await page.goto("/");
  await openSidebar(page);
  for (const name of ["Search", "Shortcuts"]) {
    const button = page.getByRole("button", { name, exact: true });
    await page.mouse.move(800, 800);
    await expect(button).toHaveCSS("background-size", "0px 2px");
    await expect(button).toHaveCSS("transition-property", "background-size");
    await expect(button).toHaveCSS("transition-duration", "0.3s");
    await button.hover();
    await expect
      .poll(() => button.evaluate((element) => element.getAnimations().length))
      .toBeGreaterThan(0);
    await expect(button).toHaveCSS("background-size", "100% 2px");
    await expect(button).toHaveCSS("text-decoration-line", "none");
    await page.mouse.move(800, 800);
    await expect(button).toHaveCSS("background-size", "0px 2px");
    await button.focus();
    await expect(button).toHaveCSS("background-size", "100% 2px");
    await button.evaluate((element) => (element as HTMLButtonElement).blur());
  }
});

test("critical self-hosted fonts are preloaded once and reused by the stylesheet", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(".woff2")) requests.push(request.url());
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const preload = page.locator('link[rel="preload"][as="font"]');
  await expect(preload).toHaveCount(4);
  for (const link of await preload.all()) {
    await expect(link).toHaveAttribute("crossorigin", "anonymous");
    await expect(link).toHaveAttribute("type", "font/woff2");
    const url = new URL((await link.getAttribute("href")) ?? "", page.url()).href;
    expect(new URL(url).pathname).toMatch(/^\/_astro\/.*\.woff2$/);
    expect(requests.filter((request) => request === url)).toHaveLength(1);
  }
  const loaded = await page.evaluate(() =>
    ["400 16px Faustina", "700 16px Faustina", "400 16px Mulish", "700 16px Mulish"].every((font) =>
      document.fonts.check(font),
    ),
  );
  expect(loaded).toBe(true);
});
