import ConverterDropzone from "@components/converter-dropzone";
import { Video } from "lucide-react";

export default function ConverterPage() {
  return (
    <div className="h-full flex flex-col gap-4">
    

   <header id="converter-module-header" className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-content-center rounded-lg bg-primary/10 text-primary">
            <Video className="size-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Convertidor de Video</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Sube tus archivos de video (MOV) y conviértelos de forma rápida y sencilla.
          Asegúrate de estar conectado al servidor para comenzar.
        </p>
      </header>

      <ConverterDropzone />
    </div>
  );
}