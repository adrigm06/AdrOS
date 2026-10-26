import { useState } from 'react';
import type { Lang } from '@/hooks/useLanguage';

interface Props {
  lang: Lang;
  url: string;
  onBack?: () => void;
  onForward?: () => void;
  onHome?: () => void;
  onReload?: () => void;
  download?: { href: string; filename: string };
}

export default function BrowserToolbar({ lang, url, onBack, onForward, onHome, onReload, download }: Props) {
  const es = lang === 'es';
  const [copyStatus, setCopyStatus] = useState('');
  const button = 'browser-tool';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).href);
      setCopyStatus(es ? 'Enlace copiado' : 'Link copied');
    } catch { setCopyStatus(es ? 'No se pudo copiar. Selecciona la dirección.' : 'Could not copy. Select the address.'); }
  };
  return (
    <div className="browser-toolbar">
      {onHome && <button className={button} onClick={onHome} aria-label={es ? 'Inicio' : 'Home'}>⌂</button>}
      {onHome && <>
        <button className={button} disabled={!onBack} onClick={onBack} aria-label={es ? 'Atrás' : 'Back'}>←</button>
        <button className={button} disabled={!onForward} onClick={onForward} aria-label={es ? 'Adelante' : 'Forward'}>→</button>
      </>}
      <span className="browser-address" title={url}>{url}</span>
      {onReload && <button className={button} onClick={onReload} aria-label={es ? 'Recargar' : 'Reload'}>↻</button>}
      <button className={`${button} hidden sm:inline-flex`} onClick={copy}>{es ? 'Copiar' : 'Copy'}</button>
      <a className={button} href={url} target="_blank" rel="noopener noreferrer" aria-label={es ? 'Abrir en pestaña externa' : 'Open in external tab'}>↗</a>
      {download && <a className={`${button} browser-primary`} href={download.href} download={download.filename}>{es ? 'Descargar' : 'Download'} ↓</a>}
      <span className="sr-only" role="status">{copyStatus}</span>
    </div>
  );
}
