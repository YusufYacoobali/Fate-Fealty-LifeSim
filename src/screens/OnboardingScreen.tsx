import React, { useState } from 'react';
import { Image, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelText } from '@/components/ui/PixelText';
import { FullScreenPage } from '@/components/premium/FullScreenPage';
import { PaywallPanel } from '@/components/premium/PaywallPanel';
import {
  ACTIVITY_ICONS,
  FEATURE_ART,
  HOLDING_ACTION_ART,
  KIN_KIND_ICONS,
  RANK_PORTRAITS,
  STAT_ICONS,
} from '@/assets/generatedAssets';
import { RANKS } from '@/data/ranks';
import { PAYWALL_PLAN_IDS, PlanId } from '@/data/premiumPlans';
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
    body: 'From age 6, your holding needs one order each year. Balance Stores, Security, and Loyalty. Keep all three high to grow the population and earn yearly gold and reputation.',
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

type Page = 'hook' | 'lessons' | 'destiny' | 'paywall';

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
        The free adventure carries you from Peasant through Noble. Premium opens the final rise to Baron and Monarch, expands your holding into a realm, and adds more goals, ruler stories, and future premium chapters.
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
  const pages: Page[] = premiumUnlocked ? ['hook', 'lessons', 'destiny'] : ['hook', 'lessons', 'destiny', 'paywall'];
  const [index, setIndex] = useState(0);
  const page = pages[Math.min(index, pages.length - 1)];
  const isLast = index >= pages.length - 1;

  const footer =
    page === 'paywall' ? (
      <TouchableOpacity onPress={onDone} style={{ alignSelf: 'center', padding: 7 }}>
        <PixelText font="body" size={15} color={C.blueDeep}>
          Continue with the free adventure
        </PixelText>
      </TouchableOpacity>
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
      contentMaxWidth={layout.contentMaxWidth}
      contentPadding={layout.contentPadding}
    >
      <ProgressDots count={pages.length} index={index} />
      {page === 'hook' && <HookPage layout={layout} />}
      {page === 'lessons' && <LessonsPage compact={layout.compact} />}
      {page === 'destiny' && <DestinyPage compact={layout.compact} />}
      {page === 'paywall' && (
        <View>
          <View style={{ backgroundColor: C.blueDeep, borderWidth: 3, borderColor: C.inkSoft, overflow: 'hidden', marginBottom: 12 }}>
            <Image source={FEATURE_ART.holding} resizeMode="cover" style={{ width: '100%', height: layout.compact ? 102 : 128 }} />
            <View style={{ paddingHorizontal: 12, paddingVertical: layout.compact ? 9 : 12, alignItems: 'center' }}>
              <PixelText font="pixel" size={layout.compact ? 8 : 10} color={C.charm} style={{ textAlign: 'center' }}>
                YOUR STORY DOES NOT END AT NOBLE
              </PixelText>
              <PixelText font="body" size={layout.compact ? 15 : 17} color={C.cream} style={{ textAlign: 'center', marginTop: 7 }}>
                Build a barony, grow a dynasty, face royal decisions, and chase the crown across every life you begin.
              </PixelText>
            </View>
          </View>
          <PaywallPanel
            planIds={PAYWALL_PLAN_IDS}
            unlocked={premiumUnlocked}
            accessState={accessState}
            onPurchase={onPurchase}
            onRestore={onRestore}
            onUnlocked={onDone}
            ctaLabel="BEGIN MY FULL ADVENTURE"
            variant="onboarding"
          />
        </View>
      )}
    </FullScreenPage>
  );
}
