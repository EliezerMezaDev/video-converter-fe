import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Clapperboard, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import { useToast } from './components/Toast';
import ToastContainer from './components/Toast';
import FileUpload from './components/FileUpload';
import ConversionList from './components/ConversionList';

const API_URL = import.meta.env.VITE_API_URL || '';

let fileIdCounter = 0;

export default function App() {
  const [appState, setAppState] = useState('IDLE');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileEntries, setFileEntries] = useState([]);
  const { socketId, isConnected, on, off } = useSocket();
  const { toasts, addToast, removeToast } = useToast();
  const isProcessingRef = useRef(false);

  // Prevent page close during active operations
  useEffect(() => {
    const handler = (e) => {
      if (appState === 'UPLOADING' || appState === 'CONVERTING') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [appState]);

  // Listen for WebSocket conversion events
  useEffect(() => {
    on('conversion:start', (data) => {
      setFileEntries((prev) =>
        prev.map((f) =>
          f.originalName === data.originalName
            ? { ...f, status: 'converting' }
            : f
        )
      );
    });

    on('conversion:success', (data) => {
      setFileEntries((prev) => {
        const updated = prev.map((f) =>
          f.originalName === data.originalName
            ? {
                ...f,
                status: 'completed',
                downloadFilename: data.resultName,
              }
            : f
        );
        const allDone = updated.every(
          (f) =>
            f.status === 'completed' ||
            f.status === 'downloaded' ||
            f.status === 'error'
        );
        if (allDone) {
          setTimeout(() => setAppState('FINISHED'), 300);
        }
        return updated;
      });
    });

    on('conversion:error', (data) => {
      setFileEntries((prev) => {
        const updated = prev.map((f) =>
          f.originalName === data.originalName
            ? { ...f, status: 'error', error: data.error || 'Error de conversión' }
            : f
        );
        const allDone = updated.every(
          (f) =>
            f.status === 'completed' ||
            f.status === 'downloaded' ||
            f.status === 'error'
        );
        if (allDone) {
          setTimeout(() => setAppState('FINISHED'), 300);
        }
        return updated;
      });
      addToast(
        `Error al convertir "${data.originalName}": ${data.error || 'desconocido'}`,
        'error'
      );
    });

    return () => {
      off('conversion:start');
      off('conversion:success');
      off('conversion:error');
    };
  }, [on, off, addToast]);

  // File selection handlers
  const handleFilesSelected = useCallback((newFiles) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Upload flow
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !socketId) {
      if (!socketId) addToast('Sin conexión al servidor. Reintenta en unos segundos.', 'error');
      return;
    }

    isProcessingRef.current = true;
    setAppState('UPLOADING');

    const entries = selectedFiles.map((file) => ({
      id: ++fileIdCounter,
      file,
      name: file.name,
      originalName: file.name,
      size: file.size,
      status: 'uploading',
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
            ? (progressEvent.loaded / progressEvent.total) * 100
            : 0;
          setFileEntries((prev) =>
            prev.map((f) => ({
              ...f,
              uploadProgress: percent,
              status: percent >= 100 ? 'uploaded' : 'uploading',
            }))
          );
        },
      });

      setFileEntries((prev) =>
        prev.map((f) => ({
          ...f,
          status: f.status === 'uploading' ? 'uploaded' : f.status,
          uploadProgress: 100,
        }))
      );
      setAppState('CONVERTING');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Error al subir los archivos';
      addToast(message, 'error');
      setFileEntries((prev) =>
        prev.map((f) => ({ ...f, status: 'error', error: message }))
      );
      setAppState('FINISHED');
    }

    isProcessingRef.current = false;
  }, [selectedFiles, socketId, addToast]);

  // Single file download
  const handleDownload = useCallback(
    async (file) => {
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
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'downloaded' } : f
          )
        );
      } catch {
        addToast(`Error al descargar "${file.name}"`, 'error');
      }
    },
    [addToast]
  );

  // Batch download — downloads all completed files sequentially
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

  // Reset
  const handleReset = useCallback(() => {
    setSelectedFiles([]);
    setFileEntries([]);
    setAppState('IDLE');
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Clapperboard className="w-5 h-5 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-50 tracking-tight leading-tight">
                Video Converter
              </h1>
              <p className="text-[11px] text-surface-500 font-medium tracking-wide uppercase">
                MOV → MP4
              </p>
            </div>
          </div>

          {/* Connection indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
            ${isConnected
              ? 'bg-success-500/10 text-success-400 border border-success-500/20'
              : 'bg-error-500/10 text-error-400 border border-error-500/20'
            }`}
          >
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </header>

      {/* Main content — vertically centered */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-5xl">
          <div className="glass-card p-5 sm:p-8">
            {appState === 'IDLE' ? (
              <FileUpload
                files={selectedFiles}
                onFilesSelected={handleFilesSelected}
                onRemoveFile={handleRemoveFile}
                onUpload={handleUpload}
                isUploading={false}
                addToast={addToast}
              />
            ) : (
              <ConversionList
                files={fileEntries}
                onDownload={handleDownload}
                onDownloadAll={handleDownloadAll}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-6 py-4 shrink-0">
        <p className="text-center text-xs text-surface-600">
          Soporta archivos .mov hasta 100 MB · Conversión sin pérdida de calidad
        </p>
      </footer>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
