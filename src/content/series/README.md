# Post series

Create a YAML file in this directory for each ordered series:

```yaml
title: "The Writer's IDE"
posts:
  - the-writers-ide-part-1-writing-some-git-functionality-in-rust
  - the-writers-ide-part-2-a-latex-parser
```

The `posts` list uses each post's frontmatter `slug`, not its filename or URL. List posts in reading order. A post can belong to only one series; missing posts and duplicate membership fail the build.

Drafts may be listed but are excluded from public navigation and installment counts. Non-series posts have no series navigation. All navigation is rendered at build time and works without JavaScript.

Post Markdown filenames use `YYYY-MM-DD-slug.md` (or `.mdx`), where the date matches the frontmatter `published` date. Keep the frontmatter slug unchanged when renaming files: it defines both the content ID and the public `/post/slug/` URL. To add an installment, create its post and append its slug to the appropriate series YAML file.
