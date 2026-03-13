import { colors } from '../theme';

export const sharedStyles = {
  containerNoPadding: {
    flex: 1 as const,
    backgroundColor: colors.background.primary,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
} as const;
