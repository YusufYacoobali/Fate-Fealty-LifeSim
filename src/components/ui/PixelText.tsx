import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { FONT, textSize } from '@/theme/theme';

interface Props extends TextProps {
  font?: 'pixel' | 'body';
  size?: number;
  color?: string;
  style?: TextStyle | TextStyle[];
}

/**
 * Text helper that applies one of the two pixel fonts. 'pixel' (Press Start 2P)
 * is blocky and used for labels/headings; 'body' (VT323) is the readable body
 * face used for prose. Line height is tuned per-font to avoid clipping.
 */
export function PixelText({ font = 'body', size = 16, color = '#3a3320', style, children, ...rest }: Props) {
  const fontFamily = font === 'pixel' ? FONT.pixel : FONT.body;
  const scaledSize = textSize(size);
  const lineHeight = font === 'pixel' ? scaledSize * 1.5 : scaledSize * 1.1;
  return (
    <Text
      {...rest}
      style={[{ fontFamily, fontSize: scaledSize, color, lineHeight, includeFontPadding: false } as TextStyle, style as TextStyle]}
    >
      {children}
    </Text>
  );
}
