const FILE_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Recebido",
  PROCESSING: "Processando",
  PROCESSED: "Processado",
  ERROR: "Erro",
};

function normalizeStatus(status: string): string {
  return status.trim().toUpperCase();
}

function toFriendlyFallback(status: string): string {
  const normalized = normalizeStatus(status);
  if (!normalized) {
    return "Desconhecido";
  }

  const pretty = normalized.toLowerCase().replace(/[_-]+/g, " ");
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

export function getFileStatusLabel(status: string): string {
  const normalized = normalizeStatus(status);
  return FILE_STATUS_LABELS[normalized] ?? toFriendlyFallback(status);
}

export function getFileStatusBadgeClass(status: string): string {
  const normalized = normalizeStatus(status);

  if (
    normalized.includes("ERROR") ||
    normalized.includes("ERRO") ||
    normalized.includes("FAIL")
  ) {
    return "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200";
  }

  if (normalized.includes("PROCESS")) {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  }

  return "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200";
}
