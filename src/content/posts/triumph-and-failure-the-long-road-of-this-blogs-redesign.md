---
title: "Triumph and failure: the long road of this blog's redesign"
slug: triumph-and-failure-the-long-road-of-this-blogs-redesign
published: "2024-09-03"
legacy:
  wpId: 1356
  postType: post
  sourceOrder: 154
categories:
  - Ben's Thoughts
  - Ben's Blogs
tags:
  - ssg
  - ssr
  - ux
  - ui
  - react
  - legacy
  - lint
  - maintenance
  - trie
  - hsl
---

## Table of Contents

-   [Introduction](#introduction)
-   [Updating Dependencies](#updating-dependencies)
-   [Removing the Unnecessary](#removing-the-unnecessary)
-   [Revamping Search](#revamping-search)
-   [Changing Cards and Filters](#changing-cards-and-filters)
-   [Getting Fonts to Load](#getting-fonts-to-load)
-   [Modernizing Theming](#moderning-theming)
-   [Fixing Block Identification](#fixing-block-identification)

## Introduction

I wrote my blog originally around the end of 2021, shortly before I got hired for my first programming job. I was pretty green so I was trying a bunch of things I hadn't done before. I had heard a lot about Gatsby, and the idea of static site generation seemed pretty great. I still like it for a blog: something where each page can be created beforehand then transmitted to the user via a CDN.

Quick aside: I've thought a lot about switching to [Astro](https://astro.build), but I need something to demonstrate my ability with React. Plus, the blog's source code shows that I'm able to deal with the wackiness of JavaScript dependencies, adapting legacy code (I had to make a bunch of alterations to deal with my WP blog that uses custom post types), SSR-type rendering where you have to balance Node-based builds with client-side rendering.

Then in the year 2023, I was laid off. I realized I had to do something for my blog, but I wanted to work on something different. So I created my chat server with e2e encryption, Vue/Nuxt and Elixir. It was a fun challenge, but my blog was how it had been since my early days. I found some work doing independent contracting, and I figured I could put off UI/UX work.

But it caught up with me at some point. I decided I needed to up my game. I read [About Face](https://www.amazon.com/gp/product/1118766571) and took a [UI course](https://www.learnui.design). I wanted to apply it to my Writer's IDE, but I've become more and more aware I needed to update my blog and demonstrate all I have learned (or at least a subset).

## Updating Dependencies

In 2023, I discovered that Gatsby 4 was no longer supported by Netlify. I use them because it has a free tier and is super easy to setup (though I might switch to Cloudflare). I had to update all of the dependencies and some features to work with Gatsby 5. I got it working and added a page for my portfolio, but both efforts were fairly barebones.

I knew I would have to do a complete overhaul, but I kept putting it off to pursue one thing or another. I wanted to learn Rust, Zig and C. And I did learn a good amount of Rust and things like stack vs heap allocation, pointers and all those fun things (to me, at least), things that I had avoided learning because I wrote things like JavaScript, Elixir and Python. Eventually, there was a lull in work and I threw out my back. I had to spend a bunch of time lying down on my stomach without having anything to really occupy my time. So I decided that I would finally get around to using my new UI/UX/programming knowledge and revamp my blog.

My first action was to add a linter. If you've worked with at least one other person, you instantly realize everyone does everything differently. Some people want 4 spaces, some 2, others use tabs. Some people don't use semicolons in JavaScript. It goes on and on. So to resolve this, you use a linter that standardizes formatting according to some rules you create.

I had used [Prettier](https://prettier.io) and [Eslint](https://eslint.org), which are both fine tools. But because this was my own personal project and I could do whatever I wanted, I used [Biome](https://biomejs.dev). I also did something unconventional for me: I didn't add much customization and instead opted for the default rules. It had its ups and downs, but it was mostly fine. The defaults made good sense, and they made the code look consistent and neat. That's all you really want.

The next change was replacing [Jest](https://jestjs.io) with [Vitest](https://vitest.dev). I had made the same change back at Thread back when Vitest was still at version 0.10 (or maybe earlier). Jest is outdated and requires a [lot of configuration](https://github.com/benyakirten/benyakir-writes/blob/d93179881a9f5713d17ad53bc557523e4af2fc9b/jest.config.js). Vitest required almost nothing. I removed the configuration, simplified a bunch of tests to not have as much setup/teardown and voilà. If you run unit tests and still use Jest, I highly recommend you switch to Vitest as soon as possible.

Then the best change: replacing [npm](https://github.com/npm/cli) with [pnpm](https://pnpm.io). I no longer had to worry about conflicting dependencies, things ran faster, and everything was easier. I worried briefly about Gatsby only supporting npm, but I found out that they had recently added support for other package managers. I don't think it's ready to support Bun yet, but pnpm is a great second choice.

## Removing the Unnecessary

If you look at the sidebar, the amount of links has been reduced by about a dozen. Here's the old sidebar:

![](/wp-content/uploads/2024/09/Screenshot-2024-09-02-at-11.31.25 PM-465x1024.png)

There was a separate group of links for each link. You had separate pages for blog posts vs podcast episodes, etc. Instead now, you only can view them all grouped together, but you can filter them.

![](/wp-content/uploads/2024/09/Screenshot-2024-09-02-at-11.33.25 PM-1024x842.png)

The idea behind this was simple: there were way too many links in the side bar. The need to open up a sub menu just to choose them was cumbersome. And I don't think anybody really cared enough to only visit one subsection.

I also then got rid of the contact and about page. And I changed the home page to show the latest events of any type. I got rid of the contact page because I was only getting contacted by scams and spam. I had gotten one legitimate use of it back in 2021. All others were trying to sell me Cialis, online gambling, having me sell ads on my website or pay to boost my SEO or something. The about page didn't say anything that I cared about. Likewise, the home page should be useful, not just words.

## Revamping Search

My next act was to revamp searching. I had built an elaborate system to index data when building statically. I did make some minor modifications to that, but I left it mostly intact. I built on it to add a [Trie](https://en.wikipedia.org/wiki/Trie) to autocomplete searches. But I also revamped the UI and removed it from the search bar. Here's how it was before:

![](/wp-content/uploads/2024/09/Screenshot-2024-09-02-at-11.31.31 PM.png)

And now I've made it into a modal with autocomplete using the above mentioned Trie.

![](/wp-content/uploads/2024/09/Screenshot-2024-09-02-at-11.53.12 PM-1024x325.png)

It even suggests random options if it can't figure out what you might want to look for.

![](/wp-content/uploads/2024/09/Screenshot-2024-09-02-at-11.54.08 PM-1024x199.png)

The Trie was actually not that hard to make once I understood the idea. What you do is basically you break down every word into its letters then you make a graph where each letter will point to the next one, then that to the following, etc. until you've mapped all words. So the word "dog" will start with a pointer to a node corresponding to the letter d, and that will point to a node with the letter o, then that will point to a node starting with g. Dock will share the first two nodes, but then the second node (corresponding to o) will point to the node corresponding with c and that to the one corresponding with k.

Thus, if you have the prefix do, then it will potentially point at dog or dock as possible options. I added weights to my Trie to make the suggestions that were more common show up more. As in, if I mention the word "Rust" a lot then it would have a higher weight than "distracted", which I only use once.

Here's the code for the Trie from lookup data (generated [here](https://github.com/benyakirten/benyakir-writes/blob/main/gatsby-node.js#L435)):

## Changing Cards and Filters

Let's look at the old system for pagination, filtering and cards.

![](/wp-content/uploads/2024/09/Screenshot-2024-09-02-at-11.31.40 PM-1024x431.png)

The filters occupy the top part of the screen, do not scroll, and are fairly large. You have controls over the items per page and the page, but they too are large and fairly unnecessary. The cards are fine, I guess, a bit ugly since I wasn't too worried about making them look nice on dark mode. In fact, I was getting tired of making the blog by the end. I had run out of ideas, and I just wanted it to be done.

Let's take a look at the new design.

![](/wp-content/uploads/2024/09/Screenshot-2024-09-03-at-12.26.01 AM-1024x356.png)

The first thing I want to point out is the user of horizontal space in the cards. The most relevant category for a blog past and its tags are sharing vertical space. I use -webkit-line-clamp to prevent overflow of text rather than using a monospace font and guessing about how much content I should have per line.

As for the filters, you can see them in the top right. You can no longer specify the amount of items per page, but it made it much easier to fit it into a space that explained the purpose of what it was.

You create filters of different types. For example, you can choose the tag or category for a blog post or the technology that's used. And all of these (other than publish date) can be customized to require all items present (such as having Vue and Web Sockets) or any (such anything with Rust or React). You add additional filters as need be, rather than enforcing all filters be present.

A lot of effort went into figuring out how the data would be presented, adding little animations, and trying to modernize the older ideas I had but were underbaked and/or not well done.

As for the more technical side, hoo boy was it an adventure. I had previously set up filtering so that it was a bunch of separate state variables for the filters with one effect that listened to them all then updated the output cards. If you've used React, you know that effects shouldn't be used this way. I had to completely remove the old system then create a system where all filters modify an object, subsequently triggering a function that caused the items to be filtered again. Those sorts of effects were all over the place, and I was so happy when I realized how easy it was if I didn't do so.

I blame every other SPA framework because, frankly, that's how they would do something (and much more intuitively). You would have a watcher or computed property in Vue, in Svelte you'd have a reactive property, Angular would have observables, and Solid would have signals. But I learned and upped my game by a lot.

## Getting Fonts to Load

I discovered at a certain point that my fonts weren't loading. I had previously had a system where all the necessary tags in the HTML head were loaded in the [Layout component](https://github.com/benyakirten/benyakir-writes/blob/d93179881a9f5713d17ad53bc557523e4af2fc9b/src/components/Layout/Layout.component.tsx#L19), which surrounded all pages you visited. However, I noticed now that none of my fonts were loading correctly. So what did I have to do? That's right, I had to make every page have the script tags in them, using a [base component](https://github.com/benyakirten/benyakir-writes/blob/main/src/components/SEO/HeadBase.component.tsx). But I have to say, it looks much better with my custom fonts. Fixing this was the tipping point to realizing I could make my blog look good.

## Modernizing Theming

My original idea was that, as a final step, I would redo the day and night theme then wash my hands of it. But I looked at the theme customization page and realized it had some cool ideas that needed just a little bit of work to get right.

As before, let's look at the old system:

![](/wp-content/uploads/2024/09/Screenshot-2024-09-03-at-12.37.10 AM-1024x339.png)

All the controls to the right are drag-and-drop. And the buttons on an individual theme let you do effectively the same thing, just without the hassle of drag-and-drop. By the way, drag-and-drop usually kinda sucks. Both because it's cumbersome and unforgiving but also because it doesn't work great on anything except desktop and wider touch screens (such as tablets).

You could choose a theme and customize it:

![](/wp-content/uploads/2024/09/Screenshot-2024-09-03-at-12.37.02 AM-1024x506.png)

Each section shows the colors you can change and how. It works fine, but it doesn't use any of the horizontal space. Just look at how empty it is.

And here it is under the redesign:

![](/wp-content/uploads/2024/09/Screenshot-2024-09-03-at-12.40.26 AM-1024x545.png)

You'll notice that there isn't any more drag and drop. What each button does is clearly labeled. And the horizontal space is used better (under the settings area, you can create more themes with the copy button, and the will take up as much vertical space as is allowed).

Beside that, I did a bunch of technical changes. You no longer have a preferred theme (I don't know exactly what that was), I fixed a bunch of bugs and I added a versioning system to the themes (stored in local storage). It worked out great.

As for the actual colors, I changed from a RGB system to HSL. HSL allows you to stay within one color but moderately change properties like how rich the color is and how bright. The one complication with this, however, is that color pickers (seen in the Modify Theme section above) only work with RGB hexes. So what happens is that the value for a color is converted from HSL to RGB for those inputs. And whenever the inputs change, the value is recalculated to HSL.

I really like HSL. I'm sure there are better systems out there. If you're a frontend dev, I highly suggest you try it out instead of RGB.

## Fixing the Block Identification System

Most of WordPress content is stored as a string of simple HTML elements such as paragraphs or headers, such as this:

MIGRATION\_CODE\_BLOCK\_0

You can use the React's dangerouslySetInnerHTML property to just put this data in a div, which solves most problems (you can [style elements inside of that div](https://github.com/benyakirten/benyakir-writes/blob/main/src/styles/general-components.ts#L167)). However, I had the idea of creating the syntax highlighter above. And that can't be easily translated into basic elements. So instead I identify a certain block and render it with a special React component. Just to let you see the true horror of the situation, this is what will be spat at you by WordPress:

MIGRATION\_CODE\_BLOCK\_1

If you have experience with HTML, sure, whatever, it kinda works. But this is one giant string, and I need to extract everything from the div with the class of benyakir-syntax-highlighter to its end. Then its interior pre element's content is the JSON-serialized data I need.

My original solution in 2021 was to use [string splitting](https://github.com/benyakirten/benyakir-writes/blob/d93179881a9f5713d17ad53bc557523e4af2fc9b/src/utils/blocks/identify-blocks.tsx). However, I had the brilliant idea of using the [DOMParser API](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser). It worked great. And you know what's coming: a but. But the page had to be rendered in Node, and Node doesn't have access to web APIs. So I thought, why not using something like JSDom? But that cannot be used because it would also load client-side. And JSDom can't be loaded by the browser.

After trying out a few libraries and getting frustrated, I decided I'd had enough. I wrote my own [block parser](https://github.com/benyakirten/benyakir-writes/blob/main/src/utils/blocks/block-parser.ts), which parsed just the basic amount of information I needed. I was lazy so once I identify the correct block that needs to be separated, I get the information out by using [string splitting](https://github.com/benyakirten/benyakir-writes/blob/main/src/utils/blocks/identify-blocks.tsx#L8). I had previously started writing a parser for LaTeX in TypeScript so I used some of the knowledge I'd accumulated.
