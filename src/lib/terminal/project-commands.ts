import { PROFILE } from '../../data/profile.js';
import { terminalCopy } from '../../i18n/terminal.js';
import { TerminalError, type CommandResult, type CommandState, type TerminalContext, type TerminalProject } from './types.js';

export const COMMANDS = ['help', 'ls', 'cd', 'pwd', 'cat', 'open', 'clear', 'history', 'whoami', 'cv', 'contact', 'repo', 'projects', 'tour', 'hire'];
export const USAGE: Record<string, string> = {
  help: 'help [command]', ls: 'ls [path]', cd: 'cd [path]', pwd: 'pwd', cat: 'cat <path>',
  open: 'open <project-id | "project title" | path> [--demo | --github]', clear: 'clear', history: 'history', whoami: 'whoami', cv: 'cv', contact: 'contact',
  repo: 'repo [project-id]', projects: 'projects [query] [--stack <value>] [--zone android|fullstack|ai-tools]', tour: 'tour [next|back|exit]', hire: 'hire',
};
export function findProject(context: TerminalContext, value: string | undefined, cwd: string): TerminalProject {
  const id = value ?? cwd.split('/')[2];
  const project = context.projects.find(entry => entry.id.toLowerCase() === id?.toLowerCase() || entry.title.toLowerCase() === id?.toLowerCase());
  if (!project) throw new TerminalError('missing', id ?? 'project');
  return project;
}
export function filterProjects(args: string[], context: TerminalContext): CommandResult {
  const query: string[] = []; let stack = '', zone = '';
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--stack' || argument === '--zone') {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new TerminalError('flag', argument);
      if (argument === '--stack') stack = value.toLowerCase(); else zone = value.toLowerCase();
    } else if (argument.startsWith('-')) throw new TerminalError('flag', argument); else query.push(argument);
  }
  if (zone && !['android', 'fullstack', 'ai-tools'].includes(zone)) throw new TerminalError('flag', '--zone android|fullstack|ai-tools');
  const search = query.join(' ').toLowerCase();
  const matches = context.projects.filter(project =>
    `${project.id} ${project.title} ${project.description[context.lang]} ${project.stack.join(' ')}`.toLowerCase().includes(search) &&
    (!stack || project.stack.some(item => item.toLowerCase().includes(stack))) && (!zone || project.zone === zone));
  return { output: matches.map(project => `${project.id} · ${project.title}\n  ${project.zone} | ${project.stack.join(', ')}\n  open ${project.id}`).join('\n\n') || terminalCopy[context.lang].noProjects };
}

export function tourCommand(args: string[], state: CommandState, context: TerminalContext): CommandResult {
  const t = terminalCopy[context.lang];
  if (args.length > 1 || (args[0] && !['next', 'back', 'exit'].includes(args[0]))) throw new TerminalError('usage', USAGE.tour);
  if (args[0] === 'exit') return { output: t.tourStopped, tour: null };
  const step = args[0] === 'next' ? (state.tour ?? -1) + 1 : args[0] === 'back' ? Math.max(0, (state.tour ?? 0) - 1) : 0;
  const project = context.projects[0];
  const steps = context.lang === 'es' ? [
    'Ubícate: pwd muestra tu ruta y ls enumera las carpetas. Prueba: ls /',
    'Explora el catálogo: cd /projects y ls. También puedes filtrar: projects --stack Kotlin',
    `Abre un proyecto en una ventana: open ${project?.id ?? '<id>'}. Lee su ficha con cat /projects/${project?.id ?? '<id>'}/README.md`,
    'Si tiene repositorio público: repo <id> monta una instantánea real. Usa ls, cd y cat para explorar. Ctrl+C cancela una consulta.',
    'Para contactar o ver el CV: contact y cv. hire resume el perfil profesional. Usa help <comando> para aprender más.',
  ] : [
    'Get oriented: pwd shows your path and ls lists folders. Try: ls /',
    'Explore the catalog: cd /projects and ls. You can also filter: projects --stack Kotlin',
    `Open a project window: open ${project?.id ?? '<id>'}. Read its summary: cat /projects/${project?.id ?? '<id>'}/README.md`,
    'For a linked public repository: repo <id> mounts a real snapshot. Use ls, cd and cat. Ctrl+C cancels a request.',
    'To get in touch or view the CV: contact and cv. hire summarizes the professional profile. Use help <command> to learn more.',
  ];
  return step >= steps.length ? { output: t.tourDone, tour: null } : { output: `Tour ${step + 1}/${steps.length}\n${steps[step]}\n\ntour next | tour back | tour exit`, tour: step };
}

export function recruiterSummary(context: TerminalContext): CommandResult {
  const profile = PROFILE[context.lang];
  const priorities = ['avisia', 'android-skill-pkg', 'androbox', 'betterprompt', 'keyout'];
  const projects = [...context.projects].sort((a, b) => {
    const rank = (id: string) => priorities.includes(id) ? priorities.indexOf(id) : priorities.length;
    return rank(a.id) - rank(b.id);
  }).slice(0, 5);
  return { output: `${terminalCopy[context.lang].recruiter}\n${profile.name}\n${profile.role}\n${profile.location}\n\n${profile.bio}\n\n${projects.map(project => `${project.title}: ${project.description[context.lang]}\n  open ${project.id}`).join('\n\n')}\n\ncv · contact · projects` };
}
