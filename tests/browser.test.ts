import { describe, expect, it } from 'vitest';
import { BROWSER_HOME, initialBrowserHistory, moveBrowser, navigateBrowser, parseBrowserTarget, resolveBookmarks } from '../src/lib/browser.js';

describe('portfolio browser', () => {
  it('keeps the GitHub profile as home and resolves uncatalogued repositories', () => {
    expect(initialBrowserHistory().entries[0]).toEqual(BROWSER_HOME);
    expect(parseBrowserTarget('https://github.com/adrigm06/Android-Engineering-Skill')).toMatchObject({
      kind: 'repository', owner: 'adrigm06', repository: 'Android-Engineering-Skill',
    });
  });
  it('rejects unsafe URLs and unsupported GitHub routes', () => {
    for (const url of ['javascript:alert(1)', 'http://example.com', 'https://user:pass@example.com', 'https://github.com/a/b/tree/main']) {
      expect(parseBrowserTarget(url)).toBeNull();
    }
  });
  it('resolves curated bookmarks from MDX instead of a recent-repository response', () => {
    expect(resolveBookmarks([{ data: { id: 'keyout', title: 'Keyout', demoUrl: 'https://adrigm06.github.io/Keyout/', githubUrl: '' } }]))
      .toEqual([{ id: 'keyout', title: 'Keyout', target: { kind: 'website', url: 'https://adrigm06.github.io/Keyout/' } }]);
  });
  it('navigates mixed destinations and discards forward entries after branching', () => {
    const site = parseBrowserTarget('https://www.avisia.es/')!;
    const repo = parseBrowserTarget('https://github.com/adrigm06/AndroBox')!;
    let history = navigateBrowser(navigateBrowser(initialBrowserHistory(), site), repo);
    history = moveBrowser(history, -1);
    expect(history.entries[history.index]).toEqual(site);
    expect(moveBrowser(history, -99).index).toBe(0);
    history = navigateBrowser(history, BROWSER_HOME);
    expect(history.entries).toEqual([BROWSER_HOME, site, BROWSER_HOME]);
    expect(navigateBrowser(history, BROWSER_HOME)).toBe(history);
  });
});
