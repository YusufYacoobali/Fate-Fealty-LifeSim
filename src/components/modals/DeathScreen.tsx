import React from 'react';
import { ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { GameState } from '@/types/game';
import { buildDeathSummary } from '@/engine/deathEngine';
import { currentRank } from '@/state/viewModel';
import { C } from '@/theme/theme';
import { eligibleHeirs } from '@/engine/successionEngine';

interface Props {
  state: GameState;
  onNewLife: () => void;
  onContinueHeir: (heirId?: string) => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 230, marginVertical: 1 }}>
      <PixelText font="body" size={15} color="#9fc4e8">
        {label}
      </PixelText>
      <PixelText font="body" size={15} color={C.cream}>
        {value}
      </PixelText>
    </View>
  );
}

export function DeathScreen({ state, onNewLife, onContinueHeir }: Props) {
  const rank = currentRank(state);
  const summary = buildDeathSummary(state, rank.key);
  const heirs = eligibleHeirs(state);
  const canContinue = heirs.length > 0;

  return (
    <ScrollView
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60, backgroundColor: C.ink }}
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <PixelText size={50} style={{ marginBottom: 6 }}>
        🪦
      </PixelText>
      <PixelText font="pixel" size={13} color={C.health}>
        THOU HAST DIED
      </PixelText>

      <PixelText font="body" size={19} color={C.creamBlue} style={{ marginTop: 12, textAlign: 'center' }}>
        {summary.name}
        {'\n'}
        {rank.key}-born · died at {summary.age}
        {'\n'}
        <PixelText font="body" size={17} color="#9fc4e8">
          {summary.cause}
        </PixelText>
      </PixelText>

      {/* legacy ledger */}
      <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 2, borderTopColor: '#2b3a52', alignItems: 'center' }}>
        <PixelText font="pixel" size={8} color={C.charm} style={{ marginBottom: 8 }}>
          ~ LEGACY ~
        </PixelText>
        <SummaryRow label="Final rank" value={summary.rank} />
        <SummaryRow label="Gold in purse" value={`${summary.gold}g`} />
        <SummaryRow label="Heirs" value={`${summary.heirs}`} />
        <SummaryRow label="Memories made" value={`${state.memories.length}`} />
        <SummaryRow label="Legacy score" value={`${summary.legacy}`} />
      </View>

      <PixelText font="body" size={16} color={C.charm} style={{ marginTop: 14, maxWidth: 230, textAlign: 'center' }}>
        “{summary.epitaph}”
      </PixelText>

      <View style={{ marginTop: 10, maxWidth: 280 }}>
        {summary.chronicle.slice(0, 3).map((line) => (
          <PixelText key={line} font="body" size={13} color="#9fc4e8" style={{ textAlign: 'center', marginTop: 2 }}>
            {line}
          </PixelText>
        ))}
      </View>

      <View style={{ marginTop: 22, gap: 10, alignItems: 'center' }}>
        {canContinue && heirs.slice(0, 3).map((heir) => (
          <PixelButton key={heir.id} bg={C.faith} shadow={C.faithDark} onPress={() => onContinueHeir(heir.id)} innerStyle={{ paddingVertical: 10, paddingHorizontal: 18, alignItems: 'center' }}>
            <PixelText font="pixel" size={9} color={C.blueDark}>
              ♚ CONTINUE AS {heir.name.toUpperCase()} · AGE {heir.age}
            </PixelText>
          </PixelButton>
        ))}
        <PixelButton bg={C.charm} shadow={C.charmDark} light="#fff1b0" onPress={onNewLife} innerStyle={{ paddingVertical: 12, paddingHorizontal: 22, alignItems: 'center' }}>
          <PixelText font="pixel" size={12} color="#3a2a08">
            ✦ NEW LIFE
          </PixelText>
        </PixelButton>
      </View>
    </ScrollView>
  );
}
