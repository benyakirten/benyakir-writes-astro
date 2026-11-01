import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`author covers retain source grid flow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/author/");
    const cards = page.locator(".author-card");
    await expect(cards).toHaveCount(5);
    for (const card of await cards.all()) {
      const image = card.locator(".author-cover img");
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute("width", /^\d+$/);
      await expect(image).toHaveAttribute("height", /^\d+$/);
      await expect(image).toHaveJSProperty("complete", true);
      const flow = await card.evaluate((element) => {
        const cover = element.querySelector<HTMLImageElement>(".author-cover img")!;
        const wrapper = cover.parentElement!;
        const imageBox = cover.getBoundingClientRect();
        const date = element.querySelector(".author-date")!.getBoundingClientRect();
        const summary = element.querySelector(".author-summary")!.getBoundingClientRect();
        return {
          columns: getComputedStyle(element).gridTemplateColumns.split(" ").map(Number.parseFloat),
          row: getComputedStyle(wrapper).gridRow,
          width: imageBox.width,
          height: imageBox.height,
          ratio: cover.naturalWidth / cover.naturalHeight,
          dateTop: date.top,
          summaryBottom: summary.bottom,
          imageBottom: imageBox.bottom,
          story: element.classList.contains("is-story"),
        };
      });
      expect(flow.columns).toHaveLength(2);
      expect(flow.columns[1]).toBe(67);
      expect(flow.row).toBe("1 / 4");
      expect(flow.width).toBeLessThanOrEqual(67);
      expect(flow.height).toBeLessThanOrEqual(flow.story ? 100 : 200);
      expect(flow.width / flow.height).toBeCloseTo(flow.ratio, 2);
      expect(flow.dateTop).toBeGreaterThanOrEqual(flow.summaryBottom);
      expect(flow.dateTop).toBeGreaterThanOrEqual(flow.imageBottom - 1);
    }
    const story = page.locator(
      'a[href="/story/non-sequitur-a-pre-chapter-to-the-human-automata/"]',
    );
    await expect(story.locator(".story-type")).toHaveText("Pre-chapter to The Human Automata");
    await expect(story.locator(".author-summary")).toContainText(
      "He was the last human in the factory",
    );
  });

  test(`book cover and metadata follow the source order at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const slug of ["the-human-automata", "delusions-of-form", "the-new-mediocrity"]) {
      await page.goto(`/book/${slug}/`);
      const cover = page.locator(".book-cover img");
      await expect(cover).toBeVisible();
      await expect(cover).toHaveJSProperty("complete", true);
      const geometry = await page.locator(".book-page").evaluate((element) => {
        const cover = element.querySelector<HTMLImageElement>(".book-cover img")!;
        const image = cover.getBoundingClientRect();
        const article = element.getBoundingClientRect();
        const header = element.querySelector("header")!.getBoundingClientRect();
        return {
          width: image.width,
          expectedWidth: Math.min(400, article.width),
          center: image.left + image.width / 2,
          expectedCenter: article.left + article.width / 2,
          gap: header.top - image.bottom,
          ratio: image.width / image.height,
          naturalRatio: cover.naturalWidth / cover.naturalHeight,
          order: [...element.children].map((child) => child.className),
        };
      });
      expect(geometry.width).toBeCloseTo(geometry.expectedWidth, 1);
      expect(geometry.center).toBeCloseTo(geometry.expectedCenter, 1);
      expect(geometry.gap).toBeCloseTo(25.6, 1);
      expect(geometry.ratio).toBeCloseTo(geometry.naturalRatio, 2);
      expect(geometry.order.slice(0, 3)).toEqual(["book-cover", "book-header", "book-content"]);
      await expect(page.locator(".book-header time")).toContainText("Published:");
      await expect(page.locator(".purchase-links")).toContainText(
        "Available for purchase on Amazon",
      );
      const sections = page.locator(".book-content > li > section");
      await expect(sections.locator("h2")).toHaveText(["Cover Designer", "Blurb"]);
      await expect(sections.first().locator("a[rel=external]").first()).toBeVisible();
      await expect(page.locator(".wp-content p").first()).not.toBeEmpty();
    }
  });
}

test("the book cover reserves its aspect ratio before the image downloads", async ({ page }) => {
  let release!: () => void;
  const images = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/wp-content/uploads/**", async (route) => {
    await images;
    await route.continue();
  });
  try {
    await page.goto("/book/the-human-automata/", {
      waitUntil: "domcontentloaded",
    });
    const cover = page.locator(".book-cover img");
    const reserved = await cover.evaluate((element) => {
      const image = element as HTMLImageElement;
      const bounds = image.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height,
        expectedRatio: Number(image.getAttribute("width")) / Number(image.getAttribute("height")),
        loaded: image.naturalWidth,
      };
    });
    expect(reserved.loaded).toBe(0);
    expect(reserved.width).toBe(400);
    expect(reserved.height).toBeGreaterThan(0);
    expect(reserved.width / reserved.height).toBeCloseTo(reserved.expectedRatio, 2);
    release();
    await expect(cover).toHaveJSProperty("complete", true);
    const loaded = await cover.boundingBox();
    expect(loaded?.height).toBeCloseTo(reserved.height, 1);
  } finally {
    release();
  }
});

test("author templates preserve source flow, designer links, and the full story", async ({
  page,
}) => {
  await page.goto("/book/delusions-of-form/");
  await expect(page.locator(".designer-name")).toHaveText("Artist: Mais Ahmad");
  await expect(page.locator(".designer-details a")).toHaveText(["Behance", "Instagram"]);
  await expect(page.locator(".related, .latest-card")).toHaveCount(0);
  const bookOrder = await page
    .locator(".book-page")
    .evaluate((element) => [...element.children].map((child) => child.className));
  expect(bookOrder).toEqual(["book-cover", "book-header", "book-content"]);
  await page.goto("/story/the-human-error/");
  await expect(page.locator(".book-relationship")).toHaveText("Prechapter to Delusions of Form");
  await expect(page.locator(".story-header time")).toHaveText("Published: July 19, 2021");
  const content = page.locator(".story-content");
  await expect(content.locator("p").first()).toContainText("That’s a doozy");
  await expect(content.locator("p")).toHaveCount(83);
  await expect(content.locator("p").last()).toContainText(
    "Best pass it off. Let it be someone else’s problem.",
  );
  await expect(page.locator('.book-relationship a[href="/book/delusions-of-form/"]')).toHaveText(
    "Delusions of Form",
  );
  await expect(page.locator(".related, .latest-card")).toHaveCount(0);
  const order = await page
    .locator(".story-page")
    .evaluate((element) => [...element.children].map((child) => child.className));
  expect(order).toEqual(["story-header", "story-content wp-content"]);
});
