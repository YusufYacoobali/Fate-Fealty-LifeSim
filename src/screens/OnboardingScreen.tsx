import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelText } from '@/components/ui/PixelText';
import { FullScreenPage } from '@/components/premium/FullScreenPage';
import { PaywallPanel } from '@/components/premium/PaywallPanel';
import { ACTIVITY_ICONS, KIN_KIND_ICONS, RANK_PORTRAITS, STAT_ICONS } from '@/assets/generatedAssets';
import { RANKS } from '@/data/ranks';
import { PAYWALL_PLAN_IDS, PlanId } from '@/data/premiumPlans';
import { PurchaseOutcome } from '@/services/purchases';
import type { PremiumAccessState } from '@/state/hooks/usePremium';

const LESSONS = [
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
  {
    asset: RANK_PORTRAITS.Knight,
    title: 'CLIMB THY STATION',
    body: 'Training, courtly choices, gold, and the right stats unlock promotions. Crime pays, but slows respect.',
  },
] as const;

interface Props {
  premiumUnlocked: boolean;
  accessState: PremiumAccessState;
  onPurchase: (plan: PlanId) => Promise<PurchaseOutcome>;
  onRestore: () => Promise<boolean>;
  onDone: () => void;
}

type Page = 'hook' | 'lessons' | 'destiny' | 'paywall';

function ProgressDots({ count, index }: { count: number; index: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            width: 10,
            height: 10,
            backgroundColor: i <= index ? C.charm : C.lightFill,
            borderWidth: 2,
            borderColor: i <= index ? C.charmDark : C.paleEdge,
          }}
        />
      ))}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <PixelText font="pixel" size={11} color={C.blueDeep} style={{ textAlign: 'center', marginBottom: 10, lineHeight: 18 }}>
      {children}
    </PixelText>
  );
}

function HookPage() {
  return (
    <View>
      <View style={{ alignSelf: 'center', width: 108, height: 108, backgroundColor: C.lightFill, borderWidth: 3, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Image source={RANK_PORTRAITS.Monarch} resizeMode="contain" style={{ width: 96, height: 96 }} />
      </View>
      <SectionTitle>RISE FROM MUD TO MONARCH</SectionTitle>
      <PixelText font="body" size={18} color={C.textDark} style={{ textAlign: 'center', marginBottom: 14 }}>
        You are born a peasant of Swineford — one goose, one grudge, and no prospects. Every year is a choice. Every choice becomes your story.
      </PixelText>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {RANKS.map((r) => (
          <View key={r.key} style={{ width: 42, height: 42, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={RANK_PORTRAITS[r.key]} resizeMode="contain" style={{ width: 35, height: 35 }} />
          </View>
        ))}
      </View>
      <PixelText font="body" size={14} color={C.textMuted} style={{ textAlign: 'center', marginTop: 8 }}>
        Six stations stand between you and the throne.
      </PixelText>
    </View>
  );
}

function LessonsPage() {
  return (
    <View>
      <SectionTitle>HOW TO LIVE (WISELY)</SectionTitle>
      <View style={{ gap: 8 }}>
        {LESSONS.map((lesson) => (
          <View key={lesson.title} style={{ flexDirection: 'row', gap: 8, backgroundColor: C.parchSl, borderWidth: 2, borderColor: C.parchSd, padding: 9 }}>
            <View style={{ width: 34, height: 34, backgroundColor: C.lightFill, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={lesson.asset} resizeMode="contain" style={{ width: 28, height: 28 }} />
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
    </View>
  );
}

function DestinyPage() {
  return (
    <View>
      <SectionTitle>HOW FAR WILL YOU RISE?</SectionTitle>
      <PixelText font="body" size={17} color={C.textDark} style={{ textAlign: 'center', marginBottom: 12 }}>
        Most souls die as they were born. The last two thrones — and the stories that come with them — belong to Premium.
      </PixelText>
      <View style={{ gap: 7 }}>
        {RANKS.map((r) => {
          const premium = !!r.premium;
          return (
            <View
              key={r.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: premium ? C.blueDeep : C.lightFill,
                borderWidth: 2,
                borderColor: premium ? C.charmDark : C.inkSoft,
                padding: 8,
              }}
            >
              <View style={{ width: 36, height: 36, backgroundColor: premium ? C.blueMid : C.white, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={RANK_PORTRAITS[r.key]} resizeMode="contain" style={{ width: 30, height: 30 }} />
              </View>
              <PixelText font="pixel" size={8} color={premium ? C.charm : C.blueDark} style={{ flex: 1 }}>
                {r.key.toUpperCase()}
              </PixelText>
              {premium && (
                <View style={{ backgroundColor: C.charm, borderWidth: 2, borderColor: C.charmDark, paddingHorizontal: 5, paddingVertical: 2 }}>
                  <PixelText font="pixel" size={6} color="#3a2a08">
                    👑 PREMIUM
                  </PixelText>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function OnboardingScreen({ premiumUnlocked, accessState, onPurchase, onRestore, onDone }: Props) {
  const pages: Page[] = premiumUnlocked ? ['hook', 'lessons', 'destiny'] : ['hook', 'lessons', 'destiny', 'paywall'];
  const [index, setIndex] = useState(0);
  const page = pages[Math.min(index, pages.length - 1)];
  const isLast = index >= pages.length - 1;

  const footer =
    page === 'paywall' ? (
      <TouchableOpacity onPress={onDone} style={{ alignSelf: 'center', padding: 6 }}>
        <PixelText font="body" size={15} color={C.blueDeep}>
          Begin as a humble peasant instead →
        </PixelText>
      </TouchableOpacity>
    ) : (
      <PixelButton
        bg={C.faith}
        shadow={C.faithDark}
        light="#d8f5cc"
        onPress={() => (isLast ? onDone() : setIndex(index + 1))}
        innerStyle={{ paddingVertical: 13, alignItems: 'center' }}
      >
        <PixelText font="pixel" size={9} color={C.blueDark}>
          {isLast ? 'BEGIN THE TALE' : 'CONTINUE'}
        </PixelText>
      </PixelButton>
    );

  return (
    <FullScreenPage title={page === 'paywall' ? 'CLAIM THY CROWN' : 'WELCOME, SMALL LEGEND'} zIndex={80} footer={footer}>
      <ProgressDots count={pages.length} index={index} />
      {page === 'hook' && <HookPage />}
      {page === 'lessons' && <LessonsPage />}
      {page === 'destiny' && <DestinyPage />}
      {page === 'paywall' && (
        <PaywallPanel
          planIds={PAYWALL_PLAN_IDS}
          unlocked={premiumUnlocked}
          accessState={accessState}
          onPurchase={onPurchase}
          onRestore={onRestore}
          onUnlocked={onDone}
          ctaLabel="CLAIM THE CROWN"
        />
      )}
    </FullScreenPage>
  );
}
