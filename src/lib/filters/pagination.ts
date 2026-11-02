export type Page<T> = { page: number; numPages: number; visibleItems: T[] };

export function getPage<T>(items: readonly T[], requestedPage: number, pageSize = 10): Page<T> {
  if (!Number.isInteger(pageSize) || pageSize < 1)
    throw new RangeError("pageSize must be a positive integer");
  const numPages = Math.floor(items.length / pageSize);
  const page = Math.max(0, Math.min(Number.isFinite(requestedPage) ? requestedPage : 0, numPages));
  return {
    page,
    numPages,
    visibleItems: items.slice(
      pageSize * page,
      page < numPages ? pageSize * (page + 1) : items.length,
    ),
  };
}
