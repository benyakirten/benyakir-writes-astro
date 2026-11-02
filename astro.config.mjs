import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.benyakir-writes.com",
  output: "static",
  trailingSlash: "always",
  redirects: { "/blog/": "/" },
  integrations: [react(), mdx(), sitemap()],

  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
