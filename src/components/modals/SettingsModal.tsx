import React from 'react';
import { View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { Difficulty, GameSettings } from '@/types/game';
import { C } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';

interface Props {
  settings: GameSettings;
  onSetSettings: (patch: Partial<GameSettings>) => void;
  onToggleAutoScroll: () => void;
  onRestart: () => void;
  onRestartOnboarding: () => void;
  onClose: () => void;
  onOpenChronicle: () => void;
}

const DIFFICULTIES: Difficulty[] = ['Merciful', 'Normal', 'Brutal'];

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>{children}</View>;
}

function Pill({ label, color, bg, onPress }: { label: string; color: string; bg: string; onPress?: () => void }) {
  const inner = (
    <View style={{ backgroundColor: bg, borderWidth: 2, borderColor: C.inkSoft, paddingHorizontal: 6, paddingVertical: 4 }}>
      <PixelText font="pixel" size={7} color={color}>
        {label}
      </PixelText>
    </View>
  );
  if (onPress) {
    return (
      <PixelButton bg={bg} shadow={C.inkSoft} onPress={onPress} innerStyle={{ paddingHorizontal: 6, paddingVertical: 4 }}>
        <PixelText font="pixel" size={7} color={color}>
          {label}
        </PixelText>
      </PixelButton>
    );
  }
  return inner;
}

export function SettingsModal({ settings, onSetSettings, onToggleAutoScroll, onRestart, onRestartOnboarding, onClose, onOpenChronicle }: Props) {
  const cycleDifficulty = () => {
    const i = DIFFICULTIES.indexOf(settings.difficulty);
    onSetSettings({ difficulty: DIFFICULTIES[(i + 1) % DIFFICULTIES.length] });
  };

  return (
    <ModalBackdrop zIndex={55}>
      <View style={{ backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 14 }}>
        <View style={{ backgroundColor: C.light, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.blue, borderRightColor: C.blue, paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={9} color={C.white} style={{ textAlign: 'center' }}>
            ⚙️ SETTINGS
          </PixelText>
        </View>

        <View style={{ marginVertical: 13, gap: 11 }}>
          <Row>
            <PixelText font="body" size={17} color={C.textDark}>
              Difficulty
            </PixelText>
            <Pill label={settings.difficulty.toUpperCase()} color={C.blue} bg={C.lightFill} onPress={cycleDifficulty} />
          </Row>
          <Row>
            <PixelText font="body" size={17} color={C.textDark}>
              Permadeath
            </PixelText>
            <Pill
              label={settings.permadeath ? 'ON' : 'OFF'}
              color={settings.permadeath ? C.bad : C.faithDark}
              bg={C.white}
              onPress={() => onSetSettings({ permadeath: !settings.permadeath })}
            />
          </Row>
          <Row>
            <PixelText font="body" size={17} color={C.textDark}>
              Auto-scroll feed
            </PixelText>
            <Pill label={settings.autoScroll ? 'ON' : 'OFF'} color={C.white} bg={settings.autoScroll ? C.faithDark : C.bad} onPress={onToggleAutoScroll} />
          </Row>
          <Row>
            <PixelText font="body" size={17} color={C.textDark}>
              Haptics
            </PixelText>
            <Pill label={settings.haptics ? 'ON' : 'OFF'} color={C.white} bg={settings.haptics ? C.faithDark : C.bad} onPress={() => onSetSettings({ haptics: !settings.haptics })} />
          </Row>
          <PixelText font="body" size={13} color={C.textMuted} style={{ borderTopWidth: 2, borderTopColor: '#c9b483', paddingTop: 8 }}>
            Tap a setting to change it. Difficulty scales the harm life deals thee.
          </PixelText>
        </View>

        <PixelButton bg={C.purple} shadow={C.purpleDark} onPress={onOpenChronicle} style={{ marginBottom: 7 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color="#2a0d4a">
            📜 CHRONICLE
          </PixelText>
        </PixelButton>
        <PixelButton bg={C.light} shadow={C.blue} light={C.sky} onPress={onRestartOnboarding} style={{ marginBottom: 7 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color={C.blueDark}>
            TUTORIAL
          </PixelText>
        </PixelButton>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          <PixelButton bg={C.health} shadow={C.healthDark} onPress={onRestart} style={{ flex: 1 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
            <PixelText font="pixel" size={8} color={C.white}>
              RESTART
            </PixelText>
          </PixelButton>
          <PixelButton bg={C.faith} shadow={C.faithDark} onPress={onClose} style={{ flex: 1 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
            <PixelText font="pixel" size={8} color={C.blueDark}>
              CLOSE
            </PixelText>
          </PixelButton>
        </View>
      </View>
    </ModalBackdrop>
  );
}
