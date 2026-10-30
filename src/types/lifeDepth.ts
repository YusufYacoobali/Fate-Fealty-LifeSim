import type { CareerFamily } from './game';

export type BirthOriginId = 'peasant' | 'artisan' | 'merchant' | 'church' | 'military' | 'noble' | 'royal';
export interface BirthBackground {
  origin: BirthOriginId;
  familyId: string;
  guardianIds: string[];
  contactId?: string;
  householdWealth: number;
  inherited: boolean;
}
export type EducationTrackId = 'household' | 'parish' | 'guild' | 'cathedral' | 'martial' | 'noble';
export type Qualification = 'literacy' | 'apprenticeship' | 'guild_recommendation' | 'clerical_learning' | 'martial_training' | 'court_education';
export interface EducationState {
  track: EducationTrackId | null;
  mentorId?: string;
  classmateIds: string[];
  progress: number;
  misconduct: number;
  actionsYear: number;
  actionsUsed: number;
  qualifications: Qualification[];
  history: { track: EducationTrackId; year: number; outcome: 'completed' | 'dismissed' | 'left' }[];
  encounters: string[];
  scholarship: boolean;
  comingOfAge: boolean;
}
export type SocialEstate = 'commoner' | 'noble' | 'baronial' | 'royal';
export interface SocialStatus {
  estate: SocialEstate;
  martialHonour: 'none' | 'page' | 'squire' | 'knight';
  titles: string[];
  grants: string[];
}
export interface ProfessionalRecord {
  reputation: number;
  completedActions: string[];
  milestones: string[];
  contactIds: string[];
  rivalId?: string;
  actionsYear: number;
  actionsUsed: number;
  lastWorkedYear: number;
  matters: { id: string; actorId: string; stage: number; decision?: string; resolved: boolean }[];
}
export type ProfessionalHistory = Partial<Record<CareerFamily, ProfessionalRecord>>;
export type CourtOffice = 'chancellor' | 'treasurer' | 'marshal' | 'religious_adviser';
export interface RoyalClaim {
  characterId: string;
  throughId: string;
  basis: 'birth' | 'marriage' | 'recognition' | 'regency' | 'takeover' | 'legacy';
  strength: number;
  disinherited: boolean;
}
export interface CourtState {
  rulerId: string;
  heirId?: string;
  regentId?: string;
  offices: Partial<Record<CourtOffice, string>>;
  claims: RoyalClaim[];
  treasury: number;
  legitimacy: number;
  lastTickYear: number;
  actionsYear: number;
  actionsUsed: number;
  records: { year: number; kind: string; actorId: string; targetId?: string; detail: string }[];
  scandals: { office: CourtOffice; actorId: string; amount: number; exposed: boolean }[];
}
