---
title: way
slug: way
published: "2022-01-15"
legacy:
  wpId: 1031
  postType: project
  sourceOrder: 111
firstReleased: "2022-01-15"
technologies:
  - go
repoLink: https://github.com/benyakirten/way-cli
---

way is a CLI tool that I made for finding the absolute path for a subdirectory from a certain path so that I can CD to it easily. If you have golang installed, you can build the directory then place its path into your bash/zsh/etc. profile under the path directory so you can call it everywhere.

There are three possible flags:

-   \-l - int; limit how many results are retrieved. Default: -1 (infinite)
-   \-w - string; set the base directory. Default: current working directory
-   \-r - bool; retrieve relative paths instead of absolute paths. Default: false

An example:

MIGRATION\_CODE\_BLOCK\_0
