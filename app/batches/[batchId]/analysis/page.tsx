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
  getDemoBatchAnalysis,
  getDemoBatchDemonstrativeRows,
  getDemoBatchFinancials,
  isDemoBatchId,
  type DemoDemonstrativeRow,
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

function ExpandIcon() {
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
      <path d="M8 3H3v5" />
      <path d="M3 3l7 7" />
      <path d="M16 3h5v5" />
      <path d="M21 3l-7 7" />
      <path d="M8 21H3v-5" />
      <path d="M3 21l7-7" />
      <path d="M16 21h5v-5" />
      <path d="M21 21l-7-7" />
    </svg>
  );
}

function CloseIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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
type AnalysisTabKey = "overview" | "values" | "demonstrative";

const ANALYSIS_TABS: Array<{ key: AnalysisTabKey; label: string; helper: string }> = [
  {
    key: "overview",
    label: "Visão Geral",
    helper: "Resumo, divergências e documentos",
  },
  {
    key: "values",
    label: "Valores",
    helper: "Impacto financeiro da auditoria",
  },
  {
    key: "demonstrative",
    label: "Demonstrativo",
    helper: "Visão fiscal detalhada",
  },
];

const DIVERGENCE_LABELS: Record<string, string> = {
  NCM_INCOMPATIBLE: "NCM incompatível",
  MISSING_CEST: "Ausência de CEST",
  INVALID_CEST_NCM_COMBINATION: "Combinação inválida entre CEST e NCM",
  INVALID_ANNEX_ITEM: "Item de anexo incompatível",
  INVALID_CFOP_FOR_OPERATION: "CFOP incompatível com a operação",
  CFOP_ST_MISMATCH: "CFOP incompatível com substituição tributária",
  OPERATION_NATURE_MISMATCH: "Natureza da operação divergente",
  ICMS_CODE_REGIME_MISMATCH: "Código de ICMS incompatível com o regime",
  ICMS_CODE_PRODUCT_MISMATCH: "Código de ICMS incompatível com o produto",
  PIS_COFINS_MISMATCH: "Divergência de PIS/COFINS",
  PIS_COFINS_ZERO_UNEXPECTED: "PIS/COFINS zerado indevidamente",
  INTERNAL_RATE_MISMATCH: "Alíquota interna divergente",
  MISSING_BASE_REDUCTION: "Redução de base não aplicada",
  UNEXPECTED_BASE_REDUCTION: "Redução de base aplicada indevidamente",
  BASE_REDUCTION_RATE_MISMATCH: "Percentual de redução de base divergente",
  MISSING_ST_TREATMENT: "Tratamento de ST não aplicado",
  UNEXPECTED_ST_TREATMENT: "Tratamento de ST aplicado indevidamente",
  MVA_MISMATCH: "MVA divergente",
  ST_BASE_MISMATCH: "Base de cálculo de ST divergente",
  ICMS_ST_VALUE_MISMATCH: "Valor de ICMS ST divergente",
  MISSING_CREDIT_REVERSAL: "Estorno de crédito não aplicado",
  UNEXPECTED_CREDIT_REVERSAL: "Estorno de crédito aplicado indevidamente",
  MISSING_TAX_SUBSTITUTE_REGISTRATION: "Substituto tributário não identificado",
  TAX_SUBSTITUTE_OUT_OF_VALIDITY: "Substituto tributário fora da vigência",
  TAX_SUBSTITUTE_ANNEX_MISMATCH: "Substituto tributário incompatível com o anexo",
  INPUT_OUTPUT_TAX_TREATMENT_MISMATCH: "Tratamento fiscal incompatível entre entrada e saída",
  INPUT_OUTPUT_NCM_MISMATCH: "NCM divergente entre entrada e saída",
  INPUT_OUTPUT_CEST_MISMATCH: "CEST divergente entre entrada e saída",
  INPUT_OUTPUT_ICMS_CODE_MISMATCH: "Código de ICMS divergente entre entrada e saída",
  INPUT_OUTPUT_CFOP_MISMATCH: "CFOP divergente entre entrada e saída",
  INPUT_OUTPUT_RATE_MISMATCH: "Alíquota divergente entre entrada e saída",
  INPUT_OUTPUT_ST_MISMATCH: "Tratamento de ST divergente entre entrada e saída",
  OWN_OPERATION_BASE_MISMATCH: "Base da operação própria divergente",
  CREDIT_VALUE_MISMATCH: "Valor de crédito divergente",
  DEBIT_VALUE_MISMATCH: "Valor de débito divergente",
  ITEM_TOTAL_MISMATCH: "Total do item divergente",
};

function resolveDocumentId(document: BatchAnalysisDocument): string | null {
  const candidate = typeof document.fileId === "string" ? document.fileId : document.id;
  const normalized = candidate?.trim();
  return normalized ? normalized : null;
}

function normalizeDivergenceCode(code: string | null | undefined): string {
  return code?.trim().toUpperCase() ?? "";
}

function getDivergenceDisplayLabel(code: string | null | undefined, fallback?: string | null): string {
  const normalizedCode = normalizeDivergenceCode(code);
  const mappedLabel = normalizedCode ? DIVERGENCE_LABELS[normalizedCode] : null;

  if (mappedLabel) {
    return mappedLabel;
  }

  const fallbackLabel = fallback?.trim();
  if (fallbackLabel) {
    return fallbackLabel;
  }

  return code?.trim() || "Divergência";
}

function getStableCodeNumber(code: string | null | undefined): number {
  return normalizeDivergenceCode(code)
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
}

function resolveAffectedDocuments(
  divergence: BatchAnalysisDivergence | null,
  documents: BatchAnalysisDocument[],
): BatchAnalysisDocument[] {
  if (!divergence || documents.length === 0) {
    return [];
  }

  const sampleIds = Array.isArray(divergence.sampleDocumentIds)
    ? divergence.sampleDocumentIds
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  if (sampleIds.length > 0) {
    const sampleSet = new Set(sampleIds);
    const matchedDocuments = documents.filter((document) => {
      const documentId = resolveDocumentId(document);
      return documentId ? sampleSet.has(documentId) : false;
    });

    if (matchedDocuments.length > 0) {
      return matchedDocuments;
    }
  }

  const seed = getStableCodeNumber(divergence.code);
  const visibleCount = Math.max(1, Math.min(documents.length, 8));

  return Array.from({ length: visibleCount }, (_, index) => documents[(seed + index) % documents.length]);
}

function formatInteger(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${value}`;
}

function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentWithSuffix(value: number | null | undefined): string {
  const formatted = formatPercent(value);
  return formatted === "-" ? formatted : `${formatted}%`;
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

function getFinancialToneClass(tone: string): string {
  if (tone === "emerald") {
    return "border-emerald-100 bg-emerald-50/60 text-emerald-700";
  }

  if (tone === "amber") {
    return "border-amber-100 bg-amber-50/60 text-amber-700";
  }

  if (tone === "rose") {
    return "border-rose-100 bg-rose-50/60 text-rose-700";
  }

  if (tone === "indigo") {
    return "border-indigo-100 bg-indigo-50/60 text-indigo-700";
  }

  return "border-slate-200 bg-white text-slate-900";
}

function AnalysisTabs({
  activeTab,
  onChange,
}: {
  activeTab: AnalysisTabKey;
  onChange: (tab: AnalysisTabKey) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <div className="grid gap-1 sm:inline-grid sm:grid-cols-3">
        {ANALYSIS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`cursor-pointer rounded-lg px-4 py-3 text-left transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              aria-pressed={isActive}
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className={`mt-0.5 block text-xs ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                {tab.helper}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ValuesTab({ financials }: { financials: ReturnType<typeof getDemoBatchFinancials> }) {
  if (!financials) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Valores</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Não há valores financeiros consolidados disponíveis para este lote. Quando houver apuração de valores, esta
          área exibirá bases, créditos, débitos, impacto fiscal e maiores diferenças identificadas.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">Valores da Auditoria</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {financials.metrics.map((metric) => (
            <article
              key={metric.label}
              className={`rounded-xl border p-4 shadow-sm ${getFinancialToneClass(metric.tone)}`}
            >
              <p className="text-xs font-medium text-slate-500">{metric.label}</p>
              <p className="mt-2 text-xl font-bold leading-tight">{formatCurrency(metric.value)}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{metric.helper}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">Maiores Divergências por Valor</h3>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Divergência
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Detalhe
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Impacto Estimado
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Docs</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ocorrências
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Severidade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {financials.valueDivergences.map((item) => (
                <tr key={item.code} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {getDivergenceDisplayLabel(item.code, item.title)}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">{item.code}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.title}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(item.estimatedImpact)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.documentsCount}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.occurrences}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getDivergenceSeverityClass(
                        item.severity,
                      )}`}
                    >
                      {getDivergenceSeverityLabel(item.severity)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">Documentos com Maior Diferença Financeira</h3>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Arquivo</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Operação
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Diferença
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Motivo</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {financials.topDocuments.map((document) => (
                <tr key={document.fileName} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{document.fileName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{document.operation}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(document.difference)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{document.reason}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        document.status === "Crítico"
                          ? "border border-rose-200 bg-rose-50 text-rose-700"
                          : "border border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {document.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DemonstrativeTab({ rows }: { rows: DemoDemonstrativeRow[] }) {
  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Demonstrativo</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Não há demonstrativo fiscal detalhado disponível para este lote. Quando houver itens apurados, esta área
          exibirá a visão tabular de valores declarados, valores apurados e informações fiscais por documento.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Demonstrativo Fiscal</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Detalhamento consolidado das operações analisadas, com parâmetros fiscais, valores declarados, valores
          apurados e informações fiscais por documento e item.
        </p>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">Itens do Demonstrativo</h3>
        </header>

        <div className="max-h-[560px] overflow-auto">
          <table className="min-w-[1900px] whitespace-nowrap text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-200 bg-slate-50/95">
                {[
                  "Documento",
                  "Produto",
                  "NCM",
                  "CEST",
                  "CFOP",
                  "CST",
                  "Alíquota interna",
                  "MVA",
                  "Redução de base",
                  "Base op. própria",
                  "Crédito",
                  "Base op. ST",
                  "Débito",
                  "ICMS ST declarado",
                  "ICMS ST apurado",
                  "Divergência",
                  "Informações ao fisco",
                ].map((header) => (
                  <th
                    key={header}
                    className="bg-slate-50/95 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={`${row.document}-${row.product}`} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.document}</td>
                  <td className="max-w-[280px] px-4 py-3 text-sm font-medium text-slate-900">
                    <p className="truncate" title={row.product}>
                      {row.product}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.ncm}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.cest}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.cfop}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.cst}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatPercentWithSuffix(row.internalRate)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatPercentWithSuffix(row.mva)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatPercentWithSuffix(row.baseReduction)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">
                    {formatCurrency(row.ownOperationBase)}
                  </td>
                  <td className="px-4 py-3 text-sm text-emerald-700">{formatCurrency(row.credit)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{formatCurrency(row.stBase)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(row.debit)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(row.declaredSt)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {formatCurrency(row.calculatedSt)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-rose-700">
                    {formatCurrency(row.divergence)}
                  </td>
                  <td className="max-w-[360px] px-4 py-3 text-sm text-slate-600">
                    <p className="truncate" title={row.fiscalInfo}>
                      {row.fiscalInfo}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DivergencesTable({
  divergences,
  isLoading,
  onOpenAffectedDocuments,
  variant = "compact",
}: {
  divergences: BatchAnalysisDivergence[];
  isLoading: boolean;
  onOpenAffectedDocuments: (divergence: BatchAnalysisDivergence) => void;
  variant?: "compact" | "expanded";
}) {
  const isExpanded = variant === "expanded";
  const containerClassName = isExpanded ? "max-h-[calc(100dvh-220px)]" : "max-h-[360px]";
  const tableClassName = isExpanded ? "min-w-[1320px]" : "min-w-[1180px]";
  const descriptionClassName = isExpanded ? "max-w-[520px]" : "max-w-[340px]";

  return (
    <div className={`${containerClassName} overflow-auto`}>
      <table className={`${tableClassName} whitespace-nowrap text-left`}>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="w-[250px] bg-slate-50/95 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
              Divergência
            </th>
            <th className="w-[230px] bg-slate-50/95 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
              Título
            </th>
            <th className="w-[360px] bg-slate-50/95 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
              Descrição
            </th>
            <th className="w-[160px] bg-slate-50/95 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
              Documentos Afetados
            </th>
            <th className="w-[130px] bg-slate-50/95 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
              Ocorrências
            </th>
            <th className="w-[130px] bg-slate-50/95 px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
              Severidade
            </th>
            <th className="w-[150px] bg-slate-50/95 px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 backdrop-blur">
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
              const technicalCode = divergence.code?.trim();
              const divergenceLabel = getDivergenceDisplayLabel(technicalCode, divergence.title);
              const description = divergence.description || "Sem descrição informada.";

              return (
                <tr key={`${divergence.code ?? "DIV"}-${index}`} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{divergenceLabel}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{divergence.title || "Sem título"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <p className={`${descriptionClassName} truncate`} title={description}>
                      {description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatInteger(divergence.documentsCount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatInteger(divergence.occurrences ?? divergence.count)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getDivergenceSeverityClass(severity)}`}
                    >
                      {severityLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenAffectedDocuments(divergence)}
                      className="cursor-pointer rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      Ver afetados
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
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
  const isDemoAnalysis = isDemoBatchId(batchId);

  const isHydrated = useIsHydrated();
  const token = isHydrated ? getAccessToken() : null;
  const { userDisplay } = useAuthenticatedUser(token);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysis, setAnalysis] = useState<BatchAnalysisResponse | null>(null);
  const [downloadingActionKeys, setDownloadingActionKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AnalysisTabKey>("overview");
  const [isDivergencesModalOpen, setIsDivergencesModalOpen] = useState(false);
  const [selectedDivergence, setSelectedDivergence] = useState<BatchAnalysisDivergence | null>(null);

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

      if (isDemoAnalysis) {
        setAnalysis(getDemoBatchAnalysis(batchId));
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
  }, [batchId, isDemoAnalysis, isHydrated, router, token]);

  useEffect(() => {
    if (!isDivergencesModalOpen && !selectedDivergence) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedDivergence) {
          setSelectedDivergence(null);
          return;
        }

        setIsDivergencesModalOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDivergencesModalOpen, selectedDivergence]);

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
  const demoFinancials = useMemo(() => getDemoBatchFinancials(batchId), [batchId]);
  const demoDemonstrativeRows = useMemo(() => getDemoBatchDemonstrativeRows(batchId), [batchId]);

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
    return firstDivergence
      ? getDivergenceDisplayLabel(firstDivergence.code, firstDivergence.title)
      : "-";
  }, [divergences]);

  const subtitleText = useMemo(() => {
    if (!batch) {
      return "Carregando informações da análise do lote...";
    }

    return `Resumo analítico do lote: ${batch.name}`;
  }, [batch]);

  const selectedAffectedDocuments = useMemo(
    () => resolveAffectedDocuments(selectedDivergence, documentsWithDivergences),
    [documentsWithDivergences, selectedDivergence],
  );
  const selectedDivergenceLabel = selectedDivergence
    ? getDivergenceDisplayLabel(selectedDivergence.code, selectedDivergence.title)
    : "";
  const selectedDivergenceSeverity = selectedDivergence?.severity?.trim() || "WARNING";

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
      if (isDemoAnalysis) {
        const fileName = batchDocument.originalName ?? "documento.xml";
        const url = URL.createObjectURL(buildDemoXmlBlob(fileName, batchId));
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

    if (isDemoAnalysis) {
      router.push(`/batches/${batchId}/documents`);
      return;
    }

    router.push(`/results/${fileId}`);
  }

  function isActionDownloading(actionKey: string): boolean {
    return downloadingActionKeys.includes(actionKey);
  }

  function handleOpenAffectedDocuments(divergence: BatchAnalysisDivergence) {
    setSelectedDivergence(divergence);
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

            <AnalysisTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "overview" ? (
              <>
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
              <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
                <h2 className="text-base font-semibold text-slate-900">Divergências Detectadas</h2>
                <button
                  type="button"
                  onClick={() => setIsDivergencesModalOpen(true)}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                  aria-label="Expandir divergências detectadas"
                  title="Expandir tabela"
                >
                  <ExpandIcon />
                </button>
              </header>

              <DivergencesTable
                divergences={divergences}
                isLoading={isLoading}
                onOpenAffectedDocuments={handleOpenAffectedDocuments}
              />
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
              </>
            ) : activeTab === "values" ? (
              <ValuesTab financials={demoFinancials} />
            ) : (
              <DemonstrativeTab rows={demoDemonstrativeRows} />
            )}
          </div>
        </div>
      </div>

      {isDivergencesModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="divergences-modal-title"
          onClick={() => setIsDivergencesModalOpen(false)}
        >
          <section
            className="flex max-h-[calc(100dvh-24px)] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-48px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 id="divergences-modal-title" className="text-lg font-semibold text-slate-900">
                  Divergências Detectadas
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Visualização ampliada das divergências identificadas no lote.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDivergencesModalOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                aria-label="Fechar visualização ampliada"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="min-h-0 flex-1 p-4 sm:p-5">
              <DivergencesTable
                divergences={divergences}
                isLoading={isLoading}
                onOpenAffectedDocuments={handleOpenAffectedDocuments}
                variant="expanded"
              />
            </div>
          </section>
        </div>
      ) : null}

      {selectedDivergence ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="affected-documents-modal-title"
          onClick={() => setSelectedDivergence(null)}
        >
          <section
            className="flex max-h-[calc(100dvh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-48px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Documentos afetados
                </p>
                <h2 id="affected-documents-modal-title" className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedDivergenceLabel}
                </h2>
                {selectedDivergence.code ? (
                  <p className="mt-1 font-mono text-xs text-slate-400">{selectedDivergence.code}</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setSelectedDivergence(null)}
                className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                aria-label="Fechar documentos afetados"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-medium text-slate-500">Documentos afetados</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatInteger(selectedDivergence.documentsCount)}
                  </p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-medium text-slate-500">Ocorrências</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatInteger(selectedDivergence.occurrences ?? selectedDivergence.count)}
                  </p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-xs font-medium text-slate-500">Severidade</p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getDivergenceSeverityClass(
                      selectedDivergenceSeverity,
                    )}`}
                  >
                    {getDivergenceSeverityLabel(selectedDivergenceSeverity)}
                  </span>
                </article>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Lista contextual de documentos</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedAffectedDocuments.length > 0
                      ? "Exibindo documentos vinculados ou uma amostra coerente para esta divergência."
                      : "Nenhum documento específico foi informado para esta divergência."}
                  </p>
                </div>

                <div className="max-h-[360px] overflow-auto">
                  <table className="min-w-[760px] whitespace-nowrap text-left">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-slate-200 bg-slate-50/95">
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Arquivo
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Divergências
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Itens
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedAffectedDocuments.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-5 text-sm text-slate-500">
                            Não há documentos específicos disponíveis para esta divergência.
                          </td>
                        </tr>
                      ) : (
                        selectedAffectedDocuments.map((document, index) => (
                          <tr key={`${resolveDocumentId(document) ?? "affected"}-${index}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              {document.originalName?.trim() || `Documento ${index + 1}`}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {formatInteger(document.divergencesCount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{formatInteger(document.items)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
