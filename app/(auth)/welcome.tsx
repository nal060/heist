import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import { APP_NAME } from '../../src/constants/app';
import Button from '../../src/components/ui/Button';
import { simulateConsumerLogin, simulateBusinessLogin } from '../../src/data/devSimulate';

const IS_DEV = __DEV__;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [simulateLoading, setSimulateLoading] = useState<'consumer' | 'business' | null>(null);
  const [simulateError, setSimulateError] = useState('');

  const handleSimulate = useCallback(async (mode: 'consumer' | 'business') => {
    setSimulateLoading(mode);
    setSimulateError('');
    try {
      if (mode === 'consumer') {
        await simulateConsumerLogin();
      } else {
        await simulateBusinessLogin();
      }
      // AuthContext onAuthStateChange picks up the new session automatically
    } catch (err: unknown) {
      setSimulateError(err instanceof Error ? err.message : strings.common.error);
    } finally {
      setSimulateLoading(null);
    }
  }, []);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, contentOpacity, contentTranslateY]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.topSection}>
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🥡</Text>
          </View>
          <Text style={styles.logoText}>{APP_NAME}</Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        <Text style={styles.tagline}>{strings.welcome.tagline}</Text>
        <Text style={styles.subtitle}>{strings.welcome.subtitle}</Text>

        <View style={styles.buttonContainer}>
          <Button
            label={strings.welcome.getStarted}
            onPress={() => router.push('/(auth)/role-select')}
            size="lg"
            fullWidth
          />
          <Button
            label={strings.welcome.haveAccount}
            onPress={() => router.push('/(auth)/sign-in')}
            variant="ghost"
            size="lg"
            fullWidth
          />
        </View>

        {IS_DEV && (
          <View style={styles.simulateSection}>
            <View style={styles.simulateDivider}>
              <View style={styles.simulateLine} />
              <Text style={styles.simulateLabel}>{strings.simulate.label}</Text>
              <View style={styles.simulateLine} />
            </View>
            <View style={styles.simulateButtons}>
              <Button
                label={strings.simulate.consumer}
                onPress={() => handleSimulate('consumer')}
                variant="outline"
                size="sm"
                loading={simulateLoading === 'consumer'}
                disabled={simulateLoading !== null}
                style={styles.simulateButton}
              />
              <Button
                label={strings.simulate.business}
                onPress={() => handleSimulate('business')}
                variant="outline"
                size="sm"
                loading={simulateLoading === 'business'}
                disabled={simulateLoading !== null}
                style={styles.simulateButton}
              />
            </View>
            {!!simulateError && (
              <Text style={styles.simulateError}>{simulateError}</Text>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 56,
  },
  logoText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    letterSpacing: 4,
  },
  bottomSection: {
    paddingHorizontal: spacing.xxl,
  },
  tagline: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing.xxxl,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
  simulateSection: {
    marginTop: spacing.xl,
  },
  simulateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  simulateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  simulateLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginHorizontal: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  simulateButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  simulateButton: {
    flex: 1,
  },
  simulateError: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
