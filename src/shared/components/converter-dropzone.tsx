"use client";

import React, { useEffect } from "react";
import { useRef } from "react";
import { Button } from "@shadcn/components/ui/button";
import { Progress } from "@shadcn/components/ui/progress";
import { Card } from "@shadcn/components/ui/card";
import { Separator } from "@shadcn/components/ui/separator";
import { Upload, FileText, X, CheckCircle, Loader2, Download, RefreshCw, AlertCircle, TriangleAlertIcon, Check } from "lucide-react";
import { ScrollArea } from "../shadcn/components/ui/scroll-area";
import { useVideoConverter } from "../hooks/use-video-converter";
import { Alert, AlertDescription, AlertTitle } from "../shadcn/components/ui/alert";
import { converterFeatures } from "../lib/features";

export default function ConverterDropzone() {
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
  } = useVideoConverter();

  const [isDragging, setIsDragging] = React.useState(false);

  const filePickerRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    if (appState !== 'IDLE') return;
    filePickerRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFilesSelected(Array.from(files));
    }
    // reset input
    if (filePickerRef.current) {
      filePickerRef.current.value = "";
    }
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

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();

    if (appState !== 'IDLE') return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelected(Array.from(files));
    }
  };

  // derived lists
  const activeEntries = fileEntries.filter((f) => ['uploading', 'converting'].includes(f.status));
  const completedEntries = fileEntries.filter((f) => ['completed', 'downloaded', 'error'].includes(f.status));


  return (
    <div className="mx-auto flex w-full h-full flex-col gap-4">
      {/* Toast Notification (Simple) */}
      {toastMessage && (
        <Alert variant={toastMessage.type === 'error' ? 'destructive' : 'success'} className='border-destructive'>
          {toastMessage.type === 'error' ? <AlertCircle className="size-6" /> : <CheckCircle className="size-6" />}
          <AlertTitle className="text-lg">{toastMessage.message}</AlertTitle>

        </Alert>
      )}

      {appState === 'IDLE' ? (
        <>
          <div className={`w-full h-full grid gap-4 ${selectedFiles.length > 0 ? ' grid-cols-1 lg:grid-cols-[1fr_1fr]' : 'grid-cols-1'}`}>
            <div className="">
              <Card
                id="converter-dropzone-card"
                className={`group flex w-full h-full flex-col bg-transparent items-center justify-center gap-4 py-8 border-2 border-primary/50 border-dashed text-sm 
            ${isDragging ? 'border-primary bg-primary/50 hover:bg-primary/50' : ''}
            ${selectedFiles.length > 0 ? 'bg-primary/10' : ''}
            ${!isConnected ? 'opacity-60 bg-muted/30 cursor-not-allowed border-muted-foreground/30' : 'cursor-pointer'}
            transition-colors duration-300
          `}
                onDragEnter={isConnected ? handleDragEnter : undefined}
                onDragLeave={isConnected ? handleDragLeave : undefined}
                onDragOver={isConnected ? onDragOver : undefined}
                onDrop={isConnected ? onDropFiles : undefined}
                onClick={isConnected ? openFilePicker : undefined}
              >
                {isConnected ? (
                  <>
                    <div className="grid space-y-3">
                      <div className="text-base md:text-lg flex items-center gap-x-2 text-muted-foreground">
                        <Upload className="size-5" />
                        <div>
                          Suelta los archivos aquí o{" "}
                          <Button
                            variant="link"
                            className="text-primary hover:text-primary/90 p-0 text-base md:text-lg h-auto font-normal pointer-events-none"
                            disabled={!isConnected}
                          >
                            haz clic para seleccionar
                          </Button>{" "}
                        </div>
                      </div>
                    </div>
                    <input
                      ref={filePickerRef}
                      type="file"
                      className="hidden"
                      accept="video/quicktime,.mov"
                      multiple
                      onChange={onFileInputChange}
                      disabled={!isConnected}
                    />
                    <span className="text-xs md:text-base text-muted-foreground/75 group-disabled:opacity-50 mt-2 block  text-center">
                      Formatos permitidos: <b>MOV (max {converterFeatures.fileMaxSize} MB)</b><br />
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
            {selectedFiles.length > 0 &&
              <div className="">
                <div className="h-full flex flex-col gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <h2 className="text-balance text-foreground flex items-center font-normal uppercase text-base">
                      <FileText className="mr-1 size-4" />
                      Archivos Seleccionados ({selectedFiles.length})
                    </h2>
                  <ScrollArea className="w-full max-h-[calc(100vh-250px)]">
                    <div className="grid">
                      {selectedFiles.map((file, i) => <>
                        <div key={`${file.name}-${i}`} className="p-4 border-b border-primary bg-primary/10 hover:bg-primary/20 group flex items-center justify-between gap-2">

                          <div className="grid shrink-0 place-content-center">
                            <FileText className="inline size-6" />
                          </div>
                          <div className="w-full flex justify-between items-center gap-2">
                            <span className="text-sm truncate w-2/3">{file.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.name)} className="size-6 text-muted-foreground hover:text-red-500 hover:bg-red-50">
                                <X className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                      </>)}
                    </div>
                  </ScrollArea>
                  </div>


                  <div className="flex justify-end gap-2">
                    <Button size="lg" onClick={handleReset} variant="outline">Limpiar</Button>
                    <Button size="lg" onClick={handleUpload} disabled={!isConnected}>
                      <Upload className=" size-4" />
                      Convertir
                    </Button>
                  </div>
                </div>
              </div>
            }
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-y-4">
          <div className="flex gap-4 justify-between items-center bg-muted/30 p-4 border">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Estado: {appState === 'UPLOADING' ? 'Subiendo...' : appState === 'CONVERTING' ? 'Convirtiendo...' : 'Finalizado'}</span>
              <span className="text-xs text-muted-foreground">{fileEntries.length} archivo(s) procesados.</span>
            </div>

            <div className="flex gap-2">
              {appState === 'FINISHED' && (
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

          {activeEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-balance text-foreground flex items-center font-normal uppercase text-base">
                <Loader2 className="size-4 mr-1 animate-spin" />
                Procesando
              </h2>

              <ScrollArea className="h-48 w-full">
                {activeEntries.map((file) => (
                  <div key={file.id} className="p-4 bg-primary/10 hover:bg-primary/20 group flex items-center justify-between gap-2">
                    <div className="grid shrink-0 place-content-center">
                      <FileText className="inline size-6" />
                    </div>
                    <div className="flex flex-col w-full mb-1">
                      <div className="flex justify-between gap-2">
                        <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                          {file.name}
                        </span>
                        <span className="text-muted-foreground text-sm tabular-nums">
                          {file.status === 'uploading' ? `${file.uploadProgress}% (Subiendo)` : 'Convirtiendo...'}
                        </span>
                      </div>
                      <Progress
                        value={file.status === 'uploading' ? file.uploadProgress : 50}
                        className="mt-1 h-2 min-w-64"
                      />
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}


          {completedEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-balance text-foreground flex items-center font-normal uppercase text-base">
                <CheckCircle className="mr-1 size-4" />
                Finalizados
              </h2>
              <ScrollArea className="h-48 w-full">
                {completedEntries.map((file) => <>
                  <div key={file.id} className="p-4 bg-primary/10 hover:bg-primary/20 group flex items-center justify-between">


                    <div className="flex items-center gap-2">
                      <div className="grid shrink-0 place-content-center">
                        {file.status === 'error' ? <AlertCircle className="inline size-6 text-red-500" /> : <FileText className="inline size-6" />}
                      </div>

                      <div className="flex flex-col">
                        <span className={`text-sm tabular-nums ${file.status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                          {file.status === 'error' ? 'Error' : file.status === 'downloaded' ? 'Descargado' : 'Listo'}
                        </span>

                        <span className="select-none text-base text-foreground group-disabled:opacity-50">
                          {file.name}
                        </span>
                        {file.status === 'error' ? (
                          <span className="text-xs text-red-500 mt-1">{file.error}</span>
                        ) : (

                          <span className="text-xs text-muted-foreground hover:underline cursor-pointer" onClick={() => handleDownload(file)}>
                            {file.downloadFilename}
                          </span>)}
                      </div>

                    </div>

                    <div>


                      {file.status === 'downloaded' &&
                        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-green-500 hover:bg-green-50 ml-4">
                          <Check className="size-4" />
                        </Button>}

                      {file.status === 'completed' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} className="size-6 text-muted-foreground hover:text-green-500 hover:bg-green-50 ml-4">
                          <Download className="size-4" />
                        </Button>
                      )}

                    </div>


                  </div>

                  <Separator className="bg-primary" />
                </>)}
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
