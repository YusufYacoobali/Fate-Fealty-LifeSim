import { ImageSourcePropType } from 'react-native';
import { KinKind, RankKey, StatKey } from '@/types/game';

export const RANK_PORTRAITS: Record<RankKey, ImageSourcePropType> = {
  Peasant: require('../../assets/generated/portrait-peasant.png'),
  Squire: require('../../assets/generated/portrait-squire.png'),
  Knight: require('../../assets/generated/portrait-knight.png'),
  Noble: require('../../assets/generated/portrait-noble.png'),
  Baron: require('../../assets/generated/portrait-baron.png'),
  Monarch: require('../../assets/generated/portrait-monarch.png'),
};

export const UI_ICONS = {
  shop: require('../../assets/generated/ui-shop.png'),
  settings: require('../../assets/generated/ui-settings.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const DAILY_REWARD_ART = {
  purse: require('../../assets/generated/daily-reward-purse.png'),
  chest: require('../../assets/generated/ui-shop.png'),
  crown: require('../../assets/generated/paywall-crown.png'),
  candle: require('../../assets/generated/shop-candle.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const FEATURE_ART = {
  work: require('../../assets/generated/work-occupations-banner.png'),
  holding: require('../../assets/generated/holding-overview-banner.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const PAYWALL_ART = {
  hero: require('../../assets/generated/paywall-progression-hero.png'),
  crown: require('../../assets/generated/paywall-crown.png'),
  stories: require('../../assets/generated/paywall-stories.png'),
  holding: require('../../assets/generated/paywall-holding.png'),
  check: require('../../assets/generated/paywall-check-badge.png'),
  monthly: require('../../assets/generated/paywall-monthly-shield.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const CAREER_FAMILY_ART = {
  agriculture: require('../../assets/generated/activity-fields.png'),
  craft: require('../../assets/generated/activity-blacksmith.png'),
  trade: require('../../assets/generated/activity-market.png'),
  church: require('../../assets/generated/activity-church.png'),
  martial: require('../../assets/generated/activity-train.png'),
  court: require('../../assets/generated/shop-quill.png'),
  outlaw: require('../../assets/generated/activity-poach.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const CAREER_ACTION_ART = {
  work: require('../../assets/generated/career-action-work.png'),
  train: require('../../assets/generated/career-action-train.png'),
  promote: require('../../assets/generated/career-action-promote.png'),
  resign: require('../../assets/generated/career-action-resign.png'),
  borrow: require('../../assets/generated/career-action-borrow.png'),
  repay: require('../../assets/generated/career-action-repay.png'),
  rank_duty: require('../../assets/generated/career-action-rank-duty.png'),
  odd_job: require('../../assets/generated/career-action-odd-job.png'),
  craft: require('../../assets/generated/career-action-craft.png'),
  trade: require('../../assets/generated/career-action-trade.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const HOLDING_ACTION_ART = {
  work_land: require('../../assets/generated/activity-fields.png'),
  secure_bounds: require('../../assets/generated/activity-train.png'),
  open_stores: require('../../assets/generated/shop-bread.png'),
  sell_surplus: require('../../assets/generated/activity-market.png'),
  collect_dues: require('../../assets/generated/shop-quill.png'),
  hold_feast: require('../../assets/generated/activity-feast.png'),
  muster_levy: require('../../assets/generated/activity-tournament.png'),
  royal_progress: require('../../assets/generated/portrait-monarch.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const HOLDING_RESOURCE_ART = {
  stores: require('../../assets/generated/holding-resource-stores.png'),
  security: require('../../assets/generated/holding-resource-security.png'),
  loyalty: require('../../assets/generated/holding-resource-loyalty.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export const HOLDING_UPGRADE_ART = {
  fenced_field: require('../../assets/generated/holding-upgrade-fenced-field.png'),
  smokehouse: require('../../assets/generated/holding-upgrade-smokehouse.png'),
  stable: require('../../assets/generated/holding-upgrade-stable.png'),
  granary: require('../../assets/generated/holding-upgrade-granary.png'),
  watchtower: require('../../assets/generated/holding-upgrade-watchtower.png'),
  watermill: require('../../assets/generated/holding-upgrade-watermill.png'),
  stewards_hall: require('../../assets/generated/holding-upgrade-stewards-hall.png'),
  royal_road: require('../../assets/generated/holding-upgrade-royal-road.png'),
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
  village_service: require('../../assets/generated/activity-village-service.png'),
  gather_fuel: require('../../assets/generated/activity-gather-fuel.png'),
  manage_workshop: require('../../assets/generated/activity-manage-workshop.png'),
  guild_bargain: require('../../assets/generated/activity-guild-bargain.png'),
  hear_confession: require('../../assets/generated/activity-hear-confession.png'),
  copy_manuscript: require('../../assets/generated/activity-copy-manuscript.png'),
  lead_patrol: require('../../assets/generated/activity-lead-patrol.png'),
  drill_levy: require('../../assets/generated/activity-drill-levy.png'),
  hear_petitions: require('../../assets/generated/activity-hear-petitions.png'),
  host_court: require('../../assets/generated/activity-host-court.png'),
  hold_council: require('../../assets/generated/activity-hold-council.png'),
  royal_audience: require('../../assets/generated/activity-royal-audience.png'),
  plan_heist: require('../../assets/generated/activity-plan-heist.png'),
  rally_gang: require('../../assets/generated/activity-rally-gang.png'),
  courting: require('../../assets/generated/activity-courting.png'),
  teach_child: require('../../assets/generated/activity-teach-child.png'),
  arrange_gathering: require('../../assets/generated/activity-arrange-gathering.png'),
  care_relative: require('../../assets/generated/activity-care-relative.png'),
  rest: require('../../assets/generated/activity-rest.png'),
  treat_patient: require('../../assets/generated/activity-treat-patient.png'),
  fence_goods: require('../../assets/generated/activity-fence-goods.png'),
  bribe_official: require('../../assets/generated/activity-bribe-official.png'),
  scout_target: require('../../assets/generated/activity-scout-target.png'),
  study_trade: require('../../assets/generated/activity-study-trade.png'),
  seek_patron: require('../../assets/generated/activity-seek-patron.png'),
  run_caravan: require('../../assets/generated/activity-run-caravan.png'),
  preach_sermon: require('../../assets/generated/activity-preach-sermon.png'),
  gather_intelligence: require('../../assets/generated/activity-gather-intelligence.png'),
  negotiate_levy: require('../../assets/generated/activity-negotiate-levy.png'),
  repair_household: require('../../assets/generated/activity-repair-household.png'),
  manage_stores: require('../../assets/generated/activity-manage-stores.png'),
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
  acquaintance: require('../../assets/generated/kin-friend.png'),
};

export const KIN_ID_ICONS: Record<string, ImageSourcePropType> = {
  goose: require('../../assets/generated/kin-goose.png'),
  roderick: require('../../assets/generated/kin-roderick.png'),
};

export const SHOP_ITEM_ICONS: Record<string, ImageSourcePropType> = {
  stewards_signet: require('../../assets/generated/shop-silver-brooch.png'),
  kings_charter: require('../../assets/generated/paywall-crown.png'),
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
  pottage: require('../../assets/generated/shop-pottage.png'),
  honeycomb: require('../../assets/generated/shop-honeycomb.png'),
  salt_pouch: require('../../assets/generated/shop-salt-pouch.png'),
  ribbon: require('../../assets/generated/shop-ribbon.png'),
  tin_whistle: require('../../assets/generated/shop-tin-whistle.png'),
  lucky_pebble: require('../../assets/generated/shop-lucky-pebble.png'),
  salted_fish: require('../../assets/generated/shop-salted-fish.png'),
  cheese_wheel: require('../../assets/generated/shop-cheese-wheel.png'),
  grain_sack: require('../../assets/generated/shop-grain-sack.png'),
  iron_pot: require('../../assets/generated/shop-iron-pot.png'),
  hand_cart: require('../../assets/generated/shop-hand-cart.png'),
  beeskep: require('../../assets/generated/shop-beeskep.png'),
  millstone: require('../../assets/generated/shop-millstone.png'),
  willow_bark: require('../../assets/generated/shop-willow-bark.png'),
  theriac: require('../../assets/generated/shop-theriac.png'),
  leech_jar: require('../../assets/generated/shop-leech-jar.png'),
  plague_mask: require('../../assets/generated/shop-plague-mask.png'),
  physic_garden: require('../../assets/generated/shop-physic-garden.png'),
  whetstone: require('../../assets/generated/shop-whetstone.png'),
  shield: require('../../assets/generated/shop-shield.png'),
  gambeson: require('../../assets/generated/shop-gambeson.png'),
  helm: require('../../assets/generated/shop-helm.png'),
  lance: require('../../assets/generated/shop-lance.png'),
  mail_shirt: require('../../assets/generated/shop-mail-shirt.png'),
  leather_boots: require('../../assets/generated/shop-leather-boots.png'),
  wool_cloak: require('../../assets/generated/shop-wool-cloak.png'),
  silk_hose: require('../../assets/generated/shop-silk-hose.png'),
  silver_brooch: require('../../assets/generated/shop-silver-brooch.png'),
  dyed_gown: require('../../assets/generated/shop-dyed-gown.png'),
  fur_mantle: require('../../assets/generated/shop-fur-mantle.png'),
  laying_hens: require('../../assets/generated/shop-laying-hens.png'),
  milk_goat: require('../../assets/generated/shop-milk-goat.png'),
  hunting_hound: require('../../assets/generated/shop-hunting-hound.png'),
  swine_herd: require('../../assets/generated/shop-swine-herd.png'),
  oxen_pair: require('../../assets/generated/shop-oxen-pair.png'),
  falcon: require('../../assets/generated/shop-falcon.png'),
  warhorse: require('../../assets/generated/shop-warhorse.png'),
  pilgrim_badge: require('../../assets/generated/shop-pilgrim-badge.png'),
  rosary: require('../../assets/generated/shop-rosary.png'),
  altar_cloth: require('../../assets/generated/shop-altar-cloth.png'),
  reliquary_box: require('../../assets/generated/shop-reliquary-box.png'),
  parchment: require('../../assets/generated/shop-parchment.png'),
  ledger: require('../../assets/generated/shop-ledger.png'),
  herbal_book: require('../../assets/generated/shop-herbal-book.png'),
  map_of_realm: require('../../assets/generated/shop-map-of-realm.png'),
  writing_desk: require('../../assets/generated/shop-writing-desk.png'),
  croft_strip: require('../../assets/generated/shop-croft-strip.png'),
  town_house: require('../../assets/generated/shop-town-house.png'),
  mill_share: require('../../assets/generated/shop-mill-share.png'),
  manor_lease: require('../../assets/generated/shop-manor-lease.png'),
};

export const TRAIT_ICONS: Record<string, ImageSourcePropType> = {
  sickly: require('../../assets/generated/trait-sickly.png'),
  hale: require('../../assets/generated/trait-hale.png'),
  silver_tongue: require('../../assets/generated/trait-silver_tongue.png'),
  bookish: require('../../assets/generated/trait-bookish.png'),
  pious: require('../../assets/generated/trait-pious.png'),
  heathen: require('../../assets/generated/trait-heathen.png'),
  lucky: require('../../assets/generated/trait-lucky.png'),
  golden_child: require('../../assets/generated/trait-golden_child.png'),
  comely: require('../../assets/generated/trait-comely.png'),
  goose_cursed: require('../../assets/generated/trait-goose_cursed.png'),
  royal_bastard: require('../../assets/generated/trait-royal_bastard.png'),
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

export function shopItemIconAsset(id: string): ImageSourcePropType {
  const asset = SHOP_ITEM_ICONS[id];
  if (!asset) throw new Error(`Missing generated shop icon for ${id}`);
  return asset;
}

export function traitIconAsset(id: string): ImageSourcePropType | undefined {
  return TRAIT_ICONS[id];
}
