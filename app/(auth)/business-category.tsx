import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getAllCategories } from '../../src/data/auth';
import type { Category } from '../../src/types';
import ProgressBar from '../../src/components/ui/ProgressBar';
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

  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
  }, [fadeIn]);

  const handleContinue = () => {
    if (!selectedId) return;
    router.push({
      pathname: '/(auth)/bag-name',
      params: {
        ...params,
        categoryId: selectedId,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, { paddingTop: insets.top + spacing.lg, opacity: fadeIn }]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>{strings.businessCategory.title}</Text>
      <Text style={styles.subtitle}>{strings.businessCategory.subtitle}</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      <ProgressBar current={2} total={6} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.businessCategory.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
          disabled={!selectedId}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xxl,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  scroll: {
    flex: 1,
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
  footer: {
    paddingTop: spacing.lg,
  },
});
