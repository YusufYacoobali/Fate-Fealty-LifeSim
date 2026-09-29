import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { KinTab } from '@/components/tabs/KinTab';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelText } from '@/components/ui/PixelText';
import { makeState } from './helpers';
import { spawnKin } from '@/engine/kinFactory';
import { contextualActions, courtshipUnavailableReason, perspectives, relationshipWith } from '@/engine/relationshipEngine';
import { normalizeGameState } from '@/state/persistence';

function knownPerson() {
  const state = makeState({ age: 24, gender: 'man', attraction: 'women' });
  const person = spawnKin(state, { kind: 'acquaintance', name: 'Joan', age: 23, gender: 'woman', attraction: 'men' });
  const views = perspectives(state, relationshipWith(state, person.id));
  views.player.affinity = views.other.affinity = 100;
  return { state, person };
}

let root: ReactTestRenderer;
afterEach(() => { if (root) act(() => root.unmount()); });
function button(label: string) {
  return root.root.findAllByType(PixelButton).find(b => b.findAllByType(PixelText).some(t => t.props.children === label));
}
function renderPerson({ state, person }: ReturnType<typeof knownPerson>, onInteract = jest.fn()) {
  act(() => { root = create(<KinTab state={state} kin={state.kin} detail={person} filter="acquaintances" onFilter={jest.fn()} onOpen={jest.fn()} onBack={jest.fn()} onInteract={onInteract} />); });
}

it('offers romance for a known adult with zero attraction, even after a save reload', () => {
  const before = knownPerson();
  const state = normalizeGameState(JSON.parse(JSON.stringify(before.state)));
  const person = state.kin.find(p => p.id === before.person.id)!;
  const interact = jest.fn();
  renderPerson({ state, person }, interact);
  act(() => button('ROMANCE')!.props.onPress());
  expect(button('FLIRT')).toBeDefined(); expect(button('COURT')).toBeDefined(); expect(button('PROPOSE')).toBeDefined();
  expect(JSON.stringify(root.toJSON())).toContain('High affinity means friendship');
  expect(JSON.stringify(root.toJSON())).toContain('THEIR ATTRACTION');
  act(() => button('FLIRT')!.props.onPress());
  expect(interact).toHaveBeenCalledWith(person.id, 'flirt');
});

it('keeps Romance visible and explains incompatible attraction despite full affinity', () => {
  const fixture = knownPerson(); fixture.person.attraction = 'women';
  expect(contextualActions(fixture.state, fixture.person)).not.toContain('flirt');
  renderPerson(fixture);
  act(() => button('ROMANCE')!.props.onPress());
  expect(button('FLIRT')).toBeUndefined(); expect(button('COURT')).toBeUndefined();
  expect(JSON.stringify(root.toJSON())).toContain('not romantically interested in your character');
});

it('explains the age restriction rather than silently hiding the category', () => {
  const fixture = knownPerson(); fixture.state.age = 17;
  renderPerson(fixture);
  act(() => button('ROMANCE')!.props.onPress());
  expect(button('FLIRT')).toBeUndefined();
  expect(JSON.stringify(root.toJSON())).toContain('both be at least 18');
});

it('keeps close relatives out of the Romance category', () => {
  const fixture = knownPerson();
  fixture.person = spawnKin(fixture.state, { kind: 'sibling', name: 'Sister', age: 23, gender: 'woman', attraction: 'men' });
  renderPerson(fixture);
  expect(button('ROMANCE')).toBeUndefined();
  expect(courtshipUnavailableReason(fixture.state, fixture.person)).toContain('close relative');
});

it('preserves the existing affair route for a compatible married acquaintance', () => {
  const fixture = knownPerson(); fixture.person.spouseId = 'roderick';
  expect(courtshipUnavailableReason(fixture.state, fixture.person)).toContain('married to someone else');
  renderPerson(fixture);
  act(() => button('ROMANCE')!.props.onPress());
  expect(button('SEDUCE')).toBeDefined(); expect(button('PROPOSE')).toBeUndefined();
  expect(JSON.stringify(root.toJSON())).toContain('secret affair');
});
