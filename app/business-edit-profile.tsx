import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../src/theme';
import { strings } from '../src/constants/strings';
import { useAuth } from '../src/context/AuthContext';
import { getBusinessForUser, updateBusiness, uploadBusinessPhoto } from '../src/data/auth';
import { searchAddresses, getPlaceDetails } from '../src/lib/googlePlaces';
import type { Business } from '../src/types';
import ScreenShell from '../src/components/ui/ScreenShell';
import FormField from '../src/components/ui/FormField';
import Button from '../src/components/ui/Button';

const PHOTO_BANNER_HEIGHT = 160;

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
}

export default function BusinessEditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Address autocomplete state
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState('');
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBusiness = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const biz = await getBusinessForUser(user.id);
      if (biz) {
        setBusiness(biz);
        setName(biz.name);
        setDescription(biz.description || '');
        setAddress(biz.address);
        setPhone(biz.phone || '');
        setCurrentPhotoUrl(biz.photo_url ?? null);
        // Mark existing address as already validated
        setSelectedPlaceId('existing');
        setCoords({ latitude: biz.latitude, longitude: biz.longitude });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  const handleAddressChange = (text: string) => {
    setAddress(text);
    if (addressError) setAddressError('');
    if (selectedPlaceId) {
      setSelectedPlaceId(null);
      setCoords(null);
    }
  };

  // Debounced address search
  useEffect(() => {
    if (selectedPlaceId || !address.trim() || address.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddresses(address.trim());
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
  }, [address, selectedPlaceId]);

  const selectSuggestion = async (suggestion: PlaceSuggestion) => {
    setSelectedPlaceId(suggestion.placeId);
    setAddress(suggestion.address);
    setSuggestions([]);
    setAddressError('');
    Keyboard.dismiss();

    const details = await getPlaceDetails(suggestion.placeId);
    if (details) {
      setCoords({ latitude: details.latitude, longitude: details.longitude });
    }
  };

  const showSuggestions = address.trim().length >= 3 && !selectedPlaceId;

  const handleChangePhoto = useCallback(() => {
    Alert.alert(
      strings.businessProfileEdit.photoSheetTitle,
      undefined,
      [
        {
          text: strings.businessProfileEdit.photoSheetLibrary,
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(strings.bagForm.permissionsTitle, strings.bagForm.permissionsGallery);
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setNewPhotoUri(result.assets[0].uri);
            }
          },
        },
        {
          text: strings.businessProfileEdit.photoSheetCamera,
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(strings.bagForm.permissionsTitle, strings.bagForm.permissionsCamera);
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setNewPhotoUri(result.assets[0].uri);
            }
          },
        },
        { text: strings.common.cancel, style: 'cancel' },
      ],
    );
  }, []);

  const handleSave = async (): Promise<void> => {
    if (!business || !name.trim()) return;

    // If address was changed but not validated, resolve it
    let finalCoords = coords;
    if (!finalCoords && address.trim()) {
      setSaving(true);
      try {
        const results = await searchAddresses(address.trim());
        if (results.length === 0) {
          setAddressError(strings.businessManualEntry.addressNotFound);
          setSaving(false);
          return;
        }
        const details = await getPlaceDetails(results[0].placeId);
        if (!details) {
          setAddressError(strings.businessManualEntry.addressNotFound);
          setSaving(false);
          return;
        }
        finalCoords = { latitude: details.latitude, longitude: details.longitude };
        setCoords(finalCoords);
        setAddress(details.address);
        setSelectedPlaceId(results[0].placeId);
      } catch {
        setAddressError(strings.businessManualEntry.addressNotFound);
        setSaving(false);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | null = currentPhotoUrl;
      if (newPhotoUri) {
        photoUrl = await uploadBusinessPhoto(newPhotoUri);
      }

      await updateBusiness(business.id, {
        name: name.trim(),
        description: description.trim() || null,
        address: address.trim(),
        phone: phone.trim() || null,
        ...(finalCoords && { latitude: finalCoords.latitude, longitude: finalCoords.longitude }),
        ...(photoUrl !== currentPhotoUrl && { photo_url: photoUrl }),
      });
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell
      title={strings.businessProfileEdit.title}
      subtitle={strings.businessProfileEdit.subtitle}
      keyboardAvoiding
      loading={loading}
      loadingError={!business ? error : undefined}
      onRetry={loadBusiness}
      error={!loading && business && error ? error : undefined}
      footer={
        <Button
          label={strings.businessProfileEdit.save}
          onPress={handleSave}
          size="lg"
          fullWidth
          loading={saving}
          disabled={!name.trim()}
        />
      }
    >
      {/* Photo banner */}
      <TouchableOpacity
        style={styles.photoBanner}
        onPress={handleChangePhoto}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={strings.businessProfileEdit.changePhoto}
      >
        {newPhotoUri ? (
          <Image source={{ uri: newPhotoUri }} style={styles.bannerImage} contentFit="cover" transition={200} />
        ) : currentPhotoUrl ? (
          <Image source={{ uri: currentPhotoUrl }} style={styles.bannerImage} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Ionicons name="storefront-outline" size={40} color={colors.gray[300]} />
          </View>
        )}
        <View style={styles.bannerOverlay}>
          <Ionicons name="camera-outline" size={20} color={colors.white} />
          <Text style={styles.bannerOverlayText}>{strings.businessProfileEdit.changePhoto}</Text>
        </View>
      </TouchableOpacity>

      <FormField label={strings.businessProfileEdit.nameLabel} value={name} onChangeText={setName} />
      <FormField label={strings.businessProfileEdit.descriptionLabel} value={description} onChangeText={setDescription} multiline />

      {/* Address field with autocomplete */}
      <View style={addressStyles.wrapper}>
        <FormField
          label={strings.businessProfileEdit.addressLabel}
          value={address}
          onChangeText={handleAddressChange}
          error={addressError || undefined}
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
            {!searching && suggestions.length === 0 && address.trim().length >= 3 && (
              <View style={addressStyles.suggestionItem}>
                <Text style={addressStyles.noResultsText}>{strings.changeLocation.noResults}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <FormField label={strings.businessProfileEdit.phoneLabel} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  photoBanner: {
    width: '100%',
    height: PHOTO_BANNER_HEIGHT,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: spacing.lg,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bannerOverlayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

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
