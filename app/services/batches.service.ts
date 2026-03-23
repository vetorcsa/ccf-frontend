import { api } from "../lib/api";
import type { FileRecord } from "./files.service";

export type BatchesQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type BatchUploadedBy = {
  id: string;
  name: string;
  email: string;
};

export type BatchRecord = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: BatchUploadedBy | null;
  totalFiles?: number;
};

export type ListBatchesResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: BatchRecord[];
};

export type BatchFilesQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type BatchSummary = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ListBatchFilesResponse = {
  batch: BatchSummary;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: FileRecord[];
};

export type BatchAnalysisDocument = {
  fileId?: string | null;
  id?: string | null;
  originalName?: string | null;
  divergencesCount?: number | null;
  items?: number | null;
  error?: string | null;
};

export type BatchAnalysisSummary = {
  totalDocuments?: number | null;
  totalFiles?: number | null;
  totalProcessed?: number | null;
  totalWithDivergences?: number | null;
  totalWithErrors?: number | null;
  totalItems?: number | null;
  conformingDocuments?: number | null;
  processedDocuments?: number | null;
  documentsWithDivergences?: number | null;
  documentsWithErrors?: number | null;
  totalDivergences?: number | null;
  withDivergences?: number | null;
  withErrors?: number | null;
};

export type BatchAnalysisDivergence = {
  code?: string | null;
  title?: string | null;
  description?: string | null;
  severity?: string | null;
  count?: number | null;
  documentsCount?: number | null;
  occurrences?: number | null;
  sampleDocumentIds?: string[] | null;
};

export type BatchAnalysisFiscalNote = {
  note?: string | null;
  documentsCount?: number | null;
  occurrences?: number | null;
  sampleDocumentIds?: string[] | null;
};

export type BatchAnalysisPeriod = {
  startIssuedAt?: string | null;
  endIssuedAt?: string | null;
};

export type BatchAnalysisResponse = {
  batch?: BatchSummary | null;
  period?: BatchAnalysisPeriod | null;
  summary?: BatchAnalysisSummary | null;
  divergences?: BatchAnalysisDivergence[] | null;
  fiscalNotes?: BatchAnalysisFiscalNote[] | string[] | null;
  documents?: {
    withDivergences?: BatchAnalysisDocument[] | null;
    withErrors?: BatchAnalysisDocument[] | null;
  } | null;
};

type RawListBatchesResponse = Partial<ListBatchesResponse> & {
  items?: BatchRecord[];
};

export type UploadBatchResponse = {
  id: string;
};

function toSafeNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return value;
}

function normalizeListBatchesResponse(
  response: RawListBatchesResponse,
  requestedPage: number,
  requestedPageSize: number,
): ListBatchesResponse {
  const batches = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.items)
      ? response.items
      : [];

  const page = Math.max(1, toSafeNumber(response.page, requestedPage));
  const pageSize = Math.max(1, toSafeNumber(response.pageSize, requestedPageSize));
  const total = Math.max(0, toSafeNumber(response.total, batches.length));
  const totalPages = Math.max(1, toSafeNumber(response.totalPages, Math.ceil(total / pageSize)));

  return {
    page,
    pageSize,
    total,
    totalPages,
    data: batches,
  };
}

export async function listBatches(params: BatchesQueryParams): Promise<ListBatchesResponse> {
  const requestedPage = params.page ?? 1;
  const requestedPageSize = params.pageSize ?? 10;

  const { data } = await api.get<RawListBatchesResponse>("/batches", {
    params: {
      ...params,
      search: params.search?.trim() || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
    },
  });

  return normalizeListBatchesResponse(data, requestedPage, requestedPageSize);
}

export async function listBatchFiles(
  batchId: string,
  params: BatchFilesQueryParams,
): Promise<ListBatchFilesResponse> {
  const { data } = await api.get<ListBatchFilesResponse>(`/batches/${batchId}/files`, {
    params: {
      ...params,
      search: params.search?.trim() || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
    },
  });

  return data;
}

export async function getBatchAnalysis(batchId: string): Promise<BatchAnalysisResponse> {
  const { data } = await api.get<BatchAnalysisResponse>(`/batches/${batchId}/analysis`);
  return data;
}

export async function uploadBatch(name: string, files: File[]): Promise<UploadBatchResponse> {
  const formData = new FormData();
  formData.append("name", name);

  for (const file of files) {
    formData.append("files", file);
  }

  const { data } = await api.post<UploadBatchResponse>("/batches/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}
