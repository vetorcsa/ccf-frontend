type FilterValues = {
  search: string;
  dateFrom: string;
  dateTo: string;
};

type FilesFiltersProps = {
  values: FilterValues;
  onChange: (field: keyof FilterValues, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
};

export function FilesFilters({
  values,
  onChange,
  onSubmit,
  onReset,
  isLoading,
}: FilesFiltersProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 lg:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            id="search"
            type="search"
            value={values.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Buscar por nome do arquivo..."
            className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 lg:h-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:gap-2">
          <input
            id="dateFrom"
            type="date"
            value={values.dateFrom}
            onChange={(event) => onChange("dateFrom", event.target.value)}
            aria-label="Data inicial"
            title="Data inicial"
            className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 lg:h-10 lg:w-40"
          />
          <input
            id="dateTo"
            type="date"
            value={values.dateTo}
            onChange={(event) => onChange("dateTo", event.target.value)}
            aria-label="Data final"
            title="Data final"
            className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 lg:h-10 lg:w-40"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 lg:flex">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="h-9 cursor-pointer rounded-md bg-blue-700 px-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 lg:h-10"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="h-9 cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 lg:h-10"
          >
            Limpar
          </button>
        </div>
      </div>
    </section>
  );
}
