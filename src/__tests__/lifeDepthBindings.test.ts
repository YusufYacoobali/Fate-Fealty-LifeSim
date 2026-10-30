import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { eventById } from '@/engine/eventPicker';
import { renderBoundText } from '@/content/persistentWorldEvents';
import { EDUCATION_EVENTS, ORIGIN_CHILDHOOD_EVENTS } from '@/content/educationEvents';
import { CAREER_SPECIALIZATION_EVENTS } from '@/content/careerSpecializationEvents';
import { bindDirectedEvent } from '@/engine/director';

test('shorthand and qualified role tokens resolve consistently, with a safe missing-actor fallback', () => {
  const s = createLife({ worldSeed: 301 });
  s.pendingEvent = { eventId: 'practice_negotiate_deal',bindings: { client: 'beatrice' } };
  expect(renderBoundText(s,'{{client}} / {{client.name}} / {{client.role}} / {{player}}')).toBe(`${s.world.characters.beatrice.name} / ${s.world.characters.beatrice.name} / ${s.world.characters.beatrice.role} / ${s.world.characters[s.playerCharacterId].name}`);
  expect(renderBoundText(s,'{{unknown}} {{unknown.name}}')).not.toContain('{{');
});
test('every education, origin and professional passage and choice can render without literal actor tokens', () => {
  const s = createLife({ worldSeed: 301 });
  s.pendingEvent = { eventId: 'fixture',bindings: { guardian: 'mother',contact: 'beatrice',mentor: 'oswin',classmate: 'edwin',client: 'beatrice',rival: 'rowan' } };
  for (const e of [...EDUCATION_EVENTS,...ORIGIN_CHILDHOOD_EVENTS,...CAREER_SPECIALIZATION_EVENTS]) {
    expect(renderBoundText(s,typeof e.text === 'function' ? e.text(s) : e.text)).not.toContain('{{');
    for (const choice of e.choices) {
      expect(renderBoundText(s,choice.label)).not.toContain('{{');
      if (choice.outcome) expect(renderBoundText(s,choice.outcome.text)).not.toContain('{{');
    }
  }
});
test('named outcomes are stored in both the feed and history after an origin decision', () => {
  let s = createLife({ worldSeed: 301,birthOrigin: 'artisan' }); s.age = 10;
  const event = ORIGIN_CHILDHOOD_EVENTS.find(e => e.id.startsWith('origin_child_artisan_extra_'))!;
  s.pendingEvent = { eventId: event.id,bindings: { guardian: 'mother',contact: 'edwin' } };
  s = gameReducer(s,{ type: 'CHOOSE',choice: eventById(event.id)!.choices[1] });
  expect(s.feed.at(-1)!.text).toContain(s.world.characters.edwin.name);
  expect(s.world.history.at(-1)!.summary).toContain(s.world.characters.edwin.name);
  expect(s.feed.at(-1)!.text).not.toContain('{{');
});
test('the household member shown in early lessons receives the actual relationship change', () => {
  let s = createLife({ worldSeed: 301,birthOrigin: 'peasant' }); s.age = 2;
  const event = eventById('household_first_words')!;
  const bindings = bindDirectedEvent(s,{ event,kind: 'standalone',isLegal: false })!;
  expect(bindings.contact).toBe(bindings.guardian);
  const before = s.world.characters[bindings.guardian].rel;
  s.pendingEvent = { eventId: event.id,bindings };
  s = gameReducer(s,{ type: 'CHOOSE',choice: event.choices[0] });
  expect(s.world.characters[bindings.guardian].rel).toBeGreaterThan(before);
});
