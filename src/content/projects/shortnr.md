---
title: shortnr
slug: shortnr
published: "2021-12-07"
firstReleased: "2021-12-07"
technologies:
  - ts
  - react
repoLink: https://github.com/benyakirten/shortnr
---

A quick and simple project to create a URL shortening service. It uses React (TypeScript) on the frontend and Node/Express (TypeScript) on the backend with a MongoDB database. Short URLs are generated from the MongoDB IDs (with a fallback of randomly generated strings). Validation occurs both client and server side and is set up to use GitHub Actions to run automated tests.
