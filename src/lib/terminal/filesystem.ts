import { PERSONAL } from '../../data/personal.js';
import { PROFILE } from '../../data/profile.js';
import { parseBrowserTarget } from '../browser.js';
import type { TerminalLanguage, TerminalProject, VirtualNode } from './types.js';
import { normalizePath } from './parser.js';

export function createVirtualFiles(projects: TerminalProject[], lang: TerminalLanguage): Map<string, VirtualNode> {
  const files = new Map<string, VirtualNode>();
  const directory = (path: string) => files.set(path, { kind: 'directory' });
  const file = (path: string, text: string) => files.set(path, { kind: 'file', text });
  ['/', '/projects', '/documents', '/about'].forEach(directory);
  file('/about/profile.txt', `${PROFILE[lang].name}\n${PROFILE[lang].role}\n${PROFILE[lang].location}\n\n${PROFILE[lang].bio}`);
  file('/about/contact.txt', `${PERSONAL.email}\ncontact\n${PERSONAL.github}`);
  files.set('/documents/CV.pdf', { kind: 'file' });
  for (const project of projects) {
    const path = `/projects/${project.id}`;
    directory(path);
    file(`${path}/README.md`, `${project.title}\n\n${project.description[lang]}\n\nStack: ${project.stack.join(', ')}\nZone: ${project.zone}\nStatus: ${project.status}\nGitHub: ${project.githubUrl || '-'}\nDemo: ${project.demoUrl || '-'}`);
    file(`${path}/metadata.json`, JSON.stringify(project, null, 2));
    if (parseBrowserTarget(project.githubUrl)?.kind === 'repository') files.set(`${path}/repo`, { kind: 'repo', projectId: project.id });
  }
  return files;
}

export function localChildren(files: Map<string, VirtualNode>, path: string) {
  const prefix = path === '/' ? '/' : `${path}/`;
  return [...files].flatMap(([key, node]) => {
    if (!key.startsWith(prefix) || key === path || key.slice(prefix.length).includes('/')) return [];
    return [{ name: key.slice(prefix.length), directory: node.kind !== 'file', blocked: false }];
  });
}

export function repositoryPath(projects: TerminalProject[], path: string) {
  const segments = normalizePath('/', path).split('/').filter(Boolean);
  if (segments[0] !== 'projects' || segments[2] !== 'repo') return null;
  const project = projects.find(entry => entry.id === segments[1]);
  if (!project || parseBrowserTarget(project.githubUrl)?.kind !== 'repository') return null;
  return { project, path: segments.slice(3).join('/') };
}
