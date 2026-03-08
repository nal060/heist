import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../src/theme';
import { strings } from '../../src/constants/strings';
import ScreenShell from '../../src/components/ui/ScreenShell';

export default function RoleSelectScreen() {
  const router = useRouter();

  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(card1Anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(card2Anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [card1Anim, card2Anim]);

  const cardStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  });

  return (
    <ScreenShell
      title={strings.roleSelect.title}
      subtitle={strings.roleSelect.subtitle}
      scrollable={false}
      titleStyle={styles.titleCentered}
      subtitleStyle={styles.subtitleCentered}
    >
      <View style={styles.cards}>
        <Animated.View style={cardStyle(card1Anim)}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(auth)/sign-in', params: { role: 'consumer' } })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="bag-handle-outline" size={32} color={colors.primary[500]} />
            </View>
            <Text style={styles.cardTitle}>{strings.roleSelect.consumer.title}</Text>
            <Text style={styles.cardDescription}>{strings.roleSelect.consumer.description}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.primary[500]} style={styles.cardArrow} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={cardStyle(card2Anim)}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(auth)/sign-in', params: { role: 'business' } })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="storefront-outline" size={32} color="#F57C00" />
            </View>
            <Text style={styles.cardTitle}>{strings.roleSelect.business.title}</Text>
            <Text style={styles.cardDescription}>{strings.roleSelect.business.description}</Text>
            <Ionicons name="arrow-forward" size={20} color="#F57C00" style={styles.cardArrow} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  titleCentered: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitleCentered: {
    textAlign: 'center',
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xxxxl,
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
