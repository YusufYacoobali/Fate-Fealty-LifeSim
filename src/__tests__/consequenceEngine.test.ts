import { applyEffects, killPlayer, legacyScore } from '@/engine/consequenceEngine';
import { makeState } from './helpers';

describe('consequenceEngine.applyEffects', () => {
  it('adds stats and clamps to [0,100]', () => {
    const s = makeState({ stats: { health: 95, charm: 5, wits: 50, faith: 50 } });
    applyEffects(s, { health: 20, charm: -20 });
    expect(s.stats.health).toBe(100);
    expect(s.stats.charm).toBe(0);
  });

  it('does not scale positive changes by difficulty', () => {
    const brutal = makeState({ stats: { health: 50, charm: 50, wits: 50, faith: 50 } }, 'Brutal');
    applyEffects(brutal, { health: 10 });
    expect(brutal.stats.health).toBe(60);
  });

  it('scales NEGATIVE changes harder on Brutal and softer on Merciful', () => {
    const brutal = makeState({ stats: { health: 50, charm: 50, wits: 50, faith: 50 } }, 'Brutal');
    const merciful = makeState({ stats: { health: 50, charm: 50, wits: 50, faith: 50 } }, 'Merciful');
    applyEffects(brutal, { health: -10 }); // -10 * 1.3 = -13
    applyEffects(merciful, { health: -10 }); // -10 * 0.8 = -8
    expect(brutal.stats.health).toBe(37);
    expect(merciful.stats.health).toBe(42);
    // Brutal must always bite harder than Merciful for the same hit.
    expect(brutal.stats.health).toBeLessThan(merciful.stats.health);
  });

  it('floors gold at 0 and tracks income/expenses', () => {
    const s = makeState({ gold: 5, income: 0, expenses: 0 });
    applyEffects(s, { gold: 10 });
    expect(s.gold).toBe(15);
    expect(s.income).toBe(10);
    applyEffects(s, { gold: -100 });
    expect(s.gold).toBe(0);
    expect(s.expenses).toBe(15);
  });

  it('clamps reputation to [-100,100] and accumulates path progress', () => {
    const s = makeState({ reputation: 95 });
    applyEffects(s, { reputation: 50, path: { martial: 4 } });
    expect(s.reputation).toBe(100);
    expect(s.paths.martial).toBe(4);
  });

  it('adds/removes tags, records memories, shifts kin relationships', () => {
    const s = makeState();
    applyEffects(s, { addTags: ['married'], memory: { tag: 'wed', weight: 2 }, kinRel: { id: 'goose', delta: -5 } });
    expect(s.tags).toContain('married');
    expect(s.memories.some((m) => m.tag === 'wed')).toBe(true);
    const goose = s.kin.find((k) => k.id === 'goose')!;
    expect(goose.rel).toBe(90);
    applyEffects(s, { removeTags: ['married'] });
    expect(s.tags).not.toContain('married');
  });

  it('kills the player on death effect only when permadeath is on', () => {
    const on = makeState();
    applyEffects(on, { death: 'tested to death' });
    expect(on.dead).toBe(true);
    expect(on.deathCause).toBe('tested to death');

    const off = makeState();
    off.settings.permadeath = false;
    applyEffects(off, { death: 'should not die' });
    expect(off.dead).toBe(false);
  });

  it('killPlayer is idempotent (keeps first cause)', () => {
    const s = makeState();
    killPlayer(s, 'first');
    killPlayer(s, 'second');
    expect(s.deathCause).toBe('first');
  });

  it('legacyScore returns a finite number', () => {
    expect(Number.isFinite(legacyScore(makeState()))).toBe(true);
  });
});
