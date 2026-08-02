import React from 'react';
import { ReturnRumour } from '@/services/returnRumour';
import { C } from '@/theme/theme';
import { PixelText } from '../ui/PixelText';
import { RetentionPromptFrame } from './RetentionPromptFrame';

interface Props { rumour: ReturnRumour; onFollow: () => void; onDismiss: () => void }

export function ReturnRumourModal({ rumour, onFollow, onDismiss }: Props) {
  return (
    <RetentionPromptFrame
      zIndex={58}
      accent={C.purpleDark}
      eyebrow={rumour.eyebrow}
      title={rumour.title}
      description={<PixelText font="body" size={18} color={C.textBrown} style={{ textAlign: 'center' }}>{rumour.body}</PixelText>}
      primaryLabel={rumour.cta}
      primaryStyle={{ background: C.purple, shadow: C.purpleDark, light: '#f0d9ff', text: C.blueDark }}
      onPrimary={onFollow}
      secondaryLabel="CONTINUE HERE"
      onSecondary={onDismiss}
    />
  );
}
