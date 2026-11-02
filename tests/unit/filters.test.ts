import { describe, expect, it } from "vitest";
import {
  applyTextFilters,
  buildTextFilters,
  filterByDate,
  filterByKeywords,
  filterBySearch,
} from "../../src/lib/filters/filter";
import { getPage } from "../../src/lib/filters/pagination";
import {
  deserializeFromQueryParams,
  serializeToQueryParams,
  parseQueryState,
} from "../../src/lib/filters/queries";

const items = [
  {
    title: "Astro notes",
    tags: ["web"],
    date: new Date("2024-01-01T12:00:00Z"),
  },
  {
    title: "TypeScript guide",
    tags: ["web", "code"],
    date: new Date("2024-01-10T12:00:00Z"),
  },
  {
    title: "Travel",
    tags: ["writing"],
    date: new Date("2024-02-01T12:00:00Z"),
  },
];

describe("listing filters", () => {
  it("supports any/all matching and composes independent filters with AND", () => {
    expect(
      filterBySearch(items, { id: "search_1", search: ["astro web"], type: "any" }, (item, word) =>
        item.title.toLowerCase().includes(word),
      ),
    ).toHaveLength(1);
    const first = filterByKeywords(
      items,
      { id: "tags", values: ["web", "code"], type: "all" },
      (item) => item.tags,
    );
    expect(first.map((item) => item.title)).toEqual(["TypeScript guide"]);
    expect(
      applyTextFilters(
        items,
        [
          { id: "search_1", search: ["web"], type: "all" },
          { id: "search_2", search: ["guide"], type: "all" },
        ],
        (item, word) =>
          item.title.toLowerCase().includes(word) ||
          item.tags.some((tag) => tag.toLowerCase().includes(word)),
      ),
    ).toHaveLength(1);
  });

  it("applies inclusive date bounds", () => {
    const matches = filterByDate(
      items,
      {
        start: new Date("2024-01-10T12:00:00Z"),
        end: new Date("2024-02-01T12:00:00Z"),
      },
      (item) => item.date,
    );
    expect(matches.map((item) => item.title)).toEqual(["TypeScript guide", "Travel"]);
  });

  it("preserves search-filter insertion order and defaults to all", () => {
    const state = new Map([
      ["search_2", ["second"]],
      ["search_2_type", ["any"]],
      ["search_1", ["first"]],
    ]);
    expect(buildTextFilters(state)).toEqual([
      { id: "search_2", search: ["second"], type: "any" },
      { id: "search_1", search: ["first"], type: "all" },
    ]);
  });
});

describe("URL compatibility helpers", () => {
  it("retains the legacy double-encoding and comma splitting semantics", () => {
    const serialized = serializeToQueryParams(["a b", "c"]);
    expect(deserializeFromQueryParams(serialized)).toEqual(["a b", "c"]);
    expect(
      parseQueryState(
        `?search_1=${new URLSearchParams({ search_1: serialized }).get("search_1")}`,
      ).get("search_1"),
    ).toEqual(["a b", "c"]);
  });

  it("parses URL-encoded commas as separate values, matching the original behavior", () => {
    const params = new URLSearchParams();
    params.set("search_1", serializeToQueryParams(["alpha,beta"]));
    expect(parseQueryState(`?${params.toString()}`).get("search_1")).toEqual(["alpha", "beta"]);
  });
});

describe("pagination compatibility", () => {
  it("retains an empty last page for exact multiples of ten", () => {
    const result = getPage(
      Array.from({ length: 20 }, (_, index) => index),
      2,
    );
    expect(result.numPages).toBe(2);
    expect(result.visibleItems).toEqual([]);
  });

  it("clamps requested page and returns ten items per normal page", () => {
    const result = getPage(
      Array.from({ length: 21 }, (_, index) => index),
      99,
    );
    expect(result.page).toBe(2);
    expect(result.visibleItems).toEqual([20]);
  });
});
