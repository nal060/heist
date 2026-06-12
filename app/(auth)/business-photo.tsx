import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { uploadBusinessPhoto } from '../../src/data/auth';
import { getPhotoUrl } from '../../src/lib/googlePlaces';
import ScreenShell from '../../src/components/ui/ScreenShell';
import Button from '../../src/components/ui/Button';

export default function BusinessPhotoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photoRefs?: string }>();

  // Default photo pulled from the Google Places result (if the business was looked up).
  const googlePhotoUrl = useMemo<string | null>(() => {
    try {
      const refs = JSON.parse(params.photoRefs || '[]') as string[];
      return refs.length > 0 ? getPhotoUrl(refs[0], 800) : null;
    } catch {
      return null;
    }
  }, [params.photoRefs]);

  // User-picked replacement; when null we fall back to the Google default.
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const displayUri = localPhotoUri ?? googlePhotoUrl;
  const usingGoogleDefault = !localPhotoUri && !!googlePhotoUrl;

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para agregar una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhotoUri(result.assets[0].uri);
      setError('');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar una foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhotoUri(result.assets[0].uri);
      setError('');
    }
  };

  const handleContinue = async () => {
    // Re-host whichever photo is showing (user replacement or the Google default) to our bucket.
    const sourceUri = displayUri;
    if (!sourceUri) {
      setError(strings.businessPhoto.photoRequired);
      return;
    }
    setUploading(true);
    setError('');
    try {
      const photoUrl = await uploadBusinessPhoto(sourceUri);
      const { photoRefs: _photoRefs, ...rest } = params;
      router.push({
        pathname: '/(auth)/business-category',
        params: { ...rest, photoUrl },
      });
    } catch (err) {
      console.error('[BusinessPhoto] upload failed:', err);
      setError('No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScreenShell
      title={strings.businessPhoto.title}
      subtitle={strings.businessPhoto.subtitle}
      progress={{ current: 2, total: 7 }}
      error={error || undefined}
      footer={
        <Button
          label={uploading ? strings.businessPhoto.uploading : strings.businessPhoto.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
          loading={uploading}
          disabled={!displayUri || uploading}
        />
      }
    >
      {/* Photo preview */}
      <TouchableOpacity
        style={styles.previewContainer}
        onPress={pickFromLibrary}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={displayUri ? strings.businessPhoto.changePhoto : strings.businessPhoto.pickFromLibrary}
      >
        {displayUri ? (
          <>
            <Image
              source={{ uri: displayUri }}
              style={styles.preview}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.changeOverlay}>
              <Ionicons name="camera-outline" size={22} color={colors.white} />
              <Text style={styles.changeText}>{strings.businessPhoto.changePhoto}</Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="storefront-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.placeholderText}>{strings.businessPhoto.pickFromLibrary}</Text>
          </View>
        )}
      </TouchableOpacity>

      {usingGoogleDefault && (
        <Text style={styles.googleHint}>{strings.businessPhoto.googleHint}</Text>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={pickFromLibrary}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={strings.businessPhoto.pickFromLibrary}
        >
          <Ionicons name="images-outline" size={22} color={colors.primary[500]} />
          <Text style={styles.actionText}>{strings.businessPhoto.pickFromLibrary}</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={takePhoto}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={strings.businessPhoto.takePhoto}
        >
          <Ionicons name="camera-outline" size={22} color={colors.primary[500]} />
          <Text style={styles.actionText}>{strings.businessPhoto.takePhoto}</Text>
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: spacing.lg,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  changeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  changeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  googleHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.primary,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
});
