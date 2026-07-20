import { characterCreationBottomPadding } from '@/components/modals/CharacterCreation';

describe('character creation layout', () => {
  it('adds the Android navigation guard below the final button', () => {
    expect(characterCreationBottomPadding(0, 40)).toBe(68);
  });

  it('uses a larger reported safe-area inset when present', () => {
    expect(characterCreationBottomPadding(64, 40)).toBe(92);
  });
});
