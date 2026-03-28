export const BRAND = {
  name: 'AdForge AI',
  tagline: 'Créez des affiches publicitaires réalistes, prêtes à vendre, en quelques minutes.',
  description:
    'Plateforme de génération de visuels marketing assistée par un agent IA conversationnel.',
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const ANIMATION = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
  },
  ease: {
    default: [0.25, 0.1, 0.25, 1],
    in: [0.4, 0, 1, 1],
    out: [0, 0, 0.2, 1],
    inOut: [0.4, 0, 0.2, 1],
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
} as const;

export const SIDEBAR_WIDTH = {
  expanded: 260,
  collapsed: 72,
} as const;
