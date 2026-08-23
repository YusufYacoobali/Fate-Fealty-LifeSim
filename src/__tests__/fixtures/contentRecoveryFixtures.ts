import { PendingEvent, ScheduledConsequence, StoryInstance } from '@/types/game';

export const RENAMED_CONTENT_FIXTURE: {
  story: StoryInstance;
  pendingEvent: PendingEvent;
  consequence: ScheduledConsequence;
} = {
  story: {
    id: 'fixture_renamed_story', templateId: 'rival_rise', scale: 'major', status: 'active',
    bindings: { rival: 'sir_roderick', patron: 'aldric' }, variables: {}, currentBeatId: 'confrontation',
    startedYear: 1320, nextEligibleYear: 1321, lastBeatYear: 1320, generationStarted: 1,
  },
  pendingEvent: { eventId: 'story_rivals_1', storyInstanceId: 'fixture_renamed_story' },
  consequence: {
    id: 'fixture_old_consequence', dueYear: 1400, scope: 'world', targetIds: [],
    resolution: { type: 'history_entry', historyType: 'fixture', summary: 'A renamed descriptor survived.', salience: 1 } as never,
    explanation: 'A fixture from older content.',
  },
};

export const REMOVED_CONTENT_FIXTURE = {
  pendingEventId: 'fixture_removed_event',
  beatId: 'fixture_removed_beat',
  consequenceType: 'fixture_removed_consequence',
} as const;
