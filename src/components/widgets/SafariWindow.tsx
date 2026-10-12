import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Lang } from '@/hooks/useLanguage';

interface SafariWindowProps {
  lang: Lang;
}

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
}

interface GitHubRepo {
  id?: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at?: string;
}

const FALLBACK_USER: GitHubUser = {
  login: 'adrigm06',
  name: 'Adrián Gómez',
  avatar_url: '/avatar.webp',
  bio: 'Full Stack Developer & AI Engineer. Java, Spring Boot, Android (Kotlin) & LLM architectures.',
  location: 'Málaga, Spain',
  followers: 18,
  following: 24,
  public_repos: 14,
  html_url: 'https://github.com/adrigm06',
};

const FALLBACK_REPOS: GitHubRepo[] = [
  {
    name: 'AdrOS',
    description: 'Personal portfolio mimicking a macOS Sonoma operating system built with Astro and React.',
    language: 'TypeScript',
    stargazers_count: 6,
    forks_count: 1,
    html_url: 'https://github.com/adrigm06/AdrOS',
  },
  {
    name: 'AndroBox',
    description: 'Developer workbench and Android utilities written in Kotlin and Jetpack Compose with Clean Architecture.',
    language: 'Kotlin',
    stargazers_count: 8,
    forks_count: 2,
    html_url: 'https://github.com/adrigm06/androbox',
  },
  {
    name: 'Keyout',
    description: 'Minimalist key mapper and productivity utility with background service integration.',
    language: 'Kotlin',
    stargazers_count: 4,
    forks_count: 0,
    html_url: 'https://github.com/adrigm06/keyout',
  },
  {
    name: 'BetterPrompt',
    description: 'Prompt engineering workbench, evaluation metrics, and system template manager.',
    language: 'TypeScript',
    stargazers_count: 7,
    forks_count: 1,
    html_url: 'https://github.com/adrigm06/betterprompt',
  },
  {
    name: 'terax-ai',
    description: 'Autonomous AI lead qualification and customer intelligence workflow system.',
    language: 'Python',
    stargazers_count: 5,
    forks_count: 1,
    html_url: 'https://github.com/adrigm06/terax-ai',
  },
  {
    name: 'avisia',
    description: 'Intelligent SaaS monitoring platform with automated webhook alert pipelines.',
    language: 'TypeScript',
    stargazers_count: 4,
    forks_count: 0,
    html_url: 'https://github.com/adrigm06/avisia',
  },
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Kotlin: '#A97BFF',
  Python: '#3572A5',
  Java: '#B07219',
  Astro: '#FF5A03',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Shell: '#89E051',
  Rust: '#DEA584',
};

export default function SafariWindow({ lang }: SafariWindowProps) {
  const [history, setHistory] = useState<string[]>(['github.com/adrigm06']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'stars'>('overview');
  const [searchRepo, setSearchRepo] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<GitHubUser>(FALLBACK_USER);
  const [repos, setRepos] = useState<GitHubRepo[]>(FALLBACK_REPOS);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  const currentUrl = history[historyIdx] || 'github.com/adrigm06';

  // Fetch live GitHub profile & repositories
  useEffect(() => {
    let cancelled = false;

    async function fetchGitHubData() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch('https://api.github.com/users/adrigm06'),
          fetch('https://api.github.com/users/adrigm06/repos?sort=updated&per_page=12'),
        ]);

        if (!cancelled && userRes.ok) {
          const userData = await userRes.json();
          setUser({
            login: userData.login || FALLBACK_USER.login,
            name: userData.name || FALLBACK_USER.name,
            avatar_url: userData.avatar_url || FALLBACK_USER.avatar_url,
            bio: userData.bio || FALLBACK_USER.bio,
            location: userData.location || FALLBACK_USER.location,
            followers: typeof userData.followers === 'number' ? userData.followers : FALLBACK_USER.followers,
            following: typeof userData.following === 'number' ? userData.following : FALLBACK_USER.following,
            public_repos: typeof userData.public_repos === 'number' ? userData.public_repos : FALLBACK_USER.public_repos,
            html_url: userData.html_url || FALLBACK_USER.html_url,
          });
        }

        if (!cancelled && reposRes.ok) {
          const reposData = await reposRes.json();
          if (Array.isArray(reposData) && reposData.length > 0) {
            setRepos(reposData.map((r: any) => ({
              id: r.id,
              name: r.name,
              description: r.description,
              language: r.language,
              stargazers_count: r.stargazers_count ?? 0,
              forks_count: r.forks_count ?? 0,
              html_url: r.html_url || `https://github.com/adrigm06/${r.name}`,
              updated_at: r.updated_at,
            })));
          }
        }
      } catch {
        // Silently use fallback data
      }
    }

    fetchGitHubData();
    return () => { cancelled = true; };
  }, []);

  const navigateTo = useCallback((url: string, repo: GitHubRepo | null = null) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHistory(prev => {
        const newHist = prev.slice(0, historyIdx + 1);
        return [...newHist, url];
      });
      setHistoryIdx(prev => prev + 1);
      setSelectedRepo(repo);
      if (!repo) {
        setActiveTab('overview');
      }
    }, 180);
  }, [historyIdx]);

  const handleBack = () => {
    if (historyIdx > 0) {
      setHistoryIdx(prev => prev - 1);
      const targetUrl = history[historyIdx - 1];
      if (targetUrl === 'github.com/adrigm06') {
        setSelectedRepo(null);
      } else {
        const repoName = targetUrl.split('/')[2];
        const found = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase());
        setSelectedRepo(found || null);
      }
    }
  };

  const handleForward = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(prev => prev + 1);
      const targetUrl = history[historyIdx + 1];
      if (targetUrl === 'github.com/adrigm06') {
        setSelectedRepo(null);
      } else {
        const repoName = targetUrl.split('/')[2];
        const found = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase());
        setSelectedRepo(found || null);
      }
    }
  };

  const handleReload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 260);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${currentUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const filteredRepos = useMemo(() => {
    if (!searchRepo.trim()) return repos;
    return repos.filter(r =>
      r.name.toLowerCase().includes(searchRepo.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchRepo.toLowerCase())) ||
      (r.language && r.language.toLowerCase().includes(searchRepo.toLowerCase()))
    );
  }, [repos, searchRepo]);

  // Synthetic 52-week activity heatmap (seeded for stable appearance)
  const heatmapData = useMemo(() => {
    const weeks: number[][] = [];
    for (let w = 0; w < 36; w++) {
      const days: number[] = [];
      for (let d = 0; d < 7; d++) {
        const hash = (w * 13 + d * 7 + (w % 5) * 3) % 17;
        const level = hash > 12 ? 4 : hash > 8 ? 3 : hash > 4 ? 2 : hash > 1 ? 1 : 0;
        days.push(level);
      }
      weeks.push(days);
    }
    return weeks;
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] select-none font-sans overflow-hidden">
      {/* ── macOS Safari Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBack}
            disabled={historyIdx === 0}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title={lang === 'es' ? 'Atrás' : 'Back'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={historyIdx >= history.length - 1}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title={lang === 'es' ? 'Adelante' : 'Forward'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Safari Unified Smart Search & Address Field */}
        <div className="flex-1 flex items-center justify-center max-w-xl mx-auto">
          <div className="w-full h-7 px-3 rounded-[8px] bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-2 shadow-inner group focus-within:border-[var(--os-blue)] transition-colors">
            {/* Lock / Security Icon */}
            <div className="flex items-center gap-1.5 flex-shrink-0 text-white/50">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2ea043" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            {/* URL Display */}
            <span className="font-mono text-xs text-white/80 truncate tracking-tight text-center flex-1">
              {currentUrl}
            </span>

            {/* Refresh / Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleReload}
                className="text-white/40 hover:text-white/80 transition-colors"
                title={lang === 'es' ? 'Recargar página' : 'Reload page'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => window.open(`https://${currentUrl}`, '_blank')}
                className="text-white/40 hover:text-[var(--os-blue)] transition-colors"
                title={lang === 'es' ? 'Abrir en pestaña externa' : 'Open in external tab'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Share Button with Copy Feedback */}
        <button
          type="button"
          onClick={handleCopy}
          className="relative px-2.5 h-7 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 flex-shrink-0"
          title={lang === 'es' ? 'Copiar enlace' : 'Copy link'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="hidden sm:inline">{copied ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Compartir' : 'Share')}</span>
        </button>
      </div>

      {/* Safari Loading Bar */}
      {loading && (
        <div className="h-[2px] w-full bg-[var(--os-blue)] animate-pulse" />
      )}

      {/* ── GitHub Top Header ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* GitHub Octocat Brand */}
          <button
            type="button"
            onClick={() => navigateTo('github.com/adrigm06', null)}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
            <span className="font-semibold text-sm text-white tracking-tight hidden sm:inline">GitHub</span>
          </button>

          <span className="text-[#30363d]">/</span>
          <button
            type="button"
            onClick={() => navigateTo('github.com/adrigm06', null)}
            className="text-xs sm:text-sm font-semibold text-[#58a6ff] hover:underline"
          >
            {user.login}
          </button>
          {selectedRepo && (
            <>
              <span className="text-[#30363d]">/</span>
              <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[140px] sm:max-w-none">
                {selectedRepo.name}
              </span>
            </>
          )}
        </div>

        {/* Profile Tabs */}
        {!selectedRepo && (
          <div className="flex items-center gap-1 sm:gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              {lang === 'es' ? 'Resumen' : 'Overview'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('repositories')}
              className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'repositories'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              <span>{lang === 'es' ? 'Repositorios' : 'Repositories'}</span>
              <span className="px-1.5 py-0.2 bg-[#30363d] rounded-full text-[10px] text-white/80">
                {repos.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content Area (Scrollable) ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#30363d transparent' }}>
        {selectedRepo ? (
          /* ── Detail: Single Repository View ── */
          <div className="max-w-4xl mx-auto flex flex-col gap-5">
            {/* Repo Header Card */}
            <div className="p-4 sm:p-5 rounded-[10px] bg-[#161b22] border border-[#30363d] flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-[#58a6ff]">
                    {selectedRepo.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium border border-[#30363d] text-[#8b949e]">
                    Public
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(selectedRepo.html_url, '_blank')}
                    className="px-3 py-1.5 rounded-[6px] bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>{lang === 'es' ? 'Ver en GitHub' : 'View on GitHub'}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-sm text-[#8b949e] leading-relaxed">
                {selectedRepo.description || (lang === 'es' ? 'Sin descripción proporcionada.' : 'No description provided.')}
              </p>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#8b949e] pt-3 border-t border-[#30363d]">
                {selectedRepo.language && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: LANG_COLORS[selectedRepo.language] || '#8b949e' }}
                    />
                    <span className="text-white/80">{selectedRepo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{selectedRepo.stargazers_count} stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🍴</span>
                  <span>{selectedRepo.forks_count} forks</span>
                </div>
              </div>
            </div>

            {/* Clone Box */}
            <div className="p-4 rounded-[10px] bg-[#161b22] border border-[#30363d] flex flex-col gap-2">
              <span className="text-xs font-semibold text-white/90">
                {lang === 'es' ? 'Clonar este repositorio' : 'Clone this repository'}
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-[6px] bg-[#0d1117] border border-[#30363d] font-mono text-xs text-[#58a6ff] overflow-x-auto">
                <span className="truncate">git clone {selectedRepo.html_url}.git</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`git clone ${selectedRepo.html_url}.git`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-white text-[11px] font-sans flex-shrink-0 transition-colors"
                >
                  {copied ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy')}
                </button>
              </div>
            </div>

            {/* Back button */}
            <div>
              <button
                type="button"
                onClick={() => navigateTo('github.com/adrigm06', null)}
                className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1"
              >
                <span>←</span>
                <span>{lang === 'es' ? 'Volver al perfil de Adrián' : 'Back to Adrián\'s profile'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Overview / Repositories: Profile View ── */
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
            {/* Left Column: User Profile Details */}
            <div className="w-full md:w-64 flex flex-col items-center md:items-start gap-4 flex-shrink-0">
              {/* Avatar */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#30363d] shadow-lg bg-[#161b22]">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Names */}
              <div className="text-center md:text-left flex flex-col">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {user.name}
                </h2>
                <span className="text-sm font-medium text-[#8b949e]">
                  {user.login}
                </span>
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={() => setIsFollowing(!isFollowing)}
                className={`w-full py-1.5 px-3 rounded-[6px] text-xs font-semibold border transition-all ${
                  isFollowing
                    ? 'bg-[#21262d] border-[#30363d] text-white/90 hover:bg-[#30363d]'
                    : 'bg-[#21262d] border-[#30363d] text-white hover:bg-[#30363d]'
                }`}
              >
                {isFollowing ? (lang === 'es' ? '✓ Siguiendo' : '✓ Following') : (lang === 'es' ? 'Seguir' : 'Follow')}
              </button>

              {/* Bio */}
              <p className="text-xs leading-relaxed text-[#c9d1d9] text-center md:text-left">
                {user.bio}
              </p>

              {/* Stats & Metadata */}
              <div className="flex flex-col gap-2 w-full pt-3 border-t border-[#30363d] text-xs text-[#8b949e]">
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.234 4.002 4.002 0 0 0-7.864 0 .75.75 0 0 1-1.482-.234A5.507 5.507 0 0 1 3.102 8.05 3.49 3.49 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.509.936.752.752 0 0 1-.937-.51 3.513 3.513 0 0 0-2.433-2.608.75.75 0 0 1-.41-.956A1.5 1.5 0 0 0 11 7.5a1.5 1.5 0 0 0 0-3Z" />
                  </svg>
                  <span>
                    <strong className="text-white">{user.followers + (isFollowing ? 1 : 0)}</strong> followers · <strong className="text-white">{user.following}</strong> following
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192 0ZM9 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                  </svg>
                  <span>{user.location}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z" />
                  </svg>
                  <a
                    href="https://www.linkedin.com/in/adrigml/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#58a6ff] hover:underline truncate"
                  >
                    linkedin.com/in/adrigml
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Repositories & Activity Grid */}
            <div className="flex-1 flex flex-col gap-6">
              {activeTab === 'overview' && (
                <>
                  {/* Pinned Repositories Header */}
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
                      <h3 className="text-xs font-semibold text-white/90">
                        {lang === 'es' ? 'Repositorios destacados' : 'Pinned repositories'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('repositories')}
                        className="text-xs text-[#58a6ff] hover:underline"
                      >
                        {lang === 'es' ? 'Ver todos' : 'View all'}
                      </button>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
                      {repos.slice(0, 6).map((repo) => (
                        <div
                          key={repo.name}
                          onClick={() => navigateTo(`github.com/adrigm06/${repo.name}`, repo)}
                          className="p-3.5 rounded-[8px] bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/50 transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-xs text-[#58a6ff] group-hover:underline truncate">
                                {repo.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full border border-[#30363d] text-[#8b949e]">
                                Public
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8b949e] line-clamp-2 leading-relaxed">
                              {repo.description || (lang === 'es' ? 'Sin descripción' : 'No description')}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-[#8b949e]">
                            {repo.language && (
                              <div className="flex items-center gap-1">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b949e' }}
                                />
                                <span className="text-white/70">{repo.language}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span>⭐</span>
                              <span>{repo.stargazers_count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contributions Heatmap Simulation */}
                  <div className="p-4 rounded-[8px] bg-[#161b22] border border-[#30363d] flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs text-white/90">
                      <span className="font-semibold">
                        {lang === 'es' ? '348 contribuciones en el último año' : '348 contributions in the last year'}
                      </span>
                      <span className="text-[11px] text-[#8b949e]">
                        {lang === 'es' ? 'Menos' : 'Less'}{' '}
                        <span className="inline-block w-2.5 h-2.5 bg-[#161b22] border border-[#30363d] mx-0.5 rounded-[2px]" />
                        <span className="inline-block w-2.5 h-2.5 bg-[#0e4429] mx-0.5 rounded-[2px]" />
                        <span className="inline-block w-2.5 h-2.5 bg-[#006d32] mx-0.5 rounded-[2px]" />
                        <span className="inline-block w-2.5 h-2.5 bg-[#26a641] mx-0.5 rounded-[2px]" />
                        <span className="inline-block w-2.5 h-2.5 bg-[#39d353] mx-0.5 rounded-[2px]" />{' '}
                        {lang === 'es' ? 'Más' : 'More'}
                      </span>
                    </div>

                    {/* Grid */}
                    <div className="overflow-x-auto pb-1">
                      <div className="flex gap-[3px] min-w-[500px]">
                        {heatmapData.map((week, wIdx) => (
                          <div key={wIdx} className="flex flex-col gap-[3px]">
                            {week.map((level, dIdx) => {
                              const bg =
                                level === 4 ? '#39d353' :
                                level === 3 ? '#26a641' :
                                level === 2 ? '#006d32' :
                                level === 1 ? '#0e4429' : '#161b22';
                              return (
                                <div
                                  key={dIdx}
                                  className="w-[10px] h-[10px] rounded-[2px] transition-transform hover:scale-125"
                                  style={{
                                    backgroundColor: bg,
                                    border: level === 0 ? '1px solid #21262d' : undefined,
                                  }}
                                  title={`Activity level: ${level}`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'repositories' && (
                /* ── Full Repositories List View ── */
                <div className="flex flex-col gap-3">
                  {/* Search / Filter box */}
                  <div className="flex items-center gap-2 pb-3 border-b border-[#30363d]">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchRepo}
                        onChange={(e) => setSearchRepo(e.target.value)}
                        placeholder={lang === 'es' ? 'Buscar repositorio...' : 'Find a repository...'}
                        className="w-full px-3 py-1.5 rounded-[6px] bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-white/40 focus:border-[var(--os-blue)] outline-none transition-colors"
                      />
                    </div>
                    <span className="text-xs text-[#8b949e]">
                      {filteredRepos.length} {lang === 'es' ? 'resultados' : 'results'}
                    </span>
                  </div>

                  {/* List */}
                  <div className="flex flex-col divide-y divide-[#30363d]">
                    {filteredRepos.map((repo) => (
                      <div
                        key={repo.name}
                        onClick={() => navigateTo(`github.com/adrigm06/${repo.name}`, repo)}
                        className="py-3.5 flex flex-col gap-1.5 hover:bg-white/[0.02] px-2 rounded-[6px] cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#58a6ff] group-hover:underline">
                            {repo.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full border border-[#30363d] text-[#8b949e]">
                            Public
                          </span>
                        </div>
                        {repo.description && (
                          <p className="text-xs text-[#8b949e] leading-relaxed">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#8b949e] pt-1">
                          {repo.language && (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: LANG_COLORS[repo.language] || '#8b949e' }}
                              />
                              <span className="text-white/80">{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>⭐</span>
                            <span>{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🍴</span>
                            <span>{repo.forks_count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
