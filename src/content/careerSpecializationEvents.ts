import type { GameEvent } from '@/types/game';
import { PROFESSIONAL_STORIES } from '@/data/professionalStories';
export const CAREER_SPECIALIZATION_EVENTS: GameEvent[] = PROFESSIONAL_STORIES.flatMap(story => [
  {
    id: `profession_${story.id}`, title: story.title, text: story.text, category: 'peasant', domain: 'career', arcNodeOnly: true, actorRoles: {},
    choices: story.choices.map((label, i) => ({
      id: `approach_${i}`, label, costGold: i === 2 ? 8 : undefined,
      outcome: { text: i === 0 ? 'You take the evidence and make the agreement openly. Its consequences will be tested next year.' : i === 1 ? 'You accept the profitable shortcut. Your client agrees to keep the papers; your rival knows where they are.' : 'You pay eight gold to retain an assistant. Their work will be tested with yours.',
        effects: { gold: i === 2 ? -8 : 0, professional: { family: story.family, caseId: story.id, stage: 'approach', choice: i } }, next: `profession_${story.id}_verdict`, nextWhen: 'nextYear' as const, tone: i === 1 ? 'bad' as const : 'plain' as const },
    })),
  },
  {
    id: `profession_${story.id}_verdict`, title: `${story.title} · THE RECKONING`, text: story.followup, category: 'peasant', domain: 'career', arcNodeOnly: true, actorRoles: {},
    choices: [
      { id: 'honour', label: 'Stand by the agreement', outcome: { text: 'The hearing records your decision and its consequences.', effects: { professional: { family: story.family, caseId: story.id, stage: 'finish', choice: 0 } }, tone: 'plain' } },
      { id: 'reconsider', label: 'Retract the shortcut and make restitution (6g)', costGold: 6, outcome: { text: 'You pay restitution and place the evidence before the hearing.', effects: { professional: { family: story.family, caseId: story.id, stage: 'finish', choice: 1 } }, tone: 'plain' } },
    ],
  },
]);
