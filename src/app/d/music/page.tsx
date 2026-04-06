"use client";

import { Search, Music2, Download, Play, StopCircle, ChevronLeft, ChevronRight, Loader2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@shadcn/components/ui/button";
import { Input } from "@shadcn/components/ui/input";
import { Badge } from "@shadcn/components/ui/badge";
import { Separator } from "@shadcn/components/ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@shadcn/components/ui/select";
import { Alert, AlertTitle } from "@shadcn/components/ui/alert";
import { useMusicSearch, GENRE_OPTIONS, PER_PAGE_OPTIONS, type MusicTrack } from "@hooks/use-music-search";
import { ScrollArea } from "@/src/shared/shadcn/components/ui/scroll-area";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ── Sub-components ────────────────────────────────────────────────────────────

function TrackSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 border border-border rounded-lg">
      <div className="size-10 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-2/5" />
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="flex gap-1"><div className="h-4 w-12 bg-muted rounded-full" /><div className="h-4 w-16 bg-muted rounded-full" /></div>
      </div>
      <div className="h-8 w-24 bg-muted rounded" />
      <div className="h-8 w-24 bg-muted rounded" />
    </div>
  );
}

function TrackCard({ track, isPlaying, onToggle }: {
  track: MusicTrack; isPlaying: boolean; onToggle: (id: string) => void;
}) {
  return (
    <div className={`border-b border-primary bg-primary/10 hover:bg-primary/20 overflow-hidden transition-colors duration-200`}>
      <div className="flex items-center gap-3 p-4">
        {/* Play button */}
        <button
          onClick={() => onToggle(track.id)}
          className={`grid shrink-0 size-10 place-content-center rounded-full border transition-colors cursor-pointer ${isPlaying
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
            }`}
          aria-label={isPlaying ? "Detener" : "Reproducir"}
        >
          {isPlaying ? <StopCircle className="size-6" /> : <Play className="size-4 text-white" />}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate leading-snug">{track.title}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            {track.user && <span>{track.user}</span>}
            {track.user && track.duration > 0 && <span>·</span>}
            {track.duration > 0 && (
              <span className="flex items-center gap-0.5"><Clock className="size-3" />{fmt(track.duration)}</span>
            )}
          </div>
          {track.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {track.tags.slice(0, 5).map(t => (
                <Badge key={t} variant="outline" className="text-xs px-2 py-0.5 font-normal">{t}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {track.downloadUrl && (
          <a href={track.downloadUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="size-3.5" />
              Descargar
            </Button>
          </a>
        )}
      </div>

      {/* Inline audio player */}
      {isPlaying && (
        <>
          <div className="px-2 py-2 pb-6">
            <audio key={track.previewUrl} src={track.previewUrl} controls autoPlay className="w-full h-9" />
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MusicSearchPage() {
  const {
    params, results, total, totalPages,
    isLoading, error, hasSearched, playingId,
    handleSearch, handlePageChange, applyFilter, togglePreview,
  } = useMusicSearch();

  const start = total === 0 ? 0 : (params.page - 1) * params.per_page + 1;
  const end = Math.min(params.page * params.per_page, total);

  return (
    <div id="music-page" className="h-full flex flex-col gap-4">

      {/* Header */}
      <header id="music-page-header" className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-content-center rounded-lg bg-primary/10 text-primary">
            <Music2 className="size-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Búsqueda de Música</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Encuentra música libre de derechos de autor desde la biblioteca de Pixabay.
        </p>
      </header>

      {/* Search bar + filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="music-search-input"
              className="pl-9"
              placeholder="Buscar por título, artista, estilo…"
              value={params.q}
              onChange={e => applyFilter({ q: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className="gap-2 shrink-0">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {isLoading ? "Buscando…" : "Buscar"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select
            value={params.genre}
            defaultValue={'all'}
            onValueChange={(value: any) => applyFilter({ genre: value })}
            aria-label="Género"
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Género" />
            </SelectTrigger>
            <SelectContent >
              <SelectGroup>
                <SelectLabel>Género</SelectLabel>
                {GENRE_OPTIONS.map(g => (
                  <SelectItem key={g.value} value={g.value} >{g.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={params.order}
            defaultValue={'all'}
            onValueChange={(value: any) => applyFilter({ order: value })}
            aria-label="Orden"
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent >
              <SelectGroup>
                <SelectLabel>Orden</SelectLabel>
                <SelectItem value="popular" >Popular</SelectItem>
                <SelectItem value="latest" >Reciente</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={params.per_page}
            defaultValue={'all'}
            onValueChange={(value: any) => applyFilter({ per_page: value })}
            aria-label="Resultados por página"
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Resultados por página" />
            </SelectTrigger>
            <SelectContent >
              <SelectGroup>
                <SelectLabel>Resultados por página</SelectLabel>
                {PER_PAGE_OPTIONS.map(n => (
                  <SelectItem key={n} value={n}>{n} por página</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {/* Empty state */}
      {!hasSearched && !isLoading && (
        <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
          <div className="grid size-16 place-content-center rounded-2xl bg-primary/10 text-primary">
            <Music2 className="size-8" />
          </div>
          <div>
            <p className="font-medium">Comienza tu búsqueda</p>
            <p className="text-sm text-muted-foreground mt-1">Ingresa un término o aplica filtros para encontrar música</p>
          </div>
        </div>
      )}

      {/* Skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: Math.min(params.per_page, 6) }).map((_, i) => <TrackSkeleton key={i} />)}
        </div>
      )}

      {/* Results */}
      {!isLoading && hasSearched && results.length > 0 && (
        <>
          <ScrollArea className="w-full max-h-[calc(100vh-300px)]">
            <div className="grid">
              {results.map(track => (
                <TrackCard key={track.id} track={track} isPlaying={playingId === track.id} onToggle={togglePreview} />
              ))}
            </div>
          </ScrollArea>



          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium text-foreground">{start}–{end}</span> de{" "}
                <span className="font-medium text-foreground">{total.toLocaleString()}</span> resultados {"| "}
                <span className="text-sm text-muted-foreground">Página {params.page} de {totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(params.page - 1)}
                  disabled={params.page <= 1 || isLoading} className="gap-1">
                  <ChevronLeft className="size-4" /> Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(params.page + 1)}
                  disabled={params.page >= totalPages || isLoading} className="gap-1">
                  Siguiente <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* No results */}
      {!isLoading && hasSearched && results.length === 0 && !error && (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <div className="grid size-12 place-content-center rounded-xl bg-muted text-muted-foreground">
            <Search className="size-5" />
          </div>
          <p className="font-medium">Sin resultados</p>
          <p className="text-sm text-muted-foreground">Intenta con otros términos o filtros</p>
        </div>
      )}
    </div>
  );
}
