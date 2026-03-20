"use client";

import axios from "axios";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAccessToken } from "../lib/auth";
import {
  FileRecord,
  downloadFile,
  getFileById,
  listFiles,
  ListFilesResponse,
  uploadFile as uploadFileRequest,
} from "../services/files.service";
import { FileDetailsPanel } from "./components/FileDetailsPanel";
import { FilesFilters } from "./components/FilesFilters";
import { FilesList } from "./components/FilesList";
import { UploadModal } from "./components/UploadModal";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const UPLOAD_SUCCESS_CLOSE_DELAY_MS = 700;
const SIDEBAR_LOGO_PATH = "/ui/logo-ccf.png";

type ActiveFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

type FilterFormState = {
  search: string;
  dateFrom: string;
  dateTo: string;
};

type PageNotice = {
  type: "success" | "error";
  message: string;
};

function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function FilesPage() {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const uploadCloseTimeoutRef = useRef<number | null>(null);
  const token = isHydrated ? getAccessToken() : null;
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [filesResponse, setFilesResponse] = useState<ListFilesResponse | null>(null);
  const [listRefreshTrigger, setListRefreshTrigger] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterFormState>({
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [pageNotice, setPageNotice] = useState<PageNotice | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const currentPage = filesResponse?.page ?? page;
  const totalPages = Math.max(1, filesResponse?.totalPages ?? 1);
  const total = filesResponse?.total ?? 0;
  const pageSize = filesResponse?.pageSize ?? PAGE_SIZE;
  const normalizedSearch = filters.search.trim() || undefined;

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/");
    }
  }, [isHydrated, token, router]);

  useEffect(() => {
    if (!isHydrated || !token) {
      return;
    }

    let isActive = true;

    async function loadFiles() {
      setListLoading(true);
      setListError("");

      try {
        const data = await listFiles({
          page,
          pageSize: PAGE_SIZE,
          ...activeFilters,
        });

        if (!isActive) {
          return;
        }

        setFilesResponse(data);
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

        setListError("Não foi possível carregar os arquivos.");
      } finally {
        if (isActive) {
          setListLoading(false);
        }
      }
    }

    void loadFiles();

    return () => {
      isActive = false;
    };
  }, [isHydrated, token, page, activeFilters, listRefreshTrigger, router]);

  useEffect(() => {
    return () => {
      if (uploadCloseTimeoutRef.current) {
        window.clearTimeout(uploadCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pageNotice || pageNotice.type !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPageNotice(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pageNotice]);

  useEffect(() => {
    if (!isHydrated || !token || !selectedFileId) {
      setSelectedFile(null);
      setDetailsError("");
      setDetailsLoading(false);
      return;
    }

    let isActive = true;

    async function loadDetails() {
      setDetailsLoading(true);
      setDetailsError("");

      try {
        const data = await getFileById(selectedFileId);

        if (!isActive) {
          return;
        }

        setSelectedFile(data);
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

        setDetailsError("Não foi possível carregar os detalhes do arquivo.");
      } finally {
        if (isActive) {
          setDetailsLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      isActive = false;
    };
  }, [isHydrated, token, selectedFileId, router]);

  useEffect(() => {
    if (!isHydrated || !token) {
      return;
    }

    if (activeFilters.search === normalizedSearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setIsMobileDetailsOpen(false);
      setSelectedFileId(null);
      setSelectedFile(null);
      setActiveFilters((previous) => ({
        ...previous,
        search: normalizedSearch,
      }));
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeFilters.search, isHydrated, normalizedSearch, token]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [],
  );

  function applyFilters() {
    setPage(1);
    setIsMobileDetailsOpen(false);
    setSelectedFileId(null);
    setSelectedFile(null);
    setActiveFilters({
      search: normalizedSearch,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    });
  }

  function resetFilters() {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
    setIsMobileDetailsOpen(false);
    setSelectedFileId(null);
    setSelectedFile(null);
    setActiveFilters({});
  }

  function openMobileDetails(fileId: string) {
    setSelectedFileId(fileId);
    setIsMobileDetailsOpen(true);
  }

  function closeMobileDetails() {
    setIsMobileDetailsOpen(false);
  }

  function resetUploadState() {
    setSelectedUploadFile(null);
    setUploadLoading(false);
    setUploadError("");
    setUploadSuccess("");
  }

  function openUploadModal() {
    if (uploadCloseTimeoutRef.current) {
      window.clearTimeout(uploadCloseTimeoutRef.current);
      uploadCloseTimeoutRef.current = null;
    }

    resetUploadState();
    setIsUploadModalOpen(true);
  }

  function closeUploadModal() {
    if (uploadLoading || !!uploadSuccess) {
      return;
    }

    if (uploadCloseTimeoutRef.current) {
      window.clearTimeout(uploadCloseTimeoutRef.current);
      uploadCloseTimeoutRef.current = null;
    }

    setIsUploadModalOpen(false);
    resetUploadState();
  }

  function isXmlFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const mime = file.type.toLowerCase();
    return name.endsWith(".xml") || mime.includes("xml");
  }

  function extractUploadErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
      return "Não foi possível concluir o upload do arquivo.";
    }

    const responseData = error.response?.data;
    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData
    ) {
      const typedData = responseData as { message?: unknown };
      if (typeof typedData.message === "string") {
        return typedData.message;
      }
    }

    return "Não foi possível concluir o upload do arquivo.";
  }

  async function handleUploadFile() {
    if (!selectedUploadFile) {
      setUploadError("Selecione um arquivo XML para continuar.");
      setUploadSuccess("");
      return;
    }

    if (!isXmlFile(selectedUploadFile)) {
      setUploadError("Arquivo inválido. Selecione um XML (.xml).");
      setUploadSuccess("");
      return;
    }

    setUploadLoading(true);
    setUploadError("");
    setUploadSuccess("");
    setPageNotice(null);

    try {
      await uploadFileRequest(selectedUploadFile);
      setUploadSuccess("Upload concluído com sucesso.");
      setListRefreshTrigger((previous) => previous + 1);
      setPageNotice({
        type: "success",
        message: "Arquivo enviado com sucesso. A lista foi atualizada.",
      });

      uploadCloseTimeoutRef.current = window.setTimeout(() => {
        setIsUploadModalOpen(false);
        resetUploadState();
        uploadCloseTimeoutRef.current = null;
      }, UPLOAD_SUCCESS_CLOSE_DELAY_MS);
    } catch (error) {
      setUploadError(extractUploadErrorMessage(error));
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleDownload(fileId: string, fallbackName: string) {
    setPageNotice(null);
    setDownloadingFileId(fileId);

    try {
      const { blob, fileName } = await downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName ?? fallbackName;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setPageNotice({
        type: "error",
        message: "Não foi possível baixar o arquivo selecionado.",
      });
    } finally {
      setDownloadingFileId(null);
    }
  }

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
      <main className="flex h-dvh overflow-hidden bg-slate-50">
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-950 bg-slate-800 text-slate-300 lg:flex lg:h-full">
          <div className="border-b border-white/10 px-6 py-5">
            <Image
              src={SIDEBAR_LOGO_PATH}
              alt="CCF"
              width={2816}
              height={1536}
              priority
              className="block h-auto w-[136px] max-w-full object-contain"
            />
          </div>
          <nav className="px-0 py-4">
            <p className="border-l-2 border-blue-600 bg-white/5 px-6 py-3 text-sm font-medium text-white">
              Arquivos XML
            </p>
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
            <div className="flex items-center gap-2">
              <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <p className="text-sm font-semibold text-slate-900">CCF</p>
            </div>
            <p className="text-sm font-medium text-slate-700">Arquivos XML</p>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-5 sm:px-5 lg:px-10 lg:py-8">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[1280px] flex-col">
              <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-semibold text-slate-900">Arquivos XML</h1>
                <button
                    type="button"
                    onClick={openUploadModal}
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-70 md:w-auto"
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Novo Upload
                </button>
              </div>

              <FilesFilters
                  values={filters}
                  onChange={(field, value) =>
                      setFilters((previous) => ({
                        ...previous,
                        [field]: value,
                      }))
                  }
                  onSubmit={applyFilters}
                  onReset={resetFilters}
                  isLoading={listLoading}
              />

              {pageNotice ? (
                  <div
                      className={`mt-3 flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                          pageNotice.type === "success"
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-rose-100 bg-rose-50 text-rose-700"
                      }`}
                  >
                    <p>{pageNotice.message}</p>
                    <button
                        type="button"
                        onClick={() => setPageNotice(null)}
                        className="shrink-0 cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-medium text-current transition hover:bg-white/40"
                    >
                      Fechar
                    </button>
                  </div>
              ) : null}

              <section className="mt-4 flex min-h-0 flex-1 flex-col gap-5 lg:mt-6 lg:flex-row lg:overflow-hidden">
                <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                  <FilesList
                      files={filesResponse?.data ?? []}
                      selectedFileId={selectedFileId}
                      isLoading={listLoading}
                      errorMessage={listError}
                      total={total}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      downloadingFileId={downloadingFileId}
                      onSelectFile={setSelectedFileId}
                      onOpenDetails={openMobileDetails}
                      onDownloadFile={(file) => handleDownload(file.id, file.originalName)}
                      onPreviousPage={() => {
                        setPage((previous) => Math.max(1, previous - 1));
                        setIsMobileDetailsOpen(false);
                        setSelectedFileId(null);
                        setSelectedFile(null);
                      }}
                      onNextPage={() => {
                        setPage((previous) => previous + 1);
                        setIsMobileDetailsOpen(false);
                        setSelectedFileId(null);
                        setSelectedFile(null);
                      }}
                      formatDate={(value) => dateFormatter.format(new Date(value))}
                  />
                </div>

                <div className="hidden lg:min-h-0 lg:block lg:w-[360px] lg:shrink-0 lg:overflow-hidden">
                  <FileDetailsPanel
                      selectedFileId={selectedFileId}
                      file={selectedFile}
                      isLoading={detailsLoading}
                      errorMessage={detailsError}
                      isDownloading={selectedFile?.id === downloadingFileId}
                      onDownload={() => {
                        if (!selectedFile) return;
                        void handleDownload(selectedFile.id, selectedFile.originalName);
                      }}
                      formatDate={(value) => dateFormatter.format(new Date(value))}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>

        {isMobileDetailsOpen ? (
            <div
                className="fixed inset-0 z-50 flex items-end lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Detalhes do arquivo"
            >
              <button
                  type="button"
                  onClick={closeMobileDetails}
                  aria-label="Fechar detalhes"
                  className="absolute inset-0 cursor-pointer bg-slate-900/35"
              />

              <div className="relative z-10 w-full max-h-[88dvh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-slate-50 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-2xl">
                <div className="mb-2 flex justify-end">
                  <button
                      type="button"
                      onClick={closeMobileDetails}
                      className="h-8 cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Fechar
                  </button>
                </div>

                <FileDetailsPanel
                    selectedFileId={selectedFileId}
                    file={selectedFile}
                    isLoading={detailsLoading}
                    errorMessage={detailsError}
                    isDownloading={selectedFile?.id === downloadingFileId}
                    onDownload={() => {
                      if (!selectedFile) return;
                      void handleDownload(selectedFile.id, selectedFile.originalName);
                    }}
                    formatDate={(value) => dateFormatter.format(new Date(value))}
                />
              </div>
            </div>
        ) : null}

        <UploadModal
          isOpen={isUploadModalOpen}
          selectedFile={selectedUploadFile}
          isSubmitting={uploadLoading}
          errorMessage={uploadError}
          successMessage={uploadSuccess}
          onClose={closeUploadModal}
          onConfirm={() => {
            void handleUploadFile();
          }}
          onSelectFile={(file) => {
            setSelectedUploadFile(file);
            setUploadError("");
            setUploadSuccess("");
          }}
        />
      </main>
  );
}
