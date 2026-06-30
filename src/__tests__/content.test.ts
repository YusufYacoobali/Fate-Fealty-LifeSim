import { ALL_EVENTS, EVENTS_BY_ID } from '@/content';
import { createLife } from '@/engine/gameState';

const KNOWN_KIN_IDS = new Set(createLife().kin.map((k) => k.id));

describe('content integrity', () => {
  it('has no duplicate event ids', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const e of ALL_EVENTS) {
      if (seen.has(e.id)) dupes.push(e.id);
      seen.add(e.id);
    }
    expect(dupes).toEqual([]);
  });

  it('every outcome `next` pointer resolves to a real event', () => {
    const broken: string[] = [];
    for (const e of ALL_EVENTS) {
      for (const c of e.choices) {
        for (const o of [c.outcome, c.success, c.failure]) {
          if (o?.next && !EVENTS_BY_ID[o.next]) broken.push(`${e.id} -> ${o.next}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('every kinRel effect references a known kin id', () => {
    const bad: string[] = [];
    for (const e of ALL_EVENTS) {
      for (const c of e.choices) {
        for (const o of [c.outcome, c.success, c.failure]) {
          const id = o?.effects?.kinRel?.id;
          if (id && !KNOWN_KIN_IDS.has(id)) bad.push(`${e.id}:${id}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('every choice has at least one resolvable outcome', () => {
    const bad: string[] = [];
    for (const e of ALL_EVENTS) {
      for (let i = 0; i < e.choices.length; i++) {
        const c = e.choices[i];
        const hasOutcome = !!c.outcome || (!!c.success && !!c.failure);
        if (!hasOutcome) bad.push(`${e.id}[${i}]`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('arc nodes are flagged arcNodeOnly and standalone events are not', () => {
    for (const e of ALL_EVENTS) {
      if (e.id.startsWith('arc_')) expect(e.arcNodeOnly).toBe(true);
    }
  });
});
