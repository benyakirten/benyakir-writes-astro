---
title: "The Writer's IDE, part 3: Researching popular document file formats"
slug: the-writers-ide-part-3-researching-popular-document-file-formats
published: "2024-09-10"
legacy:
  wpId: 1409
  postType: post
  sourceOrder: 158
categories:
  - Ben's Blogs
  - Ben's Thoughts
tags:
  - computer science
  - cs-50
  - distances
  - pages
  - rust
  - svelte
  - word
  - writer's ide
  - zig
  - Levenshtein
  - markdown
  - odf
  - opendocument
  - pdf
  - rich text
  - typesetting
  - C#
---

## Table of Contents

-   [Introduction](#introduction)
-   [Word](#word)
-   [Pages](#pages)
-   [PDF](#pdf)
-   [Open Document](#open-document)
-   [LaTeX](#latex)
-   [ePub](#epub)
-   [Partial Formats](#partial-formats)
-   [Where I'm Going](http://where-im-going)

## Introduction

I have had time to relax a little bit after finishing my blog changes. By the way, I continue to be really happy with them. No one will probably enjoy them, but I did some really innovative (for me) stuff on them. For example, I made the autocomplete no longer be a list of possible options but instead the most likely possible option (determined by frequency of a keyword's frequency of use in my posts - I'm not going to collect metrics to determine what are the most looked up keywords).

![](/wp-content/uploads/2024/09/Screenshot-2024-09-09-at-4.04.28 PM-1024x147.png)

I also spoke to a friend, and he brought up [Levenshtein distances](https://en.wikipedia.org/wiki/Levenshtein_distance). I could use them determine what was the most likely thing that the person was searching for if the autocorrect couldn't figure out the rest of the word.

![](/wp-content/uploads/2024/09/Screenshot-2024-09-09-at-4.04.35 PM-1024x216.png)

So I took the week to do some fun (for me) things. I was originally going to read a fiction book (and to be honest, that would've been nice), but I decided on learning how to program in C. I feel like that's something that's held me back from learning Rust and Zig better, especially the latter. I got a few books, but I also happened on [Harvard's free CS50 class](https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science). I did it in about a week (since, you know, I've been programming for almost four years at this point). I got more familiar with C. I discovered that I knew most of what was talked about, but I just hadn't practiced it so some of it took me longer than I would like to admit.

Anyway, I want to get back to working on the writer's IDE. I've been going slowly and trying to build side things for now because I need two things to be complete before I do the frontend work: Svelte 5 and Tauri 2. I could use Svelte 3/4 and Tauri 1, but Tauri 1 doesn't seem to have browser accessibility built in, and Svelte 5 is different enough from Svelte 3, and I got kinda sick of Svelte 3. Incidentally, if I want to start working on frontend type stuff, I might start using Vue. I had a fantastic experience with Nuxt, so who knows?

Also, incidentally, I think I'm going to not continue working on LaTeX. I have to look into it, but I've now decided that I will probably do RTF or HTML/CSS (since I'm very familiar with it). But when I get further along with my thinking, I'll proceed there.

But I have so many things to work on. And one of the biggest features is going to be importing/exporting files to and from external formats. So let's go over each of them.

## Word

Most people write documents up in Microsoft Word. I did it ever since I was young, and I never liked it. Lots of menus, lots of buttons, and very little is explained. When I got more knowledgeable about typesetting, I got more of the ideas, but it still has [famously terrible UI and UX](https://x.com/ellewasamistake/status/1412064740713455621?lang=en). But onto the actual format.

Word documents are stored as .docx file, which is a lie. They're not a single file but actually many files collected together in a zip file. In fact, you can open your terminal and run `unzip /path/to/file.docx`, and you'll find a bunch of different files there. Almost all of them are in XML with a few other files (such as images), according to the [Office Open XML](https://en.wikipedia.org/wiki/Office_Open_XML) standard.

## Pages

Pages isn't popular. But it gets a mention here because I started using pages when I became a writer. When I got my first Mac in college, I tried out pages occasionally but didn't get much into it because I wasn't familiar with it. As I got older, I learned to appreciate it a lot for fixing some of the complexities/annoyances with Microsoft Word.

Like a Word file, it's a zip archive. Just do it, run `unzip /path/to/file.pages`, and likewise, you'll get a folder with a bunch of files. The difference is the format is not a recorded standard by anyone. It's Apple's own stuff in it. So, like a MacOS or iOS app, it has the familiar features like a plist, then most of the contents are stored as `.iwa` files. Those are first compressed with something similar to [snappy](https://github.com/google/snappy/blob/main/format_description.txt) compression. Then those are encoded with [protocol buffers](https://protobuf.dev). Why are protocol buffers necessary? Who knows!

## PDF

It's many things, but easy isn't one of them. PDFs have the advantage of being write-only (kinda... mostly). It was proprietary to Adobe until 2008, then it was open. The format is a [mess](https://en.wikipedia.org/wiki/PDF), and it even has its own programming language. It's has to be interpreted. It's so complicated I don't want to deal with it. However, since it's mostly used an output/final format, all I would want to do is be able to export a file as a PDF. And, thankfully, browsers/operating systems can do that for you fairly easily. So I will continue to never learn PDFs.

## OpenDocument

I just learned about LibreOffice and the [Open Document Format](https://opendocumentformat.org). It looks to be complicated, but it's essentially like Word. It is essentially a bunch of XML data in. zip archive. I can't tell you much, but I can tell you this: it's an [open format](https://en.wikipedia.org/wiki/OpenDocument). It clearly spells out the specification, unlike pages at least. It will take me awhile to write a parser for it, but it will happen... eventually.

## LaTeX

Latex is extremely complicated and thorough. It includes its own typesetting programming language and package ecosystem. It is so complicated that finishing my latex parser will probably take awhile, and it won't be feature complete for quite awhile. From what I understand, you can write packages that modify other packages that modify other packages, etc. until you get to the builtin features, which are quite extensive.

## ePub

This was the coolest format when I understand what it actually was. It's a zipped archive of some HTML and CSS files. And you know what? I'm extremely familiar with HTML and CSS! I don't know what HTML and CSS it does and does not support, but, as far as I understand it, you need to write something that IE-11 would support.

## Rich Text

Rich Text is probably the simplest feature-complete format. It is relatively legible without doing much. This is a document as viewed on my computer and then the contents of the file:

![](/wp-content/uploads/2024/09/Screenshot-2024-09-09-at-5.46.12 PM-1024x459.png)

{\\rtf1\\ansi\\ansicpg1252\\cocoartf2761  
\\cocoatextscaling0\\cocoaplatform0{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;\\f1\\fswiss\\fcharset0 Helvetica-Bold;\\f2\\fswiss\\fcharset0 Helvetica-BoldOblique;  
\\f3\\froman\\fcharset0 Times-Roman;}  
{\\colortbl;\\red255\\green255\\blue255;}  
{\\\*\\expandedcolortbl;;}  
\\margl1440\\margr1440\\vieww22380\\viewh11540\\viewkind0  
\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0  
  
\\f0\\fs24 \\cf0 Text Align\\  
\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\qc\\partightenfactor0  
\\cf0 Text Align\\  
\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\qr\\partightenfactor0  
  
\\f1\\b \\cf0 Text Align\\  
\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0  
\\cf0 Hello  
\\f2\\i Hello \\ul Hello  
\\f0\\i0\\b0 \\ulnone Hello\\  
\\  
\\pard\\tx720\\tx1440\\tx2160\\tx2880\\tx3600\\tx4320\\tx5040\\tx5760\\tx6480\\tx7200\\tx7920\\tx8640\\pardirnatural\\partightenfactor0  
  
\\f3 \\cf0 New Font}

RTF doesn't allow plugins like other formats do, which is good.

## Partial Formats

I'm going to throw a bunch of completely different formats in here, namely: markdown, plain text, and... I'm sure there are other. Why I'm calling them partial is that they don't support all the features needed for typesetting, such as text alignment or create predefined styling groups. Markdown can have these features, but it depends on the processor. But if it's not universal, it's not going to work.

## Where I'm Going

I do not know where this will end up. But one thing's for certain: I need to process each of these into being usable as a webpage (since this will be a Tauri app, which only displays HTML/CSS). I will probably need some sort of processor for each format to create an intermediate form (convention will probably be decided later). Then, when documents are saved to disk, they will be saved in my own format. I think I will go for something extremely simple, something like a header which will state the formatting then the content length. Then each section will end with a line break (or something more complicated like `\r\n\0`. Formats will be saved in a different, linked file so the format will just be simple like `format="header1"`.

My next step is I want to write a parser for `.iwa` files in Zig. I think that'll get me much closer to deciding on a standard format to decode things into.
