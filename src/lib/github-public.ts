export interface PublicRepository {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
}
export interface PublicProfile { name: string; bio: string; avatar_url: string; public_repos: number }

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function parseRepository(value: unknown): PublicRepository | null {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.html_url !== 'string') return null;
  if (!value.html_url.startsWith('https://github.com/')) return null;
  return {
    name: value.name, html_url: value.html_url,
    description: typeof value.description === 'string' ? value.description : null,
    language: typeof value.language === 'string' ? value.language : null,
    stargazers_count: typeof value.stargazers_count === 'number' ? value.stargazers_count : 0,
  };
}
export function parseProfile(value: unknown): PublicProfile | null {
  if (!isRecord(value)) return null;
  return {
    name: typeof value.name === 'string' ? value.name : 'Adrián Gómez',
    bio: typeof value.bio === 'string' ? value.bio : '',
    avatar_url: typeof value.avatar_url === 'string' && value.avatar_url.startsWith('https://avatars.githubusercontent.com/') ? value.avatar_url : '/avatar.webp',
    public_repos: typeof value.public_repos === 'number' ? value.public_repos : 0,
  };
}
