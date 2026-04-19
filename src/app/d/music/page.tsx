import type { Metadata } from "next";
import { constructMetadata } from "@/src/shared/lib/seo/construct-metadata";
import { JsonLd, constructJsonLd } from "@/src/shared/lib/seo/json-ld";
import { MusicSearchView } from "@/src/shared/components/music/music-search-view";

export const metadata: Metadata = constructMetadata("music");

export default function MusicSearchPage() {
  return (
    <>
      <JsonLd schemas={constructJsonLd("music")} />
      <MusicSearchView />
    </>
  );
}
