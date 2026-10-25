import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Pass only host runtime settings, never inherited application credentials.
const env = Object.fromEntries(Object.entries(process.env).filter(([name]) =>
  /^(path|pathext|systemroot|windir|comspec|temp|tmp|home|userprofile|localappdata|appdata|ci|no_color)$/i.test(name),
));
Object.assign(env, {
  ASTRO_CI: '1',
  ASTRO_TELEMETRY_DISABLED: '1',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'ci-placeholder-not-a-real-key',
  PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  PUBLIC_SUPABASE_ANON_KEY: 'ci-placeholder-not-a-real-key',
});
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)),
  ...process.argv.slice(2), '--mode', 'ci',
], { env, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
