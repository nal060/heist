import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import EmptyState from '../src/components/ui/EmptyState';
import ErrorState from '../src/components/ui/ErrorState';
import TilopayWebView from '../src/components/payment/TilopayWebView';
import { colors, spacing, typography, shadows, borderRadius } from '../src/theme';
import { strings } from '../src/constants/strings';
import {
  getPaymentMethods,
  requestTokenizationUrl,
  saveCard,
  removePaymentMethod,
  setDefaultPaymentMethod,
} from '../src/data/payments';
import { useAuth } from '../src/context/AuthContext';
import type { PaymentMethod, CardBrand } from '../src/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const REDIRECT_PATTERN =
  process.env.EXPO_PUBLIC_TILOPAY_REDIRECT_BASE ?? 'monch://payment-callback';

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [addingCard, setAddingCard] = useState(false);
  const [tokenizeUrl, setTokenizeUrl] = useState<string | null>(null);

  // ─── Callbacks ──────────────────────────────────────────────────────────────

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getPaymentMethods()
      .then(setCards)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleAddCard = useCallback(async () => {
    setAddingCard(true);
    try {
      const url = await requestTokenizationUrl();
      setTokenizeUrl(url);
    } catch {
      Alert.alert(strings.common.error);
    } finally {
      setAddingCard(false);
    }
  }, []);

  const handleTokenizeSuccess = useCallback(
    async (params: Record<string, string>) => {
      if (params.error) {
        Alert.alert(strings.common.error, params.error);
        setTokenizeUrl(null);
        return;
      }
      try {
        await saveCard({
          card_token: params.card_token ?? '',
          card_last_four: params.last_four ?? '',
          card_brand: (params.brand ?? 'other') as CardBrand,
          card_expiry_month: Number(params.expiry_month),
          card_expiry_year: Number(params.expiry_year),
          set_as_default: cards.length === 0,
        });
        setTokenizeUrl(null);
        load();
      } catch {
        Alert.alert(strings.common.error);
        setTokenizeUrl(null);
      }
    },
    [cards.length, load],
  );

  const handleDelete = useCallback(
    (card: PaymentMethod) => {
      Alert.alert(
        strings.paymentMethods.deleteTitle,
        strings.paymentMethods.deleteMessage,
        [
          { text: strings.paymentMethods.deleteCancel, style: 'cancel' },
          {
            text: strings.paymentMethods.deleteConfirm,
            style: 'destructive',
            onPress: async () => {
              try {
                await removePaymentMethod(card.id);
                load();
              } catch {
                Alert.alert(strings.common.error);
              }
            },
          },
        ],
      );
    },
    [load],
  );

  const handleCancelTokenize = useCallback(() => setTokenizeUrl(null), []);

  const handleSetDefault = useCallback(
    async (card: PaymentMethod) => {
      if (card.is_default) return;
      if (!user?.id) return; // unauthenticated — should not happen in normal flow
      try {
        await setDefaultPaymentMethod(card.id, user.id);
        load();
      } catch {
        Alert.alert(strings.common.error);
      }
    },
    [user?.id, load],
  );

  // ─── Early returns ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={strings.paymentMethods.title} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={strings.paymentMethods.title} />
        <ErrorState onRetry={load} />
      </View>
    );
  }

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={strings.paymentMethods.title}
        right={
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCard}
            disabled={addingCard}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={strings.paymentMethods.addCard}
          >
            <Ionicons
              name={'add' as React.ComponentProps<typeof Ionicons>['name']}
              size={28}
              color={colors.primary[500]}
            />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={cards.length === 0 ? styles.listEmpty : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="card-outline"
            title={strings.paymentMethods.emptyTitle}
            subtitle={strings.paymentMethods.emptySubtitle}
            actionLabel={strings.paymentMethods.addCard}
            onAction={handleAddCard}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.cardRow, shadows.sm as ViewStyle]}
            onPress={() => handleSetDefault(item)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={strings.paymentMethods.setDefault}
          >
            <View style={styles.cardIcon}>
              <Ionicons
                name={'card-outline' as React.ComponentProps<typeof Ionicons>['name']}
                size={28}
                color={colors.primary[500]}
              />
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardNumber}>
                  {strings.paymentMethods.maskedPrefix + item.card_last_four}
                </Text>
                {item.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>
                      {strings.paymentMethods.defaultBadge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardExpiry}>
                {strings.paymentMethods.expires}{' '}
                {item.card_expiry_month}{strings.paymentMethods.expirySeparator}{item.card_expiry_year}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={strings.paymentMethods.deleteTitle}
            >
              <Ionicons
                name={'trash-outline' as React.ComponentProps<typeof Ionicons>['name']}
                size={20}
                color={colors.error}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {tokenizeUrl !== null && (
        <TilopayWebView
          url={tokenizeUrl}
          redirectPattern={REDIRECT_PATTERN}
          onSuccess={handleTokenizeSuccess}
          onCancel={handleCancelTokenize}
          submitLabel={strings.mockCardForm.saveCard}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  listEmpty: {
    flex: 1,
  },
  separator: {
    height: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  defaultBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  cardExpiry: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
