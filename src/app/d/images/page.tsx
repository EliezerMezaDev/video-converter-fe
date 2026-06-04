import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import PageHeader from "@/src/shared/components/ui/page-header";
import PageWrapper from "@/src/shared/components/ui/page-wrapper";
import { constructMetadata } from "@/src/shared/lib/seo/construct-metadata";
import { JsonLd, constructJsonLd } from "@/src/shared/lib/seo/json-ld";
import ImageConverterDropzone from "@/src/shared/components/image-converter-dropzone";

export const metadata: Metadata = constructMetadata("images");

export default function ImagesPage() {
  return (
    <PageWrapper wrapperId="images-module-wrapper">
      <JsonLd schemas={constructJsonLd("images")} />
      <PageHeader
        title="Convertidor de Imágenes"
        description="Sube tus imágenes en cualquier formato y conviértelas por lotes a WebP, AVIF, PNG o JPEG sin pérdida de calidad."
        icon={<ImageIcon className="size-6" />}
        headerId="images-module-header"
      />
      <ImageConverterDropzone />
    </PageWrapper>
  );
}
