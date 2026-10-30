import type { CareerFamily, GameState, ProfessionalRecord, WorldCharacter } from '@/types/game';
import { CAREER_SPECIALIZATIONS } from '@/data/careerSpecializations';
import { careerById } from '@/data/careers';

function needsCare(person: WorldCharacter): boolean {
  return person.stats.health < 65 || !!person.healthConditions?.some(c => c.severity > 0);
}
/** Pure selectors: inspecting clients never spawns people, changes bonds or draws RNG. */
export function professionalClientContext(state: GameState) {
  if (state.dead || !state.pendingEvent?.eventId.startsWith('practice_')) return;
  const id = state.pendingEvent.eventId.slice('practice_'.length);
  const definition = CAREER_SPECIALIZATIONS.find(d => d.id === id && !d.story);
  if (!definition || !['medicine', 'trade'].includes(definition.family)) return;
  const record = state.world.characters[state.playerCharacterId].professionalHistory?.[definition.family];
  const matter = record?.matters.find(m => m.id === id && m.kind === 'practice' && !m.resolved && m.stage === 0 && m.ownerId === state.playerCharacterId);
  if (!record || !matter || ((matter.requiredPremium || careerById(state.occupation.careerId)?.premium) && !state.lifetimeUnlocked)) return;
  const people = professionalClients(state, definition.family, record).filter(c => definition.mechanism !== 'rival' || c.id !== record.rivalId);
  return { definition, record, matter, people, selected: state.world.characters[matter.actorId] };
}
export function professionalClients(state: GameState, family: CareerFamily, record: ProfessionalRecord): WorldCharacter[] {
  if (family !== 'medicine' && family !== 'trade') return [];
  const people = Object.values(state.world.characters).filter(c => c.alive && c.id !== state.playerCharacterId && c.id !== 'goose');
  if (family === 'medicine') {
    const patients = people.filter(needsCare);
    // Preventive consultations stay available when there is no illness to treat.
    return (patients.length ? patients : people).sort((a,b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  }
  return people.filter(c => c.age >= 18 && !['imprisoned','exiled'].includes(c.legalState?.status ?? 'free') && (careerById(c.occupation.careerId)?.family === 'trade' || record.contactIds.includes(c.id))).sort((a,b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
export function selectProfessionalClient(state: GameState, id: string): boolean {
  const context = professionalClientContext(state);
  if (!context || context.matter.actorId === id || !context.people.some(c => c.id === id)) return false;
  context.matter.actorId = id;
  state.pendingEvent!.bindings = { ...state.pendingEvent!.bindings, client: id };
  return true;
}
