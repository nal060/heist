import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { strings } from '../../constants/strings';
import { useFavorites } from '../../context/FavoritesContext';
import { setNotificationPreference } from '../../data';
import Button from '../ui/Button';

export interface FavoriteSheetData {
  bagId: string;
  businessId: string;
  bagTitle: string;
  businessName: string;
}

interface Props {
  data: FavoriteSheetData | null;
}

const FavoriteBottomSheet = forwardRef<BottomSheetModal, Props>(({ data }, ref) => {
  const { isBagFavorite, isFavorite, addFavorites, removeBagFavorite, removeBusinessFavorite } = useFavorites();

  const [saveBag, setSaveBag] = useState(false);
  const [saveStore, setSaveStore] = useState(false);
  const [notifyBag, setNotifyBag] = useState(false);
  const [notifyStore, setNotifyStore] = useState(false);

  // Pre-populate when sheet data changes
  useEffect(() => {
    if (data) {
      setSaveBag(isBagFavorite(data.bagId));
      setSaveStore(isFavorite(data.businessId));
      setNotifyBag(false);
      setNotifyStore(false);
    }
  }, [data, isBagFavorite, isFavorite]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  const handleSave = useCallback(() => {
    if (!data) return;
    const wasBagFav = isBagFavorite(data.bagId);
    const wasBizFav = isFavorite(data.businessId);

    // Add new favorites
    if (saveBag && !wasBagFav) addFavorites(data.bagId, null);
    if (saveStore && !wasBizFav) addFavorites(null, data.businessId);

    // Remove unchecked favorites
    if (!saveBag && wasBagFav) removeBagFavorite(data.bagId);
    if (!saveStore && wasBizFav) removeBusinessFavorite(data.businessId);

    // Notification preferences (fire and forget)
    if (saveBag) setNotificationPreference('bag', data.bagId, notifyBag);
    if (saveStore) setNotificationPreference('business', data.businessId, notifyStore);

    (ref as React.RefObject<BottomSheetModal | null>)?.current?.dismiss();
  }, [data, saveBag, saveStore, notifyBag, notifyStore, ref, isBagFavorite, isFavorite, addFavorites, removeBagFavorite, removeBusinessFavorite]);

  const enableDynamicSizing = useMemo(() => true, []);

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing={enableDynamicSizing}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>{strings.favoriteSheet.title}</Text>
        <Text style={styles.subtitle}>{strings.favoriteSheet.subtitle}</Text>

        {/* Save bag option */}
        <TouchableOpacity style={styles.optionRow} onPress={() => setSaveBag((v) => !v)}>
          <Ionicons
            name={saveBag ? 'checkbox' : 'square-outline'}
            size={24}
            color={saveBag ? colors.primary[500] : colors.gray[400]}
          />
          <Text style={styles.optionLabel}>{strings.favoriteSheet.saveBag}</Text>
        </TouchableOpacity>
        {saveBag && (
          <TouchableOpacity style={styles.notifyRow} onPress={() => setNotifyBag((v) => !v)}>
            <Ionicons
              name={notifyBag ? 'notifications' : 'notifications-outline'}
              size={18}
              color={notifyBag ? colors.primary[500] : colors.gray[400]}
            />
            <Text style={[styles.notifyLabel, notifyBag && styles.notifyActive]}>
              {strings.favoriteSheet.notifyBag}
            </Text>
          </TouchableOpacity>
        )}

        {/* Save store option */}
        <TouchableOpacity style={styles.optionRow} onPress={() => setSaveStore((v) => !v)}>
          <Ionicons
            name={saveStore ? 'checkbox' : 'square-outline'}
            size={24}
            color={saveStore ? colors.primary[500] : colors.gray[400]}
          />
          <Text style={styles.optionLabel}>{strings.favoriteSheet.saveStore}</Text>
        </TouchableOpacity>
        {saveStore && (
          <TouchableOpacity style={styles.notifyRow} onPress={() => setNotifyStore((v) => !v)}>
            <Ionicons
              name={notifyStore ? 'notifications' : 'notifications-outline'}
              size={18}
              color={notifyStore ? colors.primary[500] : colors.gray[400]}
            />
            <Text style={[styles.notifyLabel, notifyStore && styles.notifyActive]}>
              {strings.favoriteSheet.notifyStore}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonContainer}>
          <Button
            label={strings.favoriteSheet.save}
            onPress={handleSave}
            size="lg"
            fullWidth
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

FavoriteBottomSheet.displayName = 'FavoriteBottomSheet';

export default FavoriteBottomSheet;

const styles = StyleSheet.create({
  handle: {
    backgroundColor: colors.gray[300],
    width: 40,
  },
  sheetBg: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxl,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[100],
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flex: 1,
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.xl + spacing.md,
  },
  notifyLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  notifyActive: {
    color: colors.primary[500],
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
});
