# Learning TypeScript

This project (both `server/` and `client/`) is written entirely in
TypeScript. Notes and resources for getting familiar with the language.

## Editor

**Visual Studio Code** (not to be confused with the full Visual Studio IDE)
is the standard editor for TypeScript/Node/React work, and is built by the
same team that maintains TypeScript itself. The full Visual Studio IDE can
technically handle TypeScript via its Node.js development workload, but
VS Code is the natural fit for this stack.

## Prerequisite: JavaScript

TypeScript isn't a separate language - it's JavaScript with a type system
layered on top. Every `.ts` file compiles down to plain JavaScript, so the
actual logic (loops, functions, how objects/arrays behave, async code) is
JavaScript. TypeScript just adds type annotations and catches mistakes
before you run the code. Learn JavaScript fundamentals first; TypeScript on
top is a fairly short hop once those feel comfortable.

Core JavaScript to learn, roughly in order:
1. Variables (`let`/`const`), basic types, operators, conditionals, loops
2. Functions - regular and arrow functions (`() => {}`), parameters,
   return values
3. Objects and arrays, plus destructuring (`const { name } = obj`)
4. Array methods you'll see constantly: `.map()`, `.filter()`, `.find()`,
   `.reduce()`
5. Modules - `import`/`export` (this project uses these everywhere)
6. Async code - `Promise`, `async`/`await`, and `fetch()` (the app's
   `api.ts` is built entirely on this)

**Starting website**: [javascript.info](https://javascript.info/) - "The
Modern JavaScript Tutorial." Structured like a real course (unlike most
reference sites), goes from absolute basics through advanced topics in a
logical progression, free. Once you're past the basics, keep
[MDN's JavaScript docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
open as your reference - it's the resource professional developers
actually use day to day.

One extra layer specific to this project: the `client/` side also uses
**React** (components, JSX, props, state via `useState`) on top of JS+TS.
Get comfortable with JS first, TS second, and treat React as a third,
separate thing to pick up once those two feel natural - trying to learn
all three at once is where people usually get lost, since it's hard to
tell whether an error is a JS mistake, a type mistake, or a React mistake.

## Free TypeScript resources, roughly in the order to work through them

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) -
  the official docs, well-written. Start with the "TypeScript for JS
  Programmers" section if you already know JavaScript.
- [TypeScript Playground](https://www.typescriptlang.org/play) - type code
  and see the inferred types and compiled JS side-by-side. Good for
  building intuition.
- [Total TypeScript](https://www.totaltypescript.com/) by Matt Pocock -
  free tutorials plus a well-regarded paid track; especially good once
  you're past the basics and want to get comfortable with generics and
  inference.
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) by
  Basarat Ali Syed - free online book, thorough, a long-time community
  staple.

## Books

- **Effective TypeScript** by Dan Vanderkam (O'Reilly) - practical
  "here's the gotcha, here's the fix" format, well-regarded for
  intermediate developers.
- **Programming TypeScript** by Boris Cherny (O'Reilly) - broader
  ground-up coverage if you want a single comprehensive book.

## Learning against this codebase

Since there's a real project here already, reading the Handbook's basics
and then making small edits to files like `server/src/rules/lifepath-modules.ts`
or `client/src/pages/builder/PriorityBuilder/PriorityBuilder.tsx` and
letting the type errors guide you is a good way to learn - TypeScript's
error messages are usually a decent tutor once you know the basic
vocabulary (interfaces, unions, generics).
