export const SITE = {
  name: 'Benyakir Writes',
  author: 'Benyakir Horowitz',
  origin: 'https://www.benyakir-writes.com',
} as const;

export const ROUTE_PREFIX = {
  posts: '/post/',
  books: '/book/',
  stories: '/story/',
  projects: '/project/',
} as const;

export type ContentKind = keyof typeof ROUTE_PREFIX;

export function contentPath(kind: ContentKind, slug: string): string {
  return `${ROUTE_PREFIX[kind]}${slug.replace(/^\/+|\/+$/g, '')}/`;
}
