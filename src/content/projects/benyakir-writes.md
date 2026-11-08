---
title: Benyakir Writes
slug: benyakir-writes
published: "2021-09-07"
firstReleased: "2021-09-07"
technologies:
  - ts
  - react
  - gql
hostedOn: Netlify
mainLink: https://benyakir-writes.com
repoLink: https://github.com/benyakirten/benyakir-writes
---

A GatsbyJS-powered frontend for my blog that uses TypeScript and Styled Components. The main emphasis on this site is accessibility and a better implementation of search/sort/filter functionality than can be done quickly and easily in WordPress (where my blog is hosted with lots of custom features).

The main purpose of this was to create a single-page application for my blog. The reasons why I used Gatsby over another service is 1. I wanted to get some experience with Gatsby since I had already learned Next decently (though no project for it yet), 2. It uses GraphQL and has an ready-made plugin for WordPress (so I don't have to mess with the Rest API). That's what I thought, at least, when I began. It's a bit more complicated than that. I had to add a few plugins and configure them on my WordPress installation (check out my Benyakir's Blog readme for the details).

Being powered by React makes it a lot easier to make everything feel like one large application. Which, obviously, both the WordPress side and the Gatsby side are, but, like, the sidebar persists which menus are open and stuff. Also, Gatsby has a great setup for static site generation, which is great. Also GatsbyImage and StaticImage are fantastic in general. Once upon a time, I wasn't a big fan of JAMStack, thinking of them as a cheap way to get around bad SEO for SPAs, but now I've grown to appreciate them, even though they're very opinionated.

This is my first foray into Styled Components, so I had fun with that. I thought I'd hate them, but I found them really easy to work with. I think my favorite CSS framework is Tailwind, but I think I'm going to now use Styled Components when I work in React. I would definitely like to have used them when I was working on Recovering Grandeur, so I'll probably use them in my next Vue project too.

What I'm most proud of is in utils/identify-blocks.tsx. So, if you didn't know, WordPress stores the escaped HTML of any post/page in the database. So when you're using Gatsby with a WordPress server, you have one of two options: 1. parse the blocks for their content and then compile it in whatever you want or 2. frequently use the dangerouslySetHtml property on a lot of blocks. I, being the person I am, used the second option because it is the one used on the gatsby-wordpress-source official plugin and because that's a lot of work, even if it's mostly serial paragraphs, headings and lists. And knowing myself, I would make a ton of errors, and it would take me a few months to get them all corrected. Look, I work on the frontend, mostly, and Node/Python for the backend. I'm not going to write my own HTML compiler.  

If you've studied the Syntax Highlighter custom block I made (hah, hah, no, I know you didn't), it is saved as a div with a special class that contains an invisible pre element with the information just written to it. What happens is that the blog post is made into a block, which is then looped through to detect divs with the special class. If they're detected, each block is aded to the loop in the correct order then searched for more divs. It could easily use recursion, but I did it with a for loop through an array whose length may grow.  

Page transitions use react-transition-group instead of the usual Gatsby page transition plugins. They weren't working for one reason or another. All pages for blog categories (other than none), blog posts, projects, short stories and books are dynamically (then statically) generated. so typical Gatsby fare.
