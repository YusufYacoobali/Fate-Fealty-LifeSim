import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { SHOP_ITEMS, shopItemById } from '@/data/shop';
import { ShopItem } from '@/types/game';
import { C } from '@/theme/theme';
import { shopItemIconAsset } from '@/assets/generatedAssets';

interface Props {
  gold: number;
  income: number;
  expenses: number;
  inventory: string[];
  onBuy: (item: ShopItem) => void;
}

function Ledger({ label, value, bg, border, fg, valFg }: { label: string; value: string; bg: string; border: string; fg: string; valFg: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderWidth: 3, borderColor: border, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 5 }}>
      <PixelText font="pixel" size={6} color={fg}>
        {label}
      </PixelText>
      <PixelText font="body" size={18} color={valFg}>
        {value}
      </PixelText>
    </View>
  );
}

export function ShopTab({ gold, income, expenses, inventory, onBuy }: Props) {
  const owned = inventory.map((id) => shopItemById(id)).filter(Boolean) as ShopItem[];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 11, paddingBottom: 7 }}>
      <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginVertical: 4, marginBottom: 8 }}>
        🛒 MERCHANT'S STALL
      </PixelText>

      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 11 }}>
        <Ledger label="INCOME" value={`${income}g`} bg="#eaf7e4" border="#9bc46a" fg="#5a8a2a" valFg="#3a5a1a" />
        <Ledger label="SPENT" value={`${expenses}g`} bg="#fdeaea" border={C.health} fg={C.bad} valFg="#8a2a2a" />
        <Ledger label="PURSE" value={`${gold}g`} bg="#fff6df" border={C.charm} fg={C.amber} valFg="#7a5a1a" />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {SHOP_ITEMS.map((it) => {
          const isOwned = it.type === 'perm' && inventory.includes(it.id);
          return (
            <PixelButton
              key={it.id}
              bg={isOwned ? '#e4f3da' : C.parch}
              shadow={C.parchSd}
              light={C.parchSl}
              outline={C.parchBorder}
              onPress={() => onBuy(it)}
              style={{ width: '48.5%', marginBottom: 8 }}
              innerStyle={{ padding: 8, minHeight: 96 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ width: 28, height: 28, backgroundColor: it.iconBg, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <ShopIcon item={it} size={25} fallbackSize={16} />
                </View>
                <View style={{ backgroundColor: isOwned ? C.faithDark : C.charm, borderWidth: 2, borderColor: C.inkSoft, paddingHorizontal: 5, paddingVertical: 3 }}>
                  <PixelText font="pixel" size={7} color={isOwned ? C.white : '#3a2a08'}>
                    {isOwned ? 'OWNED' : `${it.price}g`}
                  </PixelText>
                </View>
              </View>
              <PixelText font="pixel" size={7} color="#3a2a08" style={{ marginTop: 4 }}>
                {it.name}
              </PixelText>
              <PixelText font="body" size={13} color="#6a5a38" style={{ marginTop: 4 }}>
                {isOwned ? 'Owned - part of thy estate.' : it.desc}
              </PixelText>
            </PixelButton>
          );
        })}
      </View>

      {owned.length > 0 && (
        <>
          <PixelText font="pixel" size={7} color={C.blueDeep} style={{ marginTop: 13, marginBottom: 7 }}>
            THY POSSESSIONS
          </PixelText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {owned.map((o) => (
              <View key={o.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.faith, borderWidth: 2, borderColor: C.inkSoft, borderBottomColor: C.faithDark, borderRightColor: C.faithDark, paddingHorizontal: 7, paddingVertical: 4 }}>
                <ShopIcon item={o} size={20} fallbackSize={14} />
                <PixelText font="body" size={14} color="#1a3a0a">
                  {o.short}
                </PixelText>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function ShopIcon({ item, size, fallbackSize }: { item: ShopItem; size: number; fallbackSize: number }) {
  const asset = shopItemIconAsset(item.id);

  if (!asset) {
    return <PixelText size={fallbackSize}>{item.icon}</PixelText>;
  }

  return <Image source={asset} resizeMode="contain" style={{ width: size, height: size }} />;
}
