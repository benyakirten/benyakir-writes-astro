---
title: C# and Type Systems
slug: c-and-type-systems
published: "2021-03-26"
legacy:
  wpId: 830
  postType: post
  sourceOrder: 125
categories:
  - Ben's Thoughts
tags:
  - unity
  - C#
  - type system
  - type
---

I wanted to wait to talk about Swift and C# for one simple reason: the main differentiation between them and something like Python is the type system. And the compiler.

## Compilation

I’ll just get the compiler out of the way right away. This isn’t very much anything I learned but just grabbed bits and pieces of info off the internet, so caveat emptor. I’ll talk about what I’ve figured out.

Whenever you run a program, your computer has to take the instructions in the code and do something. A program is written in machine code ([Machine code](https://en.wikipedia.org/wiki/Machine_code)). I don’t know much bout this, but I think that on windows the commands are in CIL ([Common Intermediate Language](https://en.wikipedia.org/wiki/Common_Intermediate_Language)), and I think Macs use objective C. I think those aren’t exclusive, though, as in there’s a bunch of interpreters? I don’t really know, and I’m not going out of my way to find out.

The only reason that this is important is that everything I’ve talked about in the past doesn’t have Ahead-of-Time (AOT) compilation, but what I’m going to talk about does. What does that mean?

If you create a Python program, you just write the .py file, then you run that through the python interpreter, and then it does its job. With something like C#, you need to run the code you write in the .cs file through the compiler, then the compiler produces a .exe file that you can run on your computer at any time.

Just a quick note: file extensions (the dot then the last part of the word) mean nothing. You could have a file called program.exe or program.abcdef, and they do the exact same thing. You could even just name it program, with no file extension. They are a matter of convention and organizing things. Python files are by convention written in .py files so you can easily recognize what’s going to be inside of it. If you look (way back) at the g-f-benyakir code, you can see there’s a file called “Procfile” with no extension. That’s because of heroku, the place where I’m hosting the website.

Python has its compiler, even if it doesn’t run beforehand. Whenever you run a Python file, the Python interpreter, which does its thing. Again, I don’t know exactly how this works, nor do I particularly want to learn (here’s a site I found after googling “How does the Python interpreter work?”, [https://data-flair.training/blogs/python-interpreter/](https://data-flair.training/blogs/python-interpreter/). If you want to learn more, you can use my same methods). Anyway, same thing with JavaScript and PHP. The only reason I bring this up is that it’s in contrast to C# and Swift.

One thing to note is that precompiled languages take longer to work on/with because every time you want to see the effect of you changing a line of code, you have to recompile the program. In the modern day and age, usually it doesn’t take too long to compile things. Back 20 years ago (I’m an old man), when I was a kid, I remember programs taking a long time to compile. But I imagine that most compilers have caches that only look at what has changed and stuff like that. Again, not my concern.

So why would you precompile at all? Precompiled programs run faster, for one. The other is that, before the compiler makes the executable, it runs through it and makes sure there are no errors such as typos, misplaced semicolons or you trying to give a function a string when it expects an integer. So that last one leads to:

## Type Systems

Now let’s move onto types. I’ve previously mentioned that JavaScript and Python are dynamically typed (I’m also going to tell you that PHP is too). So I haven’t been too specific about what that means. Simply, it’s that you don’t have to declare what something is. An example:

MIGRATION\_CODE\_BLOCK\_0

MIGRATION\_CODE\_BLOCK\_1

What’s happening here? You’re creating a variable named X which has a numerical value of 5. In Python, you’re leaving it to the interpreter to figure out that X is an integer. In C#, you’re stating it explicitly.

One way to imagine it (another analogy): in Python you get a featureless plane where anything can happen. It’s up to you to make sure the grooves are there to guide it to its objective. In C#, you get grooves on your plane that only let the ball roll to some places.

What does that mean? If I write a function that adds two numbers together.

MIGRATION\_CODE\_BLOCK\_2

If I pass 1 and 2, I’ll get 3 back. If I pass “x” and 5, I’ll get an error. If I pass it “1” and “2”, I’ll get “12”. This has some advantages in that the function is flexible, but it has the big disadvantage in that it was obviously intended to work in one way, to add two numbers together, and it won’t outright fail in certain other cases. You could easily have it be a part of a larger program that starts acting strange, and you have no idea why that’s happening.

Now let’s do it in C#:

MIGRATION\_CODE\_BLOCK\_3

You’ll notice immediately that C# is way more verbose. You have to declare types for the function (really you’re declaring the type for what it returns) and what types each number is. One thing to note is that this will only work for integers because these are integers. What if you want to do it with floats like 1.5 or doubles? You need separate functions. The most common way of doing this is something called function overloading.

What that means is that we have multiple functions with the same name but with different parameters. For example:

MIGRATION\_CODE\_BLOCK\_4

You could go on for floats and so on and so forth. It can get really tedious, but there’s two ways around this: 1. If you’re programming for yourself or in a small group, it doesn’t really matter. You won’t be using a function in different ways so you’ll just write one function for the way you want to do it. 2. You can just use a double for almost every number type. Then if you need it to switch to an Integer, you just type cast it (type casting is when you force something to be a different type. An example is the third function above).

If you only do C#, you could think this isn’t important. It doesn’t come up that often in C# because most of the overloading you’ll need is built into the language in a way you won’t really notice unless you’re making a framework or library of your own. However, in Swift and TypeScript, this comes up often. Speaking of Swift and TypeScript, I’m not going to be talking about them much in this blog post.

One thing to note: In C# # (the languages have their own versions too, Python is 3.9 at the time I’m writing this article, PHP is 8, JavaScript is using ES2021 AKA ES12), there’s some JIT compilation allowing you to say “var x = 5”, but it’s just a slight sidestep. The type matters if it’s passed as a parameter to a function, and it can’t be used for a function’s return type. Also, you shouldn’t use var for primitive types, just for classes.

## Why use a type system?

So you might (rightfully) be thinking “oh, this is such a pain in the tuchus. Why would anyone ever use a type system? America is about FREEDOM!” There are several advantages. One is it allows your compiler to know what’s wrong immediately. There have been several times in JavaScript and Python where I want something to show “15” and I get “12345” instead. In that example, it’s usually pretty easy to figure out what the problem is, but it might actually be some intermediate step, and the problem gets hidden until it makes something else behave weirdly.

Second, it makes understanding what’s going on at a glance much easier. You can now see, immediately, that a function takes certain types of values and gives you back other types of values. In Python, you usually write a “docstring”, basically a series of comments/documentation that explains what you want.

For a more realistic example, I want to give you an example from something I’m working on. In this one part, I want to take two colors and a number of steps. I take the difference between the colors and make an intermediate color for each step. The colors are CSS hex colors, which is to say they are a 6 letters long prefixed by #, for example “#789abc”. Note that this is actually three colors, each taking up two letters and described by two hexadecimal characters. I’m not going to explain what that is, but just know it’s basically another way to write any number 0-255 but with two letters instead of three.

I first need to take the strings, separate the 6 letters from the #, then I separate the six characters into the three pairs, as in “#789abc” would become “78”, “9a” and “bc”.  Then I change the hex into a decimal (the normal 1-10 system). I do that for the beginning and the final colors for each of the three colors. Then I divide that difference by the amount of iterations. Here are the functions:

MIGRATION\_CODE\_BLOCK\_5

The first function works technically with any string, but it only makes sense if you give it a string like “#789abc”. The second function works with any object that has the properties r, g and b, but it only makes sense if the r g and b properties are give numbers between 0 and 255. The third function works with any numbers, but it only makes sense if they’re between 0 and 255. And so on and so forth. Every time there’s a parseInt or toString(16), the data is being transferred between an integer and a hex. It’s happening a lot, so you could say “why transfer back and forth so much?” The answer is that these functions will often depend on each other, but you might also want to be use them independently for other reasons. Hence the compartmentalization. Also, these functions aren’t optimized and could probably be improved, but that’s not the point.

Okay, so how would a type system improve this? How would it make everything explicit?

## Classes, structs, types, interfaces, etc.

Looking at the title, you may say “but classes! We already talked about those, and what do they have to do with anything? They just exist to facilitate certain things…”

If you didn’t get it with that last sentence, a class defines a structure to a data and what you can do with that data. So you can define an object with the keys r, g and b with values that are two letter strings whose values are 0-9 or a-e, or one that is just a string that’s like “789abc”. With a type system, you’d say that a function needs that, and that it’ll return an object with the keys r g b but whose values are integers.

So how exactly that would work with different languages differs. In TypeScript (future post), it would be a type or interface. In Swift and C# it would probably be a struct. It’s a lot of specifics for when you use each of these things and when you don’t. The only one that I will explain is structs vs classes in Swift, but that’ll come in the post about blog posts.

## But what about C#?

I haven’t talked C# much, specifically, before now. This part will be brief because, to be honest, I didn’t learn that much about C#. It is part of the .NET ecosystem, which means there’s a bunch of things that Microsoft offers. In fact, there’s Visual Studio, which is an IDE designed to work well with C stuff, including C#. Their version of NPM/PyPi is Nuget.

The biggest reasons to use C# are twofold: 1. There are a lot of Microsoft support for certain things. However, these tend to work mostly with windows and not Macs. 2. Unity.

As for 1, you can do most everything better with C++, which is something I didn’t study because I didn’t want to. I know from when I was a kid and learned a little bit that it’s anti-fun, anti-cool and anti-interesting. But it can do almost anything, and it’s very efficient and fast.

So, moving on, let’s talk about Unity because I feel like that’s the biggest use case for C#.

## Unity

Unity is both a rendering engine (for the user) and a development platform (for the programmer). What that means is that if you use Unity to make a game, you have everything you need. This contrasts with how things used to be, where these were usually different things.

The rendering engine is by far the biggest thing. For example, if a game wants to draw a cube, then a rendering engine says that, looking flat on, it will present a square to the viewer. Then if it turns a little, certain angles will be visible, and other things won’t. Which angles? Well, you need to think it through, depending on the angle of rotation. And that’s really a lot to ask from someone who doesn’t want to think about it. It’s a bunch of trigonometry, and you signed up to be a game developer, not a high school math teacher. With Unity, you become mostly insulated from that stuff (not entirely, but as much as you can be).

So when I was talking about frameworks, I said this: a framework limits what you can do but facilitates others. Unity is a framework which makes everything that you’d want to do with a game a lot easier, such as trajectories, physics (it does almost all of this for you), orienting items in 3d/2d space, preparing your game for multiple platforms and a whole lot more.

Something that’s less important but still very, very nice is the development platform. Basically, Unity is a special application that’s basically a combination of photoshop for games and a part for writing things in C#.

So, to be explicit, here are the main reasons you use Unity:

1.  All things made inside of Unity are made in the same way. And that tends to be fairly friendly once you figure out the system. There’s a special interface that combines a graphical user interface (so you can see what’s going on/facilitates certain operations) along with the code you write. That said, to do most things in Unity, you don’t need to know that much C#. To do it in a better way, more comprehensive and be able to do more complicated things if you want, yeah, you should.
2.  Nothing inside of Unity is that complex. By that I mean, if a character shoots a bullet (look at how American I am) and you want to see if it hits another character, then you only really need two things: the initial direction/velocity of the bullet and the position of the second character. Unity can do something called a raycast to detect if the bullet hits the character given these properties. 3. Unity runs on most everything, including cell phones. Something like 50% of all cell phone games use Unity, in fact. That’s at least what Unity claims, and who wouldn’t say something like that?
3.  You can easily get assets (for example the model of a character) very easily through the unity store. It’s better to make your own/hire someone to do it, but this can be a solution too, especially if you’re working on your own or in a small team.
4.  It can make your game ready for almost every platform you’ll want, from game consoles to computers.

If I were to ever make a game (maybe?), I would definitely do it in C# since I’m not interested in learning C++ for the unreal engine. And Unity makes things easy.
