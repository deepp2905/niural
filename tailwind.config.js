/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Semantic colors only — every color consumed in components maps to a
    // CSS variable so the review screen's theme toggle can remap one layer.
    // (§8b: primitives → semantic; dark mode swaps semantics only.)
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      // Absolute white/black for the rare element that must not theme-flip
      // (e.g. text on a danger button). Not for general use.
      white: '#ffffff',
      black: '#000000',

      // Surfaces
      page: 'var(--surface-page)',
      raised: 'var(--surface-raised)',
      sunken: 'var(--surface-sunken)',
      'surface-hover': 'var(--surface-hover)',
      selected: 'var(--surface-selected)',
      inverse: 'var(--surface-inverse)',

      // Borders
      'border-subtle': 'var(--border-subtle)',
      'border-strong': 'var(--border-strong)',

      // Text
      'text-primary': 'var(--text-primary)',
      'text-secondary': 'var(--text-secondary)',
      'text-secondary-tint': 'var(--text-secondary-tint)',
      'text-tertiary': 'var(--text-tertiary)',
      'text-disabled': 'var(--text-disabled)',
      'text-money': 'var(--text-money)',
      'text-inverse': 'var(--text-inverse)',
      'text-link': 'var(--text-link)',

      // AI (purple — provenance only, never primary actions)
      ai: 'var(--accent-ai)',
      'ai-surface': 'var(--accent-ai-surface)',
      'ai-border': 'var(--accent-ai-border)',

      // Status (base = AA text tone; -fill = vivid 500 for badges/icons/charts)
      success: 'var(--status-success)',
      'success-surface': 'var(--status-success-surface)',
      'success-fill': 'var(--status-success-fill)',
      warn: 'var(--status-warn)',
      'warn-surface': 'var(--status-warn-surface)',
      'warn-fill': 'var(--status-warn-fill)',
      danger: 'var(--status-danger)',
      'danger-surface': 'var(--status-danger-surface)',
      'danger-fill': 'var(--status-danger-fill)',
      info: 'var(--status-info)',
      'info-surface': 'var(--status-info-surface)',

      // Actions (brand blue primary)
      'action-primary': 'var(--action-primary)',
      'action-primary-hover': 'var(--action-primary-hover)',
      'action-primary-active': 'var(--action-primary-active)',
    },
    borderColor: ({ theme }) => ({
      ...theme('colors'),
      DEFAULT: 'var(--border-subtle)',
    }),
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      '12': ['12px', { lineHeight: '16px' }],
      '13': ['13px', { lineHeight: '18px' }],
      '14': ['14px', { lineHeight: '20px' }],
      '16': ['16px', { lineHeight: '24px' }],
      '20': ['20px', { lineHeight: '28px' }],
      '24': ['24px', { lineHeight: '32px' }],
      '32': ['32px', { lineHeight: '40px' }],
    },
    extend: {
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        raised: '0 1px 2px rgba(16, 17, 20, 0.04), 0 1px 3px rgba(16, 17, 20, 0.06)',
        popover: '0 4px 12px rgba(16, 17, 20, 0.08), 0 12px 32px rgba(16, 17, 20, 0.12)',
        takeover: '0 8px 40px rgba(16, 17, 20, 0.12)',
      },
      transitionTimingFunction: {
        'out-quiet': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
