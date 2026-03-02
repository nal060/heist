import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import ProgressBar from '../../src/components/ui/ProgressBar';
import Button from '../../src/components/ui/Button';

const MAX_NAME_LENGTH = 200;
const MAX_DESC_LENGTH = 450;

export default function BagNameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Pre-filled values — not placeholder, actual editable text
  const [name, setName] = useState<string>(strings.bagNameSetup.nameDefault);
  const [description, setDescription] = useState<string>(strings.bagNameSetup.descriptionDefault);

  const handleContinue = () => {
    if (!name.trim()) return;
    router.push({
      pathname: '/(auth)/bag-size',
      params: {
        ...params,
        bagTitle: name.trim(),
        bagDescription: description.trim(),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
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
          <Text style={styles.title}>{strings.bagNameSetup.title}</Text>
          <Text style={styles.subtitle}>{strings.bagNameSetup.subtitle}</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{strings.bagNameSetup.nameLabel}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(t) => setName(t.slice(0, MAX_NAME_LENGTH))}
              maxLength={MAX_NAME_LENGTH}
            />
            <Text style={styles.counter}>{name.length}/{MAX_NAME_LENGTH}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{strings.bagNameSetup.descriptionLabel}</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={(t) => setDescription(t.slice(0, MAX_DESC_LENGTH))}
              multiline
              textAlignVertical="top"
              maxLength={MAX_DESC_LENGTH}
            />
            <Text style={styles.counter}>{description.length}/{MAX_DESC_LENGTH}</Text>
          </View>
        </ScrollView>

        <ProgressBar current={3} total={6} />

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
          <Button
            label={strings.bagNameSetup.continue}
            onPress={handleContinue}
            size="lg"
            fullWidth
            disabled={!name.trim()}
          />
        </View>
      </View>
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
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  fieldGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
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
    backgroundColor: colors.background.primary,
  },
  inputMultiline: {
    height: 120,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  counter: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});
