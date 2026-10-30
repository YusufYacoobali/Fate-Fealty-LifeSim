import type { CourtOffice, FactionKey } from '@/types/game';
export const POLITICAL_OFFICES: { id: CourtOffice; name: string; faction: FactionKey; initialId: string }[] = [
  { id: 'chancellor', name: 'Chancellor', faction: 'crown', initialId: 'rowan' },
  { id: 'treasurer', name: 'Treasurer', faction: 'guilds', initialId: 'beatrice' },
  { id: 'marshal', name: 'Marshal', faction: 'crown', initialId: 'joan' },
  { id: 'religious_adviser', name: 'Religious adviser', faction: 'church', initialId: 'oswin' },
];
export const ROYAL_DECISIONS = [
  { id: 'tax_raise', name: 'Raise levies', desc: '+25 treasury; prosperity, legitimacy and Commons support fall.' },
  { id: 'tax_relief', name: 'Forgive arrears', desc: '20 treasury; food, prosperity and legitimacy improve.' },
  { id: 'justice', name: 'Pardon a prisoner', desc: 'Free the selected prisoner and resolve their charges.' },
  { id: 'religion', name: 'Endow parish relief', desc: '15 treasury; reduce religious tension and gain Church support.' },
  { id: 'mobilise', name: 'Mobilise the host', desc: '30 treasury; the marshal’s ability determines protection.' },
  { id: 'peace', name: 'Negotiate peace', desc: '15 treasury; lower war threat and win Commons support.' },
  { id: 'grant_title', name: 'Grant landed nobility', desc: 'A living adult receives a documented noble title.' },
  { id: 'name_heir', name: 'Name a royal heir', desc: 'Select a legitimate claimant; rival claims remain.' },
  { id: 'disinherit', name: 'Disinherit a claimant', desc: 'Remove their eligibility, at a cost to family loyalty.' },
] as const;
