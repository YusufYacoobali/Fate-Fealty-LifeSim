import { isEventEligible, meetsCondition } from '@/engine/eventPicker';
import { applyChoice } from '@/engine/storyGraph';
import { doActivity } from '@/engine/activityEngine';
import { spawnKin, killKin } from '@/engine/kinFactory';
import { EVENTS_BY_ID } from '@/content';
import { KinKind } from '@/types/game';
import { makeState } from './helpers';

const living = (s: ReturnType<typeof makeState>, kind: KinKind) =>
  s.kin.filter((k) => k.alive && k.kind === kind).length;

describe('kin roster conditions (engine tweak)', () => {
  it('hasKinOfKind requires a LIVING kin of that kind', () => {
    const s = makeState();
    expect(meetsCondition(s, { hasKinOfKind: ['mother'] })).toBe(true);
    expect(meetsCondition(s, { hasKinOfKind: ['sibling'] })).toBe(false);
    killKin(s, 'mother');
    expect(meetsCondition(s, { hasKinOfKind: ['mother'] })).toBe(false);
  });

  it('kinCountAtMost caps by LIVING kin of a kind', () => {
    const s = makeState(); // starts with goose = 1 friend, roderick = 1 foe
    expect(meetsCondition(s, { kinCountAtMost: { friend: 1 } })).toBe(true);
    spawnKin(s, { kind: 'friend' });
    expect(meetsCondition(s, { kinCountAtMost: { friend: 1 } })).toBe(false);
    // A dead friend no longer counts against the cap.
    killKin(s, 'goose');
    expect(meetsCondition(s, { kinCountAtMost: { friend: 1 } })).toBe(true);
  });
});

describe('companion events add people to the Kin tab', () => {
  it('a sibling is born only while mother lives and no sibling exists', () => {
    const ev = EVENTS_BY_ID['family_sibling_born'];
    const s = makeState({ age: 5 });
    expect(isEventEligible(s, ev)).toBe(true);

    const orphaned = makeState({ age: 5 });
    killKin(orphaned, 'mother');
    expect(isEventEligible(orphaned, ev)).toBe(false);

    const already = makeState({ age: 5 });
    spawnKin(already, { kind: 'sibling' });
    expect(isEventEligible(already, ev)).toBe(false);
  });

  it('choosing to rejoice adds a living sibling', () => {
    const ev = EVENTS_BY_ID['family_sibling_born'];
    const s = makeState({ age: 5 });
    s.pendingEvent={eventId:ev.id};applyChoice(s, ev, ev.choices[0]);
    expect(living(s, 'sibling')).toBe(1);
  });

  it('the childhood friend event respects the friend cap (goose included)', () => {
    const ev = EVENTS_BY_ID['child_first_friend'];
    const s = makeState({ age: 9 });
    expect(isEventEligible(s, ev)).toBe(true); // goose = 1 friend, cap is 1
    spawnKin(s, { kind: 'friend' });
    expect(isEventEligible(s, ev)).toBe(false); // now 2 friends > cap
  });

  it('sharing the turnip gains a childhood friend', () => {
    const ev = EVENTS_BY_ID['child_first_friend'];
    const s = makeState({ age: 9 });
    const before = living(s, 'friend');
    s.pendingEvent={eventId:ev.id};applyChoice(s, ev, ev.choices[0]);
    expect(living(s, 'friend')).toBe(before + 1);
  });

  it('the jealous rival event is capped by existing foes', () => {
    const ev = EVENTS_BY_ID['peasant_jealous_rival'];
    const s = makeState({ age: 20, reputation: 10 });
    expect(isEventEligible(s, ev)).toBe(true); // roderick = 1 foe, cap 1
    spawnKin(s, { kind: 'foe' });
    expect(isEventEligible(s, ev)).toBe(false);
    // And it needs a rising reputation to draw envy at all.
    const nobody = makeState({ age: 20, reputation: 0 });
    expect(isEventEligible(nobody, ev)).toBe(false);
  });

  it('letting the cooper stew creates a named rival', () => {
    const ev = EVENTS_BY_ID['peasant_jealous_rival'];
    const s = makeState({ age: 20, reputation: 10 });
    s.pendingEvent={eventId:ev.id};applyChoice(s, ev, ev.choices[1]);
    expect(s.kin.some((k) => k.alive && k.kind === 'foe' && k.name === 'Aldwin')).toBe(true);
  });

  it('the liege oath needs Knight rank and no existing liege, and adds one', () => {
    const ev = EVENTS_BY_ID['knight_liege_oath'];
    const peasant = makeState({ age: 25 });
    expect(isEventEligible(peasant, ev)).toBe(false);

    const knight = makeState({ age: 25, rankIdx: 2 });
    expect(isEventEligible(knight, ev)).toBe(true);
    knight.pendingEvent={eventId:ev.id};applyChoice(knight, ev, ev.choices[0]);
    expect(living(knight, 'liege')).toBe(1);
    // Sworn once: a second oath is no longer eligible.
    knight.firedOnce = []; // even ignoring `once`, the cap alone blocks it
    expect(isEventEligible(knight, ev)).toBe(false);
  });
});

describe('tavern friendship mechanic', () => {
  it('a tavern regular eventually makes a real friend (within the cap)', () => {
    let s = makeState({ age: 20, gold: 10 });
    const before = living(s, 'friend');
    let made = false;
    for (let i = 0; i < 400 && !made; i++) {
      s.gold = 10; // keep the ale flowing
      doActivity(s, 'tavern');
      made = living(s, 'friend') > before;
    }
    expect(made).toBe(true); // p(miss 400 rolls at 12%) ~ 0
  });

  it('never adds tavern friends beyond the cap or before adulthood', () => {
    const capped = makeState({ age: 20, gold: 10 });
    spawnKin(capped, { kind: 'friend' });
    spawnKin(capped, { kind: 'friend' });
    spawnKin(capped, { kind: 'friend' }); // goose + 3 = 4 friends, over cap
    const cappedCount = living(capped, 'friend');
    for (let i = 0; i < 200; i++) {
      capped.gold = 10;
      doActivity(capped, 'tavern');
    }
    expect(living(capped, 'friend')).toBe(cappedCount);

    const child = makeState({ age: 12, gold: 10 });
    const childCount = living(child, 'friend');
    for (let i = 0; i < 200; i++) {
      child.gold = 10;
      doActivity(child, 'tavern');
    }
    expect(living(child, 'friend')).toBe(childCount);
  });
});
