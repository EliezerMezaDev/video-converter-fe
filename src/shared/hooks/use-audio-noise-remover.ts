import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './use-socket';

export type AudioAppState = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'FINISHED';
export type AudioFileStatus = 'pending' | 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error' | 'downloaded';
export type StrengthLevel = 'soft' | 'medium' | 'strong';

export const STRENGTH_LEVELS: { value: StrengthLevel; label: string; description: string }[] = [
  { value: 'soft',   label: 'Suave',  description: 'Reducción leve, máxima fidelidad' },
  { value: 'medium', label: 'Medio',  description: 'Balance entre limpieza y calidad' },
  { value: 'strong', label: 'Fuerte', description: 'Reducción agresiva de ruido' },
];

export interface AudioFileEntry {
  id: string;
  file: File;
  originalName: string;
  size: number;
  status: AudioFileStatus;
  uploadProgress: number;
  error: string | null;
  downloadFilename: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useAudioNoiseRemover() {
  const [appState, setAppState] = useState<AudioAppState>('IDLE');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileEntries, setFileEntries] = useState<AudioFileEntry[]>([]);
  const [strength, setStrength] = useState<StrengthLevel>('medium');
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
      if (appState === 'UPLOADING' || appState === 'PROCESSING') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [appState]);

  useEffect(() => {
    on('audio:progress', (data: any) => {
      setFileEntries((prev) =>
        prev.map((f) =>
          f.originalName === data.file ? { ...f, status: 'processing' as AudioFileStatus } : f
        )
      );
    });

    on('audio:success', (data: any) => {
      setFileEntries((prev) => {
        const updated = prev.map((f) =>
          f.originalName === data.originalName
            ? { ...f, status: 'completed' as AudioFileStatus, downloadFilename: data.resultName }
            : f
        );
        const allDone = updated.every(
          (f) => f.status === 'completed' || f.status === 'downloaded' || f.status === 'error'
        );
        if (allDone) setTimeout(() => setAppState('FINISHED'), 300);
        return updated;
      });
    });

    on('audio:error', (data: any) => {
      setFileEntries((prev) => {
        const updated = prev.map((f) =>
          f.originalName === data.file
            ? { ...f, status: 'error' as AudioFileStatus, error: data.error || 'Error al procesar el audio' }
            : f
        );
        const allDone = updated.every(
          (f) => f.status === 'completed' || f.status === 'downloaded' || f.status === 'error'
        );
        if (allDone) setTimeout(() => setAppState('FINISHED'), 300);
        return updated;
      });
      addToast(`Error al procesar "${data.file}": ${data.error || 'desconocido'}`, 'error');
    });

    return () => {
      off('audio:progress');
      off('audio:success');
      off('audio:error');
    };
  }, [on, off, addToast]);

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

    const entries: AudioFileEntry[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      originalName: file.name,
      size: file.size,
      status: 'uploading' as AudioFileStatus,
      uploadProgress: 0,
      error: null,
      downloadFilename: null,
    }));
    setFileEntries(entries);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('audios', file));
    formData.append('socketId', socketId);
    formData.append('strength', strength);

    try {
      await axios.post(`${API_URL}/api/v1/audio/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          setFileEntries((prev) =>
            prev.map((f) => ({
              ...f,
              uploadProgress: percent,
              status: percent >= 100 ? ('uploaded' as AudioFileStatus) : ('uploading' as AudioFileStatus),
            }))
          );
        },
      });

      setFileEntries((prev) =>
        prev.map((f) => ({
          ...f,
          status: f.status === 'uploading' ? ('uploaded' as AudioFileStatus) : f.status,
          uploadProgress: 100,
        }))
      );
      setAppState('PROCESSING');
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Error al subir los archivos';
      addToast(message, 'error');
      setFileEntries((prev) => prev.map((f) => ({ ...f, status: 'error' as AudioFileStatus, error: message })));
      setAppState('FINISHED');
    }
  }, [selectedFiles, socketId, strength, addToast]);

  const handleDownload = useCallback(async (entry: AudioFileEntry) => {
    if (!entry.downloadFilename) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/v1/audio/download/${encodeURIComponent(entry.downloadFilename)}`,
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
        prev.map((f) => (f.id === entry.id ? { ...f, status: 'downloaded' as AudioFileStatus } : f))
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
    setSelectedFiles([]);
    setFileEntries([]);
    setAppState('IDLE');
  }, []);

  return {
    appState,
    selectedFiles,
    fileEntries,
    strength,
    setStrength,
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
