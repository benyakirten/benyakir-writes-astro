import { describe, expect, it } from "vitest";
import { buildSeriesLookup } from "../../src/lib/series";

function post(id: string, draft = false) {
  return {
    id,
    data: {
      title: `Post ${id}`,
      slug: `url-${id}`,
      published: "2024-01-01",
      draft,
      categories: [],
      tags: [],
    },
  };
}
function series(ids: string[], id = "example") {
  return {
    id,
    data: { title: "Example", posts: ids.map((id) => ({ collection: "posts" as const, id })) },
  };
}

describe("post series", () => {
  it("uses explicit reading order and URL slugs, not input order or IDs", () => {
    const lookup = buildSeriesLookup([series(["c", "a", "b"])], [post("a"), post("b"), post("c")]);
    expect(lookup.get("c")?.previous).toBeUndefined();
    expect(lookup.get("c")?.next?.id).toBe("a");
    expect(lookup.get("a")).toMatchObject({
      position: 2,
      currentId: "a",
      previous: { id: "c" },
      next: { id: "b", url: "/post/url-b/" },
    });
    expect(lookup.get("b")?.next).toBeUndefined();
    expect(lookup.has("unrelated")).toBe(false);
  });

  it("omits drafts and computes positions and neighbors from published posts", () => {
    const lookup = buildSeriesLookup(
      [series(["a", "draft", "b"])],
      [post("a"), post("draft", true), post("b")],
    );
    expect(lookup.has("draft")).toBe(false);
    expect(lookup.get("a")?.posts.map(({ id }) => id)).toEqual(["a", "b"]);
    expect(lookup.get("a")?.next?.id).toBe("b");
    expect(lookup.get("b")?.position).toBe(2);
  });

  it("supports a single published installment and an entirely draft series", () => {
    const lookup = buildSeriesLookup([series(["a", "draft"])], [post("a"), post("draft", true)]);
    expect(lookup.get("a")).toMatchObject({ position: 1, previous: undefined, next: undefined });
    expect(lookup.get("a")?.posts).toHaveLength(1);
    expect(buildSeriesLookup([series(["draft"])], [post("draft", true)]).size).toBe(0);
  });

  it("rejects missing references and duplicates", () => {
    expect(() => buildSeriesLookup([series(["missing"])], [])).toThrow(
      'references missing post "missing"',
    );
    expect(() => buildSeriesLookup([series(["a", "a"])], [post("a")])).toThrow(
      'duplicate post "a"',
    );
  });

  it("rejects membership in multiple series, even for drafts", () => {
    expect(() =>
      buildSeriesLookup([series(["a"]), series(["a"], "other")], [post("a", true)]),
    ).toThrow('belongs to both series "example" and "other"');
  });
});
