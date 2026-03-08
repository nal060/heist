import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getAllCategories } from '../../src/data/auth';
import type { Category } from '../../src/types';
import ScreenShell from '../../src/components/ui/ScreenShell';
import Button from '../../src/components/ui/Button';

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  'Comidas': { bg: '#E8F5E9', icon: '#2E7D32' },
  'Panaderia': { bg: '#FFF3E0', icon: '#E65100' },
  'Supermercado': { bg: '#E3F2FD', icon: '#1565C0' },
  'Cafe': { bg: '#FBE9E7', icon: '#BF360C' },
  'Restaurante': { bg: '#F3E5F5', icon: '#6A1B9A' },
  'Otros': { bg: '#F5F5F5', icon: '#616161' },
};

export default function BusinessCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    name: string;
    description: string;
    address: string;
    phone: string;
    latitude: string;
    longitude: string;
    googlePlaceId: string;
    countryId: string;
    photoRefs: string;
  }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    if (!selectedId) return;
    router.push({
      pathname: '/(auth)/bag-name',
      params: { ...params, categoryId: selectedId },
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScreenShell
      title={strings.businessCategory.title}
      subtitle={strings.businessCategory.subtitle}
      progress={{ current: 2, total: 6 }}
      footer={
        <Button
          label={strings.businessCategory.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
          disabled={!selectedId}
        />
      }
    >
      <View style={styles.optionsList}>
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          const catColors = CATEGORY_COLORS[cat.name] || CATEGORY_COLORS['Otros'];

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.optionRow,
                isSelected && { borderColor: catColors.icon, backgroundColor: catColors.bg },
              ]}
              onPress={() => setSelectedId(cat.id)}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {isSelected && <View style={[styles.radioInner, { backgroundColor: catColors.icon }]} />}
              </View>
              <Text style={[styles.optionText, isSelected && { fontWeight: typography.fontWeight.semibold }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
});
