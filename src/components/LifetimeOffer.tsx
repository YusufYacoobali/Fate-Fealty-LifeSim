import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelButton } from './ui/PixelButton';
import { PixelText } from './ui/PixelText';
import { getLifetimeOfferDetails } from '@/services/purchases';
import type { PremiumAccessState } from '@/state/hooks/usePremium';

const BENEFITS = [
  'Baron and Monarch ranks',
  'Premium ruler events',
  'Extra goals and deeds',
  'All future premium chapters',
  'One purchase, no renewal',
] as const;

interface Props {
  unlocked: boolean;
  accessState?: PremiumAccessState;
  message?: string;
  priceLabel?: string;
  offerMissing?: boolean;
  storeUnavailable?: boolean;
  offerLoading?: boolean;
  loading?: boolean;
  onPurchase: () => void;
  onRestore: () => void;
}

export function LifetimeOffer({
  unlocked,
  accessState = unlocked ? 'active' : 'inactive',
  message,
  priceLabel,
  offerMissing = false,
  storeUnavailable = false,
  offerLoading = false,
  loading = false,
  onPurchase,
  onRestore,
}: Props) {
  const [localPriceLabel, setLocalPriceLabel] = useState<string | undefined>();
  const [localOfferLoading, setLocalOfferLoading] = useState(!unlocked && priceLabel === undefined);
  const [localOfferMissing, setLocalOfferMissing] = useState(false);
  const [localStoreUnavailable, setLocalStoreUnavailable] = useState(false);

  useEffect(() => {
    if (unlocked || priceLabel !== undefined) return;
    let active = true;
    setLocalOfferLoading(true);
    getLifetimeOfferDetails().then((details) => {
      if (!active) return;
      setLocalOfferLoading(false);
      setLocalStoreUnavailable(details === null);
      setLocalOfferMissing(details?.available === false);
      setLocalPriceLabel(details?.priceString ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [priceLabel, unlocked]);

  const checkingAccess = accessState === 'loading';
  const effectiveOfferLoading = offerLoading || localOfferLoading;
  const effectiveOfferMissing = offerMissing || localOfferMissing;
  const storeBlocked = storeUnavailable || localStoreUnavailable || accessState === 'unavailable';
  const effectivePriceLabel = priceLabel ?? localPriceLabel;
  const buyDisabled = unlocked || loading || checkingAccess || effectiveOfferLoading || effectiveOfferMissing || storeBlocked;

  return (
    <View>
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 11 }}>
        <View style={{ backgroundColor: unlocked ? C.faith : C.health, borderWidth: 2, borderColor: C.inkSoft, borderBottomColor: unlocked ? C.faithDark : C.healthDark, borderRightColor: unlocked ? C.faithDark : C.healthDark, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8 }}>
          <PixelText font="pixel" size={7} color={C.white}>
            {unlocked ? 'OWNED' : 'LIFETIME PASS'}
          </PixelText>
        </View>
        <PixelText font="pixel" size={12} color={C.blueDeep} style={{ textAlign: 'center' }}>
          LIFETIME PASS
        </PixelText>
        <PixelText font="body" size={18} color={C.textBrown} style={{ textAlign: 'center', marginTop: 7 }}>
          {unlocked ? 'Baron, Monarch, and future chapters are yours.' : 'Own the bigger medieval life, forever.'}
        </PixelText>
      </View>

      <View style={{ backgroundColor: C.blueDeep, borderWidth: 3, borderColor: C.inkSoft, borderBottomColor: C.blueDark, borderRightColor: C.blueDark, padding: 12, alignItems: 'center' }}>
        <PixelText font="body" size={16} color={C.creamBlue}>
          {unlocked ? 'Lifetime Pass owned' : "Founder's lifetime unlock"}
        </PixelText>
        <PixelText font="pixel" size={18} color={C.charm} style={{ marginTop: 6 }}>
          {unlocked ? 'UNLOCKED' : checkingAccess || effectiveOfferLoading ? 'CHECKING...' : storeBlocked || effectiveOfferMissing ? 'UNAVAILABLE' : effectivePriceLabel ?? 'CHECKING...'}
        </PixelText>
      </View>

      <View style={{ marginTop: 10, gap: 7 }}>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 12, height: 12, backgroundColor: C.faith, borderWidth: 2, borderColor: C.faithDark }} />
            <PixelText font="body" size={16} color={C.textDark}>
              {benefit}
            </PixelText>
          </View>
        ))}
      </View>

      <PixelButton disabled={buyDisabled} bg={unlocked ? C.faith : C.charm} shadow={unlocked ? C.faithDark : C.charmDark} light="#fff1b0" onPress={onPurchase} style={{ marginTop: 13 }} innerStyle={{ paddingVertical: 12, alignItems: 'center' }}>
        <PixelText font="pixel" size={9} color="#3a2a08">
          {unlocked ? 'OWNED' : checkingAccess || effectiveOfferLoading ? 'CHECKING...' : effectiveOfferMissing || storeBlocked ? 'NOT AVAILABLE' : loading ? 'WORKING...' : 'BUY LIFETIME PASS'}
        </PixelText>
      </PixelButton>
      {!unlocked && (
        <PixelButton disabled={loading} bg={C.light} shadow={C.blue} light={C.sky} onPress={onRestore} style={{ marginTop: 7 }} innerStyle={{ paddingVertical: 9, alignItems: 'center' }}>
          <PixelText font="pixel" size={8} color={C.blueDark}>
            RESTORE
          </PixelText>
        </PixelButton>
      )}
      {!!message && (
        <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 7, textAlign: 'center' }}>
          {message}
        </PixelText>
      )}
    </View>
  );
}
