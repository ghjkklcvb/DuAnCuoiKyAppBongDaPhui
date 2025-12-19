import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { forwardRef, useState } from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TouchableOpacity
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export interface AnimatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

export const AnimatedInput = forwardRef<TextInput, AnimatedInputProps>(
  ({ 
    label, 
    error, 
    leftIcon, 
    rightIcon, 
    onRightIconPress,
    containerStyle,
    style,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const colors = Colors;
    const [isFocused, setIsFocused] = useState(false);
    
    const focusAnimation = useSharedValue(0);
    const scaleAnimation = useSharedValue(1);

    const animatedContainerStyle = useAnimatedStyle(() => {
      return {
        borderColor: withTiming(
          error 
            ? colors.lose 
            : focusAnimation.value 
              ? colors.primary 
              : colors.border,
          { duration: 200 }
        ),
        transform: [{ scale: scaleAnimation.value }],
      };
    });

    const animatedLabelStyle = useAnimatedStyle(() => {
      return {
        color: withTiming(
          error 
            ? colors.lose 
            : focusAnimation.value 
              ? colors.primary 
              : colors.text,
          { duration: 200 }
        ),
      };
    });

    const handleFocus = (e: any) => {
      setIsFocused(true);
      focusAnimation.value = 1;
      scaleAnimation.value = withSpring(1.02, { damping: 15 });
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      focusAnimation.value = 0;
      scaleAnimation.value = withSpring(1, { damping: 15 });
      onBlur?.(e);
    };

    return (
      <ThemedView style={[styles.container, containerStyle]}>
        {label && (
          <Animated.Text style={[styles.label, animatedLabelStyle]}>
            {label}
          </Animated.Text>
        )}
        
        <Animated.View style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
          },
          animatedContainerStyle,
        ]}>
          {leftIcon && (
            <IconSymbol
              name={leftIcon as any}
              size={20}
              color={isFocused ? colors.primary : colors.icon}
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
            onFocus={handleFocus}
            onBlur={handleBlur}
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
                color={isFocused ? colors.primary : colors.icon}
              />
            </TouchableOpacity>
          )}
        </Animated.View>
        
        {error && (
          <Animated.Text 
            style={[styles.error, { color: colors.lose }]}
          >
            {error}
          </Animated.Text>
        )}
      </ThemedView>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

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
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 20,
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    marginTop: 4,
  },
});