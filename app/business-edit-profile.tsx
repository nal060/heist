import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { strings } from '../src/constants/strings';
import { useAuth } from '../src/context/AuthContext';
import { getBusinessForUser, updateBusiness } from '../src/data/auth';
import type { Business } from '../src/types';
import ScreenShell from '../src/components/ui/ScreenShell';
import FormField from '../src/components/ui/FormField';
import Button from '../src/components/ui/Button';
import ErrorState from '../src/components/ui/ErrorState';

export default function BusinessEditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const loadBusiness = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const biz = await getBusinessForUser(user.id);
      if (biz) {
        setBusiness(biz);
        setName(biz.name);
        setDescription(biz.description || '');
        setAddress(biz.address);
        setPhone(biz.phone || '');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  const handleSave = async () => {
    if (!business || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateBusiness(business.id, {
        name: name.trim(),
        description: description.trim() || null,
        address: address.trim(),
        phone: phone.trim() || null,
      });
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : strings.common.error;
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error && !business) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ErrorState message={error} onRetry={loadBusiness} />
      </View>
    );
  }

  return (
    <ScreenShell
      title={strings.businessProfileEdit.title}
      subtitle={strings.businessProfileEdit.subtitle}
      keyboardAvoiding
      footer={
        <Button
          label={strings.businessProfileEdit.save}
          onPress={handleSave}
          size="lg"
          fullWidth
          loading={saving}
          disabled={!name.trim()}
        />
      }
    >
      <FormField label={strings.businessProfileEdit.nameLabel} value={name} onChangeText={setName} />
      <FormField label={strings.businessProfileEdit.descriptionLabel} value={description} onChangeText={setDescription} multiline />
      <FormField label={strings.businessProfileEdit.addressLabel} value={address} onChangeText={setAddress} />
      <FormField label={strings.businessProfileEdit.phoneLabel} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
