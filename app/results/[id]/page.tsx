"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAccessToken } from "../../lib/auth";
import { UserMenu } from "../../components/UserMenu";
import { useAuthenticatedUser } from "../../hooks/useAuthenticatedUser";
import {
  getFileAnalysisById,
  type FileAnalysisDivergence,
  type FileAnalysisNote,
  type FileAnalysisResponse,
} from "../../services/files.service";
import {
  getFileStatusBadgeClass,
  getFileStatusLabel,
} from "../../files/utils/fileStatus";

type DivergenceRow = {
  id: string;
  item: string;
  type: string;
  description: string;
  severity: string;
};

type FiscalNoteRow = {
  id: string;
  title: string;
  description: string;
};

function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function formatAbsoluteDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
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
    .format(target)
    .replace(",", "");
}

function formatFileSize(size?: number): string {
  if (!size || Number.isNaN(size)) {
    return "-";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");

  if (digits.length !== 14) {
    return cnpj;
  }

  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function buildFallbackFileName(fileId: string): string {
  if (!fileId) {
    return "NFe_arquivo.xml";
  }

  const sanitizedId = fileId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  return `NFe_${sanitizedId || "arquivo"}.xml`;
}

function toNumber(value?: number | string | null): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(",", "."));
    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return 0;
}

function buildDocumentLabel(document?: FileAnalysisResponse["document"]): string {
  if (!document) {
    return "-";
  }

  const model = document.model ? `Modelo ${document.model}` : "";
  const number = document.number ? `Nº ${document.number}` : "";
  const series = document.series ? `Série ${document.series}` : "";
  const text = [model, number, series].filter(Boolean).join(" • ");

  return text || "-";
}

function normalizeSeverityLabel(value?: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    return "Atenção";
  }

  if (normalized.toUpperCase().includes("CRIT")) {
    return "Crítico";
  }

  if (normalized.toUpperCase().includes("WARN")) {
    return "Atenção";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function getSeverityClass(value: string): string {
  const normalized = value.toUpperCase();

  if (normalized.includes("CRIT")) {
    return "bg-rose-100 text-rose-700 ring-rose-200";
  }

  return "bg-amber-100 text-amber-700 ring-amber-200";
}

function mapDivergences(values?: FileAnalysisDivergence[]): DivergenceRow[] {
  if (!values?.length) {
    return [];
  }

  return values.map((item, index) => ({
    id: `${item.code ?? "DIV"}-${index}`,
    item:
      item.itemNumbers && item.itemNumbers.length > 0
        ? item.itemNumbers.map((value) => `Item ${value}`).join(", ")
        : "-",
    type: item.title || item.code || "-",
    description: item.description || "Sem descrição informada.",
    severity: normalizeSeverityLabel(item.severity),
  }));
}

function mapFiscalNotes(values?: FileAnalysisNote[]): FiscalNoteRow[] {
  if (!values?.length) {
    return [];
  }

  return values.map((item, index) => {
    return {
      id: String(index),
      title: `Observação ${index + 1}`,
      description: item || "Sem observações adicionais.",
    };
  });
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

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5">
      <span className="text-slate-500">{icon}</span>
      <h2 className="text-base font-semibold text-slate-900">{children}</h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-slate-200 px-4 py-2.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default function AnalysisResultPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isHydrated = useIsHydrated();
  const token = isHydrated ? getAccessToken() : null;
  const { userDisplay } = useAuthenticatedUser(token);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisData, setAnalysisData] = useState<FileAnalysisResponse | null>(null);

  const fileId = useMemo(() => {
    const raw = params?.id;
    if (!raw) {
      return "";
    }

    return Array.isArray(raw) ? (raw[0] ?? "") : raw;
  }, [params]);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/");
    }
  }, [isHydrated, token, router]);

  useEffect(() => {
    if (!isHydrated || !token || !fileId) {
      setAnalysisLoading(false);
      return;
    }

    let isActive = true;

    async function loadAnalysis() {
      setAnalysisLoading(true);
      setAnalysisError("");

      try {
        const data = await getFileAnalysisById(fileId);

        if (!isActive) {
          return;
        }

        setAnalysisData(data);
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

        setAnalysisError(
          "Não foi possível carregar a análise. Alguns campos podem aparecer com valores padrão.",
        );
      } finally {
        if (isActive) {
          setAnalysisLoading(false);
        }
      }
    }

    void loadAnalysis();

    return () => {
      isActive = false;
    };
  }, [fileId, isHydrated, router, token]);

  const divergenceRows = useMemo(() => {
    return mapDivergences(analysisData?.divergences);
  }, [analysisData?.divergences]);

  const fiscalNoteRows = useMemo(() => {
    return mapFiscalNotes(analysisData?.fiscalNotes);
  }, [analysisData?.fiscalNotes]);

  const fileName = analysisData?.file?.originalName ?? buildFallbackFileName(fileId);
  const uploadDate = analysisLoading
    ? "Carregando..."
    : formatAbsoluteDate(analysisData?.file?.createdAt ?? analysisData?.document?.issuedAt ?? undefined);
  const fileSize = analysisLoading ? "Carregando..." : formatFileSize(analysisData?.file?.size);
  const status = analysisData?.file?.status ?? "RECEIVED";
  const documentLabel = buildDocumentLabel(analysisData?.document);
  const companyLegalName = analysisData?.company?.corporateName || analysisData?.company?.tradeName || "-";
  const companyCnpj = analysisData?.company?.cnpj || "-";
  const companyIe = analysisData?.company?.ie || "-";
  const companyUf = analysisData?.company?.uf || "-";
  const totalItems =
    toNumber(analysisData?.analysisSummary?.totalItems) ||
    analysisData?.document?.items?.length ||
    0;
  const divergencesCount =
    toNumber(analysisData?.analysisSummary?.totalDivergences) || divergenceRows.length;
  const errorsCount = toNumber(analysisData?.analysisSummary?.totalWarnings);
  const compliantItems = Math.max(totalItems - divergencesCount - errorsCount, 0);

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
    <main className="flex h-dvh overflow-hidden bg-[#f2f4f7]">
      <aside className="hidden w-[250px] shrink-0 flex-col border-r border-slate-900/30 bg-[#0e2f4f] text-slate-200 lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <p className="text-xl font-semibold text-white">CCF</p>
          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-300 transition hover:bg-white/10"
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
            <UploadIcon />
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
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="relative mr-3.5 flex-1 max-w-[420px]">
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
              placeholder="Buscar arquivos, análises..."
              className="h-8 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100"
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
          <div className="mx-auto w-full max-w-[1400px] space-y-3">
            <div className="flex items-start gap-2">
              <Link
                href="/dashboard"
                className="mt-0.5 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-200"
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
              </Link>
              <div>
                <h1 className="text-2xl font-semibold leading-none text-slate-900">Resultado da Análise</h1>
                <p className="mt-1 text-sm text-slate-500">{fileName}</p>
              </div>
            </div>

            {analysisError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {analysisError}
              </div>
            ) : null}

            {analysisLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                Carregando dados da análise...
              </div>
            ) : null}

            <section className="grid gap-3 lg:grid-cols-2">
              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <SectionTitle
                  icon={
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
                      <path d="M16 13H8" />
                    </svg>
                  }
                >
                  Informações do Arquivo
                </SectionTitle>

                <InfoRow label="Arquivo" value={fileName} />
                <InfoRow label="Data de Upload" value={uploadDate} />
                <InfoRow label="Tamanho" value={fileSize} />
                <InfoRow label="Documento" value={documentLabel} />
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getFileStatusBadgeClass(status)}`}
                    >
                      {getFileStatusLabel(status)}
                    </span>
                  }
                />
              </article>

              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <SectionTitle
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M7 8h10" />
                      <path d="M7 12h10" />
                      <path d="M7 16h4" />
                    </svg>
                  }
                >
                  Informações da Empresa
                </SectionTitle>

                <InfoRow label="Razão Social" value={companyLegalName} />
                <InfoRow label="CNPJ" value={companyCnpj === "-" ? "-" : formatCnpj(companyCnpj)} />
                <InfoRow label="IE" value={companyIe} />
                <InfoRow label="UF" value={companyUf} />
              </article>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <SectionTitle
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                }
              >
                Resumo da Análise
              </SectionTitle>

              <div className="grid gap-2 px-4 pb-3.5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg bg-slate-100 px-3 py-2.5">
                  <p className="text-xs text-slate-500">Total de Itens</p>
                  <p className="mt-1 text-2xl font-semibold leading-none text-slate-900">
                    {totalItems}
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-50 px-3 py-2.5">
                  <p className="text-xs text-slate-500">Conformes</p>
                  <p className="mt-1 text-2xl font-semibold leading-none text-emerald-600">
                    {compliantItems}
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 px-3 py-2.5">
                  <p className="text-xs text-slate-500">Divergências</p>
                  <p className="mt-1 text-2xl font-semibold leading-none text-amber-600">
                    {divergencesCount}
                  </p>
                </div>

                <div className="rounded-lg bg-rose-50 px-3 py-2.5">
                  <p className="text-xs text-slate-500">Erros</p>
                  <p className="mt-1 text-2xl font-semibold leading-none text-rose-600">
                    {errorsCount}
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <SectionTitle
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                }
              >
                Divergências Detectadas
              </SectionTitle>

              <div className="overflow-x-auto border-t border-slate-200">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Item</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Tipo</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Descrição</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500">Severidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divergenceRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-xs text-slate-500">
                          Nenhuma divergência detectada para este arquivo.
                        </td>
                      </tr>
                    ) : null}

                    {divergenceRows.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 last:border-b-0">
                        <td className="px-4 py-2.5 text-xs font-medium text-slate-900">{item.item}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{item.type}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-700">{item.description}</td>
                        <td className="px-4 py-2.5 text-xs">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 font-medium ring-1 ring-inset ${getSeverityClass(item.severity)}`}
                          >
                            {item.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <SectionTitle
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4Z" />
                  </svg>
                }
              >
                Observações Fiscais
              </SectionTitle>

              <div className="space-y-2 border-t border-slate-200 px-4 py-2.5">
                {fiscalNoteRows.length === 0 ? (
                  <article className="rounded-lg bg-slate-100 px-3 py-2.5">
                    <h3 className="text-sm font-semibold text-slate-900">Sem observações fiscais</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Não foram retornadas observações fiscais para este arquivo.
                    </p>
                  </article>
                ) : null}

                {fiscalNoteRows.map((note) => (
                  <article key={note.id} className="rounded-lg bg-slate-100 px-3 py-2.5">
                    <h3 className="text-sm font-semibold text-slate-900">{note.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{note.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
