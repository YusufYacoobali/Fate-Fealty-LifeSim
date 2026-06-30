import React from 'react';
import { ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { KinMember } from '@/types/game';
import { KinAction } from '@/engine/kinEngine';
import { relColor, relLabel } from '@/state/viewModel';
import { C } from '@/theme/theme';

interface Props {
  kin: KinMember[];
  detail: KinMember | null;
  onOpen: (id: string) => void;
  onBack: () => void;
  onInteract: (id: string, action: KinAction) => void;
}

interface ActionDef {
  label: string;
  hint: string;
  kind: KinAction;
  bg: string;
  sd: string;
  fg: string;
}

const ACTIONS: ActionDef[] = [
  { label: 'SPEND TIME', hint: '+bond', kind: 'time', bg: C.faith, sd: C.faithDark, fg: '#1a3a0a' },
  { label: 'PRAISE', hint: '+bond', kind: 'praise', bg: C.light, sd: C.blue, fg: C.blueDark },
  { label: 'GIFT', hint: '5g, ++bond', kind: 'gift', bg: C.charm, sd: C.charmDark, fg: '#3a2a08' },
  { label: 'ASK FAVOUR', hint: 'borrow coin', kind: 'favour', bg: C.teal, sd: C.tealDark, fg: '#0d3a33' },
  { label: 'INSULT', hint: '--bond', kind: 'insult', bg: C.health, sd: C.healthDark, fg: C.white },
  { label: 'SCHEME', hint: '+wits, -bond', kind: 'plot', bg: C.purple, sd: C.purpleDark, fg: '#2a0d4a' },
];

export function KinTab({ kin, detail, onOpen, onBack, onInteract }: Props) {
  if (detail) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.sky }} contentContainerStyle={{ padding: 11, paddingBottom: 8 }}>
        <PixelButton bg={C.blue} shadow={C.blueDeep} onPress={onBack} style={{ alignSelf: 'flex-start', marginBottom: 9 }} innerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <PixelText font="pixel" size={7} color={C.white}>
            ◂ BACK
          </PixelText>
        </PixelButton>

        {/* hero card */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#0f274a', borderWidth: 4, borderColor: C.charm, borderBottomColor: C.charmDark, borderRightColor: C.charmDark, padding: 10 }}>
          <View style={{ width: 56, height: 56, backgroundColor: C.sky, borderWidth: 3, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
            <PixelText size={30}>{detail.emoji}</PixelText>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <PixelText font="pixel" size={9} color={C.charm}>
              {detail.name}
            </PixelText>
            <PixelText font="body" size={15} color="#dbe9ff" style={{ marginTop: 3 }}>
              {detail.role} · {detail.age} winters
            </PixelText>
            <View style={{ alignSelf: 'flex-start', marginTop: 4, backgroundColor: relColor(detail.rel), paddingHorizontal: 7, paddingVertical: 1 }}>
              <PixelText font="body" size={13} color={C.blueDark}>
                {relLabel(detail.rel)} · {detail.rel}%
              </PixelText>
            </View>
          </View>
        </View>

        <View style={{ height: 9, backgroundColor: C.parchSd, borderWidth: 2, borderColor: '#b89a5f', marginVertical: 9 }}>
          <View style={{ height: '100%', width: `${detail.rel}%`, backgroundColor: relColor(detail.rel) }} />
        </View>

        {/* trait + bio */}
        <View style={{ backgroundColor: C.parch, borderWidth: 3, borderColor: C.parchBorder, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 9 }}>
          <PixelText font="pixel" size={6} color={C.amber}>
            TRAIT — {detail.trait}
          </PixelText>
          <PixelText font="body" size={16} color={C.textBrown} style={{ marginTop: 5 }}>
            {detail.bio}
          </PixelText>
        </View>

        <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 12, marginBottom: 8 }}>
          INTERACTIONS
        </PixelText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {ACTIONS.map((a) => (
            <PixelButton
              key={a.kind}
              bg={a.bg}
              shadow={a.sd}
              onPress={() => onInteract(detail.id, a.kind)}
              style={{ width: '48.5%', marginBottom: 7 }}
              innerStyle={{ paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center' }}
            >
              <PixelText font="pixel" size={7} color={a.fg} style={{ textAlign: 'center' }}>
                {a.label}
              </PixelText>
              <PixelText font="body" size={12} color={a.fg} style={{ marginTop: 3, opacity: 0.85 }}>
                {a.hint}
              </PixelText>
            </PixelButton>
          ))}
        </View>

        {detail.kind === 'spouse' && (
          <PixelButton
            bg={C.bad}
            shadow="#7a2424"
            onPress={() => onInteract(detail.id, 'divorce')}
            style={{ marginTop: 4 }}
            innerStyle={{ paddingVertical: 9, alignItems: 'center' }}
          >
            <PixelText font="pixel" size={7} color={C.white}>
              ⚯ SEEK A DIVORCE
            </PixelText>
          </PixelButton>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 11, paddingBottom: 7, gap: 8 }}>
      <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginVertical: 3 }}>
        ♥ THY KIN & FOES
      </PixelText>
      {kin.map((k) => (
        <PixelButton
          key={k.id}
          bg={C.parch}
          shadow={C.parchSd}
          light={C.parchSl}
          outline={C.parchBorder}
          onPress={() => onOpen(k.id)}
          innerStyle={{ paddingHorizontal: 9, paddingVertical: 8 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <View style={{ width: 36, height: 36, backgroundColor: C.sky, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
              <PixelText size={19}>{k.emoji}</PixelText>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <PixelText font="body" size={18} color={C.textDark}>
                {k.name}
              </PixelText>
              <PixelText font="body" size={13} color={C.textMuted}>
                {k.role}
              </PixelText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <PixelText font="pixel" size={7} color={relColor(k.rel)}>
                {k.rel}%
              </PixelText>
              <PixelText font="body" size={12} color={C.textMuted}>
                view ▸
              </PixelText>
            </View>
          </View>
          <View style={{ height: 7, backgroundColor: C.parchSd, borderWidth: 2, borderColor: '#b89a5f', marginTop: 6 }}>
            <View style={{ height: '100%', width: `${k.rel}%`, backgroundColor: relColor(k.rel) }} />
          </View>
        </PixelButton>
      ))}
    </ScrollView>
  );
}
