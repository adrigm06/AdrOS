import type { GithubRepositoryService } from './repo-filesystem.js';
export type TerminalLanguage = 'es' | 'en';
export interface TerminalProject {
  id: string; title: string; description: Record<TerminalLanguage, string>;
  zone: string; stack: string[]; githubUrl: string; demoUrl: string; status: string;
}
export type TerminalAction = { kind: 'project'; id: string } | { kind: 'browser'; url: string } | { kind: 'cv' | 'contact' };
export interface CommandState { cwd: string; history: string[]; tour: number | null }
export interface CommandResult { output: string; cwd?: string; tour?: number | null; clear?: boolean; action?: TerminalAction }
export interface TerminalContext { projects: TerminalProject[]; lang: TerminalLanguage; github: GithubRepositoryService }
export interface VirtualNode { kind: 'directory' | 'file' | 'repo'; text?: string; projectId?: string }
export class TerminalError extends Error {
  constructor(public code: string, public detail = '') { super(`${code}${detail ? `: ${detail}` : ''}`); }
}
