import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { forwardRef } from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TouchableOpacity
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ 
    label, 
    error, 
    leftIcon, 
    rightIcon, 
    onRightIconPress,
    containerStyle,
    style,
    ...props 
  }, ref) => {
    const colors = Colors;

    return (
      <ThemedView style={[styles.container, containerStyle]}>
        {label && (
          <ThemedText style={[styles.label, { color: colors.text }]}>
            {label}
          </ThemedText>
        )}
        
        <ThemedView style={[
          styles.inputContainer,
          {
            borderColor: error ? colors.lose : colors.border,
            backgroundColor: colors.card,
          }
        ]}>
          {leftIcon && (
            <IconSymbol
              name={leftIcon as any}
              size={20}
              color={colors.icon}
              style={styles.leftIcon}
            />
          )}
          
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.text,
                flex: 1,
              },
              style,
            ]}
            placeholderTextColor={colors.icon}
            {...props}
          />
          
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIcon}
              disabled={!onRightIconPress}
            >
              <IconSymbol
                name={rightIcon as any}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          )}
        </ThemedView>
        
        {error && (
          <ThemedText style={[styles.error, { color: colors.lose }]}>
            {error}
          </ThemedText>
        )}
      </ThemedView>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
    padding: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 2,
  },
});
