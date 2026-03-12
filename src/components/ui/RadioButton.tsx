import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface RadioButtonProps {
  selected: boolean;
  color?: string;
  size?: number;
}

export default function RadioButton({
  selected,
  color = colors.primary[500],
  size = 24,
}: RadioButtonProps) {
  const innerSize = size / 2;

  return (
    <View
      style={[
        styles.outer,
        { width: size, height: size, borderRadius: size / 2 },
        selected && { borderColor: color },
      ]}
    >
      {selected && (
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: color,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
