---
title: Resource Pagination and Sunk Costs
slug: resource-pagination-and-sunk-costs
published: "2023-11-26"
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags:
  - big-o
  - sql
  - sunk costs
  - sockets
  - postgres
  - pagination
  - elixir
  - chat
---

## Table of Contents

-   [Introduction](#introduction)
-   [The Problem](#the-problem)
-   [Sunk and Operating Costs](#sunk-and-operating-costs)
-   [An Example](#an-example)

## Introduction

As I (very) slowly progress through my project during weekends and free time, I've implemented a lot of features that I only faintly knew about. I've learned and adapted to a lot of new techniques and philosophies, and it's been quite a delightful phase. While I had learned a lot in the 2 years since I began programming, the last year has also been quite a phase of learning. Today, I'm going to be talking about how I implemented pagination in my database. Previously, while I was working at Thread, I attended a PostgreSQL study group where we were reading a book, [The Art of PostgreSQL](https://theartofpostgresql.com). I previously did not ever want to use SQL (I was a frontend developer, after all, partially because I didn't want to!), but I had witnessed its power. If there's one thing I've learned in programming (and also all of life) is that if there's something big you're avoiding because you don't want to learn it: master it before it masters you.

I finally got a grasp over it when I realized that a SQL query returns a two dimensional array (a table). You use the language to determine how many rows and what columns are returned. Most data comes from tables, other two dimensional arrays, which you can combine and do whatever you want. The most interesting part of programming is using the data you have to perform some operation. Look at how we render this component on your display, how we perform socket interactions with the server, something like that, the services our product performs. But you can do none of that without data, and that's what SQL manages.

## The Problem

Let's say we have a conversation between us and our friend on my fantastic instant messenger that I've been working. This conversation's been ongoing for several years. We send each other dozens or hundreds of messages to each other every day. By now, a million of them have piled up. When I load up that conversation, I don't want to see every message since because it will get really slow and laggy if I do. I only want to see a subset of them. And the way that's been resolved is by pagination. The idea is that we break a list of items into separate groups. Imagine a list of items printed on pieces of paper, and you just want to take one. Those are the two important features of pagination: 1. we want a subset of the total items and 2. we want to be able to get the next page based on the current one.

Every SQL dialect (ugh, it's supposed to be a standard) has a way to do it. In PostgreSQL, it's done by ending a query with `limit <page size> offset <num items>`. The offset is basically the number of items per page times how many pages we've gone through. If we want items 200-250, our query ends with `limit 50 offset 200`. However, there's a problem: when we do this, the database looks at every single row in a table to figure out the offset and page size. Every time we get 50 items, we have to look through the millions of messages, even though we only want a subset. There's a better way to do this, but to explain that, I first want to talk about sunk costs in programming.

## Sunk and Operating Costs

There's something called Big O notation. It's a simple way of noting how an algorithm scales to the amount of data that needs to be processed. Basically, if you have a hundred items and you need to look at all of them once? That's called linear time or written as O(n). If you need to look through every other item for every item (i.e. you go through ll hundred items and for each one, you look through all other 99)? That's called quadratic time, O(n2). The best case for any algorithm is linear time, written as is O(1). It means that no matter your data size, the algorithm takes the same time to run.

A place where this often comes up is an array versus a map. Let's say there's a list of messages, which all have a unique identifier, the id. If we want to find one by its id, then we have to look through every item until we find the correct one. What if we laid them out in an ordered way by their id, and figured out a way by using its id we can find out the specific place that the item was stored. The first way is linear, while the second is constant since the process will take the same amount of time for every id.

Offset pagination as described above takes linear time. But there's a solution that takes constant time, what I know as seek pagination. What you do is you have to have at least one field that can be compared and you can create an index upon. In our case that's the id and the creation timestamp (which is added when the resource is created and never modified again). What we do is we order the table by those columns and specify a certain offset by those two columns (which can be derived from a single item), both of which are linear operations, it happens to be. If you are curious about my implementation, here's the [pagination module](https://github.com/benyakirten/chat-api/blob/main/lib/chat_api/pagination.ex), which includes tokenizing both of the fields using base64 encoding into one string (also decoding the base64 into the two fields). The table description in Postgres is the following:

![User table description ](/wp-content/uploads/2023/11/Screenshot-2023-11-26-at-6.47.55 PM-1024x347.png)

You'll notice the `users_inserted_at_DESC_id_DESC_index`, which is the key to this whole thing.

If you're familiar with Big O notation, are familiar with derivatives and integrals or have thought through what I've said, you've noticed that there's something missing. I talk about performance in terms of scaling but never the constant cost. The thing is linear functions usually have a low constant cost but scale terribly, while linear solutions tend to have a larger upfront (sunk) cost but scale well.

## An Example

I wrote and posted this last night, but it occurred to me that I didn't provide any examples. Thankfully, it's easy to look at perfs for PostgreSQL using `explain analyze`. A real perf has lots of examples, but I'm just doing 0 users (which probably isn't good for whatever reason, but I'm lazy) and 20000. Anyway, here is how offset pagination and seek pagination perform on without any items in the database:

![](/wp-content/uploads/2023/11/Screenshot-2023-11-26-at-3.06.30 AM-1-1024x276.png)

![](/wp-content/uploads/2023/11/Screenshot-2023-11-26-at-3.04.59 AM-1-1024x197.png)

You can notice that the planning an execution time for the first (offset pagination) is lower. But how does that scale with 20000 users?

![](/wp-content/uploads/2023/11/Screenshot-2023-11-26-at-6.30.18 PM-1024x397.png)

Offset pagination is still kinda fast, but it's gone up 5 times. While seek pagination has only gone up a bit more than 2 times. I wrote a script to populate users, but because I didn't to think too hard about it, the script took about an hour, so I probably won't be running more extensive tests (at 1 million we'll probably see really good results).
