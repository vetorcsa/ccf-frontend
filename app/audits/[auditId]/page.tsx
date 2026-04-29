"use client";

import axios from "axios";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "../../components/AppSidebar";
import { UserMenu } from "../../components/UserMenu";
import { useAuthenticatedUser } from "../../hooks/useAuthenticatedUser";
import { getAccessToken } from "../../lib/auth";
import { getAuditNatureLabel, getAuditStatusClass, getAuditStatusLabel } from "../../lib/auditStatus";
import {
  type Audit,
  type AuditBatch,
  getAuditById,
  listAuditBatches,
} from "../../services/audits.service";

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

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
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

function getAuditDisplayName(audit: Audit | null): string {
  if (!audit) {
    return "Auditoria Fiscal";
  }

  return audit.name?.trim() || `Auditoria ${audit.id.slice(0, 8)}`;
}

function InfoCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.04em] text-slate-500">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-slate-900">{value}</div>
    </article>
  );
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

export default function AuditDetailPage() {
  const router = useRouter();
  const params = useParams<{ auditId: string }>();
  const rawAuditId = params?.auditId;
  const auditId = Array.isArray(rawAuditId) ? rawAuditId[0] : rawAuditId;

  const isHydrated = useIsHydrated();
  const token = isHydrated ? getAccessToken() : null;
  const { userDisplay } = useAuthenticatedUser(token);

  const [audit, setAudit] = useState<Audit | null>(null);
  const [batches, setBatches] = useState<AuditBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/");
    }
  }, [isHydrated, router, token]);

  useEffect(() => {
    if (!isHydrated || !token || !auditId) {
      return;
    }

    let isActive = true;

    async function loadAudit() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [auditResponse, batchesResponse] = await Promise.all([
          getAuditById(auditId),
          listAuditBatches(auditId).catch(() => []),
        ]);

        if (!isActive) {
          return;
        }

        setAudit(auditResponse);
        setBatches(batchesResponse.length > 0 ? batchesResponse : auditResponse.batches ?? []);
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

          if (status === 404) {
            setErrorMessage("Auditoria fiscal não encontrada.");
            return;
          }
        }

        setErrorMessage("Não foi possível carregar a auditoria fiscal.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAudit();

    return () => {
      isActive = false;
    };
  }, [auditId, isHydrated, router, token]);

  const title = getAuditDisplayName(audit);
  const periodText = useMemo(
    () => formatPeriod(audit?.periodStart, audit?.periodEnd),
    [audit?.periodEnd, audit?.periodStart],
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/audits")}
                  className="mt-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Voltar para auditorias"
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
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Base da auditoria fiscal para entradas, saídas e cruzamento fiscal.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-500 opacity-70"
                title="Abas analíticas serão habilitadas nas próximas etapas"
              >
                Cruzamento em breve
              </button>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <InfoCard
                label="Status"
                value={
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getAuditStatusClass(
                      audit?.status,
                    )}`}
                  >
                    {isLoading ? "Carregando" : getAuditStatusLabel(audit?.status)}
                  </span>
                }
              />
              <InfoCard label="Empresa" value={audit?.companyName || "-"} />
              <InfoCard label="CNPJ" value={audit?.companyCnpj || "-"} />
              <InfoCard label="UF" value={audit?.companyUf || "-"} />
              <InfoCard label="Período" value={periodText} />
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Batches Vinculados</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Lotes de entrada e saída associados a esta auditoria fiscal.
                </p>
              </header>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Natureza
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Lote
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
                        <td colSpan={4} className="px-5 py-8 text-sm text-slate-500">
                          Carregando batches vinculados...
                        </td>
                      </tr>
                    ) : null}

                    {!isLoading && batches.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-sm text-slate-500">
                          Nenhum lote de entrada ou saída vinculado ainda.
                        </td>
                      </tr>
                    ) : null}

                    {!isLoading
                      ? batches.map((auditBatch) => (
                          <tr key={auditBatch.id} className="transition-colors hover:bg-slate-50">
                            <td className="px-5 py-4 text-sm font-medium text-slate-900">
                              {getAuditNatureLabel(auditBatch.nature)}
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-800">
                                {auditBatch.batch?.name || `Lote ${auditBatch.batchId.slice(0, 8)}`}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">ID: #{auditBatch.batchId.slice(0, 8)}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {auditBatch.status || auditBatch.batch?.status || "-"}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => router.push(`/batches/${auditBatch.batchId}/documents`)}
                                className="cursor-pointer rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                              >
                                Ver documentos
                              </button>
                            </td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Estrutura preparada para próximas abas</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Nas próximas etapas, esta tela receberá Visão Geral, Valores, Cruzamento Fiscal,
                Divergências, Demonstrativo, Documentos e Regras Aplicadas.
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
