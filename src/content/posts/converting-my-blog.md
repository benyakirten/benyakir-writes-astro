---
title: Converting My Blog
slug: converting-my-blog
published: "2026-11-08"
categories:
  - Ben's Thoughts
tags:
  - gatsby
  - cloudflare
  - bluehost
  - netlify
  - astro
  - llm
  - markdown
  - ai
  - ssg
  - gql
  - graphql
  - blog
  - PHP
  - React
  - agentic
  - vibe
  - coding
  - ux
  - lit
  - templating
---

## Table of Contents

- [What's Changed?](#whats-changed)
- [What I Needed to do](#what-i-needed-to-do)
- [But You Hate AI](#but-you-hate-ai)
- [How I Used AI](#how-i-used-ai)
- [My Opinion of AI](#my-opinion-of-ai)

## What's Changed

Dear avid readers of my blog,

There is a lot to catch up on since my last post. But I don't want to talk about that. Instead I'm going to be talking about how I rewrote my blog and changed my hosting provider.

I had a WordPress blog hosted on Bluehost. The cost was around $150 per year. I then had a Gatsby hosted on Netlify on the free plan. Initially, Netlify wouldn't cap spending limits so if I got a lot of traffic, the costs could explode. There were stories of people getting bills for tens of thosuands of dollars. Later on you could set it up so the site would just shut down if it reached enough traffic, but I never got around to enabling it. My blog gets like 100-200 visitors per month, most of which is probably bots. Either way, the Gatsby site would consume the WordPress blog through GQL then create a static site.

Now tbe situation is much simpler. I have one technology stack (Astro) hosted on CloudFlare. I no longer use the WordPress editor but just my IDE to write markdown files. It doesn't get laggier the bigger the blog post, I don't have to deal with constantly an editor that gets laggier the longer it gets, it's real easy to update technology/add new features to the blog, and I don't have to pay for expensive hosting or hosting whose bill could potentially skyrocket. Just to tell you, I would need about 10,000 visitors per day visitng all parts of my blog to get close to the limits of the free tier, so this was mostly onlt a possible scenario, not one that ever came close to happening.

But my dissatisfaction was more with the tech stack more than anything. Gatsby would frequently stop working, and it became quite difficult to untangle the dependencies and figure out why, and WordPress is known to be one of the biggest vectors for security problems. I have known since 2023 when I updated the blog's look and feel that I needed to do this. I had a general idea, and I made a mental plan. It went something like this:

- I hate PHP. The only place is looks to be a decent experience is inside of Laravel, but I don't want to touch it ever again (later I had to work on a WordPress site for a business, but that was a lot of lift and shift from jinja templates - ugh, I shouldn't want about this).
- I am only using a tiny sliver of WordPress capabilities, but I'm paying for the whole shebang.
- Astro looks cool. I was caught up in the hype in 2023, which has admittedly died down, but I never lost my desire to try it.
- I have a lot of blog posts, media and organization tied into WordPress.
- CloudFlare looks awesome with statically generated sites.

I knew the work would involve the following:

1. Download the WordPress database.
2. Download the media files (and yes, this is a separate step).
3. Create markdown files with corresponding content for every blog post with the correct references to the media that would look roughly the same when parsed.
4. Create a new repo with Astro where I would put this.
5. Transfer/translate the general site layout/functionality.
6. Set up Cloudflare.
7. Transfer the certificates/domains to Cloudflare, remove my old sites/accounts.

Most of these were trivial, but creating the markdown and transferring the tech stack to Astro was going to be a big deal. And that's why I didn't act for years - I always had bigger fish to fry, and I personally just didn't want to bother. So that's where I used AI.

## But You Hate AI

First things first, dear strawman: my take has always been a little bit more nuanced than that. I have always believed that machine learning is fantastic, but I've wanted it in the right contexts. I started using copilot for autocomplete in 2023, not long after it was offered. I thpught and still believe that AI has no place in any sort of artistic or personal expression. Yes, this includes my blog posts, which for now are 100% human written over more time than you would think. There is some programming (I'm talking writing code, not making architectural decisions) that is creative, but in my estimation something like 99% of it isn't.

I mocked vibe coders and I thought things like "agentic" workflows was bunk, not from insecurity or worrying over my job, mostly from an engineering perspective. I still probably would mock the majority of vibe coders who have no engineering experience trying to build apps from the ground up. With the latest tools, there are a lot more that are actually accomplishing what they want. As for agentic workflows, here's mine: I have a chat window with the agent. I usually start a conversation with either a short or long message. The short message is usually "fix X in Y code base" or "CI isn't passing", etc. Then there are long messages where I describe the problem, the current state of affairs and what I want to see accomplished. In this case, I usually start off asking for it to create a plan, that I actually read, find what I like and don't like, then I modify it. I usually make code, architectural and decisions based on preferences/my knowledge of what I'd like it to end up looking like. Then it implements the thing, I look at the code, ask for modifications, and I usually try to find ways to test everything independently of the agent. The idea is even if I miss some bizarre coding decision, I will make sure that the UX is what I expect. As a side note: I have stopped using autocomplete. I realized it actually was getting in my way and interrupting my thoughts.

You may be wondering when this transition happened. At work, people had been getting into it. Some got pretty good results, and some got okay results. What made me begin the transition was having to write a lit wrapper around Chart.js. I was going to write a blog post about Lit (I still plan to) and Go templs, but I was creating a UI library. If you've worked with HTML templates, you know that JavaScript becomes difficult and a liability. That's why we were pushing down complexity into the UI library where Lit would wrap any functionality inside of a web component.

Chart.js is largely clientside configuration inside of JavaScript. You will write something like:

```js
const chartDifferentInteractionMode = new Chart(ctx, {
  type: "line",
  data: data,
  options: {
    interaction: {
      // Overrides the global setting
      mode: "index",
    },
  },
});
```

And the `data` variable here will be some value that's defined in JavaScript. But what if we made the configuration into html so it was something like:

```html
<our-chart>
  <our-chart-config type="line"></our-chart-config>
  <our-chart-data>
    <our-chart-data-point x="1.5" , y="2.5"></our-chart-data-point>
  </our-chart-data>
</our-chart>
```

And you may say this looks like XML. Yeah, it kinda does, but it's HTML and works in the dom. But the biggest advantage is you can define what the chart looks like in markup instead of in JavaScript. If you come from a background of only using React or SPAs, needing to separate those two concepts may sound pretty stupid - but you've never used templating in a different language then! Congratulations on being a frontend dev who gets to make these architectural decisions.

Anyway, I figured out the API and way I wanted to shape the data. Then I kept finding more and more ways to configure your chart, more ways you want to display the data, etc. It was somewhat simple but very repetitive, and I decided that I could see if the agent was able to see the idea, take my description and goals, and produce good output. At work, I don't have to pay for the tokens, and we either had Opus 4.5 or Sol 5.6 at work. If it failed, whatever, I'd get back to the drudgery. If it worked, well, that meant I could slack off. There were tighter restrictions on token usage with Opus 4.5 so I decided I'd go with Sol 5.6.

If you've used either model, you know what I'm about to say. The output was good. It wasn't perfect and needed me to work on it a bit, but it was good enough that I'd have ascribed it to a smart intern/IC1. I kept up doing things by hand for a bit, but I found myself using it more and more. The output was good, and it did help me research/figure out some weird obscure standards (such as encoding form values with multiple possible values and figuring out some weird dropdown behavior when you have a tree). Then 6 Astra and Opus 5.5 came out. They are good enough at coding to do most things, and they're able to suggest ideas about architecture that someone that isn't specialized in an area would. Now I use them for almost all things with programming, at least for first passes. I review and criticize, and I use other LLMs to also do reviews. If it's in an area that I know well (frontend, databases) and not something I don't (SRE/DevOps), I can catch everything that stands out to me. It helps me with areas I don't know well, but I always have to be suspicious because sometimes it is quite a numbskull.

## How I Used AI

I was mostly interested in it doing the hard work of 3-5 was what I wanted it to do, mostly repetitive, detail-intensive work that I hated. I laid out what I wanted to do and what I wanted it to do. I wanted it to create a plan with 6.1 Sol that it would later execute with 6 Luna so that I could save money. It created the plan. I downloaded my WordPress database and the media files, showed it the styling/how searching was done, and I just said go and do it with 6 Luna. And if you've used Luna, you'll know exactly what happened: it got most of the core ideas (writing React components to use in Astro islands, for example), messed up a lot and made the UI look very different (I had told it I want to look/function identically). So I switched back to 6.1 Sol, nitted and picked everything, and that's where the appearance of the blog site. My plan throughout this was to not touch a single line of code and do everything by wasting tokens, boiling the oceans and incentivizing Kevin O'Leary and the other chuckleheads to make their disastrous AI datacenters.

Then came the domain transfers. This was an area that I have done fine in the past, but I wanted to see where it could go. It was relatively thorough and gave enough help when I asked for it that it covered almost everything. It did explain some new concepts (domain transferring instead of just certificates), and I learned.

## My Opinion of AI

Now that the dust has settled, I want to give you my opinions.

First off, the positives:

AI is now at a level that it's actually pretty useful on an engineering level. Before March, I had occasionally experimented with a workflow like this every few months, and it was never good enough. I tried to do some of this work using local models (Qwen3 27b), and they still aren't nearly as good as the frontier models. However, finally with 6 Astra/6.1 Sol/Opus 5.5, it can do a lot of the work. This makes me able to accomplish things that would have taken a week in a single afternoon, and it lets me multitask. In fact, while I was writing this blog post, I was having an agent work on the Writer's IDE which had been dormant for two years. Speaking of this post and what I just mentioned, I am finally getting work done on side projects I never would have done had it not been for AI. This would still be a Gatsby blog and one day just not work, then I would probably abandon it or take years to work up the willpower to do this work.

The negatives:

It's a massive diaster on every level where you don't necessarily have to pay attention. It still is a massive ethical problem where it consumes copyrighted work and reproduces things just like it. It has no respect for humans nor their creations. Supporting AI on a large scale will cause humongous environmental problems because of the datacenters. If you don't think this or know about them, this isn't the place to learn, but they are terrible and present. There's also the ethics of people being laid off for AI, which is absolute bullshit. There's a lack of hiring of juniors so there won't be people to replace me when the time comes.

Overall judgement:

I may be rare in this, but I like the workflow of AI so long as humans are present in the loop. I'm fine with no longer writing code by hand for the most part. The ethical problems of using AI outside of engineering or specialized use is too great to ignore. I know that sounds like a carve out for what I use it for, but here are the facts: it is a tool, and it has the potential to make everyone's life better. Just like any technology, it can be for good or evil, and it is stupid to ignore it. Before I became a programmer, I was using things like Grammarly for things like semantic analysis and writing criticism. I think that's where it belongs in those areas. However, I don't like how we're structuring society on it, how great a tradeoff we're making for it and how it's replacing human expression. We will need to live and deal with LLMs, but we must not destroy paradie to create paradise.
