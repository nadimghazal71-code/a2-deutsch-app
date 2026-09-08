import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { Button, LevelChip, OptionButton, ScreenHeader, SetupGroup } from '../components';
import { LEVELS } from '../logic';

/** Study runs on the level chosen on the home screen, shown here as a chip. */
export default function StudySetupScreen({ levelId, onBack, onStart }) {
  const [length, setLength] = useState(null);
  const [direction, setDirection] = useState(null);

  return (
    <View style={s.wrap}>
      <ScreenHeader title="Study" onBack={onBack} right={<LevelChip label={LEVELS[levelId].label} />} />

      <SetupGroup title="Länge">
        <OptionButton label="Kurz (10)" selected={length === 10} onPress={() => setLength(10)} />
        <OptionButton label="Lang (20)" selected={length === 20} onPress={() => setLength(20)} />
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

      <Button
        title="Start"
        disabled={!length || !direction}
        onPress={() => onStart(length, direction)}
        style={s.start}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  start: { marginTop: 'auto', marginBottom: 20 },
});
