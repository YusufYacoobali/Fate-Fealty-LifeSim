import type { CareerFamily } from './game';

export type BirthOriginId = 'peasant' | 'artisan' | 'merchant' | 'church' | 'military' | 'noble' | 'royal';
export interface BirthBackground {
  circumstance?: string;
  origin: BirthOriginId;
  familyId: string;
  guardianIds: string[];
  contactId?: string;
  householdWealth: number;
  inherited: boolean;
}
export type EducationTrackId = 'household' | 'parish' | 'guild' | 'cathedral' | 'martial' | 'noble';
export type Qualification = 'literacy' | 'apprenticeship' | 'guild_recommendation' | 'clerical_learning' | 'martial_training' | 'court_education';
export type SponsorshipKind = 'parish_charity' | 'merit' | 'patron' | 'household';
export interface EducationSponsorship {
  id: string; kind: SponsorshipKind | 'legacy'; track: EducationTrackId | 'all'; sponsorId?: string;
  status: 'awarded' | 'spent'; year: number; covered: number | null; remaining: number | null;
}
export interface EducationState {
  sponsorships?: EducationSponsorship[];
  applications?: { kind: SponsorshipKind; track: EducationTrackId; year: number; approved: boolean; reason: string }[];
  activeClassmateIds?: string[];
  formerMentorIds?: string[];
  mode?: 'childhood' | 'adult';
  fraudulentCredentials?: { qualification: Qualification; mentorId?: string; reviewYear: number; resolved: boolean }[];
  track: EducationTrackId | null;
  mentorId?: string;
  startedYear?: number;
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
  adviserId?: string;
  patientCare?: PatientCareRecord[];
  lastCareReviewYear?: number;
  actionYears?: Record<string, number>;
  rivalryYear?: number;
  shifts?: number;
  apprenticeId?: string;
  reputation: number;
  completedActions: string[];
  milestones: string[];
  contactIds: string[];
  rivalId?: string;
  actionsYear: number;
  actionsUsed: number;
  lastWorkedYear: number;
  matters: { kind?: 'practice'; ownerId?: string; requiredPremium?: boolean; success?: boolean; id: string; actorId: string; stage: number; openedYear?: number; decision?: string; resolved: boolean }[];
}
export interface PatientCareRecord {
  id: string;
  patientId: string;
  clinicianId: string;
  adviserId?: string;
  startedYear: number;
  reviewYear: number;
  reviewedYear?: number;
  baselineHealth: number;
  conditions: { id: string; conditionId: string; severity: number; kind: 'illness' | 'injury' | 'disability' }[];
  treatmentSucceeded: boolean;
  status: 'awaiting_review' | 'recovered' | 'improved' | 'stable' | 'declined' | 'deceased' | 'unavailable';
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
  petition?: { applicantId: string; rulerId: string; office: CourtOffice; incumbentId?: string; rivalId?: string; year: number; resolved: boolean; outcome?: 'appointed' | 'rejected' | 'conditional' | 'withdrawn' | 'retained'; requiredStanding?: number };
  coalitions?: { leaderId: string; memberIds: string[]; claimantId?: string; strength: number; lastMoveYear: number; lastAudienceYear?: number }[];

  formerRegentId?: string;
  lastActionYears?: Record<string, number>;
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
  scandals: { office: CourtOffice; actorId: string; amount: number; exposed: boolean; resolved?: boolean }[];
}
