import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from './src/theme';
import {
  buildFlashWordList,
  buildStudyWordList,
  getLessonCount,
  loadProgress,
  saveActiveLevel,
  saveLevelProgress,
  withBumpedLesson,
} from './src/logic';

import HomeScreen from './src/screens/HomeScreen';
import StudySetupScreen from './src/screens/StudySetupScreen';
import FlashSetupScreen from './src/screens/FlashSetupScreen';
import SessionScreen from './src/screens/SessionScreen';
import SummaryScreen from './src/screens/SummaryScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  // Progress is held per level: { A1: {...}, A2: {...} }. The two never mix.
  const [progress, setProgress] = useState({ A1: {}, A2: {} });
  const [activeLevel, setActiveLevel] = useState('A1');
  const [screen, setScreen] = useState('home');
  const [session, setSession] = useState(null);

  useEffect(() => {
    loadProgress().then(({ byLevel, activeLevel: stored }) => {
      setProgress(byLevel);
      setActiveLevel(stored);
      setLoading(false);
    });
  }, []);

  const persistLevel = useCallback((levelId, levelProgress) => {
    setProgress(prev => ({ ...prev, [levelId]: levelProgress }));
    saveLevelProgress(levelId, levelProgress);
  }, []);

  const selectLevel = useCallback(levelId => {
    setActiveLevel(levelId);
    saveActiveLevel(levelId);
  }, []);

  function goHome() {
    setScreen('home');
  }

  function resetLevel(levelId) {
    persistLevel(levelId, {});
  }

  function startStudy(length, direction) {
    const levelId = activeLevel;
    // Starting a Study session always counts as one "lesson" - bump the counter
    // first so this session's word selection and ratings are stamped with it.
    const bumped = withBumpedLesson(progress[levelId] || {});
    const currentLesson = getLessonCount(bumped);
    persistLevel(levelId, bumped);

    setSession({
      mode: 'study',
      levelId,
      direction,
      words: buildStudyWordList(levelId, bumped, length, currentLesson),
      currentLesson,
    });
    setScreen('session');
  }

  // Flashcards carry their own level, chosen on their setup screen.
  function startFlash(levelId, direction, order) {
    setSession({ mode: 'flash', levelId, direction, words: buildFlashWordList(levelId, order) });
    setScreen('session');
  }

  function finishStudy(sessionLevels) {
    setSession(s => ({ ...s, sessionLevels }));
    setScreen('summary');
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 16,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        {screen === 'home' && (
          <HomeScreen
            progress={progress}
            activeLevel={activeLevel}
            onSelectLevel={selectLevel}
            onResetProgress={resetLevel}
            onGoStudy={() => setScreen('studySetup')}
            onGoFlash={() => setScreen('flashSetup')}
          />
        )}

        {screen === 'studySetup' && (
          <StudySetupScreen levelId={activeLevel} onBack={goHome} onStart={startStudy} />
        )}

        {screen === 'flashSetup' && (
          <FlashSetupScreen levelId={activeLevel} onBack={goHome} onStart={startFlash} />
        )}

        {screen === 'session' && session && (
          <SessionScreen
            mode={session.mode}
            levelId={session.levelId}
            direction={session.direction}
            words={session.words}
            currentLesson={session.currentLesson}
            levelProgress={progress[session.levelId] || {}}
            onProgressChange={persistLevel}
            onExit={goHome}
            onFinish={finishStudy}
          />
        )}

        {screen === 'summary' && session && (
          <SummaryScreen
            levelId={session.levelId}
            levelProgress={progress[session.levelId] || {}}
            words={session.words}
            sessionLevels={session.sessionLevels || {}}
            onStudyAgain={() => setScreen('studySetup')}
            onHome={goHome}
          />
        )}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg, maxWidth: 480, width: '100%', alignSelf: 'center' },
  loadingContainer: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
