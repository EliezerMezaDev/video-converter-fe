import type { Metadata } from "next";
import ConverterDropzone from "@components/converter-dropzone";
import { Video } from "lucide-react";
import PageHeader from "@/src/shared/components/ui/page-header";
import PageWrapper from "@/src/shared/components/ui/page-wrapper";
import { constructMetadata } from "@/src/shared/lib/seo/construct-metadata";
import { JsonLd, constructJsonLd } from "@/src/shared/lib/seo/json-ld";

export const metadata: Metadata = constructMetadata("converter");

export default function ConverterPage() {
  return (
    <PageWrapper wrapperId="converter-module-wrapper">
      <JsonLd schemas={constructJsonLd("converter")} />
      <PageHeader
        title="Convertidor de Video"
        description="Sube tus archivos de video (MOV) y conviértelos de forma rápida y sencilla. Asegúrate de estar conectado al servidor para comenzar."
        icon={<Video className="size-6" />}
        headerId="converter-module-header"
      />

      <ConverterDropzone />
    </PageWrapper>
  );
}