import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from './src/theme';
import { VOCAB } from './src/vocabData';
import { loadProgress, saveProgress, buildStudyWordList, shuffle, bumpLessonCount, getLessonCount } from './src/logic';

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
  const [progress, setProgress] = useState({});
  const [screen, setScreen] = useState('home');
  const [session, setSession] = useState(null); // { mode, direction, words, sessionLevels }

  useEffect(() => {
    loadProgress().then(p => {
      setProgress(p);
      setLoading(false);
    });
  }, []);

  const persistProgress = useCallback(updated => {
    setProgress(updated);
    saveProgress(updated);
  }, []);

  function goHome() {
    setScreen('home');
  }

  function resetProgress() {
    persistProgress({});
  }

  function startStudy(length, direction) {
    // Starting a Study session always counts as one "lesson" - bump the counter
    // first so this session's word selection and ratings are stamped with it.
    const bumped = bumpLessonCount(progress);
    const currentLesson = getLessonCount(bumped);
    persistProgress(bumped);

    const words = buildStudyWordList(VOCAB, bumped, length, currentLesson);
    setSession({ mode: 'study', direction, words, currentLesson });
    setScreen('session');
  }

  function startFlash(direction, order) {
    let ids = VOCAB.map(e => e.id);
    ids = order === 'shuffle' ? shuffle(ids) : ids.slice().sort((a, b) => VOCAB[a].word.localeCompare(VOCAB[b].word, 'de'));
    setSession({ mode: 'flash', direction, words: ids });
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
          { paddingTop: insets.top, paddingBottom: insets.bottom + 16, paddingLeft: insets.left, paddingRight: insets.right },
        ]}
      >
        {screen === 'home' && (
          <HomeScreen
            progress={progress}
            onResetProgress={resetProgress}
            onGoStudy={() => setScreen('studySetup')}
            onGoFlash={() => setScreen('flashSetup')}
          />
        )}

        {screen === 'studySetup' && (
          <StudySetupScreen onBack={goHome} onStart={startStudy} />
        )}

        {screen === 'flashSetup' && (
          <FlashSetupScreen onBack={goHome} onStart={startFlash} />
        )}

        {screen === 'session' && session && (
          <SessionScreen
            mode={session.mode}
            direction={session.direction}
            words={session.words}
            currentLesson={session.currentLesson}
            progress={progress}
            onProgressChange={persistProgress}
            onExit={goHome}
            onFinish={finishStudy}
          />
        )}

        {screen === 'summary' && session && (
          <SummaryScreen
            progress={progress}
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
