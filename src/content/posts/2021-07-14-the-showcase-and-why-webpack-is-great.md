---
title: The showcase and why Webpack is great
slug: the-showcase-and-why-webpack-is-great
published: "2021-07-14"
categories:
  - Ben's Thoughts
tags:
  - showcase
  - typescript
  - webpack
  - react
  - tsx
---

Hello everyone,

I don't know how much you've been tracking changes on my blog. I suspect no one has, but that doesn't mean that I don't develop and work on it. There are two things I've done recently you can see.

Well, actually three. But I've been waiting on some things to get settled before I really start showing the third off. A sneak announcement: I have a big Vue project that's been done for a few months, and I'm totally excited. It's not everything I would've wanted to do, but it was a creative project to see what I can do. It goes with an upcoming book, is what I'm saying, and that's why I've been waiting on. I'll write a big, long post about it, how it was made and why it was made when I finally release it. However, until that time I'll be talking about the two things I have released. This post will focus on the first one, my blog's showcase (I was originally going to talk about both, but just talking about the showcase took up a ton of space).

[A link](/project/showcase/) - I wanted to take some of the more cool, isolated widgets from my other projects and show them off. It actually wasn't nearly as easy as I thought it would be to do, but I did learn a lot. That's been my experience, so far. Trying out something new either results in me getting frustrated and wanting to throw my computer in a lake (Machine Learning, C/C++, some parts of C#) or me learning a lot (GraphQL, Next/Nuxt, a lot of things). Now, I'm going to talk about the process because this is a blog post. If you don't want the technical details, well, uh, don't read this post?

The project is a subset of my blog's WordPress theme, and that may be a 'huh' thing. A WordPress blog is composed of three things: 1. the database, 2. the theme and 3. the plugins. The database collects all of the background information that supplies this information. All the posts on a blog, for example, are in it. That I'm the administrator is also in the database. Then there's a bunch of other information, but it's not really what you're going to care about. So these words, specifically are in the database. Everything else you see is part of the theme. How the menus are laid out (the actual menu items, though, is part of the database), the fonts, the designs, etc. There are some fuzzy areas where the theme decides a lot. Such as the front page, where the words that you see aren't coming from the database but from the theme. For example, on the portfolio page, the theme creates the cards that flip over, but the content of the cards is the database.

The point of this is that a theme is supposed to be a part anyone can install on their blog, while the database is what makes it mine. For example, I could give my benyakirblog.zip file to anybody. They could put it on their WordPress site, and it would work. The front page would be somewhat unfortunate, but they can change that by editing the theme. They would need to know some PHP, but it's not that complicated. Changing the database isn't terribly complicated either, but it is much more technical, as in you need to know what you're doing, or you might cause some serious errors. With the PHP, you will just mess up something's appearance unless you have some highly technical knowledge.

This was a long preamble to talking about what the showcase part of my site is. It's built into my theme, which means if you install my benyakirblog.zip file, you get an exact copy of what's on my showcase page. It is a problem, but whatever. It was the only want to do what I wanted.

So, now, finally, I'm going to get to what that, actually, is: React TypeScript. What that means is that everything you see on that page is JavaScript that's loaded in as one big bundle. It has its own special format and everything, though it's basically JavaScript with a little extra. I talked about it in my post about [Single Page Applications](/post/single-page-applications/). Well, what I didn't talk about is Webpack (I'm not going to talk about Rollup, which is something quite similar).

Webpack bundles all your files together and compiles them in the way you want. Most often, this compiles React/TypeScript/Vue into JavaScript, Sass/Less/PostCSS to CSS and Pug into HTML (and a lot more, not that I'll learn it until I have to). So, as I said in other posts, all of those things need to be 'transpiled'. They're not actually in the language your browser can handle so you need to change it. Most of those can do it by themselves, but if there's one golden rule about modern programming it's this: don't repeat yourself. If we transpile our Sass, then we have to go through and transpile our TypeScript then we transpile or React (that's pretty much what I had to do), then you're doing the same thing several times. Why don't we do it one central place and in a way that we control how it's organized?

For example, let's say I found a widget that lets me scope my CSS. If you read my blog post about [HTML and CSS](/post/html-and-css/), I talked about how necessary this is. In fact, if you check out the [style files](https://github.com/benyakirten/benyakiredits/tree/master/sass/pages) for each page on this blog, you'll notice there's BEM notation. For example, I want a block for projects, then I want another style for the box showing what technologies I used, etc. But I don't want to just call the first division page and the second tech because what if I want to talk about technologies somewhere else? I have to come up with unique names for everything.

But what if I were able to say "the page block on this page does XYZ while the page block on that other page does ABC"? That way I could have everything extremely simple, and I would look in the file and see "okay, the page block controls the main argument, the tech block controls a big block that does this, the article block is the main content and should have these properties." If I want to modify how the article block looks on page X, I go into page X and change the article block instead of looking for the... was it called "my-cool-page\_\_widget" or "my-cool-page\_\_my-plans"? You can get very consistent with names and reduce this confusion, but the best thing would be if we could just scope things so article on page X is always this and so and so forth.

That's what scoping is. So I found this scoping tool. But then you need to write out a set of instructions. First you say, transpile the Sass into CSS. Then you separate it into scopes. Then you do whatever else with it (major example being minification, which I'll get into a bit later. Then whenever you need to update the Sass, you have to go through all three steps even though they're probably only one command each. Okay, sure, whatever. It sounds tedious, but whatever, it's not that hard.

Well then, what if you need to do the same for about five other things? It gets really long winded, really fast. Webpack comes to the rescue. I'll show you my setup for this project:

MIGRATION\_CODE\_BLOCK\_0

MIGRATION\_CODE\_BLOCK\_1

MIGRATION\_CODE\_BLOCK\_2

Okay, so this will be very confusing if you haven't worked with Webpack before. Even if you have, it can be confusing without a syntax highlighter. If you look at the code above then look at how it looks on my screen (this is from webpack.prod.js):

![](/wp-content/uploads/2021/07/Screen-Shot-2021-07-14-at-10.10.26-AM-1024x779.png)

Look at all those pretty colors! They actually make coding a LOT faster because they tell when one boundary ends and when another ends. They also tell you what you're looking at. For example, a dull blue is one of either const/let/var or another couple of keywords such as null/false/true, which are words that need to precede every variable in JavaScript. Yellow is a function or method (a method is a function but on a class... look, it's not important). Green is a class. Light blue is a key on an object. Brown is a string. Light green is a number. I know instantly what I'm looking at. Also if I open a set of parentheses it automatically writes the closing parentheses and puts the cursor in the middle. Then if I click anywhere between the ( and the ), it will put a small highlight on both of them so I know what deals with what. Also, I can have multiple cursors. One use for this is if I accidentally spell "css-loader" wrong, say "cs-loader", then I could select every copy of "cs-loader" then, while they're all selected, I spell it correctly. That way the only thing that's changed is that one word, but I do it for every instance of that word on the page. Or what if I decide my variable coolThings should be more specific and instead say coordinatesOfTheCursor? Then I just select every copy of coolThings and replace it so that everything remains consistent.

Back to the code: it's a pain in the butt to understand, even for me, who wrote it (and got a lot of help by looking up how to do specific things on the internet). I'll give you the gist: I have three files, but really you have to think of it in two modes. There's the development mode and then there's the production mode.

You may ask why I would care. After all, when I'm working on things, why wouldn't I want it to look like the final product? For one main reason: time. When I want to do the production environment, every single change (no matter how slight), takes about 6 seconds to do. For example, if I want the text to read "Hi!" instead of "Hello!", that would take 6 seconds. That's because what happens is that I made it so my Webpack deletes everything it's created so far and instead creates new copies. So all the transpiled TypeScript and React gets removed. Then it starts the process from the beginning, including scoping and minification. That last one actually takes awhile, so I'll show an example

MIGRATION\_CODE\_BLOCK\_3

I could take like ten minutes to break down what that means, but basically it means taking every single optional thing out of your code. It means making everything as short and efficient as possible. For example, the @@iterator key at the bottom? It means that something is an iterator. The most common use of this is generator functions. An example:

MIGRATION\_CODE\_BLOCK\_4

This means that every time this function is called, it returns the yield corresponding to the amount of times it's called. So if you call it once, you'll get 1, the second time, you get 2, etc. It doesn't really matter, but my point is that saying function\* is a lot more comprehensible than saying @@iterator, but the latter is needed so it can be stored in a Symbol instead of inside of a function. I don't know why the minifier is doing that, but whoever designed it is a lot smarter than me.

Okay, back to the point. My web development mode doesn't delete anything but rewrites the one file that's changed. It also doesn't minify. It takes a quarter of a second to do its work. It is more than 20 times faster. And it produces exactly the same result, at least what I can see on the screen. However, there's one downside to it. The entire JavaScript bundle with the development mode is about 1.2 megabytes. You may think "oh, but.. like, the video I torrented when I was 12 was 1.2 gigabytes. That's much larger!" But first off, you visit a lot of webpages, and, if you have data caps or are on your cellphone, you have to worry about every little piece of data you use. Second off, it really sucks to wait for a webpage to load. Everything used to take forever to load. Now that things are fast, it's great, but it makes the outliers even more noticeable. Especially if you're not on your home network (or your home network isn't the fastest). Third off, for a lot of web hosts, the host has to pay for every bit of data they use. Usually the cost isn't a lot, but if you have 100000 people visiting your webpage every day, and you serve a 100 kilobyte bundle (the optimized version) versus a bundle that's 12 times as large, you're paying less.

Webpack also facilitates something fantastic, a live server. For Vue/React/Angular, the code doesn't run if there isn't a live server also running... I'm not going to get into it because there are a lot of caveats. But the idea is let's say you're designing a web page. Suddenly you change the text color to red. Usually, you have to hit the reload on the page, but on a live server, it's automatically loaded into the server. I change the text to red, save the file, and switch to the web page, and it's already red. Webpack lets you do that. I didn't use that a live server, which, if you know Webpack, is obvious, but whatever. It's great for that.

Okay, now I'm going to try to explain the code a little bit and why I used it. Most of the important work is done where it says "modules". Everything underneath there basically does what I talked about.

1.  Rules says 'what file names will this target'. If you don't know RegEx because you have a life, I target the .ts files (TypeScript) or the .tsx (React TypeScript). Then under use, it applies widgets described, the ts-loader or the babel loader. This transpires them.
2.  Use can also be several things, a process. So for SCSS files in the production environment, I use first one that converts Sass to CSS, then I take the raw CSS and put it into the JavaScript files (look, it doesn't matter), then I minify it.
3.  The alias system just makes it so I don't have to write out certain things, ala:

![](/wp-content/uploads/2021/07/Screen-Shot-2021-07-14-at-12.36.21-PM.png)

This is what my file imports look like in one component. So if you know the Unix file system, ./ means from this folder, ../ means one level up. So the first import means 'from this folder, take the file called Sidebar.module.scss'. One thing you also notice is that, however, the files at the bottom end with .component, not .component.tsx (which is actually their ending, not that you would know that unless you looked at the project repo). If you look up at the alias system, you'll see

MIGRATION\_CODE\_BLOCK\_5

What this means is that every file that has those endings doesn't have to be mentioned. Then there's the alias thing. What that means is that Webpack takes an absolute path (basically, this would be the whole directory from the start directory of your computer, such as usr/ on Mac or C:\\\\ on Windows) and converts it into a value when it does its work and figures out where everything goes. Otherwise, you use a relative import path. So @Options becomes ../../../../options/Options.context - the tedium isn't a big deal. But there is something that becomes a big deal. I'm not likely to ever move my options context for reasons that don't really matter. But the @Inputs folder might. In that case, the route is no longer always @Inputs/..., but I'd have to go into everything that uses a form input and reconfigure it so it's ../../../FormComponents/etc instead of ../../Inputs. Not only that, but one file might be ../../../FormComponents/etc and another ../../../../FormComponents/etc -- You may not see the difference, but you have to be careful of how many levels you're going back, depending on where the file I'm writing is located.

Okay, that's a lot of information. That's a little bit of Webpack can do, and what I used it for! It took me like 4 hours (and another 2 troubleshooting the next day) to set this up. However, I will probably not have to ever change this because it does what I want.

So now let's get to looking at what the actual code looks like (I'm probably gonna use screenshots from now on because they're so colorful. To show it as actual text is planned, but it might be a few weeks until I resolve this):

![](/wp-content/uploads/2021/07/Screen-Shot-2021-07-14-at-12.57.55-PM-1024x477.png)

So you may have seen React code before so you can make sense of this. It's a functional component if you're used to class-based components. It's also stateless (not that you can tell here). This is somewhat typical for JSX. It looks like JavaScript, but the function returns something that looks like HTML. There's a button tag and a span tag. That's the part that's transpiled.

Let's step back for a moment, to the beginning of the functional component.

MIGRATION\_CODE\_BLOCK\_6

So if you know TypeScript, I'm declaring the type to be a React.FC (Functional Component), which is a generic. That means that this type accepts a subtype which is somehow related. This generic takes the props that the component will take. What are my button props?

MIGRATION\_CODE\_BLOCK\_7

What does this mean for the whole thing? That my component receives two props, a children props which is a ReactNode, just basically either a string or another React component, and my onClick prop, which is a function that takes no parameters and returns nothing.

So, TypeScript is entirely optional when it's in, and everything you can do with TypeScript you can do with JavaScript. So why would I use it? Because it keeps everything super consistent. Let's take something a little more complicated that depends on types.

MIGRATION\_CODE\_BLOCK\_8

What's going on here? It's a little bit simpler in JavaScript:

MIGRATION\_CODE\_BLOCK\_9

The function takes some object then returns a string based off of it. Why involve TypeScript? Well, TypeScript will tell me, when I'm using that function, if my object has an r, g and b property. And it'll tell me, when I invoke the function and get the string back, that for example the string will have a .toUpperCase() method. But it won't have a .push() method because it's not an array. Nor can I do something like newColor = \[ ...unitedRGB, '#000000'\] because the spread operator (the ellipses) doesn't work on strings.

Okay, enough of the boring technical stuff. What do I do on the showcase page? Well, you have a menu that comes up when you click on the sidebar, you can choose what item to see, then you play with the widget. Every widget has a part at the bottom that talks about how it works and why I added it. While I was working on this and writing those descriptions, I felt like I had started to accomplish my dream of writing code to have a message, to create something that could be called adjacent to art. I have a lot to do and work on to get where I want to, but it's the beginning.
