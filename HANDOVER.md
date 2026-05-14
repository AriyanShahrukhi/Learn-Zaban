# Learn Dari Full-Stack Website Handover

## Project

This project is a dependency-free full-stack Node website for learning beginner Dari.

Local URL while running:

```txt
http://127.0.0.1:3000
```

## What Was Built

- A Node HTTP server in `server.mjs`
- Static frontend files in `public/`
- Progress persistence in `data/progress.json`
- A lesson API at `/api/lessons`
- A quiz API at `/api/quiz`
- Progress APIs at `/api/progress`, `/api/progress/lesson`, and `/api/progress/quiz`
- A responsive learning UI with:
  - Dashboard
  - Lessons
  - Practice quiz
  - Searchable phrasebook
  - Category filters

## Current Content

The course now includes:

- 15 lesson groups
- 187 Dari words and phrases
- 14 categories
- Transliteration
- English meanings
- Usage notes on selected entries

Main categories include:

- Script
- Greetings
- People
- Learning
- Questions
- Numbers
- Food
- Travel
- Shopping
- Home
- Health
- Verbs
- Descriptions
- Conversation

## How To Run

From this folder:

```sh
node server.mjs
```

Then open:

```txt
http://127.0.0.1:3000
```

Note: `npm` was not available in the current environment, so the server was run directly with Node.

## Important Files

- `server.mjs`: backend server, lesson data, quiz generation, API routes
- `public/index.html`: page structure
- `public/styles.css`: visual design and responsive layout
- `public/app.js`: frontend state, rendering, quiz behavior, search/filter logic
- `data/progress.json`: saved lesson and quiz progress
- `package.json`: project metadata and start scripts

## Verification Completed

The app was tested with:

- Node syntax checks for `server.mjs`
- Node syntax checks for `public/app.js`
- API checks for lessons, quiz, and progress
- Browser checks that confirmed:
  - 15 lesson cards render
  - 187 phrasebook rows render
  - 15 filter chips render including All
  - Quiz answer options render
  - Food category filter works
  - Search works inside filtered results

## Good Next Improvements

- Add audio pronunciation for each phrase
- Add lesson difficulty levels beyond beginner
- Add spaced repetition review mode
- Add user accounts instead of local JSON progress
- Add editable admin screen for adding new Dari entries
- Add writing practice for right-to-left script
