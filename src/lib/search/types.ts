import type { SearchDataset } from './search';

export const pageSearch = [
  { title: 'Blog', slug: '/blog/', description: 'Browse a list of all my blog posts ordered by most recent publication to least recent. Users can filter the blog results by publication date, category and tags.' },
  { title: 'Home', slug: '/', description: 'Get an overview of my latest creations. As a fluent speaker of Italian, former writer, editor and current fullstack dev, I have a lot to share.' },
  { title: 'Portfolio', slug: '/portfolio/', description: 'My developer portfolio, including only my best and most up-to-date projects.' },
  { title: 'Projects', slug: '/projects/', description: 'A view of all of my completed projects with various details from when I first started to learn programming. You can filter by date, host, technology and keyword.' },
  { title: 'Author', slug: '/author/', description: 'A view of all of my published books and short stories. They can be filtered by keyword or date of publication.' },
] satisfies SearchDataset['pages'];
