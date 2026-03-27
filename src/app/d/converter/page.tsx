import ConverterDropzone from "@components/converter-dropzone";

export default function ConverterPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div id="converter-module-header">
        <h1 className="text-3xl font-bold tracking-tight">Convertidor de Video</h1>
        <p className="text-muted-foreground mt-2">
          Sube tus archivos de video (MOV) y conviértelos de forma rápida y sencilla. 
          Asegúrate de estar conectado al servidor para comenzar.
        </p>
      </div>
      <ConverterDropzone />  
    </div>
  );
}