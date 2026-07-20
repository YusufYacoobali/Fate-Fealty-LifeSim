import React, { useState } from 'react';
import { Image, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelText } from '@/components/ui/PixelText';
import { FullScreenPage } from '@/components/premium/FullScreenPage';
import { OnboardingPaywallPanel } from '@/components/premium/onboarding-paywall-panel';
import {
  ACTIVITY_ICONS,
  HOLDING_ACTION_ART,
  KIN_KIND_ICONS,
  RANK_PORTRAITS,
  STAT_ICONS,
} from '@/assets/generatedAssets';
import { RANKS } from '@/data/ranks';
import { PlanId } from '@/data/premiumPlans';
import { PurchaseOutcome } from '@/services/purchases';
import type { PremiumAccessState } from '@/state/hooks/usePremium';

const LESSONS = [
  {
    asset: ACTIVITY_ICONS.quest,
    title: 'SPEND THY ACTIONS',
    body: "Each year gives you a limited number of actions. Use the Do tab to work, train, recover, pray, socialise, or take risks. Age Up begins the next year.",
  },
  {
    asset: ACTIVITY_ICONS.blacksmith,
    title: 'WORK AND BUILD A CAREER',
    body: 'Choose an occupation in Do, then Work once each year. Work earns gold and experience. Better experience and performance unlock promotions and stronger pay.',
  },
  {
    asset: STAT_ICONS.wits,
    title: 'WATCH THY STATS',
    body: 'Health keeps you alive. Charm, Wits, and Faith unlock choices and improve your odds in difficult moments. Activities show what they can change.',
  },
  {
    asset: KIN_KIND_ICONS.father,
    title: 'MIND THY KIN',
    body: 'Family, friends, rivals, and heirs remember how you treat them. Relationships can help your rise, create trouble, and carry your dynasty onward.',
  },
  {
    asset: HOLDING_ACTION_ART.work_land,
    title: 'MANAGE THY HOLDING',
    body: 'From age 6, your holding needs one order each year. Prosperity is the lowest of Stores, Security, and Loyalty. Raise it to grow the population and earn yearly gold and reputation.',
  },
  {
    asset: RANK_PORTRAITS.Knight,
    title: 'RISE THROUGH THE RANKS',
    body: 'Training, career success, gold, reputation, and the right stats move you from Peasant toward the crown. Your goal banner points toward the next useful step.',
  },
] as const;

interface Props {
  premiumUnlocked: boolean;
  accessState: PremiumAccessState;
  onPurchase: (plan: PlanId) => Promise<PurchaseOutcome>;
  onRestore: () => Promise<boolean>;
  onDone: () => void;
}

export type OnboardingPage = 'hook' | 'lessons' | 'destiny' | 'paywall';

const ONBOARDING_PAGES: OnboardingPage[] = ['hook', 'lessons', 'destiny', 'paywall'];

export function onboardingPages(): OnboardingPage[] {
  return [...ONBOARDING_PAGES];
}

export interface OnboardingLayout {
  compact: boolean;
  contentMaxWidth: number;
  contentPadding: number;
  heroSize: number;
  rankGap: number;
  rankTileSize: number;
}

/** Pure responsive metrics keep the pixel layout testable without a device. */
export function onboardingLayout(width: number, height: number): OnboardingLayout {
  const compact = width < 360 || height < 680;
  const contentMaxWidth = 560;
  const contentPadding = compact ? 10 : 14;
  const rankGap = compact ? 4 : 6;
  const usableWidth = Math.max(0, Math.min(width, contentMaxWidth + contentPadding * 2) - contentPadding * 2);
  const rankTileSize = Math.max(
    28,
    Math.min(compact ? 38 : 42, Math.floor((usableWidth - rankGap * (RANKS.length - 1)) / RANKS.length)),
  );

  return {
    compact,
    contentMaxWidth,
    contentPadding,
    heroSize: compact ? 84 : 108,
    rankGap,
    rankTileSize,
  };
}

function ProgressDots({ count, index, dark = false, compact = false }: { count: number; index: number; dark?: boolean; compact?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: compact ? 7 : 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === index ? 13 : 10,
            height: i === index ? 13 : 10,
            backgroundColor: i < index ? C.charm : i === index ? (dark ? C.cream : C.white) : dark ? C.blueMid : C.lightFill,
            borderWidth: 2,
            borderColor: i <= index ? C.charmDark : dark ? C.blue : C.paleEdge,
          }}
        />
      ))}
    </View>
  );
}

function SectionTitle({ children, compact }: { children: string; compact: boolean }) {
  return (
    <PixelText
      font="pixel"
      size={compact ? 9 : 11}
      color={C.blueDeep}
      style={{ textAlign: 'center', marginBottom: compact ? 7 : 10 }}
    >
      {children}
    </PixelText>
  );
}

function HookPage({ layout }: { layout: OnboardingLayout }) {
  const portraitSize = layout.heroSize - 12;
  const rankPortraitSize = Math.max(22, layout.rankTileSize - 7);

  return (
    <View>
      <View
        style={{
          alignSelf: 'center',
          width: layout.heroSize,
          height: layout.heroSize,
          backgroundColor: C.lightFill,
          borderWidth: 3,
          borderColor: C.inkSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: layout.compact ? 9 : 14,
        }}
      >
        <Image source={RANK_PORTRAITS.Monarch} resizeMode="contain" style={{ width: portraitSize, height: portraitSize }} />
      </View>
      <SectionTitle compact={layout.compact}>RISE FROM MUD TO MONARCH</SectionTitle>
      <PixelText
        font="body"
        size={layout.compact ? 16 : 18}
        color={C.textDark}
        style={{ textAlign: 'center', marginBottom: layout.compact ? 9 : 14 }}
      >
        You begin as a peasant in Swineford with little more than a name and a chance. Spend each year's actions on work, training, relationships, faith, health, or mischief. Then age up and live with the results.
      </PixelText>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: layout.rankGap }}>
        {RANKS.map((rank) => (
          <View
            key={rank.key}
            style={{
              width: layout.rankTileSize,
              height: layout.rankTileSize,
              backgroundColor: C.lightFill,
              borderWidth: 2,
              borderColor: C.inkSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image source={RANK_PORTRAITS[rank.key]} resizeMode="contain" style={{ width: rankPortraitSize, height: rankPortraitSize }} />
          </View>
        ))}
      </View>
      <PixelText
        font="body"
        size={layout.compact ? 13 : 14}
        color={C.textMuted}
        style={{ textAlign: 'center', marginTop: layout.compact ? 5 : 8 }}
      >
        Build a life, a career, a dynasty, and perhaps a kingdom.
      </PixelText>
    </View>
  );
}

function LessonsPage({ compact }: { compact: boolean }) {
  const iconFrame = compact ? 38 : 44;
  const iconSize = compact ? 31 : 37;

  return (
    <View>
      <SectionTitle compact={compact}>HOW A LIFE WORKS</SectionTitle>
      <PixelText
        font="body"
        size={compact ? 14 : 16}
        color={C.textBrown}
        style={{ textAlign: 'center', marginBottom: compact ? 8 : 11 }}
      >
        There is no single correct path. These are the systems that turn your choices into a story.
      </PixelText>
      <View style={{ gap: compact ? 8 : 10 }}>
        {LESSONS.map((lesson) => (
          <View
            key={lesson.title}
            style={{
              minHeight: compact ? 86 : 102,
              flexDirection: 'row',
              alignItems: 'center',
              gap: compact ? 9 : 11,
              backgroundColor: C.parchSl,
              borderWidth: 2,
              borderColor: C.parchSd,
              padding: compact ? 9 : 11,
            }}
          >
            <View
              style={{
                width: iconFrame,
                height: iconFrame,
                flexShrink: 0,
                backgroundColor: C.lightFill,
                borderWidth: 2,
                borderColor: C.inkSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image source={lesson.asset} resizeMode="contain" style={{ width: iconSize, height: iconSize }} />
            </View>
            <View style={{ flex: 1 }}>
              <PixelText font="pixel" size={compact ? 6 : 7} color={C.blueDeep}>
                {lesson.title}
              </PixelText>
              <PixelText font="body" size={compact ? 14 : 15} color={C.textBrown} style={{ marginTop: 4 }}>
                {lesson.body}
              </PixelText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function DestinyPage({ compact }: { compact: boolean }) {
  return (
    <View>
      <SectionTitle compact={compact}>HOW FAR WILL YOU RISE?</SectionTitle>
      <PixelText
        font="body"
        size={compact ? 15 : 17}
        color={C.textDark}
        style={{ textAlign: 'center', marginBottom: compact ? 8 : 12 }}
      >
        The free adventure carries you from Peasant through Noble. Premium opens the final rise to Baron and Monarch, expands your holding into a realm, adds more goals and ruler stories, and raises your yearly action limit from 24 to 50.
      </PixelText>
      <View style={{ gap: compact ? 7 : 9 }}>
        {RANKS.map((rank) => {
          const premium = !!rank.premium;
          return (
            <View
              key={rank.key}
              style={{
                minHeight: compact ? 52 : 60,
                flexDirection: 'row',
                alignItems: 'center',
                gap: compact ? 7 : 10,
                backgroundColor: premium ? C.blueDeep : C.lightFill,
                borderWidth: 2,
                borderColor: premium ? C.charmDark : C.inkSoft,
                padding: compact ? 7 : 9,
              }}
            >
              <View
                style={{
                  width: compact ? 36 : 42,
                  height: compact ? 36 : 42,
                  flexShrink: 0,
                  backgroundColor: premium ? C.blueMid : C.white,
                  borderWidth: 2,
                  borderColor: C.inkSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image source={RANK_PORTRAITS[rank.key]} resizeMode="contain" style={{ width: compact ? 30 : 36, height: compact ? 30 : 36 }} />
              </View>
              <PixelText font="pixel" size={compact ? 7 : 8} color={premium ? C.charm : C.blueDark} style={{ flex: 1 }}>
                {rank.key.toUpperCase()}
              </PixelText>
              {premium && (
                <View style={{ backgroundColor: C.charm, borderWidth: 2, borderColor: C.charmDark, paddingHorizontal: 5, paddingVertical: 3 }}>
                  <PixelText font="pixel" size={6} color="#3a2a08">
                    PREMIUM
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
  const { width, height } = useWindowDimensions();
  const layout = onboardingLayout(width, height);
  const pages = onboardingPages();
  const [index, setIndex] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const page = pages[Math.min(index, pages.length - 1)];
  const isLast = index >= pages.length - 1;
  const paywallCompact = layout.compact || width < 390 || height < 780;

  const footer =
    page === 'paywall' ? (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity
          disabled={restoring}
          onPress={async () => {
            setRestoring(true);
            let restored = false;
            try {
              restored = await onRestore();
            } finally {
              setRestoring(false);
            }
            if (restored) onDone();
          }}
          style={{ padding: 7 }}
        >
          <PixelText font="body" size={14} color={C.creamBlue}>{restoring ? 'Restoring...' : 'Restore purchases'}</PixelText>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDone} style={{ padding: 7 }}>
          <PixelText font="body" size={14} color={C.creamBlue}>
            {premiumUnlocked ? 'Continue >' : 'Continue free >'}
          </PixelText>
        </TouchableOpacity>
      </View>
    ) : (
      <PixelButton
        bg={C.faith}
        shadow={C.faithDark}
        light="#d8f5cc"
        onPress={() => (isLast ? onDone() : setIndex(index + 1))}
        innerStyle={{ paddingVertical: layout.compact ? 10 : 13, alignItems: 'center' }}
      >
        <PixelText font="pixel" size={9} color={C.blueDark}>
          {isLast ? 'BEGIN THE TALE' : 'CONTINUE'}
        </PixelText>
      </PixelButton>
    );

  return (
    <FullScreenPage
      title={page === 'paywall' ? 'CLAIM THY CROWN' : 'WELCOME, SMALL LEGEND'}
      zIndex={80}
      footer={footer}
      contentMaxWidth={page === 'paywall' ? 620 : layout.contentMaxWidth}
      contentPadding={page === 'paywall' ? (paywallCompact ? 8 : 10) : layout.contentPadding}
      backgroundColor={page === 'paywall' ? '#0a3768' : C.sky}
      headerBackgroundColor={page === 'paywall' ? '#082c56' : C.blueDeep}
      headerBorderColor={page === 'paywall' ? '#b8790a' : C.blueDark}
      footerBackgroundColor={page === 'paywall' ? '#082c56' : C.skyDeep}
      footerBorderColor={page === 'paywall' ? '#236aa8' : C.paleEdge}
    >
      <ProgressDots count={pages.length} index={index} dark={page === 'paywall'} compact={page === 'paywall' && paywallCompact} />
      {page === 'hook' && <HookPage layout={layout} />}
      {page === 'lessons' && <LessonsPage compact={layout.compact} />}
      {page === 'destiny' && <DestinyPage compact={layout.compact} />}
      {page === 'paywall' && (
        <OnboardingPaywallPanel
          compact={paywallCompact}
          unlocked={premiumUnlocked}
          accessState={accessState}
          onPurchase={onPurchase}
          onRestore={onRestore}
          onUnlocked={onDone}
        />
      )}
    </FullScreenPage>
  );
}
