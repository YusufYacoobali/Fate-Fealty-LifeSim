import type { BirthOriginId } from '@/types/game';
export interface BirthOriginDef {
  id: BirthOriginId; name: string; icon: string; weight: number; wealth: number; standing: number;
  careers: [string, string]; contactId: string; advantage: string; burden: string;
  introductions: readonly string[];
}
export const BIRTH_ORIGINS: readonly BirthOriginDef[] = [
  { id: 'peasant', name: 'Peasant', icon: '🌾', weight: 45, wealth: 8, standing: 15, careers: ['tenant_farmer', 'farmhand'], contactId: 'leofric', advantage: 'Shared fields and a neighbour who will teach husbandry.', burden: 'Rent is due even when the harvest fails.', introductions: [
    '{mother} counts three chickens, half a roof, and a debt large enough to qualify as another child. {father} names you {player}. The creditor asks how soon you can carry a sack.',
    'You arrive during a rent dispute. {father} offers the bailiff a chicken; {mother} offers him the door. You inherit neither victory nor dry bedding.',
    '{mother} wraps you in sacking while {father} rescues the winter seed from a goat. Your first possession is a spoon with a previous owner who still visits.' ] },
  { id: 'artisan', name: 'Artisan', icon: '🔨', weight: 18, wealth: 28, standing: 38, careers: ['artisan', 'master_artisan'], contactId: 'edwin', advantage: 'A workshop, tools and a place at the guild bench.', burden: 'The guild owns your family’s debts and much of its time.', introductions: [
    'You are born behind {father}’s workshop. {mother} weighs you on the commission scales. The guild inspector charges for inspecting the scales.',
    '{mother} postpones a commission to deliver you. {father} invoices the customer for the delay. Your family makes sound work and enemies with excellent credit.',
    'A hammer rings beside your cradle. {father} calls it a lullaby; {mother} calls it a cracked anvil. Guild apprentice Edwin comes to see which of you is louder.' ] },
  { id: 'merchant', name: 'Merchant', icon: '⚖️', weight: 12, wealth: 65, standing: 52, careers: ['trader', 'merchant'], contactId: 'beatrice', advantage: 'Stock, counting-house contacts and knowledge of routes.', burden: 'A rival household contests the family’s measures.', introductions: [
    'You are born above {father}’s counting house. {mother} calculates the cost of raising you before your first feeding. The figure is already disputed.',
    '{father} records your birth between wool purchases. {mother} insists you belong under assets. Rival trader Beatrice asks to inspect the arithmetic.',
    'Your cradle travels with a consignment of cloth. {mother} keeps you warm in the finest offcuts; {father} notes that even scraps have a price.' ] },
  { id: 'church', name: 'Church-affiliated', icon: '🕯️', weight: 10, wealth: 20, standing: 42, careers: ['copyist', 'clerk'], contactId: 'oswin', advantage: 'Literate lay parents and access to parish books.', burden: 'Patrons expect piety, obedience and unpaid copying.', introductions: [
    '{mother}, a lay copyist, inks your name in the family Bible. {father} blots it with a nervous thumb. Brother Oswin calls this your first theological dispute.',
    'You are born in a lay scribe’s household beside the priory. {father} copies the baptismal entry; {mother} corrects his Latin while feeding you.',
    '{mother} reads a psalm over your cradle. {father} discovers that the parchment was promised to a patron. Your education begins with the price of words.' ] },
  { id: 'military', name: 'Military', icon: '🛡️', weight: 10, wealth: 24, standing: 40, careers: ['guard', 'levy'], contactId: 'joan', advantage: 'Service connections and access to weapons training.', burden: 'The household answers the muster before the harvest.', introductions: [
    '{father} reports your birth to the garrison as one additional mouth. {mother} insists you are a child, not a ration claim. Captain Joan requests clarification.',
    'You are born within earshot of the muster bell. {mother} wraps you in an old campaign cloak; {father} searches it for outstanding pay.',
    '{mother} counts the garrison’s stores while {father} counts your fingers. For once both accounts balance. The captain still suspects theft.' ] },
  { id: 'noble', name: 'Noble', icon: '🏰', weight: 5, wealth: 100, standing: 82, careers: ['steward', 'steward'], contactId: 'aldric', advantage: 'A landed household and access to private tutors.', burden: 'Tenants need grain; cousins need excuses to contest your inheritance.', introductions: [
    'Bells announce your birth to {mother} and {father}’s tenants. The tenants pay for the bells. Your cradle already has better linen than their shrouds.',
    '{mother} has your lineage read aloud. {father} interrupts twice to omit a cousin. Lord Aldric sends a silver cup and an assessment of the estate.',
    'You arrive beneath painted ancestors. {father} promises to preserve their land; {mother} quietly sells a jewel to pay the wet nurse.' ] },
  { id: 'royal', name: 'Royal', icon: '👑', weight: 0, wealth: 160, standing: 95, careers: ['steward', 'chancellor'], contactId: 'aldric', advantage: 'A documented royal claim and palace connections.', burden: 'An older sibling has the stronger claim. Neither of you rules yet.', introductions: [
    'You are born to {mother} and King {father}. An older sibling stands between you and the throne. Your mother forbids you to regard this as a practical problem.',
    '{father} announces another royal child. {mother} orders the nursery locks replaced. Your older sibling sends a wooden crown with a splinter.',
    'The herald traces your claim through {father}. {mother} dismisses him before he reaches the disputed marriages. You receive a cradle, guards and a place behind your sibling.' ] },
];
/** Ordinary weights remain unchanged; entitled royalty takes 0.5% of the total. */
export function birthWeights(premium: boolean, weights: Partial<Record<BirthOriginId, number>> = {}): Record<BirthOriginId, number> {
  const result = Object.fromEntries(BIRTH_ORIGINS.map(o => [o.id, Math.max(0, Number.isFinite(weights[o.id]) ? weights[o.id]! : o.weight)])) as Record<BirthOriginId, number>;
  const total = BIRTH_ORIGINS.filter(o => o.id !== 'royal').reduce((sum, o) => sum + result[o.id], 0);
  result.royal = premium ? Math.max(0, weights.royal ?? total * 0.005 / 0.995) : 0;
  return result;
}
