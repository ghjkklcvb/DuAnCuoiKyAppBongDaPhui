import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { forwardRef } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    children,
    style,
    disabled,
    ...props 
  }, ref) => {
    const colors = Colors;

    const getButtonStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      };

      // Size styles
      switch (size) {
        case 'sm':
          baseStyle.paddingHorizontal = 16;
          baseStyle.paddingVertical = 10;
          baseStyle.minHeight = 40;
          break;
        case 'lg':
          baseStyle.paddingHorizontal = 32;
          baseStyle.paddingVertical = 18;
          baseStyle.minHeight = 64;
          break;
        default: // md
          baseStyle.paddingHorizontal = 24;
          baseStyle.paddingVertical = 16;
          baseStyle.minHeight = 56;
      }

      // Variant styles
      switch (variant) {
        case 'secondary':
          baseStyle.backgroundColor = colors.secondary;
          break;
        case 'outline':
          baseStyle.backgroundColor = 'transparent';
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = colors.primary;
          break;
        case 'ghost':
          baseStyle.backgroundColor = 'transparent';
          break;
        default: // primary
          baseStyle.backgroundColor = colors.primary;
      }

      // Disabled state
      if (disabled || loading) {
        baseStyle.opacity = 0.6;
      }

      return baseStyle;
    };

    const getTextStyle = (): TextStyle => {
      const baseStyle: TextStyle = {
        fontWeight: '600',
      };

      // Size styles
      switch (size) {
        case 'sm':
          baseStyle.fontSize = 14;
          break;
        case 'lg':
          baseStyle.fontSize = 18;
          break;
        default: // md
          baseStyle.fontSize = 16;
      }

      // Variant styles
      switch (variant) {
        case 'outline':
          baseStyle.color = colors.primary;
          break;
        case 'ghost':
          baseStyle.color = colors.text;
          break;
        default: // primary, secondary
          baseStyle.color = '#FFFFFF';
      }

      return baseStyle;
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[getButtonStyle(), style]}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
            style={styles.loader}
          />
        )}
        
        {typeof children === 'string' ? (
          <ThemedText style={getTextStyle()}>
            {children}
          </ThemedText>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  loader: {
    marginRight: 8,
  },
});