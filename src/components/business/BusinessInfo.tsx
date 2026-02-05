import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { typography } from '../../theme';
import { spacing } from '../../theme';
import BusinessLogo from './BusinessLogo';
import type { Business } from '../../types';

interface BusinessInfoProps {
  business: Business;
}

export default function BusinessInfo({ business }: BusinessInfoProps) {
  return (
    <View style={styles.container}>
      <BusinessLogo
        imageUrl={business.photo_url}
        name={business.name}
        size="md"
      />
      <View style={styles.textWrapper}>
        <Text style={styles.name} numberOfLines={1}>
          {business.name}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {business.address}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  address: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
  },
});
