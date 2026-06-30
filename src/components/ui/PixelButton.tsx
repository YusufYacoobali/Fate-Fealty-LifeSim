import React from 'react';
import { Pressable, View, ViewStyle, StyleProp } from 'react-native';

interface Props {
  children?: React.ReactNode;
  onPress?: () => void;
  bg: string;
  /** Bottom/right shadow colour for the chunky pixel button. */
  shadow: string;
  /** Optional top/left highlight. */
  light?: string;
  outline?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}

/**
 * A pressable pixel button. On press it nudges down 2px and drops its shadow,
 * matching the mockup's `.pbtn:active { transform: translateY(2px) }`.
 */
export function PixelButton({
  children,
  onPress,
  bg,
  shadow,
  light,
  outline = '#1a2e4a',
  disabled = false,
  style,
  innerStyle,
}: Props) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed && !disabled ? 2 : 0 }],
        },
        style,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            {
              backgroundColor: bg,
              borderWidth: 2,
              borderColor: outline,
              borderBottomWidth: pressed && !disabled ? 2 : 4,
              borderRightWidth: pressed && !disabled ? 2 : 4,
              borderBottomColor: shadow,
              borderRightColor: shadow,
              borderTopColor: light ?? outline,
              borderLeftColor: light ?? outline,
            },
            innerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </Pressable>
  );
}
