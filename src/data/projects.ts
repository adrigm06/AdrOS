export const ZONES = {
  android: {
    id: 'android',
    labelKey: 'zone_android',
  },
  fullstack: {
    id: 'fullstack',
    labelKey: 'zone_fullstack',
  },
  'ai-tools': {
    id: 'ai-tools',
    labelKey: 'zone_ai_tools',
  },
} as const;

export type ZoneId = keyof typeof ZONES;

/** Color de carpeta y acento por zona */
export const ZONE_COLORS: Record<ZoneId, string> = {
  android: '#60a5fa',   // azul — mobile
  fullstack: '#34d399',  // verde — web
  'ai-tools': '#a78bfa', // violeta — AI
};

/** Labels para la leyenda */
export const ZONE_LABELS: Record<ZoneId, { es: string; en: string }> = {
  android: { es: 'Mobile', en: 'Mobile' },
  fullstack: { es: 'Web', en: 'Web' },
  'ai-tools': { es: 'AI & Tools', en: 'AI & Tools' },
};
