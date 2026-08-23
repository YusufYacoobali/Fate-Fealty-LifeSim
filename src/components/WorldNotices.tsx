import React from 'react';
import { View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelText } from './ui/PixelText';

interface Props {
  recoveryNotice: boolean;
  saveCompatibilityBlocked: boolean;
}

/**
 * Save-health notices. These used to ride along with the Swineford strip; that
 * strip now lives on the Holding page, but a warning about the save must stay
 * where the player actually looks, so it keeps its place above the life feed.
 */
export function WorldNotices({ recoveryNotice, saveCompatibilityBlocked }: Props) {
  if (!recoveryNotice && !saveCompatibilityBlocked) return null;

  return (
    <View style={{ backgroundColor: C.blueDeep, paddingHorizontal: 11, paddingVertical: 7, borderBottomWidth: 2, borderBottomColor: C.blue, gap: 4 }}>
      {recoveryNotice && (
        <PixelText font="body" size={14} color={C.charm} style={{ textAlign: 'center' }}>
          Some unfinished tales were safely concluded after an update.
        </PixelText>
      )}
      {saveCompatibilityBlocked && (
        <PixelText font="body" size={14} color={C.health} style={{ textAlign: 'center' }}>
          This device has a save from a newer game version. It remains untouched; saving is disabled until the game is
          updated.
        </PixelText>
      )}
    </View>
  );
}
