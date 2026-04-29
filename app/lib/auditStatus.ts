export function normalizeAuditStatus(status: string | null | undefined): string {
  return status?.trim().toUpperCase() ?? "";
}

export function getAuditStatusLabel(status: string | null | undefined): string {
  const normalized = normalizeAuditStatus(status);

  if (normalized.includes("DRAFT")) {
    return "Rascunho";
  }

  if (normalized.includes("COMPLETED_WITH_ERRORS")) {
    return "Concluída c/ erros";
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
    return "Concluída";
  }

  return "Recebida";
}

export function getAuditStatusClass(status: string | null | undefined): string {
  const normalized = normalizeAuditStatus(status);

  if (normalized.includes("DRAFT")) {
    return "border border-slate-200 bg-slate-50 text-slate-600";
  }

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
    return "border border-blue-200 bg-blue-50 text-blue-700";
  }

  if (normalized.includes("COMPLETED") || normalized.includes("PROCESSED")) {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border border-indigo-200 bg-indigo-50 text-indigo-700";
}

export function getAuditNatureLabel(nature: string | null | undefined): string {
  const normalized = normalizeAuditStatus(nature);

  if (normalized === "INBOUND") {
    return "Entradas";
  }

  if (normalized === "OUTBOUND") {
    return "Saídas";
  }

  return "Não definida";
}
