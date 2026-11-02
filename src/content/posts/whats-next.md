---
title: What's next
slug: whats-next
published: "2023-08-07"
legacy:
  wpId: 1185
  postType: post
  sourceOrder: 138
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags: []
---

I got laid off. I bear no ill feelings, but it changes my situation: I have to start creating and working on my portfolio again.

I'll talk about what's actually important: where do I go from here. I forgot the expression but essentially: the past is finite, the present a moment, and the future infinite. Here's what I'm going to start doing:

1.  Fix my resumé and start applying for jobs.
2.  Write a few blog posts here and there.
3.  Work on the next job for my portfolio and occasionally my next book.

.I have so many ideas for projects and my book that I couldn't start because of not having any free time between the kids and my job. While I was thinking about what's something truly artistic that I want to create with a project it's this:

A "multiplayer" canvas where anyone can create anything that a DOM with limited JavaScript could create. You can draw on it or arrange DOM elements like `div`s or even something more complicated like an `svg` or `canvas`. It would have these features:

1.  A playground area that are public spaces with whoever joins (probably sharded to a limited number of users)
2.  Private rooms with limited occupants (by invitation or just yourself)
3.  Chat in groups and private chat

The first place I'm going to start is #3. I want to create persistent, e2e encrypted chat. I've used sockets before but in a limited way, and I want to get more familiar. Then I know nothing about e2e encryption (other than a few articles I've read), and then I have to figure out how to persist encrypted messages to a database/kv store like Redis. I plan on having the following MVPs (minimum viable products for the non-nerds):

1.  Decide if I will use a fullstack framework like Phoenix in Elixir or Rust to make an independent backend with API endpoints. I'm leaning toward the former, but it's something to consider.
2.  Private, unencrypted 1:1 chat
3.  Encrypted chat
4.  Group chats without encryption
5.  Group chats with encryption
6.  Persistence to a database (maybe Postgres or I could use something like Mongo, this is a big TBD)
7.  Usage of a K/V store

I plan to use my own styling and try to focus heavily on UX. I previously focused heavily on accessibility for my blog, and the UX is only alright (though I love the side menu). I also want to try out lots of new things like buttons with gradients, more interesting interactive state, things like graphics, etc. I want to get out of my comfort state and create something unique.

Expect more updates as I progress on that. Or don't if I find a job and myself without time again.
