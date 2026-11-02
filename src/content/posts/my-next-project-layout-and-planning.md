---
title: My Next Project - Layout and Planning
slug: my-next-project-layout-and-planning
published: "2022-02-06"
legacy:
  wpId: 1071
  postType: post
  sourceOrder: 140
categories:
  - Ben's Thoughts
tags:
  - planning
  - layout
  - liveview
  - dev-blog
---

## Table of Contents

-   [Introduction](#intro)
-   [LiveView is New](#liveview-is-new)
-   [How Do I Make That in Liveview?](#how-do-i-make-that-in-liveview)
-   [Layout](#layout)

## Introduction

I haven't done any work in the last week. Yes, it's very out of character for me. I haven't really taken more than a day off in the last year and a half. I'm starting a new job tomorrow, and so yeah, it'll be the only time I don't have to work in a long time. I was thinking about all the cool things I could do with the CSS and states of live components, and then I was like, well... uhh... yeah. I'm sticking for sure with just Phoenix and LiveView for the full stack, but this week I considered how I really want to implement some things.

## LiveView is New

One thing I was thinking about is LiveView is new. If you go to the documentation of it [here](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html), its version is 0.17 (as of the writing of this blog, February 6th, 2022). If you haven't figured it out, anything with a version of less than 1 means it's still subject to a lot of change and might not have some important features (or major conveniences) implemented. And I'll talk about some of it later.

The other thing is that there aren't a lot of people working on LiveView or sharing open source things they've developed. In contrast, something like the super-popular React has something like 20 major component libraries and dozens of routers/etc. One of the biggest ones is Material UI (by Google, React is by Facebook, the more you know). It just looks crisp and neat. It contains a bunch of utility things like having built-in theming - which aren't hard to make, but they require a bunch of wiring things up. This blog uses custom theming, which I developed over half of December.

One of the most interesting and coolest parts is how buttons work (here's an [example](https://mui.com/components/buttons/) from the documentation, scroll down until you see some buttons then click on them). They have an area around the text (the padding). If you click on it, a darker color starts at where you clicked and expands outward to the whole button. The way you do that is that the button's inner content has a span that's absolute positioned on it that's scaled down right next to the inner text. When a click occurs, the span element moves to where the click is then scales up to the full size of the button. Note: You can do this with an after element, you would just need to use an invisible checkbox that gets checked/unchecked when clicking the button. This would put most of the logic in the CSS, but I only want to write it the one way with most of the logic in React.

If you want to know the CSS, it's something like this

Then, since this is in React, you would listen to the button event and do something like this:

I know there's better ways of doing this, simplifying logic and putting things together, but whatever. However, the syntax highlighter doesn't let me tab, and I'm tired of hitting space a bunch. In a future version, I'll update it so tab insert tabs, but I'm too lazy right now.

## How Do I Make That in LiveView?

All the modern JavaScript frameworks embrace components, and so does LiveView. That's cool. However, there's a problem. If you're trying to make a list of things, well, sure, that's easy. From the documentation, you can have something like this:

If you're not used to HEEx syntax and Elixir, this is taking an array from assigns.entries and iterating through the list and rendering a <li> for each item. The assigns parameter comes from the state assigned to the socket. If I were to explain it in depth/for someone who has no idea what state and sockets are, I would need several blog posts.

Now, I want to make that Material UI button. If I know the code already, it should be easy, right? Well, one little problem. React is obviously JavaScript, and a LiveView component doesn't use JavaScript. I could add some script tags or find a way of writing specific JavaScript for it, but I want to follow in the spirit of LiveView, and that involves no JavaScript.

So far, what I've thought of doing is to basically do the same thing in LiveView. I would intercept the click, change the state and add a timeout to change the state back when it happens. The LiveView will also get the event data, so I can take the offsetX and offsetY and add them to the socket state too.

I think that's effectively the solution. I know I would have to use a stateful component to do this and LiveView.JS. The way I really learn to do this is trying it out, and since I haven't worked on the actual project and have no plans to do so until next weekend, this is how it will remain for now. If I don't write a dev blog next weekend, it will be because I haven't had the time to do any of this.

## Layout

So I have thought about the layout too. I want at least three areas: the content (video/text/etc.), the discussion, and some sort of toggle. The discussion will be able to go through: all comments, questions (prefaced by saying Question: am I cool?, which can then have responses), queries (which will go to google, prefaced by saying Query: am I cool?), related videos (such as similar content or if this is a lesson in a series).

I'm imagining something like YouTube's layout. Left is content, beneath is chat content (queries, questions and general comments, able to be sorted by each), right is related content. Do I make them able to be minimized? What if you just want to look up a specific question? What if you want just related content? Can it be resized? Things to ponder.
