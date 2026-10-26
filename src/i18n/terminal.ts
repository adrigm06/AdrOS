import type { TerminalLanguage } from '../lib/terminal/types.js';
export const terminalCopy = {
  en: {
    welcome: 'AdrOS Terminal · Read-only virtual portfolio, not your disk or a server shell.\nType help, or start tour. No commands execute code or modify repositories.',
    placeholder: 'Type help to get started', input: 'Terminal command', running: 'Reading public GitHub data…', cancel: 'Cancel',
    noProjects: 'No projects match.', opened: 'Opened in AdrOS.', readonly: 'Read-only. Shell operators, scripts and system commands are not supported.',
    help: 'Commands: help, ls, cd, pwd, cat, open, clear, history, whoami, cv, contact, repo, projects, tour, hire\nUse help <command>. Tab completes; ↑/↓ history; Ctrl+C cancels; Ctrl+L clears.\nOnly public linked repositories can be explored. GitHub requests are on demand, unauthenticated and rate limited.',
    errors: {
      input_limit: 'Command too long (maximum 1,024 characters).', operators: 'Shell operators are not supported. Run one read-only command at a time.',
      quote: 'Close the quote or finish the escape.', path: 'Invalid path.', missing: 'Path or project not found', directory: 'Not a directory',
      file: 'Not a text file', binary: 'Binary or unsupported text file. Use open or visit GitHub.', usage: 'Usage', command: 'Unknown command',
      flag: 'Unknown or incomplete option', repo: 'This project has no public GitHub repository linked.', not_found: 'Repository or path is private, missing or unavailable.',
      rate_limit: 'GitHub rate limit reached (public access has a shared request quota). Try later or open GitHub.',
      network: 'Could not reach GitHub. Check your connection; no automatic retry was made.', timeout: 'GitHub request timed out. No automatic retry was made.',
      cancelled: 'Request cancelled.', malformed: 'GitHub returned unsupported or malformed data.', large: 'File exceeds the 128 KiB text limit.',
      response_limit: 'GitHub response exceeded the safe download limit.', blocked: 'Symlinks and submodules are read-only references and cannot be followed.',
    },
    snapshot: 'Public repository snapshot', cap: 'Directory display limited to 1,000 entries; it may be incomplete.',
    tourDone: 'Tour finished. Try projects, hire, or help repo.', tourStopped: 'Tour closed.',
    recruiter: 'Recruiter overview', suggestions: 'Quick commands', completed: 'Command completed',
  },
  es: {
    welcome: 'AdrOS Terminal · Portafolio virtual de solo lectura, no es tu disco ni una consola del servidor.\nEscribe help o inicia tour. Ningún comando ejecuta código ni modifica repositorios.',
    placeholder: 'Escribe help para empezar', input: 'Comando de terminal', running: 'Leyendo datos públicos de GitHub…', cancel: 'Cancelar',
    noProjects: 'No hay proyectos que coincidan.', opened: 'Abierto en AdrOS.', readonly: 'Solo lectura. No se admiten operadores de shell, scripts ni comandos del sistema.',
    help: 'Comandos: help, ls, cd, pwd, cat, open, clear, history, whoami, cv, contact, repo, projects, tour, hire\nUsa help <comando>. Tab autocompleta; ↑/↓ historial; Ctrl+C cancela; Ctrl+L limpia.\nSolo se exploran repositorios públicos vinculados. Las consultas a GitHub son bajo demanda, sin autenticación y con límites.',
    errors: {
      input_limit: 'Comando demasiado largo (máximo 1.024 caracteres).', operators: 'No se admiten operadores de shell. Ejecuta un comando de solo lectura cada vez.',
      quote: 'Cierra las comillas o termina el escape.', path: 'Ruta no válida.', missing: 'Ruta o proyecto no encontrado', directory: 'No es una carpeta',
      file: 'No es un archivo de texto', binary: 'Archivo binario o texto no compatible. Usa open o visita GitHub.', usage: 'Uso', command: 'Comando desconocido',
      flag: 'Opción desconocida o incompleta', repo: 'Este proyecto no tiene vinculado un repositorio público de GitHub.', not_found: 'El repositorio o la ruta es privado, no existe o no está disponible.',
      rate_limit: 'Se ha alcanzado el límite de GitHub (el acceso público comparte una cuota). Inténtalo más tarde o abre GitHub.',
      network: 'No se pudo conectar con GitHub. Revisa la conexión; no se ha reintentado automáticamente.', timeout: 'La consulta a GitHub ha agotado el tiempo. No se ha reintentado automáticamente.',
      cancelled: 'Consulta cancelada.', malformed: 'GitHub ha devuelto datos no compatibles o mal formados.', large: 'El archivo supera el límite de texto de 128 KiB.',
      response_limit: 'La respuesta de GitHub supera el límite de descarga segura.', blocked: 'Los enlaces simbólicos y submódulos son referencias de solo lectura y no se siguen.',
    },
    snapshot: 'Instantánea del repositorio público', cap: 'Se muestran como máximo 1.000 entradas; la carpeta puede estar incompleta.',
    tourDone: 'Visita terminada. Prueba projects, hire o help repo.', tourStopped: 'Visita cerrada.',
    recruiter: 'Resumen para selección', suggestions: 'Comandos rápidos', completed: 'Comando terminado',
  },
};
export function terminalError(error: unknown, lang: TerminalLanguage): string {
  const code = error instanceof Error && 'code' in error ? String(error.code) : 'network';
  const dictionary = terminalCopy[lang].errors;
  const detail = error instanceof Error && 'detail' in error ? String(error.detail) : '';
  return `${dictionary[code as keyof typeof dictionary] ?? dictionary.network}${detail ? `: ${detail}` : ''}`;
}
