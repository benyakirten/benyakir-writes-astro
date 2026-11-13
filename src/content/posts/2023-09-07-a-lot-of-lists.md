---
title: A lot of lists
slug: a-lot-of-lists
published: "2023-09-07"
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags:
  - test
  - vue
  - sockets
  - nuxt
---

It's been about a month since I last wrote. I've been considering writing this for awhile, but now I'm finally taking a break from my current project to do it. As per my last post, I'm working on a chat app with e2e encryption. I have creatively named it "chat app" (hold your applause, please). I'm using Nuxt 3, and I've been having a ball of a time. I thought that after I had used more React and Svelte that I would have lost my appreciation for Vue, but I enjoy it more than ever before.

A tangent: A reason I've been putting off writing this is my computer begins to lag when I start writing longer posts on WordPress. I think that's an indictment of the block editor. Also a lot of webpages use CSS that lags my computer, which makes me annoyed. I would rather something simple and efficient over something slow and pretty. Information should always come before fancy animations or 3d renderings.

But let's get to what I was want to talk about: since I got laid off, I've had a ton of things to do, but I've been spending as much time as I can get away with (usually 1-2 hours per day -- which I hope increases once Mattia starts preschool) working on the chat app. The front end draft 1 feels about 80% of the way there, and I hope to finish it before the end of this week. Because I've noticed some problems with my blog I'd like to address, but I haven't had the time for them yet because I want to get to version 1.0 of the chat app.

The final version of the chat app should have these features:

1.  Live 1:1 chats
2.  Group chats
3.  A comfortable UI for doing this
4.  Authentication (maybe even passwordless?) and persistence of data
5.  E2E encryption
6.  Accessibility options (changing font sizes for readability, color schemes, etc.)
7.  An account page and a way to specify geographic location/preferred topics (to find others).
8.  Use a lot of cool new [web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

I've decided that version 1.0 will be done with 1-4. Then I will take a break to work on this blog, then I will return for at least 5. The others will happen too, if I have enough time.

As far as this blog's problems go, I really want to address the following:

1.  The left bar opens too fast for my taste now
2.  The squiggles you can hover on the portfolio page should not move/rotate whatsoever if you have the reduced motion accessibility option
3.  When you are sorting blog posts/books/etc., there is a button for every unique tag. For blog posts, this is dozens and dozens, which is awful UI. This should become a multiple select option with an output displaying the ones that have been chosen.
4.  Keyboard-only navigation isn't great.

I've gotten a decent amount through the frontend, and I've made a list of the following features I would like to add before I make the project public on GitHub:

1.  Generalize/cleanup functionality
2.  Add start new conversation functionality
3.  Add multi select dropdown with input search
4.  Make FAB (floating action button - the way to open the navigation side menu right now) and search bar in side menu only appear in cell phones - hamburger icon in/search bar at top on desktop
5.  Cleanup colors/css/etc.
6.  Add account page
7.  Add sign up/login page

Both for this list and the list of what I'd like to do on the blog, I'm omitting tests. Tests are wonderful. I would love to have them all - storybook, unit, integration, etc. But expedience comes first. I have to get the projects to a presentable place first. Then I can take a breath of air.
