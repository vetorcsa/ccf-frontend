"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "../lib/auth";
import { useBatchUpload } from "../hooks/useBatchUpload";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { BatchRecord, listBatches } from "../services/batches.service";
import { NewBatchModal } from "./components/NewBatchModal";

const DASHBOARD_STATS_PAGE_SIZE = 20;
const DASHBOARD_UPLOADS_PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 350;

type DashboardStats = {
  totalBatches: number;
  processedBatches: number;
  failedBatches: number;
  processedRate: number;
  errorsRate: number;
  uploadsToday: number;
};

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

function getDashboardStatusLabel(status: string): string {
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

function getDashboardStatusClass(status: string): string {
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

function formatAbsoluteDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(",", "");
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function getBatchDisplayName(batch: BatchRecord): string {
  const trimmed = batch.name?.trim();
  if (trimmed) {
    return trimmed;
  }

  return `Lote ${batch.id.slice(0, 8)}`;
}

function isTodayDate(value: string): boolean {
  const now = new Date();
  const target = new Date(value);

  return (
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate()
  );
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.2" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" />
      <rect x="14" y="14" width="7" height="7" rx="1.2" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 20h16" />
    </svg>
  );
}

function FilesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

function ResultsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-6" />
      <path d="M22 20H2" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.76-.32 1.6 1.6 0 0 0-1 1.46V21a2 2 0 0 1-4 0v-.09a1.6 1.6 0 0 0-1-1.46 1.6 1.6 0 0 0-1.76.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.46-1H3a2 2 0 0 1 0-4h.09a1.6 1.6 0 0 0 1.46-1 1.6 1.6 0 0 0-.32-1.76l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.76.32h.01a1.6 1.6 0 0 0 1-1.46V3a2 2 0 0 1 4 0v.09a1.6 1.6 0 0 0 1 1.46h.01a1.6 1.6 0 0 0 1.76-.32l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.76v.01a1.6 1.6 0 0 0 1.46 1H21a2 2 0 0 1 0 4h-.09a1.6 1.6 0 0 0-1.46 1z" />
    </svg>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-3.5 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-600">{title}</p>
        <span className="mt-0.5 text-slate-500">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold leading-none text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const token = isHydrated ? getAccessToken() : null;
  const { userDisplay } = useAuthenticatedUser(token);

  const [isLoading, setIsLoading] = useState(true);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    processedBatches: 0,
    failedBatches: 0,
    processedRate: 0,
    errorsRate: 0,
    uploadsToday: 0,
  });
  const [recentBatches, setRecentBatches] = useState<BatchRecord[]>([]);
  const [uploadsPage, setUploadsPage] = useState(1);
  const [uploadsTotal, setUploadsTotal] = useState(0);
  const [uploadsTotalPages, setUploadsTotalPages] = useState(1);
  const [recentSearch, setRecentSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [uploadsDateFrom, setUploadsDateFrom] = useState("");
  const [uploadsDateTo, setUploadsDateTo] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const {
    isOpen: isBatchModalOpen,
    batchName,
    selectedFiles,
    isSubmitting: isBatchSubmitting,
    errorMessage: batchErrorMessage,
    successMessage: batchSuccessMessage,
    openModal: openBatchModal,
    closeModal: closeBatchModal,
    updateBatchName,
    selectFiles,
    removeFileAt,
    confirmUpload: confirmBatchUpload,
  } = useBatchUpload({
    onSuccess: () => {
      setUploadsPage(1);
      setRefreshTrigger((previous) => previous + 1);
    },
  });

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/");
    }
  }, [isHydrated, token, router, refreshTrigger]);

  useEffect(() => {
    if (!isHydrated || !token) {
      return;
    }

    let isActive = true;

    async function loadDashboard() {
      setIsLoading(true);

      try {
        const response = await listBatches({
          page: 1,
          pageSize: DASHBOARD_STATS_PAGE_SIZE,
        });

        if (!isActive) {
          return;
        }

        const sampleSize = Math.max(response.data.length, 1);
        const sampleProcessed = response.data.filter((batch) => {
          const normalized = normalizeStatus(batch.status);
          return normalized.includes("COMPLETED") || normalized.includes("PROCESSED");
        }).length;
        const sampleErrors = response.data.filter((batch) => {
          const normalized = normalizeStatus(batch.status);
          return (
            normalized.includes("FAILED") ||
            normalized.includes("ERROR") ||
            normalized.includes("FAIL") ||
            normalized.includes("COMPLETED_WITH_ERRORS")
          );
        }).length;

        const estimatedProcessed = Math.round((sampleProcessed / sampleSize) * response.total);
        const estimatedErrors = Math.round((sampleErrors / sampleSize) * response.total);

        setStats({
          totalBatches: response.total,
          processedBatches: Math.max(estimatedProcessed, sampleProcessed),
          failedBatches: Math.max(estimatedErrors, sampleErrors),
          processedRate: Math.min(100, Number(((sampleProcessed / sampleSize) * 100).toFixed(1))),
          errorsRate: Math.min(100, Number(((sampleErrors / sampleSize) * 100).toFixed(1))),
          uploadsToday: response.data.filter((batch) => isTodayDate(batch.createdAt)).length,
        });
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
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [isHydrated, token, router, refreshTrigger]);

  const welcomeText = useMemo(() => {
    return `Bem-vindo de volta, ${userDisplay.name}. Aqui está o resumo da sua conformidade fiscal.`;
  }, [userDisplay.name]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveSearch(recentSearch.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [recentSearch]);

  useEffect(() => {
    if (!isHydrated || !token) {
      return;
    }

    let isActive = true;

    async function loadRecentUploads() {
      setUploadsLoading(true);
      setErrorMessage("");

      try {
        const response = await listBatches({
          page: uploadsPage,
          pageSize: DASHBOARD_UPLOADS_PAGE_SIZE,
          search: activeSearch || undefined,
          dateFrom: uploadsDateFrom || undefined,
          dateTo: uploadsDateTo || undefined,
        });

        if (!isActive) {
          return;
        }

        const sortedRecent = [...response.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setRecentBatches(sortedRecent);
        setUploadsTotal(response.total);
        setUploadsTotalPages(Math.max(1, response.totalPages));
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
        }

        setErrorMessage("Não foi possível carregar os lotes recentes.");
      } finally {
        if (isActive) {
          setUploadsLoading(false);
        }
      }
    }

    void loadRecentUploads();

    return () => {
      isActive = false;
    };
  }, [
    activeSearch,
    isHydrated,
    router,
    token,
    uploadsDateFrom,
    uploadsDateTo,
    uploadsPage,
    refreshTrigger,
  ]);

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

  return (
    <>
      <main className="flex h-dvh overflow-hidden bg-[#f2f4f7]">
      <aside className="hidden w-[250px] shrink-0 flex-col border-r border-slate-900/30 bg-[#0e2f4f] text-slate-200 lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <p className="text-xl font-semibold text-white">CCF</p>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/10"
            aria-label="Recolher menu"
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
        </div>

        <nav className="px-2 py-4">
          <Link
            href="/dashboard"
            className="flex h-10 cursor-pointer items-center gap-2.5 rounded-md bg-[#1f476d] px-3.5 text-sm font-medium text-white"
          >
            <DashboardIcon />
            Dashboard
          </Link>

          <Link
            href="/files"
            className="mt-1.5 flex h-10 cursor-pointer items-center gap-2.5 rounded-md px-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <UploadIcon />
            Upload de XML
          </Link>

          <Link
            href="/files"
            className="mt-1.5 flex h-10 cursor-pointer items-center gap-2.5 rounded-md px-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <FilesIcon />
            Arquivos Enviados
          </Link>

            <button
              type="button"
              disabled
              className="mt-1.5 flex h-10 w-full items-center gap-2.5 rounded-md px-3.5 text-left text-sm font-medium text-slate-200/70 disabled:cursor-not-allowed"
            >
              <ResultsIcon />
              Resultados
            </button>

            <button
              type="button"
              disabled
              className="mt-1.5 flex h-10 w-full items-center gap-2.5 rounded-md px-3.5 text-left text-sm font-medium text-slate-200/70 disabled:cursor-not-allowed"
            >
              <AdminIcon />
              Administração
            </button>
        </nav>

        <div className="mt-auto border-t border-white/10 px-5 py-3.5 text-xs text-slate-300/80">CCF v1.0 - MVP</div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="mr-3.5 flex flex-1 items-center gap-2">
            <div className="relative w-full max-w-[420px]">
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
                value={recentSearch}
                onChange={(event) => {
                  setRecentSearch(event.target.value);
                  setUploadsPage(1);
                }}
                placeholder="Buscar lote recente..."
                className="h-8 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-500"
              />
            </div>

            <input
              type="date"
              value={uploadsDateFrom}
              onChange={(event) => {
                setUploadsDateFrom(event.target.value);
                setUploadsPage(1);
              }}
              aria-label="Data inicial dos lotes recentes"
              title="Data inicial"
              className="hidden h-8 w-36 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:block"
            />

            <input
              type="date"
              value={uploadsDateTo}
              onChange={(event) => {
                setUploadsDateTo(event.target.value);
                setUploadsPage(1);
              }}
              aria-label="Data final dos lotes recentes"
              title="Data final"
              className="hidden h-8 w-36 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:block"
            />
          </div>

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

            <div className="flex items-center gap-2.5">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0e2f4f] text-[11px] font-semibold text-white">
                {userDisplay.initials}
              </div>
              <div className="hidden items-center gap-1 lg:flex">
                <p className="text-xs font-medium text-slate-800">{userDisplay.name}</p>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-5">
          <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold leading-none text-slate-900">Dashboard</h1>
              <button
                type="button"
                onClick={openBatchModal}
                className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-blue-700 px-3.5 text-xs font-medium text-white transition hover:bg-blue-800"
              >
                Novo Lote
              </button>
            </div>
            <p className="mt-1.5 text-sm text-slate-600">{welcomeText}</p>

            <section className="mt-3.5 grid gap-2 xl:grid-cols-3">
              <StatCard
                title="Total Lotes Enviados"
                value={isLoading ? "..." : formatCompactNumber(stats.totalBatches)}
                subtitle={isLoading ? "Carregando" : `+${stats.uploadsToday} hoje`}
                icon={<FilesIcon />}
              />
              <StatCard
                title="Lotes Processados"
                value={isLoading ? "..." : formatCompactNumber(stats.processedBatches)}
                subtitle={isLoading ? "Carregando" : `${stats.processedRate.toFixed(1)}%`}
                icon={<ResultsIcon />}
              />
              <StatCard
                title="Lotes com Erro"
                value={isLoading ? "..." : formatCompactNumber(stats.failedBatches)}
                subtitle={isLoading ? "Carregando" : `${stats.errorsRate.toFixed(1)}%`}
                icon={<AdminIcon />}
              />
            </section>

            <section className="mt-3.5 flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
              <header className="px-4 py-3">
                <h2 className="text-lg font-semibold text-slate-900">Lotes Recentes</h2>
              </header>

              {errorMessage ? (
                <div className="border-t border-slate-200 px-5 py-3 text-xs text-rose-700">{errorMessage}</div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Lote</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Data</th>
                          <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadsLoading ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-xs text-slate-500">
                              Carregando lotes recentes...
                            </td>
                          </tr>
                        ) : null}

                        {!uploadsLoading && recentBatches.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-xs text-slate-500">
                              {activeSearch
                                ? "Nenhum lote corresponde à busca informada."
                                : "Nenhum lote recente encontrado."}
                            </td>
                          </tr>
                        ) : null}

                        {!uploadsLoading
                          ? recentBatches.map((batch) => (
                              <tr key={batch.id} className="border-b border-slate-200 last:border-b-0">
                                <td className="px-4 py-2.5 text-xs font-medium text-slate-900">
                                  <button
                                    type="button"
                                    onClick={() => router.push(`/batches/${batch.id}`)}
                                    className="cursor-pointer text-left transition hover:text-blue-700 hover:underline"
                                  >
                                    {getBatchDisplayName(batch)}
                                  </button>
                                </td>
                              <td className="px-4 py-2.5 text-xs text-slate-600">{formatAbsoluteDate(batch.createdAt)}</td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getDashboardStatusClass(batch.status)}`}
                                >
                                  {getDashboardStatusLabel(batch.status)}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => router.push(`/batches/${batch.id}`)}
                                  className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  Ver lote
                                </button>
                              </td>
                            </tr>
                          ))
                        : null}
                      </tbody>
                    </table>
                  </div>

                  <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Mostrando {recentBatches.length > 0 ? (uploadsPage - 1) * DASHBOARD_UPLOADS_PAGE_SIZE + 1 : 0} a{" "}
                      {(uploadsPage - 1) * DASHBOARD_UPLOADS_PAGE_SIZE + recentBatches.length} de {uploadsTotal}
                    </p>

                    <div className="grid w-full grid-cols-[1fr_auto_1fr] gap-2 sm:flex sm:w-auto sm:gap-1">
                      <button
                        type="button"
                        onClick={() => setUploadsPage((previous) => Math.max(1, previous - 1))}
                        disabled={uploadsLoading || uploadsPage <= 1}
                        className="inline-flex h-7 w-full cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        Anterior
                      </button>

                      <div className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-1">
                        {uploadsPage > 1 ? (
                          <button
                            type="button"
                            onClick={() => setUploadsPage((previous) => Math.max(1, previous - 1))}
                            className="inline-flex h-5 min-w-5 cursor-pointer items-center justify-center rounded border border-slate-200 px-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                          >
                            {uploadsPage - 1}
                          </button>
                        ) : null}

                        <span className="inline-flex h-5 min-w-5 cursor-default items-center justify-center rounded border border-blue-700 bg-blue-700 px-1.5 text-xs font-semibold text-white">
                          {uploadsPage}
                        </span>

                        {uploadsPage < uploadsTotalPages ? (
                          <button
                            type="button"
                            onClick={() =>
                              setUploadsPage((previous) => Math.min(uploadsTotalPages, previous + 1))
                            }
                            className="inline-flex h-5 min-w-5 cursor-pointer items-center justify-center rounded border border-slate-200 px-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                          >
                            {uploadsPage + 1}
                          </button>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setUploadsPage((previous) => Math.min(uploadsTotalPages, previous + 1))
                        }
                        disabled={uploadsLoading || uploadsPage >= uploadsTotalPages}
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

      <NewBatchModal
        isOpen={isBatchModalOpen}
        batchName={batchName}
        selectedFiles={selectedFiles}
        isSubmitting={isBatchSubmitting}
        errorMessage={batchErrorMessage}
        successMessage={batchSuccessMessage}
        onClose={closeBatchModal}
        onConfirm={() => {
          void confirmBatchUpload();
        }}
        onChangeBatchName={updateBatchName}
        onSelectFiles={selectFiles}
        onRemoveFile={removeFileAt}
      />
    </>
  );
}
