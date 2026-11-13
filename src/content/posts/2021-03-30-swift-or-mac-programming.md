---
title: Swift, or Mac Programming
slug: swift-or-mac-programming
published: "2021-03-30"
categories:
  - Ben's Thoughts
tags:
  - swift
  - mac
  - type system
---

I think this is the post that I’ve been most anticipating from the beginning (well, this or TypeScript). I think Swift is, surprisingly, one of the most intriguing things I’ve learned. I haven’t yet figured out if I like it or not. So let’s start with the fundamentals.

## What is Swift?

There’s some history with Steve Jobs, but I’m going to skip over it. Let’s just say at some point, Apple decided to use Objective-C. Which is a form of C, just like C++ and C#. I don’t know much about it, to be honest. I’ve read some of it, and it really looks like C/C++ to me.

Swift is the language Apple developed so people wouldn’t have to use Obj-C. As far as I understand it, it used to be a lot more like Objective C (or you had to rely on its functionality, which I’ll explain later), but the version I learned (Swift 5) has very little of it. You’ve noticed me mention Apple twice by now, and there’s a reason: Swift only works for Apple products: Macs, iPhones, iPads, Apple TV, Apple Watches. It isn’t the only thing that runs on 

How it’s written is somewhat similar to C# but a little more friendly. It’s strongly typed, to an absurd degree, in fact. There are some unique features that make it intriguing.

## Some Particularities

First off is error handling. This isn’t a topic that’s covered, but sometimes you want to do something that might work sometimes and at others might not. The easiest example of this is if I want to contact an outside API. What that means, for example, is if I want to write a program that will get movie ratings from a website (an example of a site that I’d want to use might be [https://omdbapi.com](https://omdbapi.com)). If I contact it, I have to provide some data such as what movies I want, what data I want, and a special passcode that they give me.  Let’s say I mess up and say I want movie itles instead of movie titles, or I write a B instead of a b in the passcode. The outside server would then respond with an error because it tried to do something it can’t.

In most languages you do this with a try-catch block. Swift has several different ways to do this. The most similar is a do-catch block with try statements inside, a let try or a guard let statement. Basically it’s just nicer formatting for something else. It’s just neat, not that it dramatically changes everything

The other thing that’s particularly of note is the fact that overloads aren’t hidden in the background or exceptions in Swift. They’re how things are done. In my C# example (if you remember it), overloads are basically to make the programmer’s life easier so they can use multiple types with one function but get basically the same result.

In Swift, overloads often do very different things depending on what parameters are provided. One example that comes to mind is there’s something called a table view. What they are will take a long time, so I’ll just say there’s a function called tableView. Yes, very obvious what it does.

Before I give examples, I’ll explain something real quick. Swift functions use inside and outside parameter names. It starts off as a neat feature, but it can be somewhat tedious. However, it makes functions look weird. Here are some simplified examples of them.

MIGRATION\_CODE\_BLOCK\_0

The “-> Int” in the end is the return type. The “n1 firstNumber: Int” means that when you’re calling the function, you provide the first name, and the function treats it with the second name. You’re calling the function you write something like:

MIGRATION\_CODE\_BLOCK\_1

Then inside of the function those same numbers are called n1 and n2. It’s not too complicated, but you do have to get used to it. This function is the equivalent of the C# function:

MIGRATION\_CODE\_BLOCK\_2

You can make it so they’re the same by just not writing the second name. Or you can make it so you don’t have to to use the parameter name at all by replacing with \_.

So now for an actual examples:

MIGRATION\_CODE\_BLOCK\_3

MIGRATION\_CODE\_BLOCK\_4

The way these overloads act is usually revealed by the name of the parameters. The first one will lay out how many rows will be in your table view. And the second function will decide what will be inside of each cell in each row. For example, using the index path you can decide which of two cells to render for a messaging app! In fact, that’s what the app is, though I’m not going to elaborate on it.

## So why use Swift?

So the main (or only) use case for Swift is Apple devices. The next question is: does it do that well? It’s the same thing as all Apple products. It’s pretty good if you want to use it in a way that they’ve considered. That said, I’m typing this on a Mac. I’ve used a Mac since my last year in college (almost a decade ago; I’m old), mostly because I don’t use my computer to do advanced things (mostly just writing things up and programming). It stays good for a long period of a time, unlike most of my PCs which usually slowed down after a few years. Maybe it was because of my mistreatment? I just don’t want to have to think about stuff, so I don’t.

## Why not use Swift?

You have to use a Mac to program with it. Yes, technically it’s possible on a windows computer or linux. But, especially because of the large amount of overloads to do just about everything, you want to use Xcode, which is the special Apple IDE to work with Swift. Also it will auto-generate a lot of code and make it ridiculously easy to work on the UI for your websites. If you work on an iPhone/iPad app, it will create a storyboard GUI that lets you easily connect buttons and UI with the code. It also knows all the overloads and will tell you about EVERY error, ALL the type checking, everything, such as when you have to have a do/catch block, etc.

## Package Management

So something that’s big to me is open source. That’s why I like PyPi/NPM so much and therefore Python and JavaScript. So what does Swift have? It didn’t have anything for a long time, so people made one. Cocoa Pods and Carthage, and other ones I don’t know. Recently Apple has made the Swift Package Manager.

But, as mentioned, Swift existed for a long time without it. Cocoa Pods and other third party package managers are kinda janky because the official way was designed to be the only way to do things. If you install with PyPi/NPM, you create a special library that has a special format for how it interacts with your project. With Cocoa Pods, you’re actually just copying the code and acting like it’s just a different part of your project. In the end, the two aren’t that different, but it just strikes me as odd.
