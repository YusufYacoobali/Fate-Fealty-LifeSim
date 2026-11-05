import type { CourtOffice, FactionKey } from '@/types/game';
export const POLITICAL_OFFICES: { id: CourtOffice; name: string; faction: FactionKey; initialId: string }[] = [
  { id: 'chancellor', name: 'Chancellor', faction: 'crown', initialId: 'rowan' },
  { id: 'treasurer', name: 'Treasurer', faction: 'guilds', initialId: 'beatrice' },
  { id: 'marshal', name: 'Marshal', faction: 'crown', initialId: 'joan' },
  { id: 'religious_adviser', name: 'Religious adviser', faction: 'church', initialId: 'oswin' },
];
export const ROYAL_DECISIONS = [
  { id: 'tax_raise', name: 'Raise levies', desc: '+25 treasury before resistance; prosperity, legitimacy and Commons support fall.' },
  { id: 'tax_relief', name: 'Forgive arrears', desc: '20 treasury; food, prosperity and legitimacy improve.' },
  { id: 'justice', name: 'Pardon a prisoner', desc: 'Free the selected prisoner and resolve their charges.' },
  { id: 'religion', name: 'Endow parish relief', desc: '15 treasury; reduce religious tension and gain Church support.' },
  { id: 'mobilise', name: 'Mobilise the host', desc: '30 treasury; the marshal’s ability determines protection.' },
  { id: 'peace', name: 'Negotiate peace', desc: '15 treasury funds an embassy; an accepted truce lowers war threat. Rejection remains possible.' },
  { id: 'grant_title', name: 'Recognise service', desc: 'Recognise an untitled adult at the next ordinary rank.' },
  { id: 'name_heir', name: 'Name a royal heir', desc: 'Select a legitimate claimant; rival claims remain.' },
  { id: 'disinherit', name: 'Disinherit a claimant', desc: 'Remove their eligibility, at a cost to family loyalty.' },
] as const;

/** Shared labels and base effects; previews clamp the same values as execution. */
export const POLITICAL_TERMS={
 influence:{label:'Political influence',description:'Your personal ability to influence court decisions.'},
 support:{label:'Crown support',description:'How favourably the Crown faction regards you.'},
 standing:{label:'Court professional standing',description:'Your reputation in the court career; it is separate from holding an office.'},
 legitimacy:{label:'Legitimacy',description:'Support for the current monarch’s right to rule, rather than your personal influence.'},
} as const;
export const COURT_ACTION_GAINS:Partial<Record<import('@/engine/courtEngine').CourtAction,{influence:number;support:number;prosperity:number}>>={
 patron:{influence:7,support:4,prosperity:0},advise:{influence:5,support:3,prosperity:2},alliance:{influence:6,support:0,prosperity:0},expose:{influence:6,support:0,prosperity:0},
};
export const OFFICE_APPOINTMENT_INFLUENCE=8;
export const COURT_TREASURY_COSTS:Partial<Record<import('@/engine/courtEngine').CourtAction,number>>={tax_relief:20,religion:15,mobilise:30,peace:15};
