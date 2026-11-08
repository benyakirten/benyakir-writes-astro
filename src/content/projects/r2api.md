---
title: r2api
slug: r2api
published: "2020-12-14"
firstReleased: "2020-12-14"
latestUpdate: "2021-02-28"
technologies:
  - py
hostedOn: PyPi
mainLink: https://pypi.org/project/r2api/
repoLink: https://github.com/benyakirten/r2api
---

recipe2api is a Python package aimed at converting recipes on blogs without an external API into a Python dictionary/JSON object. As of now, it can only parse websites (reliably) for which there are converters. There are currently converters for the following websites:

1.  giallozafferano.it
2.  fattoincasadabenedetta.it
3.  https://blog.giallozafferano.it/mollichedizucchero/
4.  https://blog.giallozafferano.it/primipiattiricette/
5.  https://blog.giallozafferano.it/allacciateilgrembiule/

Converters have been made mostly on demand, so feel free to contact me and send me a website you need a converter for. I have made converters for Italian sites, but r2api should work for any most any languages provided there is a correct converter; however, I have not made any converters for any sites that don't have UTF-16 encoding, though the limiting factor should be (untested) the lxml decoder in Beautiful Soup.

The package also has a somewhat simplified implementation of the Google Cloud Translate API in order to translate the recipes into English. A separate translator could be implemented, especially a custom ML model, though I have yet to do that.
