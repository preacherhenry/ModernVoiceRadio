import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, type TextInputProps } from 'react-native-paper';
import { useAppTheme } from '@theme/ThemeProvider';
import { fontFamily, fontSize } from '@constants/typography';
import { spacing } from '@constants/spacing';

interface Props extends Omit<TextInputProps, 'theme'> {
  errorMessage?: string;
  isPassword?: boolean;
}

/** Thin MD3-outlined TextInput wrapper with built-in error text + a password-visibility toggle. */
const AppTextInput: React.FC<Props> = ({ errorMessage, isPassword, ...rest }) => {
  const { colors } = useAppTheme();
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        outlineStyle={{ borderRadius: 14 }}
        secureTextEntry={isPassword ? hidden : undefined}
        right={isPassword ? (
          <TextInput.Icon icon={hidden ? 'eye-off' : 'eye'} onPress={() => setHidden((v) => !v)} />
        ) : undefined}
        error={!!errorMessage}
        {...rest}
      />
      {!!errorMessage && <Text style={[styles.error, { color: colors.error }]}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  error: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 4, marginLeft: 4 },
});

export default AppTextInput;
