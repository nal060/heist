import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { useAuth } from '../../src/context/AuthContext';
import { getUserRole } from '../../src/data/auth';
import { supabase } from '../../src/lib/supabase';
import ScreenShell from '../../src/components/ui/ScreenShell';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const { email, role } = useLocalSearchParams<{ email: string; role?: string }>();
  const { verifyOtp, signInWithOtp } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleCodeChange = async (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
    if (error) setError('');

    if (cleaned.length === CODE_LENGTH) {
      setLoading(true);
      let existingUser = false;
      try {
        await verifyOtp(email!, cleaned);

        // Check if the user already has a profile (returning user).
        // If so, skip onboarding — RootNavigator will redirect once
        // AuthContext picks up the session via onAuthStateChange.
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const { role: existingRole } = await getUserRole(currentUser.id);
          if (existingRole) {
            existingUser = true;
            return;
          }
        }

        const nextScreen = role === 'business' ? '/(auth)/business-search' : '/(auth)/user-preferences';
        router.replace(nextScreen);
        return;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '';
        const isExpired = message.toLowerCase().includes('expired');
        setError(isExpired ? strings.verify.expiredCode : strings.verify.invalidCode);
        shake();
        setCode('');
        inputRef.current?.focus();
      } finally {
        // Keep the loading spinner visible for existing users so the
        // screen stays stable until RootNavigator redirects.
        if (!existingUser) setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await signInWithOtp(email!);
      setCooldown(RESEND_COOLDOWN);
      setCode('');
      setError('');
    } catch {
      setError(strings.common.error);
    }
  };

  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      const isFocused = code.length === i;
      boxes.push(
        <View
          key={i}
          style={[
            styles.codeBox,
            isFocused && styles.codeBoxFocused,
            error && styles.codeBoxError,
            code[i] && styles.codeBoxFilled,
          ]}
        >
          <Text style={styles.codeDigit}>{code[i] || ''}</Text>
        </View>,
      );
    }
    return boxes;
  };

  return (
    <ScreenShell
      title={strings.verify.title}
      keyboardAvoiding
      scrollable={false}
    >
      <Text style={styles.subtitle}>
        {strings.verify.subtitle}{' '}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <Animated.View
        style={[styles.codeContainer, { transform: [{ translateX: shakeAnim }] }]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.codeBoxes}
        >
          {renderCodeBoxes()}
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          autoFocus
        />
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <Text style={styles.verifyingText}>{strings.common.loading}</Text>
      ) : (
        <Text style={styles.expiryHint}>{strings.verify.expiresIn}</Text>
      )}

      <TouchableOpacity
        onPress={handleResend}
        disabled={cooldown > 0}
        style={styles.resendButton}
      >
        <Text
          style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}
        >
          {cooldown > 0
            ? `${strings.verify.resendIn} ${cooldown}s`
            : strings.verify.resend}
        </Text>
      </TouchableOpacity>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xxxl,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  emailHighlight: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  codeContainer: {
    marginBottom: spacing.lg,
  },
  codeBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },
  codeBoxFocused: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  codeBoxError: {
    borderColor: colors.error,
  },
  codeBoxFilled: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.primary,
  },
  codeDigit: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  verifyingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  expiryHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  resendText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  resendTextDisabled: {
    color: colors.text.tertiary,
  },
});
