import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

interface Props {
  children?: React.ReactNode;
  bg?: string;
  /** Crisp outer outline colour. */
  outline?: string;
  /** Bevel highlight (top-left) — emulates the mockup's inset light shadow. */
  light?: string;
  /** Bevel shadow (bottom-right) — emulates the mockup's inset dark shadow. */
  shadow?: string;
  outlineWidth?: number;
  bevelWidth?: number;
  style?: StyleProp<ViewStyle>;
  /** Style applied to the inner (content) view, e.g. padding. */
  innerStyle?: StyleProp<ViewStyle>;
}

/**
 * The fundamental pixel-art container. RN can't do `box-shadow: inset`, so the
 * mockup's beveled cards are recreated with nested borders:
 *   outer view  -> crisp dark outline
 *   inner view  -> top/left highlight + bottom/right shadow (raised bevel)
 */
export function PixelBox({
  children,
  bg = '#f6e9c8',
  outline = '#2a3550',
  light = '#fffaf0',
  shadow = '#d8c08f',
  outlineWidth = 2,
  bevelWidth = 2,
  style,
  innerStyle,
}: Props) {
  return (
    <View style={[{ borderWidth: outlineWidth, borderColor: outline, backgroundColor: bg }, style]}>
      <View
        style={[
          {
            borderTopWidth: bevelWidth,
            borderLeftWidth: bevelWidth,
            borderTopColor: light,
            borderLeftColor: light,
            borderBottomWidth: bevelWidth,
            borderRightWidth: bevelWidth,
            borderBottomColor: shadow,
            borderRightColor: shadow,
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
