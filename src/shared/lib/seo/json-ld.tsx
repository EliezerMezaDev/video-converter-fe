import { pageJsonLd, type PageJsonLdKey } from "@/src/assets/data/jsonld";

// ─── Types ───────────────────────────────────────────────────────────────────

type JsonLdSchema = Record<string, unknown>;

// ─── JsonLd Component ────────────────────────────────────────────────────────

/**
 * Renders one or more JSON-LD <script> tags for the given schemas.
 * Drop this inside any Server Component (layout or page).
 *
 * @example
 * // Static page — pull from centralized data:
 * <JsonLd schemas={pageJsonLd.converter} />
 *
 * // Or pass schemas inline:
 * <JsonLd schemas={[myDynamicSchema]} />
 */
export function JsonLd({ schemas }: { schemas: JsonLdSchema[] }) {
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// ─── constructJsonLd ─────────────────────────────────────────────────────────

/**
 * Returns the JSON-LD schema array for the given static page key.
 * Companion utility to constructMetadata — keeps both APIs consistent.
 *
 * @example
 * <JsonLd schemas={constructJsonLd('converter')} />
 */
export function constructJsonLd(page: PageJsonLdKey): JsonLdSchema[] {
  return pageJsonLd[page];
}
