import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import ScreenShell from '../../src/components/ui/ScreenShell';
import Button from '../../src/components/ui/Button';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithOtp } = useAuth();
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setError('');

    if (!EMAIL_REGEX.test(email.trim())) {
      setError(strings.signIn.invalidEmail);
      return;
    }

    setLoading(true);
    try {
      await signInWithOtp(email.trim());
      router.push({
        pathname: '/(auth)/verify',
        params: { email: email.trim(), role: role || '' },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const subtitle = role === 'business'
    ? strings.signIn.businessSubtitle
    : strings.signIn.subtitle;

  return (
    <ScreenShell
      keyboardAvoiding
      scrollable={false}
      footer={
        <Button
          label={strings.signIn.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
          loading={loading}
          disabled={!email.trim()}
        />
      }
    >
      <Text style={styles.title}>{strings.signIn.title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={error ? colors.error : colors.gray[400]}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder={strings.signIn.emailPlaceholder}
          placeholderTextColor={colors.gray[400]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    backgroundColor: colors.background.secondary,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
