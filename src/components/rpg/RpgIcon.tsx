import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { ACTIVITY_ICONS, CAREER_ACTION_ART, CAREER_FAMILY_ART, GOAL_ICONS, HOLDING_UPGRADE_ART, UI_ICONS } from '@/assets/generatedAssets';

const icons: Record<string, ImageSourcePropType> = {
  board: ACTIVITY_ICONS.quest, explore: CAREER_FAMILY_ART.outlaw,
  craft: CAREER_FAMILY_ART.craft, careers: CAREER_ACTION_ART.work,
  husbandry: CAREER_FAMILY_ART.agriculture, craftsmanship: CAREER_FAMILY_ART.craft,
  scholarship: CAREER_FAMILY_ART.court, arms: CAREER_FAMILY_ART.martial,
  weapon: CAREER_FAMILY_ART.martial, armour: GOAL_ICONS.knighthood, tool: CAREER_ACTION_ART.craft,
  goods: UI_ICONS.shop, holding: GOAL_ICONS.barony, people: GOAL_ICONS.family,
  broken_cart: ACTIVITY_ICONS.repair_household, stone_wall: HOLDING_UPGRADE_ART.fenced_field,
  harvest_help: ACTIVITY_ICONS.fields, stray_sheep: ACTIVITY_ICONS.manage_stores,
  fever_remedy: ACTIVITY_ICONS.treat_patient, chapel_herbs: ACTIVITY_ICONS.herbalist,
  sealed_letter: ACTIVITY_ICONS.copy_manuscript, market_dispute: ACTIVITY_ICONS.market,
  road_escort: ACTIVITY_ICONS.lead_patrol, watch_duty: HOLDING_UPGRADE_ART.watchtower,
  quiet_package: ACTIVITY_ICONS.fence_goods, missing_tools: ACTIVITY_ICONS.blacksmith,
  woodland: ACTIVITY_ICONS.gather_fuel, quarry: HOLDING_UPGRADE_ART.watermill,
  watchtower: HOLDING_UPGRADE_ART.watchtower, mercenary: CAREER_FAMILY_ART.martial,
  caravan: ACTIVITY_ICONS.run_caravan, court: ACTIVITY_ICONS.host_court,
};
export function RpgIcon({ name = 'board', size = 28 }: { name?: string; size?: number }) {
  return <Image accessible={false} source={icons[name] ?? icons.board} resizeMode="contain" style={{ width: size, height: size }} />;
}
