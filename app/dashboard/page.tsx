"use client";

import axios from "axios";
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessToken } from "../lib/auth";
import { AppSidebar } from "../components/AppSidebar";
import { UserMenu } from "../components/UserMenu";
import { useBatchUpload } from "../hooks/useBatchUpload";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import {
  DEMO_BATCH_ID,
  isDemoBatchId,
  mergeDemoBatchIntoFirstPage,
  shouldShowDemoBatch,
} from "../lib/demoBatchAnalysis";
import { BatchRecord, deleteBatch, listBatches } from "../services/batches.service";
import { DeleteBatchModal } from "./components/DeleteBatchModal";
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
    return "border border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized.includes("FAILED") || normalized.includes("ERROR") || normalized.includes("FAIL")) {
    return "border border-rose-200 bg-rose-50 text-rose-700";
  }

  if (normalized.includes("PROCESSING")) {
    return "border border-slate-200 bg-slate-50 text-slate-700";
  }

  if (normalized.includes("COMPLETED") || normalized.includes("PROCESSED")) {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border border-blue-200 bg-blue-50 text-blue-700";
}

function getDashboardStatusDotClass(status: string): string {
  const normalized = normalizeStatus(status);

  if (normalized.includes("COMPLETED_WITH_ERRORS")) {
    return "bg-amber-500";
  }

  if (normalized.includes("FAILED") || normalized.includes("ERROR") || normalized.includes("FAIL")) {
    return "bg-rose-500";
  }

  if (normalized.includes("PROCESSING")) {
    return "bg-slate-500";
  }

  if (normalized.includes("COMPLETED") || normalized.includes("PROCESSED")) {
    return "bg-emerald-500";
  }

  return "bg-blue-600";
}

function formatDateParts(value: string): { date: string; time: string } {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(date)
      .replace(".", ""),
    time: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
  };
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

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BellIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </svg>
  );
}

function AlertIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function FileBoxIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function TrendSparkline() {
  return (
    <svg
      className="h-8 w-24 text-indigo-200"
      viewBox="0 0 100 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M0 25 L20 20 L40 28 L60 15 L80 18 L100 5" />
      <path
        d="M0 25 L20 20 L40 28 L60 15 L80 18 L100 5 L100 30 L0 30 Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="none"
      />
    </svg>
  );
}

function StatCard({
  title,
  value,
  children,
  icon,
}: {
  title: string;
  value: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <article className="flex min-h-[140px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold leading-none text-slate-900">{value}</p>
        {children}
      </div>
    </article>
  );
}

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHandledNewBatchParamRef = useRef(false);
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
  const [batchToDelete, setBatchToDelete] = useState<BatchRecord | null>(null);
  const [deleteBatchError, setDeleteBatchError] = useState("");
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
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
  const shouldOpenNewBatchModal = searchParams.get("newBatch") === "1";

  function extractDeleteBatchErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return "Não foi possível excluir o lote.";
    }

    const responseData = error.response?.data;
    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData
    ) {
      const typedData = responseData as { message?: unknown };
      if (typeof typedData.message === "string" && typedData.message.trim()) {
        return typedData.message;
      }

      if (Array.isArray(typedData.message)) {
        const firstMessage = typedData.message.find((message) => typeof message === "string");
        if (typeof firstMessage === "string" && firstMessage.trim()) {
          return firstMessage;
        }
      }
    }

    return "Não foi possível excluir o lote.";
  }

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/");
    }
  }, [isHydrated, token, router, refreshTrigger]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!shouldOpenNewBatchModal) {
      hasHandledNewBatchParamRef.current = false;
      return;
    }

    if (hasHandledNewBatchParamRef.current) {
      return;
    }

    hasHandledNewBatchParamRef.current = true;
    openBatchModal();
    router.replace("/dashboard", { scroll: false });
  }, [isHydrated, openBatchModal, router, shouldOpenNewBatchModal]);

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

        const statsBatches = mergeDemoBatchIntoFirstPage({
          batches: response.data,
          page: 1,
          pageSize: DASHBOARD_STATS_PAGE_SIZE,
        });
        const hasDemoBatchFromApi = response.data.some((batch) => batch.id === DEMO_BATCH_ID);
        const adjustedTotal = response.total + (hasDemoBatchFromApi ? 0 : 1);
        const sampleSize = Math.max(statsBatches.length, 1);
        const sampleProcessed = statsBatches.filter((batch) => {
          const normalized = normalizeStatus(batch.status);
          return normalized.includes("COMPLETED") || normalized.includes("PROCESSED");
        }).length;
        const sampleErrors = statsBatches.filter((batch) => {
          const normalized = normalizeStatus(batch.status);
          return (
            normalized.includes("FAILED") ||
            normalized.includes("ERROR") ||
            normalized.includes("FAIL") ||
            normalized.includes("COMPLETED_WITH_ERRORS")
          );
        }).length;

        const estimatedProcessed = Math.round((sampleProcessed / sampleSize) * adjustedTotal);
        const estimatedErrors = Math.round((sampleErrors / sampleSize) * adjustedTotal);

        setStats({
          totalBatches: adjustedTotal,
          processedBatches: Math.max(estimatedProcessed, sampleProcessed),
          failedBatches: Math.max(estimatedErrors, sampleErrors),
          processedRate: Math.min(100, Number(((sampleProcessed / sampleSize) * 100).toFixed(1))),
          errorsRate: Math.min(100, Number(((sampleErrors / sampleSize) * 100).toFixed(1))),
          uploadsToday: statsBatches.filter((batch) => isTodayDate(batch.createdAt)).length,
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

        const sortedRealBatches = [...response.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const sortedRecent = mergeDemoBatchIntoFirstPage({
          batches: sortedRealBatches,
          page: uploadsPage,
          pageSize: DASHBOARD_UPLOADS_PAGE_SIZE,
          search: activeSearch || undefined,
          dateFrom: uploadsDateFrom || undefined,
          dateTo: uploadsDateTo || undefined,
        });
        const hasDemoBatchFromApi = response.data.some((batch) => batch.id === DEMO_BATCH_ID);
        const demoMatchesFilters = shouldShowDemoBatch({
          search: activeSearch || undefined,
          dateFrom: uploadsDateFrom || undefined,
          dateTo: uploadsDateTo || undefined,
        });
        const adjustedTotal = response.total + (demoMatchesFilters && !hasDemoBatchFromApi ? 1 : 0);

        setRecentBatches(sortedRecent);
        setUploadsTotal(adjustedTotal);
        setUploadsTotalPages(Math.max(1, Math.ceil(adjustedTotal / DASHBOARD_UPLOADS_PAGE_SIZE)));
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

  function openDeleteBatchModal(batch: BatchRecord) {
    if (isDemoBatchId(batch.id)) {
      return;
    }

    setBatchToDelete(batch);
    setDeleteBatchError("");
  }

  function closeDeleteBatchModal() {
    if (isDeletingBatch) {
      return;
    }

    setBatchToDelete(null);
    setDeleteBatchError("");
  }

  async function handleConfirmDeleteBatch() {
    if (!batchToDelete) {
      return;
    }

    setDeleteBatchError("");
    setIsDeletingBatch(true);

    try {
      await deleteBatch(batchToDelete.id);
      setBatchToDelete(null);
      setUploadsPage(1);
      setRefreshTrigger((previous) => previous + 1);
    } catch (error) {
      setDeleteBatchError(extractDeleteBatchErrorMessage(error));
    } finally {
      setIsDeletingBatch(false);
    }
  }

  return (
    <>
      <main className="flex h-dvh overflow-hidden bg-slate-50 text-slate-900 antialiased">
        <AppSidebar activeItem="dashboard" />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 xl:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="group relative w-full max-w-lg">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  type="search"
                  value={recentSearch}
                  onChange={(event) => {
                    setRecentSearch(event.target.value);
                    setUploadsPage(1);
                  }}
                  placeholder="Pesquisar por lote, CNPJ ou status..."
                  className="w-full rounded-lg border border-transparent bg-slate-100/70 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden items-center gap-2 border-r border-slate-200 pr-4 lg:flex">
                <span className="text-xs font-medium text-slate-500">Período:</span>
                <input
                  type="date"
                  value={uploadsDateFrom}
                  onChange={(event) => {
                    setUploadsDateFrom(event.target.value);
                    setUploadsPage(1);
                  }}
                  aria-label="Data inicial dos lotes recentes"
                  className="cursor-pointer border-none bg-transparent text-sm text-slate-700 outline-none"
                />
                <span className="text-slate-300">-</span>
                <input
                  type="date"
                  value={uploadsDateTo}
                  onChange={(event) => {
                    setUploadsDateTo(event.target.value);
                    setUploadsPage(1);
                  }}
                  aria-label="Data final dos lotes recentes"
                  className="cursor-pointer border-none bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>

              <button
                type="button"
                className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label="Notificações"
              >
                <BellIcon />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
              </button>

              <button
                type="button"
                onClick={openBatchModal}
                className="hidden h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:inline-flex"
              >
                <PlusIcon />
                Criar Lote
              </button>

              <UserMenu name={userDisplay.name} initials={userDisplay.initials} />
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 sm:p-6 xl:p-8">
            <div className="mx-auto max-w-[1400px]">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
                  <p className="mt-1 text-sm text-slate-500">{welcomeText}</p>
                </div>
                <button
                  type="button"
                  onClick={openBatchModal}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:hidden sm:w-auto"
                >
                  <PlusIcon />
                  Criar Lote
                </button>
              </div>

              <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard
                  title="Lotes Enviados"
                  value={isLoading ? "..." : formatCompactNumber(stats.totalBatches)}
                  icon={
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                      +{isLoading ? "..." : stats.uploadsToday}
                    </span>
                  }
                >
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <span className="text-sm text-slate-500">+{isLoading ? "..." : stats.uploadsToday} hoje</span>
                    <TrendSparkline />
                  </div>
                </StatCard>

                <StatCard
                  title="Taxa de Processamento"
                  value={isLoading ? "..." : `${stats.processedRate.toFixed(1)}%`}
                  icon={<ChartIcon className="h-4 w-4 text-emerald-500" />}
                >
                  <div className="mt-3">
                    <div className="mb-2 flex items-end gap-2">
                      <span className="text-sm text-slate-500">sucesso</span>
                      <span className="text-xs text-slate-400">
                        {isLoading ? "Carregando" : `${formatCompactNumber(stats.processedBatches)} processados`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(100, stats.processedRate)}%` }}
                      />
                    </div>
                  </div>
                </StatCard>

                <StatCard
                  title="Lotes com Inconsistência"
                  value={isLoading ? "..." : formatCompactNumber(stats.failedBatches)}
                  icon={<AlertIcon className="h-4 w-4 text-rose-500" />}
                >
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      {isLoading ? "Carregando" : `${stats.errorsRate.toFixed(1)}% do total`}
                    </span>
                  </div>
                </StatCard>
              </section>

              <section
                id="lotes-recentes"
                className="flex min-h-[520px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <h2 className="text-base font-semibold text-slate-900">Processamentos Recentes</h2>
                </header>

                {errorMessage ? (
                  <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full min-w-[920px] whitespace-nowrap text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Identificação do Lote
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Data de Envio
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {uploadsLoading ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-sm text-slate-500">
                              Carregando processamentos recentes...
                            </td>
                          </tr>
                        ) : null}

                        {!uploadsLoading && recentBatches.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-sm text-slate-500">
                              {activeSearch
                                ? "Nenhum lote corresponde à busca informada."
                                : "Nenhum lote recente encontrado."}
                            </td>
                          </tr>
                        ) : null}

                        {!uploadsLoading
                          ? recentBatches.map((batch) => {
                              const dateParts = formatDateParts(batch.createdAt);

                              return (
                                <tr key={batch.id} className="group transition-colors hover:bg-slate-50">
                                  <td className="px-6 py-4">
                                    <button
                                      type="button"
                                      onClick={() => router.push(`/batches/${batch.id}/documents`)}
                                      className="flex cursor-pointer items-center gap-3 text-left"
                                    >
                                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                        <FileBoxIcon />
                                      </span>
                                      <span>
                                        <span className="block text-sm font-medium text-slate-900 transition group-hover:text-indigo-600">
                                          {getBatchDisplayName(batch)}
                                        </span>
                                        <span className="block text-xs text-slate-500">ID: #{batch.id.slice(0, 8)}</span>
                                      </span>
                                    </button>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-sm text-slate-700">{dateParts.date}</p>
                                    <p className="text-xs text-slate-500">{dateParts.time}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getDashboardStatusClass(
                                        batch.status,
                                      )}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${getDashboardStatusDotClass(batch.status)}`}
                                      />
                                      {getDashboardStatusLabel(batch.status)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => router.push(`/batches/${batch.id}/analysis`)}
                                        className="cursor-pointer rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                                      >
                                        Análise
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => router.push(`/batches/${batch.id}/documents`)}
                                        className="cursor-pointer rounded bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-all hover:bg-indigo-100"
                                      >
                                        Documentos
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openDeleteBatchModal(batch)}
                                        aria-label="Excluir lote"
                                        className="ml-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                      >
                                        <TrashIcon />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          : null}
                      </tbody>
                    </table>
                  </div>

                  <footer className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      Mostrando{" "}
                      <span className="font-medium text-slate-900">
                        {recentBatches.length > 0 ? (uploadsPage - 1) * DASHBOARD_UPLOADS_PAGE_SIZE + 1 : 0}
                      </span>{" "}
                      a{" "}
                      <span className="font-medium text-slate-900">
                        {(uploadsPage - 1) * DASHBOARD_UPLOADS_PAGE_SIZE + recentBatches.length}
                      </span>{" "}
                      de <span className="font-medium text-slate-900">{uploadsTotal}</span> lotes
                    </p>

                    <div className="grid w-full grid-cols-[1fr_auto_1fr] gap-2 sm:flex sm:w-auto sm:gap-1">
                      <button
                        type="button"
                        onClick={() => setUploadsPage((previous) => Math.max(1, previous - 1))}
                        disabled={uploadsLoading || uploadsPage <= 1}
                        className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        Anterior
                      </button>

                      <div className="inline-flex h-9 items-center gap-1">
                        {uploadsPage > 1 ? (
                          <button
                            type="button"
                            onClick={() => setUploadsPage((previous) => Math.max(1, previous - 1))}
                            className="inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            {uploadsPage - 1}
                          </button>
                        ) : null}

                        <span className="inline-flex h-9 min-w-9 cursor-default items-center justify-center rounded bg-indigo-600 px-3 text-sm font-medium text-white">
                          {uploadsPage}
                        </span>

                        {uploadsPage < uploadsTotalPages ? (
                          <button
                            type="button"
                            onClick={() =>
                              setUploadsPage((previous) => Math.min(uploadsTotalPages, previous + 1))
                            }
                            className="inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
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
                        className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        Próximo
                      </button>
                    </div>
                  </footer>
                </div>
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

      <DeleteBatchModal
        isOpen={!!batchToDelete}
        batchName={batchToDelete ? getBatchDisplayName(batchToDelete) : ""}
        isSubmitting={isDeletingBatch}
        errorMessage={deleteBatchError}
        onClose={closeDeleteBatchModal}
        onConfirm={() => {
          void handleConfirmDeleteBatch();
        }}
      />
    </>
  );
}

function DashboardFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
      <p className="text-sm text-slate-600">Carregando dashboard...</p>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardPageContent />
    </Suspense>
  );
}
