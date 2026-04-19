import type { Metadata } from "next";
import common from "./common.json";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const abs = (path: string) => `${common.siteUrl}${path}`;

const base = (overrides: { title: string; description: string; path: string }): Metadata => ({
  metadataBase: new URL(common.siteUrl),
  title: `${overrides.title}`,
  description: overrides.description,
  alternates: {
    canonical: abs(overrides.path),
  },
  openGraph: {
    siteName: common.siteName,
    locale: common.locale,
    type: "website",
    title: `${overrides.title} | ${common.siteName}`,
    description: overrides.description,
    url: abs(overrides.path),
    images: [
      {
        url: common.ogImage,
        width: 1200,
        height: 630,
        alt: `${overrides.title} — ${common.siteName}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${overrides.title} | ${common.siteName}`,
    description: overrides.description,
    images: [common.ogImage],
  },
});

// ─── Page Metadata Definitions ───────────────────────────────────────────────

export const pageMetadata = {

  /** Root layout — fallback global metadata */
  root: {
    ...base({
      title: "Herramientas web",
      description: common.description,
      path: common.routes.root,
    }),
    title: {
      default: common.siteName,
      template: `%s | ${common.siteName}`,
    },
  } satisfies Metadata,

  /** /d — Dashboard overview */
  dashboard: base({
    title: "Panel de herramientas",
    description:
      "Accede a todas las herramientas disponibles: convertidor de video, búsqueda de música libre de derechos y búsqueda de media de alta calidad.",
    path: common.routes.dashboard,
  }),

  /** /d/converter — Video converter */
  converter: base({
    title: "Convertidor de video",
    description:
      "Convierte archivos MOV a MP4 de forma rápida y sin pérdida de calidad. Soporta conversión por lotes con seguimiento en tiempo real del progreso.",
    path: common.routes.converter,
  }),

  /** /d/music — Music search */
  music: base({
    title: "Búsqueda de música",
    description:
      "Encuentra y descarga música libre de derechos de autor desde la biblioteca de Jamendo. Filtra por género, orden y previsualiza en línea.",
    path: common.routes.music,
  }),

  /** /d/media — Pexels media search */
  media: base({
    title: "Búsqueda de media",
    description:
      "Encuentra fotos y videos de alta calidad libres de derechos desde Pexels. Filtra por tipo de media y orientación.",
    path: common.routes.media,
  }),

} satisfies Record<string, Metadata>;

export type PageMetadataKey = keyof typeof pageMetadata;
