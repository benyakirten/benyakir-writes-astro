import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { imageMetadata } from "astro/assets/utils";

type ImageSize = { width: number; height: number };
const publicDirectory = resolve("public");
const sizes = new Map<string, Promise<ImageSize>>();

// Build-time metadata reserves image space without a runtime image service.
export function getPublicImageSize(src: string | undefined): Promise<ImageSize | undefined> {
  if (!src?.startsWith("/") || src.startsWith("//")) return Promise.resolve(undefined);
  const pathname = decodeURIComponent(new URL(src, "https://assets.invalid").pathname);
  const filename = resolve(publicDirectory, `.${pathname}`);
  if (!filename.startsWith(`${publicDirectory}${sep}`)) {
    throw new Error(`Image path must stay inside public/: ${src}`);
  }
  let size = sizes.get(filename);
  if (!size) {
    size = readFile(filename)
      .then((data) => imageMetadata(data, src))
      .then(({ width, height }) => ({ width, height }));
    sizes.set(filename, size);
  }
  return size;
}
