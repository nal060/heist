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
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { getActiveCountries } from '../../src/data/auth';
import { useAuth } from '../../src/context/AuthContext';
import Button from '../../src/components/ui/Button';
import type { Country } from '../../src/types';

export default function CountrySelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { setUserRole } = useAuth();

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCountries()
      .then((data) => {
        setCountries(data);
        if (data.length === 1) setSelectedCountry(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    if (!selectedCountry || !termsAccepted) return;

    // Store the role in auth context
    if (role === 'business') {
      setUserRole('business');
      router.push({
        pathname: '/(auth)/business-search',
        params: { countryId: selectedCountry.id, countryCode: selectedCountry.code },
      });
    } else {
      setUserRole('consumer');
      router.push({
        pathname: '/(auth)/user-preferences',
        params: { countryId: selectedCountry.id },
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>{strings.countrySelect.title}</Text>

      <Text style={styles.label}>{strings.countrySelect.chooseCountry}</Text>

      {countries.length === 0 ? (
        <Text style={styles.emptyText}>{strings.countrySelect.noCountries}</Text>
      ) : (
        <View style={styles.countryList}>
          {countries.map((country) => {
            const isSelected = selectedCountry?.id === country.id;
            return (
              <TouchableOpacity
                key={country.id}
                style={[styles.countryRow, isSelected && styles.countryRowSelected]}
                onPress={() => setSelectedCountry(country)}
                activeOpacity={0.7}
              >
                <Text style={styles.countryFlag}>{country.flag_emoji}</Text>
                <Text style={styles.countryName}>{country.name}</Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary[500]} />
                )}
                {!isSelected && (
                  <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.termsRow}>
        <TouchableOpacity
          style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          {termsAccepted && (
            <Ionicons name="checkmark" size={16} color={colors.white} />
          )}
        </TouchableOpacity>
        <Text style={styles.termsText}>
          {strings.countrySelect.termsPrefix}
          <Text style={styles.termsLink}>{strings.countrySelect.termsLink}</Text>
          {strings.countrySelect.termsMiddle}
          <Text style={styles.termsLink}>{strings.countrySelect.privacyLink}</Text>
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button
          label={strings.countrySelect.signMeUp}
          onPress={handleContinue}
          size="lg"
          fullWidth
          disabled={!selectedCountry || !termsAccepted}
        />
      </View>
    </View>
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
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  countryList: {
    gap: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
  },
  countryRowSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  countryFlag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  countryName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.gray[400],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  termsText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  termsLink: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});
