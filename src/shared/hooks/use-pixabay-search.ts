import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MediaType = 'images' | 'videos';
export type ImageType = 'all' | 'photo' | 'illustration' | 'vector';

export type PixabayItem = {
  id: string;
  type: string;          // 'photo' | 'illustration' | 'vector' | 'video'
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
  image_type: ImageType;
  category: string;
  order: 'popular' | 'latest';
  per_page: number;
  page: number;
};

// ── Constants ─────────────────────────────────────────────────────────────────

export const MEDIA_TYPE_OPTIONS: { label: string; value: MediaType }[] = [
  { label: 'Imágenes', value: 'images' },
  { label: 'Videos', value: 'videos' },
];

export const IMAGE_TYPE_OPTIONS: { label: string; value: ImageType }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Fotos', value: 'photo' },
  { label: 'Ilustraciones', value: 'illustration' },
  { label: 'Vectores', value: 'vector' },
];

export const CATEGORY_OPTIONS = [
  { label: 'Todas', value: 'all' },
  { label: 'Fondos', value: 'backgrounds' },
  { label: 'Moda', value: 'fashion' },
  { label: 'Naturaleza', value: 'nature' },
  { label: 'Ciencia', value: 'science' },
  { label: 'Educación', value: 'education' },
  { label: 'Sentimientos', value: 'feelings' },
  { label: 'Salud', value: 'health' },
  { label: 'Personas', value: 'people' },
  { label: 'Religión', value: 'religion' },
  { label: 'Lugares', value: 'places' },
  { label: 'Animales', value: 'animals' },
  { label: 'Industria', value: 'industry' },
  { label: 'Computación', value: 'computer' },
  { label: 'Comida', value: 'food' },
  { label: 'Deportes', value: 'sports' },
  { label: 'Transporte', value: 'transportation' },
  { label: 'Viajes', value: 'travel' },
  { label: 'Edificios', value: 'buildings' },
  { label: 'Negocios', value: 'business' },
  { label: 'Música', value: 'music' },
];

export const ORDER_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Reciente', value: 'latest' },
];

const DEFAULT_PARAMS: SearchParams = {
  q: '',
  media_type: 'images',
  image_type: 'all',
  category: 'all',
  order: 'popular',
  per_page: 10,
  page: 1,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePixabaySearch() {
  const [params, setParams] = useState<SearchParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<PixabayItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PixabayItem | null>(null);

  const executeSearch = useCallback(async (p: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const query: Record<string, string | number> = {
      media_type: p.media_type,
      image_type: p.image_type,
      order: p.order,
      per_page: p.per_page,
      page: p.page,
    };

    if (p.q.trim()) query.q = p.q.trim();
    if (p.category && p.category !== 'all') query.category = p.category;
    // image_type only meaningful for images
    if (p.media_type === 'videos') delete query.image_type;

    try {
      const { data } = await axios.get(`${API_URL}/api/v1/pixabay/search`, { params: query });
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
      setTotalHits(data.totalHits ?? 0);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Error al buscar en Pixabay. Intenta de nuevo.');
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

  const openItem = useCallback((item: PixabayItem) => setSelectedItem(item), []);
  const closeItem = useCallback(() => setSelectedItem(null), []);

  const totalPages = params.per_page > 0 ? Math.ceil(Math.min(totalHits, 500) / params.per_page) : 0;

  return {
    params, setParams,
    results, total, totalHits, totalPages,
    isLoading, error, hasSearched,
    selectedItem, openItem, closeItem,
    handleSearch, handlePageChange, applyFilter,
  };
}
