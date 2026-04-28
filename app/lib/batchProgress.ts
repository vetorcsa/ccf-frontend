export type BatchProgressLike = {
  status?: string | null;
  totalFiles?: number | null;
  totalDocuments?: number | null;
  filesTotal?: number | null;
  processedFiles?: number | null;
  processedDocuments?: number | null;
  filesProcessed?: number | null;
  totalProcessed?: number | null;
  failedFiles?: number | null;
  errorFiles?: number | null;
  filesWithErrors?: number | null;
  totalWithErrors?: number | null;
  progress?: number | null;
  progressPercent?: number | null;
};

export type BatchProgressInfo = {
  total: number | null;
  processed: number | null;
  failed: number | null;
  pending: number | null;
  percent: number | null;
  text: string | null;
  hasProgress: boolean;
};

export function normalizeBatchStatus(status: string | null | undefined): string {
  return status?.trim().toUpperCase() ?? "";
}

export function getBatchStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeBatchStatus(status);

  if (normalized.includes("COMPLETED_WITH_ERRORS")) {
    return "Concluído c/ erros";
  }

  if (normalized.includes("FAILED") || normalized.includes("ERROR") || normalized.includes("FAIL")) {
    return "Falhou";
  }

  if (
    normalized.includes("PROCESSING") ||
    normalized.includes("IN_PROGRESS") ||
    normalized.includes("RUNNING")
  ) {
    return "Processando";
  }

  if (normalized.includes("COMPLETED") || normalized.includes("PROCESSED")) {
    return "Concluído";
  }

  return "Recebido";
}

export function getBatchStatusClass(status: string | null | undefined): string {
  const normalized = normalizeBatchStatus(status);

  if (normalized.includes("COMPLETED_WITH_ERRORS")) {
    return "border border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized.includes("FAILED") || normalized.includes("ERROR") || normalized.includes("FAIL")) {
    return "border border-rose-200 bg-rose-50 text-rose-700";
  }

  if (
    normalized.includes("PROCESSING") ||
    normalized.includes("IN_PROGRESS") ||
    normalized.includes("RUNNING")
  ) {
    return "border border-slate-200 bg-slate-50 text-slate-700";
  }

  if (normalized.includes("COMPLETED") || normalized.includes("PROCESSED")) {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border border-blue-200 bg-blue-50 text-blue-700";
}

export function getBatchStatusDotClass(status: string | null | undefined): string {
  const normalized = normalizeBatchStatus(status);

  if (normalized.includes("COMPLETED_WITH_ERRORS")) {
    return "bg-amber-500";
  }

  if (normalized.includes("FAILED") || normalized.includes("ERROR") || normalized.includes("FAIL")) {
    return "bg-rose-500";
  }

  if (
    normalized.includes("PROCESSING") ||
    normalized.includes("IN_PROGRESS") ||
    normalized.includes("RUNNING")
  ) {
    return "bg-slate-500";
  }

  if (normalized.includes("COMPLETED") || normalized.includes("PROCESSED")) {
    return "bg-emerald-500";
  }

  return "bg-blue-600";
}

export function isBatchTerminalStatus(status: string | null | undefined): boolean {
  const normalized = normalizeBatchStatus(status);

  return (
    normalized.includes("COMPLETED") ||
    normalized.includes("PROCESSED") ||
    normalized.includes("FAILED") ||
    normalized.includes("ERROR") ||
    normalized.includes("FAIL")
  );
}

export function isBatchInProgress(status: string | null | undefined): boolean {
  const normalized = normalizeBatchStatus(status);
  return normalized.length > 0 && !isBatchTerminalStatus(status);
}

export function isBatchProcessed(status: string | null | undefined): boolean {
  const normalized = normalizeBatchStatus(status);
  return normalized.includes("COMPLETED") || normalized.includes("PROCESSED");
}

export function isBatchFailed(status: string | null | undefined): boolean {
  const normalized = normalizeBatchStatus(status);
  return (
    normalized.includes("FAILED") ||
    normalized.includes("ERROR") ||
    normalized.includes("FAIL") ||
    normalized.includes("COMPLETED_WITH_ERRORS")
  );
}

function pickNumber(values: Array<number | null | undefined>): number | null {
  const value = values.find((item) => typeof item === "number" && Number.isFinite(item) && item >= 0);
  return typeof value === "number" ? value : null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getBatchProgressInfo(batch: BatchProgressLike | null | undefined): BatchProgressInfo {
  if (!batch) {
    return {
      total: null,
      processed: null,
      failed: null,
      pending: null,
      percent: null,
      text: null,
      hasProgress: false,
    };
  }

  const total = pickNumber([batch.totalFiles, batch.totalDocuments, batch.filesTotal]);
  const failed = pickNumber([batch.failedFiles, batch.errorFiles, batch.filesWithErrors, batch.totalWithErrors]);
  const rawProcessed = pickNumber([
    batch.processedFiles,
    batch.processedDocuments,
    batch.filesProcessed,
    batch.totalProcessed,
  ]);
  const processed =
    rawProcessed ??
    (isBatchProcessed(batch.status) && total !== null ? Math.max(0, total - (failed ?? 0)) : null);
  const explicitPercent = pickNumber([batch.progressPercent, batch.progress]);
  const percent =
    explicitPercent !== null
      ? clampPercent(explicitPercent)
      : total && total > 0 && processed !== null
        ? clampPercent((processed / total) * 100)
        : null;
  const pending =
    total !== null && processed !== null ? Math.max(0, total - processed - (failed ?? 0)) : null;
  const hasProgress = total !== null && (processed !== null || failed !== null || percent !== null);

  let text: string | null = null;
  if (total !== null && processed !== null) {
    text = `${processed}/${total} processados`;
    if (failed) {
      text += ` • ${failed} com erro`;
    }
  } else if (total !== null) {
    text = `${total} arquivo(s) recebidos`;
  } else if (isBatchInProgress(batch.status)) {
    text = "Atualização automática ativa";
  }

  return {
    total,
    processed,
    failed,
    pending,
    percent,
    text,
    hasProgress,
  };
}
