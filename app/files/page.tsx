"use client";

import axios from "axios";
import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "../lib/auth";
import {
  FileDetailResponse,
  downloadFile,
  getFileById,
  listFiles,
  ListFilesResponse,
} from "../services/files.service";
import { FileDetailsPanel } from "./components/FileDetailsPanel";
import { FilesList } from "./components/FilesList";

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
  const token = isHydrated ? getAccessToken() : null;
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listErrorMessage, setListErrorMessage] = useState("");
  const [downloadErrorMessage, setDownloadErrorMessage] = useState("");
  const [filesResponse, setFilesResponse] = useState<ListFilesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFileDetails, setSelectedFileDetails] = useState<FileDetailResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsErrorMessage, setDetailsErrorMessage] = useState("");
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const currentPage = filesResponse?.page ?? page;
  const totalPages = Math.max(1, filesResponse?.totalPages ?? 1);
  const total = filesResponse?.total ?? 0;

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
      setIsLoadingList(true);
      setListErrorMessage("");
      setDownloadErrorMessage("");

      try {
        const data = await listFiles({
          page,
          pageSize: 10,
          search: search || undefined,
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

        setListErrorMessage("Não foi possível carregar a lista de arquivos.");
      } finally {
        if (isActive) {
          setIsLoadingList(false);
        }
      }
    }

    void loadFiles();

    return () => {
      isActive = false;
    };
  }, [isHydrated, token, page, search, router]);

  useEffect(() => {
    if (!isHydrated || !token || !selectedFileId) {
      setSelectedFileDetails(null);
      setDetailsErrorMessage("");
      setIsLoadingDetails(false);
      return;
    }

    let isActive = true;

    async function loadFileDetails() {
      setIsLoadingDetails(true);
      setDetailsErrorMessage("");

      try {
        const data = await getFileById(selectedFileId);

        if (!isActive) {
          return;
        }

        setSelectedFileDetails(data);
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

        setDetailsErrorMessage("Não foi possível carregar os detalhes do arquivo.");
      } finally {
        if (isActive) {
          setIsLoadingDetails(false);
        }
      }
    }

    void loadFileDetails();

    return () => {
      isActive = false;
    };
  }, [isHydrated, token, selectedFileId, router]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [],
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSelectedFileId(null);
    setSelectedFileDetails(null);
    setSearch(searchInput.trim());
  }

  async function handleDownload(fileId: string, fallbackName: string) {
    setDownloadingFileId(fileId);
    setDownloadErrorMessage("");

    try {
      const { blob, fileName } = await downloadFile(fileId);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = fileName ?? fallbackName;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setDownloadErrorMessage("Não foi possível baixar o arquivo selecionado.");
    } finally {
      setDownloadingFileId(null);
    }
  }

  if (!isHydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Verificando acesso...</p>
      </main>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-blue-50 to-slate-100 px-4 py-5 sm:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
        <section className="rounded-2xl border border-blue-800/70 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 px-4 py-5 text-white shadow-[0_16px_40px_rgba(30,64,175,0.26)] sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-100">
            Fiscal / Documentos
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Arquivos Fiscais
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Listagem e consulta de arquivos XML enviados para o sistema.
          </p>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 md:flex-row">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nome do arquivo"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="h-10 rounded-xl bg-blue-800 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Filtrar
              </button>
              <button
                type="button"
                disabled
                title="Upload será implementado no próximo passo."
                className="h-10 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-800 opacity-80"
              >
                Novo Upload
              </button>
            </div>
          </form>

          {downloadErrorMessage ? (
            <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {downloadErrorMessage}
            </p>
          ) : null}
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <FilesList
            files={filesResponse?.data ?? []}
            selectedFileId={selectedFileId}
            isLoading={isLoadingList}
            errorMessage={listErrorMessage}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            downloadingFileId={downloadingFileId}
            onSelectFile={setSelectedFileId}
            onDownloadFile={(file) => handleDownload(file.id, file.originalName)}
            onPreviousPage={() => {
              setSelectedFileId(null);
              setSelectedFileDetails(null);
              setPage((previous) => Math.max(1, previous - 1));
            }}
            onNextPage={() => {
              setSelectedFileId(null);
              setSelectedFileDetails(null);
              setPage((previous) => previous + 1);
            }}
            formatDate={(value) => dateFormatter.format(new Date(value))}
          />

          <FileDetailsPanel
            selectedFileId={selectedFileId}
            fileDetail={selectedFileDetails}
            isLoading={isLoadingDetails}
            errorMessage={detailsErrorMessage}
            isDownloading={
              downloadingFileId !== null && selectedFileDetails?.id === downloadingFileId
            }
            onDownload={() => {
              if (!selectedFileDetails) {
                return;
              }

              void handleDownload(selectedFileDetails.id, selectedFileDetails.originalName);
            }}
            formatDate={(value) => dateFormatter.format(new Date(value))}
          />
        </div>
      </div>
    </main>
  );
}
