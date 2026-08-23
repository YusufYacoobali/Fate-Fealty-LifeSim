import React from 'react';
import { PixelText } from '../ui/PixelText';
import { C } from '@/theme/theme';
import { RetentionPromptFrame } from './RetentionPromptFrame';

interface Props {
  onExplore: () => void;
  onDismiss: () => void;
}

/**
 * Shown once, at the moment the free first-life Pro sample is spent. It exists
 * to explain why the world just got smaller, not to nag: the shop promo handles
 * the recurring invitation.
 */
export function ProTrialEndedPrompt({ onExplore, onDismiss }: Props) {
  return (
    <RetentionPromptFrame
      zIndex={59}
      accent={C.blueDeep}
      eyebrow="THE ROYAL FAVOUR ENDS"
      title="Thy first life rode with a royal favour."
      description={
        <PixelText font="body" size={17} color={C.textBrown} style={{ textAlign: 'center' }}>
          Premium stations, ruler events, baronial holdings, and 50 deeds a year were thine for that one lifetime. This
          new life begins without them — unless thou keep the favour.
        </PixelText>
      }
      primaryLabel="KEEP THE FAVOUR"
      primaryStyle={{ background: C.charm, shadow: C.charmDark, text: '#3a2a08', light: '#fff1b0' }}
      onPrimary={onExplore}
      secondaryLabel="LIVE HUMBLY"
      onSecondary={onDismiss}
    />
  );
}
