---
title: JavaScript
slug: javascript
published: "2021-03-05"
legacy:
  wpId: 743
  postType: post
  sourceOrder: 118
categories:
  - Ben's Thoughts
tags:
  - programming
  - javascript
---

Now that we’ve moved onto a programming language, there is either a lot to say or a little. A programming language is a way to break down everything into a number and organize those numbers in some way. That’s a super abstract way to put things, but everything you do in programming is abstract. HTML and CSS hid that from you. But as you go deeper, the truth comes out.

So, before I talk about that stuff, I’ll go with the short version of what JavaScript does: it’s what decides the logic of when you’re visiting a website (and potentially more). Everything else I write below is the long explanation.

## Intro

We’ll visit the same website so I can give you basic examples of how I use JS (note: I didn’t use it too much, so I won’t be able to go into too much depth with my site. I’ll use other examples). One of the most common uses is something called DOM manipulation. It’s a fancy word to say that you can change the HTML and CSS of your webpage on the fly.

I want you to do something. On the front page, there are two elements I want you to keep an eye on. One is the box that says “Insert a URL” (the text input), and the other is the dropdown menu (the select input).

Then, one at a time, paste these URLs into the box while keeping an eye on the select element (go from top to bottom):

[https://www.fattoincasadabenedetta.it/ricetta/pasta-al-forno-con-broccoli-e-ricotta/](https://www.fattoincasadabenedetta.it/ricetta/pasta-al-forno-con-broccoli-e-ricotta/)

[https://ricette.giallozafferano.it/Sformato-di-riso-in-padella.html](https://ricette.giallozafferano.it/Sformato-di-riso-in-padella.html)

[https://blog.giallozafferano.it/primipiattiricette/tortellini-panna-prosciutto/](https://blog.giallozafferano.it/primipiattiricette/tortellini-panna-prosciutto/)

If you’re doing it right (that’s right, if it isn’t working, it’s your fault, not my bad instructions), then the dropdown menu will change on its own.

Next, click the slider bars. The text underneath them changes. Then, when one of them is down, reload the page (control/command + r). It’s the same as what you left it as.

Also, when you reload the page then type something, it shows up the box without you needing to click on it. This can be done in HTML or JavaScript, but I use JavaScript here.

These are all examples of DOM manipulation. Whenever you write anything into the element boxes, the JavaScript looks for a series of letters (called a string of text or just string) and changes the other element based on it. Then the slider bars. Whenever they’re changed, they put something in what’s called ‘local storage’, which is how my webpage remembers you. If you know anything about cookies, it’s kinda like a cookie but different. For a highly technical answer (that I don’t suggest you read): [https://stackoverflow.com/questions/3220660/local-storage-vs-cookies](https://stackoverflow.com/questions/3220660/local-storage-vs-cookies)

## More frontend stuff:

Besides DOM manipulation (which you can do many more complicated things with), you can also do a bunch of logic things. Why exactly these are important is a bit more abstract and technical, so I’ll give you examples instead:

Let’s say I like cooking. I go to recipe blogs and try the recipes out. But every time I go to a website, a million ads show up, takes forever to load, and you have to look very specifically to figure out what’s going on. I’ll tell you what’s going on: for the former problems: the blogger has to buy bread somehow, and anyone who creates something for you to consume has to worsen the consumers’ life in order to do so (thank you capitalism and marketing). For the latter: they’re human and think they can organize things better. That’s like me writing this blog post. There are a million places online you can learn about programming, but I have the arrogance to think I have something to contribute.

Anyway… you just want your recipes. Now, you find yourself doing the same thing for a lot of recipe sites: where to look, where to get information. So you say to yourself: a computer is good at doing the boring repetitive stuff, right?

And that is exactly right! If you ever find yourself following a pattern, that’s the number one use case of programming. Think of it like this: you went to school and learned how to read a recipe. With programming you are effectively the teacher. You tell the computer how to do things once, then it will do that one thing as many times as you ask. As with every comparison involving humans, humans are much more complicated. I want to reinforce that again.

You take your favorite recipe blog and say “can I just have the ingredients and put them in a list every time I go shopping?” There are two main ways of doing this: machine learning and not. I’ll talk about machine learning very late in these blog posts, so let’s just go with the not way for now.

You look at the webpage (you can do that at any time — a web browser always tells you what it’s processing to show you what it is, though if you’re using Safari, you have to enable it under developer tools) and find that all the ingredients are under a list with a class of “ingredients-list” (yes, it’s that easy sometimes). Then you discover that each ingredient is separated into three parts so it says: “3 tablespoons of butter”. So you say to your computer “go to this webpage, look for the list, then separate each item in it into three parts. But I want it to read ‘butter: 3 tablespoons’”.

So what you do is called web scraping. It looks at a webpage in a program so you don’t have to do it. Long story short, you now have a list of ingredients (known in JavaScript as an array) and run what’s known as a map function. You say “rearrange this array of ingredients using this way of reorganizing the data and processing it”. Tada! And now this process works so that instead of manually going into every recipe blog and getting this information, you just teach your computer to do this.

Then the next problem comes up: you want to get the recipes throughout the week then have my shopping list when I have to go shopping.

That’s called data persistence. What you do is write this information to a file, either on your computer or itself in the internet (basically, on someone else’s computer), then you retrieve that information when you need it. So what you do is pass this information off to your backend, then your backend takes this information. I’m not going to talk too much about this, but know it’s one of the biggest uses for all programming.

## The backend:

So let’s remember: the backend is how your server decides the HTML/CSS/JavaScript it’ll send. Besides being able to work with your browser, JavaScript can work with your computer, using a thing called Node. When I talk about other languages, I’ll talk about backend more as a gateway to more information, but for now I’m going to talk about another fantastic thing Node allows: NPM.

Imagine your friend wants to set up her own version of the recipe parser we were talking about before. So, instead of writing it completely on her own, we can send her our code. Then she reads through it and dives into your program, finding the exact like where you look for the “ingredients-list” class because the blog website she uses has all the ingredients listed under the class “ingredients-list-master”, and she wants it to read “butter: tablespoons (3)”.

Then another friend asks about it. And that friend has twenty other friends who tell twenty other friends apiece about it. They all want your package, and well, send your package to four thousand people? That’s a lot of email and tedium. That’s the first problem. Then there’s another, each of them would have to learn learn how your code works just to make one small change. They’re all going to learn something very similar, so maybe you could address that. Remember: a programmer hates repeating themself and just repetition as a concept in general.

So NPM handles the former problem. It stands for Node Package Manager, effectively a central repository to distribute packages (what you made).

## Object-Oriented Programming (OOP):

OOP is relatively new to JavaScript (since 2015), but it exists, and I want to talk about it.

The situation we’re in (using my teacher-student metaphor from before) is this: your student finds the ingredients-list, so your friend needs to be a teacher who makes her own alternative curriculum teaches her own student to look for “ingredients-list-master”. What if, instead, you become the teacher’s teacher, and you say “I’ll tell you what to look for, and you teach your students how to look for what I tell you” and “I’ll tell you how to organize the data, and you teach your student how to get the information and do what I want.” In this case, the teacher is a program that teaches other programs.

Okay, that isn’t exactly how it works, and that’s not exactly how OOP works, but kinda? Anyway, you get the idea. This way when they want a recipe parser that looks for “total-ingredients”, instead of having to dive deep into your program, she instead ‘instantiates’ your class (the object of OOP; yeah, this is different than a CSS class) and says “look out for this”. Then that object carries out the recipe parser function (the student) according to your instructions. This reduces how much work everyone else has to do.

That only scratches the surface of what OOP can do. The biggest use case is by creating frameworks. So let me explain: in programming in any language, you are given every tool in the world to do what you need to with your program. You can customize almost every little thing, but you don’t need to do that. Frameworks are basically more refined tools that can do LESS than the default operations a programming language gives you but in a more streamlined and often more efficient way. For example, think about what you created. You limited users to not look at the whole webpage and specifically the one list with the one CSS class you specified.

With this in mind, this is the basis for a lot of the more complicated and cool things you can do with JavaScript. The most famous of these is React, Angular, Vue and TypeScript. Those will be coming later. Next post will be talking about Python because it’s my best bud. And in that way I can talk about more technical things.

Now, you may say (correctly) that I’m not giving any real samples of the language. At some point in this series, I’ll talk about what I like and don’t like with each language, what really comes to mind and such. But it’s a bit more abstract and technical, so it doesn’t belong until I start talking about hat stuff.
