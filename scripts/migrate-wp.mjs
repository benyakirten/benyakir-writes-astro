import { access, copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseHTML } from "linkedom";
import phpSerialize from "php-serialize";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { stringify } from "yaml";

const options = new Map();
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith("--")) options.set(process.argv[i].slice(2), process.argv[++i]);
}
const applying = process.argv.includes("--apply");
const sqlPath = path.resolve(options.get("sql") ?? "data/benyakir_WPSTA.sql");
const uploadsPath = options.get("uploads") ? path.resolve(options.get("uploads")) : null;
const sql = await readFile(sqlPath, "utf8");
const prefix = "_STA_";
const tableNames = new Set([
  `${prefix}posts`,
  `${prefix}postmeta`,
  `${prefix}terms`,
  `${prefix}term_taxonomy`,
  `${prefix}term_relationships`,
]);
const tables = new Map([...tableNames].map((name) => [name, []]));
const escapes = {
  0: "\0",
  b: "\b",
  t: "\t",
  n: "\n",
  r: "\r",
  Z: String.fromCharCode(26),
};

function parseRows(source, start, columns) {
  const rows = [];
  let index = start;
  while (index < source.length) {
    while (/\s|,/.test(source[index] ?? "") && index < source.length) index++;
    if (source[index] !== "(") break;
    index++;
    const values = [];
    while (index < source.length) {
      while (/\s/.test(source[index] ?? "")) index++;
      if (source[index] === "'") {
        index++;
        let value = "";
        while (index < source.length) {
          const char = source[index++];
          if (char === "\\") {
            const escaped = source[index++];
            value += escapes[escaped] ?? escaped;
          } else if (char === "'") {
            if (source[index] === "'") {
              value += "'";
              index++;
            } else break;
          } else value += char;
        }
        values.push(value);
      } else {
        const valueStart = index;
        while (index < source.length && source[index] !== "," && source[index] !== ")") index++;
        const raw = source.slice(valueStart, index).trim();
        values.push(raw === "NULL" ? null : raw);
      }
      while (/\s/.test(source[index] ?? "")) index++;
      if (source[index] === ")") {
        index++;
        break;
      }
      if (source[index] !== ",") throw new Error(`Invalid SQL row delimiter near byte ${index}`);
      index++;
    }
    if (values.length !== columns.length)
      throw new Error(`SQL row has ${values.length} fields; expected ${columns.length}`);
    rows.push(Object.fromEntries(columns.map((column, i) => [column, values[i]])));
    while (/\s/.test(source[index] ?? "")) index++;
    if (source[index] === ";") break;
    if (source[index] !== ",") throw new Error(`Expected row separator near byte ${index}`);
    index++;
  }
  return rows;
}

const insert = /INSERT INTO `([^`]+)`\s*\(([^;]+?)\)\s*VALUES\s*/g;
for (let match; (match = insert.exec(sql));) {
  if (!tables.has(match[1])) continue;
  const columns = [...match[2].matchAll(/`([^`]+)`/g)].map((part) => part[1]);
  tables.get(match[1]).push(...parseRows(sql, insert.lastIndex, columns));
}
for (const [table, rows] of tables) {
  if (!rows.length) throw new Error(`Required table missing/empty: ${table}`);
}

const posts = tables.get(`${prefix}posts`);
const metadata = tables.get(`${prefix}postmeta`);
const terms = new Map(tables.get(`${prefix}terms`).map((term) => [term.term_id, term]));
const taxonomy = new Map(
  tables.get(`${prefix}term_taxonomy`).map((term) => [term.term_taxonomy_id, term]),
);
const relations = tables.get(`${prefix}term_relationships`);
const meta = new Map();
for (const row of metadata) {
  if (!meta.has(row.post_id)) meta.set(row.post_id, new Map());
  const current = meta.get(row.post_id);
  if (!current.has(row.meta_key)) current.set(row.meta_key, []);
  current.get(row.meta_key).push(row.meta_value);
}
const allPosts = new Map(posts.map((post) => [post.ID, post]));
const attachments = new Map(
  posts
    .filter((post) => post.post_type === "attachment")
    .map((post) => [
      post.ID,
      {
        path: meta.get(post.ID)?.get("_wp_attached_file")?.[0],
        alt: meta.get(post.ID)?.get("_wp_attachment_image_alt")?.[0] ?? "",
        title: post.post_title,
      },
    ]),
);
const publicPosts = posts.filter(
  (post) =>
    post.post_status === "publish" &&
    ["post", "project", "book", "shortstory"].includes(post.post_type),
);
const sourceType = {
  post: "posts",
  project: "projects",
  book: "books",
  shortstory: "stories",
};
const idToSlug = new Map(
  publicPosts.map((post) => [post.ID, post.post_name || slugify(post.post_title)]),
);
const slugCounts = new Map();
for (const post of publicPosts) {
  const kind = sourceType[post.post_type];
  const candidate = idToSlug.get(post.ID);
  const key = `${kind}:${candidate.toLowerCase()}`;
  const count = slugCounts.get(key) ?? 0;
  slugCounts.set(key, count + 1);
  if (count) idToSlug.set(post.ID, `${candidate}-${post.ID}`);
}
const slugIndex = new Map();
for (const post of publicPosts) {
  const slug = idToSlug.get(post.ID);
  if (!slugIndex.has(slug)) slugIndex.set(slug, []);
  slugIndex.get(slug).push(post);
}

function slugify(value) {
  return (
    String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "") || "untitled"
  );
}

function getMeta(id, key) {
  const values = meta.get(id)?.get(key) ?? [];
  if (!values.length) return undefined;
  const value = values[0];
  if (typeof value !== "string") return value;
  if (phpSerialize.isSerialized(value)) {
    try {
      return phpSerialize.unserialize(value);
    } catch (error) {
      throw new Error(`Cannot decode serialized field ${key} for post ID ${id}: ${error.message}`);
    }
  }
  return value;
}

function toList(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return Object.values(value);
  return String(value).split(", ");
}

function normalizeWebUrl(value) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  if (/^(?:https?:|mailto:)/i.test(url)) return url;
  return `https://${url.startsWith("//") ? url.slice(2) : url}`;
}

function linkPairs(urls, labels) {
  const values = toList(urls).map(normalizeWebUrl).filter(Boolean);
  const names = toList(labels).map(String);
  return values.map((url, index) => ({ name: names[index] || url, url }));
}

function parseDate(value, fallback) {
  const text = String(value ?? "").trim();
  let match = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (match) return validDate(+match[1], +match[2], +match[3], text);
  match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return validDate(+match[1], +match[2], +match[3], text);
  match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) return validDate(+match[3], +match[1], +match[2], text);
  if (fallback) return parseDate(fallback);
  throw new Error(
    `Unsupported content date ${JSON.stringify(text)}; inspect the source ACF value and set an explicit conversion override.`,
  );
}

function validDate(year, month, day, original) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date ${JSON.stringify(original)}`);
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const taxonomyByPost = new Map();
for (const row of relations) {
  const tax = taxonomy.get(row.term_taxonomy_id);
  if (!tax || !["category", "post_tag"].includes(tax.taxonomy)) continue;
  const term = terms.get(tax.term_id);
  if (!taxonomyByPost.has(row.object_id))
    taxonomyByPost.set(row.object_id, { categories: [], tags: [] });
  taxonomyByPost
    .get(row.object_id)
    [tax.taxonomy === "category" ? "categories" : "tags"].push(term.name);
}

function stripLegacyBlockComments(html) {
  return html.replace(/<!--\s*\/?wp:[\s\S]*?-->/g, "");
}

function htmlToMarkdown(post) {
  const { document } = parseHTML(
    `<html><body>${stripLegacyBlockComments(post.post_content ?? "")}</body></html>`,
  );
  const body = document.body;
  const report = {
    codeBlocks: 0,
    widgetsRemoved: 0,
    retainedEmbeds: 0,
    uploadLinks: 0,
    uploadPaths: [],
  };
  const blocks = [];
  let blockIndex = 0;
  for (const element of [...body.querySelectorAll(".benyakir-syntax-highlighter")]) {
    const pre = element.querySelector("pre");
    if (!pre) throw new Error(`Highlighter block has no <pre> in post ID ${post.ID}`);
    let payload;
    const candidates = [pre.innerHTML, pre.textContent];
    for (const candidate of candidates) {
      try {
        payload = JSON.parse(candidate);
        break;
      } catch {}
    }
    if (!payload || typeof payload.code !== "string" || typeof payload.lang !== "string") {
      throw new Error(`Invalid syntax-highlighter JSON in post ID ${post.ID}`);
    }
    let code = payload.code
      .replaceAll("__L_ANGLE_BRACKET__", "<")
      .replaceAll("__R_ANGLE_BRACKET__", ">")
      .replaceAll("__L_CURLY_BRACKET__", "{")
      .replaceAll("__R_CURLY_BRACKET__", "}");
    const language = {
      js: "js",
      jsx: "jsx",
      ts: "ts",
      tsx: "tsx",
      python: "python",
      php: "php",
      graphql: "graphql",
      css: "css",
      scss: "scss",
      erlang: "erlang",
      elixir: "elixir",
      go: "go",
    }[payload.lang];
    if (!language)
      throw new Error(`Unsupported highlighter language ${payload.lang} in post ID ${post.ID}`);
    blocks.push({
      token: `MIGRATION_CODE_BLOCK_${blockIndex++}`,
      code,
      language,
    });
    const replacement = document.createElement("p");
    replacement.textContent = `MIGRATION_CODE_BLOCK_${blockIndex - 1}`;
    element.replaceWith(replacement);
    report.codeBlocks++;
  }
  for (const pre of [...body.querySelectorAll("pre")]) {
    const codeElement = pre.querySelector("code");
    const code = codeElement?.textContent ?? pre.textContent ?? "";
    const classNames = `${pre.getAttribute("class") ?? ""} ${codeElement?.getAttribute("class") ?? ""}`;
    const language = classNames.match(/(?:language-|lang-)([\w+-]+)/)?.[1] ?? "";
    const token = `MIGRATION_CODE_BLOCK_${blockIndex++}`;
    blocks.push({ token, code, language });
    const replacement = document.createElement("p");
    replacement.textContent = token;
    pre.replaceWith(replacement);
    report.codeBlocks++;
  }
  for (const element of [
    ...body.querySelectorAll(".sharedaddy, .sd-sharing-enbaled, script, style, form"),
  ]) {
    element.remove();
    report.widgetsRemoved++;
  }
  report.retainedEmbeds = body.querySelectorAll("iframe, video, audio").length;
  for (const element of body.querySelectorAll("[src], [href], [poster], [srcset]")) {
    for (const attribute of ["src", "href", "poster", "srcset"]) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const parts =
        attribute === "srcset"
          ? value.split(",").map((item) => item.trim().split(/\s+/))
          : [[value]];
      const rewritten = parts.map(([url, descriptor]) => {
        let parsed;
        try {
          parsed = new URL(url, "https://benyakiredits.com");
        } catch {
          return [url, descriptor].filter(Boolean).join(" ");
        }
        if (parsed.pathname.includes("/wp-content/uploads/")) {
          const relative = decodeURIComponent(parsed.pathname.split("/wp-content/uploads/")[1]);
          const publicPath = relative.startsWith("2019/12/") ? relative : relative;
          report.uploadLinks++;
          report.uploadPaths.push(relative);
          return [`/wp-content/uploads/${publicPath}`, descriptor].filter(Boolean).join(" ");
        }
        const internal = [
          "benyakiredits.com",
          "www.benyakiredits.com",
          "benyakir-writes.com",
          "www.benyakir-writes.com",
        ].includes(parsed.hostname);
        if (internal) {
          const slug = parsed.pathname.split("/").filter(Boolean).at(-1);
          const targets = slugIndex.get(slug) ?? [];
          if (targets.length === 1) {
            const target = targets[0];
            return [
              `/${sourceType[target.post_type].slice(0, -1)}/${idToSlug.get(target.ID)}/`,
              descriptor,
            ]
              .filter(Boolean)
              .join(" ");
          }
        }
        return [url, descriptor].filter(Boolean).join(" ");
      });
      element.setAttribute(attribute, attribute === "srcset" ? rewritten.join(", ") : rewritten[0]);
    }
  }
  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
    strongDelimiter: "**",
    document,
  });
  service.use(gfm);
  service.remove(["script", "style"]);
  let markdown = service
    .turndown(body.innerHTML)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  for (const block of blocks) {
    const fenceChar = block.code.includes("`") ? "~" : "`";
    const longest = Math.max(
      0,
      ...[...block.code.matchAll(new RegExp(`${fenceChar === "`" ? "`" : "~"}+`, "g"))].map(
        (match) => match[0].length,
      ),
    );
    const fence = fenceChar.repeat(Math.max(3, longest + 1));
    const label = block.language ? block.language : "";
    const replacement = `${fence}${label}\n${block.code}${block.code.endsWith("\n") ? "" : "\n"}${fence}`;
    markdown = markdown.replace(block.token, replacement);
  }
  const shortcodePattern = /(?<!\\)!?\[(?:\/?[A-Za-z_-]+)(?:\s+[^\]]*)?\](?!\()/g;
  if (shortcodePattern.test(markdown))
    report.shortcodes = (markdown.match(shortcodePattern) ?? []).length;
  return { markdown, report };
}

function frontmatter(post, markdown) {
  const kind = sourceType[post.post_type];
  const data = {
    title: post.post_title || `Untitled ${post.ID}`,
    slug: idToSlug.get(post.ID),
    published:
      kind === "posts"
        ? parseDate(post.post_date)
        : parseDate(
            getMeta(post.ID, "published_on") ?? getMeta(post.ID, "first_released"),
            post.post_date,
          ),
    description: post.post_excerpt?.trim() || undefined,
    legacy: {
      wpId: Number(post.ID),
      postType: post.post_type,
      sourceOrder: publicPosts.indexOf(post),
    },
  };
  if (kind === "posts")
    Object.assign(data, taxonomyByPost.get(post.ID) ?? { categories: [], tags: [] });
  if (kind === "projects") {
    const technologies = toList(getMeta(post.ID, "technologies")).map(String);
    Object.assign(data, {
      published: parseDate(getMeta(post.ID, "first_released"), post.post_date),
      firstReleased: parseDate(getMeta(post.ID, "first_released"), post.post_date),
      latestUpdate: getMeta(post.ID, "latest_update")
        ? parseDate(getMeta(post.ID, "latest_update"))
        : undefined,
      technologies,
      hostedOn: getMeta(post.ID, "hosted_on") || undefined,
      mainLink: getMeta(post.ID, "main_link")
        ? normalizeWebUrl(getMeta(post.ID, "main_link"))
        : undefined,
      repoLink: getMeta(post.ID, "repo_link")
        ? normalizeWebUrl(getMeta(post.ID, "repo_link"))
        : undefined,
    });
  }
  if (kind === "books") {
    const coverId = getMeta(post.ID, "cover");
    const cover = coverId ? attachments.get(String(coverId)) : undefined;
    const stories = toList(getMeta(post.ID, "related_stories"))
      .map((id) => idToSlug.get(String(id)))
      .filter(Boolean);
    const projectId = getMeta(post.ID, "related_project");
    const project = projectId ? allPosts.get(String(projectId)) : undefined;
    Object.assign(data, {
      purchaseLinks: linkPairs(
        getMeta(post.ID, "purchase_links"),
        getMeta(post.ID, "purchase_links_names"),
      ),
      cover: cover?.path ? `/wp-content/uploads/${cover.path}` : undefined,
      coverAlt: cover?.alt || undefined,
      relatedStories: stories,
      relatedProject: project
        ? {
            slug: idToSlug.get(project.ID),
            description: getMeta(post.ID, "related_project_desc") || undefined,
          }
        : undefined,
      coverDesigner: getMeta(post.ID, "cover_designer")
        ? {
            name: getMeta(post.ID, "cover_designer"),
            bio: getMeta(post.ID, "cover_designer_bio") || undefined,
            links: linkPairs(
              getMeta(post.ID, "cover_designer_links"),
              getMeta(post.ID, "cover_designer_links_names"),
            ),
          }
        : undefined,
    });
  }
  if (kind === "stories") {
    const bookId = getMeta(post.ID, "related_book");
    const book = bookId ? allPosts.get(String(bookId)) : undefined;
    Object.assign(data, {
      alternateLinks: linkPairs(
        getMeta(post.ID, "alternate_links"),
        getMeta(post.ID, "alternate_links_names"),
      ),
      relatedBook: book
        ? {
            slug: idToSlug.get(book.ID),
            relationship: getMeta(post.ID, "relationship_to_book") || undefined,
          }
        : undefined,
    });
  }
  for (const [key, value] of Object.entries(data))
    if (value === undefined || value === "") delete data[key];
  const yaml = stringify(data, { lineWidth: 120 }).replace(
    /^(\s*(?:published|firstReleased|latestUpdate|updated):)\s*(\d{4}-\d{2}-\d{2})\s*$/gm,
    '$1 "$2"',
  );
  return `---\n${yaml.trim()}\n---\n\n${markdown}\n`;
}

const results = [];
const problems = [];
for (const post of publicPosts) {
  try {
    const { markdown, report } = htmlToMarkdown(post);
    const output = frontmatter(post, markdown);
    const kind = sourceType[post.post_type];
    const filename = `${idToSlug.get(post.ID)}.md`;
    results.push({
      id: post.ID,
      kind,
      filename,
      title: post.post_title,
      output,
      report,
    });
    if (report.shortcodes)
      problems.push({
        id: post.ID,
        issue: `${report.shortcodes} shortcode-like strings remain`,
      });
  } catch (error) {
    problems.push({
      id: post.ID,
      title: post.post_title,
      issue: error.message,
    });
  }
}
const counts = Object.fromEntries(
  Object.entries(sourceType).map(([type, kind]) => [
    kind,
    publicPosts.filter((post) => post.post_type === type).length,
  ]),
);
const converted = Object.fromEntries(
  Object.values(sourceType).map((kind) => [
    kind,
    results.filter((record) => record.kind === kind).length,
  ]),
);
console.log(
  JSON.stringify(
    {
      sqlFile: path.basename(sqlPath),
      tables: Object.fromEntries([...tables].map(([name, rows]) => [name, rows.length])),
      publicCounts: counts,
      convertedCounts: converted,
      conversionProblems: problems,
      codeBlocksConverted: results.reduce((total, record) => total + record.report.codeBlocks, 0),
      removedWidgetBlocks: results.reduce(
        (total, record) => total + record.report.widgetsRemoved,
        0,
      ),
      uploadReferences: results.reduce((total, record) => total + record.report.uploadLinks, 0),
      apply: applying,
    },
    null,
    2,
  ),
);

if (problems.length) process.exitCode = 1;
if (applying && !problems.length) {
  if (!uploadsPath) throw new Error("Provide --uploads <path> before --apply.");
  const preflightAttachmentPaths = [...attachments.values()]
    .map((attachment) => attachment.path)
    .filter(Boolean);
  for (const record of results) preflightAttachmentPaths.push(...record.report.uploadPaths);
  const mediaSources = new Map();
  for (const original of new Set(preflightAttachmentPaths)) {
    let relative = original.startsWith("/") ? original.slice(1) : original;
    if (relative.startsWith("2019/12/"))
      relative = `2019/2019/${relative.slice("2019/12/".length)}`;
    const source = path.resolve(uploadsPath, relative);
    if (!source.startsWith(`${uploadsPath}${path.sep}`))
      throw new Error(`Unsafe upload path ${original}`);
    let sourceStats;
    try {
      sourceStats = await stat(source);
    } catch {
      throw new Error(`Missing upload ${original} (looked for ${source})`);
    }
    if (!sourceStats.isFile()) throw new Error(`Upload is not a file: ${original}`);
    if (sourceStats.size > 25 * 1024 * 1024)
      throw new Error(
        `Upload exceeds Pages' 25 MiB limit: ${original} (${sourceStats.size} bytes). Choose an optimized rendition before applying.`,
      );
    mediaSources.set(original, source);
  }
  for (const result of results) {
    const filename = path.join("src/content", result.kind, result.filename);
    try {
      await access(filename);
      throw new Error(`Refusing to overwrite ${filename}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  try {
    await access("migration/reports/import-manifest.json");
    throw new Error("Refusing to overwrite migration/reports/import-manifest.json");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const sourceIds = results.map((result) => result.id);
  if (new Set(sourceIds).size !== sourceIds.length)
    throw new Error("Duplicate source IDs in conversion output");
  for (const result of results) {
    const directory = path.join("src/content", result.kind);
    await mkdir(directory, { recursive: true });
    const filename = path.join(directory, result.filename);
    await writeFile(filename, result.output, { flag: "wx" });
  }
  await mkdir("migration/reports", { recursive: true });
  await writeFile(
    "migration/reports/import-manifest.json",
    `${JSON.stringify(
      results.map(({ id, kind, filename, title, report }) => ({
        id,
        kind,
        filename,
        title,
        report,
      })),
      null,
      2,
    )}\n`,
    { flag: "wx" },
  );
  if (!uploadsPath)
    throw new Error(
      "Markdown was written, but uploads were not staged: provide --uploads <path> before --apply. Remove generated files safely before retrying.",
    );
  const staged = new Set();
  const attachmentPaths = [...attachments.values()]
    .map((attachment) => attachment.path)
    .filter(Boolean);
  for (const record of results) attachmentPaths.push(...record.report.uploadPaths);
  for (const original of new Set(attachmentPaths)) {
    let relative = original.replace(/^\/+/, "");
    if (relative.startsWith("2019/12/")) relative = relative.replace(/^2019\/12\//, "2019/2019/");
    const source = path.resolve(uploadsPath, relative);
    if (!source.startsWith(`${uploadsPath}${path.sep}`))
      throw new Error(`Unsafe upload path ${original}`);
    try {
      await readFile(source);
    } catch {
      throw new Error(`Missing upload ${original} (looked for ${source})`);
    }
    if (staged.has(original)) continue;
    const destination = path.join("public/wp-content/uploads", original);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
    staged.add(original);
  }
}
