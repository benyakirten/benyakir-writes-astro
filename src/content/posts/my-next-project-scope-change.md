---
title: My Next Project - Scope Change
slug: my-next-project-scope-change
published: "2022-01-29"
legacy:
  wpId: 1056
  postType: post
  sourceOrder: 139
categories:
  - Ben's Thoughts
tags:
  - ecto
  - phoenix
  - liveview
  - my-next-project
  - dev-blog
  - stack
---

## Table Of Contents

- [Introduction](#introduction)
- [The Stack](#the-stack)
- [The Endpoint](#the-endpoint)
- [The Details](#the-details)
- [Bad Stuff](#bad-stuff)

<span id="intro"></span>

## Introduction

This is the second post of the series. I want to write a post every week, documenting every change, no matter how small. Given I still have some spare time now, I have gotten a lot done. I finished reading three books about Elixir, and it's given me some great ideas. I know, books aren't the greatest way to learn a programming language because no one book will remain up to date for more than a year or two at the most. However, it does teach you some interesting things that other means won't. Also it's way more friendly (usually, depending on the book), so why not splurge? Plus, I had an Amazon gift card burning a hole in my pocket.

If you've been paying attention, I changed this from about my upcoming Book #3. I will make a project, but it will be something else with some other stack because Elixir/Phoenix is capable of some amazing things and I don't want to use it on some one-and-done thing. I had a vision of creating a platform for learning.

## The Stack

I will be unfortunately cutting Vue out entirely. I will be doing things 100% with Elixir's Phoenix and its fascinating LiveView. I really like Vue, and I will use it for whatever project I actually do for book #3, but this gives me the opportunity to wait for Nuxt 3 to come out, which I'm looking forward to. There are several more reasons for this choice.

The first is that I've never used this technology before, and I love learning things. LiveView is different and lets you avoid using JavaScript entirely. That might be kinda strange, to effectively use sockets to avoid JavaScript, but I should try it at least once, right?

The second reason is that it allows for stateful communication between the backend and frontend, which is what Phoenix is all about. I might as well embrace this thing wholeheartedly.

The third reason is that otherwise I need to worry about things like CSRF tokens and authentication. Nothing is too complicated, but it's just more work. The programmer's credo is to embrace laziness. Or, rather, that there's a humongous amount of things to do, and you should try to build off of everything that's come before you rather than reinvent the wheel every time you do anything.

To sum it up, the frontend will be Phoenix LiveView, the backend will be Elixir Phoenix, and the database will be Postgres. I will be using Elixir's Ecto as an ORM.

## The Endpoint

The internet is the greatest tool for learning and enlightenment that has ever been created by humankind, and we need to realize that. There have been some wonderful ways in which that has been done, such as Wikipedia, but it's been sadly lacking in the last decade. I want to be able to say "I want to learn programming" and just go to a webpage that will at least help me get started, and, once I have enough down, point me in the direction of better resources.

Phoenix's big selling point is two things: 1. it allows stateful (continuous) communication between client and server and 2. it can handle many simultaneous connections. In the last book I was learning from, they created a system for users to create videos (just links to YouTube) and store it in a database, have users write messages on it live and have a query API look up information at the same time for every comment. I could easily do that with any Framework with a backend, but the quickness and ease was astounding. It opened my eyes.

Oh yeah, the simultaneous connections thing. That's something I couldn't do on my own, but I'm not exactly worried about it for now because no one's visiting my websites. But if I were to create something that people wanted to visit, Phoenix will be my go-to choice.

Back to the subject at hand. What is the endpoint for all of this? I recently had the experience where an old friend from graduate school wanted to get into programming. So what did I do? I pointed him towards the same resources that I used to learn Python. I had to explain a bunch of stuff, like setting up an IDE, how to access the correct version of Python, how to use the REPL and how to use the terminal. A lot of this stuff isn't really available to you, and you just need someone to sit down and explain it to you.

But a big problem with that is that a lot of resources are out of date. These will be things that are several years out of date, and since then things have changed. Or it won't work according to your setup or whatever. There are Facebook groups out there too, and they can be a great place. But I had another idea. A free, centralized platform just dedicated to learning where you can browse lessons, ask a question at any time and anyone can answer it. If you want to upload/link to something, you can too. And any question you answer on something you created would display that you did that.

To be honest, libraries and Wikipedia do the same thing and for free. I think they are fantastic resources, but there's a few problems: libraries are getting destroyed in the modern era by publishing companies and people having a strange distaste for one of the greatest things ever created and always reducing their budgets, and you can't have an active conversation on Wikipedia unless you're modifying the article. Or maybe you can, but it's not easily available or live. Also, Wikipedia's tech stack is a bit old. It will stand the test of time, and it will remain where my website will get outdated more quickly. But for now, I want to create something modern and perhaps more malleable to the future.

The emphasis of the platform would be on the conversation and staying up to date. And I will never monetize it. I believe that people learning is everyone's interests. It enlightens the individual, it helps them find a purpose, it makes them happier, and as for more cynical reasons, it makes you more productive and able to accomplish greater things.

## The Details

The website will be pretty simple, to be honest. I am foreseeing it roughly on the same level of complexity as A Week's Worth.

Currently, my plans are:

- This will be open source.
- Anyone can visit the website and look at any of the resources or conversations without signing up
- The navbar (the bar at the top) will be pretty simple. You can look for a topic, search, or sign up/login.
- If you sign up, you can create your own resources and/or participate in the conversations
- Public chatrooms for discussing subjects or DMs with e2e encryption.

Here are things that I'm discussing:

- If resources should be stored on the internal Ecto database or as pages that can be edited on GitHub. I like the idea of the latter since it gives me finer grain control, but GitHub and making Pull Requests is not for the faint of heart.
- How many chatrooms there are. for example, will be there one on the home page? Probably, but maybe not. Will there be a chatroom for every resource or just for categories (like one for JavaScript, one for Python)? I'm leaning toward the former.
- I may add a query API. So in any conversation on a resource you can do something like "QUERY: what is Angular used for?", and it could ask Google or something. The main reason this is up for discussion is that query APIs are really, stupidly expensive. Like, I looked into it just recently, and holy poop. I would definitely need to get people to sponsor this.
- Internationalization. This is something that I will add no matter what, but what levels should I plan on to begin with? Phoenix ships with it out of the box, so why not?
- I may use OAuth 2 with google/Facebook/etc. providers instead of providing my own authentication. To be honest, I'm not interested in integrating with social networks, but these features can be very convenient.

Fundamentally, I want the platform to be easy to use and a good place just to look something up and learn. I think I have a good start with that. But what will the title of the project be? Maybe "too online". I like self-parody/deprecation. Maybe it's something wrong with me.

## Bad Stuff

I've learned is that one of the first things that must always be considered are bad actors and edge cases. Here are the first ones that I can think of:

- If I allow people to write lessons and anyone can sign up, how are they going to do that? Is it going to be all text with no organization? That proves to be a horrible reading experience, so there needs to be some sort of text editor. How will my text editor prevent bad actors such as people either implanting a virus in the lesson or a link to one?
- How will I stop plagiarism? Although I believe that all knowledge should be shared, I am not stupid enough to think everyone is on the same page, whether they need money to get by, they feel (rightfully) that they should get compensated for their time or whatever Eason. People who want to keep some of their ideas to themselves or only sell their knowledge for money need to be able to do so, and so I need to keep an eye out on plagiarism. A solution might be a ML model that monitors the website for plagiarism. Also there would need to be a way for someone to issue a take-down request. That said, people should also be able to copy their lessons over from a blog post. This is something that I will consider.
- How will the website be accessible? Most importantly to those who have disabilities, but also will it be accessible to those without a computer? To those who have strict data limits? To those who have different points of view and ways of expressing themselves? To be honest, I think a library fills a lot of these niches, and I will do my best to complement libraries and support them.
- What sort of lessons will there be? Just video and text? Audio? Will there be a need for an audio player? How will annotations/conversations be had about that? Will I need to worry about media compression/etc.? Will I need to make my own video/audio player?

These are just the ones that come off the top of my head.
