/**
 * Swiss Botanical · Design Tokens (ESM & CommonJS compatible)
 */
export const colors = {
  paper0: '#F7F4EC',
  paper1: '#EFEBE0',
  paper2: '#E5DFD0',
  paper3: '#DCD5C2',
  ink0: '#1E1D19',
  ink1: '#3C392F',
  ink2: '#6B6759',
  ink3: '#96907C',
  inkInverse: '#F7F4EC',
  lineHairline: '#988C6C',
  lineStrong: '#8C7F5B',
  lineHeavy: '#1E1D19',
  accentShiitake: '#6E472D',
  accentShiitakeDeep: '#5A3725',
  accentShiitakeTint: '#EFE4DA',
  accentOrellana: '#5E7080',
  accentOrellanaTint: '#E2E7EA',
  accentMelena: '#9D6F28',
  accentMelenaTint: '#F5EEDD',
  accentRosa: '#A85C32',
  accentRosaTint: '#F4E7DF',
  statusActive: '#5B6B44',
  statusActiveTint: '#E2E7D7',
  statusWarn: '#C49A4C',
  statusWarnTint: '#F6EEDA',
  statusError: '#8C3223',
  statusErrorTint: '#F4DFDA'
};

export const typography = {
  serif: "'Gaya Patched', Georgia, serif",
  sans: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
};

export const motion = {
  durationFast: '150ms',
  durationNormal: '300ms',
  durationEditorial: '450ms',
  durationSlow: '600ms',
  easeEditorial: 'cubic-bezier(0.22, 1, 0.36, 1)'
};

export default { colors, typography, motion };
