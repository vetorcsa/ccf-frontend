import { FileRecord } from "../../services/files.service";
import { getFileStatusBadgeClass, getFileStatusLabel } from "../utils/fileStatus";

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
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
        <header className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:grid">
          <span>Nome do Arquivo</span>
          <span>Status</span>
          <span>Enviado por</span>
          <span>Data</span>
        </header>

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 py-3 lg:p-4">
          {isLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
                <p className="text-sm font-medium text-slate-700">Carregando arquivos...</p>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200"></div>
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200"></div>
                </div>
              </div>
          ) : null}

          {!isLoading && errorMessage ? (
              <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <p className="font-medium">Não foi possível carregar a lista.</p>
                <p className="mt-1 text-xs text-rose-600">{errorMessage}</p>
              </div>
          ) : null}

          {!isLoading && !errorMessage && files.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
                <p className="text-sm font-medium text-slate-700">Nenhum arquivo encontrado</p>
                <p className="mt-1 text-xs text-slate-500">
                  Ajuste os filtros e tente novamente.
                </p>
              </div>
          ) : null}

          {!isLoading && !errorMessage
              ? files.map((file) => {
                const isSelected = file.id === selectedFileId;
                const statusLabel = getFileStatusLabel(file.status);

                return (
                    <article
                        key={file.id}
                        className={`rounded-lg border p-3 transition hover:shadow-sm lg:p-4 ${
                            isSelected
                                ? "border-blue-600 bg-blue-50/60 shadow-[0_0_0_1px_rgba(29,78,216,0.45)]"
                                : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <button
                          type="button"
                          onClick={() => onSelectFile(file.id)}
                          className="block w-full cursor-pointer text-left"
                      >
                        <div className="flex items-start gap-2.5 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr] lg:items-center lg:gap-4">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium text-slate-900 lg:truncate lg:line-clamp-none">
                              {file.originalName}
                            </p>
                            <div className="mt-1 lg:hidden">
                              <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${getFileStatusBadgeClass(file.status)}`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                          </div>

                          <div className="hidden lg:block">
                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getFileStatusBadgeClass(file.status)}`}
                            >
                              {statusLabel}
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
                            className="h-9 cursor-pointer rounded-md bg-blue-700 px-3 text-xs font-medium text-white transition hover:bg-blue-800"
                        >
                          Ver detalhes
                        </button>
                        <button
                            type="button"
                            onClick={() => onDownloadFile(file)}
                            disabled={downloadingFileId === file.id}
                            className="h-9 cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloadingFileId === file.id ? "Baixando..." : "Download"}
                        </button>
                      </div>

                      <div className="mt-3 hidden justify-end border-t border-slate-200 pt-3 lg:flex">
                        <button
                            type="button"
                            onClick={() => onDownloadFile(file)}
                            disabled={downloadingFileId === file.id}
                            className="h-8 cursor-pointer rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Anterior
            </button>

            <div className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-1">
              {hasPreviousPage ? (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-slate-200 px-1.5 text-xs font-medium text-slate-500">
                    {currentPage - 1}
                  </span>
              ) : null}

              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-blue-700 bg-blue-700 px-1.5 text-xs font-semibold text-white">
                {currentPage}
              </span>

              {hasNextPage ? (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-slate-200 px-1.5 text-xs font-medium text-slate-500">
                    {currentPage + 1}
                  </span>
              ) : null}
            </div>

            <button
                type="button"
                onClick={onNextPage}
                disabled={isLoading || currentPage >= totalPages}
                className="inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Próximo
            </button>
          </div>
        </footer>
      </section>
  );
}
