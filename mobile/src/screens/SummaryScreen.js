import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, radius } from '../theme';
import { Button, LevelBar } from '../components';
import { LEVELS, levelCounts, wordsOf } from '../logic';

export default function SummaryScreen({ levelId, levelProgress, words, sessionLevels, onStudyAgain, onHome }) {
  const counts = levelCounts(levelId, levelProgress);
  const total = wordsOf(levelId).length;
  const fives = words.filter(id => (sessionLevels[id] || 0) === 5).length;

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Fertig! 🎉</Text>

      <View style={s.card}>
        <Text style={s.line}>
          {LEVELS[levelId].label} · {words.length} Wörter geübt · {fives} auf Level 5 gebracht
        </Text>
        <LevelBar counts={counts} total={total} style={s.bar} />
      </View>

      <View style={s.actions}>
        <Button title="Nochmal Study" onPress={onStudyAgain} />
        <Button title="Zur Startseite" variant="secondary" onPress={onHome} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink, textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 20,
  },
  line: { fontSize: 15, color: colors.ink, textAlign: 'center', marginBottom: 16 },
  bar: {},
  actions: { gap: 12, marginTop: 'auto', marginBottom: 20 },
});
