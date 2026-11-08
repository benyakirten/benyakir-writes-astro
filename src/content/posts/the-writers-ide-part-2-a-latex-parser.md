---
title: "The Writer's IDE, part 2: A Latex parser"
slug: the-writers-ide-part-2-a-latex-parser
published: "2024-07-10"
legacy:
  wpId: 1338
  postType: post
  sourceOrder: 151
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags:
  - overleaf
  - wysiwyg
  - writing
  - writer's ide
  - wasm
  - ux
  - ui
  - typescript
  - pages
  - latex
---

- [What I've been up to](#what-ive-been-up-to)
- [What is a WSIWYG editor?](#what-is-a-wysiwyg-editor)
- [The LaTeX Parser](#the-latex-parser)

## What I've been up to

If you've been following my blog closely like I know you have, it's been quite awhile since the last update. I shouldn't say that since there's usually at least a month or two gap between "timely" posts. I've been up to a lot of reading and learning. If there's one thing I've learned in my time it's that learning is always fun. I'm not being sarcastic or something, but I genuinely love to learn new things constantly. I don't let myself rest for too long before I attempt something new if I have the chance. And lately there's three things that have been on my mind:

1.  Updating the UI and UX of this blog.
2.  Practicing Rust and learning about it (async, macros and generic functions).
3.  Going from Latex to a WYSIWYG editor to being able to output PDFs and eBooks

The first two are their own topic and nothing to do with the writer's IDE. So I won't talk about them in this post (I will talk about the UI/UX updates at some point, maybe not the Rust stuff). But I do want to talk about the Latex parser I've been working on.

<span id="wysiwyg"></span>

## What is a WYSIWYG editor?

What You See Is What You Get. You don't think about this much, but what you write has to get stored as data. What we've decided on as a convention is that you type something, and it shows up. Like me, right now, I'm typing into something that looks like this:

![](/wp-content/uploads/2024/07/Screenshot-2024-07-10-at-4.09.29 PM-1024x394.png)

It's a little like word. There are little blocks, and I can choose their format. Then to the right there are advanced options. Microsoft Word, Apple Pages, Google Docs are all WYSIWYG editors, and they are all roughly similar. You type something, and you immediately see what it looks like. So you must be saying "But what isn't a WYSIWYG editor then?" Almost all programs aren't. You will not type anything, and if you do, it's usually in a small textbox, and the data is presented in some other way. Such as when you log in to something, that didn't isn't presented anywhere (well, maybe your login name on some things).

Each WYSIWYG editor has its own formatting (well, I don't know all of them, but Pages and Word both do, and I know google docs are compatible with Word). They're mostly a collection of data with some sort of markup. Word files are essentially a bunch of XML, and Pages are stored in the [IWA format](https://github.com/obriensp/iWorkFileFormat/blob/master/Docs/index.md#iwa). You may be asking: but you're using the WordPress editor, what's that data stored in?

HTML and CSS! WordPress uses what's known as the Gutenberg editor with blocks to make it presented to me as a WYSIWYG editor. I even made my own [custom block](https://github.com/benyakirten/gutenberg-syntax-highlighter) once upon a time. It isn't great, and I know there are a lot of better options for the same result, but I wanted to try out making my own block and didn't have any brilliant ideas. I might make a custom block for gifs or videos at some point, but I might sooner migrate off of WordPress to Astro. With my better knowledge of programming and such, I find having to maintain compatibility between my Gatsby blog and WordPress limiting in what I can do.

Back to the topic of weird storage formats. I could easily write my own, but then I would have another format that people would have to convert between. You would have to find a way to convert between them. There are a few formats that are open and can be used. The first that come to mind is HTML and CSS (which is conveniently what an eBook is), and another is LaTeX.

I had never used LaTeX before, but I investigated it, and I came to the conclusion that it would allow for maximum compatibility between projects. I want someone to take a project they have already made and use it in my editor, and I want people to be take a project that they've made and use it elsewhere. In reality, HTML and CSS is by far more universal. And there are some solutions that I could basically use, such as [brackets.io](https://brackets.io). I could fork it and modify it as I want, but I think that's a bit short sighted. It would make my life a lot easier because LaTeX is sure a thing, and I know HTML/CSS very well.

However, I think LaTeX fits in better with my ultimate idea: the editor is only a small part of the whole. I will have to compile things from one format to another anyway. The pipeline should go something like:

Raw Data -> Intermediate Processed Data -> Rope -> Representation

Modifying data would take the input and then modify the raw data, which can be used to generate a new representation given this pipeline. It's very much like functional programming, to make the representation based on some sort of state with intermediate steps only going in one direction.

If we use HTML/CSS, we effectively change consolidate the raw data to processed data section, but it doesn't actually really change anything. The one thing it does change is consolidating font families and styling, plugins and macros... but that's a problem for future me. The one really big attraction to me is that what I'm envisioning doesn't exist yet. It's a mountain no one has climbed, and there's always something appealing about it.

<span id="latex-parser"></span>

## The LaTeX Parser

If you're really in the know about LaTeX, you may be saying: but wait, Ben, there's [Overleaf](https://www.overleaf.com). It's basically what you'd want. Then you don't have to do it yourself. It's a solved problem. What mountain are you talking about? And I say: I obviously have heard of it since I'm the one who linked it! There are just some problems.

The number one is they don't process the LaTeX themselves. As best as I can tell, they offload it to a LaTeX engine and can't be run in the browser. I want something that can be run entirely in the browser without a backend. You may think that this is enormously complicated, and you would be right. But it's not that bad, I think. There are some built in behaviors, but most of the complicated features come from plugins which are using the built ins to create specific outcomes and modifying text. In that way, it's like a programming language. So if I have plugin A, that uses plugin B that uses plugin C that uses builtins, then I just compile any output that uses plugin A to use plugin B, then in a second step I compile that to code that uses plugin C, then I compile that to just modify the builtins, bada bing, bada boom.

I just need to make the basic parser, a mapping of all internal LaTeX command, the ability to parse new commands, and a way to parse LaTeX font files into web fonts. What's that? Why would LaTeX have its own fonts that are incompatible with web fonts? I don't know! And it makes the amount of back and forth I can do between the two very limited, but I can try. Features will be fairly limited at the beginning, but it means that things are open for development.

What I've done so far is to compile the LaTeX format (everything must fit this format) into a series of data that's easy to process. Something like `\documentclass{article}` or `$ e = mc^2 $` gets processed into a command with the name of `documentclass` with a required argument that has the value of a content element with the value `article`. The second is an inline math block with the content `e = mc` then a superscript with the content `2`. I've created font-specific processing as detailed in the LaTeX documentation, then math, then some other things, and then I will have to build something more complicated that makes sense of it all. It will be an interesting journey that will undoubtedly take me a lot of time. If you want to see my current progress, check out the [latex-parser-ts](https://github.com/benyakirten/latex-parser-ts) repository.
