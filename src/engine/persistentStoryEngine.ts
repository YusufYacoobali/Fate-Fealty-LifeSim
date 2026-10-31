/** Retired narrative scheduler. Exports remain for old callers and saved content tooling. */
import type { GameEvent, GameState, StoryInstance } from '@/types/game';
export function maybeStartMajorStory(_state:GameState):StoryInstance|null { return null; }
export function maybeStartSupportingStory(_state:GameState):StoryInstance|null { return null; }
export function maybeStartRelationshipStory(_state:GameState):StoryInstance|null { return null; }
export function duePersistentStoryEvent(_state:GameState):GameEvent|null { return null; }
export function onPersistentStoryChoiceResolved(_state:GameState,_choiceId:string):void {}
