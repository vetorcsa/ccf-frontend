import { api } from "../lib/api";

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
