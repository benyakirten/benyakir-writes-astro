import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const link = z.object({ name: z.string().min(1), url: z.url() });
const shared = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[^/?#]+(?:\/[^/?#]+)*$/),
  published: date,
  publishedAt: z.iso.datetime({ offset: true }).optional(),
  updated: date.optional(),
  description: z.string().optional(),
  excerpt: z.string().optional(),
  draft: z.boolean().default(false),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: shared.extend({
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/books" }),
  schema: shared.extend({
    purchaseLinks: z.array(link).default([]),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    coverDesigner: z
      .object({
        name: z.string(),
        bio: z.string().optional(),
        links: z.array(link).default([]),
      })
      .optional(),
    relatedProject: z.object({ slug: z.string(), description: z.string().optional() }).optional(),
    relatedStories: z.array(z.string()).default([]),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/stories" }),
  schema: shared.extend({
    alternateLinks: z.array(link).default([]),
    relatedBook: z.object({ slug: z.string(), relationship: z.string().optional() }).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: shared.extend({
    firstReleased: date,
    latestUpdate: date.optional(),
    technologies: z.array(z.string()).default([]),
    hostedOn: z.string().optional(),
    mainLink: z.url().optional(),
    repoLink: z.url().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = { posts, books, stories, projects };
