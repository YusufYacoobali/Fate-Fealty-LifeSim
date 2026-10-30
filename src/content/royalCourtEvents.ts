import { petitionProspects, petitionPatronEligible } from '@/engine/courtPolitics';
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

ROYAL_COURT_EVENTS.push(
  { id: 'court_office_contest', title: 'THE CONTESTED SEAL', category: 'court', domain: 'politics', arcNodeOnly: true, actorRoles: {},
    text: s => { const q = s.world.court?.petition; return q && !q.resolved ? `Your request for the ${q.office.replaceAll('_',' ')}’s seal is before the ruler. ${petitionProspects(s,'merit').detail} Appointment depends on the council’s decision.` : 'The court has already recorded this petition.'; },
    choices: [
      { id: 'merit', label: 'Present your learning and service', outcome: { text: 'The ruler considers your service against the vacancy, incumbent and rival candidates. The court record gives the decision.', effects: { courtPetition: 'merit' }, tone: 'plain' } },
      { id: 'patron', label: 'Ask your patron to speak for you', requires: { custom: petitionPatronEligible }, outcome: { text: 'Your patron addresses the council. Their support helps; the incumbent still has a case to answer.', effects: { courtPetition: 'patron' }, tone: 'plain' } },
      { id: 'conditional', label: 'Offer further service before a new petition', outcome: { text: 'The ruler records a condition of further professional service. You receive a target rather than a seal.', effects: { courtPetition: 'conditional' }, tone: 'plain' } },
      { id: 'withdraw', label: 'Withdraw the request', outcome: { text: 'The request is withdrawn. The existing officeholder remains responsible.', effects: { courtPetition: 'withdraw' }, tone: 'plain' } },
    ],
  },
  { id: 'court_opposition_audience', title: 'THE OPPOSING HOUSEHOLDS', category: 'noble', domain: 'politics', premium: true, arcNodeOnly: true, actorRoles: {},
    text: s => { const q = s.world.court?.coalitions?.find(q => q.strength >= 40 && (q.lastAudienceYear ?? -10) + 5 <= s.world.currentYear); return `${s.world.characters[q?.leaderId ?? '']?.name ?? 'An opposing household'} brings a coalition before the council${q?.claimantId ? ` backing ${s.world.characters[q.claimantId]?.name}'s claim` : ''}. Their strength is ${q?.strength ?? 0}. They have withheld cooperation and demand an answer.`; },
    choices: [
      { label: 'Fund a negotiated settlement (15 treasury)', requires: { custom: s => (s.world.court?.treasury ?? 0) >= 15 }, outcome: { text: 'A recorded settlement reduces the coalition’s strength. Rival claims remain in the family record.', effects: { courtOpposition: 'negotiate' }, tone: 'good' } },
      { label: 'Hear the households’ grievances', outcome: { text: 'The hearing earns some respect and eases opposition while leaving the dispute open.', effects: { courtOpposition: 'hear' }, tone: 'plain' } },
      { label: 'Assert royal authority and dismiss them', outcome: { text: 'The rejected petition becomes a rallying point. The coalition gains strength and public order falls.', effects: { courtOpposition: 'assert' }, tone: 'bad' } },
    ],
  },
);
