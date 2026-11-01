import {enqueuePersonalDeath,enqueueLifeEventNotice,snapshotPerson} from './lifeEventNotices';
import { GameState, WorldCharacter } from '@/types/game';

export function cloneWorldCharacter(character: WorldCharacter): WorldCharacter {
  return {
    ...character,
    marriages: character.marriages?.map(record => ({...record})),
    background: character.background ? { ...character.background, guardianIds: [...character.background.guardianIds] } : undefined,
    education: character.education ? JSON.parse(JSON.stringify(character.education)) : undefined,
    socialStatus: character.socialStatus ? { ...character.socialStatus, titles: [...character.socialStatus.titles], grants: [...character.socialStatus.grants] } : undefined,
    professionalHistory: character.professionalHistory ? JSON.parse(JSON.stringify(character.professionalHistory)) : undefined,
    tradeJourney: character.tradeJourney ? { ...character.tradeJourney, choices: [...character.tradeJourney.choices], completedCommissions: character.tradeJourney.completedCommissions?.slice() } : undefined,
    annualThemeYears: character.annualThemeYears ? { ...character.annualThemeYears } : undefined,
    annualNarrativeYears: character.annualNarrativeYears ? { ...character.annualNarrativeYears } : undefined,
    skills: character.skills ? Object.fromEntries(Object.entries(character.skills).map(([id, value]) => [id, { ...value }])) as typeof character.skills : undefined,
    pronouns: { ...character.pronouns }, stats: { ...character.stats }, traits: [...character.traits],
    occupation: { ...character.occupation }, debts: character.debts.map((debt) => ({ ...debt })),
    healthTags: [...character.healthTags], memories: [...character.memories],
    parentIds: [...(character.parentIds ?? [])], childIds: [...(character.childIds ?? [])],
    personalityTraits: [...(character.personalityTraits ?? [])],
    worldMemories: (character.worldMemories ?? []).map((memory) => ({ ...memory, actorIds: [...memory.actorIds] })),
    healthConditions: (character.healthConditions ?? []).map((condition) => ({ ...condition })),
    legalState: character.legalState ? { ...character.legalState, hearing:character.legalState.hearing?{...character.legalState.hearing,chargeIds:[...character.legalState.hearing.chargeIds]}:undefined, charges: character.legalState.charges.map((charge) => ({ ...charge, victimIds: [...charge.victimIds], witnessIds: [...charge.witnessIds] })) } : undefined,
    secrets: (character.secrets ?? []).map((secret) => ({ ...secret, knownByIds: [...secret.knownByIds] })),
    guardianIds: [...(character.guardianIds ?? [])],
    childDevelopment: character.childDevelopment ? { ...character.childDevelopment, completedMilestones: [...character.childDevelopment.completedMilestones] } : undefined,
  };
}

export function syncControlledCharacterToWorld(state: GameState): GameState {
  const player = state.world.characters[state.playerCharacterId];
  if (!player) return state;
  Object.assign(player, {
    name: state.first, age: state.age, alive: !state.dead, gender: state.gender,
    pronouns: { ...state.pronouns }, attraction: state.attraction, stats: { ...state.stats },
    traits: [...state.traits], gold: state.gold, rankIdx: state.rankIdx,
    occupation: { ...state.occupation }, debts: state.debts.map((debt) => ({ ...debt })),
  });
  return state;
}

export function syncControlledCharacterFromWorld(state: GameState): GameState {
  const player = state.world.characters[state.playerCharacterId];
  if (!player) return state;
  Object.assign(state, {
    first: player.name, age: player.age, dead: !player.alive, gender: player.gender,
    pronouns: { ...player.pronouns }, attraction: player.attraction, stats: { ...player.stats },
    traits: [...player.traits], gold: player.gold, rankIdx: player.rankIdx,
    occupation: { ...player.occupation }, debts: player.debts.map((debt) => ({ ...debt })),
  });
  return state;
}

export function rebuildKinProjection(state: GameState): GameState {
  state.kin = Object.values(state.world.characters).filter((character) => character.id !== state.playerCharacterId);
  return state;
}

export function kinCharacters(state: GameState): WorldCharacter[] {
  return Object.values(state.world.characters).filter((character) => character.id !== state.playerCharacterId);
}

/** Active marriage is a reciprocal link between two living people. Pure preview. */
export function activeSpouse(state: GameState, characterId = state.playerCharacterId): WorldCharacter | undefined {
  const person = state.world.characters[characterId];
  const spouse = state.world.characters[person?.spouseId ?? ''];
  return person?.alive && spouse?.alive && spouse.id !== person.id && spouse.spouseId === person.id ? spouse : undefined;
}

function relationshipBetween(state: GameState, a: string, b: string) {
  return Object.values(state.world.relationships).find(r => r.aId === a && r.bId === b || r.aId === b && r.bId === a);
}
function rememberMarriage(person: WorldCharacter, spouseId: string, startedYear?: number) {
  const records = person.marriages ??= [];
  let record = records.find(r => r.spouseId === spouseId && !r.endReason);
  if (!record) { record = {spouseId, ...(startedYear !== undefined ? {startedYear} : {})}; records.push(record); }
  return record;
}
function syncMaritalTags(state: GameState) {
  const person = state.world.characters[state.playerCharacterId];
  if (!person) return;
  const married = Boolean(activeSpouse(state));
  const last = person.marriages?.at(-1);
  const widowed = !married && person.alive && (last ? last.endReason === 'death' && last.deceasedId !== person.id : state.tags.includes('widowed'));
  state.tags = state.tags.filter(t => t !== 'married' && t !== 'widowed' && (!married || t !== 'divorced'));
  if (married) state.tags.push('married');
  else if (widowed) state.tags.push('widowed');
}

/** Clear current links only. Genealogy and earlier marriage records never move. */
export function unlinkSpouse(state: GameState, characterId: string, reason: NonNullable<import('@/types/game').MarriageRecord['endReason']> = 'separation', deceasedId = characterId, notice: {notify?:boolean;initiator?:'player'|'npc';cause?:string} = {}): void {
  const person = state.world.characters[characterId], spouseId = person?.spouseId;
  if(reason==='death')for(const r of Object.values(state.world.relationships))if(r.aId===deceasedId||r.bId===deceasedId)r.flags=r.flags.filter(f=>f!=='affair'&&f!=='courtship');
  if (!person || !spouseId) return;
  const spouse = state.world.characters[spouseId];
  if (notice.notify!==false) {
    if (reason==='death') enqueuePersonalDeath(state,deceasedId,notice.cause);
    else if ((reason==='divorce'||reason==='separation')&&spouse?.spouseId===person.id&&[person.id,spouseId].includes(state.playerCharacterId)) {
      const partner=person.id===state.playerCharacterId?spouse:person;
      enqueueLifeEventNotice(state,{key:`marriage_${partner.id}_${state.world.characters[state.playerCharacterId].marriages?.length??0}_${state.world.currentYear}`,category:'divorce',people:[snapshotPerson(state,partner.id,'spouse')],cause:notice.cause,context:{initiator:notice.initiator??'player'}});
    }
  }
  delete person.spouseId;
  if (spouse?.spouseId === person.id) delete spouse.spouseId;
  const relation = relationshipBetween(state, person.id, spouseId);
  if (relation) {
    relation.flags = relation.flags.filter(f => f !== 'spouse');
    if (!relation.flags.includes('former_spouse')) relation.flags.push('former_spouse');
  }
  for (const [a,b] of [[person,spouse],[spouse,person]]) if (a && b) {
    const record = rememberMarriage(a,b.id);
    record.endReason = reason;
    record.endedYear = reason === 'death' ? state.world.characters[deceasedId]?.deathYear ?? state.world.currentYear : state.world.currentYear;
    if (reason === 'death') record.deceasedId = deceasedId;
  }
  if (reason === 'death' && deceasedId !== state.playerCharacterId && [person.id,spouseId].includes(state.playerCharacterId)) {
    state.memories=[...state.memories,{id:state.nextId++,age:state.age,tag:'widowed',weight:3,note:state.world.characters[deceasedId]?.name}].slice(-200);
  }
  syncMaritalTags(state);
}

/** Idempotent load/runtime repair; never draws RNG or rewrites narration. */
export function reconcileMaritalState(state: GameState, characterId = state.playerCharacterId): void {
  const person = state.world.characters[characterId]; if (!person) return;
  const wasMarried = characterId === state.playerCharacterId && (state.tags.includes('married')||state.tags.includes('widowed'));
  const spouse = state.world.characters[person.spouseId ?? ''];
  if (person.spouseId && !activeSpouse(state, characterId)) {
    const deceased = !person.alive ? person.id : spouse && !spouse.alive ? spouse.id : undefined;
    unlinkSpouse(state,person.id,deceased ? 'death' : 'separation',deceased,{notify:false});
  }
  const current = activeSpouse(state,characterId);
  if (current) {
    rememberMarriage(person,current.id); rememberMarriage(current,person.id);
    const relation = relationshipBetween(state,person.id,current.id);
    if (relation) { relation.flags = relation.flags.filter(f => f !== 'former_spouse'); if (!relation.flags.includes('spouse')) relation.flags.push('spouse'); }
  } else if (wasMarried && !person.marriages?.length) {
    // Old death handlers already removed both links, leaving only these clues.
    const late = Object.values(state.world.characters).filter(c => !c.alive && c.kind === 'spouse' && relationshipBetween(state,person.id,c.id)?.flags.includes('former_spouse')).sort((a,b)=>(b.deathYear??-Infinity)-(a.deathYear??-Infinity)||a.id.localeCompare(b.id))[0];
    if (late) {
      for (const [a,b] of [[person,late],[late,person]]) Object.assign(rememberMarriage(a,b.id),{endReason:'death',deceasedId:late.id,...(late.deathYear !== undefined ? {endedYear:late.deathYear} : {})});
    }
  }
  if (characterId === state.playerCharacterId) syncMaritalTags(state);
}

export function reconcileMarriages(state: GameState): void {
  for (const id of Object.keys(state.world.characters)) reconcileMaritalState(state,id);
  for (const r of Object.values(state.world.relationships)) if (r.flags.includes('spouse') && activeSpouse(state,r.aId)?.id !== r.bId) {
    r.flags = r.flags.filter(f => f !== 'spouse'); if (!r.flags.includes('former_spouse')) r.flags.push('former_spouse');
  }
}

export function linkSpouses(state: GameState, aId: string, bId: string): boolean {
  if (aId === bId) return false;
  reconcileMaritalState(state,aId); reconcileMaritalState(state,bId);
  const a=state.world.characters[aId], b=state.world.characters[bId];
  if (!a?.alive || !b?.alive || a.spouseId && a.spouseId !== b.id || b.spouseId && b.spouseId !== a.id) return false;
  a.spouseId=b.id; b.spouseId=a.id;
  for(const r of Object.values(state.world.relationships)){
    const partnerId=r.aId===state.playerCharacterId?r.bId:r.bId===state.playerCharacterId?r.aId:undefined;
    if(!partnerId||!r.flags.includes('courtship'))continue;
    const playerInPair=[a.id,b.id].includes(state.playerCharacterId);
    const chosen=playerInPair?(a.id===state.playerCharacterId?b:a):undefined;
    if(playerInPair&&partnerId===chosen!.id){r.flags=r.flags.filter(f=>f!=='courtship'&&f!=='affair');continue;}
    if(!playerInPair&&![a.id,b.id].includes(partnerId))continue;
    const other=playerInPair?chosen!:(a.id===partnerId?b:a);
    enqueueLifeEventNotice(state,{key:`romance_${partnerId}_${r.romanceEpisode??0}_${state.world.currentYear}`,category:'heartbreak',people:[snapshotPerson(state,partnerId,'romantic partner'),snapshotPerson(state,other.id,'new spouse')],cause:`Marriage to ${other.name}`,context:{initiator:playerInPair?'player':'npc',romanceKind:'courtship'}});
    r.flags=r.flags.filter(f=>f!=='courtship');r.sharedMemories.push(`relationship_ended_${state.world.currentYear}`);
  }
  rememberMarriage(a,b.id,state.world.currentYear); rememberMarriage(b,a.id,state.world.currentYear);
  reconcileMaritalState(state,a.id);
  return true;
}
