import { agingDamage, buildDeathSummary, checkDeath } from '@/engine/deathEngine';
import { makeState } from './helpers';

describe('deathEngine', () => {
  it('kills the player when health hits 0 (permadeath on)', () => {
    const s = makeState({ stats: { health: 0, charm: 50, wits: 50, faith: 50 }, age: 20 });
    checkDeath(s);
    expect(s.dead).toBe(true);
    expect(s.deathCause).toBeTruthy();
  });

  it('floors health at 1 and never dies when permadeath is off', () => {
    const s = makeState({ stats: { health: -5 as unknown as number, charm: 50, wits: 50, faith: 50 } });
    s.settings.permadeath = false;
    checkDeath(s);
    expect(s.dead).toBe(false);
    expect(s.stats.health).toBe(1);
  });

  it('finalises an event-driven death with an epitaph + feed entry', () => {
    const s = makeState({ age: 40 });
    s.dead = true;
    s.deathCause = 'a tragic jousting accident';
    checkDeath(s);
    expect(s.epitaph).toBeTruthy();
    expect(s.feed[s.feed.length - 1].tag).toContain('THE END');
  });

  it('agingDamage is zero while young and positive when old', () => {
    expect(agingDamage(makeState({ age: 20 }))).toBe(0);
    expect(agingDamage(makeState({ age: 60 }))).toBeGreaterThan(0);
  });

  it('buildDeathSummary reports rank, gold and heirs', () => {
    const s = makeState({ gold: 42, deathCause: 'old age', epitaph: 'here lies a turnip' });
    s.kin.push({ id: 'child1', name: 'Wat', role: 'Heir', emoji: '🧒', rel: 80, age: 4, trait: 'small', bio: '', kind: 'child', alive: true });
    const sum = buildDeathSummary(s, 'Knight');
    expect(sum.rank).toBe('Knight');
    expect(sum.gold).toBe(42);
    expect(sum.heirs).toBe(1);
  });
});
