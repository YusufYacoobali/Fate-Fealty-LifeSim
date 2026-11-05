import {BARONY,baronyRequirements,holdsBarony,militaryPromotionRequirements,nobilityRequirements} from '@/engine/progressionRequirements';
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
    ['squire', 'knight'].includes(status?.martialHonour ?? 'none'),
    status?.martialHonour === 'knight',
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

/** One contextual profile sentence; details and actions remain at Court/Work. Pure. */
export function selectProgressionHint(s:GameState):string {
  const p=s.world.characters[s.playerCharacterId],royal=royalProgression(s);
  if(royal.label==='Monarch')return 'Monarch: protect your legitimacy and secure the succession at Court.';
  if(royal.label){
    if(royal.claim?.disinherited)return `${royal.label}: disinherited; your claim is excluded from Court succession.`;
    if(royal.claim&&!s.lifetimeUnlocked)return `${royal.label}: claim recorded; Pro is required for player succession at Court.`;
    if(royal.position){const n=royal.position,suffix=n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th';return `${royal.label}: ${n}${suffix} in succession; the designated heir has priority at Court.`;}
    return `${royal.label}: no eligible claim. Review the succession at Court.`;
  }
  if(holdsBarony(s))return 'Baron: the Crown requires a recognised claim. Review succession at Court.';
  const status=p.socialStatus;
  if(status?.estate==='noble'){
    const rows=baronyRequirements(s),missing=rows.find(row=>!row.met);
    if(!missing)return 'Noble: seek a barony at Court; the patent costs '+BARONY.price+'g.';
    if(missing.id==='access')return 'Noble: barony qualifications met; Pro is required to seek one at Court.';
    const target=missing.id==='gold'?`${BARONY.reserve}g held`:missing.label.replace(/^Age /,'age ').replace(/\+$/,'');
    return `Noble: a barony needs ${target} (now ${missing.current}). Seek it at Court.`;
  }
  if(status?.martialHonour==='squire'){
    const route=militaryPromotionRequirements(s),missing=route?.rows.find(row=>!row.met);
    if(missing?.id==='training')return 'Squire: complete martial training in Do → Practice to pursue knighthood.';
    if(missing?.id==='career')return 'Squire: take a martial occupation in Do → Work to pursue knighthood.';
    if(missing)return `Squire: knighthood needs ${missing.label.toLowerCase()} (now ${missing.current}). Train in Do.`;
    return 'Squire: knighthood requirements met; await the yearly service review.';
  }
  const station=status?.martialHonour==='knight'?'Knight':'Commoner',rows=nobilityRequirements(s),missing=rows.find(row=>!row.met);
  if(missing?.id==='age')return `${station}: nobility petitions need ${missing.label.toLowerCase()}. Build influence at Court.`;
  if(missing?.id==='ruler')return `${station}: nobility petitions need a capable living ruler. Review Court.`;
  if(rows.filter(row=>['influence','support'].includes(row.id)).some(row=>!row.met)){
    const influence=rows.find(row=>row.id==='influence')!.label.replace('Political ',''),support=rows.find(row=>row.id==='support')!.label;
    return `${station}: gain ${influence.toLowerCase()} and ${support}; petition for nobility at Court.`;
  }
  return `${station}: ready to petition for nobility at Court; the ruler may refuse.`;
}

/** @deprecated Advancement is a set of requirements, never a hereditary ladder. */
export function selectRankClimb(_s:GameState):null{return null;}

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
