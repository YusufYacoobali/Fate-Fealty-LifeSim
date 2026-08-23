import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { PixelText } from '../ui/PixelText';
import { PixelButton } from '../ui/PixelButton';
import { MARKETS, MARKET_BY_ID, SHOP_ITEMS, shopItemById } from '@/data/shop';
import { GameState, ShopItem, ShopMarket } from '@/types/game';
import { itemInStock, marketPrice, shopAvailability } from '@/engine/shopEngine';
import { C } from '@/theme/theme';
import { shopItemIconAsset } from '@/assets/generatedAssets';

interface Props {
  state: GameState;
  gold: number;
  income: number;
  expenses: number;
  inventory: string[];
  onBuy: (item: ShopItem) => void;
}

type MarketFilter = ShopMarket | 'all';

function Ledger({ label, value, bg, border, fg, valFg }: { label: string; value: string; bg: string; border: string; fg: string; valFg: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderWidth: 3, borderColor: border, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 5 }}>
      <PixelText font="pixel" size={7} color={fg}>
        {label}
      </PixelText>
      <PixelText font="body" size={18} color={valFg}>
        {value}
      </PixelText>
    </View>
  );
}

export function ShopTab({ state, gold, income, expenses, inventory, onBuy }: Props) {
  const [filter, setFilter] = React.useState<MarketFilter>('all');
  const owned = inventory.map((id) => shopItemById(id)).filter(Boolean) as ShopItem[];

  // Only show what is actually laid out this year. The rest simply is not in
  // Swineford, and a grid of grey "not stocked" cards helps nobody.
  const stocked = SHOP_ITEMS.filter((item) => itemInStock(state, item));
  const shown = filter === 'all' ? stocked : stocked.filter((item) => item.market === filter);
  const marketsWithStock = MARKETS.filter((market) => stocked.some((item) => item.market === market.id));
  const chips: { id: MarketFilter; label: string }[] = [
    { id: 'all', label: 'ALL WARES' },
    ...marketsWithStock.map((market) => ({ id: market.id as MarketFilter, label: market.label })),
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, borderBottomWidth: 3, borderBottomColor: C.paleEdge }}
        contentContainerStyle={{ gap: 5, padding: 9 }}
      >
        {chips.map((chip) => (
          <PixelButton
            key={chip.id}
            bg={filter === chip.id ? C.faith : C.lightFill}
            shadow={filter === chip.id ? C.faithDark : C.paleEdge}
            onPress={() => setFilter(chip.id)}
            innerStyle={{ paddingHorizontal: 8, paddingVertical: 6 }}
          >
            <PixelText font="pixel" size={7} color={C.blueDark}>{chip.label}</PixelText>
          </PixelButton>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 11, paddingBottom: 7 }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 11 }}>
          <Ledger label="INCOME" value={`${income}g`} bg="#eaf7e4" border="#9bc46a" fg="#5a8a2a" valFg="#3a5a1a" />
          <Ledger label="SPENT" value={`${expenses}g`} bg="#fdeaea" border={C.health} fg={C.bad} valFg="#8a2a2a" />
          <Ledger label="PURSE" value={`${gold}g`} bg="#fff6df" border={C.charm} fg={C.amber} valFg="#7a5a1a" />
        </View>

        <View style={{ backgroundColor: C.blueDeep, borderWidth: 2, borderColor: C.inkSoft, padding: 8, marginBottom: 11 }}>
          <PixelText font="pixel" size={8} color={C.charm}>
            {filter === 'all' ? `THE STALLS OF SWINEFORD · ${state.world.currentYear}` : MARKET_BY_ID[filter].title}
          </PixelText>
          <PixelText font="body" size={15} color={C.creamBlue} style={{ marginTop: 5 }}>
            {filter === 'all'
              ? 'Traders come and go with the year, and their prices follow the fortunes of the village. What is absent now may return.'
              : MARKET_BY_ID[filter].blurb}
          </PixelText>
        </View>

        {filter === 'all'
          ? marketsWithStock.map((market) => (
            <View key={market.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <View style={{ width: 12, height: 12, backgroundColor: market.bg, borderWidth: 2, borderColor: market.sd }} />
                <PixelText font="pixel" size={8} color={C.blueDeep}>{market.title}</PixelText>
              </View>
              <ItemGrid state={state} items={shown.filter((item) => item.market === market.id)} inventory={inventory} onBuy={onBuy} />
            </View>
          ))
          : <ItemGrid state={state} items={shown} inventory={inventory} onBuy={onBuy} />}

        {owned.length > 0 && (
          <>
            <PixelText font="pixel" size={8} color={C.blueDeep} style={{ marginTop: 13, marginBottom: 7 }}>
              THY POSSESSIONS
            </PixelText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {owned.map((o) => (
                <View key={o.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.faith, borderWidth: 2, borderColor: C.inkSoft, borderBottomColor: C.faithDark, borderRightColor: C.faithDark, paddingHorizontal: 7, paddingVertical: 4 }}>
                  <ShopIcon item={o} size={20} />
                  <PixelText font="body" size={14} color="#1a3a0a">
                    {o.short}
                  </PixelText>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ItemGrid({ state, items, inventory, onBuy }: { state: GameState; items: ShopItem[]; inventory: string[]; onBuy: (item: ShopItem) => void }) {
  if (!items.length) {
    return (
      <PixelText font="body" size={16} color={C.textMuted} style={{ marginBottom: 12 }}>
        This trader has nothing for thee this year.
      </PixelText>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {items.map((it) => {
        const isOwned = it.type === 'perm' && inventory.includes(it.id);
        const availability = shopAvailability(state, it);
        const price = marketPrice(state, it);
        const dearer = price > it.price;
        return (
          <PixelButton
            key={it.id}
            bg={isOwned ? '#e4f3da' : C.parch}
            shadow={C.parchSd}
            light={C.parchSl}
            outline={C.parchBorder}
            onPress={() => onBuy(it)}
            disabled={!availability.available}
            style={{ width: '48.5%', marginBottom: 8 }}
            innerStyle={{ padding: 8, minHeight: 96 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 28, height: 28, backgroundColor: it.iconBg, borderWidth: 2, borderColor: C.inkSoft, alignItems: 'center', justifyContent: 'center' }}>
                <ShopIcon item={it} size={25} />
              </View>
              <View style={{ backgroundColor: isOwned ? C.faithDark : availability.available ? C.charm : C.paleEdge, borderWidth: 2, borderColor: C.inkSoft, paddingHorizontal: 5, paddingVertical: 3 }}>
                <PixelText font="pixel" size={8} color={isOwned ? C.white : availability.available ? '#3a2a08' : C.blueDark}>
                  {isOwned ? 'OWNED' : `${price}g`}
                </PixelText>
              </View>
            </View>
            <PixelText font="pixel" size={8} color="#3a2a08" style={{ marginTop: 4 }}>
              {it.name}
            </PixelText>
            <PixelText font="body" size={14} color={isOwned || availability.available ? '#6a5a38' : C.bad} style={{ marginTop: 4 }}>
              {isOwned ? 'Owned — part of thy estate.' : availability.available ? it.desc : availability.reason}
            </PixelText>
            {!isOwned && availability.available && dearer && (
              <PixelText font="body" size={13} color={C.amber} style={{ marginTop: 3 }}>
                Dearer than usual this year.
              </PixelText>
            )}
          </PixelButton>
        );
      })}
    </View>
  );
}

function ShopIcon({ item, size }: { item: ShopItem; size: number }) {
  const asset = shopItemIconAsset(item.id);
  return <Image source={asset} resizeMode="contain" style={{ width: size, height: size }} />;
}
