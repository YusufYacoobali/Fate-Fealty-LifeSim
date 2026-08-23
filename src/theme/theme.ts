/**
 * Palette + typography lifted directly from the HTML mockup so the native UI
 * matches the pixel-art prototype 1:1.
 */

export const C = {
  // sky / background
  sky: '#bfe3ff',
  skyDeep: '#9fcdf5',

  // blues (chrome)
  blue: '#2b6cb0',
  blueDeep: '#1a4d8f',
  blueDark: '#0d2a4a',
  blueDarker: '#14406f',
  blueMid: '#1f5896',
  ink: '#0d1b2e',
  inkSoft: '#1a2e4a',
  light: '#63b3ed',
  lightFill: '#cfe6ff',
  lighter: '#dcebff',
  paleEdge: '#9fc4e8',

  // parchment / cards
  parch: '#f6e9c8',
  parchSd: '#d8c08f',
  parchSl: '#fffaf0',
  parchBorder: '#2a3550',

  // text
  white: '#fff',
  textDark: '#3a3320',
  textBrown: '#5a4a28',
  textMuted: '#8a7440',
  cream: '#eaf4ff',
  creamBlue: '#bfe0ff',

  // stat colours
  health: '#fc8181',
  healthDark: '#c2484a',
  charm: '#ffce3a',
  charmDark: '#c9921f',
  wits: '#63b3ed',
  witsDark: '#2b6cb0',
  faith: '#9fe88f',
  faithDark: '#5fb04f',

  // tones
  good: '#2f8f3f',
  goodBg: '#f1f7e4',
  goodBorder: '#9bc46a',
  bad: '#c24a4a',
  badBg: '#fdeaea',
  badBorder: '#fc8181',
  purple: '#d6a8ff',
  purpleDark: '#9a5fd0',
  amber: '#a36a1f',
  orange: '#f6a13a',
  teal: '#7ad0c0',
  tealDark: '#3f9486',

  gold: '#ffce3a',
  goldText: '#ffe9a0',
} as const;

export const FONT = {
  pixel: 'PressStart2P_400Regular',
  body: 'VT323_400Regular',
} as const;

export const TYPE = {
  scale: 1.1,
} as const;

export function textSize(size: number): number {
  return Math.round(size * TYPE.scale);
}

export interface StatStyle {
  label: string;
  icon: string;
  color: string;
  dark: string;
}

export const STAT_STYLES: Record<'health' | 'charm' | 'wits' | 'faith', StatStyle> = {
  health: { label: 'HEALTH', icon: '♥', color: C.health, dark: C.healthDark },
  charm: { label: 'CHARM', icon: '★', color: C.charm, dark: C.charmDark },
  wits: { label: 'WITS', icon: '✦', color: C.wits, dark: C.witsDark },
  faith: { label: 'FAITH', icon: '✝', color: C.faith, dark: C.faithDark },
};

/**
 * Shared beveled-parchment surfaces so every card/modal keeps the identical
 * pixel-art frame. Spread into a style array to add margins/padding overrides.
 */
export const PANEL = {
  /** In-tab parchment card (bio boxes, ambition, kin detail). */
  parchCard: {
    backgroundColor: C.parch,
    borderWidth: 3,
    borderColor: C.parchBorder,
    borderTopColor: C.parchSl,
    borderLeftColor: C.parchSl,
    borderBottomColor: C.parchSd,
    borderRightColor: C.parchSd,
    padding: 9,
  },
  /** Full-screen modal frame (events, settings, shop, onboarding). */
  parchModal: {
    backgroundColor: C.parch,
    borderWidth: 4,
    borderColor: C.inkSoft,
    borderTopColor: C.parchSl,
    borderLeftColor: C.parchSl,
    borderBottomColor: C.parchSd,
    borderRightColor: C.parchSd,
    padding: 14,
  },
} as const;

export const TONE_STYLE = {
  good: { bg: C.goodBg, border: C.goodBorder, sd: '#bcd494', sl: '#fbfff0', tagColor: '#5a8a2a' },
  bad: { bg: C.badBg, border: C.badBorder, sd: '#f0b0b0', sl: '#fffafa', tagColor: C.bad },
  plain: { bg: C.parch, border: C.parchBorder, sd: C.parchSd, sl: C.parchSl, tagColor: C.amber },
} as const;

/**
 * Life-feed surfaces. Two things had to become visible at a glance: where one
 * entry ends and the next begins (hence the alternating `bgAlt`), and whose
 * life an entry belongs to — the player's own beats keep the warm parchment
 * palette, while autonomous world and NPC news is tinted cooler so it recedes.
 */
export const FEED_STYLE = {
  player: {
    good: { bg: C.goodBg, bgAlt: '#e7f1d6', border: C.goodBorder, sd: '#bcd494', sl: '#fbfff0', tagColor: '#5a8a2a' },
    bad: { bg: C.badBg, bgAlt: '#f8dcdc', border: C.badBorder, sd: '#f0b0b0', sl: '#fffafa', tagColor: C.bad },
    plain: { bg: C.parch, bgAlt: '#eeddb4', border: C.parchBorder, sd: C.parchSd, sl: C.parchSl, tagColor: C.amber },
  },
  world: {
    good: { bg: '#e6f0ea', bgAlt: '#dbe8e0', border: '#8fb3a0', sd: '#b2ccbc', sl: '#f6fbf8', tagColor: '#3f7a5a' },
    bad: { bg: '#f0e6ec', bgAlt: '#e6dae2', border: '#c99ab0', sd: '#ddb9c9', sl: '#fbf6f9', tagColor: '#a34a6a' },
    plain: { bg: '#e8eef6', bgAlt: '#dde5f0', border: '#54688a', sd: '#b9c8dc', sl: '#f8fbff', tagColor: '#4a6a8a' },
  },
} as const;
