// Theme configuration following ptalmeida.com design system

export const theme = {
  colors: {
    // Primary colors
    navy: '#0f2f7f',
    navyDark: '#0a2260',
    navyLight: '#1a4099',

    // Neutral colors
    grayBg: '#EFEFEF',
    grayLight: '#f8f8f8',
    white: '#ffffff',

    // Text colors
    textDark: 'rgba(0, 0, 0, 0.8)',
    textMedium: 'rgba(0, 0, 0, 0.6)',
    textLight: 'rgba(0, 0, 0, 0.4)',
    textOnNavy: '#EFEFEF',

    // Border colors
    border: 'rgba(0, 0, 0, 0.12)',

    // State colors
    error: '#ef4444',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
  },

  typography: {
    // Font families
    fontHeading: "'Montserrat', sans-serif",
    fontBody: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    // Font weights
    weightRegular: 400,
    weightSemiBold: 600,
    weightBold: 700,
    weightExtraBold: 800,

    // Font sizes
    sizeXs: '0.75rem',      // 12px
    sizeSm: '0.875rem',     // 14px
    sizeBase: '1rem',       // 16px
    sizeLg: '1.125rem',     // 18px
    sizeXl: '1.25rem',      // 20px
    size2Xl: '1.5rem',      // 24px
    size3Xl: '1.875rem',    // 30px

    // Line heights
    lineHeightTight: 1.2,
    lineHeightNormal: 1.45,
    lineHeightRelaxed: 1.6,
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },

  layout: {
    headerHeight: '60px',
    maxWidth: '1100px',
    sidebarWidth: '384px', // 96 * 4 = 384px
  },

  transitions: {
    fast: 'all 0.2s ease-in',
    normal: 'all 0.3s ease-in-out',
    slow: 'all 0.4s ease-in-out',
  },

  shadows: {
    // Neumorphic shadows
    neumorphic: '9px 9px 14px #b8b8b8, -9px -9px 14px #ffffff',
    neumorphicSm: '4px 4px 8px #c5c5c5, -4px -4px 8px #ffffff',
    neumorphicLg: '12px 12px 20px #a0a0a0, -12px -12px 20px #ffffff',
    neumorphicInset: 'inset 4px 4px 8px #c5c5c5, inset -4px -4px 8px #ffffff',
  },

  borderRadius: {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
  },
} as const;

export type Theme = typeof theme;
