import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';

export type MusicTrack = {
  id: string;
  title: string;
  duration: number;
  tags: string[];
  user: string | null;
  previewUrl: string;
  downloadUrl: string | null;
};

export type SearchParams = {
  q: string;
  genre: string;
  order: 'popular' | 'latest';
  per_page: number;
  page: number;
};

export const GENRE_OPTIONS = [
  { label: 'Todos los géneros', value: 'all' },
  { label: 'Ambient',      value: 'ambient' },
  { label: 'Acoustic',     value: 'acoustic' },
  { label: 'Blues',        value: 'blues' },
  { label: 'Classical',    value: 'classical' },
  { label: 'Country',      value: 'country' },
  { label: 'Electronic',   value: 'electronic' },
  { label: 'Folk',         value: 'folk' },
  { label: 'Funk',         value: 'funk' },
  { label: 'Hip Hop',      value: 'hiphop' },
  { label: 'Indie',        value: 'indie' },
  { label: 'Instrumental', value: 'instrumental' },
  { label: 'Jazz',         value: 'jazz' },
  { label: 'Lounge',       value: 'lounge' },
  { label: 'Metal',        value: 'metal' },
  { label: 'Piano',        value: 'piano' },
  { label: 'Pop',          value: 'pop' },
  { label: 'R&B',          value: 'rnb' },
  { label: 'Reggae',       value: 'reggae' },
  { label: 'Rock',         value: 'rock' },
  { label: 'Soul',         value: 'soul' },
  { label: 'World',        value: 'world' },
];


export const PER_PAGE_OPTIONS = [10, 20, 50];

const DEFAULT_PARAMS: SearchParams = { q: '', genre: 'all', order: 'popular', per_page: 20, page: 1 };

export function useMusicSearch() {
  const [params, setParams] = useState<SearchParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [total, setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [playingId, setPlayingId]     = useState<string | null>(null);

  const executeSearch = useCallback(async (p: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const query: Record<string, string | number> = {
      order: p.order, per_page: p.per_page, page: p.page,
    };
    if (p.q.trim())                  query.q     = p.q.trim();
    if (p.genre && p.genre !== 'all') query.genre = p.genre;

    try {
      const { data } = await axios.get(`${API_URL}/api/v1/music/search`, { params: query });
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Error al buscar música. Intenta de nuevo.');
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    const next = { ...params, page: 1 };
    setParams(next);
    executeSearch(next);
  }, [params, executeSearch]);

  const handlePageChange = useCallback((page: number) => {
    const next = { ...params, page };
    setParams(next);
    executeSearch(next);
  }, [params, executeSearch]);

  const applyFilter = useCallback((patch: Partial<SearchParams>) => {
    const next = { ...params, ...patch, page: 1 };
    setParams(next);
    if (hasSearched) executeSearch(next);
  }, [params, hasSearched, executeSearch]);

  const togglePreview = useCallback((id: string) => {
    setPlayingId(prev => (prev === id ? null : id));
  }, []);

  const totalPages = params.per_page > 0 ? Math.ceil(total / params.per_page) : 0;

  return {
    params, setParams,
    results, total, totalPages,
    isLoading, error, hasSearched, playingId,
    handleSearch, handlePageChange, applyFilter, togglePreview,
  };
}
