import {
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  CheckCheck,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Esperando...',
    color: 'text-surface-400',
    badgeBg: 'bg-surface-700/50',
  },
  uploading: {
    icon: Loader2,
    label: 'Subiendo...',
    color: 'text-primary-400',
    badgeBg: 'bg-primary-500/15',
    spin: true,
  },
  uploaded: {
    icon: CheckCircle2,
    label: 'Subido',
    color: 'text-primary-400',
    badgeBg: 'bg-primary-500/15',
  },
  converting: {
    icon: Loader2,
    label: 'Convirtiendo...',
    color: 'text-warning-400',
    badgeBg: 'bg-warning-500/15',
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completado',
    color: 'text-success-400',
    badgeBg: 'bg-success-500/15',
  },
  downloaded: {
    icon: CheckCheck,
    label: 'Descargado',
    color: 'text-success-400',
    badgeBg: 'bg-success-500/10',
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    color: 'text-error-400',
    badgeBg: 'bg-error-500/15',
  },
};

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function FileItem({ file }) {
  const config = STATUS_CONFIG[file.status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const showProgress =
    file.status === 'uploading' && file.uploadProgress !== undefined;
  const showError = file.status === 'error' && file.error;

  return (
    <div
      className="glass-card-light p-3 sm:p-4 animate-fade-in transition-all duration-300"
      style={{ animationDelay: `${file.index * 60}ms` }}
    >
      {/* Top row: icon + info + status */}
      <div className="flex items-center gap-3">
        {/* File icon */}
        <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
          <FileVideo className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-100 truncate">
            {file.name}
          </p>
          <span className="text-xs text-surface-500">
            {formatSize(file.size)}
          </span>
        </div>

        {/* Status badge */}
        <div
          className={`shrink-0 flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full ${config.badgeBg}`}
        >
          <Icon
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${config.color} ${config.spin ? 'spinner' : ''}`}
          />
          <span className={`text-[11px] sm:text-xs font-medium ${config.color} hidden sm:inline`}>
            {file.status === 'uploading' && file.uploadProgress !== undefined
              ? `${Math.round(file.uploadProgress)}%`
              : config.label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mt-2.5 w-full h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-animated transition-all duration-300 ease-out"
            style={{ width: `${file.uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {showError && (
        <p className="mt-2 text-xs text-error-400 truncate">{file.error}</p>
      )}
    </div>
  );
}
