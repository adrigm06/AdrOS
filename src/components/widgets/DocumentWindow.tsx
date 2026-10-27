import type { Lang } from '@/hooks/useLanguage';
import { PERSONAL } from '@/data/personal';
import BrowserToolbar from './BrowserToolbar';
import preview from '@/data/cv-preview.json';

export default function DocumentWindow({ lang }: { lang: Lang }) {
  return (
    <section className="browser-app" aria-label={lang === 'es' ? 'Currículum de Adrián Gómez' : 'Adrián Gómez résumé'}>
      <BrowserToolbar lang={lang} url={PERSONAL.cv} download={{ href: PERSONAL.cv, filename: PERSONAL.cvFilename }} />
      <div className="browser-notice">
        <span>{lang === 'es' ? 'CV en inglés · PDF' : 'English CV · PDF'}</span>
        <a href={PERSONAL.cv} target="_blank" rel="noopener noreferrer">{lang === 'es' ? 'Abrir PDF original' : 'Open original PDF'} ↗</a>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-4" tabIndex={0} aria-label={lang === 'es' ? 'Vista previa del CV' : 'CV preview'}>
        {preview.pages.map((page, index) => <figure key={page.src} className="max-w-[1200px] mx-auto">
          <img src={page.src} width={page.width} height={page.height} loading={index === 0 ? 'eager' : 'lazy'} className="w-full h-auto"
            alt={lang === 'es' ? `CV de Adrián Gómez en inglés, página ${page.page}. Abre el PDF original para consultar el texto accesible.` : `Adrián Gómez English CV, page ${page.page}. Open the original PDF for accessible text.`} />
          <figcaption className="text-center text-xs text-[var(--os-text-dim)] py-2">{lang === 'es' ? 'Página' : 'Page'} {page.page}/{preview.pages.length}</figcaption>
        </figure>)}
      </div>
    </section>
  );
}
