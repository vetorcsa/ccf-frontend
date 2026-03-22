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

export type UploadFileResponse = {
  id: string;
};

export type FileAnalysisFile = {
  id?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  status?: string;
  createdAt?: string;
  uploadedBy?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

export type FileAnalysisCompany = {
  corporateName?: string | null;
  tradeName?: string | null;
  cnpj?: string | null;
  ie?: string | null;
  uf?: string | null;
  crt?: string | null;
};

export type FileAnalysisDocumentItem = {
  item?: number | null;
  code?: string | null;
  description?: string | null;
  ncm?: string | null;
  cest?: string | null;
  cfop?: string | null;
  quantity?: number | null;
  unitValue?: number | null;
  totalValue?: number | null;
  taxes?: {
    icmsCstOrCsosn?: string | null;
    pisCst?: string | null;
    pisValue?: number | null;
    cofinsCst?: string | null;
    cofinsValue?: number | null;
  } | null;
};

export type FileAnalysisDocumentTotals = {
  vProd?: number | null;
  vDesc?: number | null;
  vFrete?: number | null;
  vNF?: number | null;
  vPIS?: number | null;
  vCOFINS?: number | null;
  vICMS?: number | null;
};

export type FileAnalysisDocument = {
  number?: string | null;
  series?: string | null;
  model?: string | null;
  issuedAt?: string | null;
  key?: string | null;
  protocol?: string | null;
  operationNature?: string | null;
  items?: FileAnalysisDocumentItem[];
  totals?: FileAnalysisDocumentTotals | null;
};

export type FileAnalysisSummary = {
  status?: "OK" | "ATTENTION" | string | null;
  totalItems?: number | null;
  totalDivergences?: number | null;
  totalWarnings?: number | null;
  uniqueCfops?: string[] | null;
};

export type FileAnalysisDivergence = {
  code?: string;
  title?: string;
  description?: string;
  severity?: "WARNING" | string;
  itemNumbers?: number[];
};

export type FileAnalysisNote = string;

export type FileAnalysisResponse = {
  file?: FileAnalysisFile;
  company?: FileAnalysisCompany;
  document?: FileAnalysisDocument;
  analysisSummary?: FileAnalysisSummary;
  divergences?: FileAnalysisDivergence[];
  fiscalNotes?: FileAnalysisNote[];
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

export async function getFileAnalysisById(id: string): Promise<FileAnalysisResponse> {
  const { data } = await api.get<FileAnalysisResponse>(`/files/${id}/analysis`);
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

export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadFileResponse>("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}
