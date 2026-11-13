---
title: My Next Project - Deciding on a stack
slug: my-next-project-deciding-on-a-stack
published: "2022-01-22"
categories:
  - Ben's Thoughts
tags:
  - vue
  - elixir
  - dev-blog
  - stack
  - my-next-project
---

## Table of Contents

- [Introduction](#intro)
- [Where I Start](#the-start)
- [The Problem to Tackle](#the-problem-to-tackle)
- [The Tech Stack](#the-tech-stack)
- [Nuxt](#nuxt)
- [Golang](#golang)
- [Erlang](#erlang)
- [Elixir](#elixir)
- [Conclusion](#conclusion)

## Intro

I had an idea. Or, really, I came across it in a place, that I should blog about the process of creating my next project. Okay, a little preface. I've got a real job, so I won't have a ton of time to do this, but I've really fallen in love with making a project for each book. And I finished my third book, so that means only one thing: another project.

I actually had a hard time thinking about what I want to write about or why I continue to have this blog, but I like using this opportunity. I recently started to talk to an old friend who wants to get into web development, and so I thought I should use my (somewhat wisened, somewhat educated) wisdom and share the process of what it's really like. Because I think there's two daunting problems for people who want to get into programming: how do you actually get started, and what do you actually do?

I want this series to be both for beginners to see what making a project is like and for people who know what they are doing, to see what the rational is behind all my decisions. To be honest, I almost never explain the latter because I don't think anyone cares. But now there will be a place for people to figure out things.

On a previous project, I worked on how exactly to write tests for Django Graphene with the django-graphene-auth package, which wasn't incredibly obvious, especially since there isn't a very large community for it. One thing I was thinking is I may stumble on similar niche problems and tackle them too. And then if you have those same questions, you can read about it here, and, moreover, how I got there in the first place.

<span id="start"></span>

## The Start

Someone more responsible would think in terms of outlines, flowcharts, or maybe what the book I'm making a website for is about, but not me. I have two things on my mind, my requirements for this project:

1.  A general concept of what problem I want to tackle
2.  A technology (or group of technologies) I haven't used

<span id="problem-to-tackle"></span>

## The Problem to Tackle

I've known for awhile that I want to use WebSockets. If you don't know what they are, they allow continuous communication between a server and a client. Usually a web application runs in the following way: 1. some person goes to a website on their browser then 2. the browser goes through the ISP, blah blah blah, contacts the server on the end point, and that sends data back to the user.

Once that's done, there's no more communication between the two, until the user does something else. Maybe you click on the "about" link or something, and then you repeat the process. However, let's say you're playing battleships with your friend. You take a guess, then they take a guess. The client-server relationship for a web application is fine for when you take a turn, but when the other player takes a turn, how will they communicate that to you? They can't give you the information unless you request first.

There are several solutions, and I'm not going to talk about them for the sake of brevity. I just want to say that WebSockets solve the problem. They let the client and the server continually talk to each other. Not only that, but each web socket can have multiple clients connect to it. They're how (modern, website-based) chat rooms run. I don't know how, for example, the AOL instant messenger worked in 1995, but I do know how it works now.

Why do I want to work with WebSockets? They're powerful, and I've never used them on my own project before.

<span id="tech-stack"></span>

## The Tech Stack

What are some technologies I haven't used before? Here's the complete list of what I've used:

- Vue (JavaScript)
- React (JavaScript/TypeScript)
- Gatsby (React)
- Angular (TypeScript)
- Svelte (JavaScript/TypeScript)
- Sveltekit (Svelte, obviously)
- Python
- GraphQL

Here are some technologies that I want to use:

- Next (React)
- Remix (React)
- Nuxt (Vue)
- Golang
- Swift
- Flutter
- C#/.net

So, if you're in the know, React/Next/Nuxt are JAMStack frameworks. Basically, they take a frontend JavaScript framework and add a server and SSR/Static generation to really make the framework run much better. These are all technologies I want to use somewhat, but now I'm going to explain why I don't want to use any of them.

First off, I just finished off work (for now) on my blog, which is Gatsby (React). I'm getting sick of React, and so I'm gonna take a break. I've also learned almost as much as I can (not everything, but a lot), and I often learn something best by not doing it. As in I learn to appreciate it from another perspective when I do something else. So, anyway, that removes Next and Remix. I do want to try out both of them, but not for now.

Frankly, I don't have enough experience with Swift, Flutter or C#/.net to do them justice. I could learn what I needed to, but it would take too much time commitment. Plus Swift will only run on Mac/iOS devices, which kinda limits things. If I were to do Swift, I'd make an Apple Watch app or something. Besides that, you have to pay a yearly fee to be an iOS developer and publish your apps to the App Store (otherwise, you can't get distribution to any Mac device other than a computer, though iPad apps can probably be downloaded? I don't know). Also Flutter is for mobile primarily (technically also computers and such, but eh). C#/.net is interesting because Blazor apps compile to WASM, which is another thing I haven't explored. But I frankly don't like OOP, so I'd prefer to do something else.

## Nuxt

My first idea (because I hadn't ever really seriously considered anything that I'd described above) was just to do a Nuxt app. It has everything I'd need. And in fact, I toyed with one for a few hours and realized it was real easy to set up both server side sockets and client side sockets in the same app. It was really convenient.

However, there's a problem. I made my last Vue project (Recovering Grandeur) using Vue 2, and Vue 3 is out. Some updates, like the new versions of Angular or most versions of React, don't really add anything. But Vue 3 had some pretty large changes that I wanted to try out because they seemed cool. The problem is that Nuxt 3, which is the version of Nuxt for Vue 3, isn't out yet.

Fundamentally, this doesn't matter that much for me. I really want to use Vue 3, so then the solution becomes: separate backend and frontend. Vue for the frontend, and what about the backend? How about Golang? I've been wanting to use it for a serious project for awhile now.

## Golang

I've wanted to use Golang for awhile. The main problem was I didn't have much experience and didn't know that much. No problem: just read some stuff and work on some minor projects until I get a handle on it. That would be perfectly acceptable and a good solution.

Unfortunately for Golang, something happened during my work interviews. One of the interviewers talked about something called Erlang. I had never heard of it, but I figured I might as well look it up. Because if I had never heard of it, it was always one of two explanations: 1. it was esoteric and something that I didn't want to bother with or 2. it was esoteric, cool, and just something that I hadn't learned about yet.

Most of the time, when I haven't learned about something and I hear about it, it falls into category 1. For me, this includes C, C++, Assembly, Machine Learning and Laravel. I have looked at those things, each in turn (but not very in depth), and realized they weren't for me. Laravel is PHP, and I am instantly not a big fan of anything to do with PHP. C/C++ is just taking the fun from something cool like Python and making it long and not fun. Also C++ is OOP, which, like Java, is what I think of when I think of anti-fun (although you should call me weird for thinking anything in programming is that fun). Machine Learning is awesome, fascinating, uses C/C++, way over my head, and uses a bunch of math and statistics I don't understand. My brother who got a PHD knows all about it, and I've decided I'm. not gonna get a PHD in anything.

## Erlang

Erlang is really funky compared to everything I know. It was developed in the 1980s by Ericsson to work on telecoms. And it's real different from any C based language because it's a functional programming language, and by that I mean entirely functional. No OOP, no normal control flow, nothing.

What does that mean? Well, first off, no classes, and I believe no inheritance. I didn't investigate enough to see if there was none, but I assume not. Second off, no if statements, no loops at all. To control those sorts of things, you use recursion and function parameters. Basically, if you want to loop, you put everything in a list, then you run through every item on a list until you reach the end. Here, let me give a snippet of what that might look like:

I didn't really do a ton of this, so I might be wrong with my syntax, but line by line, this means:

1.  Module must match the file name
2.  Export means which functions are public (effectively). You might be wondering what the /2 means. First, let me explain arity, how many parameters a function takes. foreach/2 means only the function called foreach that has two parameters is available to anyone who uses this module. If another module uses this one, they instead say import(for, \[foreach/2\]), and every time the function is called, it's called as for.foreach and must take two parameters.
3.  The next three lines describe the same function three times. What's happening behind the scenes is that Erlang compiles this into three different functions, but we just write one that recurs on itself, using the shape of the parameters to decide which one we're using. The parameters effectively act as an if condition.
4.  The first foreach clause pattern has two arity, which means when you call foreach from outside, this is the one that's called. The first item is a list, and we're pattern matching it as two items (the \[ item | item2\] syntax, dividing the list into head and tail): the single item at the head of the list, and all other parts of the list now in a list called Tail. It recursively calls itself but this time with three items, so it goes to the second function call. Note how all variables start with a capital letter and note how all functions end with a period.
5.  The second call is the function in process, but it has three arity so nobody sees it from outside the module.
6.  The fourth is what happens when there's an empty list instead of one that can be split into two items (if you do \[Head | Tail\] on a list with one item, it will return Head as that one item and Tail as an empty string). This is the base case, and you just return the accumulator that now stores all the items with the function called on it.

Some things to note about the whole process: 1. every function returns something, and you can't modify parameters that have been passed in. In C or Golang, for example, you can pass in a pointer to a variable, and changing the item in memory of what the pointer points to, you can change the item when a function is called on it. You can't do that in Erlang or any functional programming language.

This was a completely new paradigm for me, and I'm not even talking about the syntax. It's wild, but also you get an insight into what exactly was meant with the function. And more than that, it's really concise. It instantly clicked with me. I had written JavaScript with some functional stuff like almost always using map/filter/reduce and rarely if ever redefining a variable and/or modifying a parameter variable, but this was like night and day.

There's also one other thing that you should know about Erlang. It was designed from the beginning to work on a massive network with concurrency in mind (being designed for telecoms, after all). The immutability of it plays a big part in letting concurrency work correctly. After all, you never want to modify something in one process that's used in another. It's dangerous and can lead to a whole host of bad things.

Erlang comes with the OTP (Open Telecom Platform, which is basically ignored because I'm using this on a computer and have nothing to do with Telecoms), which is basically a whole platform to facilitate multithreading and a bunch of other stuff.

Well, long story short. In 2014, someone made Elixir, which is basically modern Erlang because, let's be honest, Erlang feels 100% like it came from the 1980s.

## Elixir

Elixir is much more user friendly and has a more modern syntax. A lot of its syntax comes from Erlang, but it's more comprehensible. Here's an example:

If you've done any Ruby, you'll notice that the syntax is fairly similar. In fact, I briefly learned some Ruby before I did Elixir, and I was like "oh, well, it's good I looked into Ruby". It also allows some moderate amount of type hinting and such and linting based on it, but like Erlang, it's dynamically typed.

It also has symbols like Ruby, but they're called atoms. Atoms also come from Erlang. If you haven't noticed, a lot of things come from Erlang like that, which predates a lot of modern languages.

Anyway, concurrency and a system built around it works well with WebSockets, which is all about doing something in the background while something else goes on. It turns out there's a fullstack web framework that uses Elixir too, Phoenix. So... why not?

## Conclusion

I've come the conclusion that I will use Phoenix for certain. The one pause in my mind is about the frontend. Let me explain.

HTTP is a stateless connection. By that, I mean, once the server sends your information over, it forgets about you. If you want to make it remember, you have to send information back, usually in the form of a cookie or a JWT in the case of a SPA.

However, Phoenix somewhat bucks that trend because it specializes in maintaining a bunch of connections at all time to make a stateful connection between server and client. What I would usually do is use Phoenix as the backend and then have a SPA (Vue in this case) be the frontend. However, why not take advantage of the uniqueness of Phoenix?

On the other hand, Phoenix makes the frontend easy to modify from inside of its app. So I could use Phoenix while using Vue too. But does that get rid of the advantages of the stateful connection? Can I just use Phoenix LiveView (what it ships with) to make a SPA? Is it basically like a SPA? Obviously, I like SPA apps. If you're wondering why, they're cool. I probably wouldn't have gotten very far with JavaScript without them because they piqued my interest quite a bit.

I still haven't made any decision yet. I won't be able to give a definitive answer until I've finished my reading (I'm reading a book on it) and worked on the project a bit. But these are the exciting decisions that I have as I begin to work on this project. I will try to write about this every week, but I probably will get many fewer opportunities.
