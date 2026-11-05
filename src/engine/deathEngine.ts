/**
 * Death engine. Runs once per age-up (after the year's events) and decides
 * whether — and how — the life ends.
 *
 * Checks, in order:
 *   0. Already dead -> finalise once and preserve the recorded cause.
 *   1. The full span of years, which not even Live Forever gets past.
 *   2. Health <= 0.
 *   3. Old-age risk that ramps with age.
 *   4. Sourced yearly dangers: an active violent charge or actual war service.
 *
 * Steps 3 and 4 roll once a year. `ageUp` calls this after nearly every
 * sub-step, so an ungated hazard is really eight or nine rolls a year.
 */

import {unlinkSpouse} from './characterState';
import { GameState } from '@/types/game';
import { EPITAPHS } from '@/data/names';
import { agingMultiplierFromTraits } from './traitEngine';
import { killPlayer, legacyScore } from './consequenceEngine';
import { addMemory, countLivingKin, hasTag, pushFeed } from './gameState';
import { chance, pick, rnd } from './random';
import { C } from '@/theme/theme';
import { appendWorldHistory } from './worldJournal';

function difficultyDeathMod(s: GameState): number {
  switch (s.settings.difficulty) {
    case 'Brutal':
      return 1.35;
    case 'Merciful':
      return 0.78;
    default:
      return 1;
  }
}

export function checkDeath(s: GameState): GameState {
  if (s.dead) return finalise(s);
  // The span is the one thing Live Forever does not buy. It used to return here
  // before any age check ran, so the setting meant literally never dying, and a
  // life with no end has nothing at stake in it.
  if (s.age >= MAX_LIFESPAN) {
    killPlayer(s, 'Died at the full span of years. Nobody in Swineford could remember an older soul.', {category:'old_age',sourceType:'aging',sourceId:'maximum_lifespan'});
    return finalise(s);
  }

  if (s.settings.liveForever) {
    // Live Forever floors health at 1 so the player can keep aging.
    if (s.stats.health <= 0) s.stats.health = 1;
    return s;
  }

  const mod = difficultyDeathMod(s);

  // 2. Health collapse.
  if (s.stats.health <= 0) {
    killPlayer(s, s.deathContext?.cause ?? 'Died after a fatal collapse in health; no specific cause was recorded.', s.deathContext ?? {category:'unknown',sourceType:'system',sourceId:'health_collapse'});
    return finalise(s);
  }

  // `ageUp` calls this after almost every sub-step so that a fatal event is
  // finalised immediately. That is right for health collapse, which is a
  // reaction to something that just happened, and wrong for the yearly hazard
  // rolls below: they were being rolled eight or nine times a year, which made
  // the real chance of dying several times the stated one and meant nobody saw
  // sixty. These roll once per year and then stand down.
  if (s.world.pacing.hazardsRolledYear === s.world.currentYear) return s;
  s.world.pacing.hazardsRolledYear = s.world.currentYear;

  // 4. Old age — risk ramps after 45, and climbs steeply through the eighties
  // so that reaching the ceiling is a rare feat rather than the usual ending.
  if (s.age > 45) {
    const years = s.age - 45;
    const oldRisk = ((years / 200) + Math.pow(years / 58, 3) * 0.17) * mod;
    if (chance(oldRisk)) {
      killPlayer(s, 'Died of natural causes in later life.', {category:'old_age',sourceType:'aging',sourceId:'annual_aging'});
      return finalise(s);
    }
  }

  // An active, unresolved violent charge can bring a real same-year pursuit.
  // Reputation and vocation alone neither summon guards nor invent an execution.
  const legal=s.world.characters[s.playerCharacterId].legalState;
  const charge=legal?.charges.find(c=>!c.resolved&&c.severity>=60&&/robbery|assault|attack|violence/i.test(c.offence));
  if (legal&&charge&&legal.suspicion>=60&&legal.status!=='imprisoned'&&chance(0.05*mod)) {
    pushFeed(s,'GUARD PURSUIT',C.bad,`Guards pursue you over the recorded charge of ${charge.offence}. You flee; a clash on the road leaves fatal wounds.`, 'bad');
    killPlayer(s,'Died from wounds sustained while fleeing the guards.',{category:'pursuit',sourceType:'legal',sourceId:charge.id,actorIds:charge.witnessIds});
    return finalise(s);
  }
  if (s.rankIdx>=2&&hasTag(s,'at_war')&&chance(0.06*mod)) {
    pushFeed(s,'BATTLE',C.bad,'During this year’s fighting, you are struck while serving with the host. The wound proves fatal.', 'bad');
    killPlayer(s,'Died from wounds sustained in battle.',{category:'combat',sourceType:'encounter',sourceId:`annual_battle_${s.world.currentYear}`});
    return finalise(s);
  }

  return s;
}

function finalise(s: GameState): GameState {
  if(s.deathFinalized)return s;
  s.deathCause ||= s.deathContext?.cause || 'Died; the surviving record does not identify a cause.';
  s.deathContext ??= {category:'unknown',sourceType:'system',sourceId:'legacy_record',cause:s.deathCause,year:s.world.currentYear};
  const p=s.world.characters[s.playerCharacterId];
  if(p){p.alive=false;p.deathYear??=s.world.currentYear;p.deathCause=s.deathCause;p.deathContext=s.deathContext;unlinkSpouse(s,p.id,'death');}
  s.deathFinalized=true;
  s.rpg.mission = null;
  s.rpg.expedition = null;
  if (!s.epitaph) s.epitaph = pick(EPITAPHS);
  if (!s.world.history.some((entry) => entry.type === 'death' && entry.participantIds.includes(s.playerCharacterId))) {
    appendWorldHistory(s, { id: `history_death_${s.nextId++}`, year: s.world.currentYear, type: 'death', participantIds: [s.playerCharacterId], familyIds: [s.world.characters[s.playerCharacterId]?.birthFamilyId ?? ''].filter(Boolean), causes: [s.deathCause], summary: `${s.first} died at ${s.age}. ${s.deathCause}`, salience: 5 });
  }
  if(!s.memories.some(m=>m.tag==='died'))addMemory(s, 'died', 5, s.deathCause);
  if(!s.feed.some(f=>f.tag.includes('THE END')))pushFeed(s, `AGE ${s.age} · THE END`, C.bad, `You died at ${s.age}. ${s.deathCause}`, 'bad');
  return s;
}

export interface DeathSummary {
  name: string;
  age: number;
  rank: string;
  gold: number;
  heirs: number;
  cause: string;
  epitaph: string;
  legacy: number;
  chronicle: string[];
}

export function buildLifeChronicle(s: GameState): string[] {
  const relevant = s.world.history
    .filter((entry) => entry.participantIds.includes(s.playerCharacterId) || entry.type==='birth'&&entry.participantIds.some(id=>s.world.characters[id]?.parentIds?.includes(s.playerCharacterId)))
    .sort((a, b) => b.salience - a.salience || a.year - b.year)
    .slice(0, 5)
    .sort((a, b) => a.year - b.year)
    .map((entry) => `${entry.year}: ${entry.summary}`);
  const closest = Object.values(s.world.relationships)
    .filter((relationship) => (relationship.aId === s.playerCharacterId || relationship.bId === s.playerCharacterId)&&Math.min(relationship.aToB.affinity,relationship.bToA.affinity)>=60&&Math.min(relationship.aToB.trust,relationship.bToA.trust)>=40)
    .sort((a, b) => (b.aToB.affinity + b.bToA.affinity) - (a.aToB.affinity + a.bToA.affinity))[0];
  if (closest) {
    const otherId = closest.aId === s.playerCharacterId ? closest.bId : closest.aId;
    const other = s.world.characters[otherId];
    if (other) relevant.push(`${other.name} remained one of the strongest threads in this life.`);
  }
  const professional = Object.entries(s.world.characters[s.playerCharacterId].professionalHistory ?? {}).sort(([, a], [, b]) => b.reputation - a.reputation).find(([, r]) => r.reputation >= 20 || r.matters.some(m => m.resolved));
  if (professional) { const [family, record] = professional; relevant.unshift(`${s.first} built a ${family} legacy: standing ${record.reputation}; ${record.milestones.slice(-3).map(m => m.replaceAll('_', ' ')).join(', ')}.`); }
  if (!relevant.length) relevant.push(`${s.first} lived through ${s.age} changing years in Swineford.`);
  return relevant.slice(0, 6);
}

export function buildDeathSummary(s: GameState, rankKey: string): DeathSummary {
  const heirs = countLivingKin(s, 'child');
  return {
    name: [s.first,s.epithet].filter(Boolean).join(' '),
    age: s.age,
    rank: rankKey,
    gold: s.gold,
    heirs,
    cause: s.deathCause,
    epitaph: s.epitaph,
    legacy: legacyScore(s),
    chronicle: buildLifeChronicle(s),
  };
}

/** Nobody sees the far side of this, Live Forever aside. */
export const MAX_LIFESPAN = 110;

/** The age at which the body stops holding its own and starts giving ground. */
export const DECLINE_AGE = 55;

/**
 * The slow decline of old age, scaled by traits.
 *
 * Past `DECLINE_AGE` this is a floor as well as a roll: a character who is
 * eating well and resting can no longer hold a flat hundred health into their
 * eighties, which is what made a long life a matter of patience rather than of
 * luck. The floor climbs with each decade so the last years are genuinely hard.
 */
export function agingDamage(s: GameState): number {
  if (s.age <= 45) return 0;
  const base = rnd(1, Math.floor((s.age - 40) / 4) + 2);
  const decline = s.age >= DECLINE_AGE ? 2 + Math.floor((s.age - DECLINE_AGE) / 5) : 0;
  return Math.round((base + decline) * agingMultiplierFromTraits(s));
}
