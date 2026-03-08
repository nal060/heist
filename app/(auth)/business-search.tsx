import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { searchPlaces } from '../../src/lib/googlePlaces';
import ScreenShell from '../../src/components/ui/ScreenShell';

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
}

export default function BusinessSearchScreen() {
  const router = useRouter();
  const { countryId, countryCode } = useLocalSearchParams<{
    countryId: string;
    countryCode: string;
  }>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    async (text: string) => {
      setQuery(text);
      if (text.trim().length < 3) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setSearching(true);
      try {
        const places = await searchPlaces(text, countryCode || 'pa');
        setResults(places);
        setHasSearched(true);
      } catch {
        setResults([]);
        setHasSearched(true);
      } finally {
        setSearching(false);
      }
    },
    [countryCode],
  );

  const handleSelectPlace = (place: PlaceResult) => {
    router.push({
      pathname: '/(auth)/business-review',
      params: {
        placeId: place.placeId,
        placeName: place.name,
        placeAddress: place.address,
        countryId,
      },
    });
  };

  const handleManualEntry = () => {
    router.push({
      pathname: '/(auth)/business-manual',
      params: { countryId },
    });
  };

  return (
    <ScreenShell
      title={strings.businessSearch.title}
      subtitle={strings.businessSearch.subtitle}
      scrollable={false}
      progress={{ current: 1, total: 6 }}
    >
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={strings.businessSearch.searchPlaceholder}
          placeholderTextColor={colors.gray[400]}
          value={query}
          onChangeText={handleSearch}
          autoFocus
          autoCapitalize="words"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      {searching && (
        <ActivityIndicator size="small" color={colors.primary[500]} style={styles.loader} />
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultRow}
            onPress={() => handleSelectPlace(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="location-outline" size={20} color={colors.primary[500]} style={styles.resultIcon} />
            <View style={styles.resultText}>
              <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          hasSearched && !searching ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{strings.businessSearch.noResults}</Text>
              <TouchableOpacity onPress={handleManualEntry}>
                <Text style={styles.manualLink}>{strings.businessSearch.addManually}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {!hasSearched && (
        <TouchableOpacity style={styles.manualButton} onPress={handleManualEntry}>
          <Text style={styles.manualButtonText}>{strings.businessSearch.addManually}</Text>
        </TouchableOpacity>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  loader: {
    marginVertical: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  resultIcon: {
    marginRight: spacing.md,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  resultAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  manualLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  manualButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  manualButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
});
