import { useState, useRef, useCallback } from 'react';
import { Upload, FileVideo, X } from 'lucide-react';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function FileUpload({
  files,
  onFilesSelected,
  onRemoveFile,
  onUpload,
  isUploading,
  addToast,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const dragCounterRef = useRef(0);

  const validateAndAdd = useCallback(
    (fileList) => {
      const validFiles = [];
      const errors = [];

      Array.from(fileList).forEach((file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'mov') {
          errors.push(`"${file.name}" no es un archivo .mov`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`"${file.name}" excede el límite de 100 MB`);
          return;
        }
        if (files.some((f) => f.name === file.name && f.size === file.size)) {
          errors.push(`"${file.name}" ya fue seleccionado`);
          return;
        }
        validFiles.push(file);
      });

      errors.forEach((err) => addToast(err, 'error'));

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [files, onFilesSelected, addToast]
  );

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      validateAndAdd(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      validateAndAdd(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Dropzone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 sm:gap-4 py-10 sm:py-14 px-6 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group
          ${
            isDragging
              ? 'border-primary-400 bg-primary-500/10 scale-[1.015]'
              : 'border-surface-600/40 hover:border-primary-500/40 hover:bg-surface-800/20'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isDragging ? 'bg-primary-500/20 scale-110' : 'bg-surface-700/40 group-hover:bg-primary-500/10'}`}
        >
          <Upload
            className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300
            ${isDragging ? 'text-primary-400 animate-float' : 'text-surface-400 group-hover:text-primary-400'}`}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-surface-200 font-medium text-sm sm:text-base">
            {isDragging
              ? 'Suelta los archivos aquí'
              : 'Arrastra y suelta archivos .mov'}
          </p>
          <p className="text-surface-500 text-xs sm:text-sm">
            o haz clic para seleccionar · Máximo 100 MB por archivo
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".mov"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Selected files list */}
      {files.length > 0 && (
        <div className="mt-5 sm:mt-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-medium text-surface-300">
              {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado
              {files.length !== 1 ? 's' : ''}
            </h3>
            <span className="text-xs text-surface-500 font-medium">
              {formatSize(files.reduce((sum, f) => sum + f.size, 0))} total
            </span>
          </div>

          <div className="space-y-2 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${file.size}`}
                className="glass-card-light px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <FileVideo className="w-4 h-4 text-primary-400 shrink-0" />
                <span className="text-sm text-surface-200 truncate flex-1 min-w-0">
                  {file.name}
                </span>
                <span className="text-xs text-surface-500 shrink-0 hidden sm:inline">
                  {formatSize(file.size)}
                </span>
                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(i);
                    }}
                    className="shrink-0 p-1 -m-1 text-surface-500 hover:text-error-400 transition-colors cursor-pointer rounded-md hover:bg-error-500/10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload button */}
          <button
            onClick={onUpload}
            disabled={isUploading || files.length === 0}
            className="w-full mt-3 sm:mt-4 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer
              bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400
              text-white shadow-lg shadow-primary-500/20 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
              active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Subir y convertir
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
