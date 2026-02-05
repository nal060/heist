import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import { colors } from '../../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  backgroundColor?: string;
}

export default function ScreenContainer({
  children,
  scroll = false,
  edges = ['top', 'left', 'right'],
  backgroundColor = colors.background.primary,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.container}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
