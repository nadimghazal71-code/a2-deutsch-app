# Deutsch Trainer — A1, A2 & B1

A vocabulary trainer for the Goethe-Zertifikat word lists. Three levels, each a
separate track with its own words and its own progress:

| Level | Words | Source |
| --- | --- | --- |
| **A1** | 760 | Start Deutsch 1 Wortliste |
| **A2** | 606 | Start Deutsch A2 Wortliste |
| **B1** | 1845 | Goethe-Zertifikat B1 Wortliste |

The published B1 list repeats a great deal of A1 and A2. Those repeats are
stripped out, so each level teaches only what is new at that level.

Built while studying for the exams.

Two front-ends:

- **Web** — plain HTML, CSS and JavaScript, no build step and no dependencies.
  Live at [ghazalcode.ch/projects/deutsch](https://ghazalcode.ch/projects/deutsch/).
- **Mobile** — React Native via Expo, in [`mobile/`](mobile). Same three levels,
  the same scheduler, and progress kept in AsyncStorage under the same keys.

## Features

- **Three levels, kept apart.** Pick A1, A2 or B1 on the home screen. Each keeps
  its own ratings, its own lesson counter and its own progress bar, so working
  through A1 never disturbs where you had got to in B1. The choice is
  remembered between visits.
- **A progress bar per level**, showing the whole list broken down by how well
  each word is known — grey for untouched through to green for mastered — plus
  the share of the level that is finished.
- **Study mode** with a Leitner-style scheduler. Each word sits at a level 0–5;
  a correct answer promotes it, a mistake demotes it, and a word only
  reappears once its level's cooldown has passed — every lesson at level 0,
  every third at level 2, every tenth at level 4, and never again at level 5.
  Progress is kept in `localStorage`.
- **Flashcards** for quick review, outside the scheduler. They carry their own
  level picker, so flicking through the other list does not change what Study
  is working on.
- Nouns are drilled with their article, A1 and B1 nouns also with their plural,
  and verbs with their Partizip II, since that is where the marks are actually
  lost.

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

[`vocab-a1.js`](vocab-a1.js), [`vocab-a2.js`](vocab-a2.js) and
[`vocab-b1.js`](vocab-b1.js) hold each list as a plain array, so correcting an
entry needs no tooling. All three use the same shape:

```js
{ id, word, note, artikel, type, english, partizipII }
```

`id` is the array index, and `note` carries either a plural form (`Pl. -en`) or
a short disambiguator when the same headword appears twice.

The A1 and B1 lists were extracted from the official Goethe-Institut word
lists. Word classes that the source does not state — whether a word is an
adverb or an adjective, say — were derived from closed-class word lists and
then reviewed by hand; a handful of corrections live in the generator's
override table. Plurals written in the source as `-Ä` (meaning "add an
umlaut") are spelled out, so `der Apfel, -Ä` becomes `der Apfel (Pl. Äpfel)`.

B1 is additionally filtered against A1 and A2. The published B1 Wortliste
restates a little over a thousand words already covered at the lower levels;
those are dropped, so B1 holds only what it adds.

No Institut PDF is redistributed here.

## Keeping the two front-ends in step

The web app loads its word lists as plain `<script>` tags defining globals,
which Metro cannot consume, so the mobile copy is generated rather than
maintained by hand:

```bash
node tools/build-mobile-vocab.mjs
```

Run it after editing either list. It rewrites `mobile/src/vocabData.js` and
checks that every entry's `id` still equals its index, which both apps rely on.

## Adding a level

`LEVELS` at the top of [`app.js`](app.js) is the whole registry: a label, a
word list and a `localStorage` key. Add a third entry and it appears on the
home screen with its own progress, no other changes needed.
