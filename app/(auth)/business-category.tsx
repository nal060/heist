import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getAllCategories } from '../../src/data/auth';
import type { Category } from '../../src/types';
import ScreenShell from '../../src/components/ui/ScreenShell';
import RadioButton from '../../src/components/ui/RadioButton';
import Button from '../../src/components/ui/Button';


export default function BusinessCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    description: string;
    address: string;
    phone: string;
    latitude: string;
    longitude: string;
    googlePlaceId: string;
    photoUrl: string;
  }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCategories()
      .then((cats) => {
        const otros = cats.filter((c) => c.name.toLowerCase() === 'otros');
        const rest = cats.filter((c) => c.name.toLowerCase() !== 'otros');
        setCategories([...rest, ...otros]);
      })
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

  return (
    <ScreenShell
      title={strings.businessCategory.title}
      subtitle={strings.businessCategory.subtitle}
      loading={loading}
      progress={{ current: 3, total: 7 }}
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

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.optionRow,
                isSelected && { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
              ]}
              onPress={() => setSelectedId(cat.id)}
              activeOpacity={0.7}
            >
              <RadioButton selected={isSelected} color={colors.primary[500]} />
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
    gap: spacing.md,
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
});
