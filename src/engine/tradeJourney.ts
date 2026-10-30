import { feedbackSnapshot, feedbackChanges } from './choiceFeedback';
import { Effects, GameState } from '@/types/game';
import { TradeJourney } from '@/types/rpg';
import { careerById } from '@/data/careers';
import { applyEffects } from './consequenceEngine';
import { addMemory, pushFeed } from './gameState';
import { timedActionAvailability, spendAction } from './actionClock';
import { grantSkillXp } from './rpgProgress';
import { applyRelationshipShift, perspectives, relationshipWith } from './relationshipState';
import { appendWorldHistory } from './worldJournal';

export interface TradeChoice {
  id: string; label: string; stakes: string; text: string;
  cost: number; effects: Effects; trust: number; forge?: boolean;
}
export interface TradeChapter { title: string; text: string; assignments: number; choices: TradeChoice[] }

export const TRADE_CHAPTERS: TradeChapter[] = [
  { title: 'A mark of your own', assignments: 0,
    text: 'A local buyer needs iron fittings for a market cart. This is your chance to have work remembered under your own mark.', choices: [
      { id: 'fit', label: 'Fit and test every joint', stakes: 'Costs 3g. Earn 9g, client trust, and a paid callback next year. Forge optional.', cost: 3, effects: { gold: 9, reputation: 2 }, trust: 6, forge: true, text: 'The fittings hold under a full load. Your buyer remembers the care you took.' },
      { id: 'broker', label: 'Arrange a dependable supplier', stakes: 'Costs 2g. Earn 7g and build trust through reliable delivery.', cost: 2, effects: { gold: 7, reputation: 1 }, trust: 4, text: 'You inspect the supplied fittings before delivery. Your buyer gets a sound cart and knows whom to ask next time.' },
    ] },
  { title: 'The faulty batch', assignments: 2,
    text: 'A customer finds a crack in a fitting sold under your mark. Your regular buyer wants to know how you will put it right.', choices: [
      { id: 'recall', label: 'Replace the faulty batch', stakes: 'Costs 8g. Protect your reputation and gain client trust. Forge optional.', cost: 8, effects: { reputation: 5, faction: { factionId: 'guilds', playerStanding: 3 } }, trust: 8, forge: true, text: 'You replace the suspect fittings at your own expense. The buyer sees you taking responsibility, and trusts your mark more.' },
      { id: 'refund', label: 'Refund the affected customer', stakes: 'Costs 4g. Keep the dispute private and preserve some goodwill.', cost: 4, effects: { reputation: 1 }, trust: 2, text: 'The customer accepts the refund. You record the faulty batch and stop selling it.' },
      { id: 'deny', label: 'Dispute your responsibility', stakes: 'Keep your coin, but lose client trust and guild standing. A complaint follows next year.', cost: 0, effects: { reputation: -4, faction: { factionId: 'guilds', playerStanding: -3 } }, trust: -12, text: 'You refuse compensation. Your buyer records the refusal and warns the guild about your mark.' },
    ] },
  { title: 'Room to grow', assignments: 4,
    text: 'Your work is attracting larger orders. Your buyer offers an introduction; the village also needs reliable work at ordinary prices.', choices: [
      { id: 'commons', label: 'Reserve work for local households', stakes: 'Costs 6g. Earn community goodwill and strengthen client trust.', cost: 6, effects: { reputation: 6, faction: { factionId: 'commons', playerStanding: 5 } }, trust: 5, text: 'You reserve part of your working week for affordable repairs. Local households begin recommending your name.' },
      { id: 'patron', label: 'Accept the larger private order', stakes: 'Costs 10g. Earn 24g and guild standing; local customers resent the wait.', cost: 10, effects: { gold: 24, faction: { factionId: 'guilds', playerStanding: 4 }, holding: { loyalty: -3 } }, trust: 1, text: 'The private order is delivered and paid. Your purse grows, while smaller customers must wait their turn.' },
    ] },
  { title: 'What your mark will mean', assignments: 6,
    text: 'Your buyer asks what comes next. There is more than one way for a working life to count as a success.', choices: [
      { id: 'trusted', label: 'Build a reputation others can trust', stakes: 'Requires having replaced or refunded the faulty batch. Earn the Trusted Maker legacy and guild standing.', cost: 0, effects: { reputation: 8, faction: { factionId: 'guilds', playerStanding: 5 } }, trust: 6, text: 'Your mark becomes a promise to make faults right. The guild records you as a Trusted Maker; your work can continue.' },
      { id: 'prosperous', label: 'Secure a profitable partnership', stakes: 'Costs 12g. Earn 30g and the Prosperous Trader legacy, with a paid order next year.', cost: 12, effects: { gold: 30, reputation: 3 }, trust: 3, text: 'You sign a continuing partnership and receive its first payment. You have earned a living through trade, without needing a noble title.' },
      { id: 'independent', label: 'Settle accounts and stay independent', stakes: 'Earn 8g and the Independent Hand legacy. No new obligations.', cost: 0, effects: { gold: 8, reputation: 2 }, trust: 2, text: 'You settle this venture’s accounts and keep your own tools and judgement. Your profession remains yours to pursue.' },
    ] },
];

export const TRADE_ENDINGS = { trusted: 'Trusted Maker', prosperous: 'Prosperous Trader', independent: 'Independent Hand' };
export function isTradeProfessional(s: GameState): boolean { return ['craft', 'trade'].includes(careerById(s.occupation.careerId)?.family ?? ''); }
export function tradeProgress(s: GameState): TradeJourney { return s.world.characters[s.playerCharacterId].tradeJourney ?? { chapter: 0, assignments: 0, choices: [] }; }
export function recordTradeWork(s: GameState): void {
  if (!isTradeProfessional(s)) return;
  const p = s.world.characters[s.playerCharacterId];
  p.tradeJourney ??= { chapter: 0, assignments: 0, choices: [] };
  p.tradeJourney.assignments += 1;
}
export function tradeAvailability(s: GameState, choiceId?: string): string | null {
  const time = timedActionAvailability(s);
  if (!time.available) return time.reason ?? 'Unavailable';
  if (!isTradeProfessional(s)) return 'Take a craft or trade occupation to continue';
  if (s.age < 18) return 'Build your experience; commissions open at age 18';
  const p = tradeProgress(s), chapter = TRADE_CHAPTERS[p.chapter];
  if (!chapter) return 'Your professional legacy is earned';
  if (p.lastYear === s.world.currentYear) return 'The next chapter opens next year';
  if (p.assignments < chapter.assignments) return `Complete ${chapter.assignments} paid work shifts or successful guild contracts (${p.assignments} done)`;
  if (choiceId) {
    const choice = chapter.choices.find((c) => c.id === choiceId);
    if (!choice) return 'This commission has changed';
    if (s.gold < choice.cost) return `Needs ${choice.cost}g`;
    if (choice.id === 'trusted' && !p.choices.some((c) => c === 'recall' || c === 'refund')) return 'Settle honestly to earn a trusted mark; choose another legacy';
  }
  return null;
}
export function resolveTradeChoice(s: GameState, chapterIndex: number, choiceId: string): boolean {
  if (tradeProgress(s).chapter !== chapterIndex || tradeAvailability(s, choiceId)) return false;
  const player = s.world.characters[s.playerCharacterId];
  const progress = player.tradeJourney ??= { chapter: 0, assignments: 0, choices: [] };
  let client = s.world.characters[progress.clientId ?? ''];
  if (!client?.alive) {
    const oldName = client?.name;
    client = Object.values(s.world.characters).filter((c) => c.alive && c.age >= 18 && c.id !== s.playerCharacterId && c.id !== 'goose')
      .sort((a, b) => Number(b.factionId === 'guilds') - Number(a.factionId === 'guilds') || b.rel - a.rel || a.id.localeCompare(b.id))[0];
    progress.clientId = client?.id;
    if (oldName) pushFeed(s, 'A NEW BUYER', '#365f88', `${oldName} can no longer act as your buyer. ${client?.name ?? 'The guild'} takes over the open commission; the old relationship remains in your history.`, 'plain');
  }
  const chapter = TRADE_CHAPTERS[chapterIndex], choice = chapter.choices.find((c) => c.id === choiceId)!;
  const before = feedbackSnapshot(s);
  spendAction(s);
  applyEffects(s, { gold: -choice.cost });
  applyEffects(s, choice.effects);
  const oldTrust = client ? perspectives(s, relationshipWith(s, client.id)).other.trust : 0;
  if (client) applyRelationshipShift(s, client.id, { trust: Math.round(choice.trust / 2) }, { trust: choice.trust, affinity: choice.trust });
  grantSkillXp(s, careerById(s.occupation.careerId)?.family === 'craft' ? 'craftsmanship' : 'scholarship', 10, chapter.title);
  progress.choices.push(choice.id);
  progress.chapter += 1;
  progress.lastYear = s.world.currentYear;
  const summary = `${client?.name ?? 'The guild'} · ${choice.text}`;
  pushFeed(s, chapter.title.toUpperCase(), '#387245', summary, choice.trust < 0 ? 'bad' : 'good', { changes: [...feedbackChanges(before, s), ...(client ? [`${client.name}: trust ${perspectives(s, relationshipWith(s, client.id)).other.trust - oldTrust >= 0 ? '+' : ''}${perspectives(s, relationshipWith(s, client.id)).other.trust - oldTrust}`] : [])] });
  appendWorldHistory(s, { id: `trade_${s.nextId++}`, year: s.world.currentYear, type: 'professional_milestone', participantIds: [s.playerCharacterId, ...(client ? [client.id] : [])], familyIds: [player.birthFamilyId ?? ''].filter(Boolean), causes: [choice.label], summary, salience: 4 });
  if (chapterIndex === 0 || choice.id === 'deny' || choice.id === 'prosperous') {
    const complaint = choice.id === 'deny';
    applyEffects(s, { schedule: { sourceChoiceId: `trade:${chapterIndex}:${choice.id}`, dueYear: s.world.currentYear + 1, expiresYear: s.world.currentYear + 1, scope: 'character', targetIds: [s.playerCharacterId], condition: { kind: 'character_alive' }, resolution: { type: 'effects', targetId: s.playerCharacterId, effects: complaint ? { reputation: -2 } : { gold: 4, reputation: 1 } }, explanation: complaint ? 'Because you refused to remedy the faulty batch, the guild circulates the recorded complaint. Reputation −2.' : `Your completed ${chapterIndex === 0 ? 'cart commission' : 'partnership agreement'} brings a paid follow-up through the guild. Gold +4; reputation +1.` } });
  }
  if (chapterIndex === 3) {
    progress.ending = choice.id as TradeJourney['ending'];
    addMemory(s, `trade_legacy_${choice.id}`, 5, TRADE_ENDINGS[progress.ending!]);
    s.tags = [...new Set([...s.tags, `trade_legacy_${choice.id}`])];
  }
  return true;
}
