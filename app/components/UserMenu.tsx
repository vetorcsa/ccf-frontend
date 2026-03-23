"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearAccessToken } from "../lib/auth";

type UserMenuProps = {
  name: string;
  initials: string;
};

export function UserMenu({ name, initials }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleLogout() {
    setIsOpen(false);
    clearAccessToken();
    router.replace("/");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="inline-flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 transition hover:bg-slate-100"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Abrir menu do usuário"
      >
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0e2f4f] text-[11px] font-semibold text-white">
          {initials}
        </div>
        <div className="hidden items-center gap-1 lg:flex">
          <p className="text-xs font-medium text-slate-800">{name}</p>
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[140px] rounded-md border border-slate-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center rounded-md px-2.5 py-2 text-left text-xs font-medium text-rose-700 transition hover:bg-rose-50"
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
