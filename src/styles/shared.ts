import { colors, typography, spacing, borderRadius } from '../theme';

export const sharedStyles = {
  // Layout
  container: {
    flex: 1 as const,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.xxl,
  },
  containerNoPadding: {
    flex: 1 as const,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1 as const,
    backgroundColor: colors.background.primary,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  scroll: {
    flex: 1 as const,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // Navigation
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.lg,
  },

  // Typography
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xxl,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },

  // Footer
  footer: {
    paddingTop: spacing.lg,
  },

  // Forms
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
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center' as const,
    marginTop: spacing.md,
  },

  // Selection controls
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  circleSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  optionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },

  // Page indicators
  dotsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  dotActive: {
    backgroundColor: colors.primary[500],
  },
} as const;
