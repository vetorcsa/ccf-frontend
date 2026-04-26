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
import {
  buildDemoXmlBlob,
  DEMO_BATCH_ANALYSIS,
  isDemoBatchId,
} from "../../../lib/demoBatchAnalysis";
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

function BatchInfoCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <article>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${className ?? "border-slate-200 bg-white"}`}>
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-2xl font-bold leading-tight ${valueClassName ?? "text-slate-900"}`}>{value}</p>
    </article>
  );
}

function SearchIcon() {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
      aria-hidden
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function BackIcon() {
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
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
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
    return "border border-rose-200 bg-rose-50 text-rose-700";
  }

  if (normalized.includes("WARN") || normalized.includes("ATTEN")) {
    return "border border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border border-slate-200 bg-slate-100 text-slate-700";
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
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full whitespace-nowrap text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Arquivo</th>
              {variant === "divergences" ? (
                <>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Divergências
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Itens</th>
                </>
              ) : (
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Erro</th>
              )}
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={variant === "divergences" ? 4 : 3} className="px-6 py-5 text-sm text-slate-500">
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
                  <tr key={actionKey} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{name}</td>
                    {variant === "divergences" ? (
                      <>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatInteger(document.divergencesCount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatInteger(document.items)}</td>
                      </>
                    ) : (
                      <td className="px-6 py-4 text-sm text-slate-600">{document.error?.trim() || "-"}</td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenAnalysis(document)}
                          disabled={!documentId}
                          className="cursor-pointer rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Ver análise
                        </button>
                        <button
                          type="button"
                          onClick={() => onDownload(document, actionKey)}
                          disabled={!documentId || downloading}
                          className="cursor-pointer rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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

      if (isDemoBatchId(batchId)) {
        setAnalysis(DEMO_BATCH_ANALYSIS);
        setIsLoading(false);
        return;
      }

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
  const principalDivergenceText = useMemo(() => {
    const firstDivergence = divergences[0];
    return firstDivergence?.title?.trim() || firstDivergence?.code?.trim() || "-";
  }, [divergences]);

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
      if (isDemoBatchId(batchId)) {
        const fileName = batchDocument.originalName ?? "documento-demo.xml";
        const url = URL.createObjectURL(buildDemoXmlBlob(fileName));
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }

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

    if (isDemoBatchId(batchId)) {
      router.push(`/batches/${batchId}/documents`);
      return;
    }

    router.push(`/results/${fileId}`);
  }

  function isActionDownloading(actionKey: string): boolean {
    return downloadingActionKeys.includes(actionKey);
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-slate-50 text-slate-900 antialiased">
      <AppSidebar activeItem="batches" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 xl:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="group relative hidden w-full max-w-lg md:block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Pesquisar por lote, CNPJ ou status..."
                className="w-full rounded-lg border border-transparent bg-slate-100/70 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 border-r border-slate-200 pr-4 xl:flex">
              <span className="text-xs font-medium text-slate-500">Período:</span>
              <input
                type="date"
                aria-label="Data inicial"
                className="cursor-pointer border-none bg-transparent text-sm text-slate-700 outline-none"
              />
              <span className="text-slate-300">-</span>
              <input
                type="date"
                aria-label="Data final"
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
              onClick={() => router.push("/dashboard?newBatch=1")}
              className="hidden h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 lg:inline-flex"
            >
              <PlusIcon />
              Criar Lote
            </button>

            <UserMenu name={userDisplay.name} initials={userDisplay.initials} />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 xl:p-8">
          <div className="mx-auto max-w-[1400px] space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50"
                  aria-label="Voltar para dashboard"
                >
                  <BackIcon />
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Análise do Lote</h1>
                  <p className="mt-1 text-sm text-slate-500">{subtitleText}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (batchId) {
                    router.push(`/batches/${batchId}/documents`);
                  }
                }}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Ver documentos
              </button>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
              <BatchInfoCard label="Lote" value={batch?.name ?? "-"} />
              <BatchInfoCard
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getBatchStatusClass(batch?.status ?? "")}`}
                  >
                    {getBatchStatusLabel(batch?.status ?? "")}
                  </span>
                }
              />
              <BatchInfoCard label="Data" value={formatAbsoluteDate(batch?.createdAt)} />
              <BatchInfoCard label="Período Analisado" value={analyzedPeriodText} />
              <BatchInfoCard label="Total de Documentos" value={totalDocuments} />
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Resumo da Análise</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <SummaryCard
                  label="Total de Documentos"
                  value={totalDocuments}
                  className="border-slate-200 bg-white"
                />
                <SummaryCard
                  label="Concluídos"
                  value={processedDocuments}
                  className="border-emerald-100 bg-emerald-50/50"
                  valueClassName="text-emerald-600"
                />
                <SummaryCard
                  label="Com Divergências"
                  value={summaryWithDivergences}
                  className="border-amber-100 bg-amber-50/50"
                  valueClassName="text-amber-600"
                />
                <SummaryCard
                  label="Com Erros"
                  value={summaryWithErrors}
                  className="border-rose-100 bg-rose-50/50"
                  valueClassName="text-rose-600"
                />
                <SummaryCard
                  label="Tipos de Divergência"
                  value={divergenceTypesCount}
                  className="border-slate-200 bg-white"
                />
                <SummaryCard
                  label="Principal Divergência"
                  value={principalDivergenceText}
                  className="border-indigo-100 bg-indigo-50/50"
                  valueClassName="text-sm font-semibold leading-5 text-indigo-700"
                />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <header className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-base font-semibold text-slate-900">Divergências Detectadas</h2>
              </header>

              <div className="overflow-x-auto">
                <table className="min-w-full whitespace-nowrap text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Código
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Título
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Documentos Afetados
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Ocorrências
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Severidade
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-5 text-sm text-slate-500">
                          Carregando divergências do lote...
                        </td>
                      </tr>
                    ) : divergences.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-5 text-sm text-slate-500">
                          Nenhuma divergência detectada para este lote.
                        </td>
                      </tr>
                    ) : (
                      divergences.map((divergence, index) => {
                        const severity = divergence.severity?.trim() || "WARNING";
                        const severityLabel = getDivergenceSeverityLabel(severity);

                        return (
                          <tr key={`${divergence.code ?? "DIV"}-${index}`} className="transition-colors hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {divergence.code || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {divergence.title || "Sem título"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {divergence.description || "Sem descrição informada."}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatInteger(divergence.documentsCount)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatInteger(divergence.occurrences ?? divergence.count)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getDivergenceSeverityClass(severity)}`}
                              >
                                {severityLabel}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (batchId) {
                                    router.push(`/batches/${batchId}/documents`);
                                  }
                                }}
                                className="cursor-pointer rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                              >
                                Ver documentos
                              </button>
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

            <section>
              <h2 className="mb-4 px-1 text-base font-semibold text-slate-900">Observações Fiscais</h2>

              {isLoading ? (
                <p className="text-sm text-slate-500">Carregando observações fiscais...</p>
              ) : fiscalNotes.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                  Nenhuma observação fiscal disponível.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {fiscalNotes.map((note, index) => (
                    <article
                      key={`${index}-${note.note.slice(0, 24)}`}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-sm font-medium text-slate-900">{note.note}</p>
                      {note.documentsCount !== null || note.occurrences !== null ? (
                        <p className="mt-2 inline-block rounded border border-slate-100 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-500">
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
