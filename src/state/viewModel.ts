import {rankPromotionRequirements} from '@/engine/progressionRequirements';
import {displayName} from '@/engine/nameValidation';
import {royalProgression} from '@/engine/advancement';
import { BIRTH_ORIGINS } from '@/data/birthOrigins';
/**
 * Pure selectors that turn GameState into the small, display-ready shapes the
 * UI components consume. Keeping this logic here keeps components dumb.
 */

import { GameState, KinMember, STAT_KEYS } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { STAT_STYLES, FEED_STYLE, C } from '@/theme/theme';
import { relationMatchesFilter } from '@/engine/relationshipEngine';
import { careerById } from '@/data/careers';

export function selectStats(s: GameState) {
  return STAT_KEYS.map((k) => ({ key: k, ...STAT_STYLES[k], val: s.stats[k] }));
}

export function selectFeed(s: GameState) {
  return s.feed.filter((entry) => {
    if (s.world.feedFilter === 'player') return (entry.source ?? 'player') === 'player';
    if (s.world.feedFilter === 'world') return entry.source === 'npc' || entry.source === 'world';
    return true;
  }).map((e) => {
    const source = e.source ?? 'player';
    const palette = source === 'player' ? FEED_STYLE.player : FEED_STYLE.world;
    const ts = palette[e.tone] ?? palette.plain;
    // Alternate on the entry id, not the row index: the feed is capped and
    // filtered, so an index-based stripe would reshuffle as entries age out.
    return {
      id: e.id,
      age: e.age,
      changes: e.changes,
      tag: e.tag,
      tagColor: e.tagColor ?? ts.tagColor,
      text: e.traitId ? e.text.replace(/^.*?(From the cradle|You are now)/, '$1') : e.text,
      traitId: e.traitId,
      source,
      bg: e.id % 2 === 0 ? ts.bg : ts.bgAlt,
      border: ts.border,
      sd: ts.sd,
      sl: ts.sl,
    };
  });
}

export function relColor(rel: number): string {
  return rel >= 66 ? C.good : rel >= 33 ? C.charmDark : C.bad;
}

export function relLabel(rel: number): string {
  return rel >= 75 ? 'Adoring' : rel >= 50 ? 'Warm' : rel >= 30 ? 'Cool' : 'Hostile';
}

export function selectKin(s: GameState): KinMember[] {
  return s.kin.filter((kin) => relationMatchesFilter(s, kin, s.world.relationFilter));
}

export function selectedKin(s: GameState): KinMember | null {
  if (!s.selectedKinId) return null;
  return s.kin.find((k) => k.id === s.selectedKinId) ?? null;
}

export function selectRankPath(s: GameState) {
  const status = s.world.characters[s.playerCharacterId].socialStatus;
  const royal=royalProgression(s);
  const held = [
    status?.estate === 'commoner',
    s.rankIdx>=1,
    s.rankIdx>=2,
    ['noble', 'baronial', 'royal'].includes(status?.estate ?? 'commoner') || !!royal.label,
    status?.estate === 'baronial' || status?.titles.includes('Baron'),
    s.world.court?.rulerId === s.playerCharacterId || (s.dead && s.rankIdx === 5),
  ];
  return RANKS.map((r, i) => {
    const locked = !!r.premium && !s.lifetimeUnlocked;
    const current = held[i] && i === s.rankIdx;
    return {
      name: i === 0 ? 'COMMONER' : i === 3 && royal.label && royal.label !== 'Monarch' ? royal.label.toUpperCase() : r.short,
      locked,
      bg: locked ? '#c2ccd8' : current ? C.charm : held[i] ? C.faith : C.lightFill,
      sd: locked ? '#7a8799' : current ? C.charmDark : held[i] ? C.faithDark : C.paleEdge,
      fg: locked ? '#41536b' : held[i] ? C.inkSoft : '#7a93b0',
    };
  });
}

/** A compact next-level hint from the very same requirements as promotion. */
export function selectProgressionHint(s:GameState):string {
 if(s.rankIdx>=RANKS.length-1)return 'You rule the kingdom. Protect legitimacy and secure the succession.';
 const next=RANKS[s.rankIdx+1],missing=rankPromotionRequirements(s).filter(r=>!r.met&&r.id!=='progress');
 const needs=missing.map(r=>r.id==='access'?'Pro':r.id==='gold'?r.label.replace('Gold held ',''):r.id==='age'?r.label.toLowerCase().replace('+',''):r.id==='crown'&&r.current==='Await succession or political recognition'?'succession or political recognition':r.id==='crown'?'a recognised route to the Crown':r.label.replace('+',''));
 const list=needs.length<2?needs[0]:needs.slice(0,-1).join(', ')+' and '+needs.at(-1);
 if(s.rankProgress<100)return `Build standing through work and achievements. ${needs.length?`${next.key} needs ${list}.`:`Reach 100 standing to become ${next.key}.`}`;
 return needs.length?`Standing complete. ${next.key} needs ${list}.`:`Standing complete. Ready to become ${next.key}.`;
}
export function selectRankClimb(s:GameState){
 const next=RANKS[s.rankIdx+1];if(!next)return null;
 return {to:next.key==='Monarch'?'MONARCH':next.short,progress:Math.min(100,Math.max(0,s.rankProgress)),locked:!!next.premium&&!s.lifetimeUnlocked};
}

export function currentRank(s: GameState) {
  const rank = RANKS[s.rankIdx];
  const player = s.world.characters[s.playerCharacterId];
  if (s.rankIdx === 0 && player?.socialStatus?.estate === 'commoner') return { ...rank, short: 'COMMONER', key: 'Commoner' as typeof rank.key };
  if (s.rankIdx === 3 && player?.socialStatus?.estate === 'royal') {const label=royalProgression(s).label??'Royal Kin';return {...rank,short:label.toUpperCase(),key:label as typeof rank.key};}
  return rank;
}

export function selectBio(s: GameState): string {
  const rank = currentRank(s);
  const career = careerById(s.occupation.careerId)?.title ?? 'unemployed wanderer';
  const debt = s.debts.reduce((sum, item) => sum + item.principal, 0);
  const player = s.world.characters[s.playerCharacterId];
  const origin = BIRTH_ORIGINS.find(o => o.id === player.background?.origin)?.name ?? 'Unknown';
  const office = Object.entries(s.world.court?.offices ?? {}).find(([, id]) => id === player.id)?.[0];
  return `${displayName(s.first,s.epithet)}, a ${rank.key.toLowerCase()} of Swineford and ${career}, ${s.age} winters old. Born to a ${origin.toLowerCase()} household${office ? `; appointed ${office.replaceAll('_', ' ')}` : ''}. Owns ${s.gold} gold${debt ? ` and owes ${debt}` : ''}. ${player.education?.qualifications.length ? `Learning: ${player.education.qualifications.map(q => q.replaceAll('_', ' ')).join(', ')}.` : 'No formal qualifications; later study remains open.'}`;
}

export function fullName(s: GameState): string {
  return displayName(s.first,s.epithet);
}

export { traitsOf as selectTraits } from '@/engine/traitEngine';
export { goalView as selectGoal } from '@/engine/goalEngine';
