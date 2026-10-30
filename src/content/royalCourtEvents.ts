import type { GameEvent } from '@/types/game';
export const ROYAL_COURT_EVENTS: GameEvent[] = [
  { id: 'royal_creative_accounts', title: 'THE COUNCILLOR’S CREATIVE ACCOUNTS', category: 'noble', domain: 'politics', premium: true, arcNodeOnly: true, actorRoles: {},
    text: s => { const scandal = s.world.court?.scandals.find(c => !c.resolved); const person = s.world.characters[scandal?.actorId ?? '']; return `${person?.name ?? 'Your councillor'}, your ${scandal?.office.replaceAll('_',' ') ?? 'official'}, has diverted ${scandal?.amount ?? 0} treasury gold. The account describes national security. The receipt describes decorative horses. A family ally asks whether the horses could be classified as cavalry.`; },
    choices: [
      { label: 'Demand a public investigation', outcome: { text: 'The inquiry removes the responsible official and recovers half the missing funds. The household’s supporters take the dismissal personally.', effects: { courtScandal: 'investigate' }, tone: 'good' } },
      { label: 'Cover up the accounts', outcome: { text: 'The official keeps the seal and owes you a favour. The original receipts remain in someone else’s hands.', effects: { courtScandal: 'cover' }, tone: 'bad' } },
      { label: 'Blame the treasurer', requires: { custom: s => !!s.world.court?.offices.treasurer && s.world.court.offices.treasurer !== s.world.court.scandals.find(c => !c.resolved)?.actorId }, outcome: { text: 'The treasurer loses the seal. The guilds recognise an injustice considerably faster than the council recognises a sum.', effects: { courtScandal: 'scapegoat' }, tone: 'bad' } },
      { label: 'Dismiss the official quietly', outcome: { text: 'The seal returns to your keeping. The missing gold does not. The dismissed official takes the grievance home.', effects: { courtScandal: 'dismiss' }, tone: 'plain' } },
    ],
  },
];
