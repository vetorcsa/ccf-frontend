import { FileRecord } from "../../services/files.service";
import { getFileStatusBadgeClass, getFileStatusLabel } from "../utils/fileStatus";

type FileDetailsPanelProps = {
    selectedFileId: string | null;
    file: FileRecord | null;
    isLoading: boolean;
    errorMessage: string;
    isDownloading: boolean;
    onDownload: () => void;
    formatDate: (value: string) => string;
};

function formatFileSize(size: number): string {
    if (size < 1024) {
        return `${size} B`;
    }

    const kb = size / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
}

export function FileDetailsPanel({
                                     selectedFileId,
                                     file,
                                     isLoading,
                                     errorMessage,
                                     isDownloading,
                                     onDownload,
                                     formatDate,
                                 }: FileDetailsPanelProps) {
    const hasData = !!selectedFileId && !isLoading && !errorMessage && !!file;
    const statusLabel = file ? getFileStatusLabel(file.status) : "";
    const statusBadgeClass = file ? getFileStatusBadgeClass(file.status) : "";

    return (
        <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white lg:flex lg:h-full lg:min-h-0 lg:flex-col">
            <header className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Detalhes do Arquivo
                </h2>
            </header>

            {!selectedFileId ? (
                <div className="px-5 py-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4">
                        <p className="text-sm font-medium text-slate-700">Nenhum arquivo selecionado</p>
                        <p className="mt-1 text-xs text-slate-500">
                            Selecione um item da lista para visualizar os detalhes.
                        </p>
                    </div>
                </div>
            ) : null}

            {selectedFileId && isLoading ? (
                <div className="px-5 py-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4">
                        <p className="text-sm font-medium text-slate-700">Carregando detalhes...</p>
                        <div className="mt-2 h-2.5 w-2/3 animate-pulse rounded bg-slate-200"></div>
                    </div>
                </div>
            ) : null}

            {selectedFileId && !isLoading && errorMessage ? (
                <div className="px-5 py-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
                    <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-4">
                        <p className="text-sm font-medium text-rose-700">Falha ao carregar detalhes</p>
                        <p className="mt-1 text-xs text-rose-600">{errorMessage}</p>
                    </div>
                </div>
            ) : null}

            {hasData && file ? (
                <>
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-700">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <p className="break-all text-sm font-semibold text-slate-900">
                                    {file.originalName}
                                </p>
                                <p className="mt-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass}`}>
                    {statusLabel}
                  </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                        <dl>
                            <div className="border-b border-slate-200 px-5 py-4">
                                <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
                                    Enviado por
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-slate-700">
                                    {file.uploadedBy.name}
                                </dd>
                            </div>

                            <div className="border-b border-slate-200 px-5 py-4">
                                <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
                                    Data de Upload
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-slate-700">
                                    {formatDate(file.createdAt)}
                                </dd>
                            </div>

                            <div className="border-b border-slate-200 px-5 py-4">
                                <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
                                    Tipo de Arquivo
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-slate-700">
                                    {file.mimeType}
                                </dd>
                            </div>

                            <div className="px-5 py-4">
                                <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
                                    Tamanho do Arquivo
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-slate-700">
                                    {formatFileSize(file.size)}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <footer className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                        <button
                            type="button"
                            onClick={onDownload}
                            disabled={isDownloading}
                            className="h-10 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDownloading ? "Baixando..." : "Baixar Arquivo"}
                        </button>
                    </footer>
                </>
            ) : null}
        </aside>
    );
}
