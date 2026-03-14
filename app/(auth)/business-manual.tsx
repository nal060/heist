import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { strings } from '../../src/constants/strings';
import ScreenShell from '../../src/components/ui/ScreenShell';
import FormField from '../../src/components/ui/FormField';
import Button from '../../src/components/ui/Button';

interface FormData {
  name: string;
  address: string;
  city: string;
  phone: string;
}

export default function BusinessManualScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    address?: string;
    phone?: string;
    categoryId?: string;
  }>();

  const [form, setForm] = useState<FormData>({
    name: params.name || '',
    address: params.address || '',
    city: '',
    phone: params.phone || '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleContinue = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = strings.common.required;
    if (!form.address.trim()) newErrors.address = strings.common.required;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    router.push({
      pathname: '/(auth)/business-category',
      params: {
        ...params,
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
      },
    });
  };

  return (
    <ScreenShell
      title={strings.businessManualEntry.title}
      subtitle={strings.businessManualEntry.subtitle}
      keyboardAvoiding
      progress={{ current: 1, total: 6 }}
      footer={
        <Button
          label={strings.businessManualEntry.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
        />
      }
    >
      <FormField
        label={strings.businessManualEntry.nameLabel}
        value={form.name}
        onChangeText={(t) => updateField('name', t)}
        placeholder={strings.businessManualEntry.namePlaceholder}
        error={errors.name}
      />
      <FormField
        label={strings.businessManualEntry.addressLabel}
        value={form.address}
        onChangeText={(t) => updateField('address', t)}
        placeholder={strings.businessManualEntry.addressPlaceholder}
        error={errors.address}
      />
      <FormField
        label={strings.businessManualEntry.cityLabel}
        value={form.city}
        onChangeText={(t) => updateField('city', t)}
        placeholder={strings.businessManualEntry.cityPlaceholder}
      />
      <FormField
        label={strings.businessManualEntry.phoneLabel}
        value={form.phone}
        onChangeText={(t) => updateField('phone', t)}
        placeholder={strings.businessManualEntry.phonePlaceholder}
        keyboardType="phone-pad"
      />
    </ScreenShell>
  );
}
