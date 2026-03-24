import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { searchAddresses, getPlaceDetails } from '../../src/lib/googlePlaces';
import ScreenShell from '../../src/components/ui/ScreenShell';
import FormField from '../../src/components/ui/FormField';
import Button from '../../src/components/ui/Button';

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}

interface FormData {
  name: string;
  address: string;
  phone: string;
}

export default function BusinessManualScreen() {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{
    name?: string;
    address?: string;
    phone?: string;
    categoryId?: string;
  }>();

  const [form, setForm] = useState<FormData>({
    name: routeParams.name || '',
    address: routeParams.address || '',
    phone: routeParams.phone || '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Address autocomplete state
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddressChange = (text: string) => {
    updateField('address', text);
    if (selectedPlaceId) {
      setSelectedPlaceId(null);
      setCoords(null);
    }
  };

  // Debounced address search
  useEffect(() => {
    if (selectedPlaceId || !form.address.trim() || form.address.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddresses(form.address.trim());
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.address, selectedPlaceId]);

  const selectSuggestion = async (suggestion: PlaceSuggestion) => {
    setSelectedPlaceId(suggestion.placeId);
    setForm((prev) => ({ ...prev, address: suggestion.address }));
    setSuggestions([]);
    if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
    Keyboard.dismiss();

    const details = await getPlaceDetails(suggestion.placeId);
    if (details) {
      setCoords({ latitude: details.latitude, longitude: details.longitude });
    }
  };

  const handleContinue = async () => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = strings.common.required;
    if (!form.address.trim()) newErrors.address = strings.common.required;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If user typed an address but didn't pick a suggestion, search and resolve it
    let finalCoords = coords;
    if (!finalCoords) {
      setValidating(true);
      try {
        const results = await searchAddresses(form.address.trim());
        if (results.length === 0) {
          setErrors((prev) => ({ ...prev, address: strings.businessManualEntry.addressNotFound }));
          setValidating(false);
          return;
        }
        const details = await getPlaceDetails(results[0].placeId);
        if (!details) {
          setErrors((prev) => ({ ...prev, address: strings.businessManualEntry.addressNotFound }));
          setValidating(false);
          return;
        }
        finalCoords = { latitude: details.latitude, longitude: details.longitude };
        setCoords(finalCoords);
        setForm((prev) => ({ ...prev, address: details.address }));
        setSelectedPlaceId(results[0].placeId);
      } catch {
        setErrors((prev) => ({ ...prev, address: strings.businessManualEntry.addressNotFound }));
        setValidating(false);
        return;
      } finally {
        setValidating(false);
      }
    }

    router.push({
      pathname: '/(auth)/business-category',
      params: {
        ...routeParams,
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        latitude: String(finalCoords.latitude),
        longitude: String(finalCoords.longitude),
      },
    });
  };

  const showSuggestions = form.address.trim().length >= 3 && !selectedPlaceId;

  return (
    <ScreenShell
      title={strings.businessManualEntry.title}
      subtitle={strings.businessManualEntry.subtitle}
      keyboardAvoiding
      progress={{ current: 1, total: 6 }}
      footer={
        <Button
          label={strings.businessManualEntry.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
          loading={validating}
        />
      }
    >
      <FormField
        label={strings.businessManualEntry.nameLabel}
        value={form.name}
        onChangeText={(t) => updateField('name', t)}
        placeholder={strings.businessManualEntry.namePlaceholder}
        error={errors.name}
        autoCapitalize="words"
      />

      {/* Address field with autocomplete */}
      <View style={addressStyles.wrapper}>
        <FormField
          label={strings.businessManualEntry.addressLabel}
          value={form.address}
          onChangeText={handleAddressChange}
          placeholder={strings.businessManualEntry.addressPlaceholder}
          error={errors.address}
          autoCapitalize="words"
        />
        {selectedPlaceId && coords && (
          <View style={addressStyles.validBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          </View>
        )}
        {showSuggestions && (
          <View style={addressStyles.suggestionsContainer}>
            {searching ? (
              <View style={addressStyles.suggestionItem}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            ) : (
              suggestions.map((item) => (
                <TouchableOpacity
                  key={item.placeId}
                  style={addressStyles.suggestionItem}
                  onPress={() => selectSuggestion(item)}
                >
                  <Ionicons name="location-outline" size={18} color={colors.text.secondary} />
                  <Text style={addressStyles.suggestionText} numberOfLines={2}>{item.address}</Text>
                </TouchableOpacity>
              ))
            )}
            {!searching && suggestions.length === 0 && form.address.trim().length >= 3 && (
              <View style={addressStyles.suggestionItem}>
                <Text style={addressStyles.noResultsText}>{strings.changeLocation.noResults}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <FormField
        label={strings.businessManualEntry.phoneLabel}
        value={form.phone}
        onChangeText={(t) => updateField('phone', t)}
        placeholder={strings.businessManualEntry.phonePlaceholder}
        keyboardType="phone-pad"
        maxLength={8}
      />
    </ScreenShell>
  );
}

const addressStyles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  validBadge: {
    position: 'absolute',
    right: spacing.lg,
    top: 40,
  },
  suggestionsContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    marginTop: -spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    flex: 1,
  },
  noResultsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
});
