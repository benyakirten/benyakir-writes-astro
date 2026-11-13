---
title: A Week's Worth - Backend with GraphQL and Django
slug: a-weeks-worth-backend-with-graphql-and-django
published: "2021-07-15"
categories:
  - Ben's Thoughts
tags:
  - crud
  - graphql
  - query
  - mutation
  - python
  - api
---

Hi again! Now that I have the syntax highlighter done and posted about, I'm going to talk about the other thing that I did recently besides the showcase: [the backend for A Week's Worth](https://github.com/benyakirten/a-weeks-worth-backend). Yes, that's the link to all the code so you can look at it while you're reading this blog post. Let's start off with Django, then I'll go into what APIs are, what CRUD is and then finally GraphQL and how I used it. And I've learned something, and that's to include a table of contents for you poor people that don't want to read 5000 words of nonsense to get wherever you want.

1.  [Django](#django)
2.  [API](#api)
3.  [CRUD](#crud)
4.  [GraphQL](#graphql)
5.  [Conclusion](#conclusion)

## Django

Django is really cool. That may not give you the greatest idea of what it is. Here is a better description: it's a heavily opinionated fullstack framework for Python. That is a lot of words, but here is a less compressed version:

1.  It's in Python
2.  It has a ton of methods that only it uses but lets you do really complex things. More on this later.
3.  It can work with a database, show the visitor a webpage or both.

Those things are all possible with, for example, Flask, which is what I used for [this other website](https://github.com/benyakirten/translation-website). However, Django forces you to do things in a certain way if you want to use it. It has a specialized file for database interaction, but you don't have to write SQL (one of the things I hate the most about databases) but instead something like this:

That may not seem simple. Object-oriented programming? Classes? Inheritance? A UUIDField? A foreign key? What does this all mean?

Well, it gets easier, but let's start on the Group class, the last one. when you know that Char means character, as in a single letter. A UUID is a way of identifying something by its name (you can read about it on [wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier)). There's also fields for integers and other items. You can kinda the Group class if you stare at it hard enough. Each group has a name, that's a bunch of letters. And it has member which are many... Individuals?

What you have to understand before that makes sense is how this information is stored. Every class here represents a table. Imagine exactly that or just an excel spreadsheet. That's effectively each class, where each row is a new item (a new group) and every one of these fields (id, name, etc.) is another column. And... one of those fields is another table, the Individual table.

But this is a flat piece of paper! It can't be three dimensional. It's not, don't worry. What's happening behind the scenes is that a pivot table is generated. What that means is that there's another table generated, which has two columns. One is the ID of a Group and one is the ID of an individual. Then each group will have an ID that points to an entry on that pivot table, which point to an ID of an Individual and vice versa.

I think you can start to see why I like Django. If you do this by hand, for every change in a group's members or if an individual joins or leaves a group, then you have to update a handful of tables and keep track of this information. With Django, you just give the general idea of what needs to happen in general, and it does all the grunt work for you.

Okay, now that I've explained what a many to many field is, there is also a one to one field and a foreign key. One to one is pretty much what it sounds like. Foreign key, instead, is a one to many field, meaning that one side has a lot of the other but the other side only goes to one. For example, above a Group may have many shopping list items, but each shopping list item only belongs to one group.

Well, this is pretty sweet, but there is a ton more than Django can do. I'm not going to talk about serving files, for example (showing you a webpage) because that isn't that different from something like Flask. But I want to talk about signals. In Flask, if we want to have something happen every time we save something to a database, like saying in the console "hey, item saved!" we put that method right next to the one for saving the time. But Django is a bit more opaque because it handles all those things automatically. So instead it provides a humongous amount of hooks to us to let us do that reactively, and those hooks can be used by signals.

So we have this receiver line. If you remember [my post about Python](/post/python/), I talk about things called decorators. Basically, they attach to another function and modify their behavior in some way. In this case, it talks a pretty innocuous, not very interesting function, and makes @receiver activates whenever the sender activates the hook. The sender in the first case is the user for when it's authenticated--hold on before you lose your cookies.

Okay, let me explain something. I plan to make a frontend to this website using Angular. Single Page Applications, because they don't have a server behind them, don't really do sessions, which is the normal method of authentication. So they do it better with cookies, and so the best way to make one that holds sensitive data is a [JSON Web Token](https://jwt.io). I'm not going to explain it (the little I could because I don't know much about cryptography, and it's complicated, so I leave it to the cryptographers).

And the result of this is that I found it easier to have all the authentication-related stuff like usernames, emails, passwords, etc. tied up into the "User". Then everything that the person does that interacts with other data, like setting up a shopping list or listing their meals for the week (hence A Week's Worth), the Individual handles it. The connection is that each user is tied to an individual through a one-to-one relationship.

Another cool thing about Django is it facilitates automatic testing. It's a really, incredibly boring thing, but it's also incredibly important. What it does is you set up benchmarks that make sure things work in a certain way. If you ever work on something else then come back, change something or another, or work on someone else's projects, you want to know that things work without knowing exactly if everything is working. A test effectively simulates what would happen, either in a small, individual area or something that's larger. Here's where I test that an Individual is created every time a User is created.

## API

This section will be thankfully shorter, same with the next. API means Application Program Interface... which means pretty much nothing. It's a really awful term because it means something specific but has a generic name. An API is a means by which a program or system may be interacted with by a developer or program, not an end user.

In this case, the API for this program will be how this website gives and takes information to interact with the data in the database. If I want to create a new User, it's done through the API. If I want to edit my recipe, etc.

Here's an example of one I use on that same Flask site from before:

## CRUD

CRUD is a solution to a problem so I'll lay out the problem first so you know what I'm talking about. Imagine there are 30 different Django databases that you have to add a recipe to. Back in the old days, you would have thirty different ways to do it. For one database, you send the information by FTP. In another you send a POST request to database/add-recipe.php, on another you send a PUT request to database/add.asp, and so on and so forth. CRUD is a design standard that says, no matter the database, you add a new recipe, retrieve them all and update them all in the same way. [This website](https://crudcrud.com) shows you what they are. Basically, if you want to deal with recipes, you go to the /recipe route then whatever.

## GraphQL

CRUD is great, but there are certain limitations. That's why in 2015, Facebook came out with GraphQL. Did you know Facebook creates a lot of really cool technology? Other than their soul-sucking websites, they do cool stuff! In fact, this. So one of the limitations of CRUD is that you only get one piece of data per request. You get all the recipes. Or you get one recipe. But what if you want see that Bob needs to buy 5 tomatoes? What are they for? Oh, a marinara recipe. Well, who else is cooking marinara? I want to join their group.

That there would be about 5 or 6 separate requests. So just like React and other SPAs do to requests for webpages, GraphQL does for APIs by looking at information in terms of a graph instead of a single data point. Here's a quick graph of a sample tree I found on the internet (I just googled graphql graph):

![](/wp-content/uploads/2021/07/Unknown.png)

Instead of asking for all the detail on a book, we ask for those details and also this author, we get all the books by him, oh, and maybe the reviews on those books. Here's a sample query from my database:

You can see here that I want all the recipes. Oh, and all the ingredients. These can easily get recursive, like the following:

My backend doesn't work that way. I purposely made it so it couldn't recurse mostly for privacy concerns. I wouldn't want anyone who looks up a recipe to know that I love cooking it. It's my food after all. Don't judge me (I mean my friend) because I eat spaghetti seven days a week.

If you want to know the technical terms, the reason it's called GraphQL is because it talks about graphs, a data structure consisting of nodes (piece of information) and their edges (the connections between each other).

One last note is that there's obviously very different syntax for GraphQL. In JavaScript or Python, you would see colons all over the place, but not this. But you want to see something kinda wild?

That's right. GraphQL has variable, functions and types. It's kinda the answer to the question you presumably had of "but how do you know when things can be expanded and when they can't? Why are ingredients broken down and steps but not the name?" The backend decides exactly what items are used and what aren't. For example, in the function at the top, the ingredients array is a List of IngredientInputType, which is defined elsewhere. If you want to know how you're supposed to know all this, GraphQL is made to be very friendly to users. Check out [an example here](https://countries-274616.ew.r.appspot.com). Public-facing GraphQL APIs have the interface you see there, GraphiQL. And GraphiQL automatically generates the documentation on types, mutations and queries. Once I finish my website, you'll be able to use my GraphiQL interface too. Or you could just use the frontend and not have to manually attach authorization headers to your request through something like Insomnia or Postman.

## Conclusion

I find myself running out of things to say. Actually, there's a ton I could talk about and the difficulties I had in completing the project. I will do that for a moment. I used a package called Graphene, which is one of many for Python. The documentation isn't the best, and there isn't too much information about it online. It was especially bad when I started writing the tests. It was a nightmare with the authentication also going on. So I needed to do authentication in its own way, which kinda worked but wasn't very clear. I would think everyone would need to do this, but there are few resources online. If you or someone you know is having trouble writing tests for graphene Django with or without authentication and you or they need help, let me know. I'll do my best. There's a lot I don't understand still, but whatever. I got what I needed to get done.

I was going to talk about various queries and mutations, but that would be quite mundane. You can check out the repo under the schema folder.
