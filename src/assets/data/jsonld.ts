import common from "./common.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type JsonLdSchema = Record<string, unknown>;

// ─── Shared Schemas ───────────────────────────────────────────────────────────

const websiteSchema: JsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: common.siteName,
  url: common.siteUrl,
  description: common.description,
  inLanguage: common.language,
};

const organizationSchema: JsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: common.organization.name,
  url: common.organization.url,
  logo: common.organization.logo,
};

const webAppSchema = (name: string, description: string, url: string): JsonLdSchema => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name,
  description,
  url,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  inLanguage: common.language,
});

const breadcrumbSchema = (
  items: { name: string; url: string }[]
): JsonLdSchema => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const abs = (path: string) => `${common.siteUrl}${path}`;

// ─── Page JSON-LD Definitions ─────────────────────────────────────────────────

export const pageJsonLd = {

  /** Root layout — global schemas present on all pages */
  root: [websiteSchema, organizationSchema],

  /** /d — Dashboard overview */
  dashboard: [
    breadcrumbSchema([
      { name: common.siteName, url: common.siteUrl },
      { name: "Panel de Utilidades", url: abs(common.routes.dashboard) },
    ]),
  ],

  /** /d/converter — Video converter */
  converter: [
    webAppSchema(
      "Convertidor de Video",
      "Convierte archivos MOV a MP4 por lotes con seguimiento en tiempo real del progreso.",
      abs(common.routes.converter)
    ),
    breadcrumbSchema([
      { name: common.siteName, url: common.siteUrl },
      { name: "Panel de Utilidades", url: abs(common.routes.dashboard) },
      { name: "Convertidor de Video", url: abs(common.routes.converter) },
    ]),
  ],

  /** /d/music — Music search */
  music: [
    webAppSchema(
      "Búsqueda de Música",
      "Encuentra y descarga música libre de derechos de autor desde Jamendo.",
      abs(common.routes.music)
    ),
    breadcrumbSchema([
      { name: common.siteName, url: common.siteUrl },
      { name: "Panel de Utilidades", url: abs(common.routes.dashboard) },
      { name: "Búsqueda de Música", url: abs(common.routes.music) },
    ]),
  ],

  /** /d/media — Pexels media search */
  media: [
    webAppSchema(
      "Búsqueda de Media",
      "Encuentra fotos y videos de alta calidad libres de derechos desde Pexels.",
      abs(common.routes.media)
    ),
    breadcrumbSchema([
      { name: common.siteName, url: common.siteUrl },
      { name: "Panel de Utilidades", url: abs(common.routes.dashboard) },
      { name: "Búsqueda de Media", url: abs(common.routes.media) },
    ]),
  ],

} satisfies Record<string, JsonLdSchema[]>;

export type PageJsonLdKey = keyof typeof pageJsonLd;
