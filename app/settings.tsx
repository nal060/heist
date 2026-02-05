import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../src/theme';
import { strings } from '../src/constants/strings';
import Divider from '../src/components/ui/Divider';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsItem {
  icon: IoniconsName;
  label: string;
  danger?: boolean;
}

const SETTINGS_ITEMS: SettingsItem[] = [
  { icon: 'person-outline', label: strings.settings.accountDetails },
  { icon: 'notifications-outline', label: strings.settings.notifications },
  { icon: 'card-outline', label: strings.settings.paymentMethods },
  { icon: 'help-circle-outline', label: strings.settings.help },
  { icon: 'document-text-outline', label: strings.settings.legalInfo },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{strings.settings.title}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Settings Items */}
        <View style={styles.section}>
          {SETTINGS_ITEMS.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.settingsRow}>
                <View style={styles.settingsLeft}>
                  <Ionicons name={item.icon} size={22} color={colors.text.primary} />
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
              {index < SETTINGS_ITEMS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsLeft}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[styles.settingsLabel, styles.dangerText]}>
                {strings.settings.logout}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>{strings.settings.version} 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingsLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.error,
  },
  version: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxxl,
  },
});
