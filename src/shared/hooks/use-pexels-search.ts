import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MediaType    = 'images' | 'videos';
export type Orientation  = 'all' | 'landscape' | 'portrait' | 'square';

export type PexelsItem = {
  id: string;
  type: string;           // 'photo' | 'video'
  tags: string[];
  previewUrl: string | null;
  webformatUrl: string | null;
  largeUrl: string | null;
  downloadUrl: string | null;
  pageUrl: string | null;
  user: string | null;
  userImageUrl: string | null;
  width: number;
  height: number;
  views: number;
  downloads: number;
  likes: number;
  duration: number | null;
  // only present for videos
  videos?: {
    large: string | null;
    medium: string | null;
    small: string | null;
    tiny: string | null;
  };
};

export type SearchParams = {
  q: string;
  media_type: MediaType;
  orientation: Orientation;
  per_page: number;
  page: number;
};

// ── Constants ─────────────────────────────────────────────────────────────────

export const MEDIA_TYPE_OPTIONS: { label: string; value: MediaType }[] = [
  { label: 'Imágenes', value: 'images' },
  { label: 'Videos',   value: 'videos' },
];

export const ORIENTATION_OPTIONS: { label: string; value: Orientation }[] = [
  { label: 'Todas',     value: 'all' },
  { label: 'Horizontal', value: 'landscape' },
  { label: 'Vertical',  value: 'portrait' },
  { label: 'Cuadrada',  value: 'square' },
];

const DEFAULT_PARAMS: SearchParams = {
  q:           '',
  media_type:  'images',
  orientation: 'all',
  per_page:    15,
  page:        1,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePexelsSearch() {
  const [params, setParams]           = useState<SearchParams>(DEFAULT_PARAMS);
  const [results, setResults]         = useState<PexelsItem[]>([]);
  const [total, setTotal]             = useState(0);
  const [totalHits, setTotalHits]     = useState(0);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PexelsItem | null>(null);

  const executeSearch = useCallback(async (p: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const query: Record<string, string | number> = {
      media_type: p.media_type,
      per_page:   p.per_page,
      page:       p.page,
    };

    if (p.q.trim())                         query.q           = p.q.trim();
    if (p.orientation && p.orientation !== 'all') query.orientation = p.orientation;

    try {
      const { data } = await axios.get(`${API_URL}/api/v1/pexels/search`, { params: query });
      setResults(data.results  ?? []);
      setTotal(data.total      ?? 0);
      setTotalHits(data.totalHits ?? 0);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Error al buscar en Pexels. Intenta de nuevo.');
      setResults([]);
      setTotal(0);
      setTotalHits(0);
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

  const openItem  = useCallback((item: PexelsItem) => setSelectedItem(item), []);
  const closeItem = useCallback(() => setSelectedItem(null), []);

  const totalPages = params.per_page > 0 ? Math.ceil(totalHits / params.per_page) : 0;

  return {
    params, setParams,
    results, total, totalHits, totalPages,
    isLoading, error, hasSearched,
    selectedItem, openItem, closeItem,
    handleSearch, handlePageChange, applyFilter,
  };
}
