import { ShopItem, ShopMarket } from '@/types/game';
import { C } from '@/theme/theme';

export interface MarketDef {
  id: ShopMarket;
  /** Filter chip label. */
  label: string;
  /** Full name shown above the stall's wares. */
  title: string;
  blurb: string;
  bg: string;
  sd: string;
}

/**
 * Swineford does not have "a shop"; it has traders, each with their own trade,
 * their own clientele, and their own opinion of thee. Staples are always laid
 * out; everything else comes and goes with the year.
 */
export const MARKETS: MarketDef[] = [
  { id: 'pedlar', label: 'PEDLAR', title: "THE PEDLAR'S PACK", blurb: 'Whatever a walking man can carry, sold before he walks on.', bg: C.charm, sd: C.charmDark },
  { id: 'market', label: 'MARKET', title: 'THE TOWN MARKET', blurb: 'Food, tools and household goods. Prices follow the harvest.', bg: '#cda35f', sd: '#9a7333' },
  { id: 'apothecary', label: 'APOTHECARY', title: 'THE APOTHECARY', blurb: 'Physic, tonics and remedies of varying honesty.', bg: C.faith, sd: C.faithDark },
  { id: 'armourer', label: 'ARMOURER', title: "THE ARMOURER'S FORGE", blurb: 'Steel, mail and the means to survive being noticed.', bg: C.paleEdge, sd: C.blue },
  { id: 'draper', label: 'DRAPER', title: "THE DRAPER'S HALL", blurb: 'Cloth and finery. What thou wear decides who speaks to thee.', bg: C.purple, sd: C.purpleDark },
  { id: 'beastmarket', label: 'BEASTS', title: 'THE BEAST MARKET', blurb: 'Livestock, hounds and horses. Some feed thee, some flatter thee.', bg: '#9bc46a', sd: '#5a8a2a' },
  { id: 'reliquary', label: 'RELIQUARY', title: 'THE RELIQUARY', blurb: 'Devotional goods, and bones of uncertain provenance.', bg: C.orange, sd: '#b06a12' },
  { id: 'scrivener', label: 'SCRIVENER', title: "THE SCRIVENER'S BENCH", blurb: 'Ink, parchment and books, for those who can use them.', bg: C.light, sd: C.blue },
  { id: 'landagent', label: 'LAND', title: 'THE LAND AGENT', blurb: 'Roofs, strips and leases. Nothing here is bought lightly.', bg: C.teal, sd: C.tealDark },
];

export const MARKET_BY_ID = Object.fromEntries(MARKETS.map((market) => [market.id, market])) as Record<ShopMarket, MarketDef>;

export const SHOP_ITEMS: ShopItem[] = [
  // --- Daily-ledger keepsakes ---------------------------------------------
  // Never stocked by a trader. These permanent items come only from the two
  // milestone chests and still appear in Thy Possessions once earned.
  { id: 'stewards_signet', market: 'reliquary', stockChance: 0, name: "STEWARD'S SIGNET", short: 'Signet', icon: '◆', iconBg: C.charm, price: 0, type: 'perm', eff: { charm: 8, wits: 5 }, desc: 'The steward marked thee as dependable. +8 charm, +5 wits' },
  { id: 'kings_charter', market: 'scrivener', stockChance: 0, name: "THE KING'S CHARTER", short: "King's Charter", icon: '♛', iconBg: C.gold, price: 0, type: 'perm', eff: { charm: 15, wits: 10, faith: 5, holding: { loyalty: 10 } }, desc: 'Royal ink opens doors. +15 charm, +10 wits, +5 faith, +10 Loyalty' },

  // --- The pedlar's pack ---------------------------------------------------
  { id: 'bread', market: 'pedlar', staple: true, name: 'BREAD', short: 'Bread', icon: '🍞', iconBg: '#cda35f', price: 2, type: 'consumable', eff: { health: 4 }, desc: 'A humble meal. +4 health' },
  { id: 'ale', market: 'pedlar', staple: true, name: 'ALE BARREL', short: 'Ale', icon: '🍺', iconBg: C.charm, price: 3, minAge: 14, type: 'consumable', eff: { charm: 5, health: -2 }, desc: 'Liquid courage. +5 charm' },
  { id: 'pottage', market: 'pedlar', staple: true, name: 'POTTAGE', short: 'Pottage', icon: '🍲', iconBg: '#cda35f', price: 3, type: 'consumable', eff: { health: 7 }, desc: 'Thick, grey, restorative. +7 health' },
  { id: 'honeycomb', market: 'pedlar', stockChance: 65, name: 'HONEYCOMB', short: 'Honey', icon: '🍯', iconBg: C.charm, price: 4, type: 'consumable', eff: { health: 4, charm: 2 }, desc: 'Sweetness and small joy. +4 health, +2 charm' },
  { id: 'salt_pouch', market: 'pedlar', stockChance: 70, name: 'POUCH OF SALT', short: 'Salt', icon: '🧂', iconBg: C.lightFill, price: 5, type: 'consumable', eff: { health: 5, holding: { stores: 4 } }, desc: 'Keeps meat and households alive. +5 health, +4 Stores' },
  { id: 'ribbon', market: 'pedlar', stockChance: 55, name: 'BRIGHT RIBBON', short: 'Ribbon', icon: '🎀', iconBg: C.health, price: 5, type: 'consumable', eff: { charm: 5 }, desc: 'Cheap, and it works anyway. +5 charm' },
  { id: 'tin_whistle', market: 'pedlar', stockChance: 45, name: 'TIN WHISTLE', short: 'Whistle', icon: '🎵', iconBg: C.purple, price: 8, type: 'perm', eff: { charm: 6 }, desc: 'Three notes, endless confidence. +6 charm' },
  { id: 'lucky_pebble', market: 'pedlar', stockChance: 35, name: 'LUCKY PEBBLE', short: 'Pebble', icon: '🪨', iconBg: C.paleEdge, price: 6, type: 'perm', eff: { wits: 4, faith: 3 }, desc: 'Certainly magic. The pedlar swore. +4 wits, +3 faith' },

  // --- The town market -----------------------------------------------------
  { id: 'salted_fish', market: 'market', staple: true, name: 'SALTED FISH', short: 'Fish', icon: '🐟', iconBg: C.teal, price: 5, type: 'consumable', eff: { health: 7 }, desc: 'Winter food. +7 health' },
  { id: 'cheese_wheel', market: 'market', stockChance: 75, name: 'CHEESE WHEEL', short: 'Cheese', icon: '🧀', iconBg: C.charm, price: 7, type: 'consumable', eff: { health: 9 }, desc: 'A whole wheel, briefly. +9 health' },
  { id: 'grain_sack', market: 'market', staple: true, name: 'SACK OF GRAIN', short: 'Grain', icon: '🌾', iconBg: '#cda35f', price: 9, type: 'consumable', eff: { health: 4, holding: { stores: 10 } }, desc: 'Fills the granary. +10 Stores' },
  { id: 'iron_pot', market: 'market', stockChance: 70, name: 'IRON POT', short: 'Pot', icon: '🍳', iconBg: C.paleEdge, price: 14, minAge: 8, type: 'perm', eff: { health: 6 }, desc: 'Hot food every night. +6 health' },
  { id: 'hand_cart', market: 'market', stockChance: 55, name: 'HAND CART', short: 'Cart', icon: '🛒', iconBg: '#cda35f', price: 22, minAge: 10, type: 'perm', eff: { health: 4, charm: 3, holding: { stores: 6 } }, desc: 'Carry more, earn more. +6 Stores' },
  { id: 'beeskep', market: 'market', stockChance: 50, name: 'BEE SKEP', short: 'Bees', icon: '🐝', iconBg: C.charm, price: 30, minAge: 10, type: 'perm', eff: { health: 3, holding: { stores: 12 } }, desc: 'Honey, wax and a hum of industry. +12 Stores' },
  { id: 'millstone', market: 'market', stockChance: 35, name: 'MILLSTONE', short: 'Millstone', icon: '⚙️', iconBg: C.paleEdge, price: 58, minAge: 14, type: 'perm', eff: { holding: { stores: 20 }, charm: 4 }, desc: 'Grind for the whole street. +20 Stores' },

  // --- The apothecary ------------------------------------------------------
  { id: 'herbs', market: 'apothecary', staple: true, name: 'HEAL HERBS', short: 'Herbs', icon: '🌿', iconBg: C.faith, price: 6, type: 'consumable', eff: { health: 12 }, desc: 'Bitter, potent. +12 health' },
  { id: 'willow_bark', market: 'apothecary', staple: true, name: 'WILLOW BARK', short: 'Willow', icon: '🌱', iconBg: C.faith, price: 8, type: 'consumable', eff: { health: 11 }, desc: 'For pain, fever and complaint. +11 health' },
  { id: 'theriac', market: 'apothecary', stockChance: 45, name: 'THERIAC', short: 'Theriac', icon: '🧪', iconBg: C.purple, price: 20, minAge: 8, type: 'consumable', eff: { health: 26 }, desc: 'Sixty ingredients, one of them viper. +26 health' },
  { id: 'leech_jar', market: 'apothecary', stockChance: 60, name: 'LEECH JAR', short: 'Leeches', icon: '🫙', iconBg: '#f3a0a0', price: 12, minAge: 8, type: 'perm', eff: { health: 7 }, desc: 'Physic on demand, forever. +7 health' },
  { id: 'plague_mask', market: 'apothecary', stockChance: 30, name: 'PLAGUE MASK', short: 'Mask', icon: '🦤', iconBg: C.inkSoft, price: 34, minAge: 12, type: 'perm', eff: { health: 11, charm: -2 }, desc: 'Beaked, stuffed with herbs, deeply alarming. +11 health' },
  { id: 'physic_garden', market: 'apothecary', stockChance: 35, name: 'PHYSIC GARDEN', short: 'Garden', icon: '🪴', iconBg: C.faith, price: 50, minAge: 14, type: 'perm', eff: { health: 14, wits: 4 }, desc: 'Thine own row of remedies. +14 health' },

  // --- The armourer --------------------------------------------------------
  { id: 'sword', market: 'armourer', staple: true, name: 'IRON SWORD', short: 'Sword', icon: '⚔️', iconBg: C.paleEdge, price: 25, minAge: 14, type: 'perm', eff: { charm: 6, health: 3 }, desc: 'A knight needs steel. +6 charm' },
  { id: 'whetstone', market: 'armourer', staple: true, name: 'WHETSTONE', short: 'Whetstone', icon: '🪨', iconBg: C.paleEdge, price: 7, minAge: 10, type: 'perm', eff: { charm: 3, health: 2 }, desc: 'An edge that stays an edge. +3 charm' },
  { id: 'shield', market: 'armourer', stockChance: 70, name: 'PAINTED SHIELD', short: 'Shield', icon: '🛡️', iconBg: C.light, price: 18, minAge: 10, type: 'perm', eff: { health: 6, charm: 3 }, desc: 'Thine own device, badly painted. +6 health' },
  { id: 'gambeson', market: 'armourer', stockChance: 70, name: 'GAMBESON', short: 'Gambeson', icon: '🧥', iconBg: '#cda35f', price: 20, minAge: 12, type: 'perm', eff: { health: 9 }, desc: 'Quilted, hot, and better than bleeding. +9 health' },
  { id: 'helm', market: 'armourer', stockChance: 55, name: 'IRON HELM', short: 'Helm', icon: '⛑️', iconBg: C.paleEdge, price: 30, minAge: 12, type: 'perm', eff: { health: 8, charm: 3 }, desc: 'Thy head, kept where it belongs. +8 health' },
  { id: 'lance', market: 'armourer', stockChance: 45, name: 'TOURNEY LANCE', short: 'Lance', icon: '🏇', iconBg: C.charm, price: 26, minAge: 14, type: 'perm', eff: { charm: 6 }, desc: 'For glory, and for splinters. +6 charm' },
  { id: 'mail_shirt', market: 'armourer', stockChance: 40, name: 'MAIL SHIRT', short: 'Mail', icon: '🥼', iconBg: C.paleEdge, price: 50, minAge: 14, type: 'perm', eff: { health: 13, charm: 5 }, desc: 'Rings enough to buy a farm. +13 health' },

  // --- The draper ----------------------------------------------------------
  { id: 'tunic', market: 'draper', staple: true, name: 'FINE TUNIC', short: 'Tunic', icon: '👕', iconBg: C.light, price: 15, minAge: 8, type: 'perm', eff: { charm: 8 }, desc: 'Less peasant-like. +8 charm' },
  { id: 'leather_boots', market: 'draper', staple: true, name: 'LEATHER BOOTS', short: 'Boots', icon: '🥾', iconBg: '#cda35f', price: 12, minAge: 6, type: 'perm', eff: { health: 5, charm: 3 }, desc: 'Dry feet change a whole life. +5 health' },
  { id: 'wool_cloak', market: 'draper', stockChance: 75, name: 'WOOL CLOAK', short: 'Cloak', icon: '🧣', iconBg: C.teal, price: 18, minAge: 6, type: 'perm', eff: { charm: 6, health: 5 }, desc: 'Warmth and a little dignity. +6 charm' },
  { id: 'silk_hose', market: 'draper', stockChance: 50, name: 'SILK HOSE', short: 'Hose', icon: '🧦', iconBg: C.purple, price: 26, minAge: 12, type: 'perm', eff: { charm: 10 }, desc: 'Ruinous, impractical, effective. +10 charm' },
  { id: 'silver_brooch', market: 'draper', stockChance: 45, name: 'SILVER BROOCH', short: 'Brooch', icon: '📿', iconBg: C.lightFill, price: 34, minAge: 10, type: 'perm', eff: { charm: 12 }, desc: 'Worn where it will be seen. +12 charm' },
  { id: 'dyed_gown', market: 'draper', stockChance: 35, name: 'DYED GOWN', short: 'Gown', icon: '👗', iconBg: C.purple, price: 46, minAge: 12, type: 'perm', eff: { charm: 14 }, desc: 'A colour the parish will discuss. +14 charm' },
  { id: 'fur_mantle', market: 'draper', stockChance: 25, name: 'FUR MANTLE', short: 'Mantle', icon: '🦡', iconBg: '#9a7333', price: 72, minAge: 14, type: 'perm', eff: { charm: 16, health: 6 }, desc: 'Only the gentry wear this. +16 charm' },

  // --- The beast market ----------------------------------------------------
  { id: 'steed', market: 'beastmarket', staple: true, name: 'STURDY STEED', short: 'Steed', icon: '🐴', iconBg: '#cda35f', price: 40, minAge: 12, type: 'perm', eff: { charm: 5, health: 5 }, desc: 'No more walking! Status.' },
  { id: 'laying_hens', market: 'beastmarket', staple: true, name: 'LAYING HENS', short: 'Hens', icon: '🐔', iconBg: C.charm, price: 10, type: 'perm', eff: { health: 3, holding: { stores: 6 } }, desc: 'Eggs, noise, small profit. +6 Stores' },
  { id: 'milk_goat', market: 'beastmarket', stockChance: 75, name: 'MILK GOAT', short: 'Goat', icon: '🐐', iconBg: '#9bc46a', price: 16, minAge: 6, type: 'perm', eff: { health: 5, holding: { stores: 9 } }, desc: 'Milk, cheese, and opinions. +9 Stores' },
  { id: 'hunting_hound', market: 'beastmarket', stockChance: 55, name: 'HUNTING HOUND', short: 'Hound', icon: '🐕', iconBg: '#cda35f', price: 28, minAge: 10, type: 'perm', eff: { charm: 7, health: 4 }, desc: 'Loyal, loud, faster than thee. +7 charm' },
  { id: 'swine_herd', market: 'beastmarket', stockChance: 50, name: 'HERD OF SWINE', short: 'Swine', icon: '🐖', iconBg: '#f3a0a0', price: 34, minAge: 10, type: 'perm', eff: { holding: { stores: 14 }, charm: 2 }, desc: 'This is Swineford, after all. +14 Stores' },
  { id: 'oxen_pair', market: 'beastmarket', stockChance: 40, name: 'PAIR OF OXEN', short: 'Oxen', icon: '🐂', iconBg: '#9a7333', price: 68, minAge: 14, type: 'perm', eff: { holding: { stores: 20 }, charm: 4 }, desc: 'The strongest thing thou will ever own. +20 Stores' },
  { id: 'falcon', market: 'beastmarket', stockChance: 25, name: 'HUNTING FALCON', short: 'Falcon', icon: '🦅', iconBg: C.paleEdge, price: 88, minAge: 14, type: 'perm', eff: { charm: 15 }, desc: 'Pure status with talons. +15 charm' },
  { id: 'warhorse', market: 'beastmarket', stockChance: 25, name: 'DESTRIER', short: 'Destrier', icon: '🐎', iconBg: C.health, price: 115, minAge: 16, type: 'perm', eff: { charm: 13, health: 7 }, desc: 'A warhorse. It knows its own worth. +13 charm' },

  // --- The reliquary -------------------------------------------------------
  { id: 'candle', market: 'reliquary', staple: true, name: 'HOLY CANDLE', short: 'Candle', icon: '🕯️', iconBg: C.orange, price: 4, minAge: 5, type: 'consumable', eff: { faith: 8 }, desc: 'Light the soul. +8 faith' },
  { id: 'relic', market: 'reliquary', staple: true, name: 'HOLY RELIC', short: 'Relic', icon: '✝️', iconBg: C.charm, price: 60, minAge: 10, type: 'perm', eff: { faith: 15 }, desc: "A saint's toe, allegedly. +15 faith" },
  { id: 'pilgrim_badge', market: 'reliquary', stockChance: 75, name: 'PILGRIM BADGE', short: 'Badge', icon: '🔰', iconBg: C.faith, price: 9, minAge: 8, type: 'perm', eff: { faith: 7 }, desc: 'Proof of a road thou may not have walked. +7 faith' },
  { id: 'rosary', market: 'reliquary', stockChance: 70, name: 'CARVED ROSARY', short: 'Rosary', icon: '📿', iconBg: C.orange, price: 12, type: 'perm', eff: { faith: 8 }, desc: 'Beads worn smooth by worry. +8 faith' },
  { id: 'altar_cloth', market: 'reliquary', stockChance: 40, name: 'ALTAR CLOTH', short: 'Cloth', icon: '🧵', iconBg: C.charm, price: 42, minAge: 12, type: 'perm', eff: { faith: 13, charm: 4 }, desc: 'Gifted to the parish, credited to thee. +13 faith' },
  { id: 'reliquary_box', market: 'reliquary', stockChance: 25, name: 'GILDED RELIQUARY', short: 'Casket', icon: '⚱️', iconBg: C.charm, price: 95, minAge: 14, type: 'perm', eff: { faith: 18, charm: 8 }, desc: 'Whatever is inside, the box is genuine. +18 faith' },

  // --- The scrivener -------------------------------------------------------
  { id: 'quill', market: 'scrivener', staple: true, name: 'GOOSE QUILL', short: 'Quill', icon: '🪶', iconBg: C.purple, price: 12, minAge: 8, type: 'perm', eff: { wits: 10 }, desc: 'For lettered folk. +10 wits' },
  { id: 'parchment', market: 'scrivener', staple: true, name: 'PARCHMENT', short: 'Parchment', icon: '📜', iconBg: '#cda35f', price: 8, minAge: 8, type: 'consumable', eff: { wits: 6 }, desc: 'Practise thy letters. +6 wits' },
  { id: 'ledger', market: 'scrivener', stockChance: 65, name: 'BOUND LEDGER', short: 'Ledger', icon: '📒', iconBg: C.light, price: 20, minAge: 10, type: 'perm', eff: { wits: 9 }, desc: 'Numbers that cannot be argued with. +9 wits' },
  { id: 'herbal_book', market: 'scrivener', stockChance: 50, name: 'HERBAL', short: 'Herbal', icon: '📗', iconBg: C.faith, price: 35, minAge: 10, type: 'perm', eff: { wits: 12, health: 4 }, desc: 'Every plant, drawn slightly wrong. +12 wits' },
  { id: 'map_of_realm', market: 'scrivener', stockChance: 40, name: 'MAP OF THE REALM', short: 'Map', icon: '🗺️', iconBg: C.teal, price: 46, minAge: 12, type: 'perm', eff: { wits: 14, charm: 4 }, desc: 'Mostly guesses, beautifully drawn. +14 wits' },
  { id: 'writing_desk', market: 'scrivener', stockChance: 30, name: 'WRITING DESK', short: 'Desk', icon: '🗄️', iconBg: '#9a7333', price: 60, minAge: 12, type: 'perm', eff: { wits: 16 }, desc: 'Somewhere to be clever at. +16 wits' },

  // --- The land agent ------------------------------------------------------
  { id: 'cottage', market: 'landagent', staple: true, name: 'STONE COTTAGE', short: 'Cottage', icon: '🏠', iconBg: '#9bc46a', price: 90, minAge: 16, type: 'perm', eff: { health: 8, charm: 6 }, desc: 'A home of thine own!' },
  { id: 'croft_strip', market: 'landagent', stockChance: 65, name: 'STRIP OF CROFT', short: 'Croft', icon: '🌾', iconBg: '#cda35f', price: 55, minAge: 14, type: 'perm', eff: { holding: { stores: 16 }, charm: 3 }, desc: 'Land of thine own to work. +16 Stores' },
  { id: 'town_house', market: 'landagent', stockChance: 40, name: 'TOWN HOUSE', short: 'House', icon: '🏘️', iconBg: C.light, price: 155, minAge: 18, type: 'perm', eff: { health: 9, charm: 15 }, desc: 'Two floors and a door onto the square. +15 charm' },
  { id: 'mill_share', market: 'landagent', stockChance: 30, minRankIdx: 2, name: 'SHARE IN THE MILL', short: 'Mill', icon: '🏚️', iconBg: '#9a7333', price: 205, minAge: 18, type: 'perm', eff: { charm: 11, holding: { stores: 22 } }, desc: 'Everyone must grind somewhere. +22 Stores' },
  { id: 'manor_lease', market: 'landagent', stockChance: 25, minRankIdx: 3, name: 'LEASE OF A MANOR', short: 'Manor', icon: '🏰', iconBg: C.purple, price: 330, minAge: 20, type: 'perm', eff: { charm: 22, health: 10, holding: { loyalty: 10 } }, desc: 'Land, tenants, and a name to go with them.' },
];

export function shopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export function itemsInMarket(market: ShopMarket): ShopItem[] {
  return SHOP_ITEMS.filter((item) => item.market === market);
}

/**
 * A small deterministic hash. Stock must be stable for a whole year and
 * identical on every render, so it cannot come from the world RNG — drawing
 * from that stream here would also shift every other roll in the game.
 */
function hashOf(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/** Whether a trader has this ware laid out in the given year. */
export function itemStockedInYear(item: ShopItem, year: number): boolean {
  if (item.staple) return true;
  return hashOf(`${item.id}:${year}`) % 100 < (item.stockChance ?? 55);
}
