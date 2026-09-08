import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Keyboard } from 'react-native';

import { colors, levelColors, radius } from '../theme';
import { Button, LevelChip } from '../components';
import {
  LEVELS,
  answersFor,
  englishDisplay,
  germanDisplay,
  getLevel,
  isCorrectAnswer,
  withRating,
  wordsOf,
} from '../logic';

const RATINGS = [
  { level: 1, label: 'gar nicht' },
  { level: 2, label: 'kaum' },
  { level: 3, label: 'teilweise' },
  { level: 4, label: 'gut' },
  { level: 5, label: 'perfekt' },
];

export default function SessionScreen({
  mode,
  levelId,
  direction,
  words,
  currentLesson,
  levelProgress,
  onProgressChange,
  onExit,
  onFinish,
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState(null); // 'correct' | 'incorrect' | null
  const sessionLevels = useRef({});

  const list = wordsOf(levelId);
  const entry = list[words[index]];
  const total = words.length;

  // The border colour reflects how well the word was known *before* this card
  // is rated, so it reads as "how I did last time".
  const priorLevel = useMemo(
    () => getLevel(levelProgress, entry.id),
    [levelProgress, entry.id],
  );

  function reveal(checkAnswer) {
    if (checkAnswer && typed.trim()) {
      setVerdict(isCorrectAnswer(typed, answersFor(entry, direction)) ? 'correct' : 'incorrect');
    } else {
      setVerdict(null);
    }
    Keyboard.dismiss();
    setRevealed(true);
  }

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setRevealed(false);
      setTyped('');
      setVerdict(null);
    } else if (mode === 'study') {
      onFinish(sessionLevels.current);
    } else {
      onExit();
    }
  }

  function rate(level) {
    sessionLevels.current = { ...sessionLevels.current, [entry.id]: level };
    onProgressChange(levelId, withRating(levelProgress, entry.id, level, currentLesson));
    next();
  }

  const front = direction === 'en-de' ? englishDisplay(entry) : germanDisplay(entry);
  const back = direction === 'en-de' ? germanDisplay(entry) : englishDisplay(entry);

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel="Zurück" style={s.back}>
          <Text style={s.backText}>←</Text>
        </Pressable>
        <View style={s.progress}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${(index / total) * 100}%` }]} />
          </View>
          <Text style={s.progressText}>{index + 1} / {total}</Text>
        </View>
        <LevelChip label={LEVELS[levelId].label} />
      </View>

      <ScrollView contentContainerStyle={s.cardArea} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={() => (revealed ? null : reveal(false))}
          style={[s.card, { borderColor: levelColors[priorLevel] }]}
        >
          <View style={s.typeBadge}>
            <Text style={s.typeBadgeText}>{entry.type}</Text>
          </View>

          <Text style={s.front}>{front}</Text>

          {revealed ? (
            <View style={s.backBlock}>
              <View style={s.divider} />
              {verdict ? (
                <Text style={[s.verdict, verdict === 'correct' ? s.correct : s.incorrect]}>
                  {verdict === 'correct' ? 'Richtig! ✓' : 'Nicht ganz…'}
                </Text>
              ) : null}
              <Text style={s.backText2}>{back}</Text>
              {entry.partizipII ? <Text style={s.partizip}>Partizip II: {entry.partizipII}</Text> : null}
            </View>
          ) : null}
        </Pressable>
      </ScrollView>

      {!revealed && mode === 'study' ? (
        <View style={s.answerArea}>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            placeholder="Antwort eingeben…"
            placeholderTextColor={colors.inkSoft}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => reveal(true)}
            style={s.input}
          />
          <View style={s.answerButtons}>
            <Button title="Zeig mir's" onPress={() => reveal(false)} style={s.flex} />
            <Button title="Prüfen" variant="secondary" onPress={() => reveal(true)} style={s.flex} />
          </View>
        </View>
      ) : null}

      {!revealed && mode === 'flash' ? (
        <View style={s.answerArea}>
          <Button title="Aufdecken" onPress={() => reveal(false)} />
        </View>
      ) : null}

      {revealed && mode === 'study' ? (
        <View style={s.rateArea}>
          <Text style={s.rateLabel}>Wie gut wusstest du das?</Text>
          <View style={s.rateRow}>
            {RATINGS.map(r => (
              <Pressable
                key={r.level}
                onPress={() => rate(r.level)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  s.rateBtn,
                  { backgroundColor: levelColors[r.level] },
                  pressed && s.pressed,
                ]}
              >
                <Text style={s.rateNum}>{r.level}</Text>
                <Text style={s.rateSub}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {revealed && mode === 'flash' ? (
        <View style={s.browseArea}>
          <Button
            title="← Zurück"
            variant="secondary"
            style={s.flex}
            onPress={() => {
              if (index > 0) {
                setIndex(index - 1);
                setRevealed(false);
              }
            }}
          />
          <Button title="Weiter →" style={s.flex} onPress={next} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 18, color: colors.ink },
  progress: { flex: 1 },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
  progressText: { fontSize: 12, color: colors.inkSoft, textAlign: 'center' },

  cardArea: { flexGrow: 1, justifyContent: 'center', paddingVertical: 8 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderRadius: 20,
    padding: 24,
    minHeight: 220,
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: { fontSize: 11, color: colors.inkSoft, fontWeight: '600' },
  front: { fontSize: 26, fontWeight: '700', color: colors.ink, textAlign: 'center' },

  backBlock: { marginTop: 18, alignItems: 'center' },
  divider: { height: 1, backgroundColor: colors.border, alignSelf: 'stretch', marginBottom: 14 },
  verdict: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  correct: { color: colors.correct },
  incorrect: { color: colors.incorrect },
  backText2: { fontSize: 20, color: colors.ink, textAlign: 'center' },
  partizip: { fontSize: 13, color: colors.inkSoft, marginTop: 8 },

  answerArea: { gap: 10, paddingBottom: 20 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.ink,
  },
  answerButtons: { flexDirection: 'row', gap: 10 },

  rateArea: { paddingBottom: 20 },
  rateLabel: { fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginBottom: 10 },
  rateRow: { flexDirection: 'row', gap: 6 },
  rateBtn: { flex: 1, borderRadius: radius.control, paddingVertical: 12, alignItems: 'center' },
  rateNum: { fontSize: 18, fontWeight: '700', color: colors.ink },
  rateSub: { fontSize: 9, color: colors.ink, opacity: 0.75, marginTop: 2, textAlign: 'center' },

  browseArea: { flexDirection: 'row', gap: 10, paddingBottom: 20 },
});
