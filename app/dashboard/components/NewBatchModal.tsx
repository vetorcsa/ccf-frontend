type NewBatchModalProps = {
  isOpen: boolean;
  batchName: string;
  selectedFiles: File[];
  isSubmitting: boolean;
  errorMessage: string;
  successMessage: string;
  onClose: () => void;
  onConfirm: () => void;
  onChangeBatchName: (value: string) => void;
  onSelectFiles: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
};

function formatFileSize(size: number): string {
  if (!Number.isFinite(size) || size <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  if (unitIndex === 0) {
    return `${Math.round(value)} ${units[unitIndex]}`;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function NewBatchModal({
  isOpen,
  batchName,
  selectedFiles,
  isSubmitting,
  errorMessage,
  successMessage,
  onClose,
  onConfirm,
  onChangeBatchName,
  onSelectFiles,
  onRemoveFile,
}: NewBatchModalProps) {
  if (!isOpen) {
    return null;
  }

  const isLocked = isSubmitting || !!successMessage;
  const isConfirmDisabled = isLocked || !batchName.trim() || selectedFiles.length === 0;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novo lote"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isLocked}
        aria-label="Fechar modal de novo lote"
        className="absolute inset-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="relative z-10 flex h-[95dvh] w-full flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:h-auto sm:max-h-[88dvh] sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Novo Lote</h2>
            <p className="mt-1 text-sm text-slate-600">Informe o nome do lote e envie os XMLs em uma única ação.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLocked}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
          <div>
            <label htmlFor="batch-name" className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
              Nome do lote
            </label>
            <input
              id="batch-name"
              type="text"
              value={batchName}
              disabled={isLocked}
              onChange={(event) => onChangeBatchName(event.target.value)}
              placeholder="Ex.: Supermercado A"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="batch-files-input"
              className={`flex items-center gap-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/60 px-3 py-3 transition ${
                isLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-blue-50"
              }`}
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
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {selectedFiles.length > 0 ? "Trocar arquivos XML" : "Selecionar arquivos XML"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Seleção múltipla habilitada</p>
              </div>
            </label>

            <input
              id="batch-files-input"
              type="file"
              accept=".xml,text/xml,application/xml"
              multiple
              disabled={isLocked}
              onChange={(event) => onSelectFiles(event.target.files)}
              className="hidden"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-500">Arquivos selecionados</p>
            <p className="mt-1 text-sm text-slate-700">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} arquivo(s) selecionado(s)`
                : "Nenhum arquivo selecionado."}
            </p>
            <p className="mt-1 text-xs text-slate-500">Apenas XML (.xml).</p>
          </div>

          {selectedFiles.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white">
              <ul className="max-h-44 divide-y divide-slate-100 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <li key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-2 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveFile(index)}
                      disabled={isLocked}
                      className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

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

        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLocked}
            className="h-10 cursor-pointer rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="h-10 cursor-pointer rounded-md bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : successMessage ? "Concluído" : "Criar lote e enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
