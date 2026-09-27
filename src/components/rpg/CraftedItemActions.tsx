import React from 'react';
import { View } from 'react-native';
import { useGame } from '@/state/GameContext';
import { equipmentDefinition } from '@/engine/rpgProgress';
import { RECIPES } from '@/data/rpg';
import { rpgAvailability, RpgCommand } from '@/engine/rpgEngine';
import { PixelButton } from '../ui/PixelButton';
import { PixelText } from '../ui/PixelText';
import { C } from '@/theme/theme';

export function CraftedItemActions({ itemKey, recipeId }: { itemKey: string; recipeId: string }) {
  const { state, dispatch } = useGame();
  const gear = equipmentDefinition(itemKey), recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe || (state.rpg.goods[itemKey] ?? 0) < 1) return null;
  const equipped = gear && state.rpg.equipment[gear.slot] === itemKey;
  const command: RpgCommand | undefined = gear ? { kind: 'equip', id: itemKey } : recipe.effects ? { kind: 'use_good', id: itemKey } : undefined;
  const reason = command ? rpgAvailability(state, command) : null;
  return <View style={{ marginTop: 8 }}>
    <PixelText font="body" size={17} color={C.textBrown}>{gear?.name ?? recipe.name} × {state.rpg.goods[itemKey]} ready</PixelText>
    {command && <PixelButton bg={C.charm} shadow={C.charmDark} disabled={!!reason || !!equipped} onPress={() => dispatch({ type: 'RPG', command, revision: state.rpg.revision })} innerStyle={{ padding: 12, minHeight: 44 }}>
      <PixelText font="pixel" size={8} color={C.blueDark}>{equipped ? 'EQUIPPED' : gear ? 'EQUIP NOW · FREE' : 'USE ONE NOW · FREE'}</PixelText>
      {reason && <PixelText font="body" size={14} color={C.textBrown}>{reason}</PixelText>}
    </PixelButton>}
    {!command && <PixelText font="body" size={16} color={C.textBrown}>Ready for your mastery commission in Do → Practice.</PixelText>}
  </View>;
}
