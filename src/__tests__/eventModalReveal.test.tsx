import React, { act } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EventModal } from '@/components/modals/EventModal';
import { PixelButton } from '@/components/ui/PixelButton';
import { createLife, cloneState } from '@/engine/gameState';
import type { GameEvent } from '@/types/game';
const { create } = require('react-test-renderer');

const metrics = { frame: { x: 0,y: 0,width: 390,height: 844 },insets: { top: 0,right: 0,bottom: 0,left: 0 } };
function modal(state: ReturnType<typeof createLife>, event: GameEvent, choose: (choice: any) => void) { return <SafeAreaProvider initialMetrics={metrics}><EventModal state={state} event={event} onChoose={choose} /></SafeAreaProvider>; }

beforeEach(() => { jest.useFakeTimers(); (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true; });
afterEach(() => jest.useRealTimers());
function fixture(instant: boolean) {
  const state = createLife({ worldSeed: 301 }); state.settings.reducedMotion = instant;
  state.world.characters.edwin.name = 'Alice'; state.world.characters.beatrice.name = 'Beata';
  const event: GameEvent = { id: 'reveal_fixture',title: 'THE CASE',text: '{{client}} brings a case.',category: 'peasant',choices: [{ id: 'continue',label: 'Proceed',outcome: { text: 'Done',effects: {} } }] };
  state.pendingEvent = { eventId: event.id,bindings: { client: 'edwin' } };
  return { state,event };
}
test('instant narration enables choices on mount and after selecting a different client with an equal-length name', async () => {
  const { state,event } = fixture(true), choose = jest.fn(); let tree: any;
  await act(async () => { tree = create(modal(state,event,choose)); });
  expect(tree.root.findByType(PixelButton).props.disabled).toBe(false);
  const next = cloneState(state); next.pendingEvent!.bindings!.client = 'beatrice';
  await act(async () => { tree.update(modal(next,event,choose)); });
  const button = tree.root.findByType(PixelButton); expect(button.props.disabled).toBe(false);
  await act(async () => { button.findAll((node: any) => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function')[0].props.onPress(); });
  expect(choose).toHaveBeenCalledTimes(1); expect(choose).toHaveBeenCalledWith(event.choices[0]);
  await act(async () => tree.unmount());
});
test('animated narration resets for the new client and tapping to reveal enables the choice', async () => {
  const { state,event } = fixture(false), choose = jest.fn(); let tree: any;
  await act(async () => { tree = create(modal(state,event,choose)); });
  expect(tree.root.findByType(PixelButton).props.disabled).toBe(true);
  const next = cloneState(state); next.pendingEvent!.bindings!.client = 'beatrice';
  await act(async () => { tree.update(modal(next,event,choose)); });
  expect(tree.root.findByType(PixelButton).props.disabled).toBe(true);
  await act(async () => { tree.root.findByProps({ accessibilityLabel: 'Reveal the rest of the passage' }).props.onPress(); });
  const button = tree.root.findByType(PixelButton); expect(button.props.disabled).toBe(false);
  await act(async () => { button.findAll((node: any) => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function')[0].props.onPress(); jest.advanceTimersByTime(6000); });
  expect(choose).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
