---
title: How I use cookies for auth
slug: how-i-use-cookies-for-auth
published: "2023-10-11"
categories:
  - Ben's Blogs
  - Ben's Thoughts
tags:
  - client
  - middleware
  - server
  - footgun
---

## Table of Contents

- [Introduction](#introduction)
- [Authentication](#authentication)
- [Login/Register](#loginregister)
- [Refreshing the Token](#refreshing-the-token)
- [Silent Login](#silent-login)

## Introduction

I know I said I'd talk about some of my troubles/discoveries with Phoenix, but I spent a lot of time working on dealing with issues arising from SSR, and I thought I'd talk about it while it's fresh in my mind. To refresh you on where I am, I have most of the UI done, I added the backend, and now I just need to hook up the UI to the backend. In this post, I'm going to talk about authentication. In the next post, I'll talk about the difficulties I had with the UI and SSR.

## Authentication

The auth system I set up isn't terribly complicated. A user has a hashed password, a profile and a bunch of conversations. When a user registers/logs in/uses a refresh token, the API returns the user's detail, a new auth token, the conversations they are in and the users in the conversations. The auth token is used on every API and socket interaction. I don't want to get too into the weeds about why I do this with sockets when it's not strictly necessary, but it's to make sure that users can be logged out remotely. Also because if the token somehow gets compromised, the bad actor can only pretend to be the user for 30 minutes.

Okay, let me explain things. The auth token is like a JWT, but it uses Phoenix's built-in Token module. The refresh token is just 32 random bytes that are hashed. Each JWT lasts thirty minutes and is not stored in the database. A refresh token lasts 2 weeks and is stored in the database and allows the user to get a new auth token, a new refresh token and retrieve the user's details. JWTs are kinda annoying to revoke. We could store them in the database, but the point of JWT is their cryptography lets them be passed around openly in client side code (which the user can access at any time). I could allow the user to not see them with `httpOnly` cookies because of the stateful connection between the Nuxt client and server, but I do need to use them in the client for the socket connections.

So instead they need to be exchanged pretty often with refresh tokens, and those we can store in the database. Persisting the client connections and details has always been a pain point. Often `localStorage` is used, but that's less than optimal because it's accessible from the browser's JavaScript. But since the token only lasts 30 minutes, the damage that can be done is limited. The emphasis is put on a refresh token, which grants much more robust possibilities. It can be exchanged for a new refresh token that lasts for 2 more weeks, effectively meaning that a refresh token grants the user permanent access. I could create a system where it forces a login every so often, but I didn't for two reasons, 1. I didn't think it was necessary so I didn't spend the time on it, and 2. a user can force all refresh tokens to be invalidated.

So how do we make sure the refresh token cannot be stolen? We use our old friend I mentioned above: `httpOnly` cookies. This means that the browser's JavaScript cannot access it through `document.cookies` (though they're usually still accessible from the browser, so they can be compromised).

<span id="login-register"></span>

## Login/Register

Nuxt lets you set up API routes from your server. So my client can send a request to the Nuxt backend, which sends a request to the Phoenix backend. Let's look at some actual code, starting from the login route (note that the code blocks are all simplified):

Just to state something: you're not seeing all of the details, but I'm using Zod to validate the request/response shapes. I had a lot of overlapping code between login and refresh, so I made this helper function.

The important thing are the final few lines in this function: the `setRefreshCookie` and `setAuthToke`n. First off, I want to say I'm using axios in the server code because making requests from node is terrible. Its newly added fetch API has different parameters, namely you have to use a blob or a stream. And it's just much easier to use axios that handles those details for you.

I cribbed the sign and serialize functions from [https://github.com/damien-hl/nuxt3-auth-example](https://github.com/damien-hl/nuxt3-auth-example). I need serialize because I'm not just storing the refresh token but also the `rememberMe` value. It's used to indicate whether the user checked the "remember me" box on login. I will talk later about storing the remember me value with a longer expiration time versus just setting the expiration time to a shorter amount, once I've talked about how this cookie is used.

<span id="refresh-the-token"></span>

## Refreshing the Token

So let's do that. Every 28 minutes, we will request a new auth token. I guess I could wait 30 minutes, but I feel like 2 minutes is enough time for the backend to respond and set a new token. If you want to see, here's the very rote function:

And this is what the endpoint looks like:

So it just changes the cookie, changes the token stored on the client and sets itself to call the function again in 28 minutes.

## Silent Login

The more interesting part is how silent login happens. What I mean by silent login is that if the user has checked the "remember me" box, then I want the user to be automatically logged in when they start up the app. My solution was to use Nuxt middleware, which runs on the first route visited and also on every route change. The general idea we need to deal with three possible situations:

1.  The user is already logged in. Okay, nothing to do here if so.
2.  The user goes to a route that doesn't require auth. We should start the auto login process in the background if they have remember me enabled so they're logged in ASAP.
3.  The user goes to a route that requires auth. We should not let the user visit the next page until they are logged in. If they aren't remembered or auto login fails, they need to go to the explicit login page.

This function took me a long time to write because there were a bunch of foot guns that I had to learn through trial and error. This are commandments you must remember for Nuxt's SSR:

There is only one server. There are many clients.

Server middleware will run outside of a client request.

Nuxt allows you to use any composable from the server, including Pinia stores. However, modifying the state for a Pinia store on the server doesn't persist because, obviously, the server isn't connected to a specific client or a specific Pinia store. I was not too familiar with SSR, so I had to learn this the hard way: foot gun! I was originally using the server code to set the auth data in the Pinia store directly (because this data is returned from the refresh token interaction).

Then the next thing, as stated in the comment: we do not want the middleware running on the server because without a client request initiating, the server will apparently not change the cookie going to the client (because it isn't connecting with a specific client, I believe - though I may be misunderstanding the architecture). One thing to keep in mind is that the backend will delete any refresh token sent in to prevent it from being used again. So what happens is the refresh token gets consumed because the server is running the code, but it doesn't set a new cookie with a new refresh token. Therefore, when the client attempts to silently log in, it will always fail because the token in the cookie has already been used.

So, at last, here's the server code for silent login:

The code is very similar to the refresh endpoint, but it sets the auth data too. In the end, I wish I had known about these foot guns before I started (though they're obvious in retrospect, I just figured there was some magic going on to allow Pinia and setting cookies on the server side with no client interaction). Next post I will talk more about some SSR interactions I had to work around.
