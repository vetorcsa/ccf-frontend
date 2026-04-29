import { BATCH_UPLOAD_FILE_LIMIT_MESSAGE, MAX_BATCH_UPLOAD_FILES } from "../../hooks/useBatchUpload";

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

const SELECTED_FILES_PREVIEW_LIMIT = 12;

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

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 16V4" />
      <path d="m17 9-5-5-5 5" />
      <path d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
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
  const selectedFilesPreview = selectedFiles.slice(0, SELECTED_FILES_PREVIEW_LIMIT);
  const hiddenSelectedFilesCount = Math.max(0, selectedFiles.length - selectedFilesPreview.length);
  const selectedFilesTotalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
  const confirmButtonLabel = isSubmitting ? "Enviando..." : successMessage ? "Concluído" : "Criar lote e enviar";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
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

      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="relative flex items-start justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
          <div className="pr-10">
            <h2 className="text-xl font-bold text-slate-900">Novo Lote</h2>
            <p className="mt-1 text-sm text-slate-500">Informe o nome do lote e envie os XMLs em uma única ação.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLocked}
            className="absolute right-5 top-5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-white p-5 sm:p-6">
          <div>
            <label
              htmlFor="batch-name"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Nome do Lote
            </label>
            <input
              id="batch-name"
              type="text"
              value={batchName}
              disabled={isLocked}
              onChange={(event) => onChangeBatchName(event.target.value)}
              placeholder="Ex.: Supermercado A"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="batch-files-input"
              className={`group flex items-center gap-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-5 transition-all ${
                isLocked
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/80"
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 transition-transform group-hover:scale-105">
                <UploadIcon />
              </span>
              <div>
                <p className="text-sm font-semibold text-indigo-950">
                  {selectedFiles.length > 0 ? "Trocar arquivos XML" : "Selecionar arquivos XML"}
                </p>
                <p className="mt-0.5 text-xs font-medium text-indigo-600/70">Seleção múltipla habilitada</p>
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

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Arquivos Selecionados
            </p>

            {selectedFiles.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Tamanho total aproximado: {formatFileSize(selectedFilesTotalSize)}. {BATCH_UPLOAD_FILE_LIMIT_MESSAGE}
                </p>

                <ul className="mt-4 max-h-44 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                  {selectedFilesPreview.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        disabled={isLocked}
                        className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                  {hiddenSelectedFilesCount > 0 ? (
                    <li className="px-3 py-2.5 text-xs font-medium text-slate-500">
                      + {hiddenSelectedFilesCount} arquivo(s) selecionado(s) além desta prévia.
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-slate-900">Nenhum arquivo selecionado.</p>
                <p className="text-xs text-slate-500">
                  Apenas XML (.xml). Limite: até {MAX_BATCH_UPLOAD_FILES} arquivos por envio.
                </p>
              </div>
            )}
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLocked}
            className="h-10 cursor-pointer rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-32"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-44"
          >
            <span
              aria-hidden="true"
              className={`grid h-4 shrink-0 place-items-center overflow-hidden transition-all ${
                successMessage ? "w-4 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <CheckIcon />
            </span>
            <span>{confirmButtonLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
