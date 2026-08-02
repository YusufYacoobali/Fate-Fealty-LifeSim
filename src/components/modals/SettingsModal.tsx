import React from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { Difficulty, GameSettings } from '@/types/game';
import { C, PANEL } from '@/theme/theme';
import { ModalBackdrop } from './ModalBackdrop';

interface Props {
  settings: GameSettings;
  premiumUnlocked: boolean;
  onSetSettings: (patch: Partial<GameSettings>) => void;
  onLockedFeaturePress: () => void;
  onToggleAutoScroll: () => void;
  onRestart: () => void;
  onRestartOnboarding: () => void;
  onClose: () => void;
  onOpenChronicle: () => void;
  onOpenShop: () => void;
}

const DIFFICULTIES: Difficulty[] = ['Merciful', 'Normal', 'Brutal'];
const PRIVACY_POLICY_URL = 'https://doc-hosting.flycricket.io/fate-fealty-life-sim-privacy-policy/311360d4-bd3f-48be-8077-1df1964ed343/privacy';

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

export function SettingsModal({ settings, premiumUnlocked, onSetSettings, onLockedFeaturePress, onToggleAutoScroll, onRestart, onRestartOnboarding, onClose, onOpenChronicle, onOpenShop }: Props) {
  const cycleDifficulty = () => {
    const i = DIFFICULTIES.indexOf(settings.difficulty);
    onSetSettings({ difficulty: DIFFICULTIES[(i + 1) % DIFFICULTIES.length] });
  };

  const openPrivacyPolicy = () => {
    void Linking.openURL(PRIVACY_POLICY_URL).catch((error) => {
      console.warn('[settings] privacy policy failed to open', error);
    });
  };

  return (
    <ModalBackdrop zIndex={55}>
      <ScrollView style={{ maxHeight: '100%' }} contentContainerStyle={PANEL.parchModal}>
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
              Live Forever
            </PixelText>
            <Pill
              label={premiumUnlocked ? (settings.liveForever ? 'ON' : 'OFF') : 'PRO'}
              color={premiumUnlocked ? C.white : C.purpleDark}
              bg={premiumUnlocked ? (settings.liveForever ? C.faithDark : C.bad) : C.purple}
              onPress={premiumUnlocked ? () => onSetSettings({ liveForever: !settings.liveForever }) : onLockedFeaturePress}
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
          <Row>
            <PixelText font="body" size={17} color={C.textDark}>
              Music
            </PixelText>
            <Pill label={settings.music ? 'ON' : 'OFF'} color={C.white} bg={settings.music ? C.faithDark : C.bad} onPress={() => onSetSettings({ music: !settings.music })} />
          </Row>
          <Row>
            <PixelText font="body" size={17} color={C.textDark}>
              Sound effects
            </PixelText>
            <Pill label={settings.soundEffects ? 'ON' : 'OFF'} color={C.white} bg={settings.soundEffects ? C.faithDark : C.bad} onPress={() => onSetSettings({ soundEffects: !settings.soundEffects })} />
          </Row>
          <Row>
            <PixelText font="body" size={17} color={C.textDark}>
              Reduced motion
            </PixelText>
            <Pill label={settings.reducedMotion ? 'ON' : 'OFF'} color={C.white} bg={settings.reducedMotion ? C.faithDark : C.bad} onPress={() => onSetSettings({ reducedMotion: !settings.reducedMotion })} />
          </Row>
          <PixelText font="body" size={13} color={C.textMuted} style={{ borderTopWidth: 2, borderTopColor: '#c9b483', paddingTop: 8 }}>
            Tap a setting to change it. Live Forever prevents death and lets thy current life keep aging.
          </PixelText>
        </View>

        <PixelButton bg={C.purple} shadow={C.purpleDark} onPress={onOpenChronicle} style={{ marginBottom: 7 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color="#2a0d4a">
            📜 CHRONICLE
          </PixelText>
        </PixelButton>
        <PixelButton bg={C.charm} shadow={C.charmDark} light="#fff1b0" onPress={onOpenShop} style={{ marginBottom: 7 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color="#3a2a08">
            SHOP
          </PixelText>
        </PixelButton>
        <PixelButton bg={C.light} shadow={C.blue} light={C.sky} onPress={onRestartOnboarding} style={{ marginBottom: 7 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color={C.blueDark}>
            TUTORIAL
          </PixelText>
        </PixelButton>
        <PixelButton bg={C.lightFill} shadow={C.blue} onPress={openPrivacyPolicy} style={{ marginBottom: 7 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color={C.blueDark}>
            PRIVACY POLICY
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
      </ScrollView>
    </ModalBackdrop>
  );
}
