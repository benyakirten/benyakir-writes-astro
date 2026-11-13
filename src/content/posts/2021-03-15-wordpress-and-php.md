---
title: WordPress and PHP
slug: wordpress-and-php
published: "2021-03-15"
description: I express my joys and sadnesses about WordPress (mostly joy) and PHP (mostly sadness)
categories:
  - Ben's Thoughts
tags:
  - php
  - wordpress
---

There are only a few topics left, so I decided to write about what coincided with what’s happening right now: my blog’s upgrade ([repo here](https://github.com/benyakirten/benyakiredits)). So let's talk about how I did what I did.

Big disclaimer right here: if you don't know, my blog is hosted on WordPress. What is the quickest way to sum up what WordPress is? It is a highly opinionated framework that I like (note: in later posts I'll explain what a Framework exactly is, but for now just don't think about those words too much). 'Highly opinionated framework' means it facilitates some things very well, but you have to do things almost entirely in its way. Those sorts of Frameworks tend to be very polarizing for me, but this is one of the few I like. To explain why, I’ll talk about databases first.

Undoubtedly you’ve heard the word before, so you must’ve occasionally wondered what the big deal is. It does two things: organizes data and persists it. Let’s imagine orders for the pizza place. First order comes in for a medium with pepperoni. Then the next is for two larges, one with mushrooms and peppers the other plain. You can keep track of 3 orders fine. But imagine you have 10000 of them or even 10 million, and you want to know how many people ordered plain pizzas or had three in one order. Then you could look at orders from five and three weeks ago. You could just write them on pieces of paper and try to get the data that way, but you could write this information to a database. And this would make things pretty easy.

For a long time, there was only one type of database: SQL, pronounced sequel (there are more, but I'll talk about it in a different post). If you’ve heard of tables and things like “SELECT \* FROM employees WHERE ID = 56” or table joins, that’s it. I find SQL and their databases one of the worst things I had to learn (and so I didn't do it well). The language is incredibly boring, and there’s usually just one thing you want to do so there's little creativity. There’s nothing expressive about it. Whenever I do anything with SQL, I think of a 45-year-old programmer at Oracle in the 1990s hunched over a computer and going to a conference to talk about such things with other older, equally drab men and all tremendously boring. That said, there’s nothing wrong with it, and more kudos to you if you can do SQL without dying of boredom, but I find it both tedious and stale.

So how's that relevant? WordPress works based around a SQL database. It’s, in fact, MySQL, a version of SQL databases from the 90s made by Oracle. But what makes me really like WordPress is that you don’t have to interact with it. It does all of the querying and CRUD (again, don't worry about it). But now you're asking, 'but where does it extract the data'? That's where Themes come in

A theme is a series of files that tells WordPress where and how to handle the information. It's what would be called in other instances a template. So, I'm going to give you a fairly banal example. I've had to do a lot of immigration paperwork in my lifetime, so I'm going to link you to a simple rider you should include in every immigration application, the [g-1145](https://www.uscis.gov/sites/default/files/document/forms/g-1145.pdf). You're taking the vast stores of your knowledge (the database for WordPress), and you are putting your data in the boxes they want so they get a standardized display of the information through the template of the g-1145.

To go back to WordPress, all your theme files have to have very specific names and have to be in a specific place. This is because, as I said before, WordPress is highly opinionated. You have a folder named for your theme. Then inside of that you have a screenshot.png, a style.css, index.php, style.css must have a beginning that looks like this at a minimum:

MIGRATION\_CODE\_BLOCK\_0

You must surely be asking yourself "but how does WordPress fill in that g-1145? You just showed me some irrelevant stuff). Okay, here's how it happens: in the PHP files, WordPress goes through something called "the loop". WordPress will query all appropriate documents from the database and hand it to the files when they run then part of your template file for every iteration in the loop. If that sounds very confusing and abstract, here’s a short example from a very simple index.php:

MIGRATION\_CODE\_BLOCK\_1

Let’s get the header and footer thing over with. get\_header() and get\_footer() are WordPress functions that retrieve everything in your header.php and footer.php files respectively (an example of whose contents you can find on the repo). What are those, you ask? It’ll be everything you want to include in every file, usually HTML boilerplate. Without getting into details, it's what you have to write, but it doesn't have much significance. Or its elements you want to show up on every page (like the menu bars at the bottom and top of this page).

More importantly, those things are an example of what I said before, that you have to format things very specifically (the files have to be PRECISELY named header.php and footer.php), and you get things done easily. For example, if you looked at my code for my g-f-zafferano website, then you’d see I had something similar. Except I called it base.html, and it was both the header and the footer. It’s because Flask, the thing I used in Python, works a little differently. Flask would make me build all the things up from the beginning, how to retrieve info in the database, how to store it, etc. This allows for far greater control but takes a lot more time to do the the setup. That said, most of the WordPress features built into it are pretty well set up and shouldn’t need to be customized. And the parts that can be customized easily are the parts you probably want to change anyway.

Okay, so that while loop (I talked about it briefly in the Python post) says this: go through each of the the items that are loaded into this page and override the variables so that the\_title() retrieves the title of the post and idem with the content. For example, there’s an option in WordPress, under settings then reading where you can state how many blog posts you get per page in your archive of all posts. Should you see 10 at a time? 5 at a time? 1? You set it, then WordPress gets the appropriate information for you when you load archive.php. Then all the overflow posts are counted correctly when you call paginate\_menus (as in page 2 if you show 5 at a time will have blog posts 6-10, etc). Appearance -> menus lets you set up how many and what depth menus you have. Both of these supply information to the appropriate files, depending on where you place the functions wp\_nav\_menus. You don’t need to worry about exactly how those work unless you want to learn WordPress (in which case I can help if you want).

If that seems woefully arbitrary, welcome to opinionated frameworks. You just have to learn how they work, and you don’t have the immense freedom of a programming language. I usually dislike them, most notably GatsbyJS and Nuxt. Never mind what they are, since I’ll talk about them in the future, but the point is this: I like freedom over convenience. But here I really like WordPress for two reasons: it is exceptionally well made (being simple to use and customize), and I don’t like PHP or SQL.

So what actually is PHP? You noticed the <?php ?> tags above, probably. Everything between those is PHP. You open a special tag inside of a file that otherwise looks like HTML. So, you may ask (probably not), what if you don’t have any HTML and just want to write some functions? Well, you better believe you open it with <?php (check out functions.php in the repo if you want an example).

Now, some reasons why I don't like PHP. If you remember, you write an array in JavaScript or Python as \[0, 1, 2, 3, 4\]. In PHP you write array(0, 1, 2, 3, 4). An object or dictionary in JavaScript/Python are {“first”: “Ben”, “last”: “Horowitz”}. In PHP it’s array(“first” => “Ben”, “last” => “Horowitz”). It may not seem like much, but it does get on my nerves for how verbose and intuitive it is in comparison.

Let’s say I want to add another item to my array. In JavaScript or Python it’s simple, just: var.push/append(item). In PHP it’s array\_push($var, item). I want to run a map function, it’s array\_map then some strange syntax with PHP arrow functions which don’t really work like you’d expect if you come from JavaScript. Now that may not make sense, but in an upcoming blog post, I’m going to talk about lambda and arrow functions, which are fairly abstract.

In the end, WordPress has served me well. I originally didn’t think too much of WordPress and thought it was an obstacle on the way bigger and better things. But it’s its own thing, and that thing lets you do some pretty cool stuff without too much effort.

I just want to give you an idea of how many files you’d need to write a website like mine (here's the [repo again)](https://github.com/benyakirten/benyakiredits). But just to give you a rough idea of what sort of complexity you want for only a slightly complex site: about 90 files. A bunch of them are images , and a bunch of them are sass files that are transpiled into one larger file. About 10 of them are me offloading parts of code into other files. I should, actually, have done that with more, but I didn’t. I started to do that with the link boxes (the boxes in the top left and top right), but I put it off onto the 'todo' list.
