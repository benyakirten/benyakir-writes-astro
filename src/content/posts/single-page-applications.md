---
title: Single Page Applications
slug: single-page-applications
published: "2021-03-22"
categories:
  - Ben's Thoughts
tags:
  - react
  - vue
  - spa
  - single-page-application
  - angular
---

## The Basics

From this point going forward, the blog posts are going to get long and technical. Yes, they’ve been that way for awhile, but this is more so than they were before.

Okay, if that hasn’t scared you away, I’ll get on with things. I hope that by now you’ve kinda got the idea of how a webpage works because it’s what you need to know for SPAs. Here’s a quick refresher that’s relevant to what we’re going to talk about:

1.  (User) You type an address into your address bar and hit enter.
2.  (User) Your ISP sends a request to the address.
3.  (Backend) The server at the address thinks about what it wants to show you.
4.  (Frontend) The server sends back a mixture of HTML, CSS and JavaScript.
5.  (User) Your browser interprets it.

The same thing occurs if you click a link. It’s just that step 1 is done by your computer. If you submit a form or login to a website, your browser does the same thing but in a slightly different way. It just means you’re sending information along with your request in step 2 that the backend interprets.

You can tell whenever this process goes on because if you look towards the top bar of your browser, and the refresh button becomes an X while this process is ongoing then switches back when it’s done (the refresh is usually a line that loops back in on itself). Also there’ll usually be a blue bar that goes across the top bar somewhere as this process is happening.

Where do SPAs (Single Page Applications) come in here? Instead of breaking a website into a bunch of pages that you request then load many times (causing information to go back and forth) as you click links or menu items, you load the ONE page that makes up everything you’ll see, hence the name. So instead of step 4, what happens is that the backend sends back a tiny amount of HTML, some CSS, and a bunch of JavaScript. The JavaScript usually contains everything else the webpage will need.

Why this way? Because JavaScript can create HTML as needed. For an example of this, any website that you buy stuff from online. If there’s a dropdown that shows you a small, symbolic representation of your shopping cart, when you click on that, what’s happening is that JavaScript is creating HTML elements and attaching them to some host element. Or when you’re on Facebook and sending messages to people. The chatbox is some element, and every message is something that’s attached to the host element. JavaScript can also handle all styling of an element. This isn’t to say that it does all the time, but it can. For an example of that, go to one of the books on my webpage and click on the cover. The popup showing up is controlled by JavaScript because I tell some elements (that I’ve already written) to appear and be a certain size.

## Why Use a SPA?

Whenever a programmer anywhere makes anything at all, the number two question is how to make something run good and fast. This is called performance. If, for example, you look at the Reddit webpage, you’ll find your browser often hiccuping for a second or two as you go around and click on different posts. It isn’t a matter of animations, just your browser putting everything on hold as it works things out (funny enough, Reddit is a SPA, but I’ll get to that later).

Brief aside: there is no excuse for why the Reddit website runs so badly. It’s not loading anything in that’s too complex. I saw some article or post that said the main reason for why it runs bad is because it’s loading in a buttload of ads. That’s almost always the reason why a website runs slowly.

Back in the day (I’m thinking 56k days), one of the slowest thing about webpages was loading in each one because it took a long time for your ISP to get the information back and forth, the latency as is called, was a big reason. Things have improved, but when I’m browsing a website I want things to run fast.

You always want to minimize the choke points of your program. SPAs help deal with this because a big choke point is how long it takes the backend to respond to something and send it back. Then your ISP’s datacenter can be really slow too. For example, on this blog, every time you click between blog posts and articles, it can take me anywhere between 1 and 10 seconds for any page to load. But with an SPA a user initially loads all the webpage, then you don’t have to talk to the backend again (okay, exceptions, but that comes later). No back and forth. It’s a bigger initial load, but everything after that won’t have to cross the internet.

## Vue, React and Angular

efore we get into examples, there are three main frameworks for SPAs: React, Vue and Angular. React is made by Facebook and probably the most famous of the three. Angular is made by Google, and it uses TypeScript (which I’ll go into at in a later blog post). Vue is open source so naturally it’s my favorite. It also is the closest to regular JavaScript.

Just a note: anything at all that’s ever used on the frontend is completely open, just like anything made in Python. You can read the code that goes into it, no problem. Open source in this context doesn’t mean “you can’t see what’s going on”. Anyone in the world can just download a copy of React and make their modifications in the base code. What it means in this context is that there’s a paid team of professionals writing and updating the code. It’s their whole job, and they’re really good at it.

That said, you can download a copy of any of those then write something that builds on top of it. In fact, there’s a ton of things that do that, at least for Vue and React.

Yes, that does mean that React and Angular don’t use regular JavaScript. React uses something called JSX, which is transpiled (it happens a lot in web stuff because the base stuff is required, but it can be fairly clunky) to JavaScript. JSX is basically JavaScript, except it allows you to write HTML pretty easily in your JavaScript. An example will help.

## Some JSX

React works by attaching a React component to your HTML. I talked about how most of a SPA isn’t HTML, but each React component contains HTML. If you don’t use JSX, it gets really tedious really fast. I’ll show you a brief example.

Here’s what you’d write in JSX:

MIGRATION\_CODE\_BLOCK\_0

Here’s what it gets transpiled to in JavaScript:

MIGRATION\_CODE\_BLOCK\_1

Yeah, you have a React element nested inside of another one. And it looks nothing like what the webpage will look like. For me, that first example says very specifically what you’re trying to go for. The second one is something I can parse, but it's hard to imagine what it'll look like (especially if you add styling and the dozens if not hundreds of nested elements that a normal webpage will look contain).

Now that I’ve talked about Vue and React, you might expect me to talk about Angular. But I’m not going to talk until I write a blog post about TypeScript, which will be towards the end of my blog posts because I’ll need to talk about type systems, and that'll be easier to introduce with C# and Swift.

## Model Systems

This is a topic that could have come up a long time ago, but I’ve been putting it off because it’s fairly abstract. It’s not about anything you, the user, will ever see, but rather it’s how things are designed and organized for the programmer.

If you look at the code on my website or HTML in general, you’ll see an abrupt and often nonsensical separation of what things do (for the programmer, not the user). In designing a website, you have three distinct areas: the HTML, the CSS and the JS. Let’s say I have a login screen with a form for username and password then a button. At the top of the page I have a nav bar, and if I hover over the elements a little menu appears.

The CSS for the nav bar and the login form sit right by each other, usually in the same file (almost always), idem JavaScript for the nav bar and the login. What if, instead, you had all the JavaScript and CSS and HTML for the form all together? Then you’d say “I want a login form here”, and you’d get a login form with all its bells and whistles. Then you say “nav bar goes up top”, and then everything with the nav bar is just there.

That’s component-based architecture, and it’s how you design things in Angular, Vue and React. React encourages you to do this as granular as it gets, Vue less so though you can, and Angular is better for page or chunky sized components.

I’ll try to explain this way: In Angular, you’d have one component for your nav bar and one for your form. In React, your login form might be made of two LoginInput components (everything is necessarily PascalCase with JSX) and a FormInput component, which is all nested inside of a LoginForm component. And the LoginInput form has a FormLabel component as well as a FormEntry (I’m bad at naming things off the cuff) component, which is the bar you type into. Then everything the FormLabel looks like is inside the FormLabel Component, then the FormInput component decides where the FormLabel will be in relationship to the FormEntry, etc. How granular you get is up to you, but it’s usually quite good to make components small for two reasons: 1. it lets you modify the one specific thing you’re looking at and 2. it lets you reuse components (for example if you want the whole form for something else or just the label). Oh yeah, Vue. It’s somewhere between the two.

To clarify something, the main philosophy of React and Vue's design is something called unidirectional data flow. That sounds like something way more complicated than it is. What it actually means is that you have what basically amounts to "the brain", and all information goes to it. It processes the information gives each of the other components the little bit of data they need, then they figure out what they need to do with this information.

One thing to note is that the brain is itself a component, not a separate part. One brain might just be the whole form element that contains all of the pieces of the form. One logical thing to note is that you can have multiple brains, and each governs their own little fiefdom. However, just like with medieval kingdoms, there is an established hierarchy and corporate culture, there will usually be one king brain that governs all others.

## MVC Design

If you have heard of MVC design, this is very similar though a bit different. If you haven't, MVC means "Model View Controller". What it means is that there is a view, that'll be the webpage, what the user ultimately sees. It doesn't make any decisions, but like some bacterium, it responds to stimuli (again, as with everything biological, it's a bad analogy because an bacteria is much more complicated than anything I will ever program). Then there's the Model, which is the thinking part. The controller handles the back and forth between these two parts. To illustrate what I'm talking about, an example:

Let's say I sell things off my website. What the user sees is the view, a form that asks three things: the customer's name, a product to select and how many to buy. When user submit the form, the view doesn't understand at all but hands it off to the controller. So, for example, the controller is given the data "Bob, box, 2". Then the controller will pass it to the model, which gives me this back:

MIGRATION\_CODE\_BLOCK\_2

The controller will take this information then decide how to handle this information. For example, it might take that and put it in a database of customer transactions. Let's say that there's a ticker on the view that mentions how many boxes are left in the warehouse to buy. Then the controller will find out that information and then update the view. This is called bi-directional data flow.

MVC Is the basis of Angular's design, in contrast with React's component design. To be honest, I didn't learn AngularJS, which is the original version of Angular (it predates React and Vue). It supposedly leaned harder into MVC design. I learned Angular 2+, which learned from React and changed its architecture to be closer to that, though it's

The main thing to notice is that you don't have the brain components to decide things. All of the data is handled inside of each component, then if necessary it will hand off the information to other components. As always, Vue is somewhere in the middle.

## Routing

The next (or a) thought would be about routing. What that means is if you go to to, for example [benyakiredits.com](http://benyakiredits.com), you expect to get a different page than [benyakiredits.com/about-me](http://benyakiredits.com/about-me). So you may think, ‘well, if everything is coming on one file, it shouldn’t go to any other pages. That’s the point, right?’

Right and wrong. Everything is coming on file, that’s right. But that one file can pretend it isn’t just one webpage. So, if for example, my blog were an SPA, it could have a [benyakiredits.com](http://benyakiredits.com) and a [benyakiredits.com/about-me](http://benyakiredits.com/about-me), and they could act like this was a normal website. It’s done through something called the router.

If you go to the website [angular.io](http://angular.io) and look at the address bar as you move around, you can see the website looks like it isn’t. Another example to check out is [https://aleteia.org](https://aleteia.org). Note: I’m just using that website as an example, the first I found for an example of frontity. Moving on, one thing that you’ll notice, going around to different parts of the site, is how fast it is. That’s because it doesn’t have to go back and forth across the internet to get the information. Now you can hopefully see that, even with our super fast modern internet, that doing slows things down a lot. That’s not the only reason. Vue, React and Angular all are really tightly built so they run a lot faster than normal websites.

One thing you’ll notice on the aleteia website is that it often loads things after you click on a link inside of the frame of the website. That’s because it’s getting its information from a database and so has to communicate across the internet. That’s the bottleneck of the website, and there’s not much they can do about it because the database they’re getting their information from is a WordPress installation.

An aside: I want to say one aside: I don’t like SPAs that use a lot of requests (accessing databases/sending requests to other websites/parts of itself). It loses one of the advantages of being an SPA in the first place. That said, often a website will use an SPA not for the person visiting the website but for other reasons that seem reasonably inscrutable unless you’re the one making the decision.

So why would you want to use a router? It almost seems like something we're imitating because it's part of how things USED to work, and what worked in the past doesn't have to dictate what we do in the future. Well, it comes down to two reasons.

1.  If it's what people are used to, they got used to it for a reason.
2.  And that main reason is being able to navigate to a sub-page from outside of that webpage. What I mean is if you want to go to the about me page on this website, you could go to [benyakiredits.com/about-me](https://benyakiredits.com/about-me). You couldn't do that in an SPA unless you had a router. What if you wanted to show your friend the about page? You wouldn't want to have to tell them "go to this website, click on this thing". Instead, you want to give them a singular address.

One thing that's fun is that you can easily create page transitions. What that means is that if you click on a link that goes to another page, you can animate it. One thing you might do is it makes the old page scroll away and the new one scroll in. One way it can be used is that the webpage that contains a lot of text (for example, programming documentation) can pretend you're just scrolling down one really long web page whenever you change topics. No, I don't have an example on hand. I've seen examples of this before, but I can't find it again right now.

## The Store

Besides the whole not sending information across the internet, the most unique aspect of an SPA is the store. To illustrate what that actually is, imagine this situation: you are shopping on a website. You decide to put something into your shopping cart, and then you hit checkout. That directs you to the webpage/checkout url.

So how that works on a normal website (for example Amazon): every time you add an item to your cart, it’s sending a message to a database (this would probably be a Redis database, which is specifically designed for small or temporary, quickly-changing data), then that database sends back a message that either the item got saved correctly or didn’t. It’s two messages that go and forth across the internet, even though no one needs to really confirm this data or for it to be anywhere but on your computer.

Note: yeah, you can use a cookie or local storage for this, but you really shouldn’t. Those aren’t meant to store potentially thousands of pieces of information.

The reason that this happens is that no JavaScript can share information between two webpages. If I have a button on my website that increments a counter by 1 every time you hit it, then when you go to any other page on my website, it cannot have access to that number unless it’s somehow persisted. As I said before, if it’s anything that a few yes/no switches, then you’ll be using a database to do that.

If that isn’t raising an ah-hah in you, let me remind you: all of your website and its various addresses on an SPA are actually just one page. It can share this information between pages because they’re actually the same page even if they pretend to not be. A store is basically one large JavaScript object that keeps track of information so long as you’re still on the webpage.

What does that last sentence mean? If you close your browser, then open it again, you'll have the same problems with persistence as other pages. It won’t remember anything you do across multiple instances of the webpage running and so will need to use cookies/local storage/databases just like any other website. But if you don't close the webpage, a database won't necessarily have to be used between the browsing page and the checkout (unless you want to check how many items are left in your warehouse before letting a customer add something to their cart, which can be done on the checkout page anyway, though it may be suboptimal).

## Frameworks vs. Libraries

I didn’t give you an example of Vue. It’s for a good reason, and that’s that it looks complicated unless you are used to it. Let’s talk about something that applies to Angular too: Vue is a framework.

If you remember back to me talking about WordPress, I talked about Frameworks, which you may take to mean “do it my way or the highway”, but that’s not it. WordPress is a highly opinionated framework, and that’s the keyword. That’s the ‘my way or the highway’ part of it. A framework just means that it’s mostly a closed system.

Okay, do you remember back to PyPI and NPM? The idea is that you create something, and anyone can incorporate it into their project.

You can’t do that in a framework. Something has to be created specifically to work in a framework. And some frameworks don’t allow you to incorporate anything at all.

A library, on the other hand, is supposed to just add to a larger project instead of having everything be a part of it. So that means that a library is superior to a framework, right? A library gives you more freedom. As ever, when I ask a question like that, the answer is that it’s not that simple.

Vue and Angular are definitely frameworks. React, however, is supposedly a library. And it is significantly more freeform than the other two, but on the other hand, it’s not really just open to you just using regular JavaScript. You don’t directly interact with the DOM. Instead you do it through the way that React does. And for a good reason. They are complicated and much more efficient at their job than your simpleminded JavaScript (I could explain a bit of it, but to explain the basics would be longer than everything I’ve written so far).

## Other, Highly-Opinionated Frameworks

One of the last things I want to talk about is two highly opinionated frameworks that are based off of React and Vue. GatsbyJS is the first one, and it’s based on React.

Before I go on, I want to make something clear if it wasn’t: SPAs are frontend only. They don’t handle databases or any of the logic to save information/send emails/etc. A SPA, like all JavaScript, can send information to a backend that will do those things.

GatsbyJS is both a frontend and a backend. It interacts with an onboard database using GraphQL. I’m not going to go into depth, but GraphQL effectively takes over handling of a database and acts a middleman that both standardizes things and makes it easier. That said, there’s a very specific syntax you have to learn.

And now what I don’t like about both GatsbyJS and Nuxt. You have to name files very specific things, put them in certain folders, and I really don’t like how much it restricts your freedom.

So you may be saying, “but wait, that sounds like WordPress, and you loved that!” Here’s the thing: PHP is boring, a pain to work with, and it’s a backend language. JavaScript is a frontend language, fun to work with, and easily capable of a bunch of creative, awesome things. Especially Vue and React, they’re both capable of so much and because of your freedom.

## Static vs. Dynamic

So why would you ever use GatsbyJS and Nuxt, you may be asking. For a lot of good reasons. Besides giving a standard way of writing everything. It’s very useful when you’re working on a team. That way there isn’t a million ways to do anything, just one which makes for a lot of consistency. That also makes working with GraphQL great.

But then there’s the best reason: SEO. If you don’t know what that is, a lot of time and effort has gone into making your webpage the first one that shows up when someone googles the right phrase. There are a lot of competing websites, and businesses want theirs to be the one visited because most people won’t look beyond the first 1-3 results for any google search and rarely look beyond one page.

How do these frameworks help with SEO? The Google crawler. This is a robot that effectively looks at every page, and it takes that information to rank the page according to its results. For example, it’s very important for every webpage to have a <h1> tag, because the crawler will use that (partially, along with a bunch of other things) to decide your ranking.

Because an SPA is light on the HTML, the crawler doesn’t see it. It’s what’s called dynamic, as in it’s loaded in afterward. The crawler doesn’t care about that. Nuxt and GatsbyJS create static pages, which is, as the name implies, a fixed page that doesn’t load in from the JavaScript and so can be crawled.

Now you may be saying “but Angular is made by Google! Why would they make their own SPA framework if it’s treated badly by its own crawler?” Two things: 1. Google’s left hand doesn’t know what its right hand is doing and 2. There’s a version of static page generation inside of Angular. It’s not the default, but it’s fairly easy to setup. All you have to do is enable a few options, rather than writing your pages in a very specific way like Nuxt/GatsbyJS has you do.

## Conclusion

I know my complaints were quite brief, but I think that understates my disapproval. On the first post of this blog series, I talked about how much I valued creativity and expression inside of programming. I realize that there is a very large applied side to programming. In fact, that’s basically all of it. But I want to be able to be creative. Things like SQL and Nuxt and GatsbyJS are all about being practical first, which is a fine for that reason. But I want, dearly, for programming to live up to its potential for self expression and as a reflection of human nature.

SPAs are amazing, and I probably wouldn’t have gone into web programming over other programming if it weren’t for them.
