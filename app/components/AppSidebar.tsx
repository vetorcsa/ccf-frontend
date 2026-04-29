"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type SidebarKey = "dashboard" | "audits" | "new-batch" | "batches";

type SidebarItem = {
  key: SidebarKey | string;
  label: string;
  href: string;
  icon: ReactNode;
};

type AppSidebarProps = {
  activeItem: SidebarKey | string;
  contextualItems?: SidebarItem[];
};

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.2" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" />
      <rect x="14" y="14" width="7" height="7" rx="1.2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function FilesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l2 2 4-5" />
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8" />
      <path d="M16 3h5v5" />
      <path d="M21 3l-7 7" />
    </svg>
  );
}

const GLOBAL_ITEMS: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    key: "audits",
    label: "Auditorias",
    href: "/audits",
    icon: <AuditIcon />,
  },
  {
    key: "new-batch",
    label: "Novo Lote",
    href: "/dashboard?newBatch=1",
    icon: <PlusIcon />,
  },
  {
    key: "batches",
    label: "Lotes",
    href: "/dashboard#lotes-recentes",
    icon: <FilesIcon />,
  },
];

function SidebarLink({ item, isActive }: { item: SidebarItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
        isActive
          ? "border-r-[3px] border-indigo-600 bg-indigo-50 text-indigo-600"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export function AppSidebar({ activeItem, contextualItems = [] }: AppSidebarProps) {
  return (
    <aside className="relative z-20 hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
      <div className="flex h-16 items-center justify-center border-b border-slate-200 px-6">
        <Image
          src="/ui/logo-ccf.png"
          alt="CCF"
          width={2816}
          height={1536}
          priority
          className="block h-auto w-[128px] max-w-full object-contain"
        />
      </div>

      <nav className="px-4 py-4">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Menu Principal</p>
        <div className="space-y-0.5">
          {GLOBAL_ITEMS.map((item) => (
            <SidebarLink key={item.key} item={item} isActive={item.key === activeItem} />
          ))}
        </div>

        {contextualItems.length > 0 ? (
          <div className="mt-3 space-y-0.5 border-t border-slate-200 pt-3">
            {contextualItems.map((item) => (
              <SidebarLink key={item.key} item={item} isActive={item.key === activeItem} />
            ))}
          </div>
        ) : null}
      </nav>

      <div className="mt-auto border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
        CCF v1.0
      </div>
    </aside>
  );
}
