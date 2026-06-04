"use client";

import React, { useRef } from "react";
import { Button } from "@shadcn/components/ui/button";
import { Progress } from "@shadcn/components/ui/progress";
import { Card } from "@shadcn/components/ui/card";
import { ScrollArea } from "@shadcn/components/ui/scroll-area";
import { Alert, AlertTitle } from "@shadcn/components/ui/alert";
import {
  Upload,
  FileAudio,
  X,
  CheckCircle,
  Loader2,
  Download,
  RefreshCw,
  AlertCircle,
  Check,
  Music,
} from "lucide-react";
import {
  useAudioNoiseRemover,
  type AudioFileEntry,
} from "../hooks/use-audio-noise-remover";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AudioFileRow({ entry, onDownload }: { entry: AudioFileEntry; onDownload: (e: AudioFileEntry) => void }) {
  const isActive = ['uploading', 'uploaded', 'processing'].includes(entry.status);

  return (
    <div className="p-3 px-4 border-b border-border flex items-center gap-3">
      <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0">
        {entry.status === 'error' ? (
          <AlertCircle className="size-5 text-red-500" />
        ) : entry.status === 'completed' || entry.status === 'downloaded' ? (
          <CheckCircle className="size-5 text-green-500" />
        ) : (
          <Music className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col w-full min-w-0">
        <div className="flex justify-between gap-2 items-center">
          <span className="text-sm text-foreground truncate">{entry.originalName}</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-muted-foreground text-xs tabular-nums">
              {entry.status === 'uploading'
                ? `${entry.uploadProgress}% (Subiendo)`
                : entry.status === 'uploaded'
                ? 'En cola...'
                : entry.status === 'processing'
                ? 'Procesando...'
                : entry.status === 'error'
                ? 'Error'
                : entry.status === 'downloaded'
                ? 'Descargado'
                : 'Listo'}
            </span>
            {(entry.status === 'completed') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(entry)}
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <Download className="size-3.5" />
              </Button>
            )}
            {entry.status === 'downloaded' && (
              <span className="bg-green-600 rounded-full p-0.5 flex ml-1">
                <Check className="size-3 text-white" />
              </span>
            )}
          </div>
        </div>
        {isActive && (
          <Progress
            value={entry.status === 'uploading' ? entry.uploadProgress : 50}
            className="mt-1.5 h-1.5"
          />
        )}
        {entry.status === 'error' && entry.error && (
          <span className="text-xs text-red-500 mt-0.5 truncate">{entry.error}</span>
        )}
      </div>
    </div>
  );
}

export default function AudioNoiseRemoverDropzone() {
  const {
    appState,
    selectedFiles,
    fileEntries,
    isConnected,
    toastMessage,
    handleFilesSelected,
    handleRemoveFile,
    handleUpload,
    handleDownload,
    handleDownloadAll,
    handleReset,
  } = useAudioNoiseRemover();

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
    ["uploading", "uploaded", "processing"].includes(f.status)
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
                        Suelta los audios aquí o{" "}
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
                    accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/ogg,audio/flac,audio/x-flac,audio/opus,.mp3,.wav,.m4a,.aac,.ogg,.flac,.opus"
                    multiple
                    onChange={onFileInputChange}
                  />
                  <span className="text-xs md:text-sm text-muted-foreground/75 mt-2 block text-center">
                    Formatos permitidos: <b>MP3, WAV, M4A, AAC, OGG, FLAC, OPUS</b>
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
                  <FileAudio className="mr-1 size-4" />
                  Audios ({selectedFiles.length})
                </h2>
              </div>

              <ScrollArea className="w-full max-h-[50dvh] md:max-h-[calc(100dvh-280px)]">
                <div className="flex flex-col gap-1 pr-2">
                  {selectedFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-3 p-2 rounded-md border border-border bg-muted/10 group"
                    >
                      <Music className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(file.name);
                        }}
                        className="size-6 opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-end gap-2">
                <Button size="lg" onClick={handleReset} variant="outline">
                  Limpiar
                </Button>
                <Button size="lg" onClick={handleUpload} disabled={!isConnected}>
                  <Upload className="size-4" />
                  Procesar
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
                  : appState === "PROCESSING"
                  ? "Procesando..."
                  : "Finalizado"}
              </span>
              <span className="text-xs text-muted-foreground">
                {fileEntries.length} archivo(s) de audio procesados.
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
                    Nuevo procesamiento
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
                  <AudioFileRow key={entry.id} entry={entry} onDownload={handleDownload} />
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Completed */}
          {completedEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-foreground flex items-center font-normal uppercase text-base">
                <CheckCircle className="mr-1 size-4" />
                Finalizados ({completedEntries.filter((f) => f.status !== "error").length} procesados)
              </h2>
              <ScrollArea className="w-full max-h-[50dvh] md:max-h-[calc(100dvh-250px)]">
                {completedEntries.map((entry) => (
                  <AudioFileRow key={entry.id} entry={entry} onDownload={handleDownload} />
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
