import { readdir, readFile } from "node:fs/promises";
import { parse } from "yaml";
import { expect, it } from "vitest";

it("prefixes every post filename with its publication date and keeps IDs unique", async () => {
  const directory = new URL("../../src/content/posts/", import.meta.url);
  const files = (await readdir(directory)).filter((file) => /\.(md|mdx)$/.test(file));
  expect(files.length).toBeGreaterThan(0);
  const slugs = new Set<string>();
  for (const file of files) {
    const source = await readFile(new URL(file, directory), "utf8");
    const match = source.match(/^---\s*\n([\s\S]*?)\n---/);
    expect(match, file).not.toBeNull();
    const data = parse(match![1]);
    expect(data.published, file).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(file, file).toBe(
      `${data.published}-${data.slug}.${file.endsWith(".mdx") ? "mdx" : "md"}`,
    );
    expect(slugs.has(data.slug), `Duplicate post slug: ${data.slug}`).toBe(false);
    slugs.add(data.slug);
  }
});
