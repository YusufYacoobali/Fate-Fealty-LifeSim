import React, { useState } from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import { ACTIVITY_ICONS, KIN_KIND_ICONS, RANK_PORTRAITS, STAT_ICONS } from '@/assets/generatedAssets';
import { C } from '@/theme/theme';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { ModalBackdrop } from './ModalBackdrop';
import { LifetimeOffer } from '../LifetimeOffer';
import { PurchaseOutcome } from '@/services/purchases';
import { OUTCOME_MESSAGES } from './ProShopModal';
import type { PremiumAccessState } from '@/state/hooks/usePremium';

const LESSONS = [
  {
    asset: RANK_PORTRAITS.Knight,
    title: 'CLIMB THY STATION',
    body: 'Training, courtly choices, gold, age, and the right stats unlock promotions. Crime can make coin, but it slows respect.',
  },
  {
    asset: ACTIVITY_ICONS.train,
    title: 'DO DEEDS',
    body: 'Use the Do tab before aging up. Work, train, pray, scheme, or recover to shape the next year.',
  },
  {
    asset: STAT_ICONS.wits,
    title: 'WATCH THY STATS',
    body: 'Health keeps thee alive. Charm, wits, and faith open choices and decide risky moments.',
  },
  {
    asset: KIN_KIND_ICONS.father,
    title: 'MIND THY KIN',
    body: 'Family, friends, rivals, and heirs can help, hinder, inherit, or haunt the whole tale.',
  },
] as const;

const RANK_PREVIEW = [RANK_PORTRAITS.Peasant, RANK_PORTRAITS.Squire, RANK_PORTRAITS.Knight, RANK_PORTRAITS.Noble];

interface Props {
  unlocked: boolean;
  accessState: PremiumAccessState;
  onPurchase: () => Promise<PurchaseOutcome>;
  onRestore: () => Promise<boolean>;
  onDone: () => void;
}

function LessonIcon({ source }: { source: ImageSourcePropType }) {
  return <Image source={source} resizeMode="contain" style={{ width: 28, height: 28 }} />;
}

export function OnboardingModal({ unlocked, accessState, onPurchase, onRestore, onDone }: Props) {
  const [page, setPage] = useState<'guide' | 'offer'>('guide');
  const [message, setMessage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const isOffer = page === 'offer';
  const buy = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('Summoning the royal treasury...');
    try {
      const outcome = await onPurchase();
      setMessage(OUTCOME_MESSAGES[outcome]);
    } finally {
      setBusy(false);
    }
  };
  const restore = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('Consulting the ledgers...');
    try {
      const restored = await onRestore();
      setMessage(restored ? 'Lifetime Pass restored.' : 'No saved Lifetime Pass was found.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop zIndex={80}>
      <View style={{ backgroundColor: C.parch, borderWidth: 4, borderColor: C.inkSoft, borderTopColor: C.parchSl, borderLeftColor: C.parchSl, borderBottomColor: C.parchSd, borderRightColor: C.parchSd, padding: 14 }}>
        <View style={{ backgroundColor: C.blue, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.blueDark, borderRightColor: C.blueDark, paddingHorizontal: 8, paddingVertical: 7 }}>
          <PixelText font="pixel" size={9} color={C.white} style={{ textAlign: 'center' }}>
            {isOffer ? 'SUPPORT THE KINGDOM' : 'WELCOME, SMALL LEGEND'}
          </PixelText>
        </View>

        {isOffer ? (
          <LifetimeOffer unlocked={unlocked} accessState={accessState} message={message} loading={busy} onPurchase={buy} onRestore={restore} />
        ) : (
          <>
            <PixelText font="body" size={18} color={C.textDark} style={{ marginTop: 12, marginBottom: 10, textAlign: 'center' }}>
              Start as a peasant of Swineford. Choose deeds, survive strange years, and earn thy way toward nobility.
            </PixelText>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
              {RANK_PREVIEW.map((source, index) => (
                <View key={index} style={{ width: 38, height: 38, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={source} resizeMode="contain" style={{ width: 31, height: 31 }} />
                </View>
              ))}
            </View>

            <View style={{ gap: 8 }}>
              {LESSONS.map((lesson) => (
                <View key={lesson.title} style={{ flexDirection: 'row', gap: 8, backgroundColor: C.parchSl, borderWidth: 2, borderColor: C.parchSd, padding: 9 }}>
                  <View style={{ width: 32, height: 32, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <LessonIcon source={lesson.asset} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <PixelText font="pixel" size={7} color={C.blueDeep}>
                      {lesson.title}
                    </PixelText>
                    <PixelText font="body" size={15} color={C.textBrown} style={{ marginTop: 3 }}>
                      {lesson.body}
                    </PixelText>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <PixelButton
          bg={C.faith}
          shadow={C.faithDark}
          light="#d8f5cc"
          onPress={isOffer ? onDone : () => setPage('offer')}
          style={{ marginTop: 13 }}
          innerStyle={{ paddingVertical: 11, alignItems: 'center' }}
        >
          <PixelText font="pixel" size={9} color={C.blueDark}>
            {isOffer ? 'BEGIN THE TALE' : 'NEXT'}
          </PixelText>
        </PixelButton>
      </View>
    </ModalBackdrop>
  );
}
