import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { DEFAULT_PHONE_PREFIX } from '../../src/constants/app';
import ProgressBar from '../../src/components/ui/ProgressBar';
import Button from '../../src/components/ui/Button';

interface FormData {
  name: string;
  address: string;
  city: string;
  phone: string;
}

export default function BusinessManualScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    countryId: string;
    prefillName?: string;
    prefillAddress?: string;
    prefillPhone?: string;
    prefillLat?: string;
    prefillLon?: string;
    googlePlaceId?: string;
  }>();

  const [form, setForm] = useState<FormData>({
    name: params.prefillName || '',
    address: params.prefillAddress || '',
    city: '',
    phone: params.prefillPhone || `${DEFAULT_PHONE_PREFIX} `,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = strings.common.required;
    if (!form.address.trim()) newErrors.address = strings.common.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    router.push({
      pathname: '/(auth)/business-category',
      params: {
        name: form.name.trim(),
        description: '',
        address: form.city ? `${form.address.trim()}, ${form.city.trim()}` : form.address.trim(),
        phone: form.phone.trim(),
        latitude: params.prefillLat || '8.953',
        longitude: params.prefillLon || '-79.534',
        googlePlaceId: params.googlePlaceId || '',
        countryId: params.countryId,
        photoRefs: '[]',
      },
    });
  };

  const renderInput = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    options?: { keyboardType?: 'default' | 'phone-pad' },
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        value={form[field]}
        onChangeText={(text) => updateField(field, text)}
        keyboardType={options?.keyboardType || 'default'}
      />
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{strings.businessManualEntry.title}</Text>
          <Text style={styles.subtitle}>{strings.businessManualEntry.subtitle}</Text>

          {renderInput('name', strings.businessManualEntry.nameLabel, strings.businessManualEntry.namePlaceholder)}
          {renderInput('address', strings.businessManualEntry.addressLabel, strings.businessManualEntry.addressPlaceholder)}
          {renderInput('city', strings.businessManualEntry.cityLabel, strings.businessManualEntry.cityPlaceholder)}
          {renderInput('phone', strings.businessManualEntry.phoneLabel, strings.businessManualEntry.phonePlaceholder, { keyboardType: 'phone-pad' })}
        </ScrollView>

        <ProgressBar current={1} total={6} />

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
          <Button
            label={strings.businessManualEntry.continue}
            onPress={handleContinue}
            size="lg"
            fullWidth
            disabled={!form.name.trim() || !form.address.trim()}
          />
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  fieldGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});
