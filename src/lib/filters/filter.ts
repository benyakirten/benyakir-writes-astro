import { parseQueryState } from "./queries";

export type FilterType = "all" | "any";
export type SearchFilter = { id: string; search: string[]; type: FilterType };
export type KeywordFilter = { id: string; values: string[]; type: FilterType };
export type DateFilter = { start: Date; end: Date };

export function filterBySearch<T>(
  items: readonly T[],
  filter: SearchFilter,
  matches: (item: T, word: string) => boolean,
): T[] {
  if (filter.search.length === 0 || filter.search[0] === "") return [...items];
  const words = filter.search[0]
    .replace(/,\s/g, " ")
    .replace(/,(\S)/g, " $1")
    .split(" ");
  return items.filter((item) =>
    filter.type === "any"
      ? words.some((word) => matches(item, word))
      : words.every((word) => matches(item, word)),
  );
}

export function filterByKeywords<T>(
  items: readonly T[],
  filter: KeywordFilter,
  choices: (item: T) => string[],
): T[] {
  if (filter.values.length === 0) return [...items];
  return items.filter((item) =>
    filter.type === "any"
      ? filter.values.some((value) => choices(item).includes(value))
      : filter.values.every((value) => choices(item).includes(value)),
  );
}

export function filterByDate<T>(
  items: readonly T[],
  filter: DateFilter,
  date: (item: T) => Date,
): T[] {
  const start = filter.start.getTime();
  const end = filter.end.getTime();
  return items.filter(
    (item) => date(item).getTime() >= start && date(item).getTime() <= end,
  );
}

export function buildTextFilters(state: Map<string, string[]>): SearchFilter[] {
  const filters: SearchFilter[] = [];
  for (const [id, search] of state) {
    if (!id.startsWith("search") || id.endsWith("_type")) continue;
    filters.push({
      id,
      search: search.filter((value) => value !== ""),
      type: state.get(`${id}_type`)?.[0] === "any" ? "any" : "all",
    });
  }
  return filters;
}

export function applyTextFilters<T>(
  items: readonly T[],
  filters: readonly SearchFilter[],
  matches: (item: T, word: string) => boolean,
): T[] {
  return filters.reduce(
    (result, filter) => filterBySearch(result, filter, matches),
    [...items],
  );
}

export function filterFromSearch(search: string): Map<string, string[]> {
  return parseQueryState(search);
}

export function matchesText(
  item: {
    title: string;
    excerpt?: string;
    content?: string;
    meta?: Record<string, boolean>;
    categories?: string[] | null;
    tags?: string[] | null;
  },
  word: string,
): boolean {
  const lowered = word.toLocaleLowerCase();
  return Boolean(
    Boolean(item.meta?.[word]) ||
    item.title.toLocaleLowerCase().includes(lowered) ||
    item.excerpt?.toLocaleLowerCase().includes(lowered) ||
    item.content?.toLocaleLowerCase().includes(lowered) ||
    item.categories?.some((value) =>
      value.toLocaleLowerCase().includes(lowered),
    ) ||
    item.tags?.some((value) => value.toLocaleLowerCase().includes(lowered)),
  );
}
