import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { spacing } from '../../theme';

interface DividerProps {
  marginVertical?: number;
}

export default function Divider({
  marginVertical = spacing.md,
}: DividerProps) {
  return <View style={[styles.line, { marginVertical }]} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray[200],
    width: '100%',
  },
});
