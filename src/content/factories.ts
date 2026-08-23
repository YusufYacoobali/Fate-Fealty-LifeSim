import { ActivityDef, CareerDef, GameEvent } from '@/types/game';
import { StoryTemplate } from './persistentStories';
import { HealthConditionDef } from './healthConditions';

export function defineEvent<const T extends GameEvent>(event: T): T {
  return event;
}

export function defineStory<const T extends StoryTemplate>(story: T): T {
  return story;
}

export function defineActivity<const T extends ActivityDef>(activity: T): T {
  return activity;
}

export function defineCareer<const T extends CareerDef>(career: T): T {
  return career;
}

export function defineHealthCondition<const T extends HealthConditionDef>(condition: T): T {
  return condition;
}
