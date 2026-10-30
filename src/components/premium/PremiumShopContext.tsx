import { createContext, useContext } from 'react';

/** Routes nested activity locks to GameScreen's existing Pro storefront. */
export const PremiumShopContext = createContext<(() => void) | null>(null);

export function useOpenPremiumShop(): () => void {
  const open = useContext(PremiumShopContext);
  if (!open) throw new Error('Pro activity buttons require PremiumShopContext');
  return open;
}
