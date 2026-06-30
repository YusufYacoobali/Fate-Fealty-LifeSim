import {
  isIncapacitated,
  tickAilments,
  tickImprisonment,
  tickKinMortality,
} from '@/engine/lifecycleEngine';
import { doActivity } from '@/engine/activityEngine';
import { interactKin } from '@/engine/kinEngine';
import { spawnKin } from '@/engine/kinFactory';
import { addTag } from '@/engine/gameState';
import { makeState } from './helpers';

describe('illness state', () => {
  it('drains health each year while ill and eventually clears', () => {
    const s = makeState({ stats: { health: 80, charm: 50, wits: 50, faith: 50 } });
    addTag(s, 'ill');
    const start = s.stats.health;
    let guard = 0;
    while (s.tags.includes('ill') && guard < 200) {
      tickAilments(s);
      guard++;
    }
    expect(s.tags).not.toContain('ill');
    expect(s.stats.health).toBeLessThan(start);
  });

  it('the herbalist cures an ongoing illness', () => {
    const s = makeState({ gold: 10 });
    addTag(s, 'ill');
    doActivity(s, 'herbalist');
    expect(s.tags).not.toContain('ill');
  });
});

describe('imprisonment state', () => {
  it('blocks free activities while imprisoned', () => {
    const s = makeState({ gold: 10, stats: { health: 50, charm: 50, wits: 50, faith: 50 } });
    addTag(s, 'imprisoned');
    expect(isIncapacitated(s)).toBe(true);
    const goldBefore = s.gold;
    doActivity(s, 'fields'); // would normally earn gold
    expect(s.gold).toBe(goldBefore);
    expect(s.feed[s.feed.length - 1].tag).toBe('IMPRISONED');
  });

  it('eventually releases the prisoner', () => {
    const s = makeState();
    addTag(s, 'imprisoned');
    let guard = 0;
    while (s.tags.includes('imprisoned') && guard < 200) {
      tickImprisonment(s);
      guard++;
    }
    expect(s.tags).not.toContain('imprisoned');
    expect(s.tags).toContain('ex_convict');
  });
});

describe('kin mortality', () => {
  it('an elderly spouse eventually dies, leaving the player widowed', () => {
    const s = makeState();
    addTag(s, 'married');
    const spouse = spawnKin(s, { kind: 'spouse', age: 95 });
    let guard = 0;
    while (spouse.alive && guard < 300) {
      tickKinMortality(s);
      guard++;
    }
    expect(spouse.alive).toBe(false);
    expect(s.tags).toContain('widowed');
    expect(s.tags).not.toContain('married');
  });

  it('young kin do not die of old age', () => {
    const s = makeState();
    const sibling = spawnKin(s, { kind: 'sibling', age: 20 });
    for (let i = 0; i < 50; i++) tickKinMortality(s);
    expect(sibling.alive).toBe(true);
  });
});

describe('divorce', () => {
  it('removes the spouse from the household and clears the married tag', () => {
    const s = makeState();
    addTag(s, 'married');
    const spouse = spawnKin(s, { kind: 'spouse' });
    interactKin(s, spouse.id, 'divorce');
    expect(s.kin.find((k) => k.id === spouse.id)!.alive).toBe(false);
    expect(s.tags).not.toContain('married');
    expect(s.tags).toContain('divorced');
  });

  it('divorce only applies to spouses', () => {
    const s = makeState();
    const before = s.kin.find((k) => k.id === 'mother')!.alive;
    interactKin(s, 'mother', 'divorce');
    expect(s.kin.find((k) => k.id === 'mother')!.alive).toBe(before);
  });
});
