import { describe, expect, it } from "vitest";
import { search, type SearchDataset } from "../../src/lib/search/search";
import { Trie } from "../../src/lib/search/trie";

const dataset: SearchDataset = {
  books: [
    { type: "book", slug: "book", title: "The Book", content: "A story", meta: { novel: true } },
  ],
  stories: [{ type: "story", slug: "story", title: "A Story", content: "Once", meta: {} }],
  projects: [
    {
      type: "project",
      slug: "project",
      title: "Site",
      content: "Astro project",
      meta: { astro: true },
    },
  ],
  posts: [
    {
      type: "post",
      slug: "post",
      title: "Notes",
      excerpt: "about TypeScript",
      categories: ["Writing"],
      tags: ["Astro"],
      meta: {},
    },
  ],
  pages: [{ title: "Blog", slug: "/blog/", description: "Read articles" }],
};

describe("global search compatibility", () => {
  it("returns null for an empty query and OR-matches space-delimited words", () => {
    expect(search("", dataset)).toBeNull();
    expect(search("typescript novel", dataset)?.posts.map((item) => item.slug)).toEqual(["post"]);
    expect(search("typescript novel", dataset)?.books.map((item) => item.slug)).toEqual(["book"]);
  });

  it("matches page descriptions, metadata, and category/tag substrings", () => {
    expect(search("articles", dataset)?.pages).toHaveLength(1);
    expect(search("ASTRO", dataset)?.projects).toHaveLength(1);
    expect(search("writ", dataset)?.posts).toHaveLength(1);
  });

  it("preserves the legacy empty-token broad-match behavior", () => {
    expect(search(" ", dataset)?.posts).toHaveLength(1);
  });
});

describe("trie suggestions", () => {
  it("omits the exact prefix but returns descendants ordered by weight", () => {
    const trie = new Trie([
      ["cat", 50],
      ["catalog", 2],
      ["catapult", 9],
      ["dog", 1],
    ]);
    expect(trie.suggest("cat")).toEqual([
      { word: "catapult", weight: 9 },
      { word: "catalog", weight: 2 },
    ]);
  });

  it("uses stable vocabulary order for equal Levenshtein distances and caps at five", () => {
    const trie = new Trie([
      ["cat", 1],
      ["bat", 100],
      ["hat", 4],
      ["rat", 2],
      ["mat", 8],
      ["sat", 3],
    ]);
    expect(trie.getClosestLevenshteinSuggestions("dat")).toEqual([
      "cat",
      "bat",
      "hat",
      "rat",
      "mat",
    ]);
  });

  it("uses ordinary edit distance without treating transposition as a single edit", () => {
    const trie = new Trie();
    expect(trie.getLevenshteinDistance("ab", "ba")).toBe(2);
  });
});
