import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';
import { borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';

export default function RoleSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(card1Anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(card2Anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [card1Anim, card2Anim]);

  const handleConsumer = () => {
    router.push({ pathname: '/(auth)/sign-in', params: { role: 'consumer' } });
  };

  const handleBusiness = () => {
    router.push({ pathname: '/(auth)/sign-in', params: { role: 'business' } });
  };

  const cardStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{strings.roleSelect.title}</Text>
        <Text style={styles.subtitle}>{strings.roleSelect.subtitle}</Text>
      </View>

      <View style={styles.cards}>
        <Animated.View style={cardStyle(card1Anim)}>
          <TouchableOpacity
            style={styles.card}
            onPress={handleConsumer}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="bag-handle-outline" size={32} color={colors.primary[500]} />
            </View>
            <Text style={styles.cardTitle}>
              {strings.roleSelect.consumer.title}
            </Text>
            <Text style={styles.cardDescription}>
              {strings.roleSelect.consumer.description}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={colors.primary[500]}
              style={styles.cardArrow}
            />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={cardStyle(card2Anim)}>
          <TouchableOpacity
            style={styles.card}
            onPress={handleBusiness}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="storefront-outline" size={32} color="#F57C00" />
            </View>
            <Text style={styles.cardTitle}>
              {strings.roleSelect.business.title}
            </Text>
            <Text style={styles.cardDescription}>
              {strings.roleSelect.business.description}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#F57C00"
              style={styles.cardArrow}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xxxxl,
  },
  title: {
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
  },
  cards: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    ...shadows.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  cardArrow: {
    position: 'absolute',
    top: spacing.xxl,
    right: spacing.xxl,
  },
});
