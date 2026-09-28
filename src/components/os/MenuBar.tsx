import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lang } from '@/hooks/useLanguage';
import CalendarPopover from './CalendarPopover';

interface MenuBarProps {
  lang: Lang;
  toggleLang: () => void;
  activeWindowTitle?: string;
  onOpenWallpaperPicker: () => void;
  onOpenProfile: () => void;
  onOpenContact: () => void;
  onOpenChat: () => void;
  viewMode: 'icons' | 'list';
  onToggleView: () => void;
  onRestart?: () => void;
}

interface MenuItem {
  label: string;
  action?: () => void;
  divider?: boolean;
  shortcut?: string;
  disabled?: boolean;
}

export default function MenuBar({
  lang,
  toggleLang,
  activeWindowTitle,
  onOpenWallpaperPicker,
  onOpenProfile,
  onOpenContact,
  onOpenChat,
  viewMode,
  onToggleView,
  onRestart,
}: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);

  const menuBarRef = useRef<HTMLDivElement>(null);
  const clockBtnRef = useRef<HTMLButtonElement>(null);
  const controlCenterBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = lang === 'es' ? 'es-ES' : 'en-US';
      const day = now.toLocaleDateString(locale, { weekday: 'short' });
      const dayNum = now.getDate();
      const month = now.toLocaleDateString(locale, { month: 'short' });
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${day} ${dayNum} ${month} ${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [lang]);

  // Click outside listener to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = {
    about: lang === 'es' ? 'Acerca de AdrOS' : 'About AdrOS',
    settings: lang === 'es' ? 'Ajustes del Sistema...' : 'System Settings...',
    wallpapers: lang === 'es' ? 'Cambiar fondo de pantalla...' : 'Change Wallpaper...',
    restart: lang === 'es' ? 'Reiniciar...' : 'Restart...',
    file: lang === 'es' ? 'Archivo' : 'File',
    view: lang === 'es' ? 'Visualización' : 'View',
    go: lang === 'es' ? 'Ir' : 'Go',
    window: lang === 'es' ? 'Ventana' : 'Window',
    help: lang === 'es' ? 'Ayuda' : 'Help',
    contact: lang === 'es' ? 'Contactar a Adrián' : 'Contact Adrián',
    profile: lang === 'es' ? 'Perfil y Experiencia' : 'Profile & Experience',
    siri: lang === 'es' ? 'Abrir AdrBOT' : 'Open AdrBOT',
    viewIcons: lang === 'es' ? 'Ver como iconos' : 'View as Icons',
    viewList: lang === 'es' ? 'Ver como lista' : 'View as List',
    github: 'GitHub — @adrigm06',
    linkedin: 'LinkedIn — Adrián Gómez',
  };

  const adrosMenu: MenuItem[] = [
    { label: t.about, action: onOpenProfile },
    { divider: true, label: '' },
    { label: t.wallpapers, action: onOpenWallpaperPicker, shortcut: '⌘W' },
    { divider: true, label: '' },
    { label: t.restart, action: onRestart || (() => window.location.reload()) },
  ];

  const fileMenu: MenuItem[] = [
    { label: t.contact, action: onOpenContact, shortcut: '⌘M' },
    { label: t.siri, action: onOpenChat, shortcut: '⌘K' },
    { divider: true, label: '' },
    { label: t.profile, action: onOpenProfile },
  ];

  const viewMenu: MenuItem[] = [
    {
      label: viewMode === 'icons' ? `✓ ${t.viewIcons}` : `  ${t.viewIcons}`,
      action: viewMode === 'list' ? onToggleView : undefined,
    },
    {
      label: viewMode === 'list' ? `✓ ${t.viewList}` : `  ${t.viewList}`,
      action: viewMode === 'icons' ? onToggleView : undefined,
    },
    { divider: true, label: '' },
    { label: t.wallpapers, action: onOpenWallpaperPicker },
  ];

  const goMenu: MenuItem[] = [
    { label: 'GitHub', action: () => window.open('https://github.com/adrigm06', '_blank') },
    { label: 'LinkedIn', action: () => window.open('https://www.linkedin.com/in/adrigml/', '_blank') },
    { divider: true, label: '' },
    { label: lang === 'es' ? 'Descargar CV' : 'Download CV', action: () => window.open('/Adrian_Gomez_FullStack_English.pdf', '_blank') },
  ];

  const helpMenu: MenuItem[] = [
    { label: lang === 'es' ? 'Preguntar a AdrBOT...' : 'Ask AdrBOT...', action: onOpenChat },
    { label: lang === 'es' ? 'Sobre el portafolio' : 'About Portfolio', action: onOpenProfile },
  ];

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleMenuHover = (menuName: string) => {
    if (openMenu !== null) {
      setOpenMenu(menuName);
    }
  };

  return (
    <div
      ref={menuBarRef}
      className="vibrancy-menubar w-full flex items-center justify-between px-2 select-none relative z-[99990]"
      style={{ height: 'var(--menubar-h)' }}
    >
      {/* ── LEFT: Apple/AdrOS Menu + Active App Menus ── */}
      <div className="flex items-center text-[13px] font-sans font-normal text-white/90">
        {/* AdrOS Logo Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => handleMenuClick('adros')}
            onMouseEnter={() => handleMenuHover('adros')}
            className={`flex items-center px-2 py-0.5 rounded-[4px] transition-colors duration-100 ${
              openMenu === 'adros' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            aria-label="AdrOS Menu"
          >
            <img
              src="/AdrOS.webp"
              alt="AdrOS Logo"
              className="w-4 h-4 object-contain"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
            />
          </button>
          <DropdownMenu
            isOpen={openMenu === 'adros'}
            items={adrosMenu}
            onClose={() => setOpenMenu(null)}
          />
        </div>

        {/* Current App Title (Bold) */}
        <span className="font-semibold px-2 py-0.5 text-white tracking-tight">
          {activeWindowTitle || 'AdrOS'}
        </span>

        {/* Standard App Menus */}
        <MenuButton
          label={t.file}
          isOpen={openMenu === 'file'}
          onClick={() => handleMenuClick('file')}
          onHover={() => handleMenuHover('file')}
          items={fileMenu}
          onClose={() => setOpenMenu(null)}
          className="hidden sm:block"
        />
        <MenuButton
          label={t.view}
          isOpen={openMenu === 'view'}
          onClick={() => handleMenuClick('view')}
          onHover={() => handleMenuHover('view')}
          items={viewMenu}
          onClose={() => setOpenMenu(null)}
          className="hidden sm:block"
        />
        <MenuButton
          label={t.go}
          isOpen={openMenu === 'go'}
          onClick={() => handleMenuClick('go')}
          onHover={() => handleMenuHover('go')}
          items={goMenu}
          onClose={() => setOpenMenu(null)}
          className="hidden md:block"
        />
        <MenuButton
          label={t.help}
          isOpen={openMenu === 'help'}
          onClick={() => handleMenuClick('help')}
          onHover={() => handleMenuHover('help')}
          items={helpMenu}
          onClose={() => setOpenMenu(null)}
          className="hidden md:block"
        />
      </div>

      {/* ── RIGHT: Status Items (Battery, WiFi, Control Center, Siri, Clock) ── */}
      <div className="flex items-center gap-1 text-[12px] font-sans font-normal text-white/90 pr-1">
        {/* Language switch button */}
        <button
          type="button"
          onClick={toggleLang}
          className="px-1.5 py-0.5 rounded-[4px] hover:bg-white/10 text-[11px] font-mono font-medium text-white/80 transition-colors"
          title={lang === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
        >
          {lang === 'es' ? 'ES' : 'EN'}
        </button>

        {/* Battery Icon */}
        <div className="hidden sm:flex items-center px-1.5 py-0.5 hover:bg-white/10 rounded-[4px] cursor-default" title="Batería: 100% (Alimentación de red)">
          <div className="w-[18px] h-[9px] border border-white/60 rounded-[2.5px] p-[1px] flex items-center relative mr-[2px]">
            <div className="w-full h-full bg-white/90 rounded-[1px]" />
            <div className="absolute -right-[3px] top-[2px] w-[1.5px] h-[3px] bg-white/60 rounded-r-[0.5px]" />
          </div>
        </div>

        {/* Wi-Fi Icon */}
        <div className="hidden sm:flex items-center px-1.5 py-0.5 hover:bg-white/10 rounded-[4px] cursor-default" title="Wi-Fi conectado">
          <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor" className="text-white/85">
            <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.24-3.24a6 6 0 0 1 8.48 0 .75.75 0 1 1-1.06 1.06 4.5 4.5 0 0 0-6.36 0 .75.75 0 0 1-1.06-1.06zm-2.83-2.83a10 10 0 0 1 14.14 0 .75.75 0 1 1-1.06 1.06 8.5 8.5 0 0 0-12.02 0 .75.75 0 0 1-1.06-1.06z" />
          </svg>
        </div>

        {/* Siri / Apple Intelligence Icon */}
        <button
          type="button"
          onClick={onOpenChat}
          className="flex items-center px-1.5 py-0.5 hover:bg-white/10 rounded-[4px] transition-colors"
          title="AdrBOT (Siri)"
        >
          <img
            src="/icons/siri.webp"
            alt="Siri"
            className="w-4 h-4 object-contain transition-transform hover:scale-110 active:scale-95"
            style={{ filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.5))' }}
          />
        </button>

        {/* Control Center Toggle */}
        <div className="relative">
          <button
            ref={controlCenterBtnRef}
            type="button"
            onClick={() => setControlCenterOpen(!controlCenterOpen)}
            className={`flex items-center px-1.5 py-0.5 rounded-[4px] transition-colors ${
              controlCenterOpen ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            title={lang === 'es' ? 'Centro de control' : 'Control Center'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-white/85">
              <rect x="1" y="2" width="14" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="5" cy="4.5" r="1.8" />
              <rect x="1" y="9" width="14" height="5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="11" cy="11.5" r="1.8" />
            </svg>
          </button>

          {/* Control Center Popover */}
          <ControlCenterPopover
            isOpen={controlCenterOpen}
            onClose={() => setControlCenterOpen(false)}
            onOpenWallpaperPicker={onOpenWallpaperPicker}
            onOpenProfile={onOpenProfile}
            lang={lang}
          />
        </div>

        {/* Clock & Calendar Trigger */}
        <button
          ref={clockBtnRef}
          type="button"
          onClick={() => setCalendarOpen(!calendarOpen)}
          className={`px-2 py-0.5 rounded-[4px] transition-colors font-medium tracking-tight ${
            calendarOpen ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          {time}
        </button>

        <CalendarPopover
          isOpen={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          anchorEl={clockBtnRef.current}
          lang={lang}
        />
      </div>
    </div>
  );
}

function MenuButton({
  label,
  isOpen,
  onClick,
  onHover,
  items,
  onClose,
  className = '',
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
  onHover: () => void;
  items: MenuItem[];
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={onHover}
        className={`px-2.5 py-0.5 rounded-[4px] transition-colors duration-100 ${
          isOpen ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
      >
        {label}
      </button>
      <DropdownMenu isOpen={isOpen} items={items} onClose={onClose} />
    </div>
  );
}

function DropdownMenu({
  isOpen,
  items,
  onClose,
}: {
  isOpen: boolean;
  items: MenuItem[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className="absolute left-0 top-[26px] min-w-[210px] py-1.5 rounded-[var(--radius-md)] vibrancy-popover z-[99999]"
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${idx}`} className="my-1 border-b border-white/10" />;
            }
            return (
              <button
                key={item.label || idx}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.action?.();
                  onClose();
                }}
                className={`w-full px-3 py-1 flex items-center justify-between text-left text-[12px] font-sans transition-colors ${
                  item.disabled
                    ? 'text-white/30 cursor-default'
                    : 'text-white/90 hover:bg-[var(--os-blue)] hover:text-white rounded-[4px] mx-1 my-0.5'
                }`}
                style={{ width: 'calc(100% - 8px)' }}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-[10px] opacity-60 font-mono tracking-wider ml-4">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ControlCenterPopover({
  isOpen,
  onClose,
  onOpenWallpaperPicker,
  onOpenProfile,
  lang,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallpaperPicker: () => void;
  onOpenProfile: () => void;
  lang: Lang;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleOutside);
    }
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="fixed sm:absolute right-2 sm:right-0 top-[calc(var(--menubar-h)+4px)] sm:top-[28px] w-[calc(100vw-16px)] sm:w-[310px] max-w-[320px] p-3 rounded-[var(--radius-xl)] vibrancy-popover z-[99999]"
          style={{ boxShadow: 'var(--shadow-window)' }}
        >
          {/* Top 2x2 Grid Modules */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Wi-Fi & Bluetooth Module */}
            <div className="bg-white/5 rounded-[var(--radius-lg)] p-2.5 flex flex-col gap-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--os-blue)] flex items-center justify-center text-white">
                  <svg width="14" height="11" viewBox="0 0 16 12" fill="currentColor">
                    <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.24-3.24a6 6 0 0 1 8.48 0 .75.75 0 1 1-1.06 1.06 4.5 4.5 0 0 0-6.36 0 .75.75 0 0 1-1.06-1.06z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-white">Wi-Fi</span>
                  <span className="text-[9px] text-white/50">{lang === 'es' ? 'Conectado' : 'Connected'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--os-blue)] flex items-center justify-center text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.5 12l4-4-5-5v7.2L9.4 6.1l-1.4 1.4 5.1 5.1-5.1 5.1 1.4 1.4L13.5 15v7.2l5-5-4-4.2zm-2-6.8l2.6 2.6L12.5 10.4V5.2zm2.6 13.6L12.5 16.2v-5.2l2.6 2.6v5.2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-white">Bluetooth</span>
                  <span className="text-[9px] text-white/50">{lang === 'es' ? 'Activo' : 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Quick Profile / System Info Module */}
            <button
              type="button"
              onClick={() => {
                onOpenProfile();
                onClose();
              }}
              className="bg-white/5 hover:bg-white/10 rounded-[var(--radius-lg)] p-2.5 flex flex-col justify-between border border-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <img src="/avatar.webp" alt="Adrián" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-semibold text-white truncate">Adrián Gómez</span>
                  <span className="text-[9px] text-white/50 truncate">Mobile & Web</span>
                </div>
              </div>
              <span className="text-[10px] text-[var(--os-blue)] font-medium mt-2">
                {lang === 'es' ? 'Ver información ➔' : 'View Info ➔'}
              </span>
            </button>
          </div>

          {/* Wallpaper Quick Switcher */}
          <div className="bg-white/5 rounded-[var(--radius-lg)] p-2.5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icons/settings.webp" alt="Settings" className="w-6 h-6 object-contain" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-white">{lang === 'es' ? 'Fondo de pantalla' : 'Wallpaper'}</span>
                <span className="text-[9px] text-white/50">{lang === 'es' ? 'Personalizar aspecto' : 'Customize background'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenWallpaperPicker();
                onClose();
              }}
              className="px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white/20 text-[10px] font-medium text-white transition-colors"
            >
              {lang === 'es' ? 'Cambiar' : 'Change'}
            </button>
          </div>

          {/* Display Brightness Slider Simulation */}
          <div className="bg-white/5 rounded-[var(--radius-lg)] p-2.5 border border-white/5 mt-2 flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-white/70">{lang === 'es' ? 'Pantalla' : 'Display'}</span>
            <div className="w-full h-5 bg-white/10 rounded-full overflow-hidden p-0.5 flex items-center">
              <div className="h-full bg-white rounded-full flex items-center justify-start pl-2" style={{ width: '85%' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#000">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="21" x2="12" y2="23" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
