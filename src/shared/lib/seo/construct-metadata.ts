import type { Metadata } from "next";
import { pageMetadata, type PageMetadataKey } from "@/src/assets/data/metadata";

export function constructMetadata(page: PageMetadataKey): Metadata {
  return pageMetadata[page];
}
