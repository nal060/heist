import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_BUSINESS = {
  name: 'Negocio Demo',
  description: 'Comida Rica',
  address: 'Camino de cruces, Panama',
  phone: '6513413',
  photo_url: null as string | null,
  rating: 4.7,
  totalReviews: 134,
  isActive: true,
  memberSince: 'Marzo 2024',
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={colors.text.secondary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const textColor = destructive ? colors.error : colors.text.primary;
  const iconColor = destructive ? colors.error : colors.text.secondary;
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.6}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={[styles.settingLabel, { color: textColor }]}>{label}</Text>
      {!destructive && (
        <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Perfil</Text>
        </View>

        {/* Identity card */}
        <View style={[styles.card, shadows.sm, styles.identityCard]}>
          {/* Cover photo */}
          <View style={styles.coverWrap}>
            {MOCK_BUSINESS.photo_url ? (
              <Image
                source={{ uri: MOCK_BUSINESS.photo_url }}
                style={styles.coverImage}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={[styles.coverImage, styles.coverPlaceholder]}>
                <Ionicons name="storefront-outline" size={40} color={colors.gray[300]} />
              </View>
            )}
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="pencil-outline" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Info below cover */}
          <View style={styles.identityInfo}>
            <Text style={styles.businessName}>{MOCK_BUSINESS.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F9A825" />
              <Text style={styles.ratingText}>
                {MOCK_BUSINESS.rating.toFixed(1)} · {MOCK_BUSINESS.totalReviews} reseñas
              </Text>
            </View>
            <View style={[styles.statusBadge, MOCK_BUSINESS.isActive ? styles.statusActive : styles.statusInactive]}>
              <View style={[styles.statusDot, { backgroundColor: MOCK_BUSINESS.isActive ? '#4CAF50' : colors.text.tertiary }]} />
              <Text style={[styles.statusText, { color: MOCK_BUSINESS.isActive ? '#2E7D32' : colors.text.tertiary }]}>
                {MOCK_BUSINESS.isActive ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Business Info */}
        <Text style={styles.sectionTitle}>Información Comercial</Text>
        <View style={[styles.card, shadows.sm]}>
          <InfoRow icon="document-text-outline" label="Descripción" value={MOCK_BUSINESS.description} />
          <View style={styles.divider} />
          <InfoRow icon="location-outline" label="Dirección" value={MOCK_BUSINESS.address} />
          <View style={styles.divider} />
          <InfoRow icon="call-outline" label="Teléfono" value={MOCK_BUSINESS.phone} />
          <View style={styles.divider} />
          <InfoRow icon="calendar-outline" label="Miembro Desde" value={MOCK_BUSINESS.memberSince} />
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Ajustes</Text>
        <View style={[styles.card, shadows.sm]}>
          <SettingRow icon="time-outline" label="Horario Comercial" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="notifications-outline" label="Notificaciones" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="help-circle-outline" label="Ayuda y Apoyo" onPress={() => {}} />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={[styles.card, shadows.sm]}>
          <SettingRow icon="log-out-outline" label="Cerrar Sesión" onPress={() => {}} destructive />
        </View>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scroll: {
    paddingBottom: spacing.xxxxl,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  screenTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },

  // Section title
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },

  // Card
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.lg,
  },

  // Identity card
  identityCard: {
    marginTop: spacing.lg,
  },
  coverWrap: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 180,
  },
  coverPlaceholder: {
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInfo: {
    padding: spacing.lg,
    gap: 4,
  },
  businessName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginTop: 2,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusInactive: {
    backgroundColor: colors.gray[100],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  infoIconWrap: {
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
  },
  chevron: {
    marginLeft: 'auto',
  },
});
