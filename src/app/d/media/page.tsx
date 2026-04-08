"use client";

import React, { useEffect } from "react";
import {
  Search, ImageIcon, Film, Download, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Eye, X, Heart, ArrowDownToLine, Play,
  Image as ImageIconSolid, Layers, Camera,
} from "lucide-react";
import { Button } from "@shadcn/components/ui/button";
import { Input } from "@shadcn/components/ui/input";
import { Badge } from "@shadcn/components/ui/badge";
import { Alert, AlertTitle } from "@shadcn/components/ui/alert";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@shadcn/components/ui/select";
import {
  usePixabaySearch,
  MEDIA_TYPE_OPTIONS,
  IMAGE_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  ORDER_OPTIONS,
  type PixabayItem,
  type ImageType,
  type MediaType,
} from "@hooks/use-pixabay-search";
import PageHeader from "@/src/shared/components/ui/page-header";
import PageWrapper from "@/src/shared/components/ui/page-wrapper";
import { ScrollArea } from "@/src/shared/shadcn/components/ui/scroll-area";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtNum = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n);

const fmtDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const TYPE_ICON: Record<string, React.ReactNode> = {
  photo: <Camera className="size-3" />,
  illustration: <Layers className="size-3" />,
  vector: <ImageIconSolid className="size-3" />,
  video: <Film className="size-3" />,
};

const TYPE_LABEL: Record<string, string> = {
  photo: "Foto",
  illustration: "Ilustración",
  vector: "Vector",
  video: "Video",
};

// ── Media Preview Modal ────────────────────────────────────────────────────────

function MediaModal({ item, onClose }: { item: PixabayItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isVideo = item.type === "video";
  const videoSrc = item.videos?.medium ?? item.videos?.small ?? item.videos?.tiny ?? item.downloadUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-card rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 grid size-8 place-content-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>

        {/* Media */}
        <div className="bg-black/20 flex items-center justify-center max-h-[55dvh] overflow-hidden">
          {isVideo ? (
            <video
              src={videoSrc ?? undefined}
              controls
              autoPlay
              className="w-full max-h-[55dvh] object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.largeUrl ?? item.webformatUrl ?? ""}
              alt={item.tags.slice(0, 3).join(", ")}
              className="w-full max-h-[55dvh] object-contain"
            />
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" /> {fmtNum(item.views)}
            </span>
            <span className="flex items-center gap-1">
              <ArrowDownToLine className="size-3.5" /> {fmtNum(item.downloads)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="size-3.5" /> {fmtNum(item.likes)}
            </span>
            {item.user && <span className="ml-auto font-medium text-foreground">{item.user}</span>}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {item.downloadUrl && (
              <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full gap-2">
                  <Download className="size-4" />
                  Descargar
                  {isVideo ? " (HD)" : ""}
                </Button>
              </a>
            )}
            {item.pageUrl && (
              <a href={item.pageUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  Ver en Pixabay
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function MediaSkeleton() {
  return (
    <div className="animate-pulse rounded-xl overflow-hidden bg-muted aspect-4/3 col-span-1" />
  );
}

// ── Media Card ─────────────────────────────────────────────────────────────────

function MediaCard({ item, onOpen }: { item: PixabayItem; onOpen: (item: PixabayItem) => void }) {
  const isVideo = item.type === "video";
  const thumbSrc = item.previewUrl ?? item.webformatUrl;

  return (
    <button
      onClick={() => onOpen(item)}
      className="group relative rounded-xl overflow-hidden bg-muted aspect-4/3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Ver ${item.tags[0] ?? "imagen"}`}
    >
      {/* Thumbnail */}
      {thumbSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbSrc}
          alt={item.tags.slice(0, 2).join(", ")}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <ImageIcon className="size-8" />
        </div>
      )}

      {/* Video play icon */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid size-10 place-content-center rounded-full bg-black/50 text-white">
            <Play className="size-5 fill-white" />
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex flex-col justify-between p-2.5 opacity-0 group-hover:opacity-100">
        {/* Type badge */}
        <span className="self-start flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
          {TYPE_ICON[item.type]} {TYPE_LABEL[item.type] ?? item.type}
        </span>

        {/* Bottom info */}
        <div className="flex items-end justify-between">
          <div className="flex gap-1 flex-wrap max-w-[70%]">
            {item.tags.slice(0, 2).map((t) => (
              <span key={t} className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full truncate max-w-20">
                {t}
              </span>
            ))}
          </div>
          {item.duration !== null && (
            <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
              {fmtDuration(item.duration)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PixabaySearchPage() {
  const {
    params, results, total, totalHits, totalPages,
    isLoading, error, hasSearched,
    selectedItem, openItem, closeItem,
    handleSearch, handlePageChange, applyFilter,
  } = usePixabaySearch();

  const start = total === 0 ? 0 : (params.page - 1) * params.per_page + 1;
  const end = Math.min(params.page * params.per_page, Math.min(totalHits, 500));
  const displayMedia = params.media_type === 'videos' ? 'videos' : 'imágenes';

  return (
    <PageWrapper wrapperId="pixabay-page">
      {/* Modal */}
      {selectedItem && <MediaModal item={selectedItem} onClose={closeItem} />}

      {/* Header */}
      <PageHeader
        headerId="pixabay-page-header"
        title="Búsqueda de Media"
        description="Encuentra imágenes, vectores, ilustraciones y videos libres de derechos desde Pixabay."
        icon={<ImageIcon className="size-6" />}
      />

      <div className="w-full overflow-hidden flex flex-col gap-4">
        {/* ── Search bar ── */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="pixabay-search-input"
                  className="pl-9 min-w-[50dvw] md:min-w-50"
                  placeholder="Buscar por tema, estilo, colores…"
                  value={params.q}
                  onChange={(e) => applyFilter({ q: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Select
                value={params.media_type}
                onValueChange={(v) => applyFilter({ media_type: v as MediaType, image_type: 'all' })}
              >
                <SelectTrigger id="pixabay-filter-media" className="w-30">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipo de media</SelectLabel>
                    {MEDIA_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Image type — only for images */}
              {params.media_type === "images" && (
                <Select
                  value={params.image_type}
                  onValueChange={(v) => applyFilter({ image_type: v as ImageType })}
                >
                  <SelectTrigger id="pixabay-filter-image-type" className="w-30">
                    <SelectValue placeholder="Formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Formato de imagen</SelectLabel>
                      {IMAGE_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              {/* Category */}
              <Select
                value={params.category}
                onValueChange={(v) => applyFilter({ category: v as string })}
              >
                <SelectTrigger id="pixabay-filter-category" className="w-30">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categoría</SelectLabel>
                    {CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Order */}
              <Select
                value={params.order}
                onValueChange={(v) => applyFilter({ order: v as "popular" | "latest" })}
              >
                <SelectTrigger id="pixabay-filter-order" className="w-30">
                  <SelectValue placeholder="Orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Ordenar por</SelectLabel>
                    {ORDER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                id="pixabay-search-btn"
                onClick={handleSearch}
                disabled={isLoading}
                className="gap-2 shrink-0"
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                {isLoading ? "Buscando…" : "Buscar"}
              </Button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {/* ── Empty state ── */}
        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="grid size-16 place-content-center rounded-2xl bg-primary/10 text-primary">
              <ImageIcon className="size-8" />
            </div>
            <div>
              <p className="font-medium">Comienza tu búsqueda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ingresa un término o aplica filtros para encontrar {displayMedia}
              </p>
            </div>
          </div>
        )}

        {/* ── Skeletons ── */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: Math.min(params.per_page, 12) }).map((_, i) => (
              <MediaSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Results grid ── */}
        {!isLoading && hasSearched && results.length > 0 && (
          <>
            {/* Count */}
            <ScrollArea className="w-full h-full max-h-[55dvh] md:max-h-[60dvh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {results.map((item) => (
                  <MediaCard key={item.id} item={item} onOpen={openItem} />
                ))}
              </div>
            </ScrollArea>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex max-md:flex-col-reverse items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-medium text-foreground">{start}–{end}</span>{" "}
                  de{" "}
                  <span className="hidden md:block font-medium text-foreground">
                    {totalHits >= 500 ? "500+" : totalHits.toLocaleString()}
                  </span>{" "}
                  {displayMedia} · Pág. {params.page}/{totalPages}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(params.page - 1)}
                    disabled={params.page <= 1 || isLoading}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" /> Anterior
                  </Button>
                  <span className="hidden md:block text-sm text-muted-foreground">
                    Página {params.page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(params.page + 1)}
                    disabled={params.page >= totalPages || isLoading}
                    className="gap-1"
                  >
                    Siguiente <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── No results ── */}
        {!isLoading && hasSearched && results.length === 0 && !error && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <div className="grid size-12 place-content-center rounded-xl bg-muted text-muted-foreground">
              <Search className="size-5" />
            </div>
            <p className="font-medium">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              Intenta con otros términos, categoría o tipo de media
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
