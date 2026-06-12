export const ZONES = {
  android: {
    id: 'android',
    labelKey: 'zone_android',
    gridArea: 'android',
  },
  fullstack: {
    id: 'fullstack',
    labelKey: 'zone_fullstack',
    gridArea: 'fullstack',
  },
  'ai-tools': {
    id: 'ai-tools',
    labelKey: 'zone_ai_tools',
    gridArea: 'ai-tools',
  },
} as const;

export type ZoneId = keyof typeof ZONES;

export const QUICKLINKS_ZONE_ID = 'quicklinks' as const;
