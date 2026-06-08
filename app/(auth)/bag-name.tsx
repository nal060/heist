import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { strings } from '../../src/constants/strings';
import ScreenShell from '../../src/components/ui/ScreenShell';
import FormField from '../../src/components/ui/FormField';
import Button from '../../src/components/ui/Button';

const MAX_NAME_LENGTH = 200;
const MAX_DESC_LENGTH = 450;

export default function BagNameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState<string>(strings.bagNameSetup.nameDefault);
  const [description, setDescription] = useState<string>(strings.bagNameSetup.descriptionDefault);

  const handleContinue = () => {
    if (!name.trim()) return;
    router.push({
      pathname: '/(auth)/bag-size',
      params: { ...params, bagTitle: name.trim(), bagDescription: description.trim() },
    });
  };

  return (
    <ScreenShell
      title={strings.bagNameSetup.title}
      subtitle={strings.bagNameSetup.subtitle}
      keyboardAvoiding
      progress={{ current: 4, total: 7 }}
      footer={
        <Button
          label={strings.bagNameSetup.continue}
          onPress={handleContinue}
          size="lg"
          fullWidth
          disabled={!name.trim()}
        />
      }
    >
      <FormField
        label={strings.bagNameSetup.nameLabel}
        value={name}
        onChangeText={setName}
        maxLength={MAX_NAME_LENGTH}
        showCounter
      />
      <FormField
        label={strings.bagNameSetup.descriptionLabel}
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={MAX_DESC_LENGTH}
        showCounter
      />
    </ScreenShell>
  );
}
