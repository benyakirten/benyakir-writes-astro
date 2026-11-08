---
title: HTML and CSS
slug: html-and-css
published: "2021-03-02"
legacy:
  wpId: 735
  postType: post
  sourceOrder: 109
categories:
  - Ben's Thoughts
tags:
  - programming
  - html
---

## A Soft Intro

I’ve been doing mostly web development, so I’ll start there. Web development all starts when you visit a webpage. Your computer sends a request, and a server (just another computer that ‘serves’ the webpage) sends something back. How it decides what to send is called the backend, and what it sends back is the frontend. That's where I'm going to start because it'll be an easier to get into.

The frontend is three things: HTML, CSS and JavaScript, so I’ll talk about the first two today. They’re also on the ‘lighter’ side of things so it’s a better introduction. For examples, I’m going to talk about a website I set up. Over the course of the next few posts, I’ll talk about how it works. I’ll get into the specifics as we go, but if you want to see the website immediately, go here: [g-f-benyakir.herokuapp.com](http://g-f-benyakir.herokuapp.com)

For the first of many asides: I’m a big believer in open source, which means that I try to put up everything I do for anyone to look up and copy:  [https://github.com/benyakirten/translation-website](https://github.com/benyakirten/translation-website) — if none of this makes sense to you, wait until I talk about it. I’ll talk about this in the [asterisky](#asterisky-section) section of this post. So if you want to, skip down to the bottom if you don’t know what a GitHub repo is under [\*](#one-star).

So I covered most of what HTML is in the last post, but here it is again: It describes the form of what a webpage is and fundamentally how it will be laid out. Now, it gets more complicated, but most of that complexity won’t come up in 99% of situations. I’m not going to get into them because if you’re reading this, you either know them already or don’t care.

Just to get this over with, there is one piece of jargon you should know before we start in case I ever mention it in this article (or someone says). Each item in HTML is called a tag or an element. Such as this paragraph of text? All of this text is inside of a <p> tag (the text), the p element, which has certain features. You don’t need to think too deeply about it, but now you know.

Anyway, back to what I was talking about: People like giving this stupid example (c.f. my rant about anything being compared to humans): html is the nouns of a language, CSS is the adjectives, and JavaScript is the verbs. So CSS does that, makes things look nice. Like you can make text look blue or have a border. There’s a ton of options that you can apply for almost everything (the one (two) GLARING exceptions are checkboxes and radio boxes, but I’ll get to them later). You can customize a numbered list so the counter increments by 2 every time instead of 1. It’s excessively complicated, but you can (mostly because CSS doesn’t track data and numbers… kinda). But for easier things, you can make text look like boxes. You can have boxes lift off.

What is excessively complicated, though, is getting things lined up correctly and precisely, at least until you get quite familiar with the systems that are in it. Until recently you had to do something called “floating”, where things joined up if there wasn’t enough space. I never really understood it, but thankfully with HTML 5, something called flexbox came around. It’s basically for saying that everything is EFFECTIVELY in a line. You can customize it. Then there’s flexgrid, which is effectively the same thing but for a grid.

I’m underselling the power of CSS because there are some really cool things you can do with it. The two big things are pseudo classes and animations. They often overlap, but let’s start with the former. Remember me saying JavaScript was the verbs? The idea is that to do anything that changes based on conditions or keeping track of what’s going on in the screen is something for JavaScript. That’s mostly true, but there’s some exceptions, and in CSS we call those exceptions pseudo classes.

## Onto The Examples

We’re going to use a website I set up for demonstration purposes. WARNING: Almost everything I talk about until I get to the checkboxes won’t work except on a desktop computer. I hate paying for things unless I have to, so if you can’t access the website, wait until next month because my free tier has run out. I doubt it’ll get to that, so here’s the website: [g-f-benyakir.herokuapp.com](http://g-f-benyakir.herokuapp.com)

Hover your mouse over the button that says go. Move your mouse away and do it again a few times if you want. A CSS pseudo class is identifying when your mouse hovers over something. There are a bunch of them, and one of them is checkboxes!

A demonstration are the slider boxes that say “convert units” or “don’t convert units” and the other one. I want to talk about this is that this is the ‘logic’ that most people don’t ascribe to CSS. The basics of it is that HTML and CSS only allow checkboxes to be a little box with a check in it (and a radio box to be a circular element with a dot inside it). How exactly those appear depend on your browser, but they’re mostly similar. And you can’t make the check look different, nor the box: you can’t say it should be bigger or smaller. It’s a bit ridiculous and feels old compared to how much flexibility CSS gives you otherwise (such as the above mentioned go box, whose every detail/hover/animation is something customized by CSS).

So the trick is that the checkbox is invisible. You can see that thing though, so how can it be invisible? Well, the sliding thing is the ‘label’, which is normally used to say what an input element or whatever is (such as a login screen saying email or password above areas”). Instead, it has no text, and we define it as that ball. I like linear gradients, so I made the color on it a gradient. A special thing about checkboxes and radio boxes is clicking on the label also checks the element. So we can keep track of the checkbox being checked even though there’s no normal way to do it. Then we animate the ball to move conditionally based on whether the checkbox is checked using pseudo classes. There are a bunch of weird keeping track of things, such as on the about page, making text appear if you hover over an element. It’s actually significantly more complicated than the go box, but the basic theory is the same.

You can use it for many more complicated things, such as a menu coming out. A potential example would be, while reading this blog post, is hovering over the top bar. On a few items, a little menu ill slide out. Just to tell you, most people don’t use CSS for this. Most of it is done by JavaScript because it’s keeping track of things. When I get to JavaScript, I’ll talk about this, but you don’t need to really know.

And now animates are simpler (hah). Because everything on your screen on a website is being processed by your browser, which is significantly more complicated, it can do some complicated stuff for you. You basically give a starting point, optionally some median points, and then a final state. Your computer calculates all the intermediate states. You can say how quickly this happens and the speed at which (such as quick at the beginning, slow at the end).

Brief aside: What are these states? Well, one thing that’s often used is opacity. To make something appear, you start it at 0% opacity before you being then 100% at the end of the animation. There are more things you can animate, and some things you surprisingly can’t animate. No, I won’t talk about it.

Now, these come in two varieties: animations and transitions. Transitions are really simple. All you do is say how long the animation is. Then on some state you change things, usually a hover or another pseudo class (the abovementioned checkboxes and go box are transitions). The starting state is how the item looked before the animation starts, if you were wondering.

Animations are more complicated. You can designate how many times they happen (from once to infinite). Then you can spell out up to a hundred intermediate steps (maybe more? I don’t really know because I doubt I’ll ever have a need for more than like 5 steps ever).

For a demonstration of animations, I’m going to highlight the CSS I used: [https://github.com/benyakirten/translation-website/blob/master/static/css/style.css](https://github.com/benyakirten/translation-website/blob/master/static/css/style.css) [\*\*](#two-stars). Don’t freak out because you don’t need to understand anything, and I don’t want to teach you anything. I just want to talk to you about the first 13 lines of the code you see, from the line that starts @keyframes until the second closing curly bracket. Between the two there are a few lines that start with some percent then an opening curly bracket. These are the steps I was talking about.

This blog post ended up being way longer than I intended it to be, but I laid out what CSS means to me and how I intend to use it. Now, you can stop reading here and save yourself from even more boredom. Nothing beyond here is any better than what came before. Only read it if you’re curious.

<span id="asterisky"></span>

## Asterisky Section:

<span id="one-star"></span>\*For my source code:

1.  This is Github repository. Just click on one of the .html files to see it.
2.  I suggest you start with index.html
3.  This is written in Jinja2. You don’t need to worry about what it means, but just ignore the lines that start with {% and end with %} — basically just go down the lines where <main> starts
4.  The long and short of it is that Flask uses template files that can combine with each other. base.html wraps around every other file. It doesn’t matter, really.

<span id="two-stars"></span>\*\*No, I did not write all 700+ lines of CSS into one file. I wrote the styling in SASS (or more specifically SCSS) then transpiled it into one file. If you’re wondering, SASS and SCSS are just different ways of writing the same thing. SCSS uses open and closing curly brackets like JavaScript/CSS to denote when things belong together. SASS uses indentation like Python.

Okay, but what is SASS?  I recommend you just visit the website at: [https://sass-lang.com](https://sass-lang.com) — But if you want my explanation, it’s just a templating language built ON TOP OF another language, which takes what you write and rewrites it into CSS[\*\*\*](#three-stars). In the end, it just makes writing some things in CSS easier. The main reason I use it is something called BEM notation. What does that mean? It just means using unique sass-friendly notation.

To explain it, I’ll go to how CSS works. In your HTML, you write hooks for your CSS to attach to. There are four ways of doing this: 1. The type of element (whether it’s a paragraph, or a main element), 2. The class, 3. The ID, 4. The pseudo element (usually used to identify when an element is hovered or the order of elements). The main thing to know is that everyone[\*\*\*\*](#four-stars) uses classes to identify somethings and pseudo classes only as necessary.

Then the next part: HTML is built on top of nested elements. You’ll have a main section that contains a list (which is itself list items nested inside of a list), then each list item will have text and image. So to identify it you might give classes for the list as “list” and for the items of the list as or “list-item”[\*\*\*\*\*](#five-stars). For example, this HTML:

MIGRATION\_CODE\_BLOCK\_0

This is nice because it designates that the item as inside of the list. And it states exactly what it is. How this would be written is (just note that all lines that begin with // are comments, they're just notes for yourself that the computer skips over when interpreting your code):

MIGRATION\_CODE\_BLOCK\_1

If a programmer hates anything, it’s repeating ANYTHING. Sass lets us write it as “list” and “item”. How this would be written is:

MIGRATION\_CODE\_BLOCK\_2

Just like the HTML, the LI is nested inside of the UL. BEM notation would be this:

MIGRATION\_CODE\_BLOCK\_3

The SCSS to describe each item is this:

MIGRATION\_CODE\_BLOCK\_4

.list affects the whole list. &\_\_item affects both items in the list. &-red and &-blue affects each of those items identified in the list. It’s just one of many conventions that I like.

That is almost the biggest advantage of sass, but there are a few other things. Before CSS kept track of variables (no, I won’t talk about it), sass did it. Then you can make functions or mixins that let you do certain things while keeping repetition at a minimum or make something clearer. No, I won’t explain. You can read the documentation if you’re interested. Or send me an email or something.

<span id="three-stars"></span>\*\*\*That’s what transpiling is, taking one thing from one language and writing it into different language that has the same degree of complexity. What do I mean by complexity in this context? Not human complexity, at least directly! Most people just call it a higher vs a lower level of programming language. Long story short, some things interact more directly with your computer. No, I won’t explain any more.

<span id="four-stars"></span>\*\*\*\*I used to think it was alright to be unique. But follow conventions as much as possible and makes sense. This is the equivalent of following grammatical rules like capitalizing at the beginning of a sentence. WrItInG lIkE this is fine, but it’s easier to read and interact with when it’s regular grammar. It’s more universal. There are times to deviate, and it’s to make a point, just like using incorrect grammar, but it shouldn’t be the norm in your programming or no one will ever want to work with you, and you’ll forget what you were doing when you come back to your code in a month or a year.

<span id="five-stars"></span>\*\*\*\*\*If you’re naming something in every programming languages (I don’t know any exceptions), you never use a space. Languages use one of four conventions to designate items:

1.  kebab-case (CSS)
2.  PascalCase (almost every programming language but only in certain cases)
3.  camelCase (most languages)
4.  snake\_case (Python and a few others)
