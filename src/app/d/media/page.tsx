import type { Metadata } from "next";
import { constructMetadata } from "@/src/shared/lib/seo/construct-metadata";
import { JsonLd, constructJsonLd } from "@/src/shared/lib/seo/json-ld";
import { PexelsSearchView } from "@/src/shared/components/media/pexels-search-view";

export const metadata: Metadata = constructMetadata("media");

export default function PexelsSearchPage() {
  return (
    <>
      <JsonLd schemas={constructJsonLd("media")} />
      <PexelsSearchView />
    </>
  );
}
