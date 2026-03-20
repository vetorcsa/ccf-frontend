type UploadModalProps = {
  isOpen: boolean;
  selectedFile: File | null;
  isSubmitting: boolean;
  errorMessage: string;
  successMessage: string;
  onClose: () => void;
  onConfirm: () => void;
  onSelectFile: (file: File | null) => void;
};

export function UploadModal({
  isOpen,
  selectedFile,
  isSubmitting,
  errorMessage,
  successMessage,
  onClose,
  onConfirm,
  onSelectFile,
}: UploadModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upload de XML"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar modal de upload"
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full rounded-t-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Novo Upload</h2>
            <p className="mt-1 text-sm text-slate-600">
              Selecione um arquivo XML para enviar ao sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="xml-upload-input"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/60 px-3 py-3 transition hover:bg-blue-50"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </span>
            <span className="text-sm font-medium text-slate-700">
              {selectedFile ? "Trocar arquivo XML" : "Selecionar arquivo XML"}
            </span>
          </label>

          <input
            id="xml-upload-input"
            type="file"
            accept=".xml,text/xml,application/xml"
            disabled={isSubmitting}
            onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
            className="hidden"
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-500">
              Arquivo selecionado
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado."}
            </p>
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-10 rounded-md bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Confirmar Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
