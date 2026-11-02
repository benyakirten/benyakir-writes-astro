import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const root = path.resolve("src/content");

const pages = [
  {
    title: "Blog",
    slug: "/",
    description:
      "Browse a list of all my blog posts ordered by most recent publication to least recent. Users can filter the blog results by publication date, category and tags.",
  },

  {
    title: "Portfolio",
    slug: "/portfolio/",
    description: "My developer portfolio, including only my best and most up-to-date projects.",
  },
  {
    title: "Projects",
    slug: "/projects/",
    description:
      "A view of all of my completed projects with various details from when I first started to learn programming. You can filter by date, host, technology and keyword.",
  },
  {
    title: "Author",
    slug: "/author/",
    description:
      "A view of all of my published books and short stories. They can be filtered by keyword or date of publication.",
  },
];

function plainText(markdown) {
  return markdown
    .replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_~>#|]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summary(body, explicit, description, title) {
  if (explicit?.trim()) return explicit.trim();
  const firstParagraph =
    body
      .replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "")
      .split(/\n\s*\n/)
      .find((part) => part.trim() && !part.trim().startsWith("```")) ?? "";
  const text = plainText(firstParagraph);
  if (!text) return description || title;
  if (Array.from(text).length <= 300) return text;
  const chars = Array.from(text);
  const shortened = chars.slice(0, 300).join("");
  const lastSpace = shortened.lastIndexOf(" ");
  return `${(lastSpace > 0 ? shortened.slice(0, lastSpace) : shortened).trimEnd()}…`;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const shortMonths = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const technologyNames = {
  html: "HTML",
  css: "CSS",
  sass: "Sass",
  js: "JavaScript",
  ts: "TypeScript",
  py: "Python",
  php: "PHP",
  wp: "WordPress",
  ng: "Angular",
  swift: "Swift",
  react: "React",
  vue: "Vue",
  cs: "C#",
  unity: "Unity",
  ml: "Machine Learning",
  svelte: "Svelte",
  gql: "GraphQL",
  tw: "Tailwind",
  go: "Golang",
  ex: "Elixir",
  wip: "Work In Progress",
  ws: "WebSockets",
  rs: "Rust",
};

function dateWords(value) {
  const [year, monthText] = String(value).split("-");
  const month = Number(monthText);
  return month >= 1 && month <= 12 ? [monthNames[month - 1], shortMonths[month - 1], year] : [year];
}

function truncate(value, limit = 300) {
  const text = String(value ?? "");
  if (text.length <= limit) return text;
  const prefix = text.slice(0, limit);
  const boundary = prefix.search(/\\s+\\S*$/);
  return boundary < 0 ? prefix : `${prefix.slice(0, boundary)}...`;
}

function normalize(value) {
  return String(value ?? "")
    .replace(/<\/?[\w\s=":/.]+>/g, "")
    .replace(/&#?\w+;/g, "")
    .replace(/[\[\]\n,'"().?!:]/g, "")
    .replace(/[=/]/g, " ")
    .replace(/”“/g, "");
}

const records = { books: [], stories: [], projects: [], posts: [], pages };
const lookup = Object.create(null);
for (const kind of ["books", "stories", "posts", "projects"]) {
  const directory = path.join(root, kind);
  let files = [];
  try {
    files = (await readdir(directory)).filter((file) => /\.(md|mdx)$/.test(file)).sort();
  } catch {}
  for (let sourceOrder = 0; sourceOrder < files.length; sourceOrder++) {
    const file = files[sourceOrder];
    const source = await readFile(path.join(directory, file), "utf8");
    const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (!match) throw new Error(`Missing YAML frontmatter: ${kind}/${file}`);
    const data = parse(match[1]);
    if (data.draft) continue;
    if (!data.title || !data.slug || !data.published)
      throw new Error(`Missing required title/slug/published: ${kind}/${file}`);
    const summaryText = summary(source, data.excerpt, data.description, data.title);
    const content = plainText(source);
    const categories = data.categories ?? [];
    const tags = data.tags ?? [];
    const technologies = data.technologies ?? [];
    const type = {
      posts: "post",
      books: "book",
      stories: "story",
      projects: "project",
    }[kind];
    const date = kind === "projects" ? data.firstReleased || data.published : data.published;
    const dateMetadata = dateWords(date);
    const longTechnologies = technologies.map((item) => {
      const match = Object.entries(technologyNames).find(
        ([short]) => short.toLowerCase() === item.toLowerCase(),
      );
      return match?.[1] ?? item;
    });
    let indexed;
    if (kind === "posts") {
      indexed = [
        ...categories.flatMap((category) => category.toLowerCase().split(" ")),
        ...tags,
        ...dateMetadata,
        ...data.title.split(" "),
        ...normalize(summaryText).split(" "),
      ];
    } else if (kind === "books") {
      indexed = [
        ...data.title.split(" "),
        ...dateMetadata,
        ...(data.purchaseLinks ?? []).map(() => "[object Object]"),
        ...normalize(truncate(summaryText)).split(" "),
        ...(data.relatedStoryTitles ?? []).flatMap((title) => title.split(" ")),
        ...(data.relatedProjectTitle ? data.relatedProjectTitle.split(" ") : []),
        ...(data.relatedProjectDescription ? data.relatedProjectDescription.split(" ") : []),
      ];
    } else if (kind === "stories") {
      indexed = [
        ...data.title.split(" "),
        ...normalize(content).split(" "),
        ...dateMetadata,
        ...(data.relatedBookTitle ? data.relatedBookTitle.split(" ") : []),
        data.relationshipToBook,
      ];
    } else {
      indexed = [
        ...data.title.split(" "),
        data.hostedOn,
        ...normalize(truncate(content)).split(" "),
        ...dateMetadata,
        ...technologies,
        ...longTechnologies,
        ...(data.repoLink ? ["github", "repo"] : []),
      ];
    }
    const meta = Object.create(null);
    for (const value of indexed.filter(Boolean)) {
      const lowered = String(value).toLowerCase();
      for (const word of normalize(lowered).split(" ")) {
        meta[word] = true;
        lookup[word] = (lookup[word] || 0) + 1;
      }
    }
    records[kind].push({
      type,
      slug: data.slug,
      title: data.title,
      published: date,
      url: `/${type}/${data.slug.replace(/^\/+|\/+$/g, "")}/`,
      excerpt: summaryText,
      content:
        kind === "stories" ? truncate(content) : kind === "posts" ? undefined : truncate(content),
      categories,
      tags,
      technologies,
      shortTechnologies: technologies,
      longTechnologies,
      hostedOn: data.hostedOn,
      meta,
      sourceOrder,
    });
  }
  records[kind].sort(
    (a, b) => b.published.localeCompare(a.published) || a.sourceOrder - b.sourceOrder,
  );
}

await writeFile("src/generated/search-data.json", `${JSON.stringify(records)}\n`);
await writeFile("src/generated/lookups.json", `${JSON.stringify(lookup)}\n`);
console.log(
  `Generated search data: ${records.posts.length} posts, ${records.books.length} books, ${records.stories.length} stories, ${records.projects.length} projects.`,
);
