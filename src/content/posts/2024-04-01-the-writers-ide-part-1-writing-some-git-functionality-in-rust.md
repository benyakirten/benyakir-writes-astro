---
title: "The Writer's IDE, Part 1: Writing some Git functionality in Rust."
slug: the-writers-ide-part-1-writing-some-git-functionality-in-rust
published: "2024-04-01"
categories:
  - Ben's Blogs
  - Ben's Thoughts
tags:
  - bit
  - blob
  - git
  - ide
  - javascript
  - packfile
  - rust
  - sha1
  - ui
  - vcs
  - version control
  - writing
  - zlib
  - bitwise
---

## Table of Contents

1.  [The Larger Projec](#the-larger-project)t
2.  [The Scope](#the-scope)
3.  [Objects in Git](#objects-in-git)
4.  [Packfiles](#packfiles)
5.  [Next Steps](#next-steps)

## The Larger Project

I had an epiphany while working on other things: I miss writing. But every time I write, I don't have the tools I am used to don't exist. Programming is colorful, but writing, the free expression of my wit (my ability to write is tangential) is not. I mean, look at this:

Yeah, not the most complicated function, but you get the point. And if you use a library, you can look at references. So here's my bright idea: What if you could have that but for writing? Syntax highlighting could be for various keywords, character names, setting names, etc. If you wanted to look at a specific highlighted word, you could see a web of relationships, settings or such.

There are four important features of this project, and they are:

1.  A UI
2.  An app that allows plugins/extensions/themes
3.  A format to write text that can easily be turned into epub/pdf/etc.
4.  Version control

For #1, I plan on working in Svelte. For #2, I plan on creating a [Tauri desktop app](https://tauri.app), for #3, I address that in [Next Steps](#next-steps), and #4 is the topic of this post.

## The Scope

After you get through the initial steps of learning to code and start to work on projects, you want to make sure you don't accidentally delete what you're working on. When you write, you typically write only one file, but in programming, I have never written something that didn't have at least a dozen files. Even my [simplest project](https://github.com/benyakirten/translation-website) has more than a dozen files. Some are quite small, but that's irrelevant because each serves a purpose.

How I do version control when writing is I finish a draft, copy it, rename it to something like `Book - draft 2`. That's fine with one file, and what you could do with multiple files is create a zip of the folder, easy peasy. Okay, sure, but what if I accidentally delete a paragraph, save the file, then come back the next day and forgot what I was doing? Well, what if we kept track of changes?

And you know what would be cool? What if I wrote a story without its final chapter and had my friends each try to write a different ending? Or what if I was working with an editor and wanted to see how they changed the things without looking at comments? They could just change the text, and I could compare it side-by-side with what I'd already written.

Programmers have already solved this using versions control systems. The most popular is [Git](https://git-scm.com), which has so many wonderful things I use daily that I want to include in this project. It stores all the files in a compressed format as objects in a repository (their terms). It uses refs to track which version of the documents you're looking at. But I thought: it's a command-line tool and I cannot incorporate it into my app. Plus, Tauri is in Rust, so I need to get some practice anyway. I want to have the following features:

1.  Store versions in a compact format that can easily be switched to, displayed, stored and downloaded from an outside source easily.
2.  I hold onto the current final version then have a separate version with changes. Once I've decided that they're what I want to be in the final version, I add them in.
3.  Be able to compare versions easily.
4.  Look back in history.

Git has a lot more features, but I wouldn't need most of them. That was my scope, to investigate these features and implement them. I started off by googling how git works, and pretty soon I found [Codecrafters](https://codecrafters.io), which has tutorial for learning how to build your own Git. I finished the tutorial then added a few tweaks. Then as I was getting ready to work on the additional features, I found out that there's already [Rust bindings for Git](https://github.com/rust-lang/git2-rs). In other words, all the work has been done for me already. But it was quite a learning experience! And I had fun, other than the times where I wasn't getting frustrated.

## Objects in Git

The most important thing in Git is the object. When you create a file and add it to your git repository, what happens is that it's being encoded in Zlib, then a SHA1 hash is created of the data, which is a 20-byte signature represented in hexadecimal. Basically it's 40 letters with a value of 0-9 or a-f. This process is straightforward.

As an aside: You may be wondering why it's 40 letters but only 20 bytes. It's because a number 0-255 is one byte, and there are twenty of those. Any number 0-255 can be neatly displayed as two hexadecimal characters. The computer stores each of those characters separately if we want to display the value instead of just store it in a computer.

For normal files, this is easy: you have the contents. So you just encode that with Zlib then get the hash. But Git also needs to store three other types of data: 1. trees, which represents a folder and all the files in it, 2. commits, which point to a tree that represents a specific version and 3. tags, which are like commits but with specific data attached to it. These are all more complicated... Well, only trees are decently complicated (I didn't get to making my own tags, but I assume they're not that complicated).

Let's start with trees. A tree points to a group of objects, including possibly other trees. This mirrors how your computer stores files: a folder can contain other files or other folders. And those folders have the same, creating what is called a recursive structure. So how do we store this data in an object? Well, good thing you asked. First, let me tell you about null terminators.

Working with multiple letters in a computer gets complicated fast. Since a computer can only know 1s and 0s, you have to decide how a character is getting stored. Long story short, in English a letter is stored as a number from 0 to 255, called a byte. English does not have 255 different letters. We have 26 lower case letters, 26 upper case, then 10 numbers (0-9). There are some symbols, but we come up short of 255. The remaining symbols are used to [store other symbols](https://www.utf8-chartable.de). The first twenty numbers are used for various beep-boop computer things, and the rest of the English alphabet fit in the next 50 or so numbers. So when you see the word `"hello"`, what your computer sees is actually `[68, 65, 6c, 6c, 6f]`. A quick explanation: a number between 0-255 can be written conveniently in two hexadecimal numbers.

In the future I will be calling a single letter a character and a series of letters (such as "hello") a string. You can see that we need to store a group of numbers, which we do so using what's known as an array. In the most [prolific programming language, C](https://en.wikipedia.org/wiki/C_\(programming_language\)), the way that you know that a string has ended is through the null terminator, which is just the number `0`. The word "hello" is actually stored as `[68, 65, 6c, 6c, 6f, 0]`. And Git was written in C.

All objects have a header attached to the body that's encoded in Zlib, it reads `<filetype> <size>\0` (`\0` here representing the null byte, the file type being one of blob, tree, commit or hash). Then the body is a series of files displayed in the following way: `<mode> <name>\0<hash>`. The mode is a numeric code for the file type, the file name is exactly what you think it is, and the hash is exactly 20 bytes representing the SHA1 hash as described above. The one complication from this is that there is no separator between the hash of the current file and the mode of the next file. The one saving grace is that the hash will always be exactly 20-bytes long.

A commit is fairly simple. It's just a file that says what tree is the top level for your files and who is responsible for it along with some other data. For example, I sign my commits so cryptography guarantees that I have written it and no one else can pretend to be me. How Git is organized is a commit doesn't actually represent where you are right now. It's more of a checkpoint. Then you have something called a ref that points at a specific commit to say "that's where we are right now". A commit is fairly simple: it's just the SHA1 hash of a specific commit. It may seem like an unnecessary of complication, but there are reasons. And no, I will not get into them here.

It took me more suffering than I would like to admit to get to this point. Now I'm able to store But it was nowhere near the headaches packfiles caused.

## Packfiles

So now we have everything to store the files locally, organize them into checkpoints and organize those checkpoints into versions. Now we need to be able to store them somewhere and then download them. Git has created a process for this, where the server (who holds the files) communicates with the client (you) and figures out which files need to be downloaded. The client finds out what out refs it can request, then it can request any number of them. My project only downloads one, what is called the "head", the last complete state of the files (you who write the files decide what this is). The process of negotiating which files to download is a bit tedious but not too complicated. I don't want to get in it here, but it involves a lot of protocol. Imagine you are talking on a walkie-talkie with your friend, but your friend insists that a message should start with the words "I AM FEELING SNARKY" and must end with "OVER".

Once you've gotten past that stage, you receive the packfile. You might think it would just be a list of files and their contents. For various reasons, beside receiving blobs, trees, commits or tags, you can also receive offset deltas and ref deltas.

Both of the deltas are a set of instructions that point to another file (the way they do it is different) and say "you will construct my file based off of that one with some modifications". You start with an empty file then add parts in from the other file. The instructions are either a copy instruction or an insert instruction. A copy instruction tells you to copy something from the original file to the end of the file, while an insert instruction tells you to insert a certain mount of arbitrary text.

Let's imagine I have a file `hello.txt`, which contains the text `Hello you!`. Let's imagine I have these instructions:

1.  Copy position 0 to 4 from the original file to the new file. Currently `Hello`.
2.  Insert `, world.` We have arrived at: `Hello, world`

The hard part isn't doing this in theory, it's the stupid intricacy of the whole thing. I recently wrote the solution and then backwards engineered it, but I may be wrong in what I'm about the say.

The packfile starts with some metadata. First it starts with four letters: "PACK". Then its version number, either 2 or 3 (encoded in 4 bytes for whatever reason) then the number of objects (also 4 bytes, so it can be up to 4 billion). Then it contains a list of objects, which can be the actual objects or deltas.

To determine this, you need to read the next byte, which, if you didn't know, consists of 8 switches that can be 0 or 1. A bit might look like this: `11000011`. I find it easier to parse like this: `0b1100_0011`. The leading `0b` identifies it as binary data (`0x` is hexadecimal, for example). The underscore just makes it a little easier to parse since I find 8 numbers in a row harder to read (just like 1,000,000 is easier to read than 1000000).

The type of object is stored along with the size in what's called a variable length integer (varint). Long story short, instead of every 1 and 0 in those first eight mattering, the first bit indicates whether more bits are needed to encode the number (1 means more, 0 means we're done). This is called the most significant bit (MSB). Therefore `0b1000_1010` indicates that the following byte is needed to encode the number. If we look to the next, we may have `0b1000_1010 0010_0000`, which means the number you care about is actually `0b1010_0010_0000`, which is the number 2592 if you convert it from binary. If the first number continues being 1, then the number can be however long we want (realistically, you will limit how many bytes can be used to determine your number).

After we've grabbed as many bytes as we need, we need to look at the first 3 bits after the MSB. 3 bits can be a number between 0 and 7. That works for us: 1-4 are blob, tree, commit, tag, 6 is offset delta and 7 is ref delta. We only need 6 (and in fact, 5 isn't used).

Once we have the type and size, things are great... if we don't have a delta. We just get the next lib-encoded section of data (we don't need to know the size since zlib will only decode as far as we have zlib data). Oh, every time you read zlib data and it's not the end of the file? You have to figure out how far you've read and add it. Just a little thing you have to figure out while you're working on this. Anyway, you're all done! Except deltas.

A ref delta is pretty easy. The next 20 bytes is the hash. So you just have to look at the hashes of the objects you've already decoded (you were holding onto those, of course) and find the one with that hash. That's your starting point.

An offset delta is a little more complicated. You decode the next varint, and this gives you the offset. But it's actually a negative offset. What it means is that many bytes previously in the file you received is the beginning of the file you should care about. What I did is, instead of calculating what file was at the current position minus the offset, was storing a list of starting points for files and just trying to match them. I don't know if it's less efficient, but it certainly made my life easier.

I need you to feel the pain I felt, so I want to write about how copy/insert instructions are parsed. For both instructions, you read the next zlib encoded data. Then you have two varints: the source length and the final length. The source length seems to correspond to the encoded data's length. I didn't really need it so I stopped caring because I was getting tired of all the tedium. The final length was something I could use to pre-allocate the space needed for the buffer.

It took quite awhile of reading the documentation and running into errors to figure this out, by the way. Every step of the process was a process of trial and error.

To figure out whether you have a copy or insert instruction, you need to read the next byte. A copy instruction has the most significant byte as 1, while an insert instruction will have it as 0.

An insert instruction is extremely easy. The last 7 bits of the byte will be how many more bytes you need to read then add to the end of the file. So therefore `0b0111_1111` means the next 127 bytes from the data needs to be appended to the file.

A copy instruction's first byte is terrible. The last 7 bits of the byte tells you which bytes are included in figuring out the offset in the original size and how much data to copy. [The documentation](https://github.com/git/git/blob/795ea8776befc95ea2becd8020c7a284677b4161/Documentation/gitformat-pack.txt#L130) says that the first 4 bits will be used to determine the offset and the last 3 for the size. But it's actually the first 3 bits for the size and last 4 bits for the offset because, they don't tell you this, but it's little-endian encoded.

Therefore if we have a byte that looks like this: `0b1011_1101`, the first bit means that it's a copy instruction, then `011` indicates bytes that correspond with the size (I'll explain this in a second), then `1011` with the offset. Now, to determine how this works is a joy.

The size is always encoded in 24 bits, which means that the number can be anywhere up to 16 million. The offset is 32 bits, which means it's up to 2 billion. However, the 0s and 1s dictate how many of those bytes will be declared. A 0 indicates that all the bits are 0s so that data is not actually sent.

Looking at the size, we have `011`, which means that the next two bytes should be read and those values used to construct the integer. Let's imagine the next two bytes are: `0b0110_1101 0b0001_1110`. that means the final value is actually `0b0000_0000 0b0110_1101 0b0001_1110`. Since the first 9 bits are all 0s, they are ignored. The final value is 27934.

Looking at the offset, let's imagine the next three bytes read are `0b0010_1011 0b1111_1001 0b0001_0001`. These three bytes correspond to bytes 1, 2 and 4 of the 32-bit integer (4 bytes). Therefore, the final value will be `0b0010_1011 0b1111_10001 0b0000_0000 0b0001_0001` 737738769. You can see that byte 3 is all zeroes, which is why it's not included.

Now that we have these numbers, we go to position 737738769 in the original file and copy the next 27934 bytes. I have never had a file that was nearly this large, but it was for demonstrative purposes.

This was such a headache to figure all out. But I did it. I learned a lot about bitwise operations, which you never use in JavaScript. I am grateful to find out how bit shifting, how bitwise and is used for masking, and how bitwise or is used for adding leftover bits.

## Next Steps

There are three major things I would like to do in this project that I haven't done yet:

1.  Add better documentation/comments.
2.  Add some asynchronous processing to downloading/parsing packfiles (and maybe for writing tree files, since it should be possible to do that in parallel).
3.  Improve the code in general and see if traits/macros fit in anywhere.

But I need to think a bit before working on 1/3, and I need to do some research for 2. However, that's probably what's not up next (at least for now).

Looking into the future, my next step on the project is working on how text is stored. would need to save the text in a particular formatting that allows markup such as headings, block quotes, images, etc. I had not thought about it a lot but assumed I would need to invent my own system. A former colleague suggested something that would work perfectly: [Latex](https://www.latex-project.org). The greatest part of it is that it's not proprietary, it would allow interoperability between different systems (for example, [Pandoc](https://pandoc.org) can create ebooks or Word documents from it), and there are a lot of plugins/work created for it already. I happened to do a little bit of research and found [Overleaf](https://github.com/overleaf/overleaf), which allows users to translate between markup (how it's displayed) and Latex fairly easily.

However, before we move onto that, I want to beef up my abilities with UI/UX. I'm very good with JavaScript and TypeScript. However, what I've always kinda winged is the layout of a webpage. I want to get better at that, and the best way to do that is investing time. I've started reading books, and I am going to spend a lot of time reworking this blog to have better UI/UX. I'll talk about that more in an upcoming blog post.
