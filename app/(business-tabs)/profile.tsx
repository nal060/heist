import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { sharedStyles } from '../../src/styles/shared';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { getBusinessForUser, getBusinessPhotos } from '../../src/data/auth';
import type { Business } from '../../src/types';
import ErrorState from '../../src/components/ui/ErrorState';

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      const biz = await getBusinessForUser(user.id);
      setBusiness(biz);

      if (biz) {
        const photos = await getBusinessPhotos(biz.id);
        if (photos.length > 0) {
          setPhotoUrl(photos[0].photo_url);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = () => {
    Alert.alert(
      strings.businessProfile.logout,
      '',
      [
        { text: strings.common.cancel, style: 'cancel' },
        {
          text: strings.common.confirm,
          style: 'destructive',
          onPress: signOut,
        },
      ],
    );
  };



  const menuItems = [
    {
      icon: 'information-circle-outline',
      label: strings.businessProfile.businessInfo,
      onPress: () => router.push('/business-edit-profile'),
    },
    {
      icon: 'calendar-outline',
      label: strings.businessProfile.calendar,
      onPress: () => router.push('/business-calendar'),
    },
    {
      icon: 'wallet-outline',
      label: strings.businessProfile.payoutSettings,
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      label: strings.businessProfile.help,
      onPress: () => {},
    },
  ] as const;

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ErrorState message={error} onRetry={loadProfile} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + spacing.lg }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>{strings.businessProfile.title}</Text>

      {/* Business card */}
      <View style={styles.businessCard}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarCircle}>
            <Ionicons name="storefront" size={32} color={colors.primary[500]} />
          </View>
        )}
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{business?.name}</Text>
          <Text style={styles.businessAddress} numberOfLines={1}>
            {business?.address}
          </Text>
          {business?.phone ? (
            <Text style={styles.businessPhone}>{business.phone}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/business-edit-profile')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Menu items */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            activeOpacity={0.6}
            onPress={item.onPress}
          >
            <Ionicons
              name={item.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={22}
              color={colors.text.primary}
            />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={styles.logoutText}>{strings.businessProfile.logout}</Text>
      </TouchableOpacity>

      {/* Email */}
      <Text style={styles.email}>{user?.email}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.containerNoPadding,
  center: sharedStyles.center,
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxl,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.lg,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  businessAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  businessPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  menu: {
    marginBottom: spacing.xxl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginLeft: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginLeft: spacing.lg,
    fontWeight: typography.fontWeight.medium,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  deleteText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginLeft: spacing.lg,
    fontWeight: typography.fontWeight.medium,
  },
  email: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
