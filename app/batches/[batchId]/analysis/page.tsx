"use client";

import axios from "axios";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { getAccessToken } from "../../../lib/auth";
import { UserMenu } from "../../../components/UserMenu";
import { useAuthenticatedUser } from "../../../hooks/useAuthenticatedUser";
import {
  getBatchAnalysis,
  type BatchAnalysisDivergence,
  type BatchAnalysisDocument,
  type BatchAnalysisFiscalNote,
  type BatchAnalysisResponse,
} from "../../../services/batches.service";
import { downloadFile } from "../../../services/files.service";

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

function formatDateOnly(value: string | null | undefined): string {
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
  }).format(date);
}

function formatAnalyzedPeriod(period: BatchAnalysisResponse["period"]): string {
  if (!period || typeof period !== "object") {
    return "-";
  }

  const start = formatDateOnly(period.startIssuedAt);
  const end = formatDateOnly(period.endIssuedAt);

  if (start === "-" && end === "-") {
    return "-";
  }

  if (start !== "-" && end !== "-") {
    return start === end ? start : `${start} até ${end}`;
  }

  return start !== "-" ? start : end;
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

function PlusIcon() {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
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

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <article className={`rounded-lg px-3 py-2.5 ${className ?? "bg-slate-100"}`}>
      <p className="text-xs text-slate-600">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

function normalizeDocuments(value: BatchAnalysisDocument[] | null | undefined): BatchAnalysisDocument[] {
  return Array.isArray(value) ? value : [];
}

function normalizeDivergences(value: BatchAnalysisDivergence[] | null | undefined): BatchAnalysisDivergence[] {
  return Array.isArray(value) ? value : [];
}

type NormalizedFiscalNote = {
  note: string;
  documentsCount: number | null;
  occurrences: number | null;
  sampleDocumentIds: string[];
};

type DocumentsTableVariant = "divergences" | "errors";

function resolveDocumentId(document: BatchAnalysisDocument): string | null {
  const candidate = typeof document.fileId === "string" ? document.fileId : document.id;
  const normalized = candidate?.trim();
  return normalized ? normalized : null;
}

function formatInteger(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${value}`;
}

function normalizeFiscalNotes(value: BatchAnalysisResponse["fiscalNotes"]): NormalizedFiscalNote[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<NormalizedFiscalNote[]>((accumulator, rawNote) => {
    if (typeof rawNote === "string") {
      const normalized = rawNote.trim();

      if (normalized) {
        accumulator.push({
          note: normalized,
          documentsCount: null,
          occurrences: null,
          sampleDocumentIds: [],
        });
      }

      return accumulator;
    }

    if (!rawNote || typeof rawNote !== "object") {
      return accumulator;
    }

    const typedNote = rawNote as BatchAnalysisFiscalNote;
    const normalizedNote = typeof typedNote.note === "string" ? typedNote.note.trim() : "";

    if (!normalizedNote) {
      return accumulator;
    }

    accumulator.push({
      note: normalizedNote,
      documentsCount:
        typeof typedNote.documentsCount === "number" && Number.isFinite(typedNote.documentsCount)
          ? typedNote.documentsCount
          : null,
      occurrences:
        typeof typedNote.occurrences === "number" && Number.isFinite(typedNote.occurrences)
          ? typedNote.occurrences
          : null,
      sampleDocumentIds: Array.isArray(typedNote.sampleDocumentIds)
        ? typedNote.sampleDocumentIds.filter((value): value is string => typeof value === "string")
        : [],
    });

    return accumulator;
  }, []);
}

function resolveSummaryNumber(
  summary: BatchAnalysisResponse["summary"],
  keys: string[],
  fallback: number,
): number {
  if (!summary || typeof summary !== "object") {
    return fallback;
  }

  const typedSummary = summary as Record<string, unknown>;

  for (const key of keys) {
    const value = typedSummary[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return fallback;
}

function getDivergenceSeverityClass(severity: string): string {
  const normalized = severity.trim().toUpperCase();

  if (normalized.includes("CRIT")) {
    return "bg-rose-100 text-rose-700 ring-rose-200";
  }

  if (normalized.includes("WARN") || normalized.includes("ATTEN")) {
    return "bg-amber-100 text-amber-700 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function getDivergenceSeverityLabel(severity: string): string {
  const normalized = severity.trim().toUpperCase();

  if (normalized.includes("CRIT")) {
    return "Crítico";
  }

  if (normalized.includes("ERROR")) {
    return "Erro";
  }

  if (normalized.includes("WARN") || normalized.includes("ATTEN")) {
    return "Atenção";
  }

  if (normalized.includes("INFO")) {
    return "Informativo";
  }

  const fallback = severity.trim();
  return fallback || "Atenção";
}

function DocumentsTable({
  variant,
  title,
  documents,
  emptyMessage,
  onOpenAnalysis,
  onDownload,
  isDownloading,
}: {
  variant: DocumentsTableVariant;
  title: string;
  documents: BatchAnalysisDocument[];
  emptyMessage: string;
  onOpenAnalysis: (document: BatchAnalysisDocument) => void;
  onDownload: (document: BatchAnalysisDocument, actionKey: string) => void;
  isDownloading: (actionKey: string) => boolean;
}) {
  return (
    <section className="mt-3.5 rounded-xl border border-slate-200 bg-white overflow-hidden">
      <header className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Arquivo</th>
              {variant === "divergences" ? (
                <>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Divergências</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Itens</th>
                </>
              ) : (
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Erro</th>
              )}
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={variant === "divergences" ? 4 : 3} className="px-4 py-3 text-xs text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              documents.map((document, index) => {
                const documentId = resolveDocumentId(document);
                const fallbackName = `Documento ${index + 1}`;
                const name = document.originalName?.trim() || fallbackName;
                const actionKey = `${variant}:${documentId ?? `row-${index}`}`;
                const downloading = isDownloading(actionKey);

                return (
                  <tr key={actionKey} className="border-b border-slate-200 last:border-b-0">
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-900">{name}</td>
                    {variant === "divergences" ? (
                      <>
                        <td className="px-4 py-2.5 text-xs text-slate-600">{formatInteger(document.divergencesCount)}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-600">{formatInteger(document.items)}</td>
                      </>
                    ) : (
                      <td className="px-4 py-2.5 text-xs text-slate-600">{document.error?.trim() || "-"}</td>
                    )}
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenAnalysis(document)}
                          disabled={!documentId}
                          className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Ver análise
                        </button>
                        <button
                          type="button"
                          onClick={() => onDownload(document, actionKey)}
                          disabled={!documentId || downloading}
                          className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md bg-blue-700 px-2.5 text-xs font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {downloading ? "Baixando..." : "Download"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function BatchAnalysisPage() {
  const router = useRouter();
  const params = useParams<{ batchId: string }>();
  const rawBatchId = params?.batchId;
  const batchId = Array.isArray(rawBatchId) ? rawBatchId[0] : rawBatchId;

  const isHydrated = useIsHydrated();
  const token = isHydrated ? getAccessToken() : null;
  const { userDisplay } = useAuthenticatedUser(token);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysis, setAnalysis] = useState<BatchAnalysisResponse | null>(null);
  const [downloadingActionKeys, setDownloadingActionKeys] = useState<string[]>([]);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/");
    }
  }, [isHydrated, token, router]);

  useEffect(() => {
    if (!isHydrated || !token || !batchId) {
      return;
    }

    let isActive = true;

    async function loadBatchAnalysis() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getBatchAnalysis(batchId);

        if (!isActive) {
          return;
        }

        setAnalysis(response);
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
            setErrorMessage("Análise do lote não encontrada.");
            return;
          }
        }

        setErrorMessage("Não foi possível carregar a análise do lote.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadBatchAnalysis();

    return () => {
      isActive = false;
    };
  }, [batchId, isHydrated, router, token]);

  const batch = analysis?.batch ?? null;

  const divergences = useMemo(() => normalizeDivergences(analysis?.divergences), [analysis?.divergences]);
  const fiscalNotes = useMemo(() => normalizeFiscalNotes(analysis?.fiscalNotes), [analysis?.fiscalNotes]);
  const documentsWithDivergences = useMemo(
    () => normalizeDocuments(analysis?.documents?.withDivergences),
    [analysis?.documents?.withDivergences],
  );
  const documentsWithErrors = useMemo(
    () => normalizeDocuments(analysis?.documents?.withErrors),
    [analysis?.documents?.withErrors],
  );

  const totalDocuments = resolveSummaryNumber(
    analysis?.summary,
    ["totalDocuments", "totalFiles", "total"],
    Math.max(documentsWithDivergences.length, documentsWithErrors.length),
  );
  const processedDocuments = resolveSummaryNumber(
    analysis?.summary,
    ["totalProcessed", "processedDocuments", "processed"],
    0,
  );
  const summaryWithDivergences = resolveSummaryNumber(
    analysis?.summary,
    ["totalWithDivergences", "documentsWithDivergences", "withDivergences"],
    documentsWithDivergences.length,
  );
  const summaryWithErrors = resolveSummaryNumber(
    analysis?.summary,
    ["totalWithErrors", "documentsWithErrors", "withErrors"],
    documentsWithErrors.length,
  );
  const divergenceTypesCount = resolveSummaryNumber(
    analysis?.summary,
    ["totalDivergenceTypes", "totalDivergences", "divergenceTypes", "divergenceCount"],
    divergences.length,
  );
  const analyzedPeriodText = useMemo(() => formatAnalyzedPeriod(analysis?.period), [analysis?.period]);

  const subtitleText = useMemo(() => {
    if (!batch) {
      return "Carregando informações da análise do lote...";
    }

    return `Resumo analítico do lote: ${batch.name}`;
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

  async function handleDownload(batchDocument: BatchAnalysisDocument, actionKey: string) {
    const fileId = resolveDocumentId(batchDocument);

    if (!fileId) {
      return;
    }

    setDownloadingActionKeys((previous) => (previous.includes(actionKey) ? previous : [...previous, actionKey]));

    try {
      const { blob, fileName } = await downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName ?? batchDocument.originalName ?? "documento.xml";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingActionKeys((previous) => previous.filter((key) => key !== actionKey));
    }
  }

  function handleOpenAnalysis(document: BatchAnalysisDocument) {
    const fileId = resolveDocumentId(document);

    if (!fileId) {
      return;
    }

    router.push(`/results/${fileId}`);
  }

  function isActionDownloading(actionKey: string): boolean {
    return downloadingActionKeys.includes(actionKey);
  }

  return (
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
            className="flex h-10 cursor-pointer items-center gap-2.5 rounded-md px-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <DashboardIcon />
            Dashboard
          </Link>

          <Link
            href="/dashboard?newBatch=1"
            className="mt-1.5 flex h-10 cursor-pointer items-center gap-2.5 rounded-md px-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <PlusIcon />
            Novo Lote
          </Link>

          <Link
            href="/dashboard#lotes-recentes"
            className="mt-1.5 flex h-10 cursor-pointer items-center gap-2.5 rounded-md bg-[#1f476d] px-3.5 text-sm font-medium text-white"
          >
            <FilesIcon />
            Lotes
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/10 px-5 py-3.5 text-xs text-slate-300/80">CCF v1.0 - MVP</div>
      </aside>

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
                  <h1 className="text-xl font-semibold leading-none text-slate-900">Análise do Lote</h1>
                  <p className="mt-1.5 text-sm text-slate-600">{subtitleText}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (batchId) {
                    router.push(`/batches/${batchId}/documents`);
                  }
                }}
                className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Ver documentos
              </button>
            </div>

            {errorMessage ? (
              <div className="mt-3.5 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <section className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
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
              <BatchInfoCard label="Período analisado" value={analyzedPeriodText} />
              <BatchInfoCard label="Total de Documentos" value={totalDocuments} />
            </section>

            <section className="mt-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
              <h2 className="text-sm font-semibold text-slate-900">Resumo da Análise</h2>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <SummaryCard label="Total de Documentos" value={totalDocuments} className="bg-slate-100" />
                <SummaryCard label="Concluídos" value={processedDocuments} className="bg-emerald-50" />
                <SummaryCard label="Com Divergências" value={summaryWithDivergences} className="bg-amber-50" />
                <SummaryCard label="Com Erros" value={summaryWithErrors} className="bg-rose-50" />
                <SummaryCard label="Tipos de Divergência" value={divergenceTypesCount} className="bg-slate-100" />
              </div>
            </section>

            <section className="mt-3.5 rounded-xl border border-slate-200 bg-white overflow-hidden">
              <header className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Divergências Detectadas</h2>
              </header>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Código</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Título</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Descrição</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Severidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-xs text-slate-500">
                          Carregando divergências do lote...
                        </td>
                      </tr>
                    ) : divergences.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-xs text-slate-500">
                          Nenhuma divergência detectada para este lote.
                        </td>
                      </tr>
                    ) : (
                      divergences.map((divergence, index) => {
                        const severity = divergence.severity?.trim() || "WARNING";
                        const severityLabel = getDivergenceSeverityLabel(severity);
                        return (
                          <tr
                            key={`${divergence.code ?? "DIV"}-${index}`}
                            className="border-b border-slate-200 last:border-b-0"
                          >
                            <td className="px-4 py-2.5 text-xs font-medium text-slate-900">
                              {divergence.code || "-"}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-slate-700">
                              {divergence.title || "Sem título"}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-slate-600">
                              {divergence.description || "Sem descrição informada."}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getDivergenceSeverityClass(severity)}`}
                              >
                                {severityLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <DocumentsTable
              variant="divergences"
              title="Documentos com Divergências"
              documents={documentsWithDivergences}
              emptyMessage="Nenhum documento com divergência nesta análise."
              onOpenAnalysis={handleOpenAnalysis}
              onDownload={handleDownload}
              isDownloading={isActionDownloading}
            />

            <DocumentsTable
              variant="errors"
              title="Documentos com Erros"
              documents={documentsWithErrors}
              emptyMessage="Nenhum documento com erro nesta análise."
              onOpenAnalysis={handleOpenAnalysis}
              onDownload={handleDownload}
              isDownloading={isActionDownloading}
            />

            <section className="mt-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
              <h2 className="text-sm font-semibold text-slate-900">Observações Fiscais</h2>

              {isLoading ? (
                <p className="mt-2 text-xs text-slate-500">Carregando observações fiscais...</p>
              ) : fiscalNotes.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">Nenhuma observação fiscal disponível.</p>
              ) : (
                <div className="mt-2.5 space-y-2">
                  {fiscalNotes.map((note, index) => (
                    <article key={`${index}-${note.note.slice(0, 24)}`} className="rounded-lg bg-slate-100 px-3 py-2.5">
                      <p className="text-sm text-slate-700">{note.note}</p>
                      {note.documentsCount !== null || note.occurrences !== null ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {note.documentsCount !== null ? `${note.documentsCount} documento(s)` : ""}
                          {note.documentsCount !== null && note.occurrences !== null ? " • " : ""}
                          {note.occurrences !== null ? `${note.occurrences} ocorrência(s)` : ""}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
