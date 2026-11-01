import { describe, expect, it } from "vitest";
import { getPublicImageSize } from "../../src/lib/media";

describe("build-time public image dimensions", () => {
  it("reads local image dimensions and returns the same cached values", async () => {
    const size = await getPublicImageSize("/images/logo.svg");
    expect(size).toEqual({ width: 100, height: 104 });
    expect(await getPublicImageSize("/images/logo.svg")).toEqual(size);
  });

  it("does not fetch remote or missing optional image URLs", async () => {
    expect(await getPublicImageSize(undefined)).toBeUndefined();
    expect(await getPublicImageSize("https://example.com/image.jpg")).toBeUndefined();
    expect(await getPublicImageSize("//example.com/image.jpg")).toBeUndefined();
  });

  it("fails rather than hiding a missing local image", async () => {
    await expect(getPublicImageSize("/images/missing-cover-test.jpg")).rejects.toThrow();
  });
});
