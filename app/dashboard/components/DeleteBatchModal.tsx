"use client";

type DeleteBatchModalProps = {
  isOpen: boolean;
  batchName: string;
  isSubmitting: boolean;
  errorMessage: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteBatchModal({
  isOpen,
  batchName,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteBatchModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Excluir lote"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        aria-label="Fechar confirmação de exclusão"
        className="absolute inset-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="relative z-10 w-full rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
        <header className="px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">Excluir lote</h2>
          <p className="mt-1 text-sm text-slate-600">
            Tem certeza que deseja excluir este lote? Essa ação removerá o lote e todos os XMLs vinculados.
          </p>
          {batchName ? <p className="mt-2 text-xs font-medium text-slate-700">Lote: {batchName}</p> : null}
        </header>

        {errorMessage ? (
          <div className="px-4 pb-4 sm:px-5">
            <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          </div>
        ) : null}

        <footer className="grid grid-cols-2 gap-2 border-t border-slate-200 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 cursor-pointer rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-10 cursor-pointer rounded-md bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Excluindo..." : "Excluir lote"}
          </button>
        </footer>
      </div>
    </div>
  );
}
