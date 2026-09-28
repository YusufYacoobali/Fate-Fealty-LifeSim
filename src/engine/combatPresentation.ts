import { GameState } from '@/types/game';

/** Visual cues follow the settled result, never the player's next selection. */
export function combatPresentation(duel: NonNullable<GameState['duel']>) {
  const c = duel.combat!;
  const scene = !c.solo && duel.outcome === 'won' ? 'victory' : !c.solo && duel.outcome === 'lost' ? 'defeat'
    : c.lastAction === 'strike' && c.lastMove === 'heavy' ? 'heavy'
    : c.lastAction === 'strike' && c.lastMove === 'feint' ? 'feint'
    : c.lastAction === 'block' && c.lastMove === 'parry' ? 'parry'
    : c.lastAction ?? 'idle';
  const labels = { idle: 'WATCH. DEFEND. STRIKE.', strike: 'SLASH!', heavy: 'SMASH!', feint: 'FEINT!', block: 'BLOCK!', parry: 'PARRY!', dodge: 'DODGE!', hurt: 'OUCH!', miss: 'WHOOSH!', recover: 'BREATHE!', victory: 'VICTORY!', defeat: 'DOWN!' };
  const defending = ['block', 'dodge', 'hurt'].includes(c.lastAction ?? '');
  const detail = c.solo ? c.lastGrade?.toUpperCase() ?? '' : c.lastAction === 'recover' ? `+${c.lastStaminaGain ?? 30} STAMINA` : c.lastDamage === undefined ? ''
    : c.lastDamage > 0 ? `−${c.lastDamage}` : defending ? 'SAFE' : 'MISS';
  return { scene, label: c.solo && scene === 'idle' ? 'CHOOSE YOUR SWING' : labels[scene], detail, defending } as const;
}
