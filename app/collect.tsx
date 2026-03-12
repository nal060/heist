import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../src/theme';
import { strings } from '../src/constants/strings';
import ScreenHeader from '../src/components/ui/ScreenHeader';
import NoticeCard from '../src/components/ui/NoticeCard';
import { useAuth } from '../src/context/AuthContext';
import {
  getOrderByCode,
  collectOrder,
  type DashboardOrder,
} from '../src/data/business';

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'already_collected' | 'success' | 'error';

const CODE_LENGTH = 6;

function slotColor(state: LookupState): { border: string; text: string } {
  if (state === 'found')             return { border: '#2E7D32', text: '#2E7D32' };
  if (state === 'not_found')         return { border: colors.error, text: colors.error };
  if (state === 'already_collected') return { border: '#F57F17', text: '#F57F17' };
  if (state === 'error')             return { border: colors.error, text: colors.error };
  return { border: colors.gray[300], text: colors.text.primary };
}

export default function CollectScreen() {
  const insets = useSafeAreaInsets();
  const { businessId } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [previewOrder, setPreviewOrder] = useState<DashboardOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [collecting, setCollecting] = useState(false);

  const handleChange = async (text: string) => {
    const upper = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(upper);

    if (upper.length < CODE_LENGTH) {
      setLookupState('idle');
      setPreviewOrder(null);
      return;
    }

    setLookupState('loading');
    setPreviewOrder(null);
    try {
      if (!businessId) return;
      const order = await getOrderByCode(businessId, upper);
      if (!order) {
        setLookupState('not_found');
      } else if (order.status !== 'reserved') {
        setLookupState('already_collected');
        setPreviewOrder(order);
      } else {
        setLookupState('found');
        setPreviewOrder(order);
      }
    } catch (e) {
      setErrorMsg((e as Error).message);
      setLookupState('error');
    }
  };

  const handleCollect = async () => {
    if (!previewOrder || lookupState !== 'found') return;
    setCollecting(true);
    try {
      await collectOrder(previewOrder.id);
      setLookupState('success');
      setCode('');
      setPreviewOrder(null);
    } catch (e) {
      setErrorMsg((e as Error).message);
      setLookupState('error');
    } finally {
      setCollecting(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setLookupState('idle');
    setPreviewOrder(null);
    setErrorMsg('');
    inputRef.current?.focus();
  };

  const { border, text: textColor } = slotColor(lookupState);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={strings.collect.title} />

        <View style={styles.body}>
          <Text style={styles.label}>{strings.collect.enterCode}</Text>

          {/* Slot display — tapping focuses the hidden input */}
          <Pressable style={styles.slotsRow} onPress={() => inputRef.current?.focus()}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const char = code[i];
              const isActive = lookupState === 'idle' && i === code.length;
              return (
                <View key={i} style={styles.slot}>
                  <Text style={[styles.slotChar, { color: char ? textColor : colors.text.primary }]}>
                    {char ?? ' '}
                  </Text>
                  <View
                    style={[
                      styles.slotLine,
                      { backgroundColor: border },
                      isActive && styles.slotLineActive,
                    ]}
                  />
                </View>
              );
            })}
          </Pressable>

          {/* Hidden input */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={CODE_LENGTH}
            returnKeyType="done"
            onSubmitEditing={handleCollect}
            autoFocus
          />

          {/* Loading */}
          {lookupState === 'loading' && (
            <ActivityIndicator color={colors.primary[500]} />
          )}

          {/* Order preview */}
          {lookupState === 'found' && previewOrder && (
            <View style={[styles.previewCard, shadows.sm]}>
              <View style={styles.previewRow}>
                <Text style={styles.previewBagTitle} numberOfLines={1}>
                  {previewOrder.bagTitle}
                </Text>
                <Text style={styles.previewPrice}>${previewOrder.totalPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.previewMeta}>
                <Ionicons name="people-outline" size={13} color={colors.text.tertiary} />
                <Text style={styles.previewMetaText}>{'\u00d7'} {previewOrder.quantity}</Text>
                <View style={styles.metaDot} />
                <Ionicons name="calendar-outline" size={13} color={colors.text.tertiary} />
                <Text style={styles.previewMetaText}>{previewOrder.pickupDate}</Text>
                <View style={styles.metaDot} />
                <Ionicons name="time-outline" size={13} color={colors.text.tertiary} />
                <Text style={styles.previewMetaText}>{previewOrder.pickupWindow}</Text>
              </View>
            </View>
          )}

          {/* Outside pickup window warning */}
          {lookupState === 'found' && previewOrder?.isOutsideWindow && (
            <NoticeCard
              variant="warning"
              message={`${strings.collect.outsideWindow} (${previewOrder.pickupDate}, ${previewOrder.pickupWindow}).`}
            />
          )}

          {/* Notices */}
          {lookupState === 'not_found' && (
            <NoticeCard variant="error" message={strings.collect.notFound} />
          )}

          {lookupState === 'already_collected' && previewOrder && (
            <NoticeCard
              variant="warning"
              message={`${previewOrder.bagTitle} ${strings.collect.alreadyCollected}`}
              icon="information-circle-outline"
            />
          )}

          {lookupState === 'success' && (
            <NoticeCard variant="success" message={strings.collect.success} />
          )}

          {lookupState === 'error' && (
            <NoticeCard variant="error" message={errorMsg} />
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {(lookupState === 'found' || lookupState === 'not_found' || lookupState === 'already_collected' || lookupState === 'error') && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleReset}>
                <Text style={styles.clearBtnText}>{strings.collect.clear}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.collectBtn, (lookupState !== 'found' || collecting) && styles.collectBtnDisabled]}
              onPress={handleCollect}
              disabled={lookupState !== 'found' || collecting}
            >
              {collecting
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Ionicons name="bag-check-outline" size={18} color={colors.white} />
              }
              <Text style={styles.collectBtnText}>{strings.collect.confirmPickup}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Slots
  slotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  slot: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  slotChar: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    minWidth: 32,
    textAlign: 'center',
  },
  slotLine: {
    width: 36,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gray[300],
  },
  slotLineActive: {
    backgroundColor: colors.primary[400],
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },

  // Order preview card
  previewCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewBagTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  previewPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.gray[300],
    marginHorizontal: 2,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  clearBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  collectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  collectBtnDisabled: {
    opacity: 0.4,
  },
  collectBtnText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
