import { applyEffects } from '@/engine/consequenceEngine';
import { killKin, spawnKin } from '@/engine/kinFactory';
import { buildDeathSummary } from '@/engine/deathEngine';
import { makeState } from './helpers';

describe('kinFactory', () => {
  it('spawnKin appends a member with a unique id and filled defaults', () => {
    const s = makeState();
    const before = s.kin.length;
    const child = spawnKin(s, { kind: 'child', isHeir: true });
    expect(s.kin.length).toBe(before + 1);
    expect(child.id).toMatch(/^kin_/);
    expect(child.kind).toBe('child');
    expect(child.isHeir).toBe(true);
    expect(child.name).toBeTruthy();
    expect(child.alive).toBe(true);
  });

  it('explicit spec fields override the defaults', () => {
    const s = makeState();
    const spouse = spawnKin(s, { kind: 'spouse', name: 'Aderyn', role: 'Noble Spouse', rel: 42 });
    expect(spouse.name).toBe('Aderyn');
    expect(spouse.role).toBe('Noble Spouse');
    expect(spouse.rel).toBe(42);
  });

  it('killKin by id marks the member deceased', () => {
    const s = makeState();
    const dead = killKin(s, 'goose');
    expect(dead?.id).toBe('goose');
    expect(s.kin.find((k) => k.id === 'goose')!.alive).toBe(false);
  });

  it('killKin by kind kills the first living match', () => {
    const s = makeState();
    expect(killKin(s, 'mother')?.kind).toBe('mother');
    expect(s.kin.find((k) => k.kind === 'mother')!.alive).toBe(false);
  });
});

describe('addKin / killKin via the consequence engine', () => {
  it('addKin (single and array) creates kin', () => {
    const s = makeState();
    const before = s.kin.length;
    applyEffects(s, { addKin: { kind: 'spouse' } });
    applyEffects(s, { addKin: [{ kind: 'child' }, { kind: 'child' }] });
    expect(s.kin.length).toBe(before + 3);
  });

  it('a newborn becomes a counted heir in the death summary', () => {
    const s = makeState({ gold: 5 });
    applyEffects(s, { addKin: { kind: 'child', isHeir: true } });
    const sum = buildDeathSummary(s, 'Peasant');
    expect(sum.heirs).toBe(1);
  });

  it('killKin removes the member from the living roster', () => {
    const s = makeState();
    applyEffects(s, { killKin: 'roderick' });
    expect(s.kin.find((k) => k.id === 'roderick')!.alive).toBe(false);
  });
});
