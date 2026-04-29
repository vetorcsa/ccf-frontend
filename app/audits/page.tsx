"use client";

import axios from "axios";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "../components/AppSidebar";
import { UserMenu } from "../components/UserMenu";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { getAccessToken } from "../lib/auth";
import { getAuditStatusClass, getAuditStatusLabel } from "../lib/auditStatus";
import { type Audit, listAudits } from "../services/audits.service";

const AUDITS_PAGE_SIZE = 10;

function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatPeriod(start: string | null | undefined, end: string | null | undefined): string {
  if (!start && !end) {
    return "-";
  }

  if (start && end) {
    return `${formatDate(start)} até ${formatDate(end)}`;
  }

  return formatDate(start ?? end);
}

function getAuditDisplayName(audit: Audit): string {
  return audit.name?.trim() || `Auditoria ${audit.id.slice(0, 8)}`;
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function AuditsPage() {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const token = isHydrated ? getAccessToken() : null;
  const { userDisplay } = useAuthenticatedUser(token);

  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/");
    }
  }, [isHydrated, router, token]);

  useEffect(() => {
    if (!isHydrated || !token) {
      return;
    }

    let isActive = true;

    async function loadAudits() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await listAudits({
          page,
          pageSize: AUDITS_PAGE_SIZE,
        });

        if (!isActive) {
          return;
        }

        setAudits(response.data);
        setTotal(response.total);
        setTotalPages(Math.max(1, response.totalPages));
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

        setErrorMessage("Não foi possível carregar as auditorias fiscais.");
        setAudits([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAudits();

    return () => {
      isActive = false;
    };
  }, [isHydrated, page, router, token]);

  const pageStart = audits.length > 0 ? (page - 1) * AUDITS_PAGE_SIZE + 1 : 0;
  const pageEnd = (page - 1) * AUDITS_PAGE_SIZE + audits.length;
  const headerText = useMemo(
    () => "Gerencie processos de auditoria fiscal com entradas, saídas e cruzamentos.",
    [],
  );

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
    <div className="flex min-h-dvh bg-slate-100 text-slate-900">
      <AppSidebar activeItem="audits" />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button type="button" className="cursor-pointer rounded-full p-2 text-slate-500 transition hover:bg-slate-100">
              <BellIcon />
            </button>
            <UserMenu name={userDisplay.name} initials={userDisplay.initials} />
          </div>
        </header>

        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Auditorias Fiscais</h1>
                <p className="mt-1 text-sm text-slate-500">{headerText}</p>
              </div>

              <button
                type="button"
                className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white opacity-60 shadow-sm"
                title="Fluxo de criação será implementado na próxima etapa"
              >
                Nova Auditoria
              </button>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {errorMessage}
              </div>
            ) : null}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Lista de Auditorias</h2>
              </header>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Auditoria
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Empresa
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        UF
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Período
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-sm text-slate-500">
                          Carregando auditorias fiscais...
                        </td>
                      </tr>
                    ) : null}

                    {!isLoading && audits.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-sm text-slate-500">
                          Nenhuma auditoria fiscal encontrada.
                        </td>
                      </tr>
                    ) : null}

                    {!isLoading
                      ? audits.map((audit) => (
                          <tr key={audit.id} className="transition-colors hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-900">{getAuditDisplayName(audit)}</p>
                              <p className="mt-0.5 text-xs text-slate-500">ID: #{audit.id.slice(0, 8)}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-700">{audit.companyName || "-"}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{audit.companyCnpj || "-"}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">{audit.companyUf || "-"}</td>
                            <td className="px-5 py-4 text-sm text-slate-700">
                              {formatPeriod(audit.periodStart, audit.periodEnd)}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getAuditStatusClass(
                                  audit.status,
                                )}`}
                              >
                                {getAuditStatusLabel(audit.status)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => router.push(`/audits/${audit.id}`)}
                                className="cursor-pointer rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                              >
                                Ver auditoria
                              </button>
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>

              <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Mostrando <span className="font-medium text-slate-900">{pageStart}</span> a{" "}
                  <span className="font-medium text-slate-900">{pageEnd}</span> de{" "}
                  <span className="font-medium text-slate-900">{total}</span> auditorias
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                    disabled={isLoading || page <= 1}
                    className="h-9 cursor-pointer rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="inline-flex h-9 min-w-9 items-center justify-center rounded bg-indigo-600 px-3 text-sm font-medium text-white">
                    {page}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                    disabled={isLoading || page >= totalPages}
                    className="h-9 cursor-pointer rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
              </footer>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
