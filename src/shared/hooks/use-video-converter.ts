import { useState, useCallback, useRef, useEffect, use } from 'react';
import axios from 'axios';
import { useSocket } from './use-socket';

export type AppState = 'IDLE' | 'UPLOADING' | 'CONVERTING' | 'FINISHED';
export type FileStatus = 'uploading' | 'uploaded' | 'converting' | 'completed' | 'error' | 'downloaded';

export interface FileEntry {
  id: string;
  file: File;
  name: string;
  originalName: string;
  size: number;
  status: FileStatus;
  uploadProgress: number;
  error: string | null;
  downloadFilename: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useVideoConverter() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const { socketId, isConnected, on, off } = useSocket();
  const isProcessingRef = useRef(false);

  // Expose toast-like callbacks or rely on caller to pass an `onToast` callback
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
  }, []);

  // Clear toast after a few seconds
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000);
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
    on('conversion:start', (data: any) => {
      setFileEntries((prev) =>
        prev.map((f) =>
          f.originalName === data.originalName
            ? { ...f, status: 'converting' as FileStatus }
            : f
        )
      );
    });

    on('conversion:success', (data: any) => {
      setFileEntries((prev) => {
        const updated = prev.map((f) =>
          f.originalName === data.originalName
            ? {
              ...f,
              status: 'completed' as FileStatus,
              downloadFilename: data.resultName,
            }
            : f
        );
        const allDone = updated.every(
          (f) => f.status === 'completed' || f.status === 'downloaded' || f.status === 'error'
        );
        if (allDone) {
          setTimeout(() => setAppState('FINISHED'), 300);
        }
        return updated;
      });
    });

    on('conversion:error', (data: any) => {
      setFileEntries((prev) => {
        const updated = prev.map((f) =>
          f.originalName === data.originalName
            ? { ...f, status: 'error' as FileStatus, error: data.error || 'Error de conversión' }
            : f
        );
        const allDone = updated.every(
          (f) => f.status === 'completed' || f.status === 'downloaded' || f.status === 'error'
        );
        if (allDone) {
          setTimeout(() => setAppState('FINISHED'), 300);
        }
        return updated;
      });
      addToast(`Error al convertir "${data.originalName}": ${data.error || 'desconocido'}`, 'error');
    });

    return () => {
      off('conversion:start');
      off('conversion:success');
      off('conversion:error');
    };
  }, [on, off, addToast]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !socketId) {
      if (!socketId) addToast('Sin conexión al servidor. Reintenta en unos segundos.', 'error');
      return;
    }

    isProcessingRef.current = true;
    setAppState('UPLOADING');

    const entries: FileEntry[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      originalName: file.name,
      size: file.size,
      status: 'uploading' as FileStatus,
      uploadProgress: 0,
      error: null,
      downloadFilename: null,
    }));
    setFileEntries(entries);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('videos', file));
    formData.append('socketId', socketId);

    try {
      await axios.post(`${API_URL}/api/convert/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          setFileEntries((prev) =>
            prev.map((f) => ({
              ...f,
              uploadProgress: percent,
              status: percent >= 100 ? ('uploaded' as FileStatus) : ('uploading' as FileStatus),
            }))
          );
        },
      });

      setFileEntries((prev) =>
        prev.map((f) => ({
          ...f,
          status: f.status === 'uploading' ? ('uploaded' as FileStatus) : f.status,
          uploadProgress: 100,
        }))
      );
      setAppState('CONVERTING');
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Error al subir los archivos';
      addToast(message, 'error');
      setFileEntries((prev) => prev.map((f) => ({ ...f, status: 'error' as FileStatus, error: message })));
      setAppState('FINISHED');
    }

    isProcessingRef.current = false;
  }, [selectedFiles, socketId, addToast]);

  const handleDownload = useCallback(async (file: FileEntry) => {
    if (!file.downloadFilename) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/convert/download/${encodeURIComponent(file.downloadFilename)}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.downloadFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setFileEntries((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: 'downloaded' as FileStatus } : f))
      );
    } catch {
      addToast(`Error al descargar "${file.name}"`, 'error');
    }
  }, [addToast]);

  const handleDownloadAll = useCallback(async () => {
    const completedFiles = fileEntries.filter(
      (f) => f.status === 'completed' || f.status === 'downloaded'
    );

    if (completedFiles.length === 0) return;

    for (const file of completedFiles) {
      console.log(file);
      await handleDownload(file);
    }
  }, [fileEntries, handleDownload]);

  const handleReset = useCallback(() => {
    setSelectedFiles([]);
    setFileEntries([]);
    setAppState('IDLE');
  }, []);

  return {
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
  };
}
