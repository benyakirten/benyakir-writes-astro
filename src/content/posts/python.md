---
title: Python
slug: python
published: "2021-03-09"
legacy:
  wpId: 747
  postType: post
  sourceOrder: 114
categories:
  - Ben's Thoughts
tags:
  - programming
  - python
---

Now that we’re in the realm of programming languages, things are going to get quite a bit more technical. There isn’t too much to talk about if I don’t get into the fine details. There is little difference in the WHAT languages can do; it exists mostly in the HOW.

And so that’s what I’m going to talk about. Let me start by saying this: of all the things I studied, Python is by far the most friendly. It was made to be easy to read and almost understand if you know nothing about programming. It lets you basically do whatever you want. The major downside is that it’s less UI-focused than other languages and that it’s often inefficient. What it means, letting you do whatever, is hard to explain without getting into detail.

So I briefly talked about this before, but everything in a computer has to be an exchange of numbers. The most low level form of your computer is 8 on/off switches. Each switch is called a bit, and the 8 together is called a byte (a thousand a kilobyte, a million a megabyte, etc). I’m not going to talk about it too much more, especially because I don’t know that much. But my point is: everything a program does is just rearranging the ons and offs of those switch.

That last paragraph is talking about two things: data structures (the state of the switches, which are on and which are off) and actions on them (how you change which switches are on and off).

## DATA STRUCTURES

So let’s talk about the most universal data structures:

1.  Strings: any series of letters. An example: “Hi”
2.  Numbers: any series of numbers (there are many different subtypes, but I’ll get into that later. It doesn’t matter for Python). An example: 5
3.  Arrays/Lists (these aren’t the same thing, but they kinda work similarly): a series of strings or numbers - in some languages it must be of all strings or numbers. Not Python! These are catalogued according to their index. An example: \[5, 10, 15, 20, 25\]. What this means is that at the array at index 0 (counting starts from 0, didn’t you know?) equals 5, index 1 equals 10, etc.
4.  Objects/dictionaries: like an array (it’s even called an associative array in PHP) where you associate a ‘key’ with a ‘value’. In Python and JavaScript, an array is an object/dictionary with the keys being the indices. An example: {“Greeting”: “Hello”, “Farewell”: “Goodbye”}. What this means is that your dictionary at key “Greeting” will give you “Hello” and idem with “Farewell” and “Goodbye”.

What’s great about Python is that these all act somewhat similarly because everything runs on iterators. Well, that last sentence explained nothing! So let me explain: an iterator is breaking something down into iterations.

Is that clear now? Not at all, you say? I’ll give some examples.

An array is the easiest example of this. An array is iterated as its first value, then its second. So \[5, 10, 15, 20, 25\] is iterated through as 5, 10, 15, 20, 25. A string is iterated as each letter in phrase so “H”, “i" of above. A number can’t be iterated, but you can easily make it into a range, which is kinda like an array that goes up to that number. A dictionary can’t be iterated, but you can ask for the keys, values or both of them to be iterated.

Now what’s the advantage of this? Let’s say I want to see if something contains something else. For example, if I want to see if “you” is in a declaration. I can just literally say:

if “you” in declaration:

No braces, no parentheses. It almost reads like English. You can even add “is”.

if “you” is in declaration:

Now, I’m going to get a little more technical. Python is dynamically typed. What does that mean?

A brief aside: a variable in programming is basically a value that’s held onto to be used later. It does not necessarily vary like math. The idea is that if I have something 12 to the 4th power, then I store that value in a variable, then every time I need that value, I just call up that variable. It has two advantages: 1. It makes things easier to type (especially when you’re holding onto some pretty complex data), and 2. If you go back to your code after doing something else, you can figure out what everything is doing by looking at any line, especially if you follow some conventions.

Variables can be anything at any time. It doesn’t mean much except in contrast to other languages. So, for example, declaring some variables:

Python:

a = 5

C#:

int a = 5;

Now in a statically typed language (C#), you have to declare what type of information you’re worrying about. I’ll talk more about statically typed languages when I get to TypeScript/C#/Swift. But for now, note how in C# you have to know what type of number something is (an integer, a number with a floating point, etc.) because each of those things are only capable of some things. For example, you obviously can’t multiply two strings together like you can with two numbers, so C# is making sure you don’t do that by making you say that you’re dealing with two integers.

So then the question is why have a dynamic system if a static system makes sure you’re not doing some things that does make any sense or what you don’t want to do?

Python puts the responsibility on you to know what you’re doing besides being more concise. Statically typing is great for when you have to work with someone else’s system that you’re not very familiar with, but it can be ridiculous.

Let’s take an example from Swift. We have two probabilities (measured as between 0 and 1, such as .5 being equal to 50%). Let’s add them up then round the result up to 1.

You might think it’s so simple as:

round(probability1 + probability2)

But no. In Swift, if one of your numbers is a float (meaning it has a decimal) and one is a double (meaning it can potentially go to more decimal points than a float), then you have to convert them to both doubles because the round function expects two doubles. So if you have a probability of .2 as a float, you’ll have to convert it to .2 as a double. It literally is identical.

Then let’s say you want to want to add .5 to 1 then divide that by 2. What would you predict the outcome would be? .75, right? Well, guess what? It’s 1 because 1 plus .5 is 1. Let me explain that first. 1 is an integer so anything added to it that’s past the decimal point is effectively ignored. Then if 1 is divided by 2, it won’t be 0, so that’s basically 1.

So what you would need to do is make sure everything is a double before you do anything like that. If you can’t tell, I clearly prefer dynamic typing, at least when it comes to numbers. I got so used to integers to being able to freely change into floats and back.

Pretty much everything past this point is just the basics of programming and mostly true for every language. I’m not going to be saying anything specific about Python until I get to PyPi.

## REFERENCE VS VALUE TYPES

So there’s something I want to talk about briefly before we go on: reference vs value types. It is fairly abstract, but it’s something pretty important to programming. Variables will come in one of the two types. A value type is also known as known as a primitive in JavaScript and I think C#, which I think is a much more descriptive name. They’re basically information that is just something. It’s a number or a string or something.

An array on the other hand is a reference type because it is a way to point to basic information.

Why is this relevant? Value types cannot be changed except through directly changing it. Again, it’s something best defined through its opposite. Let’s say you have a dictionary greet = {“Greeting”: “Hello”}. So you’re saying that whenever you ask for the greeting you get hello. You make your life easier by saying

hello = greet\[“Greeting”\]

What this means is that hello is equal to the value of greet at the key “Greeting”, which is “Hello”. Then later on you decide to change your “Greeting” value to “Hi” because you can do that. Now your hello variable will equal “Hi”, because it’s a reference value. What you store in your variable isn’t the actual value “Hello” but a reference. Literally you’re making a reference to a position in your memory which stores “Hello” then “Hi”. To put it more simply, you’re saying your hello variable is equal to whatever the value of “Greeting” is, not “Hello”.

On the other hand, it’s real simple when dealing with value types. If you create a variable: five = 5 you can’t change the value of 5. That makes no sense. You can only change the value of five by, for example, saying five = 6.

## ACTION

If you notice, I haven’t talked about actions. I’ll give a brief summary, but there isn’t that much to say. I will give a brief summary. It comes in two or three varieties: control flow, functions and sometimes classes. 

Control flow is just a catch all term for a bunch of things, but most of the time it’s talking about conditional triggers like if statements (if this is the case then perform this action), switch statements (the same thing but more fancy) and loops. Loops come in two varieties: while loop and for loops. Their name basically describes what they do.

A while loop is you do something WHILE some condition is true. For loops come in two varieties: a counting for loop (not in Python) and an iterating for loop (which Python uses for everything). The former is it takes some number then does an operation for every time it goes through the loop a number of times that you specify. An iterating for loop is one that does an action on or for every item in a group.

How does one write such a thing in Python?

for word in sentence:

It almost makes sense just reading it out loud. You’ll hear that said a lot when people talk about Python.

## FUNCTION

A function is basically some part of code you want to be repeatable. So let’s say, you add 5 to a number then divide the sum by 2.  If you do it once, whatever. But if you do it twice, you put inside of a function then call that function whenever you need it.

A brief note: there are three main varieties of functions: void, impure and pure. A function can have a return value or not, if it gives a value back whenever it’s called. If it doesn’t, it’s called void. A pure function is one which doesn’t change any values outside of itself (its scope, if you know what that means). An impure function does. What exactly these means is fairly abstract and would require a good deal of explanations. But the short of it is: you should almost never make an impure function. A void function is rarely as useful as a returning function, but if you need it, it’s what you have to do.

## CLASS

You can make your own data structure too, called a type, besides the ones I listed above. You can’t make any value type. In C#/Swift, you can make a struct (which isn’t the same as a struct in C/C++), which is technically a value type, but it doesn’t really work exactly like one.

## PYPI

One of the (other) best things about Python is PyPi. It’s the Python equivalent of NPM. I actually made my own package you can check out here: [https://pypi.org/project/r2api/](https://pypi.org/project/r2api/)
