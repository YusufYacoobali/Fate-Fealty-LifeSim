import React from 'react';
import { Pressable, View } from 'react-native';
import { C } from '@/theme/theme';
import { PixelText } from '../ui/PixelText';
import { PREMIUM_PLANS, PlanId } from '@/data/premiumPlans';
import { PlanOffers } from '@/services/purchases';

interface Props {
  planIds: PlanId[];
  selected: PlanId;
  onSelect: (plan: PlanId) => void;
  /** Live store prices; null while loading or when the store is unreachable. */
  offers: PlanOffers | null;
}

/** Radio-style plan cards. Live store price wins; fallback keeps numbers visible. */
export function PlanPicker({ planIds, selected, onSelect, offers }: Props) {
  return (
    <View style={{ gap: 8 }}>
      {planIds.map((id) => {
        const plan = PREMIUM_PLANS[id];
        const unavailable = !!offers && !offers[id].available;
        const isSelected = id === selected && !unavailable;
        const price = offers?.[id]?.priceString ?? plan.fallbackPrice;

        return (
          <Pressable
            key={id}
            disabled={unavailable}
            onPress={() => onSelect(id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled: unavailable }}
            accessibilityLabel={`${plan.name}, ${price} ${plan.period}`}
          >
            <View
              style={{
                backgroundColor: isSelected ? C.white : C.lightFill,
                borderWidth: 3,
                borderColor: isSelected ? C.charmDark : C.paleEdge,
                opacity: unavailable ? 0.45 : 1,
                paddingHorizontal: 10,
                paddingVertical: 9,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* radio square */}
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderWidth: 2,
                    borderColor: isSelected ? C.charmDark : C.inkSoft,
                    backgroundColor: C.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSelected && <View style={{ width: 6, height: 6, backgroundColor: C.charmDark }} />}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <PixelText font="pixel" size={8} color={C.blueDark}>
                      {plan.name}
                    </PixelText>
                    {plan.badge && (
                      <View style={{ backgroundColor: C.health, borderWidth: 2, borderColor: C.healthDark, paddingHorizontal: 4, paddingVertical: 2 }}>
                        <PixelText font="pixel" size={6} color={C.white}>
                          {plan.badge}
                        </PixelText>
                      </View>
                    )}
                  </View>
                  <PixelText font="body" size={14} color={C.textMuted} style={{ marginTop: 3 }}>
                    {plan.blurb}
                  </PixelText>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <PixelText font="pixel" size={9} color={unavailable ? C.textMuted : C.blueDeep}>
                    {unavailable ? 'N/A' : price}
                  </PixelText>
                  <PixelText font="body" size={13} color={C.textMuted} style={{ marginTop: 2 }}>
                    {plan.period}
                  </PixelText>
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
