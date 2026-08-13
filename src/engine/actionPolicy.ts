export const ACTIONS_PER_YEAR = 24;
export const PREMIUM_ACTIONS_PER_YEAR = 50;

export function actionLimitForAccess(premiumUnlocked: boolean): number {
  return premiumUnlocked ? PREMIUM_ACTIONS_PER_YEAR : ACTIONS_PER_YEAR;
}
