import { gameReducer } from '@/state/gameReducer';
import { SHOP_ITEMS } from '@/data/shop';
import { makeState } from './helpers';

describe('gameReducer', () => {
  it('AGE_UP advances the year', () => {
    const s0 = makeState({ age: 3 });
    const s1 = gameReducer(s0, { type: 'AGE_UP' });
    expect(s1.age).toBe(4);
    expect(s0.age).toBe(3); // original not mutated
  });

  it('SET_TAB switches tabs and clears the selected kin', () => {
    const s = gameReducer(makeState({ selectedKinId: 'goose' }), { type: 'SET_TAB', tab: 'shop' });
    expect(s.tab).toBe('shop');
    expect(s.selectedKinId).toBeNull();
  });

  it('BUY a consumable spends gold and applies its effect', () => {
    const bread = SHOP_ITEMS.find((i) => i.id === 'bread')!;
    const s = gameReducer(makeState({ gold: 10, stats: { health: 50, charm: 50, wits: 50, faith: 50 } }), { type: 'BUY', item: bread });
    expect(s.gold).toBe(8);
    expect(s.stats.health).toBe(54);
  });

  it('BUY a perm item adds it to inventory once', () => {
    const tunic = SHOP_ITEMS.find((i) => i.id === 'tunic')!;
    let s = gameReducer(makeState({ gold: 50 }), { type: 'BUY', item: tunic });
    expect(s.inventory).toContain('tunic');
    const goldAfterFirst = s.gold;
    s = gameReducer(s, { type: 'BUY', item: tunic }); // second buy refused
    expect(s.gold).toBe(goldAfterFirst);
    expect(s.inventory.filter((i) => i === 'tunic').length).toBe(1);
  });

  it('KIN_INTERACT praise raises the relationship', () => {
    const base = makeState();
    const before = base.kin.find((k) => k.id === 'goose')!.rel;
    const s = gameReducer(base, { type: 'KIN_INTERACT', id: 'goose', action: 'praise' });
    expect(s.kin.find((k) => k.id === 'goose')!.rel).toBeGreaterThanOrEqual(before);
  });

  it('NEW_LIFE resets to age 0 and increments the dynasty counter', () => {
    const s = gameReducer(makeState({ age: 40, lifeNo: 2 }), { type: 'NEW_LIFE' });
    expect(s.age).toBe(0);
    expect(s.lifeNo).toBe(3);
  });

  it('NEW_LIFE honours chosen name, birth trait and difficulty', () => {
    const s = gameReducer(makeState(), {
      type: 'NEW_LIFE',
      options: { firstName: 'Wulfgar', birthTraitId: 'lucky', difficulty: 'Brutal' },
    });
    expect(s.first).toBe('Wulfgar');
    expect(s.traits).toEqual(['lucky']);
    expect(s.tags).toContain('trait_lucky');
    expect(s.settings.difficulty).toBe('Brutal');
  });

  it('NEW_LIFE with a blank name falls back to a random one', () => {
    const s = gameReducer(makeState(), { type: 'NEW_LIFE', options: { firstName: '   ' } });
    expect(s.first.length).toBeGreaterThan(0);
  });

  it('CONTINUE_AS_HEIR carries forward half the gold', () => {
    const s = gameReducer(makeState({ age: 50, gold: 80 }), { type: 'CONTINUE_AS_HEIR' });
    expect(s.age).toBe(0);
    expect(s.gold).toBe(8 + 40); // base starting gold + inherited half
  });
});
