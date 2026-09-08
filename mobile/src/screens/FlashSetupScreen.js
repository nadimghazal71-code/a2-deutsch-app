import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { Button, LevelChip, OptionButton, ScreenHeader, SetupGroup } from '../components';
import { LEVELS, LEVEL_ORDER } from '../logic';

/**
 * Flashcards pick their own level, independently of the home selection: it is
 * a browsing mode, and wanting to flick through the other level without
 * changing what Study is working on is the common case. The choice starts on
 * whichever level is currently selected.
 */
export default function FlashSetupScreen({ levelId, onBack, onStart }) {
  const [level, setLevel] = useState(levelId);
  const [direction, setDirection] = useState(null);
  const [order, setOrder] = useState(null);

  return (
    <View style={s.wrap}>
      <ScreenHeader title="Flashcards" onBack={onBack} right={<LevelChip label={LEVELS[level].label} />} />

      <SetupGroup title="Level">
        {LEVEL_ORDER.map(id => (
          <OptionButton
            key={id}
            label={`${LEVELS[id].label} · ${LEVELS[id].words.length}`}
            selected={level === id}
            onPress={() => setLevel(id)}
          />
        ))}
      </SetupGroup>

      <SetupGroup title="Richtung">
        <OptionButton
          label="English → Deutsch"
          selected={direction === 'en-de'}
          onPress={() => setDirection('en-de')}
        />
        <OptionButton
          label="Deutsch → English"
          selected={direction === 'de-en'}
          onPress={() => setDirection('de-en')}
        />
      </SetupGroup>

      <SetupGroup title="Reihenfolge">
        <OptionButton label="Zufällig" selected={order === 'shuffle'} onPress={() => setOrder('shuffle')} />
        <OptionButton label="A–Z" selected={order === 'az'} onPress={() => setOrder('az')} />
      </SetupGroup>

      <Button
        title="Start"
        disabled={!direction || !order}
        onPress={() => onStart(level, direction, order)}
        style={s.start}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  start: { marginTop: 'auto', marginBottom: 20 },
});
