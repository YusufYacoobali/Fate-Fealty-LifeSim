import { applyChoice, popReadyArc, queueArc } from '@/engine/storyGraph';
import { GameEvent } from '@/types/game';
import { makeState } from './helpers';

const leaf: GameEvent = {
  id: 'test_leaf',
  category: 'arc',
  arcNodeOnly: true,
  title: 'LEAF',
  text: 'leaf node',
  choices: [{ label: 'ok', outcome: { text: 'done', effects: { wits: 1 } } }],
};

const root: GameEvent = {
  id: 'test_root',
  category: 'peasant',
  title: 'ROOT',
  text: 'root',
  once: true,
  choices: [
    { label: 'good roll', successChance: 1, success: { text: 'won', effects: { gold: 5 } }, failure: { text: 'lost', effects: { gold: -5 } } },
    { label: 'bad roll', successChance: 0, success: { text: 'won', effects: { gold: 5 } }, failure: { text: 'lost', effects: { gold: -5 } } },
  ],
};

function present(s:ReturnType<typeof makeState>,event:GameEvent,choice:GameEvent['choices'][number]){s.pendingEvent={eventId:event.id};return applyChoice(s,event,choice);}

describe('storyGraph.applyChoice', () => {
  it('applies a deterministic outcome and closes the event', () => {
    const s = makeState({ gold: 10 });
    present(s, leaf, leaf.choices[0]);
    expect(s.stats.wits).toBe(51);
    expect(s.pendingEvent).toBeNull();
    expect(s.feed[s.feed.length - 1].text).toBe('done');
  });

  it('honours successChance 1 (success) and 0 (failure)', () => {
    const win = makeState({ gold: 10 });
    present(win, root, root.choices[0]);
    expect(win.gold).toBe(15);

    const lose = makeState({ gold: 10 });
    present(lose, root, root.choices[1]);
    expect(lose.gold).toBe(5);
  });

  it('records once-events in firedOnce', () => {
    const s = makeState();
    present(s, root, root.choices[0]);
    expect(s.firedOnce).toContain('test_root');
  });
});

describe('storyGraph arc queueing', () => {
  it('legacy queueArc cannot create a future chapter', () => {
    const s = makeState({ age: 5 });
    queueArc(s, 'war', 'arc_war_1');
    // Same year: not ready yet.
    expect(popReadyArc(s)).toBeNull();
    s.age = 6;
    const node = popReadyArc(s);
    expect(node).toBeNull();
    // Consumed.
    expect(s.activeArcs.length).toBe(0);
  });

  it('a real chained outcome (next: now) opens the follow-up immediately', () => {
    // knight_oath -> arc_war_1 via "ride to war" (nextWhen now).
    const s = makeState({ age: 20, rankIdx: 2 });
    const { ALL_EVENTS } = require('@/content');
    const oath: GameEvent = ALL_EVENTS.find((e: GameEvent) => e.id === 'knight_oath');
    const rideChoice = oath.choices[0];
    const result = present(s, oath, rideChoice);
    expect(result.openNow?.id).toBe('arc_war_2');
    expect(s.pendingEvent?.eventId).toBe('arc_war_2');
  });
});
