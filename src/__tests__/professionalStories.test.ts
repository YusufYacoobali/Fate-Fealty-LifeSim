import { createLife } from '@/engine/gameState';
import { gameReducer } from '@/state/gameReducer';
import { PROFESSIONAL_STORIES } from '@/data/professionalStories';
import { CAREER_SPECIALIZATIONS } from '@/data/careerSpecializations';
import { ENTRY_CAREERS } from '@/data/careers';
import { eventById } from '@/engine/eventPicker';
import { applyProfessionalEffect } from '@/engine/careerSpecializationEngine';
import { directYear } from '@/engine/director';

describe('branching professional commissions', () => {
  it.each(PROFESSIONAL_STORIES)('$id concludes each of its three branches once', story => {
    for (let choice = 0; choice < 3; choice++) {
      let s = createLife({ worldSeed: 491, birthOrigin: 'peasant' }); s.age = 35; s.gold = 100;
      s.occupation.careerId = ENTRY_CAREERS.find(c => c.family === story.family)!.id;
      for (const a of CAREER_SPECIALIZATIONS.filter(a => a.family === story.family && !a.story).slice(0, 2)) s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: a.id });
      s = gameReducer(s, { type: 'CAREER_ACTION', action: 'specialize', careerId: story.id });
      const event = eventById(s.pendingEvent!.eventId)!;
      s = gameReducer(s, { type: 'CHOOSE', choice: event.choices[choice] });
      expect(s.pendingEvent).toBeNull();
      s.world.currentYear++;
      const directed = directYear(s);
      expect(directed.event?.id).toBe(`profession_${story.id}_verdict`);
      s.pendingEvent = { eventId: directed.event!.id };
      s = gameReducer(s, { type: 'CHOOSE', choice: eventById(s.pendingEvent.eventId)!.choices[0] });
      const r = s.world.characters[s.playerCharacterId].professionalHistory![story.family]!;
      expect(r.matters.find(m => m.id === story.id)?.resolved).toBe(true);
      expect(r.milestones).toContain(choice === 1 ? `${story.milestone}_ruthless` : story.milestone);
      if (choice === 2) expect(s.world.characters[r.apprenticeId!]).toBeDefined();
      const gold = s.gold;
      applyProfessionalEffect(s, { family: story.family, caseId: story.id, stage: 'finish', choice: 0 });
      expect(s.gold).toBe(gold);
    }
  });
});
