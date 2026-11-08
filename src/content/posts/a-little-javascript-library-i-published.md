---
title: A Little JavaScript Library I Published
slug: a-little-javascript-library-i-published
published: "2024-10-09"
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags:
  - ergonomics
  - rust
  - javascript
  - iterators
  - generators
  - generator
  - enumerable
  - elixir
  - dx
  - arrays
---

## Table of Contents

- [Why Would I Do This?](#why-would-i-do-this)
- [So It's Really Efficient, Right?](#so-its-really-efficient-right)

<span id="why"></span>

## Why Would I Do This?

Let's start with two premises: 1. Programmers have to work with lists lot, and 2. Newer programming languages tend to have better features for programming. Or rather, let's go with this premise: 1. I like functional programming, 2. I like the features of new programming languages. JavaScript, though updated every now and then, direly needs to be entirely reworked from the ground up. It's missing really nice features like pattern matching, streams and iterators.

So what did I do to fix this? I created a [package](https://www.npmjs.com/package/array-stream-plus) on the NPM registry. It uses a fluent API and a builder pattern and kinda works like Elixir streams (which have to be converted to list) or a Rust iterator that must have some sort of final method (like `collect` or `fold`).

So what does the package look like in JavaScript?

It works on anything that is iterable so not just generators but also arrays or something like `Map.key`.

<span id="efficient"></span>

## So It's Really Efficient, Right?

If you don't know, Array methods like `.map` and `.filter` aren't very efficient. They allocate new memory to create a copy of the array. If you have more than one operation, you're replicating the array each time. So `.map`, `.filter`, `.reduce` will return three. A million operations? The array will be reallocated a million times. A single for loop that mutates it in place is much more efficient. So I would do that, right?

Well, the easiest solution for me was to create one intermediate array then add items to it. Some functions (`filterMap`, `filter`, `take`, `skip`) change the amount of items in the array, which would require replacing the items in the array and resizing it. Eh, not worth it.

In the end, its efficiency is based on the runtime. V8 (Chrome)? Array methods are similar until you get to 1 million items, then my solution goes in the tank. WebKit (Safari)? My solution's about as efficient in any case, about the same as spider monkey (Firefox). I was expecting something much better. I'll look into making it more efficient, but I'm happy with how the API turned out. It's nice and ergonomic.
