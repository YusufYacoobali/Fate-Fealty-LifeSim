import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { makeState } from './helpers';
import { TrainingPanel, RpgHub } from '@/components/rpg/RpgPanels';
import { ForgePlayButton } from '@/components/rpg/Workshop';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelText } from '@/components/ui/PixelText';

let mockState: ReturnType<typeof makeState>;
const mockDispatch = jest.fn();
const mockOpenShop = jest.fn();
jest.mock('@/state/GameContext', () => ({ useGame: () => ({ state: mockState, dispatch: mockDispatch }) }));
jest.mock('@/components/premium/PremiumShopContext', () => ({ useOpenPremiumShop: () => mockOpenShop }));
// These tests exercise the entry controls; animation runs inside ForgeModal.
jest.mock('react-native-reanimated', () => ({ __esModule: true, default: {} }));
jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('react-native-worklets', () => ({}));
jest.mock('@/components/rpg/ForgeScene', () => ({ ForgeScene: () => null }));
jest.mock('@/components/rpg/RpgIcon', () => ({ RpgIcon: () => null }));

let root: ReactTestRenderer;
beforeEach(() => {
  jest.clearAllMocks();
  mockState = makeState({ age: 24, gold: 200, lifetimeUnlocked: false });
  mockState.rpg.materials = { timber: 40, iron: 40, stone: 40, herbs: 40 };
  mockState.occupation = { careerId: 'artisan', experience: 0, performance: 70, workedThisYear: 0 };
});
afterEach(() => { act(() => root?.unmount()); });

function button(copy: string) {
  return root.root.findAllByType(PixelButton).find((node) => node.findAllByType(PixelText).some((text) => text.props.children === copy))!;
}

test('free training exposes working sword, anvil and sparring controls instead of Pro buttons', () => {
  act(() => { root = create(<TrainingPanel />); });
  expect(root.root.findAllByType(PixelText).some((node) => node.props.children === 'Unlock with Pro')).toBe(false);
  const controls = [
    ['ANVIL PRACTICE · 1 ACTION · 6 XP', 'FORGE_START'],
    ['SOLO SWORD PRACTICE · 1 ACTION · 6 XP', 'ARMS_PRACTICE_START'],
    ['SPAR · NO ACTION COST · AGE 8+', 'PRACTICE_DUEL'],
  ];
  for (const [copy, action] of controls) {
    const control = button(copy);
    expect(control).toBeDefined(); expect(control.props.disabled).toBeFalsy();
    act(() => control.props.onPress());
    expect(mockDispatch).toHaveBeenLastCalledWith(expect.objectContaining({ type: action }));
  }
});

test('basic quick crafting remains playable while advanced crafting opens the shop', () => {
  mockState.questSection = 'craft';
  act(() => { root = create(<RpgHub />); });
  const crafts = root.root.findAllByType(PixelButton).filter((node) => node.findAllByType(PixelText).some((text) => text.props.children === 'QUICK CRAFT · 1 ACTION'));
  expect(crafts).toHaveLength(6);
  expect(crafts.every((control) => !control.props.disabled)).toBe(true);
  act(() => crafts[0].props.onPress());
  expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'RPG', command: { kind: 'craft', id: 'wood_axe' } }));
  const upgrade = root.root.findAllByType(PixelButton).find((node) => node.findAllByType(PixelText).some((text) =>
    Array.isArray(text.props.children) && text.props.children.includes('ADVANCED CRAFTING'),
  ))!;
  expect(upgrade).toBeDefined();
  act(() => upgrade.props.onPress()); expect(mockOpenShop).toHaveBeenCalledTimes(1);
});

test('ordinary forge work remains visible and usable after yearly bonuses are exhausted', () => {
  mockState.rpg.forgeBonuses = { ownerId: mockState.playerCharacterId, year: mockState.world.currentYear, used: 3 };
  act(() => { root = create(<ForgePlayButton task={{ kind: 'work' }} />); });
  const work = button('MAKE AT THE ANVIL · SAME COST');
  expect(work).toBeDefined(); expect(work.props.disabled).toBe(false);
  act(() => work.props.onPress());
  expect(mockDispatch).toHaveBeenCalledWith({ type: 'FORGE_START', task: { kind: 'work' }, revision: mockState.rpg.revision });
});

test('commissioned forge work retains its Pro action', () => {
  act(() => { root = create(<ForgePlayButton task={{ kind: 'commission', chapter: 0, choiceId: 'fit' }} />); });
  const unlock = root.root.findByType(PixelButton);
  act(() => unlock.props.onPress());
  expect(mockOpenShop).toHaveBeenCalledTimes(1); expect(mockDispatch).not.toHaveBeenCalled();
});
