import { FileRecord } from "../../services/files.service";

type FilesListProps = {
  files: FileRecord[];
  selectedFileId: string | null;
  isLoading: boolean;
  errorMessage: string;
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  downloadingFileId: string | null;
  onSelectFile: (id: string) => void;
  onOpenDetails: (id: string) => void;
  onDownloadFile: (file: FileRecord) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  formatDate: (value: string) => string;
};

function statusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized.includes("erro") || normalized.includes("error")) {
    return "bg-rose-100 text-rose-700";
  }

  if (normalized.includes("process")) {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-amber-100 text-amber-700";
}

export function FilesList({
                            files,
                            selectedFileId,
                            isLoading,
                            errorMessage,
                            total,
                            currentPage,
                            totalPages,
                            pageSize,
                            downloadingFileId,
                            onSelectFile,
                            onOpenDetails,
                            onDownloadFile,
                            onPreviousPage,
                            onNextPage,
                          formatDate,
                          }: FilesListProps) {
  return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
        <header className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:grid">
          <span>Nome do Arquivo</span>
          <span>Status</span>
          <span>Enviado por</span>
          <span>Data</span>
        </header>

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain lg:p-4">
          {isLoading ? (
              <p className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                Carregando arquivos...
              </p>
          ) : null}

          {!isLoading && errorMessage ? (
              <p className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                {errorMessage}
              </p>
          ) : null}

          {!isLoading && !errorMessage && files.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
                Nenhum arquivo encontrado para os filtros informados.
              </p>
          ) : null}

          {!isLoading && !errorMessage
              ? files.map((file) => {
                const isSelected = file.id === selectedFileId;

                return (
                    <article
                        key={file.id}
                        className={`rounded-lg border p-3 transition lg:p-4 ${
                            isSelected
                                ? "border-blue-600 bg-blue-50/60 shadow-[0_0_0_1px_rgba(29,78,216,0.45)]"
                                : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <button
                          type="button"
                          onClick={() => onSelectFile(file.id)}
                          className="block w-full text-left"
                      >
                        <div className="flex items-start gap-2.5 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr] lg:items-center lg:gap-4">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium text-slate-900 lg:truncate lg:line-clamp-none">
                              {file.originalName}
                            </p>
                            <div className="mt-1 lg:hidden">
                              <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(file.status)}`}
                              >
                                {file.status}
                              </span>
                            </div>
                          </div>

                          <div className="hidden lg:block">
                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(file.status)}`}
                            >
                              {file.status}
                            </span>
                          </div>

                          <p className="hidden text-sm text-slate-600 lg:block">
                            {file.uploadedBy.name}
                          </p>
                          <p className="hidden text-sm text-slate-600 lg:block">
                            {formatDate(file.createdAt)}
                          </p>
                        </div>
                      </button>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-slate-200 pt-2.5 text-[11px] text-slate-500 lg:hidden">
                        <p className="truncate">
                          <span className="font-medium text-slate-500">Por:</span>{" "}
                          {file.uploadedBy.name}
                        </p>
                        <p className="truncate">
                          <span className="font-medium text-slate-500">Data:</span>{" "}
                          {formatDate(file.createdAt)}
                        </p>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-slate-200 pt-2.5 lg:hidden">
                        <button
                            type="button"
                            onClick={() => onOpenDetails(file.id)}
                            className="h-9 rounded-md bg-blue-700 px-3 text-xs font-medium text-white transition hover:bg-blue-800"
                        >
                          Ver detalhes
                        </button>
                        <button
                            type="button"
                            onClick={() => onDownloadFile(file)}
                            disabled={downloadingFileId === file.id}
                            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloadingFileId === file.id ? "Baixando..." : "Download"}
                        </button>
                      </div>

                      <div className="mt-3 hidden justify-end border-t border-slate-200 pt-3 lg:flex">
                        <button
                            type="button"
                            onClick={() => onDownloadFile(file)}
                            disabled={downloadingFileId === file.id}
                            className="h-8 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloadingFileId === file.id ? "Baixando..." : "Baixar"}
                        </button>
                      </div>
                    </article>
                );
              })
              : null}
        </div>

        <footer className="flex flex-col gap-2.5 border-t border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-4 lg:py-4">
          <p>
            Mostrando {files.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} a{" "}
            {(currentPage - 1) * pageSize + files.length} de {total}
          </p>

          <div className="grid w-full grid-cols-[1fr_auto_1fr] gap-2 sm:flex sm:w-auto sm:gap-1">
            <button
                type="button"
                onClick={onPreviousPage}
                disabled={isLoading || currentPage <= 1}
                className="inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Anterior
            </button>

            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-2 text-sm font-medium text-white">
            {currentPage}
          </span>

            <button
                type="button"
                onClick={onNextPage}
                disabled={isLoading || currentPage >= totalPages}
                className="inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Próximo
            </button>
          </div>
        </footer>
      </section>
  );
}
