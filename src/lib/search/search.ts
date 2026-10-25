export type SearchableItem = {
  type: "post" | "book" | "story" | "project";
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  categories?: string[] | null;
  tags?: string[] | null;
  meta: Record<string, boolean>;
};

export type SearchPage = {
  title: string;
  slug: string;
  description: string;
  url?: string;
};

export type SearchDataset = {
  books: SearchableItem[];
  stories: SearchableItem[];
  projects: SearchableItem[];
  posts: SearchableItem[];
  pages: SearchPage[];
};

export type SearchResults = SearchDataset;

export function search(
  query: string,
  dataset: SearchDataset,
): SearchResults | null {
  if (!query) return null;
  const words = query.toLowerCase().split(" ");
  const hasText = (value: string | undefined, word: string) =>
    value?.toLowerCase().includes(word) ?? false;
  const filter = (
    items: SearchableItem[],
    fields: (item: SearchableItem, word: string) => boolean,
  ) => items.filter((item) => words.some((word) => fields(item, word)));

  return {
    books: filter(
      dataset.books,
      (item, word) =>
        hasText(item.title, word) ||
        hasText(item.content, word) ||
        Boolean(item.meta[word]),
    ),
    stories: filter(
      dataset.stories,
      (item, word) =>
        Boolean(item.meta[word]) ||
        hasText(item.title, word) ||
        hasText(item.content, word),
    ),
    projects: filter(
      dataset.projects,
      (item, word) =>
        Boolean(item.meta[word]) ||
        hasText(item.title, word) ||
        hasText(item.content, word),
    ),
    posts: filter(
      dataset.posts,
      (item, word) =>
        Boolean(item.meta[word]) ||
        hasText(item.title, word) ||
        hasText(item.excerpt, word) ||
        hasText(item.content, word) ||
        (item.categories ?? []).some((category) => hasText(category, word)) ||
        (item.tags ?? []).some((tag) => hasText(tag, word)),
    ),
    pages: dataset.pages
      .filter((page) =>
        words.some(
          (word) =>
            page.title.toLowerCase().includes(word) ||
            page.description.toLowerCase().includes(word),
        ),
      )
      .map((page) => ({ ...page, url: page.url ?? page.slug })),
  };
}
