import type { CollectionEntry } from "astro:content";

type Post = Pick<CollectionEntry<"posts">, "id" | "data">;
type Series = Pick<CollectionEntry<"series">, "id" | "data">;

export interface SeriesPost {
  id: string;
  title: string;
  url: string;
}

export interface PostSeries {
  title: string;
  posts: SeriesPost[];
  currentId: string;
  position: number;
  previous?: SeriesPost;
  next?: SeriesPost;
}

export function buildSeriesLookup(series: Series[], posts: Post[]): Map<string, PostSeries> {
  const postsById = new Map(posts.map((post) => [post.id, post]));
  const membership = new Map<string, string>();
  const lookup = new Map<string, PostSeries>();

  for (const entry of series) {
    const seen = new Set<string>();
    const published: SeriesPost[] = [];
    for (const reference of entry.data.posts) {
      const id = reference.id;
      if (seen.has(id)) {
        throw new Error(`Series "${entry.id}" contains duplicate post "${id}"`);
      }
      seen.add(id);
      const post = postsById.get(id);
      if (!post) {
        throw new Error(`Series "${entry.id}" references missing post "${id}"`);
      }
      const existing = membership.get(id);
      if (existing) {
        throw new Error(`Post "${id}" belongs to both series "${existing}" and "${entry.id}"`);
      }
      membership.set(id, entry.id);
      if (!post.data.draft) {
        published.push({ id, title: post.data.title, url: `/post/${post.data.slug}/` });
      }
    }
    published.forEach((post, index) => {
      lookup.set(post.id, {
        title: entry.data.title,
        posts: published,
        currentId: post.id,
        position: index + 1,
        previous: published[index - 1],
        next: published[index + 1],
      });
    });
  }
  return lookup;
}
