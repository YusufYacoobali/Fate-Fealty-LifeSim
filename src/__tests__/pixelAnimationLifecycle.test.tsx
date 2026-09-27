import React, { StrictMode } from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { PixelLottie as NativeAnimation } from '@/components/ui/PixelLottie';
import { PixelLottie as WebAnimation } from '@/components/ui/PixelLottie.web';

let mockNativePlaying = false;
const mockNativePlay = jest.fn(() => { mockNativePlaying = true; });
const mockNativePause = jest.fn(() => { mockNativePlaying = false; });
jest.mock('lottie-react-native', () => {
  const React = require('react');
  return { __esModule: true, default: React.forwardRef((_props: unknown, ref: unknown) => {
    React.useImperativeHandle(ref, () => ({ play: mockNativePlay, pause: mockNativePause }));
    return null;
  }) };
});
const mockWebPlay = jest.fn();
const mockWebStill = jest.fn();
const mockWebDestroy = jest.fn();
const mockWebLoad = jest.fn(() => ({ totalFrames: 24, setSubframe: jest.fn(), goToAndPlay: mockWebPlay, goToAndStop: mockWebStill, destroy: mockWebDestroy }));
jest.mock('lottie-web', () => ({ __esModule: true, default: { loadAnimation: (...args: unknown[]) => mockWebLoad(...args as []) } }));

const source = require('../../assets/animations/pixel-hammer.json');
let root: ReactTestRenderer;
beforeEach(() => { jest.clearAllMocks(); mockNativePlaying = false; });
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
