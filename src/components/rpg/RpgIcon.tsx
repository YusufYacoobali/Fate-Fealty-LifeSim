import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { CAREER_ACTION_ART, CAREER_FAMILY_ART, GOAL_ICONS, UI_ICONS } from '@/assets/generatedAssets';

const icons: Record<string, ImageSourcePropType> = {
  board: CAREER_FAMILY_ART.court, explore: CAREER_FAMILY_ART.outlaw,
  craft: CAREER_FAMILY_ART.craft, careers: CAREER_ACTION_ART.work,
  husbandry: CAREER_FAMILY_ART.agriculture, craftsmanship: CAREER_FAMILY_ART.craft,
  scholarship: CAREER_FAMILY_ART.court, arms: CAREER_FAMILY_ART.martial,
  weapon: CAREER_FAMILY_ART.martial, armour: GOAL_ICONS.knighthood, tool: CAREER_ACTION_ART.craft,
  goods: UI_ICONS.shop, holding: GOAL_ICONS.barony, people: GOAL_ICONS.family,
};
export function RpgIcon({ name = 'board', size = 28 }: { name?: string; size?: number }) {
  return <Image accessible={false} source={icons[name] ?? icons.board} resizeMode="contain" style={{ width: size, height: size }} />;
}
