import { expect, test } from "@playwright/test";

const slugs = [
  "the-writers-ide-part-1-writing-some-git-functionality-in-rust",
  "the-writers-ide-part-2-a-latex-parser",
  "the-writers-ide-part-3-researching-popular-document-file-formats",
  "the-writers-ide-part-4-pagination-and-blocking-the-main-thread",
];

test("each installment has an ordered series list and correct neighbors", async ({ page }) => {
  for (const [index, slug] of slugs.entries()) {
    await page.goto(`/post/${slug}/`);
    const overview = page.getByRole("navigation", {
      name: "Post series",
      exact: true,
    });
    await expect(overview).toContainText(`Part ${index + 1} of 4`);
    await overview.locator("summary").click();
    const links = overview.getByRole("link");
    await expect(links).toHaveCount(4);
    for (const [position, target] of slugs.entries()) {
      await expect(links.nth(position)).toHaveAttribute("href", `/post/${target}/`);
    }
    await expect(overview.locator('[aria-current="page"]')).toHaveAttribute(
      "href",
      `/post/${slug}/`,
    );
    const adjacent = page.getByRole("navigation", {
      name: "Series previous and next",
    });
    await expect(adjacent.locator('[rel="prev"]')).toHaveCount(index > 0 ? 1 : 0);
    await expect(adjacent.locator('[rel="next"]')).toHaveCount(index < 3 ? 1 : 0);
    if (index > 0)
      await expect(adjacent.locator('[rel="prev"]')).toHaveAttribute(
        "href",
        `/post/${slugs[index - 1]}/`,
      );
    if (index < 3)
      await expect(adjacent.locator('[rel="next"]')).toHaveAttribute(
        "href",
        `/post/${slugs[index + 1]}/`,
      );
  }
});

test("series accordion interpolates its intrinsic size when opening and closing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(`/post/${slugs[0]}/`);
  const supported = await page.evaluate(
    () =>
      CSS.supports("interpolate-size", "allow-keywords") &&
      CSS.supports("transition-behavior", "allow-discrete") &&
      CSS.supports("selector(details::details-content)"),
  );
  test.skip(!supported, "Browser uses the native non-animated details fallback");
  const details = page.locator(".series-navigation details");
  const sizes = await details.evaluate(async (element: HTMLDetailsElement) => {
    const size = () => Number.parseFloat(getComputedStyle(element, "::details-content").blockSize);
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    async function toggle(open: boolean) {
      element.open = open;
      const samples: { size: number; visibility: string }[] = [];
      const start = performance.now();
      do {
        await frame();
        samples.push({
          size: size(),
          visibility: getComputedStyle(element, "::details-content").contentVisibility,
        });
      } while (performance.now() - start < 450);
      return { samples, end: size() };
    }
    const initial = size();
    const opening = await toggle(true);
    const closing = await toggle(false);
    return { initial, opening, closing };
  });
  expect(sizes.initial).toBe(0);
  expect(sizes.opening.end).toBeGreaterThan(0);
  for (const transition of [sizes.opening, sizes.closing]) {
    const intermediate = transition.samples.filter(
      (sample) => sample.size > 0 && sample.size < sizes.opening.end,
    );
    expect(intermediate.length).toBeGreaterThan(1);
    expect(intermediate.every((sample) => sample.visibility === "visible")).toBe(true);
  }
  expect(sizes.closing.end).toBe(0);
  await expect(details.getByRole("link").first()).toBeHidden();
});

test("series accordion respects reduced motion and retains native keyboard behavior", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/post/${slugs[0]}/`);
  const details = page.locator(".series-navigation details");
  await details.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(details.getByRole("link").last()).toBeVisible();
  expect(
    await details.evaluate(
      (element) => getComputedStyle(element, "::details-content").transitionDuration,
    ),
  ).toBe("0s");
  await page.keyboard.press("Enter");
  await expect(details.getByRole("link").first()).toBeHidden();
});

test("unrelated posts have no series navigation", async ({ page }) => {
  await page.goto("/post/a-little-javascript-library-i-published/");
  await expect(page.getByRole("navigation", { name: "Post series", exact: true })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Series previous and next" })).toHaveCount(0);
});

test("series navigation works on mobile without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto(`/post/${slugs[0]}/`);
  const overview = page.getByRole("navigation", {
    name: "Post series",
    exact: true,
  });
  await overview.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(overview.getByRole("link").nth(3)).toBeVisible();
  await overview.getByRole("link").nth(3).click();
  await expect(page).toHaveURL(`/post/${slugs[3]}/`);
  const previous = page.getByRole("link", { name: /Previous in series/ });
  await previous.click();
  await expect(page).toHaveURL(`/post/${slugs[2]}/`);
  const bounds = await page
    .getByRole("navigation", { name: "Series previous and next" })
    .boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  await context.close();
});
