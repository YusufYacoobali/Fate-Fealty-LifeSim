export const MONEY_SUCCESS_THRESHOLD = 5;

export function shouldPlayMoneySuccess(previousGold: number, currentGold: number, soundEffectsEnabled: boolean): boolean {
  return soundEffectsEnabled && currentGold - previousGold > MONEY_SUCCESS_THRESHOLD;
}
