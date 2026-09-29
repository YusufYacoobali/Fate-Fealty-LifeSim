import React, { StrictMode } from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { PixelLottie as NativeAnimation } from '@/components/ui/PixelLottie';
import { PixelLottie as WebAnimation } from '@/components/ui/PixelLottie.web';

let mockNativePlaying = false;
let mockAutoLoad = true;
let mockNativeProps: React.ComponentProps<typeof import('lottie-react-native').default>;
const mockNativePlay = jest.fn(() => { mockNativePlaying = true; });
const mockNativePause = jest.fn(() => { mockNativePlaying = false; });
jest.mock('lottie-react-native', () => {
  const React = require('react');
  return { __esModule: true, default: React.forwardRef((props: typeof mockNativeProps, ref: unknown) => {
    mockNativeProps = props;
    React.useImperativeHandle(ref, () => ({ play: mockNativePlay, pause: mockNativePause }));
    React.useEffect(() => { if (mockAutoLoad) props.onAnimationLoaded?.(); }, [props.source]);
    return null;
  }) };
});
const mockWebPlay = jest.fn();
const mockWebStill = jest.fn();
const mockWebDestroy = jest.fn();
const mockWebListen = jest.fn();
const mockWebUnlisten = jest.fn();
const mockWebLoad = jest.fn(() => ({ totalFrames: 24, setSubframe: jest.fn(), goToAndPlay: mockWebPlay, goToAndStop: mockWebStill, destroy: mockWebDestroy, addEventListener: mockWebListen, removeEventListener: mockWebUnlisten }));
jest.mock('lottie-web', () => ({ __esModule: true, default: { loadAnimation: (...args: unknown[]) => mockWebLoad(...args as []) } }));

const source = require('../../assets/animations/pixel-hammer.json');
let root: ReactTestRenderer;
beforeEach(() => { jest.clearAllMocks(); mockNativePlaying = false; mockAutoLoad = true; });
afterEach(() => { if (root) act(() => root.unmount()); });

it('native animation is playing after React replays mount effects', () => {
  act(() => { root = create(<StrictMode><NativeAnimation source={source} trigger={1} reducedMotion={false} /></StrictMode>); });
  expect(mockNativePlay).toHaveBeenCalled();
  expect(mockNativePlaying).toBe(true);
});

it('web animation survives effect replay and destroys its renderer on unmount', () => {
  act(() => { root = create(<StrictMode><WebAnimation source={source} trigger={1} reducedMotion={false} /></StrictMode>, { createNodeMock: () => ({}) }); });
  expect(mockWebPlay.mock.calls.length).toBe(mockWebLoad.mock.calls.length);
  act(() => root.unmount());
  expect(mockWebDestroy.mock.calls.length).toBe(mockWebLoad.mock.calls.length);
});

it('web resets interrupted artwork, does not replay old strikes, and accepts the next strike', () => {
  const render = (trigger: number, active: boolean, reducedMotion = false) => <WebAnimation source={source} trigger={trigger} active={active} reducedMotion={reducedMotion} />;
  act(() => { root = create(render(0, true), { createNodeMock: () => ({}) }); });
  expect(mockWebPlay).not.toHaveBeenCalled();
  act(() => root.update(render(1, true)));
  expect(mockWebPlay).toHaveBeenCalledTimes(1);
  act(() => root.update(render(1, false)));
  expect(mockWebStill).toHaveBeenLastCalledWith(0, true);
  act(() => root.update(render(1, true)));
  expect(mockWebPlay).toHaveBeenCalledTimes(1);
  act(() => root.update(render(2, true)));
  expect(mockWebPlay).toHaveBeenCalledTimes(2);
  act(() => root.update(render(3, true, true)));
  act(() => root.update(render(3, true, false)));
  expect(mockWebPlay).toHaveBeenCalledTimes(2);
  act(() => root.update(render(4, true)));
  expect(mockWebPlay).toHaveBeenCalledTimes(3);
});

it('native interruption and reduced motion do not replay a previous strike', () => {
  const render = (trigger: number, active: boolean, reducedMotion = false) => <NativeAnimation source={source} trigger={trigger} active={active} reducedMotion={reducedMotion} />;
  act(() => { root = create(render(0, true)); });
  act(() => root.update(render(1, true)));
  act(() => root.update(render(1, false)));
  expect(mockNativePlaying).toBe(false);
  act(() => root.update(render(1, true)));
  expect(mockNativePlay).toHaveBeenCalledTimes(1);
  act(() => root.update(render(2, true, true)));
  act(() => root.update(render(2, true, false)));
  expect(mockNativePlay).toHaveBeenCalledTimes(1);
  act(() => root.update(render(3, true)));
  expect(mockNativePlay).toHaveBeenCalledTimes(2);
});

const combatSources = [
  ...['idle', 'strike', 'heavy', 'feint', 'block', 'parry', 'dodge', 'hurt', 'miss', 'recover', 'victory', 'defeat'].map(name => ['combat', name]),
  ...['idle', 'strike', 'heavy', 'feint', 'miss'].map(name => ['solo', name]),
].map(([kind, name]) => [kind + '-' + name, require('../../assets/animations/pixel-' + kind + '-' + name + '.json')] as const);

it.each(combatSources)('waits for %s to load and restarts its full frame range on repeated impacts', (_name, animation) => {
  mockAutoLoad = false;
  const render = (trigger: number) => <NativeAnimation source={animation} trigger={trigger} reducedMotion={false} />;
  act(() => { root = create(render(1)); });
  expect(mockNativePlay).not.toHaveBeenCalled();
  act(() => mockNativeProps.onAnimationLoaded?.());
  expect(mockNativePlay).toHaveBeenLastCalledWith(animation.ip, animation.op - 1);
  act(() => root.update(render(2)));
  expect(mockNativePlay).toHaveBeenCalledTimes(2);
  expect(mockNativePlay).toHaveBeenLastCalledWith(animation.ip, animation.op - 1);
});

it('does not send a heavy attack to the previous composition while Android is loading it', () => {
  mockAutoLoad = false;
  const heavy = require('../../assets/animations/pixel-combat-heavy.json');
  act(() => { root = create(<NativeAnimation source={source} trigger={1} reducedMotion={false} />); });
  act(() => mockNativeProps.onAnimationLoaded?.());
  const oldLoad = mockNativeProps.onAnimationLoaded;
  act(() => root.update(<NativeAnimation source={heavy} trigger={2} reducedMotion={false} />));
  expect(mockNativePlay).toHaveBeenCalledTimes(1);
  act(() => oldLoad?.());
  expect(mockNativePlay).toHaveBeenCalledTimes(1);
  act(() => mockNativeProps.onAnimationLoaded?.());
  expect(mockNativePlay).toHaveBeenCalledTimes(2);
  expect(mockNativePlay).toHaveBeenLastCalledWith(0, 47);
});

it('uses the latest impact after a slow load, but never plays a backgrounded impact', () => {
  mockAutoLoad = false;
  const render = (trigger: number, active = true) => <NativeAnimation source={source} trigger={trigger} active={active} reducedMotion={false} />;
  act(() => { root = create(render(1)); });
  act(() => root.update(render(2)));
  act(() => mockNativeProps.onAnimationLoaded?.());
  expect(mockNativePlay).toHaveBeenCalledTimes(1);
  act(() => root.update(render(3, false)));
  act(() => root.update(render(3, true)));
  expect(mockNativePlay).toHaveBeenCalledTimes(1);
});

it('only reports a completed native animation, never a cancelled or paused one', () => {
  const done = jest.fn();
  act(() => { root = create(<NativeAnimation source={source} trigger={1} reducedMotion={false} onFinish={done} />); });
  act(() => mockNativeProps.onAnimationFinish?.(true)); expect(done).not.toHaveBeenCalled();
  act(() => mockNativeProps.onAnimationFinish?.(false)); expect(done).toHaveBeenCalledTimes(1);
  act(() => root.update(<NativeAnimation source={source} trigger={1} reducedMotion={false} active={false} onFinish={done} />));
  act(() => mockNativeProps.onAnimationFinish?.(false)); expect(done).toHaveBeenCalledTimes(1);
});

it('web completion advances the scene and detaches when paused or replaced', () => {
  const done = jest.fn();
  const render = (active = true) => <WebAnimation source={source} trigger={1} reducedMotion={false} active={active} onFinish={done} />;
  act(() => { root = create(render(), { createNodeMock: () => ({}) }); });
  expect(mockWebListen).toHaveBeenLastCalledWith('complete', done);
  act(() => mockWebListen.mock.calls[0][1]());
  expect(done).toHaveBeenCalledTimes(1);
  act(() => root.update(render(false)));
  expect(mockWebUnlisten).toHaveBeenLastCalledWith('complete', done);
});
