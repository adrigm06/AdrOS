import { useEffect, useRef, useState } from 'react';
import type { RepositoryTarget } from '@/lib/browser';
import { loadRepositoryPage, type RepositoryPage } from '@/lib/repository/page';
import type { GithubRepositoryService } from '@/lib/terminal/repo-filesystem';

export function useRepositoryPage(service: GithubRepositoryService, target: RepositoryTarget) {
  const [state, setState] = useState<{ page?: RepositoryPage; error?: unknown }>({});
  const active = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    active.current = controller;
    let disposed = false;
    setState({});
    loadRepositoryPage(service, target, controller.signal).then(
      page => { if (!disposed && !controller.signal.aborted) setState({ page }); },
      error => { if (!disposed) setState({ error }); },
    );
    return () => { disposed = true; controller.abort(); if (active.current === controller) active.current = null; };
  }, [service, target]);
  return { ...state, cancel: () => active.current?.abort() };
}
