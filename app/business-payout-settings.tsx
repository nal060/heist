import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../src/theme';
import { strings } from '../src/constants/strings';
import { useAuth } from '../src/context/AuthContext';
import { getBusinessForUser } from '../src/data/auth';
import { getBusinessPayoutAccount } from '../src/data/payments';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import ErrorState from '../src/components/ui/ErrorState';
import Button from '../src/components/ui/Button';
import type { TilopayBusinessAccount } from '../src/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPPORT_EMAIL = 'mailto:soporte@heist.app';
const COPY_CONFIRMATION_MS = 2000;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BusinessPayoutSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [account, setAccount] = useState<TilopayBusinessAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setError(false);
    getBusinessForUser(user.id)
      .then((biz) => getBusinessPayoutAccount(biz?.id ?? '').then((acc) => setAccount(acc)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);

  const handleCopyEmail = useCallback(async () => {
    if (!account?.tilopay_payout_email) return;
    await Clipboard.setStringAsync(account.tilopay_payout_email);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), COPY_CONFIRMATION_MS);
  }, [account]);

  const handleContactSupport = useCallback(() => {
    Linking.openURL(SUPPORT_EMAIL);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={strings.businessPayoutSettings.title} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={strings.businessPayoutSettings.title} />
        <View style={styles.center}>
          <ErrorState onRetry={load} />menuItems
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={strings.businessPayoutSettings.title} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {account === null ? (
          <NoAccountContent onContactSupport={handleContactSupport} />
        ) : account.account_status === 'pending' ? (
          <StatusContent
            badgeStyle={styles.badgePending}
            badgeTextStyle={styles.badgeTextPending}
            title={strings.businessPayoutSettings.pendingTitle}
            subtitle={strings.businessPayoutSettings.pendingSubtitle}
          />
        ) : account.account_status === 'active' ? (
          <ActiveContent
            account={account}
            onCopy={handleCopyEmail}
            copied={copied}
          />
        ) : account.account_status === 'suspended' ? (
          <StatusContent
            badgeStyle={styles.badgeSuspended}
            badgeTextStyle={styles.badgeTextSuspended}
            title={strings.businessPayoutSettings.suspendedTitle}
            subtitle={strings.businessPayoutSettings.suspendedSubtitle}
            onContactSupport={handleContactSupport}
          />
        ) : (
          // offboarded
          <StatusContent
            badgeStyle={styles.badgeOffboarded}
            badgeTextStyle={styles.badgeTextOffboarded}
            title={strings.businessPayoutSettings.offboardedTitle}
            subtitle={strings.businessPayoutSettings.offboardedSubtitle}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NoAccountContentProps {
  onContactSupport: () => void;
}

function NoAccountContent({ onContactSupport }: NoAccountContentProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{strings.businessPayoutSettings.noAccountTitle}</Text>
      <Text style={styles.sectionSubtitle}>{strings.businessPayoutSettings.noAccountSubtitle}</Text>
      <View style={{ height: spacing.lg }} />
      <Text style={styles.step}>{strings.businessPayoutSettings.step1}</Text>
      <Text style={styles.step}>{strings.businessPayoutSettings.step2}</Text>
      <View style={{ height: spacing.xxl }} />
      <Button
        label={strings.businessPayoutSettings.contactSupport}
        onPress={onContactSupport}
        variant="primary"
        fullWidth
      />
    </View>
  );
}

interface StatusContentProps {
  badgeStyle: ViewStyle;
  badgeTextStyle: TextStyle;
  title: string;
  subtitle: string;
  onContactSupport?: () => void;
}

function StatusContent({ badgeStyle, badgeTextStyle, title, subtitle, onContactSupport }: StatusContentProps) {
  return (
    <View style={styles.section}>
      <View style={[styles.badge, badgeStyle]}>
        <Text style={[styles.badgeText, badgeTextStyle]}>{title}</Text>
      </View>
      <View style={{ height: spacing.lg }} />
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      {onContactSupport ? (
        <>
          <View style={{ height: spacing.xxl }} />
          <Button
            label={strings.businessPayoutSettings.contactSupport}
            onPress={onContactSupport}
            variant="primary"
            fullWidth
          />
        </>
      ) : null}
    </View>
  );
}

interface ActiveContentProps {
  account: TilopayBusinessAccount;
  onCopy: () => void;
  copied: boolean;
}

function ActiveContent({ account, onCopy, copied }: ActiveContentProps) {
  return (
    <View style={styles.section}>
      <View style={[styles.badge, styles.badgeActive]}>
        <Text style={[styles.badgeText, styles.badgeTextActive]}>
          {strings.businessPayoutSettings.activeTitle}
        </Text>
      </View>
      <View style={{ height: spacing.lg }} />
      <Text style={styles.sectionSubtitle}>{strings.businessPayoutSettings.activeSubtitle}</Text>
      <View style={{ height: spacing.xxl }} />

      {/* Payout email row */}
      <View style={styles.infoRow}>
        <View style={styles.infoRowContent}>
          <Text style={styles.infoLabel}>{strings.businessPayoutSettings.payoutEmail}</Text>
          <Text style={styles.infoValue}>{account.tilopay_payout_email}</Text>
        </View>
        <TouchableOpacity
          onPress={onCopy}
          style={styles.copyButton}
          accessibilityRole="button"
          accessibilityLabel={strings.businessPayoutSettings.copyPayoutEmail}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={copied ? ('checkmark-outline' as React.ComponentProps<typeof Ionicons>['name']) : ('copy-outline' as React.ComponentProps<typeof Ionicons>['name'])}
            size={20}
            color={colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      {copied ? (
        <Text style={styles.copiedText}>{strings.businessPayoutSettings.copied}</Text>
      ) : null}

      <View style={{ height: spacing.lg }} />
      <Text style={styles.bankEditNote}>{strings.businessPayoutSettings.bankEditNote}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },
  step: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  badgePending: {
    backgroundColor: colors.badge.remaining.bg,
  },
  badgeTextPending: {
    color: colors.badge.remaining.text,
  },
  badgeActive: {
    backgroundColor: colors.badge.popular.bg,
  },
  badgeTextActive: {
    color: colors.badge.popular.text,
  },
  badgeSuspended: {
    backgroundColor: colors.badge.suspended.bg,
  },
  badgeTextSuspended: {
    color: colors.badge.suspended.text,
  },
  badgeOffboarded: {
    backgroundColor: colors.badge.soldOut.bg,
  },
  badgeTextOffboarded: {
    color: colors.badge.soldOut.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  infoRowContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  copyButton: {
    marginLeft: spacing.md,
  },
  copiedText: {
    fontSize: typography.fontSize.sm,
    color: colors.badge.popular.text,
    marginTop: spacing.xs,
  },
  bankEditNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});
