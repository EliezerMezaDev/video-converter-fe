import ConverterDropzone from "@components/converter-dropzone";
import { Video } from "lucide-react";
import PageHeader from "@/src/shared/components/ui/page-header";
import PageWrapper from "@/src/shared/components/ui/page-wrapper";

export default function ConverterPage() {
  return (
    <PageWrapper wrapperId="converter-module-wrapper">
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