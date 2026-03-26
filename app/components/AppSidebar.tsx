"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type SidebarKey = "dashboard" | "new-batch" | "batches";

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

const GLOBAL_ITEMS: SidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon />,
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
      className={`flex h-10 cursor-pointer items-center gap-2.5 rounded-md px-3.5 text-sm font-medium transition ${
        isActive
          ? "bg-[#1f476d] text-white"
          : "text-slate-200 hover:bg-white/10 hover:text-white"
      }`}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export function AppSidebar({ activeItem, contextualItems = [] }: AppSidebarProps) {
  return (
    <aside className="hidden w-[250px] shrink-0 flex-col border-r border-slate-900/30 bg-[#0e2f4f] text-slate-200 lg:flex">
      <div className="flex h-16 items-center justify-center border-b border-white/10 px-5">
        <Image
          src="/ui/logo-ccf.png"
          alt="CCF"
          width={2816}
          height={1536}
          priority
          className="block h-auto w-[112px] max-w-full object-contain"
        />
      </div>

      <nav className="px-2 py-4">
        <div className="space-y-1.5">
          {GLOBAL_ITEMS.map((item) => (
            <SidebarLink key={item.key} item={item} isActive={item.key === activeItem} />
          ))}
        </div>

        {contextualItems.length > 0 ? (
          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
            {contextualItems.map((item) => (
              <SidebarLink key={item.key} item={item} isActive={item.key === activeItem} />
            ))}
          </div>
        ) : null}
      </nav>

      <div className="mt-auto border-t border-white/10 px-5 py-3.5 text-xs text-slate-300/80">
        CCF v1.0 - MVP
      </div>
    </aside>
  );
}
