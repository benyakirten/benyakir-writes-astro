# Gatsby/WordPress → Astro migration implementation plan

## 0. Purpose, authority, and execution rules

This is an implementation handoff, not a proposal to replace the search experience with a different product. Implement the migration in `benyakir-writes-astro`, using `benyakir-writes` as the read-only reference implementation. Do not modify the Gatsby repository as part of normal implementation. Do not cancel services, change DNS, publish production content, or purchase services without the owner's approval.

Prepared: 2026-10-24. Source code was inspected, but the WordPress database, uploads, plugins, and production content were not supplied or inspected. No builds or tests were run during preparation. References to existing behavior below are source-based; timing-sensitive behavior must be characterized before declaring parity.

The owner wants an agent to be able to execute this document without the preceding conversation. All product decisions made in that conversation are recorded here. Environment-specific facts that cannot be known yet are explicitly gated; do not invent credentials, SQL table names, database field names, custom post-type identifiers, repository URLs, or export contents.

### 0.1 Confirmed owner requirements

1. Replace the entire Gatsby site: posts, books, short stories, projects, portfolio, home, navigation, global search, listing search/filtering, pagination, and associated content relationships.
2. Remove the elaborate theme-customization system. Retain recognizable branding and typography, with a simplified light/dark/system preference control.
3. Preserve search/filter functionality, especially the existing trie autocomplete and Levenshtein alternatives. Do not silently substitute different matching or ranking.
4. Keep existing public content paths. The owner controls both `benyakir-writes.com` and `benyakiredits.com`, and intends to move them to Cloudflare.
5. The owner has access to the WordPress database and personally authored plugins/theme. Approximately 200 content items total, including books and stories; relatively few photographs.
6. Ignore drafts, private/unpublished content, revisions, comments, and other non-public WordPress history for publication. Keep backups private, not in the deployed site.
7. Convert legacy code blocks to ordinary Markdown fenced code blocks, using Astro's built-in syntax highlighting. Drop ALL code-block extras: no theme picker, copy button, line-number UI, filename toolbar, or client-side highlighter.
8. Future widgets are unspecified; interactive article demos are the likely use case. Support Markdown and opt-in MDX/component islands, without building speculative widgets or a backend now.
9. Host on Cloudflare Pages with GitHub integration: pull requests receive previews; merging to `main` rebuilds production.
10. Avoid traffic-based hosting overage charges. This is a static website, not an SSR application.
11. Remove PostHog and session replay. Use free Cloudflare Web Analytics for aggregate visits/performance.
12. Future articles are authored in version-controlled Markdown/MDX, without WordPress or a replacement CMS.

### 0.2 Defaults adopted by this plan

- Canonical origin: `https://www.benyakir-writes.com`, matching existing Gatsby metadata.
- Redirect other owned site hostnames to that origin rather than publishing duplicate canonical sites.
- Astro static output, no Cloudflare adapter, no Pages Functions, no Workers, no database, no runtime image service.
- React islands for existing complex interactive UI; Astro components for content/layout where possible.
- Preserve search compatibility quirks initially. Correcting them is a separate approved change, not an incidental migration refactor.
- Preserve exact pathname spelling/case and WordPress slugs. Canonical directory-style content paths end in `/`; accept old slashless requests through tested platform normalization.
- Use Astro's built-in Shiki with `github-light` and `github-dark`, connected to the site preference.
- Preserve Faustina/Mulish typography using locally served font assets.
- Keep all runtime-public media within Pages asset limits. Do not add R2 or another usage-billed service as an automatic workaround.
- Owner confirmation is needed only for genuinely missing source artifacts, real content ambiguities, platform/account actions, or deliberate departures from parity.

### 0.3 Non-goals

No new recommendation engine, semantic/vector search, hosted search, browser CMS, comments system, newsletter backend, authentication, session replay, arbitrary theme editor, or new content taxonomy routes merely because the data exists. Do not migrate WordPress/PHP into production. Do not scrape or query the live WordPress endpoint without permission: the old README explicitly discourages querying it.

---

## 1. Reference inventory and verified implementation facts

All paths in this section are relative to the sibling Gatsby repository unless prefixed otherwise. Keep access to this repository until the migration is complete; copy required reference fixtures and original tests into the new repository so future CI does not depend on a sibling checkout.

| Area                                  | Reference source                                                                    | What to port or replace                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Domain, WP origin, fonts/dependencies | `gatsby-config.js`, `package.json`                                                  | Canonical URL, source inventory; remove Gatsby/WP/PostHog dependencies                   |
| Routes, search-data generation        | `gatsby-node.js`                                                                    | Four detail-route prefixes, per-type transformations, metadata, vocabulary weights/order |
| Static pages                          | `src/pages/{index,blog,author,projects,portfolio,404,theme}.tsx`                    | Everything except theme customization                                                    |
| Content templates                     | `src/templates/{Post,Book,Shortstory,Project}.template.tsx`                         | Full article rendering, dates, relationships, links, covers, project details             |
| Data and descriptions                 | `src/data/search.ts`, `src/data/constants.ts`                                       | Searchable page descriptions, data adapters, 250 ms debounce, homepage ordering          |
| Global search UI                      | `src/components/Layout/Search/`                                                     | Modal, input, inline completion, alternatives, grouped results                           |
| Search algorithms                     | `src/utils/search.ts`, `src/workers/search.worker.js`                               | Trie, Levenshtein, worker result matching                                                |
| Listing filtering                     | `src/utils/filter.ts`, `src/hooks/useFilter.hook.ts`, `src/components/Filters/`     | Filter creation/removal, all/any, date/keyword/search filters                            |
| URL/pagination                        | `src/utils/queries.ts`, `src/hooks/usePagination.hook.ts`                           | Parameter compatibility, one-based URL pages, keyboard behavior                          |
| Global interaction                    | `src/components/Layout/`, including `Sidebar/`, `Shortcuts/`, `Modal.component.tsx` | Sidebar, dialogs, keyboard shortcuts, route changes                                      |
| Cards                                 | `src/components/Cards/`, `src/components/General/Author/`                           | All card variants and related-content summaries                                          |
| Portfolio                             | `src/components/Portfolio/`, `src/pages/portfolio.tsx`                              | Tabs, work history, biography, images, background, resume link                           |
| Types/content utilities               | `src/types/posts.d.ts`, `src/utils/{author,project,posts,dates}.ts`                 | Actual consumed custom fields; normalize without losing data                             |
| Code-block import                     | `src/utils/blocks/{identify-blocks.tsx,syntax-highlighter.ts,block-parser.ts}`      | Use as format documentation, NOT as the new conversion parser                            |
| Styles/assets                         | `src/styles/`, `src/files/images/`                                                  | Typography, visual identity, icons, project images, fallback covers                      |
| Project update lookup                 | `src/hooks/useFetchRepoUpdatedDate.hook.ts`                                         | Browser GitHub API behavior and fallback state                                           |
| Existing tests                        | `src/utils/tests/`, `src/hooks/tests/`, `cypress/`, `.github/workflows/`            | Useful starting coverage, not sufficient parity proof                                    |
| SEO                                   | `src/components/SEO/HeadBase.component.tsx`                                         | Existing title pattern and author; extend with canonical/OG/schema/feed                  |

### 1.1 Existing routes

- `/`: mixed latest content. Despite the variable name `latestTwentyItems`, current code takes **10** items.
- `/blog`: post listing with date, tag, category, and multiple text filters.
- `/author`: books and stories combined with date and text filters.
- `/projects`: project listing with date, host, technology, and text filters.
- `/portfolio`: biography/work-history/recent-project tabs.
- `/post/{slug}`, `/book/{slug}`, `/story/{slug}`, `/project/{slug}`: detail routes.
- `/theme`: removed feature. Redirect to `/`, remove from navigation and global searchable pages.
- Unknown path: real 404, not an SPA success response.

Category JSON files are generated by Gatsby, but no current category route creation was found. Some old Cypress tests reference obsolete pages/selectors. Do not create routes based solely on obsolete tests; obtain actual legacy URL inventories first.

### 1.2 Important source limitations

- The generated `src/data/wp/**` JSON is absent from the inspected checkout. It is generated from WordPress, not committed source.
- `src/data/searchData.json` is NOT the active search data source. The worker uses the richer arrays imported by `src/data/search.ts`.
- Gatsby templates inject WordPress HTML; the Markdown migration must preserve content, not copy that HTML-injection architecture wholesale.
- The Post template preprocesses custom code blocks; the other templates directly render HTML. Inventory code blocks in all content types anyway.
- The TypeScript types describe Gatsby's consumer assumptions, not the authoritative database or ACF registration schema.
- WordPress database access does not imply possession of media binaries. The uploads backup is mandatory before shutdown.

---

## 2. Architecture and cost constraints

### 2.1 Production architecture

```text
GitHub: Markdown/MDX + public media + application code
       ↓ dependency install and static build
Astro Content Collections → static HTML/CSS/JS + RSS/sitemap
       ↓ Cloudflare Pages Git integration
Cloudflare Pages CDN
       ↓
Browser: global search worker, trie suggestions, React listing islands
```

WordPress exists only during offline extraction/verification. Normal production builds must not contact WordPress, require its credentials, run PHP, import a SQL backup, or depend on a developer's private filesystem.

### 2.2 Hosting promise: precise scope

As checked on 2026-10-24, Cloudflare documents **static asset requests as free and unlimited**, when they do not invoke Functions. This is the reason for choosing static Pages. It is not a perpetual contractual guarantee about all Cloudflare products or future pricing.

Current documented Free-plan constraints include:

- 500 builds/month; 1 concurrent build; build timeout 20 minutes.
- 20,000 files per site.
- Maximum single asset size 25 MiB.
- `_redirects`: 2,000 static + 100 dynamic redirects, maximum 2,100 total.
- `_headers`: maximum 100 rules, 2,000 characters per individual header.
- Pages Functions use Workers quotas/pricing; do not use them here.

Hard requirements:

1. Use `output: 'static'` and no server adapter.
2. No `functions/`, `_worker.js`, runtime server endpoints, SSR middleware, on-demand image transformation, KV, D1, Durable Objects, R2, or Workers Paid subscription needed by this site.
3. Search/filter requests run locally in the browser against bundled/static assets. No search endpoint.
4. Build-time image transformation only.
5. Use free Web Analytics, not a paid analytics/replay product.
6. Add artifact checks for file count, largest file, and forbidden runtime entrypoints.
7. If a limit is exceeded, fail with an actionable report. Do not automatically enable a billed service.
8. Keep paid add-ons disabled and document which account plan/settings were verified. Billing alerts alone are not spending caps.
9. Domain renewals, optional paid GitHub features/Actions usage, registrar costs, and future third-party embeds are separate from static request hosting. Keep within included CI/build quotas; do not promise all related services are permanently free.

The expected ~200-item site should fit, but measure the actual built asset count/size, especially responsive-image variants. Recheck current terms immediately before launch.

### 2.3 Search solution decision

| Option                               | Advantages                                                                                                | Why chosen/not chosen                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Port current algorithms and React UI | Exact trie weighting, tie ordering, Levenshtein alternatives, filters and URL contract; no hosted service | **Chosen**; lowest behavioral risk                                                                                |
| Pagefind                             | Good static full-text search and small indexes                                                            | Different tokenizer, results, ranking, and suggestions; cannot establish exact parity by configuration            |
| Fuse/MiniSearch/Lunr                 | Flexible browser search                                                                                   | Different fuzzy matching/ranking and corpus semantics; would require reimplementing existing behavior around them |
| Hosted/server search                 | External indexing/scaling                                                                                 | Unneeded at this size; network, privacy, service dependency, possible usage costs                                 |

Do not add a search library for this migration. The existing algorithms are small enough to port, test, and retain. There is no separate related-article recommendation engine in the inspected code: the search “recommendations” are the clickable “Did you mean” alternatives. Preserve those, plus explicit book/story/project relationships and the homepage latest-items list.

### 2.4 Framework/tooling choices

- Current stable Astro supported by the deployment build environment; verify current Node requirements at scaffolding time. Use Content Layer collections, `glob()` loaders, `getCollection()`, and the current `render()` API rather than copying obsolete Astro tutorials.
- Compatible stable `@astrojs/react`, React/React DOM, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`.
- TypeScript strict mode; `@astrojs/check` for `astro check`.
- pnpm, matching the old repository's package-manager preference. Pin the package-manager release in `packageManager`, commit `pnpm-lock.yaml`, and pin a compatible Node LTS in local/CI/Pages settings.
- Vitest + Testing Library for algorithms/hooks/components; Playwright + axe integration for browser behavior/accessibility.
- Biome for applicable TS/JS/JSON lint/format checks, with a compatible formatter for Astro/Markdown if needed. Do not assume Biome covers every `.astro` template.
- CSS variables/global typography plus component styles/CSS modules. Port styled-components rules into CSS; do not carry the old Redux theme architecture into the new app.
- Temporary migration dependencies: a robust HTML parser such as parse5, Turndown plus GFM tables support, a YAML serializer, and a schema validator. Use maintained compatible releases, document and lock them. No handwritten HTML parser or SQL-by-regex converter.
- Preserve the original license/attribution obligations when copying code and assets.

---

## 3. Repository structure and module boundaries

Create this structure; exact component subnames can follow the copied UI, but do not merge responsibilities into a single giant migration script.

```text
benyakir-writes-astro/
  ASTRO_TRANSITION_PLAN.md
  README.md
  package.json
  pnpm-lock.yaml
  astro.config.mjs
  tsconfig.json
  .node-version
  .gitignore
  .github/workflows/ci.yml
  content/
    posts/{slug}.md
    books/{slug}.md
    stories/{slug}.md
    projects/{slug}.md
    search-compat.json
  public/
    wp-content/uploads/...           # preserved public attachment paths
    images/...                      # existing site-owned images/icons
    _headers
    _redirects                      # generated or reviewed from route manifest
    robots.txt                      # generated per environment if needed
  src/
    content.config.ts
    config/site.ts
    data/portfolio.ts
    layouts/SiteLayout.astro
    layouts/ArticleLayout.astro
    components/cards/...
    components/content/...
    components/islands/SiteChrome.tsx
    components/islands/listings/...
    components/islands/portfolio/...
    components/widgets/README.md
    components/ThemePreference.astro
    lib/content/{records,relationships,routes,dates}.ts
    lib/search/{types,legacy-transform,build-index,search,trie}.ts
    lib/filters/{filter,queries,...}.ts
    hooks/...
    workers/search.worker.ts
    generated/search-data.json       # ignored, recreated each build
    generated/route-manifest.json    # ignored, recreated each build
    styles/{tokens,global,article,islands}.css
    pages/index.astro
    pages/blog.astro
    pages/author.astro
    pages/projects.astro
    pages/portfolio.astro
    pages/post/[...slug].astro
    pages/book/[...slug].astro
    pages/story/[...slug].astro
    pages/project/[...slug].astro
    pages/404.astro
    pages/rss.xml.ts
  scripts/
    migration/{inspect,normalize,media,convert,verify,...}.ts
    build-data.ts
    validate-content.ts
    validate-dist.ts
    validate-links.ts
  migration/
    README.md
    input/                          # ignored: private local export artifacts
    work/                           # ignored: intermediate/archive data
    overrides/                      # committed, reviewed conversion fixes
    reports/                        # sanitized summaries only if committed
  tests/
    fixtures/{wordpress,search,content,...}/
    reference/                      # isolated copies of original algorithms
    unit/...
    integration/...
    e2e/...
  docs/
    architecture.md
    authoring.md
    migration.md
    deployment.md
    cutover-checklist.md
    search-compatibility.md
```

Do not deploy `content/` as raw files by accident: Astro renders entries from outside `public/`. Anything under `public/` is public. Ignore SQL, credentials, raw XML exports, private WordPress configuration, user tables, and large intermediate backups. Keep a private offline archive outside Git as well.

`src/generated/` output must be deterministic and rebuilt from committed public content/compatibility data. Normal development must generate it before worker imports are resolved. `predev`/`prebuild` scripts or one shared explicit build entrypoint should enforce this.

### 3.1 Required command contracts

Implement and document these commands (these are target scripts, not commands available in the currently empty project):

| Command                                                 | Contract                                                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                              | Generate local data; start Astro dev; editing articles refreshes derived data through a development-only watcher/hook |
| `pnpm check`                                            | Typecheck `.astro` and TS; no network content fetch                                                                   |
| `pnpm lint`                                             | Lint supported sources                                                                                                |
| `pnpm test:unit`                                        | Non-watch deterministic unit/integration tests                                                                        |
| `pnpm test:e2e`                                         | Build/serve production output using Playwright-managed web server and run browser tests                               |
| `pnpm validate:content`                                 | Schemas, dates, references, slugs, compatibility coverage, no secret/draft leakage                                    |
| `pnpm build:data`                                       | Generate worker/listing datasets, vocabulary, route manifest and redirects from committed source                      |
| `pnpm build`                                            | Validate content → generate data → Astro build → validate dist and local links                                        |
| `pnpm preview`                                          | Preview built static site locally                                                                                     |
| `pnpm migrate:inspect -- --input <directory>`           | Read private export, produce inventory; no content overwrites                                                         |
| `pnpm migrate:convert -- --input <directory> --dry-run` | Propose normalized content/assets/reports in staging                                                                  |
| `pnpm migrate:convert -- --input <directory> --apply`   | Apply reviewed staged output, collision-safe and provenance-aware                                                     |
| `pnpm migrate:verify`                                   | Compare migration input manifest/staging to Markdown/build; report every exception                                    |
| `pnpm test:search-parity`                               | Differential old/new search, suggestions, filter/URL and ordering tests                                               |

Migration flags must accept real user-supplied paths; refuse placeholder paths or missing artifacts. Conversion is a one-time workflow, not part of the Pages build.

---

## 4. Phase A: source acquisition, safety, and baseline capture

### 4.1 What the owner must provide, and when

No export is required to understand the target architecture. Real artifacts ARE required to implement/verify the importer and to release the migrated content:

1. Full database backup, with version/encoding noted. Keep the original immutable.
2. Complete public media backup, usually `wp-content/uploads`, including originals and referenced derivatives/downloads. Obtain this separately from SQL.
3. Custom plugin/theme source and ACF field definitions/registration code. If values are stored using ACF or PHP serialization, use WordPress-aware APIs during extraction.
4. Enough local WordPress installation/environment information to load the backup offline: WordPress/PHP/database versions and relevant plugins. Do not copy production secrets into Git.
5. Optional WXR XML export as a cross-check, not the only authority for custom fields/media.
6. If available, last successful Gatsby build's generated search JSON, route/page-data manifests, sitemap, or a sanitized snapshot of the GraphQL results used in `gatsby-node.js`. These improve exact baseline ordering and text fidelity.
7. A few owner-selected representative articles, especially code-heavy and relationship-heavy entries, for visual signoff.

Database + custom code is sufficient to design the structured extraction, but not sufficient to restore missing binary files. Do not say media is migrated until those files actually exist locally.

### 4.2 Restore locally, never execute production SQL against a live service

1. Create an isolated local WordPress/database environment using the owner's artifacts. Use local container volumes inside an approved working directory, not production hosts.
2. Inspect custom post-type registration and field code. Record actual post-type identifiers, taxonomy identifiers, field keys, serialization, and relationship representation.
3. Inspect table prefix/multisite status rather than assuming `wp_`.
4. Restore a copy of SQL using the correct database engine. Treat it as sensitive untrusted input; no shell evaluation of SQL contents.
5. Disable outgoing email, cron jobs, payment integrations, webhooks, analytics, and external writes. Restrict outbound network where possible. Review custom plugin activation effects before running it.
6. Load needed plugins/theme so `the_content` filters, shortcodes, and custom block rendering work locally.
7. Set explicit local URLs only in the disposable copy. Keep original canonical URLs in the export manifest; avoid destructive search-replace of serialized SQL.
8. Use a WP-CLI/PHP exporter loading WordPress APIs (`get_posts`, metadata/taxonomy/attachment APIs, content filters). A pure SQL parser is not the default. If WPGraphQL is required to reproduce old resolver values, query the local restored instance only.
9. Collect only published/public content whose types belong to this site. Do not export user passwords/options/secrets into public normalized JSON.
10. Preserve both `post_content` (raw blocks/shortcodes) and fully rendered content. Record precisely which content filter path reproduces Gatsby's GraphQL `content` values.

### 4.3 Export contract

Version the normalized export schema. Emit UTF-8 JSON/JSONL and a manifest, never rely on ad hoc SQL parsing later. Each exported entry includes:

- `schemaVersion`, actual source post type, database ID, GraphQL/global ID if available, status.
- Original slug, title as returned to Gatsby and separately decoded display title, original permalink/URI, all known legacy paths.
- `post_date`, `post_date_gmt`, modification values, WordPress timezone option/offset settings. Preserve original strings.
- Raw body, rendered body, raw and rendered excerpt, including WordPress-generated excerpt if Gatsby used it.
- Taxonomy names/slugs/IDs and their original API order.
- All relevant custom field raw values and normalized values; raw relationship IDs plus resolved type/slug/title.
- Attachment records: ID, original URL, relative upload path, MIME, file size, checksum, dimensions, alt, caption, description, derivative metadata.
- Custom field covers and designer/alternate/purchase links, even if not present in search queries.
- Per-type source ordering matching the previous Gatsby node arrays when recoverable. Preserve this separately from publication sort.
- A list of required local media and unresolved external URLs.

Do not assume the field name `shortStory` is a SQL column or ACF key: it is a GraphQL field name in the old frontend. Inspect real registration code.

### 4.4 Baseline and parity fixtures

Before conversion:

1. Save a sanitized public-only source snapshot with original rendered HTML/excerpts and ordering.
2. Capture the active Gatsby search datasets if available: books, stories, posts, projects, project miscellany and lookup counts. Do not substitute unused `searchData.json`.
3. If they are unavailable, run the original pure transformations against the sanitized local export; record that this baseline is reconstructed. Compare against any deployed artifacts or the owner-approved old site where accessible.
4. Copy old pure algorithms/tests into `tests/reference/` with imports isolated. Adapt IO only, not matching semantics. Tests must not import production WordPress or Gatsby.
5. Freeze expected ordered IDs/slugs and suggestions for selected query fixtures before writing the new implementation.
6. Capture representative visual references and UI interaction behavior from a running local Gatsby build when feasible. If Gatsby cannot build due to old dependencies, record the limitation, use exported datasets/pure tests, and require owner signoff for unverified UI behavior. Do not claim runtime parity from source inspection alone.
7. Record original source order and timezone in a committed sanitized manifest. Tie behavior cannot be guaranteed from database IDs guessed after the fact.

Exit gate: public-only counts by type, required artifacts, timezones, custom-field mapping, media inventory, actual paths, and baseline provenance are documented. No production cutover before unresolved content/source-order questions are addressed or explicitly accepted.

---

## 5. Phase B: content model and Markdown authoring contract

### 5.1 Content Collections

Define four collections in `src/content.config.ts` with a shared base schema and type-specific extensions. Use an explicit frontmatter `slug`, not a title-to-slug derivation. Normalize collection references through one route helper.

Base fields:

| Field                   | Type / rule                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `title`                 | Nonempty Unicode string, decoded once for display                                                       |
| `slug`                  | Exact source slug/path; no leading/trailing slash, `..`, query/hash, or unsafe path traversal           |
| `published`             | Quoted `YYYY-MM-DD` calendar date, validated strictly; no implicit YAML date casting                    |
| `publishedAt`           | Optional explicit-offset/RFC3339 timestamp for actual instants; use when known, never invent a timezone |
| `updated` / `updatedAt` | Optional date/timestamp with equivalent validation                                                      |
| `description`           | Plain-text SEO description, not raw HTML                                                                |
| `excerpt`               | Optional author-controlled readable summary; imported excerpt is preserved semantically                 |
| `legacy`                | Optional object: `wpId`, actual `postType`, `paths: string[]`, `sourceOrder`, `searchProfileId`         |
| `cover`                 | Optional local absolute URL plus alt/width/height metadata, where relevant                              |
| `draft`                 | Optional, default false; future drafts must be excluded from all public indexes/routes/feed/sitemap     |

Use separate legacy search fields in the compatibility source, not raw legacy HTML in human-facing frontmatter. Keep Markdown as the article source of truth.

Posts:

- `categories: string[]`, `tags: string[]`, preserving display spelling/order.
- No automatic full-body search expansion; see search compatibility policy below.

Books:

- `purchaseLinks: { name: string; url: string }[]`.
- Optional `coverDesigner: { name; bio; links: { name; url }[] }`.
- Optional `relatedProject: { slug: string; description?: string }`.
- `relatedStories: string[]` of story slugs, preserving source order.
- Cover and alt text; absence uses the migrated fallback cover instead of a broken URL.

Stories:

- `alternateLinks: { name; url }[]`.
- Optional `relatedBook: { slug: string; relationship?: string }`.
- Related project information is resolved through the related book, matching the current detail page.
- Do not fabricate reciprocal book relationships if source directions disagree; report discrepancy and preserve explicit source relations pending review.

Projects:

- `firstReleased: YYYY-MM-DD`, optional `latestUpdate: YYYY-MM-DD`.
- `technologies: string[]` containing existing short tokens; derive long labels using the old mapping.
- Optional `hostedOn`, `mainLink`, `repoLink`.
- Optional explicit project screenshot asset metadata. Import the old filename-to-title association once; do not keep brittle title-based inference for new projects.
- `published` is set to the first-release calendar date for common content sorting; preserve first-release separately for compatibility.

### 5.2 Mapping of known custom fields

| Existing GraphQL field                               | New field/handling                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `book.publishedOn`                                   | Book publication calendar date + raw value in private export/compatibility record |
| `book.purchaseLinks`, `purchaseLinksNames`           | Paired named URL objects                                                          |
| `book.coverDesigner`, `coverDesignerBio`             | Designer name/bio                                                                 |
| `book.coverDesignerLinks`, `coverDesignerLinksNames` | Paired designer link objects                                                      |
| `book.cover`                                         | Local preserved attachment path and metadata                                      |
| `book.relatedStories`                                | Story references in original order                                                |
| `book.relatedProject`, `relatedProjectDesc`          | Project reference/description                                                     |
| `shortStory.publishedOn`                             | Story publication date                                                            |
| `shortStory.alternateLinks`, `alternateLinksNames`   | Paired named link objects                                                         |
| `shortStory.relatedBook`, `relationshipToBook`       | Related book/relationship text                                                    |
| `project.firstReleased`, `latestUpdate`              | Explicit date fields                                                              |
| `project.technologies`                               | Original short tokens split on literal `, ` for migration compatibility           |
| `project.hostedOn`, `mainLink`, `repoLink`           | Equivalent optional fields                                                        |
| Post `date`, `excerpt`, categories/tags              | Date, summary and taxonomy arrays; legacy search projection separately            |

Existing link utilities split paired strings on literal `, ` and pair by position, falling back to the URL if the name is missing. Preserve raw strings in the archive; log unequal arrays, suspicious comma-containing URLs, empty links, and invalid schemes. Normalize public links to reviewed `{ name, url }` objects, allowing HTTP(S) and intentional `mailto:` links where appropriate. Never silently discard unmatched data.

### 5.3 Dates and timezones

Current code parses custom publication dates as month-first strings, and post dates as year-first strings, then passes strings into `new Date()`. That is not a reliable new content schema.

- Preserve source date strings, WP timezone settings, and actual UTC timestamps in migration artifacts.
- Parse known custom date format explicitly after inspecting the export. Do not infer `DD/MM` versus `MM/DD` from ambiguous dates.
- Store calendar dates as quoted strings; never let displaying `YYYY-MM-DD` in a local timezone shift the day.
- Use explicit formatting helpers for displayed dates and `<time datetime>`.
- Retain captured legacy serialized search instants for imported entries. They are independent from the safer display-date model so date-filter parity can be tested.
- Set the baseline/build timezone explicitly and document it. Run tests in at least UTC and a non-UTC timezone; the browser's current date-filter local-midnight semantics remain the compatibility rule.
- For new date-only entries, define deterministic UTC midnight as the search instant, document that choice, and derive legacy month/year tokens from the calendar date. Do not reparse month-first strings on Cloudflare.

### 5.4 References and routes

- Collection entry IDs/file paths and frontmatter slugs are not interchangeable. Resolve relationships by explicit collection + slug, then pass valid collection entry IDs to any Astro reference API.
- Validate duplicate slugs within a type, case-fold collisions on case-insensitive filesystems, encoded URL collisions, missing references, unsafe paths, and collisions with static routes/assets.
- Detail pages use `getStaticPaths()` and `render(entry)`. Wrap content with the correct type-specific metadata/relationship UI.
- All link creation uses `routeFor(type, slug)` and a single canonical URL helper.
- Preserve heading IDs and old internal fragment links. Build an anchor map; use reviewed legacy ID aliases for changed auto-generated IDs. Do not assume Astro's heading slug algorithm matches WordPress.

### 5.5 Authoring examples

Post example (illustrative slug/content, not an actual imported article):

```yaml
---
title: "A new article"
slug: "a-new-article"
published: "2026-10-24"
description: "A short plain-text description."
excerpt: "A short summary used on cards and in the compatibility search projection."
categories: ["Development"]
tags: ["Astro", "TypeScript"]
---
```

Write ordinary code using fenced blocks with a language, such as `ts`, `js`, `tsx`, `python`, `php`, `graphql`, `css`, `scss`, `erlang`, `elixir`, or `go`. No extra metadata is necessary. Future posts with interactive demos may use `.mdx`; ordinary migrated articles should stay `.md` wherever possible.

---

## 6. Phase C: robust HTML → Markdown conversion

### 6.1 Pipeline order

Implement a deterministic staged pipeline with per-entry provenance:

1. Read schema-validated normalized export; restrict to approved public types/statuses.
2. Capture the legacy search projection BEFORE changing HTML, excerpts, links, whitespace, or entities.
3. Parse rendered HTML with a real HTML parser, retaining original source locations/raw text where code payload extraction needs them.
4. Identify/extract custom code blocks recursively, even when nested inside Gutenberg wrappers.
5. Identify normal `<pre><code>` blocks before generic HTML conversion; protect their exact code payloads.
6. Inventory unsupported blocks, shortcodes, embeds, scripts, tables, galleries, audio/video, downloads and inline styling.
7. Rewrite internal site links and media URLs through the reviewed URL/media manifests.
8. Convert ordinary HTML to Markdown using explicit GFM rules and protected code-block placeholders/AST nodes.
9. Retain narrowly reviewed raw HTML for structures Markdown cannot express adequately (e.g. complex tables or media controls), rather than losing content. Report every retained structure.
10. Serialize frontmatter using a YAML library, not string concatenation.
11. Parse and render the resulting Markdown/MDX with the actual Astro pipeline; compare semantic content, links, images, headings and code payloads with the input.
12. Apply explicit reviewed overrides keyed by type/source ID and input checksum; do not hand-edit generated output then blindly rerun the importer.
13. Stage everything, report differences, then apply only after review.

Do not port `BlockParser` as an HTML migration parser. It is a hand-built tag/stack parser with limited handling of void elements, comments, attributes, and nested custom blocks. Do not use regex alone to convert arbitrary HTML.

### 6.2 Custom syntax-highlighter conversion: exact format

The known custom block has class `benyakir-syntax-highlighter`; the first `<pre>` contains JSON with:

```json
{
  "lang": "tsx",
  "code": "const x = __L_ANGLE_BRACKET__Demo /__R_ANGLE_BRACKET__;",
  "theme": "darcula"
}
```

Conversion algorithm:

1. Find each matching element by class token anywhere in the parsed tree.
2. Locate its relevant `<pre>` and capture the raw serialized inner text. Existing Gatsby code parses the literal substring between `<pre...>` and `</pre>` with `JSON.parse`; do not automatically decode entities first and change valid JSON semantics.
3. Attempt the documented raw JSON parse. If export encoding requires one HTML-entity decode to obtain valid JSON, use that only as an explicit tested fallback, record which path was used, and preserve the original raw payload in the private report. Never repeatedly decode until parsing happens to succeed.
4. Validate `lang`/`code` types. Ignore `theme` for output but record it in migration provenance.
5. Replace exactly these tokens in `code`:
   - `__L_ANGLE_BRACKET__` → `<`
   - `__R_ANGLE_BRACKET__` → `>`
   - `__L_CURLY_BRACKET__` → `{`
   - `__R_CURLY_BRACKET__` → `}`
6. Do not interpret the resulting code as HTML or execute it. Do not run `.trim()`, dedent, format, or normalize internal whitespace.
7. Map language aliases to supported Shiki names. Known source languages: `js`, `jsx`, `ts`, `tsx`, `python`, `php`, `graphql`, `css`, `scss`, `erlang`, `elixir`, `go`.
8. Unknown languages: preserve the code, report the label, require a reviewed alias or explicit plain-text fallback. Do not silently assume JavaScript.
9. Emit a fence longer than the longest run of the selected fence character in the code (minimum three). This prevents a code sample containing Markdown fences from breaking the article.
10. Preserve leading spaces, blank lines, backslashes, Unicode and meaningful trailing whitespace. Normalize line endings only under a documented LF policy. Markdown fences impose a structural final newline; record/test that exception instead of pretending arbitrary missing-final-newline bytes are always preserved.
11. Replace the entire custom wrapper, not just the `<pre>`, so no JSON or duplicate rendering remains.
12. Invalid/missing JSON is a blocking migration issue, not permission to delete the block or ship raw JSON to readers.

For ordinary code blocks, decode HTML entities exactly once as appropriate to `<code>` text content; distinguish this from JSON extraction. Inline code remains inline code.

### 6.3 Other HTML rules

- Preserve headings, paragraphs, ordered/unordered lists, nested lists, emphasis, strong text, links/titles, blockquotes, horizontal rules, inline code, tables, and deliberate line breaks.
- Decode prose entities into Unicode rather than deleting them. This is separate from the frozen legacy search normalizer, which historically deletes entities.
- Preserve image alt text/captions and semantic `<figure>` where necessary.
- Remove WordPress editor/block comments after interpreting them, not before extracting required structure.
- Inventory sharing widgets. Existing code removes `sharedaddy` and literal misspelling `sd-sharing-enbaled` only in limited contexts. Strip clearly identified obsolete sharing controls, including actual variants, with recorded removal counts; do not remove arbitrary content based on broad substring matching.
- Shortcodes must be rendered locally or translated through an explicit mapping. A leftover shortcode is an error unless intentionally displayed as a code example.
- Review embeds individually. Prefer static links or locally preserved thumbnails when full interactivity is unnecessary. Keep legitimate essential iframe/audio/video embeds only with appropriate attributes and documented external dependency/privacy impact. Do not invent providers absent from the export.
- Do not copy plugin analytics, arbitrary scripts, event-handler attributes, `javascript:` URLs, PHP, or unsafe HTML into public Markdown. Avoid a global sanitizer that accidentally destroys legitimate code samples: sanitize structural HTML, not fenced code text.
- Preserve existing content literally where possible. Do not rewrite article prose during migration.

### 6.4 Override and rerun safety

- Every staged output records source ID, input SHA-256, converter version and output path.
- Default mode is dry run; `--apply` refuses to overwrite unknown/manual files.
- If an imported article has changed since the last migration manifest, stop and report a conflict. Never overwrite later authored Markdown.
- Same input + overrides + converter version → identical output bytes; no timestamps/random ordering in generated content.
- Reports list counts of converted custom blocks, ordinary code blocks, retained HTML, removed widgets, missing media, unresolved shortcodes, broken references, and warnings by article.

Exit gate: every exported public entry maps to exactly one intended Markdown entry or an explicitly approved exclusion; zero unexplained dropped blocks/code/media.

---

## 7. Phase D: media localization and URL migration

### 7.1 Media strategy

Preserve the original public upload path under `public/wp-content/uploads/` for referenced media. This makes old attachment URLs compatible after hostname canonicalization and avoids large redirect tables for every image derivative.

1. Inventory all URLs in `src`, `srcset`, `href`, `poster`, relevant lazy-load attributes, inline CSS URLs, covers and attachment fields. Parse `srcset` correctly.
2. Classify site-owned WordPress media versus intentional third-party resources. Do not mirror arbitrary external URLs without authorization.
3. Build source-URL/attachment-ID → local URL maps. Strip local restoration hosts and map confirmed original hosts. Use structured URL parsing, not global string replacement.
4. Verify each mapped file is inside the backup root; reject traversal/symlink escapes and conflicting path/case variants.
5. Preserve referenced derivatives as needed. Validate all `srcset` candidates; do not keep remote candidates just because `src` is local.
6. Hash files, detect collisions, record MIME/dimensions, preserve alt/caption. Do not convert SVG by executing it; review/sanitize externally sourced SVG.
7. Copy old `src/files/images/` assets into a documented new structure: logo/icon, fallback covers, technology/social icons and project screenshots.
8. Build-time optimized derivatives may be used for cards/covers, but original compatibility URLs must still resolve. Limit formats/widths so file count remains reasonable.
9. Add width/height where known, responsive styles, and lazy loading below the fold. Do not lazy-load the main above-the-fold image by default.
10. Fail if a required asset is missing or >25 MiB. Owner must choose compression/splitting/exclusion/another explicitly approved approach before deployment; no automatic billed storage.

The portfolio currently links to an external `utfs.io` resume. Preserve that existing link initially, document it as an external dependency, and offer localization only if the owner supplies the file and authorizes the change. Do not silently delete it or assume it belongs to the WordPress uploads backup.

### 7.2 Route manifest

Generate a versioned manifest with each source ID/type, old public pathname(s), canonical new pathname, canonical URL, known anchors, and relevant legacy WordPress paths. Sources include Gatsby route generation, WP permalink export, any sitemap/build manifest, and owner-provided high-value links.

- Main content prefixes remain `/post/`, `/book/`, `/story/`, `/project/`.
- Same-path redirects should rely on tested slash normalization, not unnecessary redirect chains.
- Map WordPress permalinks that differ from Gatsby paths explicitly. Do not assume every WordPress path is `/post/{slug}`.
- Map legacy attachment links to local assets where known.
- Do not proxy or forward `/wp-admin`, `/wp-login.php`, `/graphql`, or WordPress APIs to a vanished backend. They should not expose backup data; unknown retired endpoints may return 404.
- Do not configure an SPA catch-all that converts unknown routes to homepage 200s.
- Query-based WordPress links such as `?p=123` require separate handling: Pages path redirects do not provide arbitrary query-to-post lookup. Inventory actual use and use supported free Cloudflare redirect rules/Bulk Redirect capabilities only after checking query support and quotas. If no zero-cost supported mapping fits, record the limitation and obtain owner approval; do not introduce a Worker merely to hide it.

### 7.3 Domains, TLS, redirects and canonicalization

The owner's control of domains/certificates is sufficient to plan the move, but **DNS and certificates are not redirects**. Configure both hosting association and HTTP canonicalization.

1. Add both domains as Cloudflare zones where apex Pages domains are required; migrate nameservers when authorized.
2. Preserve existing MX, SPF, DKIM, DMARC, verification and other non-web DNS records. Domain migration must not break email.
3. Keep `https://www.benyakir-writes.com` canonical.
4. Associate the needed apex/`www` hostnames with Pages using its Custom Domains workflow; do not create CNAMEs blindly before association.
5. Use supported free zone Redirect Rules/Bulk Redirects for `benyakir-writes.com`, `benyakiredits.com`, and `www.benyakiredits.com` → canonical hostname, preserving path/query. Apply explicit legacy pathname mappings with tested precedence where the old domains used different routes.
6. Provision/verify managed TLS for each hostname; inspect CAA restrictions. Existing origin certificates do not automatically configure Pages.
7. Redirect HTTP to HTTPS and avoid loops/chains. Use permanent redirects after validating them; use temporary rules during rehearsal if appropriate.
8. Ensure the production `pages.dev` hostname is not a second indexed canonical site. Redirect only the production alias if using a host rule; do not accidentally redirect every preview deployment away from its preview.
9. Canonical tags/RSS/sitemap always use the production canonical origin, never branch preview hosts.
10. Test incoming query parameters used by listing filters survive domain redirects byte-equivalently enough to parse identically. Preserve fragments through normal browser redirect behavior and validate key anchor links.

---

## 8. Phase E: exact search compatibility

### 8.1 Separate content rendering from legacy search projections

Markdown conversion changes HTML, entities, whitespace and paragraph boundaries. Running the old regex normalizer on newly rendered Markdown will NOT necessarily recreate the old index. Preserve compatibility explicitly.

Create committed `content/search-compat.json` containing only sanitized, previously public search inputs/projections and source ordering, keyed by `type:slug`. It is not a database dump and must contain no credentials/drafts/user data. Do not include media binaries or raw complete SQL.

For each imported entry store:

- Stable key and original per-type source order.
- Exact old search-facing title and content/excerpt projection (which may contain short raw HTML for books/projects).
- Exact legacy date-information object serialized as ISO instant plus original year/month/full/short values.
- Ordered metadata-input token stream **after the old per-type field selection and truthy filtering, before `generateLookup()`**, coercing purchase-link objects to their legacy string representation deliberately.
- Categories/tags, technology/host fields and named relationships needed by the active search/card adapters.
- Profile version, source checksums and an authoring-field fingerprint for fields whose edits affect search.

This compact profile permits deterministic regeneration of metadata booleans and global frequency counts in the old order without retaining a running WordPress dependency. Preserve the exact original per-record snippet separately from a safer display excerpt if it contains partial HTML; render search output as text or through a reviewed adapter, never blindly inject a truncated unsafe HTML string.

Rules:

1. The importer captures these projections from the original source/transforms, before Markdown conversion.
2. Imported entries use their captured projections at launch. Content schemas/references/rendering still use Markdown, not the compatibility file.
3. Every non-draft entry must have either a valid imported profile or the current native-content profile; no unindexed orphan entries.
4. For future Markdown entries, generate the same per-type metadata shape from a deterministic plain-content AST projection: exclude executable MDX expressions/scripts, resolve text deliberately, no runtime rendering of widgets to index them.
5. Preserve existing per-type scope: posts use title, excerpt, categories/tags/date, **not full article bodies**; stories contribute full text to metadata; books/projects use the legacy 300-character projection.
6. Require/derive a deterministic excerpt for native posts. Document derivation (first prose paragraph, legacy cleanup/truncation) and permit explicit frontmatter override.
7. Order new native entries deterministically after imported source-order entries within each type (explicit migration order then stable slug order is acceptable). Final displayed sorting remains date descending. New vocabulary necessarily changes aggregate suggestions; exact parity claims apply to the frozen launch corpus.
8. Detect relevant imported entry edits using fingerprints. Provide a documented refresh command to update its profile from new authoring content; require a diff of search fixtures. Do not silently retain stale search data after substantive edits or attempt to recreate the old PHP rendering forever.
9. Test profile generation against original active datasets, not a new implementation's own output.

### 8.2 Global result matching contract

Port `src/workers/search.worker.js` into a pure `search(query, dataset)` module plus a small module worker wrapper.

Algorithm:

```text
falsy query → null
words = query.toLowerCase().split(" ")
for each group:
  preserve input order
  retain item if ANY word matches ANY searchable field
```

Searchable fields:

| Group    | Fields                                                                               |
| -------- | ------------------------------------------------------------------------------------ |
| Pages    | Lowercased title and description                                                     |
| Books    | Lowercased title/content; metadata lookup                                            |
| Stories  | Metadata lookup; lowercased title/content                                            |
| Projects | Metadata lookup; lowercased title/content                                            |
| Posts    | Metadata lookup; lowercased title; optional excerpt/content; category/tag substrings |

- No trim, stemming, stop-word removal, punctuation normalization, relevance score, phrase matching, or typo matching in results.
- Split on literal ASCII spaces, not arbitrary whitespace.
- Multiple terms are OR. Empty tokens can match everything through `.includes('')`.
- Project technologies/host/repository markers are searched through metadata globally, not additional worker field matching.
- Levenshtein affects alternatives only, not result matching/ranking.
- Return `{ books, projects, posts, stories, pages }` or null. UI display order is Pages, Books, Stories, Projects, Blog Posts.
- Preserve date-descending source arrays: publication for posts/books/stories, first release for projects; stable ties follow captured order.
- No new result limit or global-search pagination.
- Static searchable pages are Blog, Home, Portfolio, Projects, Author in their original relative order. Remove Theme as an explicit approved feature removal.
- Copy searchable descriptions verbatim from old `src/data/search.ts` for launch. Description rewrites change matches and require intentional fixture updates.

Existing descriptions to preserve:

- Blog: `Browse a list of all my blog posts ordered by most recent publication to least recent. Users can filter the blog results by publication date, category and tags.`
- Home: `Get an overview of my latest creations. As a fluent speaker of Italian, former writer, editor and current fullstack dev, I have a lot to share.`
- Portfolio: `My developer portfolio, including only my best and most up-to-date projects.`
- Projects: `A view of all of my completed projects with various details from when I first started to learn programming. You can filter by date, host, technology and keyword.`
- Author: `A view of all of my published books and short stories. They can be filtered by keyword or date of publication.`

### 8.3 Trie autocomplete and Levenshtein contract

Port `src/utils/search.ts`; retain the original tests and add order-sensitive tests.

Trie:

- Construct from `Object.entries(lookups)` in JavaScript enumeration order. Integer-like keys enumerate ahead of ordinary keys; do not convert to alphabetically sorted JSON.
- Children are insertion-ordered `Map`s; traversal uses UTF-16 code units, not Unicode graphemes.
- Terminal weights are occurrence counts, not document counts.
- Empty/missing prefix → null.
- Enumerate descendants by DFS in child insertion order.
- Exclude the prefix node itself, even if it is a complete vocabulary word.
- Stable-sort descendant completions by weight descending; tie order remains DFS order.
- Return all completions, not just five; return null if none.
- No lowercase/trim normalization inside the trie. UI supplies the raw query, so suggestions remain case-sensitive.

Levenshtein fallback:

- Ordinary edit-distance DP, insertion/deletion/substitution cost 1; matching character cost 0; no transposition shortcut.
- Compare the entire raw query against every stored vocabulary word; case-sensitive UTF-16 comparison.
- Stable sort ascending by distance; ties follow stored word order, not frequency.
- Return first five words (or all if fewer). No maximum-distance cutoff.
- Prefix suggestions take precedence. Only when no prefix suggestions exist does the UI use Levenshtein alternatives.
- No unused random suggestions API needs a new UI; retaining it as a tested utility is optional if copied wholesale.

### 8.4 Exact legacy index transforms

Port the source transformations rather than replacing them with a generic tokenizer. Lock them with golden fixtures.

`formatText` returns undefined on falsy input; otherwise:

1. Remove tags matching `/<\/?[\w\s=":\/\.]+>/g`.
2. Remove entity strings matching `/&#?\w+;/g`, not decode them.
3. Delete `[`, `]`, LF, commas, straight quotes/apostrophes, parentheses, periods, question/exclamation marks and colons.
4. Replace `=` and `/` with spaces.
5. Remove the exact adjacent Unicode sequence `”“`.
6. Do not trim/collapse whitespace or perform other punctuation cleanup.

`truncate(sentence, 300)`:

- Return unchanged if length <=300.
- Otherwise take first 300 UTF-16 code units.
- Throw if the slice is empty/whitespace-only.
- Replace trailing `/\s\S*$/` with `...`; if no matching whitespace exists, keep the slice without adding ellipsis.

`generateLookup(inputs)`:

- Iterate inputs in order; `datum = input?.toString().toLowerCase()`; skip falsy datum.
- Apply `formatText(datum).split(' ')`.
- Every token becomes `meta[token] = true` and increments the global lookup count.
- Do not deduplicate occurrences or remove empty tokens after splitting.
- Generate profiles/counts in this type order BEFORE per-type date sorting: books → stories → posts → projects, with captured node order inside each group.

Metadata input selection:

| Type    | Exact compatibility inputs                                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Book    | Title words; full month, short month, year; purchase-link objects coerced as before; cleaned content after raw-HTML 300-char truncation; related-story title words; related-project title/description words |
| Story   | Title words; full cleaned body words; full/short month, year; alternate-link names only if present in the original search query result; related-book title words and raw relationship text                  |
| Post    | Category words; tag strings; full/short month, year; title words; cleaned/truncated excerpt words                                                                                                           |
| Project | Title words; host; cleaned words from 300-char raw-HTML truncation; first-release full/short month/year; short and expanded technology strings; `github` and `repo` when repo link is truthy                |

Source-specific quirks:

- Gatsby's search post query omits `content`; full body is absent from worker/listing records despite optional matching code. Do not add it during migration.
- Story search query omits `alternateLinksNames`, so those names normally do not affect search. They still appear on detail pages.
- Book purchase-link objects stringify to `[object Object]`, producing bogus `object` vocabulary. Preserve in imported compatibility data; do not silently fix it.
- Book/project content snippets are raw HTML truncated before cleaning in metadata. Worker matching also sees their legacy raw snippets. Story display/search content is cleaned then truncated, while story metadata uses the full cleaned body.
- Month names are full English names; abbreviations are `JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC`; year is included. Lowercasing occurs later in lookup generation.

Technology label mapping, unknown tokens unchanged, case-insensitive abbreviation matching:

```text
html→HTML; css→CSS; sass→Sass; js→JavaScript; ts→TypeScript;
py→Python; php→PHP; wp→WordPress; ng→Angular; swift→Swift;
react→React; vue→Vue; cs→C#; unity→Unity; ml→Machine Learning;
svelte→Svelte; gql→GraphQL; tw→Tailwind; go→Golang; ex→Elixir;
wip→Work In Progress; ws→WebSockets; rs→Rust.
```

### 8.5 Worker/island integration

- Create worker using Vite's static URL form: `new Worker(new URL('../../workers/search.worker.ts', import.meta.url), { type: 'module' })`, adjusting the literal relative path to the final component location.
- Worker imports pure search and generated public data, not a module that constructs a duplicate main-thread trie unnecessarily.
- Main thread imports vocabulary/trie and lightweight result types; avoid importing article Markdown or a second full data copy accidentally.
- Preserve immediate input/suggestion updates and 250 ms debounce for nonempty result searches; clear query schedules null result after 0 ms.
- Gate user interaction until the worker is ready or safely queue the latest initial query. Add an accessible error state if worker startup fails; do not leave a broken search modal silently spinning.
- Lifecycle cleanup and request identity may be improved internally, but stable-user-input results/order and documented UI timing must remain unchanged. Test rapid typing/clearing to prevent stale results without changing the search algorithm.
- Keep dialog/query state across close/reopen within the mounted shell.
- Inline completion is the suffix from the top trie suggestion. Tab/Enter accepts it; Escape first clears nonempty input, then can close the dialog.
- Result groups start expanded and are independently collapsible. Count includes collapsed groups.
- Alternatives replace the whole query when clicked.
- Existing `showResultCount` is set true on successful prefix completion; the Levenshtein branch does not reset it. Freeze that behavior in compatibility tests unless owner approves a separate fix.
- Selecting a result closes the dialog and navigates to its type route.

### 8.6 Search parity gate

Compare ordered identifiers, metadata booleans, vocabulary counts AND ordering, prefix results AND ordering, Levenshtein results AND ordering. Matching only result counts is insufficient.

Any unexplained difference blocks release. Allowed differences are explicit: removed Theme page/navigation, approved rendering/design changes, updated canonical host and normalized links. Conversion should not otherwise alter search behavior.

---

## 9. Phase F: listing filters, URL state, and pagination

### 9.1 Listing datasets

- Blog: publication descending; tag/category filters; text predicate checks metadata/title/excerpt/optional legacy content/tags/categories.
- Projects: first-release descending; hosts/expanded technologies; text predicate additionally checks short/long tech and host.
- Author: concatenate books then stories, stable publication-descending sort. Equal-date books precede stories. No taxonomy filter.
- Filter all datasets, not only currently visible cards.
- Each filter narrows previous results: AND across filters. Preserve source order.
- Parse/apply order: date; text filters in URL key insertion order; configured keyword filters (blog tags then categories; project hosts then technologies).

### 9.2 Matching semantics

Text filter:

- Empty search or first element empty → no-op.
- Evaluate only `search[0]`.
- Tokenization: replace comma+whitespace with space, comma+nonwhitespace with space+that character, then split on literal space.
- `any` means some token matches; default `all` means every token matches.
- No trim or empty-token filtering.
- Text comparisons use `toLocaleLowerCase()`; metadata lookup historically uses the original token. Preserve that distinction.
- Listing text updates on each change, not the global modal's debounce.

Keyword filter:

- No selection → no-op.
- `any` means at least one selected value; default `all` means every value.
- Exact case-sensitive choices; unknown URL values remain represented.
- Hosts match `[hostedOn ?? '']`; technologies match expanded labels.
- Preserve choice ordering: blog choices first-seen in sorted posts; technology choices from raw project order; hosts from sorted projects.

Date filter:

- Inclusive timestamps: `start <= item <= end`.
- URL date bounds parse as local midnight; do not silently extend end to 23:59:59.
- Missing/invalid bounds fall back to dataset defaults.
- Either bound's presence creates a date filter.
- Reversed dates are not automatically swapped.
- Preserve existing date parsing/overflow behavior in compatibility tests.

### 9.3 URL contract

| Parameters                                        | Meaning                               |
| ------------------------------------------------- | ------------------------------------- |
| `page`                                            | One-based listing page                |
| `date_start`, `date_end`                          | Date bounds                           |
| `search_1`, `search_2`, ...                       | Independently composable text filters |
| `search_N_type`                                   | `all` or `any`                        |
| `tags`, `categories` and corresponding `_type`    | Blog keyword filters                  |
| `hosts`, `technologies` and corresponding `_type` | Project keyword filters               |
| `section`                                         | Portfolio tab, not a listing filter   |

Port URL helpers with compatibility tests before refactoring:

- Arrays are individually `encodeURIComponent`-encoded, joined with commas, then encoded again by `URLSearchParams`.
- Read uses URLSearchParams decoding, then `decodeURIComponent` on the whole value, then comma splitting.
- Existing writes use `history.replaceState`, preserve most unknown parameters, and drop the fragment.
- Removing a key removes matching case-insensitive prefixes, not exact keys; `search_1` can remove `search_10`.
- Keys starting with `search` but not ending `_type` are recognized permissively; creation uses highest numeric suffix+1.
- Current code does not implement filter `popstate` restoration. Do not advertise improved browser-history behavior as already existing.
- Explicitly handle malformed URI decoding without crashing the whole site; preserve valid-link semantics and document the defensive exception.

### 9.4 Pagination compatibility

- Page size 10, internal zero-based index, one-based URL/display.
- Current maximum page index is `floor(length / pageSize)`, not `ceil(...)-1`.
- Thus exact multiples of ten expose an extra empty final page; zero items still displays one page. Preserve initially because search/filter parity is explicitly requested, and list a follow-up correction separately.
- Clamp requested page to current bounds. `parseInt` numeric prefixes such as `2abc` are currently accepted.
- Capture actual effect sequencing for filtering while on a later page: old `setItems()` requests zero, then URL page restoration may request another page. Mount restoration is also effect-based. Differential browser tests decide the compatibility behavior; do not infer it from an idealized reducer.
- Preserve previous/next buttons, numeric page input, pagination arrows and documented keyboard shortcuts.
- Handle an entirely empty collection safely; do not reproduce a build/runtime crash from accessing `items[0]` or `items[-1]`. This is a defensive boundary, not a change to matching results.

### 9.5 Known issues tracked, not silently corrected

Document these in `docs/search-compatibility.md` with fixtures:

1. Empty global-search tokens match broadly.
2. Suggestions are case-sensitive while results are case-insensitive.
3. Exact trie prefix word excluded from completions.
4. Blog body and story alternate-link names absent from legacy search inputs.
5. Book purchase-link `object` vocabulary.
6. Count visibility can depend on earlier prefix matches.
7. URL comma round-trip can split a text filter into multiple array elements while only the first is evaluated.
8. Date creation writes slash-formatted dates while later edits write hyphen-formatted dates; parser expects hyphens. Characterize and preserve current valid interactions for launch; do not casually rewrite parameter formats.
9. Prefix-based removal collisions.
10. Extra empty pagination page at exact multiples of ten.
11. Keyword chooser and restored filter pills can disagree because the old react-select input is uncontrolled.
12. Old hook timers/worker responses can race. Clean resource leaks without silently changing matching; add rapid-input tests.

These are migration compatibility decisions, not endorsements of the bugs. Offer a separate post-migration issue/PR with owner-approved changes and new expected outputs.

---

## 10. Phase G: Astro UI, feature-by-feature port

### 10.1 Static content and island boundaries

- `SiteLayout.astro` owns document/head, global styles, header/footer/main landmarks, theme initialization and the persistent interactive site chrome.
- `SiteChrome.tsx` owns sidebar, global search dialog, shortcut dialog and their shared state. Hydrate with `client:load` so keyboard search is available immediately.
- Listing islands are separate React roots mounted only on `/blog`, `/author`, `/projects`; share pure modules, not mutable Redux state across roots.
- Portfolio interaction is isolated to `/portfolio`.
- Detail body rendering is Astro Markdown/MDX, not a giant React island. Code highlighting has zero client highlighter JavaScript.
- Do not pass React render functions/components through serialized Astro props. Pass plain data or supported serialized values, reconstruct dates deliberately on the client.
- Server-render the default first-page listing/cards for discoverability/no-JS access, then read URL filters after mount without hydration mismatch. Static hosting cannot server-render arbitrary query-filtered states; document that JavaScript is required for filtering.
- Add a meaningful `<noscript>` notice and accessible links to all published content (e.g. full listing fallback/details/sitemap). Do not serve an empty main region until hydration.

### 10.2 Navigation state parity

The Gatsby layout remains mounted during client navigation. To preserve search/sidebar state and avoid full reloads on internal links:

1. Use Astro's supported `ClientRouter` for internal transitions.
2. Give the site-chrome island a stable persistence identity with `transition:persist` and compatible persist-props settings supported by the chosen Astro release.
3. Use normal internal anchors that ClientRouter can intercept; adapt old Gatsby `Link` calls.
4. Update active-navigation state on `astro:page-load` and perform necessary route subscriptions in the persistent shell. Initial React props alone will become stale.
5. Listing/portfolio islands must remount or refresh appropriately per route/query state. Do not persist them indiscriminately.
6. Remove document listeners/worker resources on true unmount; prevent listener accumulation over repeated route changes.
7. Close dialogs on result navigation, restore sensible focus, and update page focus/title for accessibility.
8. Test back/forward, direct load, query-preserving links, scroll restoration, MDX island hydration after navigation, and no-JS fallback.

If the chosen Astro release cannot support reliable shell persistence, record the specific limitation and get approval before accepting query/sidebar reset on full navigations. Do not silently claim exact interaction parity.

### 10.3 Feature acceptance table

| Feature    | Required behavior                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| Home       | Latest 10 mixed items; date/first-release descending; stable ties from books→stories→projects→posts concatenation |
| Blog       | Current card details, filters, all/any text/keywords, date controls, URL state, pagination                        |
| Author     | Mixed books/stories, covers/fallback covers, links/relationships, date/text filters                               |
| Projects   | Technologies/icons, host/main/repo links, release/update dates, current filters                                   |
| Post       | Title/date/categories/tags/full Markdown body; original links/anchors/code preserved                              |
| Book       | Cover, publication date, purchase links, designer credit/bio/links, related project/description, related stories  |
| Story      | Publication date, full body, alternate links, related book/relationship and derived project link                  |
| Project    | Full description/body, main/repo/host, technologies, release/latest-update details                                |
| Portfolio  | Existing biography/work history, social/resume links, project screenshots, tabs and URL state                     |
| Navigation | Existing main destinations except Theme; responsive sidebar and keyboard/modal behavior                           |
| 404        | Genuine 404 response, helpful navigation/search entrypoint                                                        |
| Theme      | Light/dark/system only; no old theme editor/storage UI; `/theme` redirects home                                   |

### 10.4 Portfolio details that must not be accidentally lost

- Existing selected projects: title exactly `Benyakir Writes` OR first release strictly after `new Date('2023-01-01')`. Preserve initial set; do not change to “all current projects” without approval.
- Tabs use `section=projects|history|bio`, default `bio`. Validate invalid sections safely.
- Copy all biography and work-history content, not only WordPress data; it is in React components.
- Map project screenshots by the old title→filename association during import, then store explicit associations.
- Preserve the decorative randomized background where practical; isolate it from text layout, avoid hydration randomness mismatches, and respect `prefers-reduced-motion`.
- Preserve external social links and resume URL. Report stale/broken external links instead of replacing them with invented values.

### 10.5 Project repository update behavior

The old hook fetches public GitHub repository `pushed_at` from the browser, caches it in memory, and shows loading/error/no-repo states. It does not require a private token.

To honor “port everything,” retain this small optional browser behavior on relevant project UI, with timeout/abort, public API rate-limit/error handling, and static `latestUpdate` fallback. It must never make article content unavailable or introduce a server proxy/paid API. Do not place GitHub tokens in browser code. Clearly label that the dynamic value is repository activity, not necessarily an article update date. Test blocked/rate-limited/offline responses. If owner later wants a completely external-request-free site, replace this in a separate approved change.

### 10.6 Styling and theme simplification

- Reuse visual identity from `src/styles`, cards, sidebar and portfolio; avoid an unrelated template redesign.
- Use local Faustina/Mulish fonts with limited weights, `font-display: swap`, sensible fallbacks.
- Define CSS tokens for spacing, typography, border/surface/text/accent colors; maintain AA contrast.
- Theme preference values: `light`, `dark`, `system`, one new namespaced localStorage key. Do not migrate arbitrary stored user-defined themes.
- Inline minimal early theme initialization to avoid flash, with storage access guarded for disabled storage. Support OS changes only when preference is `system`.
- Code styles use `.astro-code` and Shiki dark variables under the active dark-theme selector; test explicit light preference on a dark OS and vice versa.
- Style Markdown headings/lists/tables/figures/links/blockquote and horizontal code overflow. Do not force mobile page-width overflow.
- No code-block toolbars or interactive highlighter extras.
- Respect reduced motion and keyboard focus, allow text zoom to 200%, and verify mobile navigation/readability.

### 10.7 Keyboard/accessibility contract

Port existing shortcut help and behavior, then test rather than guessing key combinations:

- Ctrl/Cmd+`/`: open global search when not typing in a normal input.
- Shift+`?`: shortcut help.
- Shift+`<` / Shift+`>`: sidebar close/open.
- Escape: input clear/dialog/sidebar behavior as appropriate.
- `f`: focus filter creation; `p`: focus pagination.
- `+`/`=` and `-`/`_`: next/previous page when no input is focused.
- Arrow controls within pagination.

Do not trigger global character shortcuts inside inputs, textareas, selects, or contenteditable widgets. Use native dialog semantics, labelled controls, focus trapping/restoration, aria-expanded for result groups, suitable result announcements and visible focus. Keep semantic heading order and one primary page heading.

---

## 11. Phase H: SEO, feeds, analytics, security

### 11.1 Metadata

- Title pattern remains `Benyakir Writes - {page title}` unless owner later requests a branding change.
- `html lang="en"`, author `Benyakir Horowitz`, nonempty description, canonical URL.
- Open Graph/Twitter metadata with local cover/default image and absolute production URLs.
- Appropriate structured data for blog posts/books where facts are available; do not invent ISBN, ratings, prices, or publication metadata.
- Sitemap includes only canonical published routes; excludes previews, removed `/theme`, drafts, redundant aliases and 404.
- RSS at `/rss.xml`, initially covering blog posts newest first. Include valid canonical links/dates and XML-escaped summaries; other content feeds are optional, not required for parity.
- If old feed paths are found in export/route inventory, redirect them explicitly to the new feed after comparing semantics.
- Preview builds should carry `noindex` via supported headers/meta. Test that production does not inherit preview noindex. Keep canonical URLs production-based.

### 11.2 Analytics

Enable free Cloudflare Web Analytics for production through Pages integration or the documented single beacon insertion mechanism—one mechanism, not both. No PostHog package, script, key, environment variable, or replay recording.

Explain in docs: Cloudflare's traffic dashboard and Web Analytics are different datasets; browser analytics can be blocked and is not a perfect visitor census. Web Analytics does not replace PostHog session replay, which the owner is dropping intentionally. Confirm the beacon does not run on every PR preview unless explicitly desired.

### 11.3 Headers and content safety

- Add reviewed `_headers` for `X-Content-Type-Options`, referrer policy, and appropriately scoped policies.
- Set sensible cache policy: hashed Astro assets immutable; HTML/search manifests not indefinitely stale; do not cache all paths forever.
- Introduce a CSP only after inventorying Astro hydration/ClientRouter scripts, inline theme initialization, Shiki inline styles, analytics, GitHub fetches and approved embeds. Test initially/report-only where practical; do not ship a policy that breaks the site.
- No secrets in public `PUBLIC_*` variables, content, source maps, or static assets. Web Analytics public site token is not a private server credential.
- Treat MDX as trusted executable repository code. Do not compile arbitrary untrusted visitor content; require PR review for imported raw HTML and MDX components.
- Preserve legitimate third-party links safely (`rel` as appropriate); document remaining external network dependencies.

---

## 12. Phase I: future widget extension points

Install MDX support and prove it with a tiny test fixture, not a speculative production feature.

- Ordinary `.md` entries require no imports/components.
- `.mdx` articles can import an Astro component for static markup or a React component for interactive demos.
- Default to no hydration; use `client:visible` for a demo lower in an article, `client:idle` when appropriate, `client:load` only for immediate interaction.
- Use `client:only` only when a real browser-only dependency cannot SSR, with an accessible fallback.
- Demo code belongs in `src/components/widgets/{DemoName}/`, with scoped styles, explicit props and tests. It must not depend on the old global Redux theme state.
- Widget containers need accessible names, loading/error/fallback content and reduced-motion support where applicable.
- Search indexing extracts article prose, not source code of widgets or script contents; choose intentionally whether code fences contribute under the existing per-type profile.
- Widgets may use local browser state. Anything requiring secret API keys, persisted server data, authentication or a metered API requires a new architecture/cost review, not silent conversion to SSR.
- Add `docs/authoring.md` examples and a fixture demonstrating that an MDX demo hydrates on direct load and after ClientRouter navigation while adjacent ordinary Markdown/code remains static.

---

## 13. Phase J: testing and release acceptance

### 13.1 Importer/content unit tests

Use small committed synthetic/public fixtures, not real private backups.

- All four content types, nullable fields, missing cover, alternate links, designer credits, mismatched paired-link names.
- Custom code JSON nested in wrappers, valid raw JSON, explicitly encoded fallback JSON, malformed payload, placeholder tokens, HTML-looking code, Unicode, tabs/trailing spaces, embedded backticks/fences, missing final newline.
- Ordinary pre/code entity decoding and inline-code preservation.
- Nested lists, quotations, headings/anchors, tables, figures/captions, downloads, images/srcset/poster, raw HTML allowlist, shortcodes/unsupported embeds.
- Malformed HTML, void elements, comments, double/single-quoted attributes; parser must not drop content silently.
- Date formats/timezones/DST, unsafe slugs, duplicate/case collisions, bad relationship IDs, missing media, traversal attempts.
- Deterministic rerun, input checksum changes, override application, manual-file overwrite refusal.
- No draft/private/comment/user data in generated sources or public artifacts.

### 13.2 Search/ordering differential tests

- Queries: empty, single term, multiple terms, leading/trailing/double spaces, punctuation, commas, tabs/newlines, uppercase, Unicode/surrogate pairs, exact metadata-only words, no match.
- Compare every group ordered slug list to original reference output.
- Prefix exact-word exclusion, prefixes with descendants, weight ties/DFS order, >5 completions, absent prefix, raw case, multiword input.
- Levenshtein insertion/deletion/substitution, transposition costing two where applicable, five-result cap, stable ties, no distance threshold, exact distance-zero match.
- Global vocabulary counts and enumeration order, empty tokens, repeated terms, numeric-looking year keys, source type/order effects.
- HTML cleanup punctuation/entity quirks, 300-char boundaries, truncate-before-clean versus clean-before-truncate.
- Missing post full bodies, absent story alternate-link-name inputs, legacy purchase-link `object` token, repo markers and technology labels.
- All launch-corpus diffs reviewed; Theme removal explicitly excluded from parity comparisons where appropriate.

### 13.3 Filter/URL/pagination tests

- all/any text and keywords, AND across independent filters, metadata case distinction, empty selection, unknown choices, multiple text filters.
- Date bounds missing/invalid/reversed/equal, local midnight behavior, created versus edited date encoding.
- URL spaces/commas/ampersands/plus/percent/Unicode, duplicate keys, unrelated parameters, permissive search key recognition, prefix-removal collision, malformed percent input fallback.
- Counts 0,1,9,10,11,19,20,21; invalid/negative/oversized pages and numeric prefixes.
- Deep-linked filtered later page, reload, filter change while on later page, clear/remove filters, exact sequence of state updates and URL writes.
- Restored pills/keyword chooser, default date bounds and display of no results.
- Portfolio section query restoration.

### 13.4 Browser tests

Run against production build, with desktop and narrow mobile viewport.

- Every top-level route and representative detail pages for all types.
- Search open via button/shortcut, worker ready state, 250-ms timing, clear, alternatives, inline completion Tab/Enter, Escape layering, group collapse/counts, result navigation, dialog reopen retaining query.
- Rapid typing, close/unmount/navigation while debounce/worker response pending; no stale result corruption or leaked listeners.
- Persistent shell across ClientRouter navigation; active nav updates, back/forward, focus/scroll behavior.
- All listing controls and URL restoration, keyboard pagination, no input-shortcut conflicts.
- Light/dark/system including OS changes, disabled localStorage, first-paint preference, code colors and contrast.
- Portfolio tabs/background/reduced motion/resume and social links.
- GitHub date success/error/rate-limit/offline fallback.
- Markdown and MDX code blocks, interactive MDX demo direct load and client navigation.
- Axe scans plus manual keyboard checks for dialogs, filters, tabs, reading order and zoom; automated scans alone do not prove accessibility.
- JavaScript disabled: content, navigation, meaningful listing fallback and 404 still usable; search/filter limitation explained.

### 13.5 Full-site build validation

- Compare exported published counts/slugs per type to generated Markdown and built routes.
- Validate every local link/image/download and fragment target, with explicit reviewed exemptions.
- Search output must be generated entirely from committed source, with no reference to private migration directories.
- All body assets formerly on the retiring WP host must be local or explicitly approved external resources; scan generated HTML/CSS/JS/JSON and MDX props, not only Markdown source.
- Dist contains no private artifacts, SQL, WP config, secrets, unpublished entries or dependency on `/graphql`.
- No Functions/worker server artifacts; `<25 MiB` assets, <=20,000 files (fail at platform limit, warn substantially earlier); report total size and largest files.
- Correct 404 status on deployed preview; no implicit SPA fallback.
- RSS, sitemap, canonical metadata, robots and preview noindex checked.
- Search/data payload sizes recorded. Ensure full Markdown bodies/highlighter libraries are not accidentally duplicated in the main JS bundle.
- Benchmark worker results and main-thread suggestions on the actual corpus. Targets: responsive typing, suggestion generation generally within a frame on an agreed representative device, result computation well below the existing 250-ms debounce under normal conditions. Treat poor measured performance as a report/optimization task, not permission to alter matching.
- No network calls to WordPress while browsing. Analytics/GitHub/approved embeds are the only intentional external runtime dependencies.

### 13.6 Manual content review

For ~200 entries, automatically validate all entries and manually inspect:

- Every custom code-block article.
- Every retained HTML/shortcode/embed exception.
- Every book/story/project with nontrivial relationships.
- Representative long/short articles, image captions, tables, lists and Unicode.
- Owner-selected important/high-traffic pages.

Compare text and code content, not only screenshots. Owner signoff is required before retiring WordPress.

---

## 14. Phase K: GitHub and Cloudflare Pages deployment

### 14.1 CI

Create GitHub Actions for PRs and `main`:

1. Checkout the new repository.
2. Install pinned Node and pnpm versions.
3. `pnpm install --frozen-lockfile`.
4. Lint and `pnpm check`.
5. `pnpm test:unit` and `pnpm test:search-parity`.
6. `pnpm build` (includes content/artifact/link validation).
7. Install required Playwright browsers and run production-build browser tests.
8. Upload failure reports/screenshots, not private migration artifacts.

Keep runtime/build reproducible without a sibling checkout or WordPress. Do not run Docker/WordPress extraction in normal CI. Avoid duplicate heavy builds where possible; measure included GitHub Actions allowances. Enable branch protection for `main` with tests/checks required.

### 14.2 Pages Git integration

Owner/account authorization steps:

1. Create/connect a Cloudflare **Pages Git-integrated project** for the GitHub repository. Scope GitHub App access to this repository only where possible.
2. Set production branch explicitly to `main`.
3. Enable intended preview branches/PR previews; avoid unnecessary build duplication. Fork PR preview limitations are platform-specific; current docs say fork PRs do not receive preview URLs.
4. Repository root directory is the new repository root (unless later organized as a monorepo).
5. Build command: `pnpm build`; output directory: `dist`.
6. Configure Node/pnpm consistently with local/CI. Determine whether Pages automatic install handles the pinned package manager; do not install dependencies twice unnecessarily.
7. No WordPress, PostHog, GitHub private token, SQL, or secret API key environment variables.
8. Use Pages build environment indicators to distinguish preview versus production, injecting noindex/analytics behavior deliberately. Document the exact supported variable names once verified.
9. A PR build must produce a working preview; merging to `main` must automatically deploy production. No manual deploy CLI required for ordinary publishing.
10. Ensure the default project is truly static: no Functions routes, Worker, adapter output or paid bindings.
11. Enable Web Analytics once for production and validate beacon count/configuration.
12. Measure build duration/file count and preserve reasonable margins below free limits.

Do not assume the current project/repository name, account ID or `pages.dev` hostname. Record actual values in deployment docs after creation, never invent them in config.

### 14.3 Deployed preview smoke test

Before domains move, verify representative routes, real 404 status, static asset paths, worker loading/CSP, search/filter URLs, persisted navigation, all code languages, media local availability, responsive design, production canonical links and preview noindex.

Preview tests must not succeed only because WordPress is still serving missing images. Block the old WP origin in browser tests to expose hidden dependencies.

---

## 15. Phase L: cutover, rollback, and retirement

### 15.1 Pre-cutover checklist

- [ ] Immutable private SQL/media/plugin/theme backups exist in at least two safe locations.
- [ ] Importer output counts match public source counts by type.
- [ ] All required uploads/covers/downloads copied and verified.
- [ ] All code blocks converted and verified, no leftover JSON wrappers or placeholder tokens outside deliberate code examples.
- [ ] Search golden/differential tests pass, with approved Theme removal documented.
- [ ] All filter/URL/pagination browser checks pass or explicitly accepted source quirks are documented.
- [ ] Full-site link/anchor validation passes; manual article/relationship review completed.
- [ ] Pages preview works with WordPress blocked/offline.
- [ ] No SSR/Functions/billed bindings; current free-plan constraints and account settings verified.
- [ ] Canonical domain/redirect mappings reviewed; DNS email records preserved.
- [ ] Production and preview robots/noindex behavior verified separately.
- [ ] Owner has approved content/design and timing of production changes.
- [ ] Rollback instructions and known-good Netlify deployment/old DNS values recorded.

### 15.2 Cutover order

1. Agree on a short WordPress content freeze. Stop new WP edits or record a final delta export.
2. Take a final backup/export; regenerate migration output only for changed entries, respecting manual-edit conflicts.
3. Run all validations and capture a tagged/referenced known-good new deployment (do not create a Git tag without owner instruction).
4. Deploy the approved `main` build to Pages while the old site remains available.
5. Associate/activate canonical and alias domains; verify TLS before declaring success.
6. Apply approved canonical-host/legacy-path redirects with path/query preservation.
7. Move necessary DNS/zone settings, including nameservers if needed, only with owner approval. Preserve unrelated records.
8. Verify HTTPS, canonical paths, alias domains, high-value legacy links, uploads, feeds, query-filter links, worker search, analytics and 404 responses from the public deployment.
9. Watch browser errors/Cloudflare diagnostics and crawl the public routes. Use a modest smoke/crawl workload, not an unapproved load test.
10. Keep Netlify and WordPress backups/hosting temporarily during a defined observation period (recommend 1–2 weeks, subject to owner budget/timing).

### 15.3 Rollback

- Application regression: revert the new repository to the last known-good content/code or use Pages' supported previous-production-deployment rollback. Document the exact dashboard operation at setup time.
- Domain/TLS failure: restore prior verified DNS/rules/origin configuration with owner approval; DNS propagation is not instantaneous. Pages custom-domain association may need reactivation after DNS switches.
- Import/content failure: recover from immutable exports and migration manifests, not from scraped rendered pages.
- Do not delete Netlify's last known-good build or WordPress data before the observation window closes.

### 15.4 WordPress/Netlify retirement gate

Cancel WordPress hosting only after:

- New site works without WP network access or credentials.
- All media/downloads and custom field relationships are verified.
- Required old URLs resolve/redirect as approved.
- Backup can be restored locally and public source content is in Git.
- Future authoring workflow has been exercised with a real test article/PR/merge.
- Owner explicitly approves cancellation.

Retain ownership/renewal of both domains for redirects. Hosting cancellation is not domain cancellation. Disable old Netlify automatic production deployment or remove old domain bindings as appropriate after stability; account deletion and service cancellation are owner actions.

---

## 16. Suggested implementation work packages and dependencies

Use this ordering so content/data uncertainty is resolved before UI claims of parity. Independent work can run in parallel only with disjoint write scopes.

| Package                         | Depends on              | Deliverables / completion gate                                                              |
| ------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| A1: Inventory/baseline          | Source artifacts        | Export schema, actual field/type mapping, route/media counts, sanitized old search fixtures |
| A2: Astro scaffold              | None beyond this plan   | Static app, pinned tools, CI skeleton, Markdown/MDX/Shiki smoke tests                       |
| B1: Content schema              | A1 + A2                 | Validated collections, routes/relationships/date helpers, authoring fixture                 |
| B2: Importer/media              | A1 + B1                 | Dry-run/apply pipeline, overrides/manifests/reports, tested code extraction/local assets    |
| C1: Search core                 | A1 + B1                 | Compatibility profiles, exact transforms/trie/worker, differential tests                    |
| C2: Listing core                | A1 + A2                 | Filter/URL/pagination modules and React tests, known-quirk fixtures                         |
| D1: Content UI/styles           | B1 + converted samples  | Layout, cards/detail pages, local fonts, basic theme preference                             |
| D2: Interactive chrome/listings | C1 + C2 + D1            | Persistent search/sidebar/help, exact filter UI/URL behavior                                |
| D3: Portfolio/projects          | B1 + D1                 | Static bio/history, tabs/background/images, repo activity fallback                          |
| E1: Complete content import     | B2 + C1                 | All public entries/media, zero unreviewed exceptions                                        |
| E2: SEO/analytics/security      | D1 + route manifest     | RSS/sitemap/meta/headers/noindex, no PostHog                                                |
| F1: Full validation             | D2 + D3 + E1 + E2       | Differential/browser/accessibility/content/artifact reports                                 |
| F2: Pages preview               | A2 + early viable build | GitHub previews and production branch, zero runtime services                                |
| G1: Cutover/retirement          | F1 + F2 + owner signoff | Domain/TLS redirect validation, observation, explicit cancellation approval                 |

Potential parallel delegation: one agent owns importer/media; another owns pure search/reference tests; another owns static styles/templates. Coordinate schemas first. Do not have multiple agents edit shared content schemas/config or generated data simultaneously.

### 16.1 Required handoff documentation after implementation

- `README.md`: local install/dev/test/build, production architecture, no-WordPress requirement.
- `docs/authoring.md`: create/edit posts and other types, slugs/dates/relationships, code fences, MDX demos, image rules, draft exclusions, compatibility refresh.
- `docs/search-compatibility.md`: exact algorithms, corpus scope, ordering, preserved quirks, approved differences, differential test commands.
- `docs/migration.md`: actual source/export versions and field mapping, converter rerun/override safety, counts/exceptions, media/route manifests, private backup handling.
- `docs/deployment.md`: actual Pages/GitHub settings, production/preview distinction, free-plan constraints, analytics, custom domains/redirects, build version pins and rollback.
- `docs/cutover-checklist.md`: completed checks and owner approvals; no secrets.

### 16.2 Definition of done

The migration is complete when every intended public content item is represented in reviewed Markdown/MDX, all owned required media is local, existing search/filter behavior is covered by differential and browser tests, the entire site is static on Pages, GitHub PR/merge deploys work, domain/legacy URLs and canonical metadata behave correctly, no WordPress or PostHog runtime dependency remains, and the owner can publish future Markdown without operating a CMS. Hosting retirement is complete only after the separate owner-approved observation/cancellation gate.

---

## 17. External references and verification notes

Checked during planning on 2026-10-24. Recheck version-sensitive APIs, current limits/pricing and dashboard steps when implementing; do not turn these observations into an unconditional future billing guarantee.

- Astro syntax highlighting (owner-requested approach): https://docs.astro.build/en/guides/syntax-highlighting/
  - Built-in Shiki renders Markdown/MDX fences at build time; dual themes supported. No client highlighter needed.
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Astro MDX: https://docs.astro.build/en/guides/integrations-guide/mdx/
- Astro React: https://docs.astro.build/en/guides/integrations-guide/react/
- Astro client-side routing/persistence: https://docs.astro.build/en/guides/view-transitions/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
  - Current builds/file/asset/header/redirect constraints were read for this plan.
- Cloudflare Pages Functions pricing/static distinction: https://developers.cloudflare.com/pages/functions/pricing/
  - Current documentation: static asset requests free/unlimited when Functions are not invoked; Functions use Workers quotas/pricing.
- Cloudflare Pages GitHub integration: https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
  - Production branch selection, PR preview URLs, GitHub App permissions; fork PR limitation.
- Cloudflare Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
  - Custom-domain association required; apex domains require the corresponding Cloudflare zone/nameservers; CAA/TLS considerations.
- Cloudflare Web Analytics: https://developers.cloudflare.com/web-analytics/
  - Available on all plans; aggregate/performance analytics, not PostHog replay.

Only the syntax-highlighting and Cloudflare pages cited as checked above were fetched during preparation. Other Astro links are implementation references to consult against the chosen release. No live WordPress requests were made.
