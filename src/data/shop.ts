import { ShopItem } from '@/types/game';
import { C } from '@/theme/theme';

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'bread', name: 'BREAD', short: 'Bread', icon: '🍞', iconBg: '#cda35f', price: 2, type: 'consumable', eff: { health: 4 }, desc: 'A humble meal. +4 health' },
  { id: 'herbs', name: 'HEAL HERBS', short: 'Herbs', icon: '🌿', iconBg: C.faith, price: 6, type: 'consumable', eff: { health: 12 }, desc: 'Bitter, potent. +12 health' },
  { id: 'ale', name: 'ALE BARREL', short: 'Ale', icon: '🍺', iconBg: C.charm, price: 3, type: 'consumable', eff: { charm: 5, health: -2 }, desc: 'Liquid courage. +5 charm' },
  { id: 'candle', name: 'HOLY CANDLE', short: 'Candle', icon: '🕯️', iconBg: C.orange, price: 4, type: 'consumable', eff: { faith: 8 }, desc: 'Light the soul. +8 faith' },
  { id: 'tunic', name: 'FINE TUNIC', short: 'Tunic', icon: '👕', iconBg: C.light, price: 15, type: 'perm', eff: { charm: 8 }, desc: 'Less peasant-like. +8 charm' },
  { id: 'quill', name: 'GOOSE QUILL', short: 'Quill', icon: '🪶', iconBg: C.purple, price: 12, type: 'perm', eff: { wits: 10 }, desc: 'For lettered folk. +10 wits' },
  { id: 'sword', name: 'IRON SWORD', short: 'Sword', icon: '⚔️', iconBg: C.paleEdge, price: 25, type: 'perm', eff: { charm: 6, health: 3 }, desc: 'A knight needs steel. +6 charm' },
  { id: 'steed', name: 'STURDY STEED', short: 'Steed', icon: '🐴', iconBg: '#cda35f', price: 40, type: 'perm', eff: { charm: 5, health: 5 }, desc: 'No more walking! Status.' },
  { id: 'relic', name: 'HOLY RELIC', short: 'Relic', icon: '✝️', iconBg: C.charm, price: 60, type: 'perm', eff: { faith: 15 }, desc: "A saint's toe, allegedly. +15 faith" },
  { id: 'cottage', name: 'STONE COTTAGE', short: 'Cottage', icon: '🏠', iconBg: '#9bc46a', price: 90, type: 'perm', eff: { health: 8, charm: 6 }, desc: 'A home of thine own!' },
];

export function shopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}
