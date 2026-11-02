---
title: I have finished encryption on the chat app, and what a journey it was.
slug: i-have-finished-encryption-on-the-chat-app-and-what-a-journey-it-was
published: "2023-12-30"
legacy:
  wpId: 1289
  postType: post
  sourceOrder: 150
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags:
  - base64
  - arraybuffer
  - websockets
  - webcrypto
  - vue
  - signal
  - rsa
  - public
  - private
  - phoenix
  - keys
  - json
  - encryption
  - elixir
---

## Table of Contents

-   [Introduction](#introduction)
-   [Building the app](#building-the-app)
-   [Architecting Persistence](#architecting-persistance)
-   [Encrypting Messages](#encrypting-messages)
-   [Reading Messages Later](#reading-messages-later)
-   [Storing Data Securely](#storing-data-securely)
-   [What's Next](#whats-next)

## Introduction

When I first started this project, I said that it would involve e2e encryption. The basic requirements of it was that I would use web sockets, Elixir (specifically the Phoenix framework), Vue and use the Web Crypto API. I'd been asked by a friend a long time ago to help build a website with people able to create profiles and chatrooms. I thought I could do something, but as I planned it out, it became more and more obvious I didn't have the time or tools. However, I have a problem: if I don't know how to do something, I pursue every avenue to learn how to do it.

I want to note, before I start, that I'm not a security expert. I'm certain that most of this is insecure and not a great architecture for encryption. But I wanted to try something new and give it a good shot.

## Building the app

When it came to making the actual chat app, that wasn't particularly difficult. Wiring up the sockets was error-prone and tedious at times, especially since I hadn't bothered to look into using Postman to test them out. I had to make lots of little changes as I went along, and each time I had to make sure the frontend and backend were coordinated on what data was provided each way. Also, the documentation for it wasn't particularly good on either side. I'd like to contribute to the docs when I have the free time.

As I knew from the beginning the difficult part was going to be the e2e encryption. It was the first thing I had researched before I began this project. I started to read books, ask advice from ChatGPT for advice and read articles online on things like the Signal protocol, on how other apps did such a thing. I learned that I needed a public key, a key that others could use to encrypt a message to send to you, and a private key, a key that only you would use to read a message. I'm not going to talk too much about them (because I don't know that much!), so I suggest you do some research if you want to learn.

When I discovered that browsers could handle most of the cryptography, I knew that there was a path forward. Just like authentication and its frequent use of password hashing, I didn't have a clue about these complicated things. My study was in Italian, history and linguistics, not something like web security or cryptographic algorithms, but that's the nice thing about programming: someone has probably solved your problem and made a version of it that abstracts away the part beyond your comprehension. TensorFlow and SciKit Learn do that with ML and statistics, and the WebCrypto Web API does that for encryption.

If you've ever used TensorFlow or SciKitLearn, you know that if you don't know what you're doing, it quickly gets out of hand. The WebCrypto Web API has so many tools, but I just used what I could easily understand: I needed an algorithm to generate a public and private key so I could encrypt and decrypt text. For an MVP, I just wanted to be able to do the basics of e2e encryption in a one on one chat, and that didn't seem so hard.

## Architecting Persistence

All chat apps persist your messages. After all, I don't send messages to my friend then they disappear as soon as I log out. They stay there so I can read a chat history. So all the messages need to be run by a server so they can be stored. I can store the encrypted messages so that's not a problem. But also I would need to store the public and private keys so they can be restored when the user logs back in. Otherwise, the user would never be able to read the messages they sent ever again. I made a list of what were the needs of the application.

1.  Encrypt messages.
2.  Be able to read the messages at a later date.
3.  Storing data securely.

## Encrypting Messages

Encrypting the messages was to be done through the API I had discovered, so that was easy peasy. I found an article that recommended some parameters, so I didn't need to do much thinking.

That's all I had to do! It was so easy. There was a little bit of complication. To encrypt something, you must pass it in as a Uint8array. The difficulty was in changing a string to an array of their utf-8 encoded bytes. In almost all use cases, you will not need to do this in JavaScript or the frontend, but you often need to do manipulations like this on the backend. It means that you don't learn how to do this for the most part. But the internet comes to the rescue: the `TextEncoder` class. Easy peasy!

You could do it yourself, but essentially this will make an array, a real array with fixed length, not a vector that is a JavaScript array and store a numerical value for the string's data in UTF-8 encoding (I could use other, but UTF-8 is the standard).

Once that hurdle is cleared, the next one emerges: the encryption method returns an ArrayBuffer. And if we want to transmit the data over JSON, we can't use an array buffer. We could transmit the values as an array of numbers, but I want to store this in a text field in my database. As I read on other sites and as I have had to do in the past, the easiest way to do this is to encode it in base 64. And the code for that isn't too complicated either.

Now I can send the data over JSON. When I receive it, I just do the opposite. It is a slightly annoying process, but it's fairly simple. You live and you learn.

## Reading Messages Later

Before I begin: I will talk about how I did things securely (I think) in the next section. This section will only talk about data persistence.

This is the doozy, for multiple reasons. The first mental block I had to overcome is: how do I persist the keys so a user can read them later? If I were designing a mobile app, I have guaranteed (essentially) disk space to persist data and a SQLite database. But I'm making a web app, so I need to store the keys. I'll discuss how I made them secure later, but this is where I did a lot of reading and head scratching. I could use a cookie (or series of them) which can be hidden, but that would mean that a user is tied to a specific browser and computer. Also, what happens if they clear cookies? They would never be able to read their messages again! Also never mind that you could have 10 conversations, and so you would need to store 10 private and 10 public keys in cookies. And cookies cannot store much information in them. You could use local storage or the IndexedDB API, but neither of those are secure, and they have the same pitfalls about clearing your cache or switching device. The only solution was to store it in the database.

With that problem solved, I happily added encryption between users in a private conversation (my app also allows group conversations). User A would encrypt their message with User B's public key, send it to User B. Then User B would decrypt it with their public key. If you've already seen the problem, you are much smarter than I was a few days ago. The problem is that User A would no longer be able to understand their own message because they had encrypted it so only User B could read it. In a chat app, especially with my vaunted persistence, how could I solve that?

I mentioned the Signal protocol above. When I first read it, I dismissed it as excessive. I didn't want to go to al the work of implementing each user sending each message to each other user in a conversation, so e2e encryption would only work for private conversations. I wanted quick and easy MVP so I could show this off on my portfolio. I could slate encryption for group encryption for later. The signal protocol exactly solved my problem. I'm not smart, but I decided that my implementation would involve something called a `MessageGroup`, that acted as a middle man between a conversation and a message in the database. it would represent a message, but it would contain a message for each user in a conversation, depending on their public key.

The scheme was this: when someone sent a message, they would take that same message, encrypt it for every public key in the conversation (including their own), then they would sent that to the server. All of those messages would go under the same `MessageGroup`. This added a little more complication: when a message is edited, all messages under that group has to be re-encrypted. And when I'm deleting a message, I have to delete the message group. Finally, when retrieving the messages from the database, I retrieve only one message per message group: the message for the person making the request. That way someone can read every message sent by them and to them, since there will always be a version stored that's encrypted with their public key.

It sounds so easy now that I type it up, but it was an enormous mental hurdle for me to get over. Once if figured it out, it wasn't too difficult to implement in theory. The main complications, other than catching little problems, was because of the additional join now needed. It occurred in the three places mentioned above: 1. retrieving the messages, 2. sending the messages and 3. updating the messages. Deleting messages was easier to handle because if I deleted the message group, the delete would cascade to the individual messages.

Messages were now paginated. I implemented that a month ago. During my day job, I had run into a similar problem: I want to paginate X resource, but I can only retrieve it after joining with Y data. For me, X was messages and Y was message groups. Here' the solution I came up with:

The real difficulty was figuring out how to do it with Ecto since I didn't want to have to change the pagination logic. I didn't want to do it with raw SQL because then I would need to use each column to correlate with the correct data (which I had recently done with sqlalchemy). And the difficulty with Ecto, as noted in the comment, was figuring out how I could reuse the pagination logic. Using joins was pretty simple, and I think it would've easily solved this problem. But I wasn't sure if it would mess with the pagination logic (I think I ran into some problems), so I used a CTE.

With retrieval and pagination solved, the new problem was inserting the data. Since I'm inserting several messages under one message group, I should use `Repo.insert_all`, right? It makes sense. Well, there came to be a problem: I needed to retrieve each message with its message group because the client needed to know who the sender of the message was. I could encode the same sender on every message, but one of the rules of a SQL database club is this: you don't repeat data unnecessarily.

You might think: "but can't you retrieve the message group after calling `Repo.insert_all`? That's what I thought too, but no. You can't. So instead I had to insert the records individually (Ecto at least handles that in one database transaction if you use `Ecto.Multi`) and prepopulate the `MessageGroup` as needed. For updates, it's very similar. Except with inserts, you prepopulate before insertion, and with updates you do it after.

## Storing Data Securely

Because I'm not a security expert, this is going to be brief. Messages are already encrypted when stored, so that wasn't a problem. Storing the private and public keys securely, however, was a problem. How I got them into my database was because the WebCrypto API allows a public and private key to be exported to JSON. So I just added a table with those fields:

Some of those fields are marked as optional. It turns out the algorithm I used uses all those fields, but only for private keys. A few of those fields are absent on public keys. I could've made two tables, but I figured it was fine.

The other thing to note is that all the fields (minus a few) are marked as binary. That's so I could use [Cloak Ecto](https://hexdocs.pm/cloak_ecto/readme.html). The most of the key's fields are encrypted when they are stored in the database then decrypted every time they're retrieved. It adds overhead, but this way, no one can see the public/private keys even if they access the database.

## What's Next

Now that this is done, I am ready to deploy the application. I have to update the documentation and make a few tweaks, but this should be deployed hopefully within the next week.

There are a lot of features I would like to add, like socialization features, block lists, enhanced messages (such as images/videos), get email working correctly (for registering/changing passwords/password recovery/etc) and so much more. But those features will probably take awhile to implement since I don't have a lot of extra time to work on this.
