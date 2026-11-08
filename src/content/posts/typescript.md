---
title: TypeScript
slug: typescript
published: "2021-04-19"
categories:
  - Ben's Thoughts
tags:
  - typescript
  - type system
  - python
---

I’m sorry for the hiatus, but my second born came, and we've been hecka busy. Now I have a little more time to do stuff, so I got around to writing this (I think two or three more posts after this, then we’ll be done). Back to the matter at hand: now that I’ve talked about type systems, I’m going to briefly talk about it for JavaScript: TypeScript. There aren’t too many new concepts, so why am I talking about it?

First off, I’m going to say this: Typescript is awesome. It takes a lot of good concepts from different languages and add them to JavaScript. It’s a thing that happens with every programming language (C#, Swift, JavaScript and Python themselves have accrued tons of them over time, such as switch statements being added to Python just recently). Someone comes up with a cool, unique idea, and every other language makes sure they have it too; it benefits the programmer (and sometimes the user). 

How does Typescript Work?

If you remember way back, I said that browsers only recognize three things: HTML, CSS and JavaScript. So, much like SCSS, you have to transpire your TypeScript into JavaScript.

One of the biggest use cases (but definitely not the only) for TypeScript is Angular. And I’m going to get into it, but first, I need to talk about something that TypeScript enables. You could do it with regular JavaScript, but it’s especially common in TypeScript: the decorator.

The Decorator

Okay, to explain what it is, we have to start at what a function is. It takes a parameter, does something to it, does something based on its values, and/or returns a value. What if the parameter is a function. This is what’s known as a higher order function. A really silly example that will never, ever be relevant:

MIGRATION\_CODE\_BLOCK\_0

The function that’s called into the parameters is called itself. That’s what makes this a higher-order function. So you’re saying, why would you ever want something like this? Remember the purpose of frameworks: they streamline something and make something easier in exchange for you having constraints. A decorator streamlines a large amount of something, usually.

For example, Flask, the Python library that lets you set up a server without having to configure all these protocols and stuff, uses decorators heavily. So, let’s say, I want to set up a page that just says “Hello” in Flask if you visit my webpage. Here’s how I would do it in Flask:

MIGRATION\_CODE\_BLOCK\_1

Without the decorator (just the function and the return call), this function does virtually nothing. But the decorator activates it to be the page when you visit a website. In contrast, here’s how would do it with Express, a JavaScript library that doesn’t use decorators.

MIGRATION\_CODE\_BLOCK\_2

Like the Flask version, you’ll notice that this is defining a route for a  GET request (basically when you just visit a website) for a website at just the web address (“[mywesbsite.com](http://mywesbsite.com)”, etc). These two versions do very similar things. They’re defining functions on the app object that work as HOFs. The first one just uses a decorator. It’s taking the function home and doing some mysterious things to it. The second example, instead, has a very similar function passed as a parameter, which is basically what the decorator is doing. If you want to know more details about how decorators work, I’ll talk about callbacks\* and closures\*\*.

With decorators, you could basically rewrite the second example into the first. So if you’re writing a framework or library, you can provide a certain functionality that saves a bunch of time, with the limitation that you can only declare routes in this way. The upside is that it’s by far the most sensible way to create a route. Just to note: Both Flask and Express allow a lot of configuration, so it’s not exactly like you’re doing it one way or the highway.

A NOTE

Okay, one other thing before I go into Angular. There are a lot of things that aren’t built on TypeScript, such as Express, Vue and React. But you can still use TypeScript with them. To do so, all you have to do is define some type files that specifies, basically, what TypeScript will see and the types it will check.

Type systems basically set it so you won’t try to pass a Route type object into a function that’s expecting a Router object. Except it’s more obvious, but the effect is this: working with someone else’s library/framework (especially one without great documentation) becomes much more consistent. You aren’t going to get sudden failures showing up out of nowhere. You’ll often find out where exactly you messed up. Sometimes errors can be weird, or some things may act really weird for what seems to be no reason.

One of the best uses for this is a combination with a linter. What it means is that, instead of finding out you messed up as you transpile the TypeScript, it goes through your code as you type. You no longer spend an hour banging your head on your keyboard as you wonder what’s wrong, which is something that happened to me multiple times as I was learning JavaScript.

ANGULAR

Finally, time to get to Angular. Being a SPA, it works effectively the same as the others. It is made up of components, and each of those have three parts: CSS/SCSS/whatever, HTML and TypeScript.

The TypeScript part of each Angular component is divided into several types, each of which is defined by a decorator. Here are some of them:

MIGRATION\_CODE\_BLOCK\_3

There are more of them, I’m pretty sure, but I don’t remember them, and I’m not willing to invest too much effort into it (I’m not working on an Angular project as of this moment, and I’m lazy).

Anyway, each of these have certain parts that are passed to it. A component gets what I talked about above. A module gathers up various components and other settings (including possibly other modules) into a block, including the routing and stuff. A project only necessarily requires one module, but you can compartmentalize things this way. And that’s good for organizing things, basically helping you write (physically or mentally) a tree for your website. Also it lets you break up the loading of a website into smaller parts, instead of just front-loading all the JavaScript as a SPA does by nature.

For example, there’s a project I’m working, not that big, where each page is loaded as you navigate to it, decreasing the initial load of your webpage. It’s a Vue project, but same idea!

Anyway, a directive is, as simply as it seems. If you want to systematically do something, such as make all items with this directive change their color or something or when they get moused over, then a directive is what you go for. You apply the directive to a part of a component. These are also, I believe used for guards. Such as needing to be logged in before you can go to the account settings page.

An injectable is a service. You can make little stores which can do anything, or whatnot. They’re basically little helpers that work in the background. They’re very useful, but they’re not complicated in their uses, so I’m not going to talk too much about them.

BACK TO COMPONENTS (BRIEFLY)

If you remember from a long time ago when I first mentioned SPAs, I talked about the store and router. So, let’s say that you’re trying to actually use them. In React, you rely on higher order components. They’re basically the same as higher order functions but for a SPA component. In Vue, you set up the router/store as parts of the overall application, then special properties become available in all components. In Angular, your component explicitly declares what things it will need inside of the constructor (everything is a class-based component). If you didn’t know this about it, all classes are basically “booted up” through a constructor function. It’s fairly structured and explicit, like all of TypeScript. 

I would talk more about it, but it just gets more technical from here. So I’m going to stop, but I just want to say the main benefits and disadvantages of Angular:

Advantages:

1.  Great for teams with being built on TypeScript and redundancy
2.  Explicit about what everything does

Disadvantages:

1.  The code can feel very boilerplate and repetitive and at the same time overly complicated/long.
2.  The components can be quite ‘chunky’ in comparison with Vue/React.

ASTERISKY

\*Callbacks are a humongous part of JavaScript and aren’t so in other languages, so I think they need to be addressed. They are called many things, like lambda functions in Python and C# or closures in Swift. Okay, yes, there are differences, but whatever.

A callback is a function that’s called as a part of another function, usually at its end. So for example, a forEach function. As its name implies, it does something for each element of something. That something is an array. I’ll go through several iterations of the function and make it simpler.

For all of the examples, we start with the following, stupid array:

MIGRATION\_CODE\_BLOCK\_4

Now here’s our callback:

MIGRATION\_CODE\_BLOCK\_5

forEach call:

MIGRATION\_CODE\_BLOCK\_6

What’s happening here? array1 will call this function for each item in the array, and not only that, but it passes that item to the function as a parameter. 

Now let’s make it a bit shorter.

MIGRATION\_CODE\_BLOCK\_7

This is called an anonymous function, and it works just like the other one, just that it will never be called again, so why bother naming it? Anonymous callbacks in JavaScript are so common that there’s even an easier syntax called arrow functions.

Let’s rewrite this as an arrow function.

MIGRATION\_CODE\_BLOCK\_8

There are some complexities with arrow functions, but that doesn’t really matter for this context. If you want to talk about them, write me. But the point is it’s fairly short, and it’s extremely common.

Now, a fairly simple question is: “why have this callback function instead of just having another function to handle it?” Something similar in Python that doesn’t use callbacks might look like the following:

MIGRATION\_CODE\_BLOCK\_9

The thing is you’ll get basically identical results. They’re just different ways of doing things. One is not necessarily better than the other, just different systems of doing things. I like the JavaScript way because it lets you carry out an operation with the information instead of having to put that somewhere else.

One way to contrast this is a map function. A map function is basically like a forEach, but it returns a value. A forEach loop instead doesn’t return anything. I can imagine you saying “but what if I just put a return in my log function?” Well, it won’t do anything. It won’t return the value.

What’s this good for? If you want to manipulate the data in some way but have it come up as a different array. It’s good for if you want to pass off the information in some way. It’s especially useful if you want pure functions. Let’s say I wanted to take an array \[1, 2, 3, 4\] and return each item but plus 1?

How would you do this in JavaScript and Python?

JavaScript:

MIGRATION\_CODE\_BLOCK\_10

Python:

MIGRATION\_CODE\_BLOCK\_11

Or a much simpler way:

MIGRATION\_CODE\_BLOCK\_12

What’s happening in the simpler Python example is a what’s called a list comprehension. It’s basically a replacement for callbacks for arrays (or lists in Python). It works very similar to an arrow function, and the syntax is similar. However, it tends to be less comprehensible in a more complex list comprehension, such as the arbitrarily complex:

MIGRATION\_CODE\_BLOCK\_13

Never mind me not knowing me why in the world you’d use that function, Python’s whole point is that it’s supposed to be easy to read, and unfortunately that isn’t. That said, an equally complex JavaScript array function isn’t that much more complicated. This, by the way, is how you’d write it:

MIGRATION\_CODE\_BLOCK\_14

\*\*Closures are complicated, but they’re the written out form of decorators. They’re functions inside of functions that are returned from the outside function. Rather than writing out a long explanation, I’ll just give you the article I initially learned them from: [https://realpython.com/primer-on-python-decorators/](https://realpython.com/primer-on-python-decorators/)

It’s really long, and I suggest you only read it if you’re REALLY curious or want to learn about decorators.
