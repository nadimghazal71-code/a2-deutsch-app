import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';

import { colors, radius } from '../theme';
import { Button, LevelBar } from '../components';
import { LEVELS, LEVEL_ORDER, levelCounts } from '../logic';

/**
 * The home screen is the level chooser. Each card carries its own progress, and
 * the selected one is what Study runs on.
 */
export default function HomeScreen({ progress, activeLevel, onSelectLevel, onResetProgress, onGoStudy, onGoFlash }) {
  function confirmReset() {
    const lvl = LEVELS[activeLevel];
    Alert.alert(
      'Fortschritt zurücksetzen?',
      `Fortschritt für ${lvl.label} (${lvl.name}) wirklich zurücksetzen? ` +
        'Das kann nicht rückgängig gemacht werden. Der andere Level bleibt unverändert.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Zurücksetzen', style: 'destructive', onPress: () => onResetProgress(activeLevel) },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Deutsch Vokabeln</Text>
      <Text style={s.subtitle}>Wähle ein Level – jedes hat seinen eigenen Fortschritt</Text>

      <View style={s.levelList}>
        {LEVEL_ORDER.map(id => {
          const lvl = LEVELS[id];
          const counts = levelCounts(id, progress[id] || {});
          const total = lvl.words.length;
          const mastered = counts[5];
          const inProgress = counts[1] + counts[2] + counts[3] + counts[4];
          const selected = id === activeLevel;

          return (
            <Pressable
              key={id}
              onPress={() => onSelectLevel(id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [s.card, selected && s.cardSelected, pressed && s.cardPressed]}
            >
              <View style={s.cardHead}>
                <View style={[s.badge, selected && s.badgeSelected]}>
                  <Text style={[s.badgeText, selected && s.badgeTextSelected]}>{lvl.label}</Text>
                </View>
                <Text style={s.levelName}>{lvl.name}</Text>
                <Text style={s.levelTotal}>{total} Wörter</Text>
              </View>

              <LevelBar counts={counts} total={total} />

              <View style={s.cardStats}>
                <Text style={s.stat}>
                  <Text style={s.statNum}>{mastered}</Text> gelernt
                </Text>
                <Text style={s.stat}>
                  <Text style={s.statNum}>{inProgress}</Text> in Bearbeitung
                </Text>
                <Text style={s.stat}>
                  <Text style={s.statNum}>{counts[0]}</Text> neu
                </Text>
                <Text style={s.pct}>{total ? Math.round((mastered / total) * 100) : 0} %</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={s.actions}>
        <Button title="Study" emoji="🎯" onPress={onGoStudy} />
        <Button title="Flashcards" emoji="📚" variant="secondary" onPress={onGoFlash} />
      </View>

      <Pressable onPress={confirmReset} accessibilityRole="button" style={s.reset}>
        <Text style={s.resetText}>Fortschritt dieses Levels zurücksetzen</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginTop: 6, marginBottom: 24 },

  levelList: { gap: 12, marginBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 16,
  },
  cardSelected: { borderColor: colors.accent, borderWidth: 2, padding: 15 },
  cardPressed: { opacity: 0.9 },

  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  badge: { backgroundColor: colors.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeSelected: { backgroundColor: colors.accent },
  badgeText: { color: colors.accent, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  badgeTextSelected: { color: colors.accentInk },
  levelName: { fontSize: 15, fontWeight: '600', color: colors.ink, flexShrink: 1 },
  levelTotal: { marginLeft: 'auto', fontSize: 12, color: colors.inkSoft },

  cardStats: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  stat: { fontSize: 12, color: colors.inkSoft },
  statNum: { color: colors.ink, fontWeight: '700' },
  pct: { marginLeft: 'auto', fontSize: 14, fontWeight: '700', color: colors.accent },

  actions: { gap: 12 },
  reset: { marginTop: 20, alignSelf: 'center', padding: 8 },
  resetText: { color: colors.inkSoft, fontSize: 13, textDecorationLine: 'underline' },
});
