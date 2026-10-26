import { describe, expect, it } from 'vitest';
import { parseProfile, parseRepository } from '../src/lib/github-public.js';

describe('public GitHub response boundaries', () => {
  it('rejects invalid repository responses and non-GitHub links', () => {
    expect(parseRepository(null)).toBeNull();
    expect(parseRepository({ name: 'repo', html_url: 'javascript:alert(1)' })).toBeNull();
    expect(parseRepository({ name: 'repo', html_url: 'https://github.com.evil.test/repo' })).toBeNull();
  });
  it('uses typed public metadata', () => {
    expect(parseRepository({ name: 'repo', html_url: 'https://github.com/owner/repo', stargazers_count: 3 }))
      .toMatchObject({ name: 'repo', stargazers_count: 3, description: null, language: null });
  });
  it('restricts remote avatar sources and handles invalid profile responses', () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile({ avatar_url: 'https://example.com/tracker' })?.avatar_url).toBe('/avatar.webp');
    expect(parseProfile({ name: 'Adrian', avatar_url: 'https://avatars.githubusercontent.com/u/1' })?.name).toBe('Adrian');
  });
});
