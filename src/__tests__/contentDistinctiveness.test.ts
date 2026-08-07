import { ALL_EVENTS, AMBIENT_EVENTS } from '@/content';
import { QUALITY_CHAIN_SPECS } from '@/content/qualityAmbientEvents';
import { PERSISTENT_STORY_TEMPLATES } from '@/content/persistentStories';
import { ANNUAL_MESSAGES } from '@/content/annualMessages';
import { STORY_PRESENTATION } from '@/content/storyPresentation';
import { FLAGSHIP_STORY_COPY } from '@/content/stories/flagship';
import { ROLE_STORY_COPY } from '@/content/stories/roles';
import { RELATIONSHIP_STORY_COPY } from '@/content/stories/relationships';
import { DOMAIN_STORY_COPY } from '@/content/stories/domains';

/**
 * The content used to be generated in bulk: 97 ambient events shared one pair of
 * choices, and 33 story nodes shared another. Counts alone could not catch that,
 * so these guard the shape of the writing rather than the amount of it.
 */
describe('content distinctiveness', () => {
  it('no choice label is offered by more than six events', () => {
    const uses = new Map<string, string[]>();
    for (const event of ALL_EVENTS) {
      for (const choice of event.choices) {
        uses.set(choice.label, [...(uses.get(choice.label) ?? []), event.id]);
      }
    }
    const overused = [...uses].filter(([, ids]) => ids.length > 6).map(([label, ids]) => `${label} (${ids.length})`);
    expect(overused).toEqual([]);
  });

  it('no outcome passage is reused by more than six events', () => {
    const uses = new Map<string, number>();
    for (const event of ALL_EVENTS) {
      for (const choice of event.choices) {
        for (const outcome of [choice.outcome, choice.success, choice.failure]) {
          if (outcome?.text) uses.set(outcome.text, (uses.get(outcome.text) ?? 0) + 1);
        }
      }
    }
    const overused = [...uses].filter(([, n]) => n > 6).map(([text, n]) => `${text.slice(0, 50)} (${n})`);
    expect(overused).toEqual([]);
  });

  it('no story beat body is shared between two different stories', () => {
    const arcNodes = ALL_EVENTS.filter((event) => event.arcNodeOnly && typeof event.text === 'string');
    const byText = new Map<string, string[]>();
    for (const node of arcNodes) {
      const text = node.text as string;
      byText.set(text, [...(byText.get(text) ?? []), node.arc ?? node.id]);
    }
    const shared = [...byText].filter(([, arcs]) => new Set(arcs).size > 1);
    expect(shared.map(([text]) => text.slice(0, 60))).toEqual([]);
  });
});

describe('house style', () => {
  /** Everything a player can actually read, gathered from the copy itself. */
  function playerFacingStrings(): Array<[string, string]> {
    const out: Array<[string, string]> = [];
    for (const spec of QUALITY_CHAIN_SPECS) {
      for (const beat of spec.beats) {
        out.push([`chain ${spec.id}`, beat.title], [`chain ${spec.id}`, beat.text]);
        for (const choice of beat.choices) out.push([`chain ${spec.id}/${choice.id}`, choice.label], [`chain ${spec.id}/${choice.id}`, choice.text]);
      }
    }
    for (const copies of [FLAGSHIP_STORY_COPY, ROLE_STORY_COPY, RELATIONSHIP_STORY_COPY, DOMAIN_STORY_COPY]) {
      for (const [storyId, copy] of Object.entries(copies)) {
        for (const [key, node] of Object.entries(copy)) {
          out.push([`${storyId}/${key}`, node.title], [`${storyId}/${key}`, node.text]);
          for (const choice of node.choices) out.push([`${storyId}/${key}/${choice.id}`, choice.label], [`${storyId}/${key}/${choice.id}`, choice.text]);
        }
      }
    }
    for (const event of ALL_EVENTS) {
      out.push([event.id, event.title]);
      if (typeof event.text === 'string') out.push([event.id, event.text]);
      for (const choice of event.choices) {
        out.push([event.id, choice.label]);
        for (const outcome of [choice.outcome, choice.success, choice.failure]) {
          if (outcome?.text) out.push([event.id, outcome.text]);
          if (outcome?.effects?.memory?.note) out.push([event.id, outcome.effects.memory.note]);
        }
      }
    }
    for (const message of ANNUAL_MESSAGES) out.push([message.id, message.text]);
    for (const [id, presentation] of Object.entries(STORY_PRESENTATION)) {
      out.push([id, presentation.title]);
      for (const beat of presentation.beats) out.push([id, beat]);
    }
    // Chain and story copy is reached twice — once from the source data, once
    // from the events built out of it — so count distinct passages, not hits.
    const seen = new Set<string>();
    return out.filter(([, text]) => (seen.has(text) ? false : (seen.add(text), true)));
  }

  it('uses no em or en dashes anywhere the player can see', () => {
    const offenders = playerFacingStrings()
      .filter(([, text]) => /[—–]/.test(text))
      .map(([where, text]) => `${where}: ${text.slice(0, 70)}`);
    expect(offenders).toEqual([]);
  });

  it('gathers enough copy for that sweep to mean something', () => {
    expect(playerFacingStrings().length).toBeGreaterThan(1500);
  });

  // Two habits that made the writing feel machine-made even after it was all
  // hand-written: reaching for the same count in story after story, and ending
  // passage after passage on ", which is <abstraction>" instead of an image.
  it('does not lean on one count across unrelated passages', () => {
    const NUMBERS = 'two|three|four|five|six|seven|eight|nine|ten|twelve|thirteen|fifteen|seventeen|nineteen|twenty';
    const FUNCTION_WORD = /^(of|them|to|and|or|in|at|for|more|hundred|thirds|quarters|us|the|a)$/;
    const uses = new Map<string, number>();
    for (const [, text] of playerFacingStrings()) {
      for (const m of text.matchAll(new RegExp(`\\b(${NUMBERS}) ([a-z]+)\\b`, 'gi'))) {
        const noun = m[2].toLowerCase();
        if (FUNCTION_WORD.test(noun)) continue;
        const phrase = `${m[1].toLowerCase()} ${noun}`;
        uses.set(phrase, (uses.get(phrase) ?? 0) + 1);
      }
    }
    const overused = [...uses].filter(([, n]) => n > 16).map(([p, n]) => `${p} (${n})`);
    expect(overused).toEqual([]);
  });

  it('does not end passage after passage on a trailing abstraction', () => {
    const trailing = playerFacingStrings().filter(([, text]) => /, which is /.test(text)).length;
    expect(trailing).toBeLessThan(45);
  });
});

describe('chain integrity', () => {
  it('event titles are unique — chain gating matches on them', () => {
    const counts = new Map<string, number>();
    for (const event of ALL_EVENTS) counts.set(event.title, (counts.get(event.title) ?? 0) + 1);
    expect([...counts].filter(([, n]) => n > 1).map(([title]) => title)).toEqual([]);
  });

  it('every ambient chain beat gates on the title of the beat before it', () => {
    const byId = new Map(ALL_EVENTS.map((event) => [event.id, event]));
    const broken: string[] = [];
    for (const spec of QUALITY_CHAIN_SPECS) {
      spec.beats.forEach((beat, index) => {
        const event = byId.get(`quality_${spec.id}_${index + 1}`);
        if (!event) return broken.push(`missing quality_${spec.id}_${index + 1}`);
        if (event.title !== beat.title) broken.push(`${event.id} title drifted from its beat`);
        const gate = event.requires?.hasWorldMemoryType?.[0];
        if (index === 0) {
          if (gate) broken.push(`${event.id} is the first beat but is gated on ${gate}`);
        } else if (gate !== spec.beats[index - 1].title) {
          broken.push(`${event.id} gates on ${gate ?? 'nothing'}, expected ${spec.beats[index - 1].title}`);
        }
      });
    }
    expect(broken).toEqual([]);
  });
});

describe('story branch reachability', () => {
  // Guards against writing an ending nobody can reach: the graph looks fine,
  // but no choice on the deciding beat ever sets the variable it reads.
  it('every branch transition is produced by a choice on its own beat', () => {
    const branching = PERSISTENT_STORY_TEMPLATES.flatMap((story) =>
      Object.values(story.beats).filter((beat) => (beat.transitions ?? []).length > 0),
    );
    // If this drops to zero the reachability check below is passing vacuously.
    expect(branching.length).toBeGreaterThan(20);
  });

  it('reaches both endings of every story from its deciding beat', () => {
    const byId = new Map(ALL_EVENTS.map((event) => [event.id, event]));
    const unreachable: string[] = [];
    for (const story of PERSISTENT_STORY_TEMPLATES) {
      for (const beat of Object.values(story.beats)) {
        const event = byId.get(beat.eventId);
        if (!event) continue;
        for (const transition of beat.transitions ?? []) {
          const produced = event.choices.some((choice) => [choice.outcome, choice.success, choice.failure].some((outcome) => {
            const value = outcome?.effects?.storyVariables?.[transition.when.variable];
            return transition.when.truthy ? Boolean(value) : value === transition.when.equals;
          }));
          if (!produced) unreachable.push(`${story.id}/${beat.id} -> ${transition.beatId}`);
        }
      }
    }
    expect(unreachable).toEqual([]);
  });
});
