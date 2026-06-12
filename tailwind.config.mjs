/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'os-bg': 'var(--os-bg)',
        'os-surface': 'var(--os-surface)',
        'os-surface-2': 'var(--os-surface-2)',
        'os-border': 'var(--os-border)',
        'os-accent': 'var(--os-accent)',
        'os-accent-dim': 'var(--os-accent-dim)',
        'os-accent-glow': 'var(--os-accent-glow)',
        'os-text': 'var(--os-text)',
        'os-muted': 'var(--os-muted)',
        'os-danger': 'var(--os-danger)',
        'os-warn': 'var(--os-warn)',
        'os-ok': 'var(--os-ok)',
      },
      fontFamily: {
        mono: ['var(--font-mono)'],
        sans: ['var(--font-sans)'],
      },
      borderRadius: {
        'os-sm': 'var(--radius-sm)',
        'os-md': 'var(--radius-md)',
        'os-lg': 'var(--radius-lg)',
      },
      boxShadow: {
        'os-window': 'var(--shadow-window)',
        'os-hover': 'var(--shadow-hover)',
      },
      spacing: {
        'taskbar': 'var(--taskbar-h)',
        'titlebar': 'var(--titlebar-h)',
      },
    },
  },
};
