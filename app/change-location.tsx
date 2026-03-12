import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '../src/theme';
import { strings } from '../src/constants/strings';
import { FIFTY_MILES_IN_METERS } from '../src/data';
import { useLocation } from '../src/context/LocationContext';

interface AddressResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function searchPanamaAddresses(query: string): Promise<AddressResult[]> {
  const enrichedQuery = /panama/i.test(query) ? query : `${query}, Panama`;
  const params = new URLSearchParams({
    q: enrichedQuery,
    countrycodes: 'pa',
    format: 'json',
    limit: '6',
    addressdetails: '0',
    'accept-language': 'es',
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'User-Agent': 'HeistApp/1.0' },
  });
  const data: NominatimResult[] = await response.json();
  return data.map((r) => ({
    id: String(r.place_id),
    name: r.display_name,
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
  }));
}

const DEFAULT_REGION = {
  latitude: strings.discover.latitude,
  longitude: strings.discover.longitude,
  latitudeDelta: 1.5,
  longitudeDelta: 1.5,
};

export default function ChangeLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [query, setQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number }>({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedAddress || !query.trim()) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPanamaAddresses(query.trim());
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
  }, [query, selectedAddress]);

  const showSuggestions = query.trim().length > 0 && !selectedAddress;

  function selectAddress(address: AddressResult) {
    setSelectedAddress(address);
    setQuery(address.name);
    Keyboard.dismiss();

    setMapCenter({ latitude: address.latitude, longitude: address.longitude });
    mapRef.current?.animateToRegion(
      { latitude: address.latitude, longitude: address.longitude, latitudeDelta: 1.5, longitudeDelta: 1.5 },
      500,
    );
  }

  async function handleLocateMe() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(strings.changeLocation.permissionDenied, strings.changeLocation.permissionMessage);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      setMapCenter({ latitude, longitude });
      setSelectedAddress({
        id: 'current',
        name: strings.changeLocation.myCurrentLocation,
        latitude,
        longitude,
      });
      setQuery(strings.changeLocation.myCurrentLocation);
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 1.5, longitudeDelta: 1.5 },
        500,
      );
    } catch {
      Alert.alert(strings.common.error, strings.changeLocation.locationError);
    } finally {
      setLocating(false);
    }
  }

  const { location: savedLocation, setLocation } = useLocation();

  async function handleConfirm() {
    if (!selectedAddress) return;
    await setLocation({
      name: selectedAddress.name,
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    });
    if (savedLocation) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {savedLocation ? (
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.headerTitle}>{strings.changeLocation.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.inputRow}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder={strings.changeLocation.searchPlaceholder}
            placeholderTextColor={colors.text.tertiary}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (selectedAddress) setSelectedAddress(null);
            }}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setSelectedAddress(null);
              }}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete suggestions */}
        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            {searching ? (
              <View style={styles.suggestionItem}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            ) : (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => selectAddress(item)}>
                    <Ionicons name="location-outline" size={18} color={colors.text.secondary} />
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.suggestionItem}>
                    <Text style={styles.noResultsText}>{strings.changeLocation.noResults}</Text>
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>

      {/* Locate Me button */}
      <TouchableOpacity style={styles.locateButton} onPress={handleLocateMe} disabled={locating}>
        {locating ? (
          <ActivityIndicator size="small" color={colors.primary[500]} />
        ) : (
          <Ionicons name="navigate" size={20} color={colors.primary[500]} />
        )}
        <Text style={styles.locateButtonText}>{strings.changeLocation.locateMe}</Text>
      </TouchableOpacity>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={DEFAULT_REGION}
        >
          <Circle
            center={mapCenter}
            radius={FIFTY_MILES_IN_METERS}
            strokeColor={colors.primary[500]}
            fillColor="rgba(66, 133, 244, 0.15)"
            strokeWidth={2}
          />
        </MapView>
      </View>

      {/* Confirm button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedAddress && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedAddress}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>{strings.changeLocation.confirm}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  suggestionsContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    marginTop: spacing.xs,
    maxHeight: 200,
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
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  noResultsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  locateButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  map: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});
