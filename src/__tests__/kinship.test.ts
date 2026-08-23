import { GameState } from '@/types/game';
import { isCloseBlood, isFamilyTie, kinshipMap, kinshipTo } from '@/engine/kinship';
import { contextualActions, isRomanceEligible, relationMatchesFilter } from '@/engine/relationshipEngine';
import { spawnKin } from '@/engine/kinFactory';
import { makeState } from './helpers';

/** Give the player a sibling the way the world does: a birth to the same parents. */
function bornSibling(state: GameState, id: string, gender: 'woman' | 'man') {
  const sibling = spawnKin(state, { kind: 'acquaintance', name: id, age: 20, gender });
  sibling.parentIds = ['mother', 'father'];
  for (const parentId of ['mother', 'father']) {
    const parent = state.world.characters[parentId];
    parent.childIds = [...(parent.childIds ?? []), sibling.id];
  }
  return sibling;
}

describe('kinship from the genealogy', () => {
  it('names the starting parents', () => {
    const s = makeState();
    expect(kinshipTo(s, 'mother')).toBe('mother');
    expect(kinshipTo(s, 'father')).toBe('father');
  });

  it('recognises a sibling born in the world, not just one labelled as such', () => {
    const s = makeState({ age: 22 });
    const wulfric = bornSibling(s, 'Wulfric', 'man');
    // This is the exact case the family tree and the kin list used to disagree on:
    // real blood, but the legacy `kind` still says acquaintance.
    expect(wulfric.kind).toBe('acquaintance');
    expect(kinshipTo(s, wulfric.id)).toBe('brother');
    expect(isFamilyTie(kinshipTo(s, wulfric.id))).toBe(true);
  });

  it('gives a spawned sibling the parents that make it one', () => {
    const s = makeState({ age: 22 });
    const beatrix = spawnKin(s, { kind: 'sibling', name: 'Beatrix', gender: 'woman', age: 20 });
    expect(beatrix.parentIds).toEqual(expect.arrayContaining(['mother', 'father']));
    expect(kinshipTo(s, beatrix.id)).toBe('sister');
  });

  it('agrees with the map used by the family tree', () => {
    const s = makeState({ age: 22 });
    const brother = bornSibling(s, 'Wulfric', 'man');
    const sister = spawnKin(s, { kind: 'sibling', name: 'Beatrix', gender: 'woman', age: 20 });
    const map = kinshipMap(s);

    // Both views must place both people, and place them identically.
    expect(map[brother.id]).toBe(kinshipTo(s, brother.id));
    expect(map[sister.id]).toBe(kinshipTo(s, sister.id));
    expect([map[brother.id], map[sister.id]]).toEqual(['brother', 'sister']);
  });

  it('walks out to grandchildren, nieces and cousins', () => {
    const s = makeState({ age: 40 });
    const child = spawnKin(s, { kind: 'child', name: 'Alys', gender: 'woman', age: 20 });
    const grandchild = spawnKin(s, { kind: 'acquaintance', name: 'Wren', gender: 'man', age: 1 });
    grandchild.parentIds = [child.id];
    child.childIds = [grandchild.id];

    const sibling = bornSibling(s, 'Wulfric', 'man');
    const niece = spawnKin(s, { kind: 'acquaintance', name: 'Edith', gender: 'woman', age: 5 });
    niece.parentIds = [sibling.id];
    sibling.childIds = [niece.id];

    expect(kinshipTo(s, grandchild.id)).toBe('grandson');
    expect(kinshipTo(s, niece.id)).toBe('niece');
  });

  it('puts blood kin in the family filter', () => {
    const s = makeState({ age: 22 });
    const brother = bornSibling(s, 'Wulfric', 'man');
    const kin = s.kin.find((member) => member.id === brother.id)!;
    expect(relationMatchesFilter(s, kin, 'family')).toBe(true);
  });
});

describe('kinship guards the romance rules', () => {
  it('refuses to let the player court their own sibling', () => {
    const s = makeState({ age: 24, attraction: 'women' });
    const sister = bornSibling(s, 'Beatrix', 'woman');
    sister.attraction = 'men';
    const kin = s.kin.find((member) => member.id === sister.id)!;

    expect(isCloseBlood(kinshipTo(s, sister.id))).toBe(true);
    expect(isRomanceEligible(s, kin)).toBe(false);
    expect(contextualActions(s, kin)).not.toContain('propose');
  });

  it('still allows an unrelated villager', () => {
    const s = makeState({ age: 24, attraction: 'women' });
    const agnes = s.kin.find((member) => member.id === 'agnes')!;
    agnes.age = 24;
    agnes.attraction = 'men';
    agnes.gender = 'woman';

    expect(isRomanceEligible(s, agnes)).toBe(true);
    expect(contextualActions(s, agnes)).toContain('propose');
  });
});
