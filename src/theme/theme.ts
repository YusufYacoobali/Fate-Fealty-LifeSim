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

export const TONE_STYLE = {
  good: { bg: C.goodBg, border: C.goodBorder, sd: '#bcd494', sl: '#fbfff0', tagColor: '#5a8a2a' },
  bad: { bg: C.badBg, border: C.badBorder, sd: '#f0b0b0', sl: '#fffafa', tagColor: C.bad },
  plain: { bg: C.parch, border: C.parchBorder, sd: C.parchSd, sl: C.parchSl, tagColor: C.amber },
} as const;
