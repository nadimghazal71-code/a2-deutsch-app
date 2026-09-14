import AsyncStorage from '@react-native-async-storage/async-storage';

import { VOCAB_A1, VOCAB_A2, VOCAB_B1 } from './vocabData';

/**
 * The scheduler and progress rules, kept deliberately identical to the web
 * app's app.js. Every function here is pure apart from the two that touch
 * AsyncStorage, so screens can call them freely during render.
 */

// ---------- Levels ----------
// Each level is a separate track: its own words, its own progress store. The
// keys match the web app's, so a browser and a phone describe progress the
// same way even though they do not share storage.
export const LEVELS = {
  A1: { id: 'A1', label: 'A1', name: 'Start Deutsch 1', words: VOCAB_A1, storageKey: 'a1vocab_progress_v1' },
  A2: { id: 'A2', label: 'A2', name: 'Start Deutsch A2', words: VOCAB_A2, storageKey: 'a2vocab_progress_v1' },
  B1: { id: 'B1', label: 'B1', name: 'Zertifikat Deutsch B1', words: VOCAB_B1, storageKey: 'b1vocab_progress_v1' },
};

export const LEVEL_ORDER = ['A1', 'A2', 'B1'];
const ACTIVE_LEVEL_KEY = 'deutsch_active_level_v1';

export function wordsOf(levelId) {
  return LEVELS[levelId].words;
}

// ---------- Storage ----------
/** Reads every level's progress in one go, plus the level last selected. */
export async function loadProgress() {
  const keys = LEVEL_ORDER.map(id => LEVELS[id].storageKey).concat(ACTIVE_LEVEL_KEY);
  let pairs = [];
  try {
    pairs = await AsyncStorage.multiGet(keys);
  } catch (e) {
    // A read failure must not block the app; start empty rather than crash.
    pairs = [];
  }
  const raw = Object.fromEntries(pairs);

  const byLevel = {};
  LEVEL_ORDER.forEach(id => {
    try {
      byLevel[id] = JSON.parse(raw[LEVELS[id].storageKey]) || {};
    } catch (e) {
      byLevel[id] = {};
    }
  });

  const stored = raw[ACTIVE_LEVEL_KEY];
  return { byLevel, activeLevel: LEVELS[stored] ? stored : 'A1' };
}

export function saveLevelProgress(levelId, levelProgress) {
  return AsyncStorage.setItem(LEVELS[levelId].storageKey, JSON.stringify(levelProgress)).catch(() => {});
}

export function saveActiveLevel(levelId) {
  return AsyncStorage.setItem(ACTIVE_LEVEL_KEY, levelId).catch(() => {});
}

// ---------- Progress ----------
export function getLevel(levelProgress, id) {
  return (levelProgress[id] && levelProgress[id].level) || 0;
}

/** Returns a new progress object; callers persist it and set it as state. */
export function withRating(levelProgress, id, level, currentLesson) {
  const entry = levelProgress[id] || { level: 0, timesSeen: 0 };
  return {
    ...levelProgress,
    [id]: {
      ...entry,
      level,
      timesSeen: (entry.timesSeen || 0) + 1,
      lastSeen: Date.now(),
      lastSeenLesson: currentLesson,
    },
  };
}

// How many Study "lessons" must pass before a word at a given level becomes
// eligible again. Index = level. Level 5 has no entry: mastered words retire.
const LEVEL_INTERVAL = [1, 1, 3, 5, 10];

export function getLessonCount(levelProgress) {
  return (levelProgress.__meta && levelProgress.__meta.lessonCount) || 0;
}

/** Returns a new progress object with the lesson counter advanced by one. */
export function withBumpedLesson(levelProgress) {
  const meta = levelProgress.__meta || { lessonCount: 0 };
  return { ...levelProgress, __meta: { ...meta, lessonCount: meta.lessonCount + 1 } };
}

function isEligible(levelProgress, id, currentLesson) {
  const entry = levelProgress[id];
  const level = entry ? entry.level : 0;
  if (level >= 5) return false;
  if (!entry || entry.lastSeenLesson == null) return true;
  return currentLesson - entry.lastSeenLesson >= LEVEL_INTERVAL[level];
}

/** Level 0-5 tallies across a whole word list. */
export function levelCounts(levelId, levelProgress) {
  const counts = [0, 0, 0, 0, 0, 0];
  wordsOf(levelId).forEach(e => {
    counts[getLevel(levelProgress, e.id)] += 1;
  });
  return counts;
}

// ---------- Ordering ----------
// A headword can be written with optional parts - "(sich) anmelden",
// "(ein)hundert" - which belong under A and H, not bunched at the front of the
// alphabet. Sorting ignores them, the way a dictionary would.
export function sortKey(word) {
  const stripped = word.replace(/\([^)]*\)/g, '').replace(/^[^A-Za-zÄÖÜäöüß]+/, '').trim();
  return stripped || word;
}

export function byAlphabet(a, b) {
  return sortKey(a).localeCompare(sortKey(b), 'de');
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Study selection ----------
export function buildStudyWordList(levelId, levelProgress, n, currentLesson) {
  // Walk the vocabulary A -> Z. A word only counts if it's "due": not mastered,
  // and its level's cooldown has elapsed since it was last rated. Early
  // sessions are therefore dominated by A-words, drifting further into the
  // alphabet as earlier words become due less often.
  const alphabetical = wordsOf(levelId).slice().sort((a, b) => byAlphabet(a.word, b.word));

  const selected = new Set();
  function addUpTo(predicate) {
    for (const e of alphabetical) {
      if (selected.size >= n) break;
      if (!selected.has(e.id) && predicate(e)) selected.add(e.id);
    }
  }

  addUpTo(e => isEligible(levelProgress, e.id, currentLesson)); // 1) actually due
  addUpTo(e => getLevel(levelProgress, e.id) < 5);              // 2) ignore cooldown rather than cut the session short
  addUpTo(() => true);                                          // 3) everything is mastered - review anyway

  return alphabetical.filter(e => selected.has(e.id)).map(e => e.id);
}

export function buildFlashWordList(levelId, order) {
  const list = wordsOf(levelId);
  const ids = list.map(e => e.id);
  return order === 'shuffle' ? shuffle(ids) : ids.slice().sort((a, b) => byAlphabet(list[a].word, list[b].word));
}

// ---------- Display and answer checking ----------
export function germanDisplay(e) {
  const art = e.artikel ? `${e.artikel} ` : '';
  const note = e.note ? ` (${e.note})` : '';
  return art + e.word + note;
}

export function englishDisplay(e) {
  return e.english;
}

function foldUmlauts(s) {
  return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/^(der|die|das)\s+/, '')
    .replace(/^to\s+/, '')
    .replace(/[.,;:!?]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function isCorrectAnswer(typed, alternatives) {
  const t = normalize(typed);
  if (!t) return false;
  const tFolded = foldUmlauts(t);
  return alternatives.some(a => {
    const an = normalize(a);
    return an === t || foldUmlauts(an) === tFolded;
  });
}

/** The accepted spellings for a card, given which way round it is being asked. */
export function answersFor(entry, direction) {
  const source = direction === 'en-de' ? entry.word : entry.english;
  return source.split('/').map(s => s.trim());
}
