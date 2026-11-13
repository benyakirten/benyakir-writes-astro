---
title: Almost... kinda... halfway there
slug: almost-kinda-halfway-there
published: "2023-09-12"
categories:
  - Ben's Blogs
  - Ben's Thoughts
tags:
  - bun
  - pnpm
  - sockets
  - vue
  - yarn
---

## Table of Contents

1.  [Intro](#intro)
2.  [Bun](#bun)
3.  [My Progress](#my-progress)
4.  [Next Steps](#next-steps)

## Intro

I'm getting there, yeah! The frontend is almost done... I would like to say. I am making progress, it's just that things are a bit more slow than I would like. A large part of that is the amount of paperwork and documents I have to work on. Hopefully, that will become reduced as time goes on, but I will talk about some things that have been going on:

## Bun

If you're going to do anything in JavaScript beyond the simplest things with a web page, you will need something called a package manager. It allows you to download packages other people have made and, what usually happens when you get ready to publish your website, build and optimize it. I originally started working on the project using [PNPM](https://pnpm.io). It was a bit better than what I had previously used, [Yarn](https://yarnpkg.com), but it wasn't something that fundamentally changed my approach.

Like most JavaScript developers, I decided to go after the shiniest, newest thing, which is [Bun](https://bun.sh). It is faster than PNPM, I will say that. It is significantly faster, but let's be honest: `pnpm install` took something like 24 seconds. That Bun did its install in 7 seconds is significantly faster, but those 17 seconds didn't change my life. It has a lot of APIs that are supposedly a lot better for the backend, but I hardly ever use JavaScript for the backend.

Let me make it clear to you: I am good at JavaScript. I have experience with a lot of different packages, package managers, libraries, frameworks, and the actual language. I think JavaScript is an old, dated language, and because it's terminally backward-compatible, it will never really get updated. I didn't have problems with it until I learned a bit of Swift, Elixir, Golang and Rust. That's when it really started showing its age.

## My Progress

Let's move onto what you came here for: what I've actually been doing on my project. In the past, what I've done is I created the backend then worked on the frontend. This works logically, since it means that you get the functionality then you know what you have to build around. This time, however, I decided to approach it from a different angle: let's imagine I'm creating a MVP (minimum viable product) that is supposed to convince someone that they should let me build the project out. What this means is that I need to create something that will look good and have a bunch of functionality that gets them to sign on. I thought about what people wanted in a chat app:

1.  The emphasis is on the chatting, not any other feature (ignore my previous blog post about incorporating a shared canvas with DOM manipulation -- that will come later. ). This means the first page is chatting.
2.  The user wants to be able to have group conversations and private conversations. You might think that a group conversation and private conversations might not be that different. After all, if you send a text message (or with Slack), you can often just add someone to a private conversation and then they're added. Then they can drop out if they want. However, because I eventually want to implement E2E encryption, these need to be treated as separate things. In a private conversation, the sender immediately encrypts their message with the their conversant's public key, while a group conversation is a little different. To be honest, that's not something I've figured out yet, but I have found some resources about it.
3.  In a group conversation, you should be able to add people, leave it and give it a nickname (I call it an `alias`).
4.  A message itself should indicate if it's being sent (a loading state), an error happened (an error state), an indicator for who has read it, the ability the edit or delete your own messages.

Here's a very rough draft of what that will look like (don't make fun of me, I aimed mostly to get the functionality out the door):

![](/wp-content/uploads/2023/09/Screenshot-2023-09-12-at-7.48.22-AM-1024x589.png)

There are a few things I hadn't considered. First is that you want to bundle the messages from the same author. Sometimes this is done by time, but I just did it by author and that each message would show when they were sent. And the last message of this message group would have a tail pointing toward the avatar. To be honest, the tail right now is basically a triangle using [clip path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path). I spent a bit more time researching different types of tails. For example, messages on Apple products (when I revise this, I will likely update the tails to use a :

![](/wp-content/uploads/2023/09/Screenshot-2023-09-12-at-10.06.33-AM.png)

There are a few other tricks I used, such as using [color mix](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix). Also [dialog backdrop](https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop) and a text input that increases in size as the message gets longer (this is how most modern messengers work). I can't embed videos, so two screenshots will have to do:

![](/wp-content/uploads/2023/09/Screenshot-2023-09-12-at-10.17.04-AM-1024x96.png)

![](/wp-content/uploads/2023/09/Screenshot-2023-09-12-at-10.17.00-AM-2-1024x99.png)

## Next steps

The long and short of it is that I have almost all functionality. Next on my list of to-dos is:

1.  Revise the looks so it's sleek and looks good (including mobile)
2.  Make some slight changes to my blog's portfolio page so it looks better
3.  Publish the project on my blog and portfolio page
4.  Begin work on the backend

The steps might not happen in this order (I may do 2 before 1). Then the following will happen:

1.  Add permissions system
2.  Add e2e encryption
3.  Add the canvas thing

Isn't this exciting? Well, it would be if I had more time and was less stressed.
