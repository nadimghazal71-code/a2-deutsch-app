import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { colors, levelColors, radius } from './theme';

/** Filled or outlined action button. */
export function Button({ title, emoji, onPress, variant = 'primary', disabled, style }) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.btn,
        isPrimary ? s.btnPrimary : s.btnSecondary,
        disabled && s.btnDisabled,
        pressed && !disabled && s.btnPressed,
        style,
      ]}
    >
      <Text style={[s.btnText, isPrimary ? s.btnTextPrimary : s.btnTextSecondary]}>
        {emoji ? `${emoji}  ` : ''}{title}
      </Text>
    </Pressable>
  );
}

/** One of a row of mutually exclusive choices. */
export function OptionButton({ label, selected, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [s.option, selected && s.optionSelected, pressed && s.btnPressed, style]}
    >
      <Text style={[s.optionText, selected && s.optionTextSelected]}>{label}</Text>
    </Pressable>
  );
}

/** The level-0..5 distribution of a whole word list, as one stacked bar. */
export function LevelBar({ counts, total, style }) {
  return (
    <View style={[s.bar, style]}>
      {counts.map((count, lvl) =>
        count === 0 ? null : (
          <View
            key={lvl}
            style={{ width: `${(count / total) * 100}%`, height: '100%', backgroundColor: levelColors[lvl] }}
          />
        ),
      )}
    </View>
  );
}

export function LevelChip({ label, style }) {
  return (
    <View style={[s.chip, style]}>
      <Text style={s.chipText}>{label}</Text>
    </View>
  );
}

export function ScreenHeader({ title, onBack, right }) {
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Zurück" style={s.back}>
          <Text style={s.backText}>←</Text>
        </Pressable>
      ) : null}
      <Text style={s.headerTitle}>{title}</Text>
      <View style={s.headerRight}>{right}</View>
    </View>
  );
}

export function SetupGroup({ title, children }) {
  return (
    <View style={s.group}>
      <Text style={s.groupTitle}>{title}</Text>
      <View style={s.groupRow}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: radius.control,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  btnDisabled: { opacity: 0.45 },
  btnPressed: { opacity: 0.8 },
  btnText: { fontSize: 16, fontWeight: '600' },
  btnTextPrimary: { color: colors.accentInk },
  btnTextSecondary: { color: colors.ink },

  option: {
    flex: 1,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  optionText: { fontSize: 14, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  optionTextSelected: { color: colors.accent },

  bar: {
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: levelColors[0],
  },

  chip: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    minWidth: 34,
    alignItems: 'center',
  },
  chipText: { color: colors.accent, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.ink },
  headerRight: { marginLeft: 'auto' },
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

  group: { marginBottom: 24 },
  groupTitle: { fontSize: 13, fontWeight: '700', color: colors.inkSoft, marginBottom: 10 },
  groupRow: { flexDirection: 'row', gap: 10 },
});
