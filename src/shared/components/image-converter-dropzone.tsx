"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Button } from "@shadcn/components/ui/button";
import { Progress } from "@shadcn/components/ui/progress";
import { Card } from "@shadcn/components/ui/card";
import { ScrollArea } from "@shadcn/components/ui/scroll-area";
import { Alert, AlertTitle } from "@shadcn/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn/components/ui/select";
import {
  Upload,
  ImageIcon,
  X,
  CheckCircle,
  Loader2,
  Download,
  RefreshCw,
  AlertCircle,
  Check,
} from "lucide-react";
import { useImageConverter, OUTPUT_FORMATS, type OutputFormat } from "../hooks/use-image-converter";

export default function ImageConverterDropzone() {
  const {
    appState,
    selectedFiles,
    fileEntries,
    targetFormat,
    setTargetFormat,
    isConnected,
    toastMessage,
    handleFilesSelected,
    handleRemoveFile,
    handleUpload,
    handleDownload,
    handleDownloadAll,
    handleReset,
  } = useImageConverter();

  const [isDragging, setIsDragging] = React.useState(false);
  const filePickerRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    if (appState !== "IDLE") return;
    filePickerRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) handleFilesSelected(Array.from(files));
    if (filePickerRef.current) filePickerRef.current.value = "";
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (event: React.DragEvent) => event.preventDefault();

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (appState !== "IDLE") return;
    const files = event.dataTransfer.files;
    if (files && files.length > 0) handleFilesSelected(Array.from(files));
  };

  const activeEntries = fileEntries.filter((f) =>
    ["uploading", "uploaded", "converting"].includes(f.status)
  );
  const completedEntries = fileEntries.filter((f) =>
    ["completed", "downloaded", "error"].includes(f.status)
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {toastMessage && (
        <Alert
          variant={toastMessage.type === "error" ? "destructive" : "success"}
          className="border-destructive"
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="size-6" />
          ) : (
            <CheckCircle className="size-6" />
          )}
          <AlertTitle className="text-lg">{toastMessage.message}</AlertTitle>
        </Alert>
      )}

      {appState === "IDLE" ? (
        <div className={`w-full grid gap-4 ${selectedFiles.length > 0 ? "grid-cols-1 lg:grid-cols-[1fr_1fr]" : "grid-cols-1"}`}>
          {/* Drop zone */}
          <div>
            <Card
              className={`group flex w-full min-h-48 flex-col bg-transparent items-center justify-center gap-4 py-8 border-2 border-border border-dashed text-sm
                ${isDragging ? "border-primary bg-primary/10" : ""}
                ${selectedFiles.length > 0 ? "bg-muted/30" : ""}
                ${!isConnected ? "opacity-60 bg-muted/20 cursor-not-allowed" : "cursor-pointer hover:bg-muted/20 hover:border-primary/40"}
                transition-colors duration-200`}
              onDragEnter={isConnected ? handleDragEnter : undefined}
              onDragLeave={isConnected ? handleDragLeave : undefined}
              onDragOver={isConnected ? onDragOver : undefined}
              onDrop={isConnected ? onDropFiles : undefined}
              onClick={isConnected ? openFilePicker : undefined}
            >
              {isConnected ? (
                <>
                  <div className="grid space-y-3 p-4">
                    <div className="text-base flex items-center justify-center max-md:flex-col gap-2 text-muted-foreground">
                      <Upload className="size-8 md:size-5" />
                      <div className="text-center">
                        Suelta las imágenes aquí o{" "}
                        <Button
                          variant="link"
                          className="text-primary hover:text-primary/90 p-0 text-base h-auto font-normal pointer-events-none"
                        >
                          haz clic para seleccionar
                        </Button>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={filePickerRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/tiff,image/bmp,.jpg,.jpeg,.png,.webp,.avif,.gif,.tiff,.tif,.bmp"
                    multiple
                    onChange={onFileInputChange}
                  />
                  <span className="text-xs md:text-sm text-muted-foreground/75 mt-2 block text-center">
                    Formatos permitidos: <b>JPG, PNG, WebP, AVIF, GIF, TIFF, BMP</b>
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <div className="flex flex-col items-center">
                    <span className="text-base font-medium text-foreground">Conectando al servidor...</span>
                    <span className="text-sm">Por favor espera un momento</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* File list + controls */}
          {selectedFiles.length > 0 && (
            <div className="h-full flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-foreground flex items-center font-normal uppercase text-base">
                  <ImageIcon className="mr-1 size-4" />
                  Imágenes ({selectedFiles.length})
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Convertir a:</span>
                  <Select
                    value={targetFormat}
                    onValueChange={(v) => setTargetFormat(v as OutputFormat)}
                  >
                    <SelectTrigger className="w-28 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTPUT_FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Thumbnails grid */}
              <ScrollArea className="w-full max-h-[50dvh] md:max-h-[calc(100dvh-280px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-2">
                  {selectedFiles.map((file, i) => {
                    const previewUrl = URL.createObjectURL(file);
                    return (
                      <div
                        key={`${file.name}-${i}`}
                        className="relative group rounded-md overflow-hidden border border-border bg-muted/20 aspect-square"
                      >
                        <Image
                          src={previewUrl}
                          alt={file.name}
                          fill
                          className="object-cover"
                          unoptimized
                          onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex flex-col justify-between p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(file.name);
                            }}
                            className="size-6 self-end opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-red-600 text-white hover:text-white transition-all"
                          >
                            <X className="size-3" />
                          </Button>
                          <span className="text-[10px] text-white bg-black/60 rounded px-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {file.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="flex justify-end gap-2">
                <Button size="lg" onClick={handleReset} variant="outline">
                  Limpiar
                </Button>
                <Button size="lg" onClick={handleUpload} disabled={!isConnected}>
                  <Upload className="size-4" />
                  Convertir a {targetFormat.toUpperCase()}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {/* Status bar */}
          <div className="flex max-md:flex-col max-md:items-start gap-4 justify-between items-center bg-muted/40 p-4 rounded-md border border-border">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Estado:{" "}
                {appState === "UPLOADING"
                  ? "Subiendo..."
                  : appState === "CONVERTING"
                  ? "Convirtiendo..."
                  : "Finalizado"}
              </span>
              <span className="text-xs text-muted-foreground">
                {fileEntries.length} imagen(es) procesadas.
              </span>
            </div>
            <div className="flex gap-2">
              {appState === "FINISHED" && (
                <>
                  <Button onClick={handleDownloadAll} variant="default">
                    <Download className="size-4" />
                    Descargar todo
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <RefreshCw className="size-4" />
                    Nueva conversión
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Active */}
          {activeEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-foreground flex items-center font-normal uppercase text-base">
                <Loader2 className="size-4 mr-1 animate-spin" />
                Procesando
              </h2>
              <ScrollArea className="w-full max-h-[35dvh] md:max-h-[calc(100dvh-280px)]">
                {activeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 px-4 border-b border-border flex items-center gap-3"
                  >
                    <div className="size-10 rounded overflow-hidden shrink-0 bg-muted relative">
                      <Image
                        src={entry.previewUrl}
                        alt={entry.originalName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex justify-between gap-2">
                        <span className="text-sm text-foreground truncate">{entry.originalName}</span>
                        <span className="text-muted-foreground text-xs tabular-nums shrink-0">
                          {entry.status === "uploading"
                            ? `${entry.uploadProgress}% (Subiendo)`
                            : entry.status === "uploaded"
                            ? "En cola..."
                            : "Convirtiendo..."}
                        </span>
                      </div>
                      <Progress
                        value={entry.status === "uploading" ? entry.uploadProgress : 50}
                        className="mt-1 h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Completed */}
          {completedEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-foreground flex items-center font-normal uppercase text-base">
                <CheckCircle className="mr-1 size-4" />
                Finalizadas ({completedEntries.filter((f) => f.status !== "error").length} convertidas)
              </h2>
              <ScrollArea className="w-full max-h-[50dvh] md:max-h-[calc(100dvh-250px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {completedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`relative rounded-md overflow-hidden border aspect-square group ${
                        entry.status === "error"
                          ? "border-red-400 bg-red-50 dark:bg-red-950/20"
                          : "border-green-400/50 bg-muted/20"
                      }`}
                    >
                      {entry.status !== "error" && (
                        <Image
                          src={entry.previewUrl}
                          alt={entry.originalName}
                          fill
                          className="object-cover opacity-60"
                          unoptimized
                        />
                      )}
                      <div className="absolute inset-0 flex flex-col justify-between p-1.5">
                        {entry.status === "error" ? (
                          <div className="flex flex-col items-center justify-center h-full gap-1">
                            <AlertCircle className="size-6 text-red-500" />
                            <span className="text-[10px] text-red-500 text-center">{entry.error}</span>
                          </div>
                        ) : (
                          <>
                            <div className="self-end">
                              {entry.status === "downloaded" ? (
                                <span className="bg-green-600 rounded-full p-0.5 flex">
                                  <Check className="size-3 text-white" />
                                </span>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownload(entry)}
                                  className="size-6 bg-black/50 hover:bg-black/70 text-white hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Download className="size-3" />
                                </Button>
                              )}
                            </div>
                            <span
                              className="text-[10px] text-white bg-black/60 rounded px-1 truncate cursor-pointer"
                              onClick={() => entry.status === "completed" && handleDownload(entry)}
                            >
                              {entry.downloadFilename ?? entry.originalName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
