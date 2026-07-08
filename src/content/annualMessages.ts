/**
 * Annual flavour beats. The Life Director emits 1-2 of these per year. Each is
 * pure data: a feed tag, text, effects, and an optional eligibility condition so
 * (for example) plague years only strike at certain ages or reputations.
 */

import { Condition, Effects, GameState, Tone } from '@/types/game';
import { meetsCondition } from '@/engine/eventPicker';
import { pickWeighted } from '@/engine/random';
import { C } from '@/theme/theme';

export interface AnnualMessage {
  id: string;
  tag: string;
  tagColor: string;
  text: string;
  tone: Tone;
  effects?: Effects;
  weight?: number;
  requires?: Condition;
}

export const ANNUAL_MESSAGES: AnnualMessage[] = [
  { id: 'mishap_trough', tag: 'MISHAP', tagColor: C.bad, tone: 'bad', text: 'You slipped in the pig trough before half the village. They are still laughing.', effects: { charm: -4 } },
  { id: 'fortune_coin', tag: 'FORTUNE', tagColor: C.good, tone: 'good', text: 'Found a shiny coin in the mud. It is mostly mud, but it spends.', effects: { gold: 3 } },
  { id: 'gossip_bard', tag: 'GOSSIP', tagColor: C.amber, tone: 'plain', text: "A bard sang a song about you. It rhymed your name with 'garlic'.", effects: { charm: -2 } },
  { id: 'plague_cough', tag: 'PLAGUE', tagColor: C.bad, tone: 'bad', text: 'A cough went round the village. You survived by holding your breath for a season.', effects: { health: -9 }, requires: { minAge: 5 } },
  { id: 'wisdom_hermit', tag: 'WISDOM', tagColor: C.blue, tone: 'good', text: "The hermit on the hill taught you to read three whole words. Two were 'turnip'.", effects: { wits: 6 } },
  { id: 'blessing_candle', tag: 'BLESSING', tagColor: C.good, tone: 'good', text: 'You lit a candle at the chapel. You feel holier and slightly singed.', effects: { faith: 7, path: { church: 1 } } },
  { id: 'weather_harvest', tag: 'WEATHER', tagColor: C.amber, tone: 'good', text: 'The harvest was good! Bread for all. You ate eleven loaves out of principle.', effects: { health: 4, gold: 2 } },
  { id: 'mishap_goat', tag: 'MISHAP', tagColor: C.bad, tone: 'bad', text: 'A goat headbutted you off the bridge. Sir Quackbeard witnessed your shame.', effects: { health: -6, charm: -2 } },
  { id: 'fortune_merchant', tag: 'FORTUNE', tagColor: C.good, tone: 'good', text: 'A merchant overpaid you by mistake and rode off. You said nothing. Wise.', effects: { gold: 6, faith: -2 } },
  { id: 'romance_wink', tag: 'ROMANCE', tagColor: C.healthDark, tone: 'good', text: "You winked at the miller's child across the square. You think it went well. It did not.", effects: { charm: 3 }, requires: { minAge: 14 } },
  { id: 'wisdom_zero', tag: 'WISDOM', tagColor: C.blue, tone: 'good', text: "You watched a monk do sums and learned what a 'zero' is. Revolutionary.", effects: { wits: 5 } },
  { id: 'child_mud', tag: 'CHILDHOOD', tagColor: C.amber, tone: 'plain', text: 'You spent the whole year making increasingly ambitious mud structures.', effects: { health: 2 }, requires: { maxAge: 8 } },
  { id: 'child_goose', tag: 'CHILDHOOD', tagColor: C.good, tone: 'good', text: 'You and Sir Quackbeard the goose became inseparable. He bites everyone but you.', effects: { kinRel: { id: 'goose', delta: 4 } }, requires: { maxAge: 10 } },
  { id: 'taxman', tag: 'TAXES', tagColor: C.bad, tone: 'bad', text: 'The tax collector came. He left with most of your coin and one of your chickens.', effects: { gold: -3 }, requires: { minAge: 12, minGold: 4 } },
  { id: 'noble_envy', tag: 'STATION', tagColor: C.purpleDark, tone: 'plain', text: 'Lesser folk bow as you pass. You have grown used to it, perhaps too used to it.', effects: { charm: 2, reputation: 1 }, requires: { rankAtLeast: 2 } },
  { id: 'famine', tag: 'FAMINE', tagColor: C.bad, tone: 'bad', text: 'A lean winter. The bread ran short and so did tempers. You tightened your belt.', effects: { health: -7, gold: -1 }, requires: { minAge: 10 } },
  { id: 'friar_pudding_smell', tag: 'GOSSIP', tagColor: C.amber, tone: 'plain', text: 'A friar preached fasting while smelling powerfully of pudding. The village noticed.', effects: { wits: 2, faith: -1 }, requires: { minAge: 8 } },
  { id: 'goose_court_news', tag: 'COURT', tagColor: C.blue, tone: 'good', text: 'Sir Quackbeard was mentioned in court records as "loud but persuasive."', effects: { charm: 2, kinRel: { id: 'goose', delta: 3 } }, requires: { minAge: 8 } },
  { id: 'bad_relic_rumor', tag: 'RELIC', tagColor: C.purpleDark, tone: 'plain', text: "A relic seller passed through with Saint Nobody's elbow. It bent suspiciously.", effects: { wits: 2 }, requires: { minAge: 10 } },
  { id: 'muddy_sabbath', tag: 'SABBATH', tagColor: C.good, tone: 'plain', text: 'You wore your best shoes to chapel. The mud wore them better.', effects: { faith: 3, charm: -1 } },
  { id: 'miller_short_measure', tag: 'MILL', tagColor: C.amber, tone: 'bad', text: 'The miller measured your flour with a scoop that looked hungry.', effects: { gold: -2, wits: 2 }, requires: { minAge: 10, minGold: 2 } },
  { id: 'bell_wrong_hour', tag: 'BELLS', tagColor: C.blue, tone: 'plain', text: 'The church bell rang at the wrong hour. Everyone arrived tired and morally early.', effects: { faith: 2, health: -1 } },
  { id: 'alehouse_proverb', tag: 'ALE', tagColor: C.amber, tone: 'good', text: 'A tavern proverb named you wise. By dawn nobody remembered the proverb, only the ale.', effects: { charm: 3, health: -1 }, requires: { minAge: 14 } },
  { id: 'reeve_new_rule', tag: 'LAW', tagColor: C.bad, tone: 'plain', text: 'The reeve banned suspicious whistling. You whistled innocently and learned nothing.', effects: { charm: -1, path: { outlaw: 1 } }, requires: { minAge: 12 } },
  { id: 'turnip_giant', tag: 'HARVEST', tagColor: C.good, tone: 'good', text: 'A turnip grew as large as a helmet. The village called it a sign and then ate it.', effects: { health: 4, faith: 1 } },
  { id: 'tailor_loose_thread', tag: 'MISHAP', tagColor: C.bad, tone: 'bad', text: 'A loose thread undid half your tunic in the market. The tailor called it ventilation.', effects: { charm: -4 }, requires: { minAge: 10 } },
  { id: 'monk_bad_sum', tag: 'WISDOM', tagColor: C.blue, tone: 'plain', text: 'A monk proved two chickens make three by hiding one in his sleeve.', effects: { wits: 4, faith: -1 }, requires: { minAge: 8 } },
  { id: 'old_oath_found', tag: 'FAMILY', tagColor: C.purpleDark, tone: 'good', text: 'Maud found an old family oath: "Never trust a smiling miller." Sensible ancestors.', effects: { wits: 3, kinRel: { id: 'mother', delta: 2 } }, requires: { minAge: 8 } },
  { id: 'market_goat_hat', tag: 'MARKET', tagColor: C.amber, tone: 'plain', text: 'Someone sold hats for goats. No one agreed whether the hats were for goats or from goats.', effects: { charm: 2, wits: 1 }, requires: { minAge: 8 } },
  { id: 'knight_dented_pride', tag: 'MARTIAL', tagColor: C.blue, tone: 'good', text: 'A passing knight polished a dent in his helm and called it character.', effects: { rankProgress: 4, charm: 2 }, requires: { minAge: 12 } },
  { id: 'noble_bad_poem', tag: 'STATION', tagColor: C.purpleDark, tone: 'plain', text: 'A poet praised your noble bearing and rhymed it with herring.', effects: { charm: 2, reputation: 1 }, requires: { rankAtLeast: 2 } },
  { id: 'plague_crowded_prayer', tag: 'PLAGUE', tagColor: C.bad, tone: 'bad', text: 'A sickness scare packed the chapel. The coughs harmonized terribly.', effects: { health: -5, faith: 3 }, requires: { minAge: 14 } },
  { id: 'dice_under_pew', tag: 'VICE', tagColor: C.amber, tone: 'plain', text: 'You found dice under a chapel pew. Someone has been praying for sixes.', effects: { gold: 2, faith: -1 }, requires: { minAge: 10 } },
  { id: 'father_weather_knee', tag: 'WEATHER', tagColor: C.good, tone: 'plain', text: "Old Cedric's knee predicted rain. It also predicted stew, but only one came true.", effects: { wits: 2, kinRel: { id: 'father', delta: 2 } }, requires: { minAge: 6 } },
];

export function pickAnnualMessage(s: GameState): AnnualMessage | null {
  const eligible = ANNUAL_MESSAGES.filter((m) => meetsCondition(s, m.requires));
  if (eligible.length === 0) return null;
  return pickWeighted(eligible, (m) => m.weight ?? 1);
}
