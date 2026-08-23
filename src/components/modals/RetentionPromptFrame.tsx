import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';

interface ActionStyle {
  background: string;
  shadow: string;
  text: string;
  light?: string;
}

interface Props {
  zIndex: number;
  accent: string;
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  primaryLabel: string;
  primaryStyle: ActionStyle;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  children?: (compact: boolean) => React.ReactNode;
}

/** Shared pixel-art shell for low-pressure return and reward prompts. */
export function RetentionPromptFrame({
  zIndex,
  accent,
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryStyle,
  onPrimary,
  secondaryLabel,
  onSecondary,
  children,
}: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 350 || height < 640;
  return (
    <ModalBackdrop zIndex={zIndex}>
      <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: compact ? 10 : 14 }}>
        <View style={{ backgroundColor: accent, borderWidth: 3, borderColor: C.inkSoft, padding: 7 }}>
          <PixelText font="pixel" size={compact ? 7 : 8} color={C.white} style={{ textAlign: 'center' }}>{eyebrow}</PixelText>
        </View>
        <View style={{ gap: 8, paddingVertical: compact ? 10 : 14 }}>
          <PixelText font="body" size={compact ? 23 : 27} color={C.textDark} style={{ textAlign: 'center' }}>{title}</PixelText>
          {description}
        </View>
        {children?.(compact)}
        <View style={{ gap: 8 }}>
          <PixelButton bg={primaryStyle.background} shadow={primaryStyle.shadow} light={primaryStyle.light} onPress={onPrimary} innerStyle={{ paddingVertical: 11, alignItems: 'center' }}>
            <PixelText font="pixel" size={compact ? 7 : 8} color={primaryStyle.text} style={{ textAlign: 'center' }}>{primaryLabel}</PixelText>
          </PixelButton>
          <PixelButton bg={C.lightFill} shadow={C.paleEdge} onPress={onSecondary} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
            <PixelText font="pixel" size={8} color={C.blue}>{secondaryLabel}</PixelText>
          </PixelButton>
        </View>
      </View>
    </ModalBackdrop>
  );
}
