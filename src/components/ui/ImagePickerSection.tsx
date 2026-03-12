import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { strings } from '../../constants/strings';

export interface PhotoItem {
  id: string;
  url: string;
  isNew?: boolean;
}

interface Props {
  photos: PhotoItem[];
  onAdd: (uri: string) => void;
  onRemove: (photo: PhotoItem) => void;
  maxPhotos?: number;
  uploading?: boolean;
}

export default function ImagePickerSection({ photos, onAdd, onRemove, maxPhotos = 5, uploading }: Props) {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('', `Maximo ${maxPhotos} fotos permitidas.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galeria.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onAdd(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{strings.bagForm.photos}</Text>
      <View style={styles.grid}>
        {photos.map((photo) => (
          <View key={photo.id} style={styles.photoWrapper}>
            <Image source={{ uri: photo.url }} style={styles.photo} contentFit="cover" />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(photo)}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < maxPhotos && (
          <TouchableOpacity style={styles.addBtn} onPress={pickImage} disabled={loading || uploading}>
            {loading || uploading ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={28} color={colors.primary[500]} />
                <Text style={styles.addText}>{strings.bagForm.addPhotos}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const PHOTO_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.white,
    borderRadius: 11,
  },
  addBtn: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
});
