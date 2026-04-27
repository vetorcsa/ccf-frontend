"use client";

import axios from "axios";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { getAccessToken } from "../../../lib/auth";
import { AppSidebar } from "../../../components/AppSidebar";
import { UserMenu } from "../../../components/UserMenu";
import { useAuthenticatedUser } from "../../../hooks/useAuthenticatedUser";
import { getFileStatusBadgeClass, getFileStatusLabel } from "../../../files/utils/fileStatus";
import {
  buildDemoXmlBlob,
  DEMO_BATCH_SUMMARY,
  filterDemoBatchFiles,
  getDemoBatchSummary,
  isDemoBatchId,
} from "../../../lib/demoBatchAnalysis";
import { type BatchSummary, listBatchFiles } from "../../../services/batches.service";
import { downloadFile, type FileRecord } from "../../../services/files.service";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function normalizeStatus(status: string): string {
  return status.trim().toUpperCase();
}

function getBatchStatusLabel(status: string): string {
  const normalized = normalizeStatus(status);

  if (normalized.includes("COMPLETED_WITH_ERRORS")) {
    return "Concluído c/ erros";
  }

  if (normalized.includes("FAILED") || normalized.includes("ERROR") || normalized.includes("FAIL")) {
    return "Falhou";
  }

  if (normalized.includes("PROCESSING")) {
    return "Processando";
  }

  if (normalized.includes("COMPLETED") || normalized.includes("PROCESSED")) {
    return "Concluído";
  }

  return "Recebido";
}

function getBatchStatusClass(status: string): string {
  const normalized = normalizeStatus(status);

  if (normalized.includes("COMPLETED_WITH_ERRORS")) {
    return "border border-amber-200 bg-amber-100 text-amber-700";
  }

  if (normalized.includes("FAILED") || normalized.includes("ERROR") || normalized.includes("FAIL")) {
    return "border border-rose-200 bg-rose-100 text-rose-700";
  }

  if (normalized.includes("PROCESSING")) {
    return "border border-slate-300 bg-slate-200 text-slate-700";
  }

  if (normalized.includes("COMPLETED") || normalized.includes("PROCESSED")) {
    return "border border-emerald-200 bg-emerald-100 text-emerald-700";
  }

  return "border border-blue-200 bg-blue-100 text-blue-700";
}

function formatAbsoluteDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", "");
}

function formatFileSize(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  if (index === 0) {
    return `${Math.round(size)} ${units[index]}`;
  }

  return `${size.toFixed(1)} ${units[index]}`;
}

function BatchInfoCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-slate-500">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-slate-900">{value}</div>
    </article>
  );
}

export default function BatchFilesPage() {
  const router = useRouter();
  const params = useParams<{ batchId: string }>();
  const rawBatchId = params?.batchId;
  const batchId = Array.isArray(rawBatchId) ? rawBatchId[0] : rawBatchId;

  const isHydrated = useIsHydrated();
  const token = isHydrated ? getAccessToken() : null;
  const { userDisplay } = useAuthenticatedUser(token);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [batch, setBatch] = useState<BatchSummary | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openMenuFileId, setOpenMenuFileId] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/");
    }
  }, [isHydrated, token, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setActiveSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const clickedInsideActions = target.closest("[data-batch-file-actions]");

      if (!clickedInsideActions) {
        setOpenMenuFileId(null);
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setOpenMenuFileId(null);
  }, [page, activeSearch, dateFrom, dateTo]);

  useEffect(() => {
    if (!isHydrated || !token || !batchId) {
      return;
    }

    let isActive = true;

    async function loadBatchFiles() {
      setIsLoading(true);
      setErrorMessage("");

      if (isDemoBatchId(batchId)) {
        const filteredFiles = filterDemoBatchFiles({
          batchId,
          search: activeSearch || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });
        const pageStart = (page - 1) * PAGE_SIZE;
        const pageEnd = pageStart + PAGE_SIZE;

        setBatch(getDemoBatchSummary(batchId) ?? DEMO_BATCH_SUMMARY);
        setFiles(filteredFiles.slice(pageStart, pageEnd));
        setTotal(filteredFiles.length);
        setTotalPages(Math.max(1, Math.ceil(filteredFiles.length / PAGE_SIZE)));
        setPageSize(PAGE_SIZE);
        setIsLoading(false);
        return;
      }

      try {
        const response = await listBatchFiles(batchId, {
          page,
          pageSize: PAGE_SIZE,
          search: activeSearch || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });

        if (!isActive) {
          return;
        }

        setBatch(response.batch);
        setFiles(response.data);
        setTotal(response.total);
        setTotalPages(Math.max(1, response.totalPages));
        setPageSize(response.pageSize);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            router.replace("/");
            return;
          }

          if (status === 404) {
            setErrorMessage("Lote não encontrado.");
            return;
          }
        }

        setErrorMessage("Não foi possível carregar os arquivos deste lote.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadBatchFiles();

    return () => {
      isActive = false;
    };
  }, [activeSearch, batchId, dateFrom, dateTo, isHydrated, page, router, token]);

  const subtitleText = useMemo(() => {
    if (!batch) {
      return "Carregando informações do lote selecionado...";
    }

    return `Documentos do lote: ${batch.name}`;
  }, [batch]);

  if (!isHydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-600">Verificando acesso...</p>
      </main>
    );
  }

  if (!token) {
    return null;
  }

  async function handleDownload(file: FileRecord) {
    setDownloadingFileId(file.id);
    setOpenMenuFileId(null);

    try {
      if (isDemoBatchId(batchId)) {
        const url = URL.createObjectURL(buildDemoXmlBlob(file.originalName, batchId));
        const link = document.createElement("a");

        link.href = url;
        link.download = file.originalName;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }

      const { blob, fileName } = await downloadFile(file.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName ?? file.originalName;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingFileId(null);
    }
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-[#f2f4f7]">
      <AppSidebar activeItem="batches" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100"
              aria-label="Notificações"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>

            <UserMenu name={userDisplay.name} initials={userDisplay.initials} />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-5">
          <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="mt-[2px] inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Voltar para dashboard"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div>
                  <h1 className="text-xl font-semibold leading-none text-slate-900">Documentos do Lote</h1>
                  <p className="mt-1.5 text-sm text-slate-600">{subtitleText}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (batchId) {
                    router.push(`/batches/${batchId}/analysis`);
                  }
                }}
                className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Ver análise
              </button>
            </div>

            <section className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <BatchInfoCard label="Lote" value={batch?.name ?? "-"} />
              <BatchInfoCard
                label="Status"
                value={
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBatchStatusClass(batch?.status ?? "")}`}
                  >
                    {getBatchStatusLabel(batch?.status ?? "")}
                  </span>
                }
              />
              <BatchInfoCard label="Data" value={formatAbsoluteDate(batch?.createdAt)} />
              <BatchInfoCard label="Arquivos no lote" value={total} />
            </section>

            <section className="mt-3.5 flex min-h-[340px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
              <header className="border-b border-slate-200 px-4 py-3">
                <div className="flex flex-col gap-2.5">
                  <h2 className="text-lg font-semibold text-slate-900">Documentos do Lote</h2>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
                    <div className="relative">
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Buscar arquivo por nome..."
                        className="h-9 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(event) => {
                        setDateFrom(event.target.value);
                        setPage(1);
                      }}
                      aria-label="Data inicial"
                      className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />

                    <input
                      type="date"
                      value={dateTo}
                      onChange={(event) => {
                        setDateTo(event.target.value);
                        setPage(1);
                      }}
                      aria-label="Data final"
                      className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </header>

              {errorMessage ? (
                <div className="border-t border-slate-200 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Arquivo</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Data de Upload</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Tamanho</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-xs text-slate-500">
                              Carregando arquivos do lote...
                            </td>
                          </tr>
                        ) : null}

                        {!isLoading && files.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-xs text-slate-500">
                              {activeSearch
                                ? "Nenhum arquivo corresponde à busca informada."
                                : "Nenhum arquivo encontrado neste lote."}
                            </td>
                          </tr>
                        ) : null}

                        {!isLoading
                          ? files.map((file) => (
                              <tr key={file.id} className="border-b border-slate-200 last:border-b-0">
                                <td className="px-4 py-2.5 text-xs font-medium text-slate-900">{file.originalName}</td>
                                <td className="px-4 py-2.5 text-xs text-slate-600">{formatAbsoluteDate(file.createdAt)}</td>
                                <td className="px-4 py-2.5 text-xs text-slate-600">{formatFileSize(file.size)}</td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getFileStatusBadgeClass(file.status)}`}
                                  >
                                    {getFileStatusLabel(file.status)}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <div className="relative inline-flex" data-batch-file-actions>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenMenuFileId((previous) =>
                                          previous === file.id ? null : file.id,
                                        );
                                      }}
                                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
                                      aria-label={`Abrir ações de ${file.originalName}`}
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <circle cx="5" cy="12" r="1"></circle>
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="19" cy="12" r="1"></circle>
                                      </svg>
                                    </button>

                                    {openMenuFileId === file.id ? (
                                      <div className="absolute right-0 top-8 z-20 w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenMenuFileId(null);
                                            if (isDemoBatchId(batchId)) {
                                              router.push(`/batches/${batchId}/analysis`);
                                              return;
                                            }
                                            router.push(`/results/${file.id}`);
                                          }}
                                          className="flex h-7 w-full cursor-pointer items-center gap-2 rounded px-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            className="h-3.5 w-3.5 text-slate-500"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                                            <circle cx="12" cy="12" r="3" />
                                          </svg>
                                          Ver análise
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            void handleDownload(file);
                                          }}
                                          disabled={downloadingFileId === file.id}
                                          className="mt-0.5 flex h-7 w-full cursor-pointer items-center gap-2 rounded px-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            className="h-3.5 w-3.5 text-slate-500"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                          </svg>
                                          {downloadingFileId === file.id ? "Baixando..." : "Download"}
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            ))
                          : null}
                      </tbody>
                    </table>
                  </div>

                  <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Mostrando {files.length > 0 ? (page - 1) * pageSize + 1 : 0} a {(page - 1) * pageSize + files.length} de {total}
                    </p>

                    <div className="grid w-full grid-cols-[1fr_auto_1fr] gap-2 sm:flex sm:w-auto sm:gap-1">
                      <button
                        type="button"
                        onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                        disabled={isLoading || page <= 1}
                        className="inline-flex h-7 w-full cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        Anterior
                      </button>

                      <div className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-1">
                        {page > 1 ? (
                          <button
                            type="button"
                            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                            className="inline-flex h-5 min-w-5 cursor-pointer items-center justify-center rounded border border-slate-200 px-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                          >
                            {page - 1}
                          </button>
                        ) : null}

                        <span className="inline-flex h-5 min-w-5 cursor-default items-center justify-center rounded border border-blue-700 bg-blue-700 px-1.5 text-xs font-semibold text-white">
                          {page}
                        </span>

                        {page < totalPages ? (
                          <button
                            type="button"
                            onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                            className="inline-flex h-5 min-w-5 cursor-pointer items-center justify-center rounded border border-slate-200 px-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                          >
                            {page + 1}
                          </button>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                        disabled={isLoading || page >= totalPages}
                        className="inline-flex h-7 w-full cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        Próximo
                      </button>
                    </div>
                  </footer>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
