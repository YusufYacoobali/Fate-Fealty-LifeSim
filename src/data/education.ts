import type { EducationTrackId, Qualification, BirthOriginId } from '@/types/game';
import type { SkillId } from '@/types/rpg';
export interface EducationTrack {
  id: EducationTrackId; name: string; minAge: number; completionAge: number; years: number;
  fee: number; origins: BirthOriginId[]; mentorCareer: string; skill: SkillId; qualifications: Qualification[];
}
export const EDUCATION_TRACKS: readonly EducationTrack[] = [
  { id: 'household', name: 'Household learning', minAge: 5, completionAge: 9, years: 1, fee: 0, origins: [], mentorCareer: 'tenant_farmer', skill: 'husbandry', qualifications: [] },
  { id: 'parish', name: 'Parish learning', minAge: 5, completionAge: 9, years: 1, fee: 3, origins: ['church'], mentorCareer: 'cleric', skill: 'scholarship', qualifications: ['literacy'] },
  { id: 'guild', name: 'Guild apprenticeship', minAge: 9, completionAge: 14, years: 3, fee: 12, origins: ['artisan', 'merchant'], mentorCareer: 'master_artisan', skill: 'craftsmanship', qualifications: ['literacy', 'apprenticeship', 'guild_recommendation'] },
  { id: 'cathedral', name: 'Cathedral education', minAge: 9, completionAge: 16, years: 3, fee: 14, origins: ['church'], mentorCareer: 'prior', skill: 'scholarship', qualifications: ['literacy', 'clerical_learning'] },
  { id: 'martial', name: 'Page and squire training', minAge: 9, completionAge: 16, years: 3, fee: 12, origins: ['military', 'noble', 'royal'], mentorCareer: 'guard', skill: 'arms', qualifications: ['martial_training'] },
  { id: 'noble', name: 'Noble tutoring', minAge: 5, completionAge: 16, years: 3, fee: 20, origins: ['noble', 'royal'], mentorCareer: 'steward', skill: 'scholarship', qualifications: ['literacy', 'court_education'] },
];
export const educationTrack = (id: EducationTrackId) => EDUCATION_TRACKS.find(t => t.id === id)!;
