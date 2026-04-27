import type { DemoCompanyInfo } from "../../../../lib/demoBatchAnalysis";

function CompanyInfoField({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-semibold leading-5 text-slate-900">{value}</p>
    </article>
  );
}

export function CompanyInfoCard({ company }: { company: DemoCompanyInfo }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Empresa</p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">Dados cadastrais e fiscais</h2>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <CompanyInfoField label="Nome empresarial" value={company.corporateName} />
        <CompanyInfoField label="Nome fantasia" value={company.tradeName} />
        <CompanyInfoField label="CNPJ / CFDF" value={company.taxRegistration} />
        <CompanyInfoField label="Telefone" value={company.phone} />
        <div className="sm:col-span-2">
          <CompanyInfoField label="Endereço" value={company.address} />
        </div>
        <div className="sm:col-span-2 xl:col-span-1">
          <CompanyInfoField label="Atividade econômica principal" value={company.mainActivity} />
        </div>
        <CompanyInfoField label="Ato declaratório" value={company.declaratoryAct} />
      </div>
    </section>
  );
}
