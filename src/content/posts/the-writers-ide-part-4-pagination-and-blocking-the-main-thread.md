---
title: "The Writer’s IDE, part 4: Pagination and blocking the main thread."
slug: the-writers-ide-part-4-pagination-and-blocking-the-main-thread
published: "2025-08-02"
legacy:
  wpId: 1485
  postType: post
  sourceOrder: 157
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags:
  - generator
  - webworker
  - typography
  - simd
  - service worker
  - latex
  - thread
  - compiler
  - blocking
  - asynchronicity
  - ast
  - layout
  - wysiwyg
  - wide
  - pagination
  - mainthread
  - dom
  - javascript
  - zig
  - rust
  - prosemirror
  - c
---

## Table of Contents

1.  [Where I've Been](#where-ive-been)
2.  [My First Steps](#my-first-steps)
3.  [Pagination](#pagination)
4.  [But my UI](#but-my-ui)

## Where I've Been

It's been quite awhile since I wrote a blog post. I had not even started working on the code the last time I wrote. I've not only started, and now it's more than 10k lines long The progress is slow at times, and it depends on a number of factors: my free time, my work load, and, most importantly my interest. If the work seems like a lot or something that I don't really want to do, then, well, I'll hold back because there's always something for me to do. I've also had the fortune of getting a Kindle for Christmas (about 7 months ago), and I've been reading so much. I read the Decameron and Blood Meridian, which are masterpieces and already among my favorite books. I've read others too that are quite good. And then I also read a book about programming in C and wrote my own [(probably heavily flawed) hash map](https://github.com/benyakirten/c-word-counter) to count unique words in a book. That also got me on a tangent of Zig, [asynchronicity](https://kristoff.it/blog/asynchrony-is-not-concurrency/), memory management and [data-oriented design in compilers](https://www.youtube.com/watch?v=IroPQ150F6c) (which will be relevant to me as soon as I work on a compiler for Latex to an [AST](https://craftinginterpreters.com/a-map-of-the-territory.html#parsing). The biggest delay in writing this blog post was me wanting to get something decent out there before I did so. And the biggest delay in that was that I've had to do a ton of contracting work recently. Also that a word processor has been much more complicated to work on than I thought.

## My First Steps

Let me start from the start, the way back when of November 17th. I have always loved creating everything from scratch. I learn something new, and it's always fun to see the intricacies of something. I wanted to see if I could write my own WYSIWYG editor in JavaScript. And that was, well, fine. I learned about how to make the core part of it, and it's pretty... terrible. The browser treats every DOM element as a separate, independent thing because, fundamentally, that's how it's made.

However, you want to create a paragraph, write some text, and then start another paragraph. If you press the up arrow on the first line of the second paragraph, the curser should go vertically to the previous paragraph. That doesn't happen because the up arrow will probably scroll the browser window up or... it kinda depends on the context, but it often just doesn't do anything. The way to solve this is to select bits of text to get the cursor offset, find the same offset in another place and do the same. Then you have things like remembering your maximum offset in certain situations, etc. It's not difficult for the most part, but it's tedious, makes you work with weird APIs, and there are a million situations you have to look out for.

So I opted to instead use [ProseMirror](https://prosemirror.net), which is a tried and tested solution. They've gone through all the hassle and found every exception - at least I think so. And it's extremely extensible. There's little to the main package except for handling all those sorts of details I began to figure out and a system to handle plugins/extensions/etc.

The first thing I knew once I got the basics of editing text done is that I wanted users to be able to create lots of bars, wherever they wanted. And each bar could have up to three controls on it. Or less, maybe, depending on how much space each control needed. And that you could move one from a fixed position (top, left, right) to a floating position or the other way around. And floating ones could be repositioned by dragging them around or resized. And also the positioned bars could be resized (make the bar wider if it's vertical or taller if it's horizontal). I'm too lazy to provide screen shots right now so if you don't understand what I'm talking about, sorry.

## Pagination

With all of that done, I was thinking about what people in a word processor. I had not been thinking about it originally, but people want to think about pagination. My original idea was to focus only on ebooks. Reflowable ebooks don't have a lot of features such as pagination, columns, footnotes (only endnotes!) and most layout features, while fixed layout have other features (more on this is available online, such as [this blog post](https://www.hurix.com/blogs/fixed-layout-vs-reflowable-whats-the-difference/)). An author also needs to also think about print books, pdfs and other formats. What about academic articles? I want to be able to accommodate them all so my system should be

I came up with the idea of rendering modes. If you want to see how things would be for a reflowable ebook (most books, not things like comic books which care about arrangement and images over everything else), it will disable any custom font size/colors/layout/pagination except end of chapters. If you select reflow able, ebook mode, pagination will disappear as well as those other things. But if you go for a print book, they will reappear. And based on what you want to see, you will see different features. I want to make everything extensible, but this will be something that might take longer to figure out how to do so for rendering modes.

To disable something, you have to enable it some times. I wanted to start with the most basic of these to start with: pagination. But how exactly do I handle pagination? Well, let's lay out what their requirements are:

1.  Each page is visibly distinct.
2.  Each page has certain dimensions such as size, bleed, margins, etc.
3.  Content may not take up the whole page, but it may not exceed it. Any excess will be added to the next page.
4.  If a page begins or ends with lines of text, we must account for widow and orphan lines of text.

I knew about widow and orphan lines before I began this project in practice, but I did not know the theory. In typography, a widow line is the minimum number of lines at the start of a new page and orphan lines are the minimum number at the end of a page. If we have a paragraph of 3 lines of text where two lines are at the end of the first page and one at the top of the second page, we have one widow line. It's a bit hard to read so we'd want to move a second line to it so there'd be one line at the bottom of the first page and two at the start of the second page. But that leaves an orphan line at the bottom of the third page. So what's the solution? Bump all three pages onto the second page and make the first page have none of them.

So then we have two things to figure out before we can apply pagination:

1.  How do we detect when we overflow a page?
2.  How do we count the amount of lines in a paragraph?

The answer to both of these questions is "very carefully." JavaScript doesn't have access to the actual data of how a browser lays out text in a block, but we can select text and check how large of a square we make by selecting some text. Turns out that's all we need to do, just in a lot of different ways that just really hurt your soul.

The first step is to make the page a type of node in ProseMirror and a DOM element while assigning it properties like padding, width and height. Then we can get a bounding rectangle, which will have its height, but its bottom will be greater than it if it overflows (content exceeds the page, meaning it should paginated).

Great, we've found that we've overflowed. So we can go through all the prose mirror nodes in the page, find the one that causes the overflow and find out where it causes the overflow. Then we can go into that node, find out what part of it causes the overflow. is it text that can be split along lines (and can follow widow/orphan line rules)? Is it an image or some sort of block that cannot be split easily?

To find out how many lines are in something, it's actually easier (and stupider) than you would think. We do have access to the line height of the paragraph. Then we divide the height of the node by the line height and we get the lines. To figure out the overflowing lines, we can get the overflow of the element (element bottom minus page bottom) and divide that by the line height. We can calculate the amount of widow and orphan lines once we have that. Now we just need to find out where the position of the letters that start the exact line where we want to move everything over.

The solution to that is extremely tedious. We select different amount of text, and we can call the function `.getClientRects` on a range of selected text. The number of client rects is the number of lines of text. With this, we have all the pieces on the board. Now we just need to line them up. Here's the function for pagination, essentially:

This is my function with a bunch of helper functions, which contain most of what I was talking about. If you want to see the full source, check out my [WIP here](https://github.com/benyakirten/writers-ide/blob/b013a48440220422fe141ad0360e3b75b6d5c64a/src/lib/editor/state/page-layout.svelte.ts#L253). Obviously, there's a lot of todo, but it works for text nodes.

## But my UI

You're probably looking at the function and thinking, why is it a generator function? Why in the world would you want that? It's part of what I consider an ingenious solution to a big problem.

If you've ever worked with JavaScript and read until here, you have just one thing on your mind. Namely, this is very slow and it blocks the UI. I can't offload anything to web or service workers because I'm working with the DOM. So are you just going to block the user whenever you need to paginate? What if you need to repaginate the whole document?

I want you go to Microsoft Word, Pages or your word processor of choice right now. Copy and paste about 300 pages and text, scroll to the very bottom, select all the text then change the font size. It's going to lag. Maybe just for a few seconds, but it could take longer depending on the application, your processor and what not.

There are two things about pagination that you need to know:

1.  It cannot be done in parallel because if you paginate the first page, it may cause the second page to need to be paginated, etc. This means you cannot use vectorization/SIMD, multiprocessing or any tricks to make it fast.
2.  Word processors will do lazy evaluation, i.e. they will only paginate from the start of where the last change occurred until the page that is in the viewport. That's why you need to scroll to the bottom.

One of the first things in web design you learn is to never, ever block the UI. It makes for a horrible experience for the user. So how do I get around this?

Stopping and starting execution! By using a generator function, I can make the linear task start and stop anywhere I want by calling `.nex`t or continue iterating when I want to. So I can do however many iterations takes 200ms, then I stop and refresh the UI (maybe check to see if the user has clicked the pause/stop button) then continue going for another 200ms. Repeat until the pagination is done or something else happens.

By making the function into a generator, I give the caller all the power to start/stop execution and do whatever they want, whenever they want.

Now, you may be thinking that this sounds incredibly hacky. I agree. I've been considering writing my own UI for this instead of using a web browser, but that would take so much more work in what will already be a project that will take a very long time. Making my own UI sound like a lot of fun, and having access to the underlying algorithms would indeed allow me to parallelize this or do it in the background so I don't block the UI. But it's not something I will probably get around to doing for another decade at the very least.

Thanks for tuning in. I will try to write more about the process more often.
