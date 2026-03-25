import { CheckCircle2, Download, Loader2, RefreshCw } from 'lucide-react';
import FileItem from './FileItem';

export default function ConversionList({ files, onDownloadAll, onReset }) {
  const total = files.length;
  const completed = files.filter(
    (f) => f.status === 'completed' || f.status === 'downloaded'
  ).length;
  const errors = files.filter((f) => f.status === 'error').length;
  const converting = files.filter((f) => f.status === 'converting').length;
  const uploading = files.filter((f) => f.status === 'uploading').length;
  const allDone = completed + errors === total && uploading === 0;

  const getHeaderText = () => {
    if (uploading > 0) return `Subiendo ${uploading} de ${total} archivos...`;
    if (converting > 0)
      return `Convirtiendo ${converting} de ${total} archivos...`;
    if (allDone && errors === 0) return '¡Todos los archivos completados!';
    if (allDone && errors > 0)
      return `Completados: ${completed} • Errores: ${errors}`;
    return `Procesando ${total} archivos...`;
  };

  const getProgressPercent = () => {
    if (total === 0) return 0;
    return Math.round(((completed + errors) / total) * 100);
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          {allDone ? (
            <div className="w-8 h-8 rounded-lg bg-success-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-success-400" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-primary-400 spinner" />
            </div>
          )}
          <h2 className="text-lg font-semibold text-surface-100">
            {getHeaderText()}
          </h2>
        </div>

        {/* Batch progress bar */}
        {!allDone && (
          <div className="w-full h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary-500 to-success-500 transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>
        )}
      </div>

      {/* File list */}
      <div className="space-y-2">
        {files.map((file, i) => (
          <FileItem
            key={file.id}
            file={{ ...file, index: i }}
          />
        ))}
      </div>

      {/* Action buttons when done */}
      {allDone && (
        <div className="mt-6 flex flex-col gap-3">
          {completed > 0 && (
            <button
              onClick={onDownloadAll}
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer
                bg-linear-to-r from-success-600 to-success-500 hover:from-success-500 hover:to-success-400
                text-white shadow-lg shadow-success-500/25 hover:shadow-success-500/35
                active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Descargar todos ({completed} {completed === 1 ? 'archivo' : 'archivos'})
              </span>
            </button>
          )}
          <button
            onClick={onReset}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer
              bg-surface-700/60 hover:bg-surface-700/90 border border-surface-600/40 hover:border-surface-500/60
              text-surface-300 hover:text-surface-100
              active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Convertir más videos
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
