import { describe, expect, it } from 'vitest';
import { parseBrowserTarget, navigateBrowser, moveBrowser, initialBrowserHistory } from '../src/lib/browser.js';
import { repositoryTarget, resolveReadmeLink } from '../src/lib/repository/navigation.js';
import { parseMarkdown } from '../src/lib/repository/markdown.js';
import { loadRepositoryPage } from '../src/lib/repository/page.js';
import { GithubRepositoryService } from '../src/lib/terminal/repo-filesystem.js';
import { PublicGithubClient } from '../src/lib/terminal/github-client.js';
import { replaceBrowserTarget } from '../src/lib/browser.js';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import RepositoryMarkdown from '../src/components/widgets/RepositoryMarkdown.js';
import { parseInline } from '../src/lib/repository/inline.js';

const ref = 'a'.repeat(40);
const target = { kind: 'repository', owner: 'owner', repository: 'repo', url: 'https://github.com/owner/repo', ref } as const;
const context = { owner: 'owner', repository: 'repo', ref, branch: 'main', path: 'docs/README.md' };
describe('repository navigation and safe README markup', () => {
  it('accepts validated pinned paths and retains them in back/forward history', () => {
    const file = repositoryTarget(target, 'docs/file with spaces.txt', 'blob');
    expect(parseBrowserTarget(file.url)).toEqual(file);
    const history = navigateBrowser(navigateBrowser(initialBrowserHistory(), target), file);
    expect(moveBrowser(moveBrowser(history, -1), 1).entries[2]).toEqual(file);
    expect(parseBrowserTarget('https://github.com/owner/repo/blob/invalid/path')).toBeNull();
  });
  it('resolves relative folders/files, anchors and HTTPS links while rejecting unsafe protocols', () => {
    expect(resolveReadmeLink('../src/index.ts', context)).toMatchObject({ kind: 'repository', target: { path: 'src/index.ts', ref } });
    expect(resolveReadmeLink('../../../../LICENSE', context)).toMatchObject({ kind: 'repository', target: { path: 'LICENSE' } });
    expect(resolveReadmeLink('#usage', context)).toEqual({ kind: 'anchor', anchor: 'usage' });
    expect(resolveReadmeLink('https://example.com', context)).toMatchObject({ kind: 'external' });
    for (const value of ['javascript:alert(1)', 'data:text/html,x', '//evil.test', 'http://example.com']) expect(resolveReadmeLink(value, context)).toBeNull();
  });
  it('parses common markdown without accepting executable HTML as markup', () => {
    const blocks = parseMarkdown('# Hello\n\nA **bold** paragraph [docs](docs/).\n\n- One\n- Two\n\n```js\n<script>literal</script>\n```\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n<h2>Visible text</h2><script>alert(1)</script>');
    expect(blocks.map(block => block.kind)).toEqual(['heading', 'paragraph', 'list', 'code', 'table', 'paragraph']);
    expect(JSON.stringify(blocks)).toContain('Visible text');
    expect(JSON.stringify(blocks)).not.toContain('alert(1)');
  });
  it('renders actual React markup with no raw HTML, executable URLs or automatic image loads', () => {
    const html = renderToStaticMarkup(createElement(RepositoryMarkdown, {
      text: '# Usage\n\n<script>alert(1)</script><a href="https://example.com">Safe HTML link</a>\n\n![badge](https://tracker.test/image.svg) [attack](javascript:alert(1))\n\n```html\n<script>literal code</script>\n```',
      context, lang: 'en', onNavigate: () => {},
    }));
    expect(html).toContain('href="https://example.com/"');
    expect(html).toContain('Safe HTML link');
    expect(html).toContain('&lt;script&gt;literal code&lt;/script&gt;');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('id="readme-usage"');
    const code = renderToStaticMarkup(createElement(RepositoryMarkdown, { text: '`<script>inline literal</script>`', context, lang: 'en', onNavigate: () => {} }));
    expect(code).toContain('&lt;script&gt;inline literal&lt;/script&gt;');
  });
  it('does not resolve inherited references and bounds pathological inline parsing', () => {
    expect(parseInline('[unsafe][constructor]')).toEqual([{ kind: 'text', text: '[unsafe][constructor]' }]);
    expect(parseInline('['.repeat(10000)).length).toBeGreaterThan(0);
    expect(resolveReadmeLink('https://user:pass@example.com', context)).toBeNull();
    expect(resolveReadmeLink('https://github.com/owner/repo/blob/main/src/index.ts', context)).toMatchObject({ kind: 'repository', target: { path: 'src/index.ts', ref } });
  });
  it('ignores stale canonical results instead of overwriting a newer history destination', () => {
    const first = repositoryTarget(target, 'first.md', 'blob'), second = repositoryTarget(target, 'second.md', 'blob');
    const history = navigateBrowser(initialBrowserHistory(), second);
    expect(replaceBrowserTarget(history, first.url, first)).toBe(history);
  });
});
describe('repository page loader', () => {
  it('loads a pinned directory and its real README from shared secure tree/blob service', async () => {
    const fetcher: typeof fetch = async input => {
      const url = String(input);
      const data = url.endsWith('/repos/owner/repo') ? { private: false, default_branch: 'main', description: 'Actual repository' }
        : url.includes('/commits/') ? { sha: ref, commit: { tree: { sha: 'b'.repeat(40) } } }
        : url.includes('/git/trees/') ? { tree: [{ path: 'README.md', sha: 'c'.repeat(40), mode: '100644', size: 8 }, { path: 'src', sha: 'd'.repeat(40), mode: '040000' }] }
        : { size: 8, encoding: 'base64', content: btoa('# Actual') };
      return new Response(JSON.stringify(data));
    };
    const result = await loadRepositoryPage(new GithubRepositoryService(new PublicGithubClient(fetcher)), target, new AbortController().signal);
    expect(result.entries[0].name).toBe('src');
    expect(result.readme?.text).toBe('# Actual');
    expect(result.mount.commit).toBe(ref);
  });
  it('does not continue a repository load after cancellation', async () => {
    const controller = new AbortController(); controller.abort();
    await expect(loadRepositoryPage(new GithubRepositoryService(), target, controller.signal)).rejects.toMatchObject({ code: 'cancelled' });
  });
  it('aborts a pending README read and never returns a stale page after navigation', async () => {
    const controller = new AbortController();
    let entered: (() => void) | undefined;
    const started = new Promise<void>(resolve => { entered = resolve; });
    const fetcher: typeof fetch = async (input, options) => {
      const url = String(input);
      if (url.includes('/git/blobs/')) {
        entered!();
        return new Promise((_resolve, reject) => options?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))));
      }
      const data = url.endsWith('/repos/owner/repo') ? { private: false, default_branch: 'main' }
        : url.includes('/commits/') ? { sha: ref, commit: { tree: { sha: 'b'.repeat(40) } } }
        : { tree: [{ path: 'README.md', mode: '100644', sha: 'c'.repeat(40), size: 8 }] };
      return new Response(JSON.stringify(data));
    };
    const loading = loadRepositoryPage(new GithubRepositoryService(new PublicGithubClient(fetcher)), target, controller.signal);
    const check = expect(loading).rejects.toMatchObject({ code: 'cancelled' });
    await started; controller.abort(); await check;
  });
  it('loads only the selected folder README and handles binary files without fetching their blob', async () => {
    const calls: string[] = [];
    const fetcher: typeof fetch = async input => {
      const url = String(input); calls.push(url);
      const data = url.endsWith('/repos/owner/repo') ? { private: false, default_branch: 'main' }
        : url.includes('/commits/') ? { sha: ref, commit: { tree: { sha: 'b'.repeat(40) } } }
        : url.endsWith(`/git/trees/${'b'.repeat(40)}`) ? { tree: [{ path: 'src', sha: 'd'.repeat(40), mode: '040000' }, { path: 'image.png', sha: 'f'.repeat(40), mode: '100644', size: 8 }] }
        : url.includes('/git/trees/') ? { tree: [{ path: 'README.md', sha: 'e'.repeat(40), mode: '100644', size: 11 }] }
        : { size: 11, encoding: 'base64', content: btoa('folder docs') };
      return new Response(JSON.stringify(data));
    };
    const service = new GithubRepositoryService(new PublicGithubClient(fetcher));
    const folder = await loadRepositoryPage(service, { ...target, path: 'src' }, new AbortController().signal);
    expect(folder.readme).toMatchObject({ path: 'src/README.md', text: 'folder docs' });
    const binary = await loadRepositoryPage(service, { ...target, path: 'image.png' }, new AbortController().signal);
    expect(binary.textError).toMatchObject({ code: 'binary' });
    expect(calls.some(url => url.endsWith(`/git/blobs/${'f'.repeat(40)}`))).toBe(false);
  });
});
