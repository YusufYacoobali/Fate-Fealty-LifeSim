import React, { useState } from 'react';
import { Image, ImageSourcePropType, TouchableOpacity, View } from 'react-native';
import { PAYWALL_ART, TRAIT_ICONS } from '@/assets/generatedAssets';
import { PAYWALL_PLAN_IDS, PREMIUM_BENEFIT_DETAILS, PREMIUM_PLANS, SHOP_PLAN_IDS, PlanId } from '@/data/premiumPlans';
import { PlanOffers, PurchaseOutcome } from '@/services/purchases';
import { annualSubscriptionValue } from '@/services/purchasesLogic';
import type { PremiumAccessState } from '@/state/hooks/usePremium';
import { usePremiumOffers } from '@/state/hooks/usePremiumOffers';
import { usePurchaseFlow } from '@/state/hooks/usePurchaseFlow';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { openLegalLink, PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@/services/legal';

const ROYAL = {
  page: '#0a3768',
  panel: '#082c56',
  panelLight: '#10477e',
  edge: '#236aa8',
  gold: '#f4bc2b',
  goldLight: '#ffe78b',
  goldDark: '#9a5a05',
  cream: '#edf6ff',
  paleBlue: '#c9ddf6',
  ink: '#071b35',
} as const;

const FEATURES: ReadonlyArray<{ copy: string; art: ImageSourcePropType }> = [
  { copy: 'Reach Baron and Monarch ranks', art: PAYWALL_ART.crown },
  { copy: 'Unlock royal stories, goals, and deeds', art: PAYWALL_ART.stories },
  { copy: 'Gain royal Holding orders and buildings', art: PAYWALL_ART.holding },
];

const SHOP_FEATURES: ReadonlyArray<{ title: string; body: string; art: ImageSourcePropType }> = [
  { ...PREMIUM_BENEFIT_DETAILS[1], art: PAYWALL_ART.crown },
  { ...PREMIUM_BENEFIT_DETAILS[0], art: PAYWALL_ART.holding },
  { ...PREMIUM_BENEFIT_DETAILS[2], art: PAYWALL_ART.stories },
  { ...PREMIUM_BENEFIT_DETAILS[3], art: TRAIT_ICONS.goose_cursed },
  { ...PREMIUM_BENEFIT_DETAILS[4], art: PAYWALL_ART.monthly },
  { ...PREMIUM_BENEFIT_DETAILS[5], art: PAYWALL_ART.stories },
];

interface Props {
  compact: boolean;
  unlocked: boolean;
  accessState: PremiumAccessState;
  onPurchase: (plan: PlanId) => Promise<PurchaseOutcome>;
  onRestore: () => Promise<boolean>;
  onUnlocked?: () => void;
}

interface RoyalOfferProps extends Props {
  surface: 'onboarding' | 'shop';
}

function Corner({ top, right, bottom, left }: { top?: number; right?: number; bottom?: number; left?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        right,
        bottom,
        left,
        width: 9,
        height: 9,
        backgroundColor: ROYAL.gold,
        borderWidth: 2,
        borderColor: ROYAL.goldDark,
        zIndex: 2,
      }}
    />
  );
}

function SelectionMark({ selected, compact }: { selected: boolean; compact: boolean }) {
  if (selected) {
    return (
      <Image
        source={PAYWALL_ART.check}
        resizeMode="contain"
        style={{ width: compact ? 29 : 35, height: compact ? 29 : 35, flexShrink: 0 }}
      />
    );
  }
  return (
    <View
      style={{
        width: compact ? 25 : 29,
        height: compact ? 25 : 29,
        flexShrink: 0,
        backgroundColor: '#e3eefb',
        borderWidth: 3,
        borderColor: '#6a88a9',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
    </View>
  );
}

function formatCalculatedPrice(value: number, currencyCode: string | null, fallbackPrice: string): string {
  if (currencyCode) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      // Fall through to the store string's currency mark.
    }
  }
  const currencyMark = fallbackPrice.replace(/[\d\s.,-]/g, '') || '$';
  return `${currencyMark}${value.toFixed(2)}`;
}

function annualValueCopy(offers: PlanOffers | null): string {
  const livePricesMatch =
    offers?.annual.price != null &&
    offers.monthly.price != null &&
    !!offers.annual.currencyCode &&
    offers.annual.currencyCode === offers.monthly.currencyCode;
  const annualPrice = livePricesMatch ? offers.annual.price! : 9.99;
  const monthlyPrice = livePricesMatch ? offers.monthly.price! : 2.99;
  const value = annualSubscriptionValue(annualPrice, monthlyPrice) ?? annualSubscriptionValue(9.99, 2.99)!;
  const currencyCode = livePricesMatch ? offers.annual.currencyCode : null;
  const annualStorePrice = livePricesMatch ? offers.annual.priceString ?? PREMIUM_PLANS.annual.fallbackPrice : PREMIUM_PLANS.annual.fallbackPrice;
  const perMonth = formatCalculatedPrice(value.perMonth, currencyCode, annualStorePrice);
  return `Only ${perMonth}/month | SAVE ${value.savingsPercent}%`;
}

function RoyalOfferPanel({
  surface,
  compact,
  unlocked,
  accessState,
  onPurchase,
  onRestore,
  onUnlocked,
}: RoyalOfferProps) {
  const shop = surface === 'shop';
  const planIds = shop ? SHOP_PLAN_IDS : PAYWALL_PLAN_IDS;
  const [selected, setSelected] = useState<PlanId>(planIds[0]);
  const { offers, storeUnavailable } = usePremiumOffers(!unlocked);
  const { message, busy, buy, restore } = usePurchaseFlow(onPurchase, onRestore);

  const checkingAccess = accessState === 'loading';
  const storeBlocked = storeUnavailable || accessState === 'unavailable';
  const selectedMissing = !!offers && !offers[selected].available;
  const buyDisabled = unlocked || busy || checkingAccess || storeBlocked || selectedMissing;
  const ctaText = unlocked
    ? 'PREMIUM OWNED'
    : busy
      ? 'OPENING THE TREASURY...'
      : checkingAccess
        ? 'CHECKING ACCESS...'
        : storeBlocked || selectedMissing
          ? 'STORE NOT AVAILABLE'
          : 'UNLOCK THE FULL REALM';

  const handleBuy = async () => {
    const outcome = await buy(selected);
    if (outcome === 'purchased') onUnlocked?.();
  };

  const handleRestore = async () => {
    const restored = await restore();
    if (restored) onUnlocked?.();
  };

  return (
    <View style={{ gap: compact ? 7 : 10 }}>
      <View
        style={{
          backgroundColor: ROYAL.panel,
          borderWidth: 3,
          borderColor: ROYAL.gold,
          padding: 3,
          overflow: 'hidden',
        }}
      >
        <Corner top={2} left={2} />
        <Corner top={2} right={2} />
        <Corner bottom={2} left={2} />
        <Corner bottom={2} right={2} />
        <View style={{ borderBottomWidth: 3, borderBottomColor: ROYAL.edge }}>
          <Image
            source={PAYWALL_ART.hero}
            resizeMode="cover"
            style={{ width: '100%', height: compact ? 100 : 140 }}
          />
        </View>
        <View style={{ paddingHorizontal: compact ? 12 : 18, paddingVertical: compact ? 7 : 11, alignItems: 'center' }}>
          <PixelText font="pixel" size={compact ? 8 : 9} color={ROYAL.gold} style={{ textAlign: 'center' }}>
            {shop ? 'MORE REALM. MORE STORIES. MORE WAYS TO RULE.' : 'BEGIN AS NOTHING. RULE EVERYTHING.'}
          </PixelText>
          <PixelText font="body" size={compact ? 15 : 16} color={ROYAL.cream} style={{ textAlign: 'center', marginTop: compact ? 3 : 6 }}>
            {shop
              ? 'Choose a subscription or own the complete premium adventure for life.'
              : 'Rise beyond Noble, expand thy Holding, and chase the crown.'}
          </PixelText>
        </View>
      </View>

      {unlocked ? (
        <View style={{ backgroundColor: ROYAL.panel, borderWidth: 3, borderColor: ROYAL.gold, padding: compact ? 11 : 16, alignItems: 'center' }}>
          <Image source={PAYWALL_ART.check} resizeMode="contain" style={{ width: compact ? 50 : 64, height: compact ? 50 : 64 }} />
          <PixelText font="pixel" size={compact ? 8 : 10} color={ROYAL.gold} style={{ marginTop: 6 }}>PREMIUM OWNED</PixelText>
          <PixelText font="body" size={compact ? 14 : 16} color={ROYAL.cream} style={{ marginTop: 6, textAlign: 'center' }}>
            Every premium rank, Holding upgrade, story, goal, deed, and future chapter is unlocked.
          </PixelText>
        </View>
      ) : (
        <>
      <View style={{ backgroundColor: ROYAL.panel, borderWidth: 3, borderColor: ROYAL.gold, padding: compact ? 6 : 9 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: compact ? 5 : 8 }}>
          <View style={{ flex: 1, height: 2, backgroundColor: ROYAL.goldDark }} />
          <PixelText font="pixel" size={compact ? 7 : 8} color={ROYAL.gold}>CHOOSE THY PASS</PixelText>
          <View style={{ flex: 1, height: 2, backgroundColor: ROYAL.goldDark }} />
        </View>

        {planIds.map((id, index) => {
          const plan = PREMIUM_PLANS[id];
          const isAnnual = id === 'annual';
          const isLifetime = id === 'lifetime';
          const isSelected = selected === id;
          const price = offers?.[id].priceString ?? plan.fallbackPrice;
          const unavailable = !!offers && !offers[id].available;
          return (
            <TouchableOpacity
              key={id}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: unavailable }}
              activeOpacity={0.84}
              disabled={unavailable}
              onPress={() => setSelected(id)}
              style={{
                // Yearly is the recommendation and stands tallest; monthly is the
                // option of last resort and is given the least room accordingly.
                minHeight: isAnnual ? (compact ? 69 : 76) : isLifetime ? (compact ? 57 : 61) : compact ? 46 : 50,
                marginTop: index === 0 ? 0 : compact ? 6 : 8,
                paddingHorizontal: compact ? 6 : 9,
                paddingVertical: compact ? 4 : 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: compact ? 6 : 9,
                backgroundColor: isAnnual ? '#ffdd72' : isLifetime ? '#e4d4f6' : '#c8dcf4',
                borderWidth: isSelected ? 4 : 3,
                borderColor: isSelected
                  ? isAnnual
                    ? '#fff0a3'
                    : '#f4fbff'
                  : isAnnual
                    ? ROYAL.goldDark
                    : isLifetime
                      ? '#9671b8'
                      : '#7294ba',
                opacity: unavailable ? 0.5 : 1,
              }}
            >
              <Image
                source={isAnnual ? PAYWALL_ART.crown : isLifetime ? PAYWALL_ART.holding : PAYWALL_ART.monthly}
                resizeMode="contain"
                style={{
                  width: isAnnual ? (compact ? 40 : 46) : isLifetime ? (compact ? 35 : 40) : compact ? 28 : 32,
                  height: isAnnual ? (compact ? 40 : 46) : isLifetime ? (compact ? 35 : 40) : compact ? 28 : 32,
                }}
              />
              <View style={{ flex: 1 }}>
                {(isAnnual || isLifetime) && (
                  <PixelText font="pixel" size={compact ? 5 : 6} color={isLifetime ? '#62358c' : '#9b241d'} style={{ marginBottom: 3 }}>
                    {isAnnual ? 'BEST VALUE' : 'PAY ONCE'}
                  </PixelText>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 7 }}>
                  <PixelText font="pixel" size={compact ? 7 : 9} color={isAnnual ? '#513100' : ROYAL.panel}>{plan.name}</PixelText>
                  <PixelText font="pixel" size={compact ? 8 : 10} color={ROYAL.ink}>{unavailable ? 'UNAVAILABLE' : price}</PixelText>
                </View>
                <PixelText font="body" size={compact ? 12 : 14} color={isAnnual ? '#664308' : '#34597f'} style={{ marginTop: 2 }}>
                  {isAnnual ? annualValueCopy(offers) : isLifetime ? plan.blurb : plan.period}
                </PixelText>
              </View>
              <SelectionMark selected={isSelected} compact={compact} />
            </TouchableOpacity>
          );
        })}
      </View>

      <PixelButton
        disabled={buyDisabled}
        bg={ROYAL.gold}
        shadow={ROYAL.goldDark}
        light={ROYAL.goldLight}
        onPress={handleBuy}
        innerStyle={{ minHeight: compact ? 41 : 54, paddingVertical: compact ? 7 : 1, paddingHorizontal: 10, justifyContent: 'center' }}
      >
        <View style={{ width: '100%', minHeight: compact ? 31 : 38, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: compact ? 7 : 10, paddingHorizontal: 24 }}>
            <Image source={PAYWALL_ART.crown} resizeMode="contain" style={{ width: compact ? 34 : 35, height: compact ? 34 : 35 }} />
            <PixelText font="pixel" size={compact ? 7 : 9} color="#432700" style={{ textAlign: 'center', flexShrink: 1 }}>
              {ctaText}
            </PixelText>
          </View>
          <PixelText font="body" size={compact ? 25 : 31} color="#5d3500" style={{ position: 'absolute', right: 2 }}>
            &gt;
          </PixelText>
        </View>
      </PixelButton>

      <PixelText font="body" size={compact ? 11 : 13} color="#a9c9e8" style={{ textAlign: 'center' }}>
        {selected === 'lifetime' ? 'One payment. No subscription.' : 'Payment is charged to your store account. Subscriptions renew automatically unless cancelled at least 24 hours before the current period ends. Manage or cancel in your store subscription settings.'}
      </PixelText>
      {storeBlocked && (
        <PixelText font="body" size={compact ? 11 : 13} color={ROYAL.cream} style={{ textAlign: 'center' }}>
          The store is unreachable right now.
        </PixelText>
      )}
      {!!message && (
        <PixelText font="body" size={compact ? 12 : 13} color={ROYAL.cream} style={{ textAlign: 'center' }}>
          {message}
        </PixelText>
      )}
      <TouchableOpacity onPress={handleRestore} disabled={busy} style={{ alignSelf: 'center', padding: 7 }}>
        <PixelText font="body" size={compact ? 13 : 15} color={ROYAL.paleBlue}>Restore purchases</PixelText>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
        <TouchableOpacity accessibilityRole="link" onPress={() => { void openLegalLink(PRIVACY_POLICY_URL); }} style={{ padding: 7 }}>
          <PixelText font="body" size={14} color={ROYAL.paleBlue}>Privacy policy</PixelText>
        </TouchableOpacity>
        {TERMS_OF_USE_URL && (
          <TouchableOpacity accessibilityRole="link" onPress={() => { if (TERMS_OF_USE_URL) void openLegalLink(TERMS_OF_USE_URL); }} style={{ padding: 7 }}>
            <PixelText font="body" size={14} color={ROYAL.paleBlue}>Terms of use</PixelText>
          </TouchableOpacity>
        )}
      </View>
        </>
      )}

      {shop ? (
        <View style={{ gap: compact ? 5 : 7 }}>
          {SHOP_FEATURES.map((feature) => (
            <View
              key={feature.title}
              style={{
                minHeight: compact ? 54 : 64,
                flexDirection: 'row',
                alignItems: 'center',
                gap: compact ? 7 : 10,
                backgroundColor: ROYAL.panelLight,
                borderWidth: 2,
                borderColor: ROYAL.edge,
                paddingHorizontal: compact ? 5 : 8,
                paddingVertical: compact ? 4 : 6,
              }}
            >
              <Image source={PAYWALL_ART.check} resizeMode="contain" style={{ width: compact ? 25 : 31, height: compact ? 25 : 31 }} />
              <View style={{ flex: 1 }}>
                <PixelText font="pixel" size={compact ? 7 : 7} color={ROYAL.gold}>{feature.title}</PixelText>
                <PixelText font="body" size={compact ? 13 : 15} color={ROYAL.cream} style={{ marginTop: 3 }}>{feature.body}</PixelText>
              </View>
              <Image source={feature.art} resizeMode="contain" style={{ width: compact ? 43 : 52, height: compact ? 43 : 52 }} />
            </View>
          ))}
        </View>
      ) : (
        <View>
          {FEATURES.map((feature, index) => (
          <View
            key={feature.copy}
            style={{
              minHeight: compact ? 48 : 50,
              flexDirection: 'row',
              alignItems: 'center',
              gap: compact ? 6 : 9,
              borderBottomWidth: index === FEATURES.length - 1 ? 0 : 2,
              borderBottomColor: ROYAL.edge,
              borderStyle: 'dotted',
              paddingHorizontal: compact ? 2 : 4,
              paddingVertical: compact ? 1 : 2,
            }}
          >
            <Image source={PAYWALL_ART.check} resizeMode="contain" style={{ width: compact ? 24 : 31, height: compact ? 24 : 31 }} />
            <PixelText font="body" size={compact ? 15 : 16} color={ROYAL.cream} style={{ flex: 1 }}>
              {feature.copy}
            </PixelText>
            <Image source={feature.art} resizeMode="contain" style={{ width: compact ? 41 : 40, height: compact ? 41 : 40 }} />
          </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** End-of-onboarding subscription paywall. Lifetime is impossible on this surface. */
export function OnboardingPaywallPanel(props: Props) {
  return <RoyalOfferPanel {...props} surface="onboarding" />;
}

/** In-game shop with the same royal treatment and every purchase option. */
export function RoyalShopOfferPanel(props: Props) {
  return <RoyalOfferPanel {...props} surface="shop" />;
}
