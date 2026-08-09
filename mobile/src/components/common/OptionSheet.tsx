import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { radius, spacing } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';

interface Option {
  label: string;
  value: string;
  description?: string;
}

interface Props {
  visible: boolean;
  title: string;
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onDismiss: () => void;
}

/** Bottom-anchored option picker used for bitrate, sleep timer and equalizer preset selection. */
const OptionSheet: React.FC<Props> = ({
  visible, title, options, selectedValue, onSelect, onDismiss,
}) => {
  const { colors } = useAppTheme();

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.wrap}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.handle} />
          <Text style={[typeStyles.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>{title}</Text>
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <Pressable
                key={option.value}
                onPress={() => { onSelect(option.value); onDismiss(); }}
                style={[styles.row, isSelected && { backgroundColor: colors.primaryContainer }]}
              >
                <View>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>{option.label}</Text>
                  {!!option.description && <Text style={[styles.description, { color: colors.textSecondary }]}>{option.description}</Text>}
                </View>
                {isSelected && <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  wrap: { justifyContent: 'flex-end', margin: 0 },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.4)', alignSelf: 'center', marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.md,
  },
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base },
  description: { fontFamily: fontFamily.body, fontSize: fontSize.xs, marginTop: 2 },
});

export default OptionSheet;
