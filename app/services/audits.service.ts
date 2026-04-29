import { api } from "../lib/api";
import type { BatchSummary } from "./batches.service";

export type AuditNature = "INBOUND" | "OUTBOUND";

export type AuditStatus =
  | "DRAFT"
  | "RECEIVED"
  | "PROCESSING"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "FAILED"
  | string;

export type AuditBatch = {
  id: string;
  auditId?: string | null;
  batchId: string;
  nature: AuditNature;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  batch?: BatchSummary | null;
};

export type Audit = {
  id: string;
  name: string;
  companyName?: string | null;
  companyCnpj?: string | null;
  companyUf?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  status: AuditStatus;
  createdAt: string;
  updatedAt: string;
  batches?: AuditBatch[] | null;
  inboundBatch?: BatchSummary | null;
  outboundBatch?: BatchSummary | null;
  totalBatches?: number | null;
};

export type ListAuditsQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

export type ListAuditsResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: Audit[];
};

export type CreateAuditPayload = {
  name: string;
  companyName?: string;
  companyCnpj?: string;
  companyUf?: string;
  periodStart?: string;
  periodEnd?: string;
};

export type AddAuditBatchPayload = {
  batchId: string;
  nature: AuditNature;
};

type RawListAuditsResponse = Partial<ListAuditsResponse> & {
  items?: Audit[];
};

function toSafeNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return value;
}

function normalizeListAuditsResponse(
  response: RawListAuditsResponse | Audit[],
  requestedPage: number,
  requestedPageSize: number,
): ListAuditsResponse {
  if (Array.isArray(response)) {
    return {
      page: requestedPage,
      pageSize: requestedPageSize,
      total: response.length,
      totalPages: Math.max(1, Math.ceil(response.length / requestedPageSize)),
      data: response,
    };
  }

  const audits = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.items)
      ? response.items
      : [];

  const page = Math.max(1, toSafeNumber(response.page, requestedPage));
  const pageSize = Math.max(1, toSafeNumber(response.pageSize, requestedPageSize));
  const total = Math.max(0, toSafeNumber(response.total, audits.length));
  const totalPages = Math.max(1, toSafeNumber(response.totalPages, Math.ceil(total / pageSize)));

  return {
    page,
    pageSize,
    total,
    totalPages,
    data: audits,
  };
}

export async function listAudits(params: ListAuditsQueryParams = {}): Promise<ListAuditsResponse> {
  const requestedPage = params.page ?? 1;
  const requestedPageSize = params.pageSize ?? 10;

  const { data } = await api.get<RawListAuditsResponse | Audit[]>("/audits", {
    params: {
      ...params,
      search: params.search?.trim() || undefined,
      status: params.status || undefined,
    },
  });

  return normalizeListAuditsResponse(data, requestedPage, requestedPageSize);
}

export async function createAudit(payload: CreateAuditPayload): Promise<Audit> {
  const { data } = await api.post<Audit>("/audits", payload);
  return data;
}

export async function getAuditById(auditId: string): Promise<Audit> {
  const { data } = await api.get<Audit>(`/audits/${auditId}`);
  return data;
}

export async function addAuditBatch(auditId: string, payload: AddAuditBatchPayload): Promise<AuditBatch> {
  const { data } = await api.post<AuditBatch>(`/audits/${auditId}/batches`, payload);
  return data;
}

export async function listAuditBatches(auditId: string): Promise<AuditBatch[]> {
  const { data } = await api.get<AuditBatch[] | { data?: AuditBatch[]; items?: AuditBatch[] }>(
    `/audits/${auditId}/batches`,
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return Array.isArray(data.items) ? data.items : [];
}
