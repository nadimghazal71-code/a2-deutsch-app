# A2 Deutsch Trainer

A vocabulary trainer for the Goethe-Zertifikat A2 word list — 606 words with
their articles and Partizip II forms. Built while studying for the exam.

Two front-ends over the same word list:

- **Web** — plain HTML, CSS and JavaScript, no build step and no dependencies.
  Live at [ghazalcode.ch/projects/deutsch](https://ghazalcode.ch/projects/deutsch/).
- **Mobile** — React Native via Expo, in [`mobile/`](mobile), with an
  installable Android build.

## Features

- **Study mode** with a Leitner-style scheduler. Each word sits at a level 0–5;
  a correct answer promotes it, a mistake demotes it, and a word only
  reappears once its level's cooldown has passed — every lesson at level 0,
  every third at level 2, every tenth at level 4, and never again at level 5.
  Progress is kept in `localStorage` between sessions.
- **Flashcards** for quick review, outside the scheduler.
- Nouns are drilled with their article and verbs with their Partizip II, since
  that is where the marks are actually lost.

## Running the web version

Any static server will do; a small one is included:

```bash
node server.js
```

Then open http://localhost:5173.

## Running the mobile app

```bash
cd mobile
npm install
npx expo start
```

## Where the words live

[`vocab-data.js`](vocab-data.js) holds the whole list as a plain array, so
adding or correcting an entry needs no tooling. The word list follows the
Goethe-Institut A2 syllabus; the Institut's own PDF is not redistributed here.
