---
title: The backend is done; back to the front!
slug: the-backend-is-done-back-to-the-front
published: "2023-10-07"
legacy:
  wpId: 1239
  postType: post
  sourceOrder: 147
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags:
  - sql
  - websockets
  - phoenix
  - many-to-many
  - elixir
  - ecto
  - authentication
---

## Table of Contents

1.  [What Have You Done](#what-have-you-done)
2.  [Wha](#whats-next)[t's Next](#what's-next)
3.  [Today's Topic](#todays-topic)
4.  [The Schemas](http://the-schemas)
5.  [The Schemaless Schema](#the-schemaless-schema)

## What have you done?

I completed what I thought I would never get done for one reason or other - I completed the backend for my chat app. I always thought that Elixir was too complicated, too different from what I knew, or that something would come up which would stop me from working on it. But I have to tell you one thing: it was a real, complete pleasure to work with Elixir and Phoenix. I cannot recommend them highly enough. Well, I had a few problems with Ecto, but more on that later. I have decided that over the coming weeks, I'm going to talk about the problems I ran into for which I couldn't find good solutions online and how I solved each of them.

## What's Next

When I built the frontend, I only made it a shell. It doesn't have the actual link up for the data. So that's going to be my priority for the next week. It shouldn't be too terribly complicated, but I do need to receive/manage socket events, set up the API end points and create a login page. None of it is too terribly complicated, and I hope to be able to do it within the next week. The week after that, I start with some contracting work, so my free time to work on my own projects may be limited. My plan was that once I was done adding e2e encryption, adding good form validation, adding testing and making the UI look better (maybe even use an SVG for the chat bubble), that I would contribute to open source. That has been something I've wanted to do for awhile. However, chissà?

## Today's Topic

I think I will be rambling about Ecto today, and the difficulties in using a many-to-many relationship in it. Let's start off with the DDL and DML syntax in Ecto. You might want to follow along and [look at the repo](https://github.com/benyakirten/chat-api). The DDL is all in the migrations, which are in the `priv/repo/migrations` folder. The first example I'll give is the users table, which doesn't have any foreign keys on it (by the way, if the syntax highlighter isn't working well... I'm probably never going to have the time to fix it for Elixir, my apologies).

The execute function lets you execute some raw SQL, but I feel like, other than the syntax, it follows along with normal SQL DDL for the most part. The change function describes both a migrate up and a migrate down, as in "this is the code that needs to be reversed" (though you can explicitly define an up and a down if you'd like).

Now, let's move onto conversations. A conversation is a group of messages between a specific set of users. It should denote whether the conversation is private (between 2 people, can't leave/invite other people, can't have an alias). It has a similar table declaration. These two have a many to many relationship. Some ORMs will create a join table behind the scenes, but Ecto doesn't. Here is both the join table and the conversation table.

The users conversations is the join table. It has a reference to a user and a conversation. You'll notice that it has an additional column, "last\_read". This is used to track when a user has read a specific conversation so you can know who has read your message. Now that we have the DDL open, let's start about the schemas.

## The Schemas

The schemas are a representation of how the data will be used in your application's business logic. It defines what parts of it can be changed and modules for related functions. I tried to follow the examples set out in the Phoenix tutorial of separating the logic for interacting with the schemas and the database queries into the modules for the users and conversations then the execution of the transactions to another layer. By that, I mean in the actual conversations module, I'll have a schema that looks like this:

Then a function that uses the schema will be like the following:

That looks like SQL DML, kinda, which is fine. It also has syntax highlighting and autocomplete, which is nice. The `Conversation` of that block refers to the schema defined above. This is all kinda banal and not that hard to follow along with if you have some experience with using ORMs. Now is the part that had me up the wall trying to figure out what was going on and what I was doing wrong

## The Schema-less Schema

When I mentioned the many to many relationship before? You don't make a schema for the join table. You instead just say that conversations and users are defined by a many to many relationship through the join table. You can see a half of it in the snippet above for a conversation.

Well, what if you need to get specific information about the table in a query? Here's a query that I wrote when I wanted to make sure that both of the users I was querying about belonged to a conversation, not just one of them (yes, the indentation is a bit wrong, but I don't want to spend a lot of time correcting it):

So you can see that the code has `from uc in "users_conversations"` instead of using the schema (like I used `Conversation` before). Okay, not that difficult. I just lose some autocompletion and stuff, whatever. I've survived worse. Well, my problem is I had a hard time finding out how exactly to do this. I'd seen similar SQL at my previous job, but I still get a brain problem realizing that this is handling multiple rows, especially when it comes to the `having` block. The line where you're examining one single row versus a group of rows is hard for me to grok (mostly because I don't do SQL that much).

But this is not the only complication. There's something special that Ecto does to something inside of a schema that is not documented anywhere: when retrieving it from a database, a UUID is stored as a series of bytes. When it is inside of a schema, the bytes are parsed as characters using UTF-8. However, if you don't use a schema, this last part doesn't happen. And Postgrex, the adaptor that Ecto uses between Postgres and your Elixir business logic, treats these things as two separate things. So the UUID `79278c06-3001-4c7e-b7cc-742f1b7ecb85` will be represented as `<<55, 57, 50, 55, 56, 99, 48, 54, 45, 51, 48, 48, 49, 45, 52, 99, 55, 101, 45, 98, 55, 99, 99, 45, 55, 52, 50, 102, 49, 98, 55, 101, 99, 98, 56, 53>>` inside of a query, which can't be used to test equality with its string equivalent (even though Elixir allows that). So what you need to do is that, whenever you use an Elixir value in the query (such as the statement above where: `uc.user_id in ^user_ids`), you need to convert it from the string to the byte representation.

Just to clarify why I was confused about this: Elixir is a dynamically typed language. I thought that the byte string should be parseable into the string. For example, in the IEX REPL, I typed the following:

MIGRATION\_CODE\_BLOCK\_0

What this is saying is that if I insert that line of code then it is parsed as valid UTF-8 characters, giving me back the UUID I specified. Well, Ecto wasn't happy with giving the string, nor was it happy with the byte string. What I needed to do was call a particular function: `&Ecto.UUID.dump/1`. This will convert it into the correct type that can be used in these things. Because I had to do it so often, I made a convenience function:

If you're not familiar with function pipeline operator, what it does it takes the return value from the previous function and supply it as the first argument to the next function. Streams, like a lot of languages have, are ways to group a set of enumerable functions together then run them all at the same time so your set of operations is O(n) not O(n \* m) where m is how many operations you perform.

Once I figured out these two things, that to operate on the table (for example to get or update the `last_read` column value) I had to use the name of the table in quotes and that I had to dump the UUIDs to binary strings, then I could perform all the operations on the many to many table I needed to without a problem.
