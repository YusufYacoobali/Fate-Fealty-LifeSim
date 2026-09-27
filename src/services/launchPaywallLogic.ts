export const LAUNCH_PAYWALL_INTERVAL = 5;

/** Increment the persisted full-launch counter defensively. */
export function nextAppOpenCount(current: number): number {
  const safeCurrent = Number.isFinite(current) ? Math.max(0, Math.floor(current)) : 0;
  return safeCurrent + 1;
}

/** The recurring storefront cadence: launches 5, 10, 15, and so on. */
export function isLaunchPaywallDue(openCount: number): boolean {
  return openCount > 0 && openCount % LAUNCH_PAYWALL_INTERVAL === 0;
}
