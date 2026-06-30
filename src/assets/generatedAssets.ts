import { ImageSourcePropType } from 'react-native';
import { KinKind, RankKey, StatKey } from '@/types/game';

export const RANK_PORTRAITS: Record<RankKey, ImageSourcePropType> = {
  Peasant: require('../../assets/generated/portrait-peasant.png'),
  Squire: require('../../assets/generated/portrait-squire.png'),
  Knight: require('../../assets/generated/portrait-knight.png'),
  Noble: require('../../assets/generated/portrait-noble.png'),
};

export const UI_ICONS = {
  shop: require('../../assets/generated/ui-shop.png'),
  settings: require('../../assets/generated/ui-settings.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const ACTIVITY_ICONS: Record<string, ImageSourcePropType> = {
  tavern: require('../../assets/generated/activity-tavern.png'),
  dice: require('../../assets/generated/activity-dice.png'),
  feast: require('../../assets/generated/activity-feast.png'),
  fair: require('../../assets/generated/activity-fair.png'),
  fields: require('../../assets/generated/activity-fields.png'),
  blacksmith: require('../../assets/generated/activity-blacksmith.png'),
  market: require('../../assets/generated/activity-market.png'),
  church: require('../../assets/generated/activity-church.png'),
  pilgrimage: require('../../assets/generated/activity-pilgrimage.png'),
  train: require('../../assets/generated/activity-train.png'),
  quest: require('../../assets/generated/activity-quest.png'),
  tournament: require('../../assets/generated/activity-tournament.png'),
  poach: require('../../assets/generated/activity-poach.png'),
  pickpocket: require('../../assets/generated/activity-pickpocket.png'),
  banditry: require('../../assets/generated/activity-banditry.png'),
  leech: require('../../assets/generated/activity-leech.png'),
  bathhouse: require('../../assets/generated/activity-bathhouse.png'),
  herbalist: require('../../assets/generated/activity-herbalist.png'),
};

export const STAT_ICONS: Record<StatKey, ImageSourcePropType> = {
  health: require('../../assets/generated/stat-health.png'),
  charm: require('../../assets/generated/stat-charm.png'),
  wits: require('../../assets/generated/stat-wits.png'),
  faith: require('../../assets/generated/stat-faith.png'),
};

export const KIN_KIND_ICONS: Record<KinKind, ImageSourcePropType> = {
  mother: require('../../assets/generated/kin-mother.png'),
  father: require('../../assets/generated/kin-father.png'),
  sibling: require('../../assets/generated/kin-sibling.png'),
  spouse: require('../../assets/generated/kin-spouse.png'),
  child: require('../../assets/generated/kin-child.png'),
  friend: require('../../assets/generated/kin-friend.png'),
  foe: require('../../assets/generated/kin-foe.png'),
  liege: require('../../assets/generated/kin-liege.png'),
};

export const KIN_ID_ICONS: Record<string, ImageSourcePropType> = {
  goose: require('../../assets/generated/kin-goose.png'),
  roderick: require('../../assets/generated/kin-roderick.png'),
};

export const SHOP_ITEM_ICONS: Record<string, ImageSourcePropType> = {
  bread: require('../../assets/generated/shop-bread.png'),
  herbs: require('../../assets/generated/shop-herbs.png'),
  ale: require('../../assets/generated/shop-ale.png'),
  candle: require('../../assets/generated/shop-candle.png'),
  tunic: require('../../assets/generated/shop-tunic.png'),
  quill: require('../../assets/generated/shop-quill.png'),
  sword: require('../../assets/generated/shop-sword.png'),
  steed: require('../../assets/generated/shop-steed.png'),
  relic: require('../../assets/generated/shop-relic.png'),
  cottage: require('../../assets/generated/shop-cottage.png'),
};

export const TRAIT_ICONS: Record<string, ImageSourcePropType> = {
  sickly: require('../../assets/generated/trait-sickly.png'),
  hale: require('../../assets/generated/trait-hale.png'),
  silver_tongue: require('../../assets/generated/trait-silver_tongue.png'),
  dullard: require('../../assets/generated/trait-dullard.png'),
  bookish: require('../../assets/generated/trait-bookish.png'),
  pious: require('../../assets/generated/trait-pious.png'),
  heathen: require('../../assets/generated/trait-heathen.png'),
  lucky: require('../../assets/generated/trait-lucky.png'),
  ill_starred: require('../../assets/generated/trait-ill_starred.png'),
  comely: require('../../assets/generated/trait-comely.png'),
  war_hero: require('../../assets/generated/trait-war_hero.png'),
  living_saint: require('../../assets/generated/trait-living_saint.png'),
  notorious_outlaw: require('../../assets/generated/trait-notorious_outlaw.png'),
  kingmaker: require('../../assets/generated/trait-kingmaker.png'),
  devoted_parent: require('../../assets/generated/trait-devoted_parent.png'),
  plague_touched: require('../../assets/generated/trait-plague_touched.png'),
};

export function rankPortraitAsset(rank: string): ImageSourcePropType | undefined {
  return RANK_PORTRAITS[rank as RankKey];
}

export function statIconAsset(stat: string): ImageSourcePropType | undefined {
  return STAT_ICONS[stat as StatKey];
}

export function kinIconAsset(id: string, kind: KinKind): ImageSourcePropType | undefined {
  return KIN_ID_ICONS[id] ?? KIN_KIND_ICONS[kind];
}

export function shopItemIconAsset(id: string): ImageSourcePropType | undefined {
  return SHOP_ITEM_ICONS[id];
}

export function traitIconAsset(id: string): ImageSourcePropType | undefined {
  return TRAIT_ICONS[id];
}
