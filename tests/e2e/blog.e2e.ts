import { expect, test } from "@playwright/test";

test("the former blog URL redirects to the single home listing", async ({
  page,
}) => {
  await page.goto("/blog/");
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Latest Posts" }),
  ).toBeVisible();
  await expect(page.locator(".latest-card-link")).toHaveCount(12);
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Blog", exact: true }),
  ).toHaveAttribute("href", "/");
});

test("post table-of-contents links animate their underline on hover and keyboard focus", async ({
  page,
}) => {
  await page.goto("/post/a-little-javascript-library-i-published/");
  const link = page.locator('.article a[href^="#"]').first();
  await expect(link).toHaveCSS("background-size", "0px 2px");
  await expect(link).toHaveCSS("transition-property", "background-size");
  await expect(link).toHaveCSS("transition-duration", "0.3s");

  await link.hover();
  await expect(link).toHaveCSS("background-size", "100% 2px");
  await page.mouse.move(0, 0);
  await expect(link).toHaveCSS("background-size", "0px 2px");
  await page.keyboard.press("Tab");
  await link.focus();
  await expect(link).toHaveCSS("background-size", "100% 2px");
});

test("table-of-contents lists are numbered without changing ordinary bullet lists", async ({
  page,
}) => {
  await page.goto("/post/converting-my-blog/");
  const contents = page.locator(".article #table-of-contents + ul");
  await expect(contents).toHaveCSS("list-style-type", "decimal");
  await expect(contents.locator("li").first()).toHaveCSS(
    "list-style-type",
    "decimal",
  );
  const ordinaryList = page.locator(".article > ul").nth(1);
  await expect(ordinaryList).toHaveCSS("list-style-type", "none");

  await page.goto("/post/the-writers-ide-part-2-a-latex-parser/");
  await expect(page.locator(".article > ul").first()).toHaveCSS(
    "list-style-type",
    "decimal",
  );
});

test("clicking card padding navigates to the post", async ({ page }) => {
  await page.goto("/");
  const link = page.locator(".latest-card-link").first();
  const destination = new URL(
    (await link.getAttribute("href")) ?? "/",
    page.url(),
  ).href;
  const bounds = await link.boundingBox();
  if (!bounds) throw new Error("Blog card has no rendered bounds");
  await link.click({ position: { x: bounds.width - 8, y: bounds.height - 8 } });
  await expect(page).toHaveURL(destination);
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Blog" }),
  ).toHaveAttribute("href", "/");
});
