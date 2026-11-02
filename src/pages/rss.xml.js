import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return rss({
    title: `${SITE.name} — Blog`,
    description: 'Posts by Benyakir Horowitz',
    site: context.site ?? SITE.origin,
    items: posts
      .sort((a, b) => b.data.published.localeCompare(a.data.published))
      .map(({ data, body }) => ({
        title: data.title,
        pubDate: new Date(`${data.published}T12:00:00Z`),
        description: data.description ?? data.excerpt ?? '',
        link: `/post/${data.slug}/`,
        content: body,
      })),
    customData: '<language>en-us</language>',
  });
}
