import React from 'react';
import { View, ScrollView, StyleSheet, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../src/theme';
import { strings } from '../src/constants/strings';
import { useAuth } from '../src/context/AuthContext';
import { useLocation } from '../src/context/LocationContext';
import Divider from '../src/components/ui/Divider';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import SettingsRow from '../src/components/ui/SettingsRow';

type IoniconsName = React.ComponentProps<typeof import('@expo/vector-icons').Ionicons>['name'];

const SETTINGS_ITEMS: { icon: IoniconsName; label: string }[] = [
  { icon: 'person-outline', label: strings.settings.accountDetails },
  { icon: 'notifications-outline', label: strings.settings.notifications },
  { icon: 'card-outline', label: strings.settings.paymentMethods },
  { icon: 'help-circle-outline', label: strings.settings.help },
  { icon: 'document-text-outline', label: strings.settings.legalInfo },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { clearLocation } = useLocation();

  const handleLogout = () => {
    Alert.alert(
      strings.settings.logout,
      '',
      [
        { text: strings.common.cancel, style: 'cancel' },
        { text: strings.common.confirm, style: 'destructive', onPress: async () => { await clearLocation(); await signOut(); } },
      ],
    );
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={strings.settings.title} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Settings Items */}
        <View style={styles.section}>
          {SETTINGS_ITEMS.map((item, index) => (
            <React.Fragment key={item.label}>
              <SettingsRow icon={item.icon} label={item.label} />
              {index < SETTINGS_ITEMS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout & Delete */}
        <View style={styles.section}>
          <SettingsRow
            icon="log-out-outline"
            label={strings.settings.logout}
            danger
            onPress={handleLogout}
          />
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
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
  },
  version: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxxl,
  },
});
