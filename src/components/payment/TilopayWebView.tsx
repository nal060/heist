import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MockCardForm from './MockCardForm';
import { colors, spacing, typography, shadows } from '../../theme';
import { strings } from '../../constants/strings';

// ─── Constants ────────────────────────────────────────────────────────────────

const IS_MOCK = process.env.EXPO_PUBLIC_TILOPAY_MOCK === 'true';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseQueryParams(url: string): Record<string, string> {
  const query = url.split('?')[1] ?? '';
  return Object.fromEntries(
    query
      .split('&')
      .filter(Boolean)
      .map((p) => {
        const [k, v] = p.split('=');
        return [decodeURIComponent(k ?? ''), decodeURIComponent(v ?? '')];
      })
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TilopayWebViewProps {
  url: string;
  redirectPattern: string;
  onSuccess: (params: Record<string, string>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TilopayWebView({
  url,
  redirectPattern,
  onSuccess,
  onCancel,
  submitLabel,
}: TilopayWebViewProps) {
  const insets = useSafeAreaInsets();
  const [webViewLoading, setWebViewLoading] = useState(true);

  const shouldRenderMock = IS_MOCK || url.startsWith('mock://');

  const handleShouldStartLoad = useCallback((request: ShouldStartLoadRequest): boolean => {
    if (request.url.startsWith(redirectPattern)) {
      const params = parseQueryParams(request.url);
      onSuccess(params);
      return false;
    }
    return true;
  }, [redirectPattern, onSuccess]);

  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View
        style={[styles.container, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={[styles.header, shadows.sm as ViewStyle]}>
          <Text style={styles.headerTitle}>
            {strings.tilopayWebView.title}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={strings.common.close}
          >
            <Ionicons
              name={'close' as React.ComponentProps<typeof Ionicons>['name']}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Body */}
        {shouldRenderMock ? (
          <MockCardForm onSuccess={onSuccess} onCancel={onCancel} submitLabel={submitLabel} />
        ) : (
          <View style={styles.webViewContainer}>
            {webViewLoading ? (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
              </View>
            ) : null}
            <WebView
              source={{ uri: url }}
              onShouldStartLoadWithRequest={handleShouldStartLoad}
              onLoadEnd={() => setWebViewLoading(false)}
              style={styles.webView}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.xl,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    zIndex: 1,
  },
});
