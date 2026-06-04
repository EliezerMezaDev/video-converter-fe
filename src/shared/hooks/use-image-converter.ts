import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './use-socket';

export type ImageAppState = 'IDLE' | 'UPLOADING' | 'CONVERTING' | 'FINISHED';
export type ImageFileStatus = 'pending' | 'uploading' | 'uploaded' | 'converting' | 'completed' | 'error' | 'downloaded';
export type OutputFormat = 'webp' | 'avif' | 'png' | 'jpeg';

export const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
];

export interface ImageFileEntry {
  id: string;
  file: File;
  originalName: string;
  size: number;
  previewUrl: string;
  status: ImageFileStatus;
  uploadProgress: number;
  error: string | null;
  downloadFilename: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useImageConverter() {
  const [appState, setAppState] = useState<ImageAppState>('IDLE');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileEntries, setFileEntries] = useState<ImageFileEntry[]>([]);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>('webp');
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { socketId, isConnected, on, off } = useSocket();

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (appState === 'UPLOADING' || appState === 'CONVERTING') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [appState]);

  useEffect(() => {
    on('image:progress', (data: any) => {
      setFileEntries((prev) =>
        prev.map((f) =>
          f.originalName === data.file ? { ...f, status: 'converting' as ImageFileStatus } : f
        )
      );
    });

    on('image:success', (data: any) => {
      setFileEntries((prev) => {
        const updated = prev.map((f) =>
          f.originalName === data.originalName
            ? { ...f, status: 'completed' as ImageFileStatus, downloadFilename: data.resultName }
            : f
        );
        const allDone = updated.every(
          (f) => f.status === 'completed' || f.status === 'downloaded' || f.status === 'error'
        );
        if (allDone) setTimeout(() => setAppState('FINISHED'), 300);
        return updated;
      });
    });

    on('image:error', (data: any) => {
      setFileEntries((prev) => {
        const updated = prev.map((f) =>
          f.originalName === data.file
            ? { ...f, status: 'error' as ImageFileStatus, error: data.error || 'Error de conversión' }
            : f
        );
        const allDone = updated.every(
          (f) => f.status === 'completed' || f.status === 'downloaded' || f.status === 'error'
        );
        if (allDone) setTimeout(() => setAppState('FINISHED'), 300);
        return updated;
      });
      addToast(`Error al convertir "${data.file}": ${data.error || 'desconocido'}`, 'error');
    });

    return () => {
      off('image:progress');
      off('image:success');
      off('image:error');
    };
  }, [on, off, addToast]);

  // Revoke preview URLs on unmount
  useEffect(() => {
    return () => {
      fileEntries.forEach((e) => URL.revokeObjectURL(e.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...newFiles.filter((f) => !existingNames.has(f.name))];
    });
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !socketId) {
      if (!socketId) addToast('Sin conexión al servidor. Reintenta en unos segundos.', 'error');
      return;
    }

    setAppState('UPLOADING');

    const entries: ImageFileEntry[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      originalName: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
      status: 'uploading' as ImageFileStatus,
      uploadProgress: 0,
      error: null,
      downloadFilename: null,
    }));
    setFileEntries(entries);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('images', file));
    formData.append('socketId', socketId);
    formData.append('format', targetFormat);

    try {
      await axios.post(`${API_URL}/api/v1/images/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          setFileEntries((prev) =>
            prev.map((f) => ({
              ...f,
              uploadProgress: percent,
              status: percent >= 100 ? ('uploaded' as ImageFileStatus) : ('uploading' as ImageFileStatus),
            }))
          );
        },
      });

      setFileEntries((prev) =>
        prev.map((f) => ({
          ...f,
          status: f.status === 'uploading' ? ('uploaded' as ImageFileStatus) : f.status,
          uploadProgress: 100,
        }))
      );
      setAppState('CONVERTING');
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Error al subir los archivos';
      addToast(message, 'error');
      setFileEntries((prev) => prev.map((f) => ({ ...f, status: 'error' as ImageFileStatus, error: message })));
      setAppState('FINISHED');
    }
  }, [selectedFiles, socketId, targetFormat, addToast]);

  const handleDownload = useCallback(async (entry: ImageFileEntry) => {
    if (!entry.downloadFilename) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/v1/images/download/${encodeURIComponent(entry.downloadFilename)}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', entry.downloadFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setFileEntries((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: 'downloaded' as ImageFileStatus } : f))
      );
    } catch {
      addToast(`Error al descargar "${entry.originalName}"`, 'error');
    }
  }, [addToast]);

  const handleDownloadAll = useCallback(async () => {
    const completed = fileEntries.filter((f) => f.status === 'completed');
    for (const entry of completed) {
      await handleDownload(entry);
    }
  }, [fileEntries, handleDownload]);

  const handleReset = useCallback(() => {
    fileEntries.forEach((e) => URL.revokeObjectURL(e.previewUrl));
    setSelectedFiles([]);
    setFileEntries([]);
    setAppState('IDLE');
  }, [fileEntries]);

  return {
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
  };
}
