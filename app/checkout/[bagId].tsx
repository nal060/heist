import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getBagById, createOrder } from '../../src/data';
import { getPaymentMethods, chargeSavedCard, createHostedPayment } from '../../src/data/payments';
import { useAuth } from '../../src/context/AuthContext';
import ErrorState from '../../src/components/ui/ErrorState';
import ScreenHeader from '../../src/components/ui/ScreenHeader';
import QuantityStepper from '../../src/components/ui/QuantityStepper';
import BusinessLogo from '../../src/components/business/BusinessLogo';
import Divider from '../../src/components/ui/Divider';
import TilopayWebView from '../../src/components/payment/TilopayWebView';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { formatPickupWindow, getPickupLabel } from '../../src/utils/formatTime';
import type { BagWithBusiness, PaymentMethod } from '../../src/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const REDIRECT_PATTERN = process.env.EXPO_PUBLIC_TILOPAY_REDIRECT_BASE ?? 'monch://payment-callback';

export default function CheckoutScreen() {
  const { bagId } = useLocalSearchParams<{ bagId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [bag, setBag] = useState<BagWithBusiness | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paying, setPaying] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const loadBag = useCallback(() => {
    setLoading(true);
    setError(false);
    getBagById(bagId)
      .then((data) => setBag(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [bagId]);

  const loadCards = useCallback(() => {
    setLoadingCards(true);
    getPaymentMethods()
      .then((data) => {
        setSelectedCard(data.find((c) => c.is_default) ?? data[0] ?? null);
      })
      .catch(() => {}) // silent — payment method load failure shouldn't block checkout
      .finally(() => setLoadingCards(false));
  }, []);

  useEffect(() => {
    loadBag();
    loadCards();
  }, [loadBag, loadCards]);

  const subtotal = (bag?.discounted_price ?? 0) * quantity;
  const tax = subtotal * 0.07;
  const total = subtotal + tax;
  const maxQuantity = bag ? Math.min(bag.quantity_available, 5) : 1;

  const handlePay = useCallback(async () => {
    if (paying || webViewUrl !== null) return;
    if (!user) { Alert.alert(strings.common.error); return; }
    if (!bag) return;
    setPaying(true);
    try {
      const order = await createOrder(user.id, { bagId: bag.id, quantity, subtotal, tax, total });

      if (selectedCard) {
        // Saved card path — charge immediately
        const result = await chargeSavedCard(order.id, selectedCard.id);
        if (result.success) {
          router.replace(`/order-confirmation/${order.id}`);
        } else {
          Alert.alert(strings.checkout.paymentFailed, result.error ?? strings.checkout.paymentFailedMessage);
          setPaying(false);
        }
      } else {
        // No saved card — open hosted payment WebView
        const url = await createHostedPayment(order.id, true);
        setPendingOrderId(order.id);
        setWebViewUrl(url);
        setPaying(false);
      }
    } catch (e) {
      Alert.alert(strings.common.error, (e as Error).message);
      setPaying(false);
    }
  }, [paying, webViewUrl, user, bag, quantity, subtotal, tax, total, selectedCard, router]);

  const handleWebViewSuccess = useCallback((_params: Record<string, string>) => {
    setWebViewUrl(null);
    if (pendingOrderId) {
      router.replace(`/order-confirmation/${pendingOrderId}`);
    }
  }, [pendingOrderId, router]);

  const handleWebViewCancel = useCallback(() => {
    setWebViewUrl(null);
    setPendingOrderId(null);
  }, []);

  const handleChangePaymentMethod = useCallback(() => {
    router.push('/payment-methods');
  }, [router]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ErrorState onRetry={loadBag} />
      </View>
    );
  }

  if (!bag) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>{strings.common.bagNotFound}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={strings.checkout.title} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Business & Bag Info */}
        <View style={styles.card}>
          <View style={styles.businessRow}>
            <BusinessLogo
              imageUrl={bag.business.photo_url}
              name={bag.business.name}
              size="md"
            />
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{bag.business.name}</Text>
              <Text style={styles.bagTitle}>{bag.title}</Text>
            </View>
          </View>

          <View style={styles.pickupRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary[500]} />
            <Text style={styles.pickupText}>
              {strings.checkout.pickupWindow}: {getPickupLabel(bag.date)} · {formatPickupWindow(bag.pickup_start_time, bag.pickup_end_time)}
            </Text>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{strings.checkout.quantity}</Text>
          <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={maxQuantity} />
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{strings.checkout.paymentMethod}</Text>
          {loadingCards ? (
            <ActivityIndicator color={colors.primary[500]} style={styles.cardLoader} />
          ) : selectedCard ? (
            <View style={styles.paymentMethodRow}>
              <View style={styles.paymentIconContainer}>
                <Ionicons
                  name={'card-outline' as React.ComponentProps<typeof Ionicons>['name']}
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <Text style={styles.paymentMethodText}>
                {strings.paymentMethods.maskedPrefix}{selectedCard.card_last_four}
              </Text>
              <TouchableOpacity
                onPress={handleChangePaymentMethod}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel={strings.checkout.changeMethod}
              >
                <Text style={styles.changeMethodText}>{strings.checkout.changeMethod}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.paymentMethodRow}
              onPress={handleChangePaymentMethod}
              accessibilityRole="button"
              accessibilityLabel={strings.checkout.addPaymentMethod}
            >
              <View style={styles.paymentIconContainer}>
                <Ionicons
                  name={'add-circle-outline' as React.ComponentProps<typeof Ionicons>['name']}
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <Text style={styles.paymentMethodText}>{strings.checkout.addPaymentMethod}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{strings.checkout.orderSummary}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{strings.checkout.subtotal}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{strings.checkout.tax} (ITBMS 7%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
          </View>
          <Divider marginVertical={spacing.md} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{strings.checkout.total}</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={styles.scrollSpacer} />
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.payButton, paying && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={paying}
          accessibilityRole="button"
          accessibilityLabel={strings.checkout.payButton.replace('{amount}', formatCurrency(total))}
        >
          {paying ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.payButtonText}>
              {strings.checkout.payButton.replace('{amount}', formatCurrency(total))}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {webViewUrl !== null && (
        <TilopayWebView
          url={webViewUrl}
          redirectPattern={REDIRECT_PATTERN}
          onSuccess={handleWebViewSuccess}
          onCancel={handleWebViewCancel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...(shadows.sm as ViewStyle),
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  bagTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  pickupText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  cardLoader: {
    alignSelf: 'flex-start',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  changeMethodText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  totalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  payButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  scrollSpacer: {
    height: 120, // clears the absolute-positioned bottom pay bar
  },
});
