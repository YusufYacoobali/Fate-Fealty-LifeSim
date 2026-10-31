/**
 * Annual flavour beats. The Life Director emits 1-2 of these per year. Each is
 * pure data: a feed tag, text, effects, and an optional eligibility condition so
 * (for example) plague years only strike at certain ages or reputations.
 */

import { Condition, Effects, GameState, Tone } from '@/types/game';
import { meetsCondition } from '@/engine/eventPicker';
import { pickWeighted } from '@/engine/random';
import { CONTEXT_ANNUAL_MESSAGES } from './annualContextMessages';
import { C } from '@/theme/theme';

export type AnnualActor = 'carer' | 'mother' | 'father' | 'goose' | 'spouse' | 'child' | 'rival';

export interface AnnualMessage {
  theme: string;
  actors?: AnnualActor[];
  once?: boolean;
  id: string;
  tag: string;
  tagColor: string;
  text: string;
  tone: Tone;
  effects?: Effects;
  weight?: number;
  requires?: Condition;
}

const LEGACY_ANNUAL_MESSAGES: Omit<AnnualMessage, 'theme'>[] = [
  { id: 'baby_first_steps', tag: 'INFANCY', tagColor: C.good, tone: 'good', text: "You take three determined steps towards a stool. {{carer}} catches you before you discover the fourth is missing.", effects: { health: 2 }, requires: { maxAge: 3 } },
  { id: 'baby_first_word', tag: 'INFANCY', tagColor: C.amber, tone: 'good', text: "Your first clear word is “more.” {{carer}} looks pleased until you begin applying it to everything.", effects: { charm: 2, kinRel: { id: 'mother', delta: 3 } }, requires: { maxAge: 3 } },
  { id: 'baby_goose_guard', tag: 'INFANCY', tagColor: C.good, tone: 'good', text: "Sir Quackbeard inspects your cradle with the severity of a constable. He objects to the blanket and loses the argument.", effects: { kinRel: { id: 'goose', delta: 5 } }, requires: { maxAge: 3 } },
  { id: 'baby_winter_fever', tag: 'INFANCY', tagColor: C.bad, tone: 'bad', text: "A winter cough keeps you awake. {{carer}} warms your blanket by the hearth and stays until your breathing settles.", effects: { health: -5, kinRel: { id: 'mother', delta: 3 } }, requires: { maxAge: 3 } },
  { id: 'mishap_trough', tag: 'MISHAP', tagColor: C.bad, tone: 'bad', text: "You slip beside the watering trough. A bystander offers advice after you have stopped needing it.", effects: { charm: -4 }, requires: { minAge: 3 } },
  { id: 'fortune_coin', tag: 'FORTUNE', tagColor: C.good, tone: 'good', text: 'Found a shiny coin in the mud. It is mostly mud, but it spends.', effects: { gold: 3 }, requires: { minAge: 4 } },
  { id: 'gossip_bard', tag: 'GOSSIP', tagColor: C.amber, tone: 'plain', text: "A bard fits your name into a song by adding two syllables and a crime you have never committed.", effects: { charm: -2 }, requires: { minAge: 6 } },
  { id: 'plague_cough', tag: 'PLAGUE', tagColor: C.bad, tone: 'bad', text: "During the sickness scare you avoid the crowded stalls. You miss the company more than the haggling.", effects: { health: -9 }, requires: { minAge: 5 } },
  { id: 'wisdom_hermit', tag: 'WISDOM', tagColor: C.blue, tone: 'good', text: "A hermit teaches you the words on a milestone. His complaints about visitors become easier to understand.", effects: { wits: 6 }, requires: { minAge: 5 } },
  { id: 'blessing_candle', tag: 'BLESSING', tagColor: C.good, tone: 'good', text: 'You lit a candle at the chapel. You feel holier and slightly singed.', effects: { faith: 7, path: { church: 1 } }, requires: { minAge: 5 } },
  { id: 'weather_harvest', tag: 'WEATHER', tagColor: C.amber, tone: 'good', text: "Full granaries lower the price of bread. You buy a little extra and need no better reason to enjoy it.", effects: { health: 4, gold: 2 }, requires: { minAge: 4 } },
  { id: 'mishap_goat', tag: 'MISHAP', tagColor: C.bad, tone: 'bad', text: "A tethered goat loops its rope around your ankle. It watches you untie the knot as though reviewing your work.", effects: { health: -6, charm: -2 }, requires: { minAge: 4 } },
  { id: 'fortune_merchant', tag: 'FORTUNE', tagColor: C.good, tone: 'good', text: 'A merchant overpaid you by mistake and rode off. You said nothing. Wise.', effects: { gold: 6, faith: -2 }, requires: { minAge: 8 } },
  { id: 'romance_wink', tag: 'ROMANCE', tagColor: C.healthDark, tone: 'good', text: "You try a knowing smile across the square and receive a puzzled one in return. The misunderstanding is mercifully brief.", effects: { charm: 3 }, requires: { minAge: 14 } },
  { id: 'wisdom_zero', tag: 'WISDOM', tagColor: C.blue, tone: 'good', text: "A monk leaves a space in his sums to show you how nothing can have a place. You think about that on the way home.", effects: { wits: 5 }, requires: { minAge: 5 } },
  { id: 'child_mud', tag: 'CHILDHOOD', tagColor: C.amber, tone: 'plain', text: "You build a miniature house in the mud and give it a very small door. Visitors will have to be polite enough to shrink.", effects: { health: 2 }, requires: { maxAge: 8 } },
  { id: 'child_goose', tag: 'CHILDHOOD', tagColor: C.good, tone: 'good', text: "Sir Quackbeard lets you sit nearby while he preens. It is a quiet friendship with rather strict terms of admission.", effects: { kinRel: { id: 'goose', delta: 4 } }, requires: { maxAge: 10 } },
  { id: 'taxman', tag: 'TAXES', tagColor: C.bad, tone: 'bad', text: "The collector takes three gold and gives you a receipt large enough to wrap a much more valuable payment.", effects: { gold: -3 }, requires: { minAge: 12, minGold: 4 } },
  { id: 'noble_envy', tag: 'STATION', tagColor: C.purpleDark, tone: 'plain', text: "A servant waits for you to finish speaking before retrieving the bowl you are blocking. Rank has made people patient in inconvenient ways.", effects: { charm: 2, reputation: 1 }, requires: { rankAtLeast: 2 } },
  { id: 'famine', tag: 'FAMINE', tagColor: C.bad, tone: 'bad', text: "There is less bread at supper and more time spent cutting it. Nobody mentions the arithmetic.", effects: { health: -7, gold: -1 }, requires: { minAge: 10 } },
  { id: 'friar_pudding_smell', tag: 'GOSSIP', tagColor: C.amber, tone: 'plain', text: 'A friar preached fasting while smelling powerfully of pudding. The village noticed.', effects: { wits: 2, faith: -1 }, requires: { minAge: 8 } },
  { id: 'goose_court_news', tag: 'COURT', tagColor: C.blue, tone: 'good', text: "A travelling clerk sketches Sir Quackbeard in the margin of an account. For once the most forceful opinion on the page needs no signature.", effects: { charm: 2, kinRel: { id: 'goose', delta: 3 } }, requires: { minAge: 8 } },
  { id: 'bad_relic_rumor', tag: 'RELIC', tagColor: C.purpleDark, tone: 'plain', text: "A relic seller passed through with Saint Nobody's elbow. It bent suspiciously.", effects: { wits: 2 }, requires: { minAge: 10 } },
  { id: 'muddy_sabbath', tag: 'SABBATH', tagColor: C.good, tone: 'plain', text: 'You wore your best shoes to chapel. The mud wore them better.', effects: { faith: 3, charm: -1 }, requires: { minAge: 4 } },
  { id: 'miller_short_measure', tag: 'MILL', tagColor: C.amber, tone: 'bad', text: 'The miller measured your flour with a scoop that looked hungry.', effects: { gold: -2, wits: 2 }, requires: { minAge: 10, minGold: 2 } },
  { id: 'bell_wrong_hour', tag: 'BELLS', tagColor: C.blue, tone: 'plain', text: 'The church bell rang at the wrong hour. Everyone arrived tired and morally early.', effects: { faith: 2, health: -1 }, requires: { minAge: 4 } },
  { id: 'alehouse_proverb', tag: 'ALE', tagColor: C.amber, tone: 'good', text: 'A tavern proverb named you wise. By dawn nobody remembered the proverb, only the ale.', effects: { charm: 3, health: -1 }, requires: { minAge: 14 } },
  { id: 'reeve_new_rule', tag: 'LAW', tagColor: C.bad, tone: 'plain', text: 'The reeve banned suspicious whistling. You whistled innocently and learned nothing.', effects: { charm: -1, path: { outlaw: 1 } }, requires: { minAge: 12 } },
  { id: 'turnip_giant', tag: 'HARVEST', tagColor: C.good, tone: 'good', text: 'A turnip grew as large as a helmet. The village called it a sign and then ate it.', effects: { health: 4, faith: 1 } },
  { id: 'tailor_loose_thread', tag: 'MISHAP', tagColor: C.bad, tone: 'bad', text: 'A loose thread undid half your tunic in the market. The tailor called it ventilation.', effects: { charm: -4 }, requires: { minAge: 10 } },
  { id: 'monk_bad_sum', tag: 'WISDOM', tagColor: C.blue, tone: 'plain', text: "A monk explains division with three apples. The lesson becomes subtraction when somebody eats the example.", effects: { wits: 4, faith: -1 }, requires: { minAge: 8 } },
  { id: 'old_oath_found', tag: 'FAMILY', tagColor: C.purpleDark, tone: 'good', text: "{{mother}} finds an old family warning against trusting smiling millers. The warning is written on the back of an unpaid milling bill.", effects: { wits: 3, kinRel: { id: 'mother', delta: 2 } }, requires: { minAge: 8 } },
  { id: 'market_goat_hat', tag: 'MARKET', tagColor: C.amber, tone: 'plain', text: 'Someone sold hats for goats. No one agreed whether the hats were for goats or from goats.', effects: { charm: 2, wits: 1 }, requires: { minAge: 8 } },
  { id: 'knight_dented_pride', tag: 'MARTIAL', tagColor: C.blue, tone: 'good', text: "A passing knight explains that the dent in his helm saved his life. His squire says the doorway was never in much danger.", effects: { rankProgress: 4, charm: 2 }, requires: { minAge: 12 } },
  { id: 'noble_bad_poem', tag: 'STATION', tagColor: C.purpleDark, tone: 'plain', text: "A poet praises your noble bearing in a verse whose longest word is your title. The short lines cost just as much.", effects: { charm: 2, reputation: 1 }, requires: { rankAtLeast: 2 } },
  { id: 'plague_crowded_prayer', tag: 'PLAGUE', tagColor: C.bad, tone: 'bad', text: 'A sickness scare packed the chapel. The coughs harmonized terribly.', effects: { health: -5, faith: 3 }, requires: { minAge: 14 } },
  { id: 'dice_under_pew', tag: 'VICE', tagColor: C.amber, tone: 'plain', text: 'You found dice under a chapel pew. Someone has been praying for sixes.', effects: { gold: 2, faith: -1 }, requires: { minAge: 10 } },
  { id: 'father_weather_knee', tag: 'WEATHER', tagColor: C.good, tone: 'plain', text: "{{father}} predicts rain from an aching knee. You carry a cloak out of affection and are dry by good fortune.", effects: { wits: 2, kinRel: { id: 'father', delta: 2 } }, requires: { minAge: 6 } },
];

/** Resolve family roles from the controlled character, including an heir's new parents. */
export function annualActors(s: GameState): Partial<Record<AnnualActor, string>> {
  const p = s.world.characters[s.playerCharacterId];
  const living = (id: string) => s.world.characters[id]?.alive;
  const parents = (p.parentIds ?? []).filter(living).map(id => s.world.characters[id]);
  const carer = [...(p.guardianIds ?? []), ...(p.parentIds ?? [])].find(living);
  const child = (p.childIds ?? []).map(id => s.world.characters[id]).find(c => c?.alive && c.age >= 4 && c.age <= 16);
  const rival = Object.values(s.world.relationships).find(r => (r.aId === p.id || r.bId === p.id) && r.flags.some(f => f === 'rival' || f === 'feud') && living(r.aId === p.id ? r.bId : r.aId));
  return { carer, mother: parents.find(c => c.gender === 'woman')?.id, father: parents.find(c => c.gender === 'man')?.id, goose: living('goose') ? 'goose' : undefined, spouse: p.spouseId && living(p.spouseId) ? p.spouseId : undefined, child: child?.id, rival: rival ? rival.aId === p.id ? rival.bId : rival.aId : undefined };
}

const LEGACY_THEMES: Record<string, string> = {
  baby_first_steps: 'growing_up', baby_first_word: 'growing_up', baby_goose_guard: 'goose_mishaps', baby_winter_fever: 'care_work',
  mishap_trough: 'daily_mishaps', fortune_coin: 'small_fortunes', gossip_bard: 'performers', plague_cough: 'care_work', wisdom_hermit: 'learning',
  blessing_candle: 'parish_life', weather_harvest: 'weather', mishap_goat: 'daily_mishaps', fortune_merchant: 'trade_customs', romance_wink: 'courtship_gossip',
  wisdom_zero: 'learning', child_mud: 'growing_up', child_goose: 'goose_mishaps', taxman: 'corrupt_officials', noble_envy: 'court_life', famine: 'scarcity',
  friar_pudding_smell: 'religious_hypocrisy', goose_court_news: 'goose_mishaps', bad_relic_rumor: 'false_relics', muddy_sabbath: 'parish_life', miller_short_measure: 'trade_customs',
  bell_wrong_hour: 'parish_life', alehouse_proverb: 'public_vanity', reeve_new_rule: 'local_justice', turnip_giant: 'field_work', tailor_loose_thread: 'daily_mishaps',
  monk_bad_sum: 'learning', old_oath_found: 'family_table', market_goat_hat: 'market_life', knight_dented_pride: 'soldiering', noble_bad_poem: 'public_vanity',
  plague_crowded_prayer: 'care_work', dice_under_pew: 'petty_crime', father_weather_knee: 'weather',
};
const LEGACY_ACTORS: Record<string, AnnualActor[]> = {
  baby_first_steps: ['carer'], baby_first_word: ['carer'], baby_goose_guard: ['goose'], baby_winter_fever: ['carer'], child_goose: ['goose'],
  goose_court_news: ['goose'], old_oath_found: ['mother'], father_weather_knee: ['father'],
};
const ONCE = new Set(['baby_first_steps', 'baby_first_word', 'baby_goose_guard', 'child_goose']);
// Feed-only legacy saves predate the character-level annual ledger.
const LEGACY_ONCE_TEXT: Record<string,string> = {"baby_first_steps": "You took your first steps and immediately fell into a basket of turnips. The village applauded both events.", "baby_first_word": "Your first word was 'turnip'. Your mother wept with pride; Your father nodded as if this settled something.", "baby_goose_guard": "Sir Quackbeard has appointed himself guardian of your cradle. Visitors are now inspected, and occasionally bitten.", "child_goose": "You and Sir Quackbeard the goose became inseparable. He bites everyone but you."};

export const ANNUAL_MESSAGES: AnnualMessage[] = [
  ...LEGACY_ANNUAL_MESSAGES.map(m => ({ ...m, theme: LEGACY_THEMES[m.id], actors: LEGACY_ACTORS[m.id], once: ONCE.has(m.id) })),
  ...CONTEXT_ANNUAL_MESSAGES.map(m => ({ ...m, weight: m.id.startsWith('rare_') ? 0.25 : 1, once: m.id.startsWith('rare_') })),
].map(m => {
  const original = m.requires;
  return { ...m, requires: { ...original, custom: (s: GameState) => {
    if (original?.custom && !original.custom(s)) return false;
    if (m.actors?.some(role => !annualActors(s)[role])) return false;
    if (['weather_harvest','turnip_giant'].includes(m.id) && s.world.conditions.foodSecurity < 55) return false;
    if (m.id === 'famine' && s.world.conditions.foodSecurity > 30) return false;
    if (['plague_cough','plague_crowded_prayer'].includes(m.id) && s.world.conditions.diseasePressure < 45) return false;
    if (m.id === 'turnip_giant' && s.age < 4) return false;
    if (m.id === 'turnip_giant' && !['peasant','artisan'].includes(s.world.characters[s.playerCharacterId].background?.origin ?? '')) return false;
    if (m.id === 'plague_cough' && s.age < 5) return false;
    return true;
  } } };
});

export function renderAnnualText(s: GameState, message: AnnualMessage): string {
  const actors = annualActors(s);
  return message.text.replace(/\{\{(\w+)\}\}/g, (_, role: AnnualActor) => s.world.characters[actors[role] ?? '']?.name ?? 'your household');
}

/** Existing saved ID years also seed theme cooldowns, without RNG or title migrations. */
export function annualThemeYears(s: GameState): Record<string, number> {
  const p = s.world.characters[s.playerCharacterId], themes = { ...p.annualThemeYears };
  for (const m of ANNUAL_MESSAGES) {
    const year = p.annualNarrativeYears?.[m.id];
    if (year !== undefined) themes[m.theme] = Math.max(themes[m.theme] ?? -Infinity, year);
  }
  return themes;
}

export function eligibleAnnualMessages(s: GameState, excludedIds: readonly string[] = []): AnnualMessage[] {
  const excluded = new Set(excludedIds), themes = annualThemeYears(s);
  const excludedThemes = new Set(ANNUAL_MESSAGES.filter(m => excluded.has(m.id)).map(m => m.theme));
  const years = s.world.characters[s.playerCharacterId]?.annualNarrativeYears ?? {};
  const recentText = new Set(s.feed.slice(-16).map(entry => entry.text));
  return ANNUAL_MESSAGES.filter(m => !excluded.has(m.id) && !excludedThemes.has(m.theme)
    && (years[m.id] === undefined || (!m.once && s.world.currentYear - years[m.id] >= 12))
    && (themes[m.theme] === undefined || s.world.currentYear - themes[m.theme] >= 2)
    && !recentText.has(renderAnnualText(s,m))
    && (!m.once || !s.feed.some(entry => entry.text === m.text || entry.text === LEGACY_ONCE_TEXT[m.id]))
    && meetsCondition(s,m.requires));
}

export function pickAnnualMessage(s: GameState, excludedIds: readonly string[] = []): AnnualMessage | null {
  const eligible = eligibleAnnualMessages(s,excludedIds);
  if (!eligible.length) return null;
  const m = pickWeighted(eligible,m => m.weight ?? 1);
  if (!m) return null;
  const actors = annualActors(s);
  const id = (m.actors?.includes('carer') && m.effects?.kinRel?.id === 'mother' ? 'carer' : m.effects?.kinRel?.id) as AnnualActor | undefined;
  return { ...m, text: renderAnnualText(s,m), effects: m.effects ? { ...m.effects, kinRel: m.effects.kinRel ? { ...m.effects.kinRel, id: actors[id!] ?? m.effects.kinRel.id } : undefined } : undefined };
}
