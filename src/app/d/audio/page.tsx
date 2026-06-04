import type { Metadata } from "next";
import { AudioLines } from "lucide-react";
import PageHeader from "@/src/shared/components/ui/page-header";
import PageWrapper from "@/src/shared/components/ui/page-wrapper";
import { constructMetadata } from "@/src/shared/lib/seo/construct-metadata";
import { JsonLd, constructJsonLd } from "@/src/shared/lib/seo/json-ld";
import AudioNoiseRemoverDropzone from "@/src/shared/components/audio-noise-remover-dropzone";

export const metadata: Metadata = constructMetadata("audio");

export default function AudioPage() {
  return (
    <PageWrapper wrapperId="audio-module-wrapper">
      <JsonLd schemas={constructJsonLd("audio")} />
      <PageHeader
        title="Limpiador de ruido en audio"
        description="Sube tus archivos de audio y elimina el ruido de fondo con distintos niveles de intensidad. Soporta MP3, WAV, M4A, AAC, OGG, FLAC y OPUS."
        icon={<AudioLines className="size-6" />}
        headerId="audio-module-header"
      />
      <AudioNoiseRemoverDropzone />
    </PageWrapper>
  );
}
