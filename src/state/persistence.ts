import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '@/types/game';

const SAVE_KEY = 'mls:save:v1';

/**
 * Persist only the durable parts of the state. Transient UI fields (open modals,
 * selected kin, the current event popup) are reset on load so a reload never
 * traps the player in a half-resolved popup.
 */
export async function saveGame(state: GameState): Promise<void> {
  try {
    const toSave: GameState = {
      ...state,
      settingsOpen: false,
      selectedKinId: null,
      // Keep an open event so a mid-popup reload still resolves it.
    };
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // Saving is best-effort; never crash the game over it.
    console.warn('[persistence] save failed', e);
  }
}

export async function loadGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // Defensive reset of transient UI.
    parsed.settingsOpen = false;
    parsed.selectedKinId = null;
    return parsed;
  } catch (e) {
    console.warn('[persistence] load failed', e);
    return null;
  }
}

export async function clearSave(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.warn('[persistence] clear failed', e);
  }
}
