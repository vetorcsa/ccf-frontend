import { api } from "../lib/api";

export type FilesQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type FileUploadedBy = {
  id: string;
  name: string;
  email: string;
};

export type FileRecord = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: FileUploadedBy;
};

export type ListFilesResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: FileRecord[];
};

export type DownloadFileResponse = {
  blob: Blob;
  fileName: string | null;
};

function parseFileNameFromContentDisposition(header?: string): string | null {
  if (!header) {
    return null;
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const defaultMatch = header.match(/filename="?([^"]+)"?/i);
  return defaultMatch?.[1] ?? null;
}

export async function listFiles(params: FilesQueryParams): Promise<ListFilesResponse> {
  const { data } = await api.get<ListFilesResponse>("/files", {
    params: {
      ...params,
      search: params.search?.trim() || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
    },
  });

  return data;
}

export async function getFileById(id: string | null): Promise<FileRecord> {
  const { data } = await api.get<FileRecord>(`/files/${id}`);
  return data;
}

export async function downloadFile(id: string): Promise<DownloadFileResponse> {
  const response = await api.get<Blob>(`/files/${id}/download`, {
    responseType: "blob",
  });

  return {
    blob: response.data,
    fileName: parseFileNameFromContentDisposition(response.headers["content-disposition"]),
  };
}
