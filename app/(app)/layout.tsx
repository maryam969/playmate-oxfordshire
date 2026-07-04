"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Plus, Search, User } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/groups/football", label: "Groups" },
  { href: "/create-game", label: "Create", special: true },
  { href: "/explore", label: "Explore" },
  { href: "/profile", label: "Profile" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1a1a1a]">
      <div className="mx-auto min-h-screen max-w-[480px] px-4 pb-[calc(64px+env(safe-area-inset-bottom)+12px)]">
        <main className="min-h-[calc(100vh-56px-64px)] overflow-y-auto pb-8 pt-4">{children}</main>
      </div>

      <nav className="fixed left-1/2 bottom-0 z-50 flex w-full max-w-[480px] -translate-x-1/2 items-center justify-between border-t border-slate-200 bg-white px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          if (item.special) {
            return (
              <Link key={item.href} href={item.href} className="relative -mt-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/20 ring-4 ring-white transition hover:bg-emerald-600">
                <Plus size={24} strokeWidth={2} />
              </Link>
            );
          }

          const Icon =
            item.href === "/dashboard"
              ? Home
              : item.href === "/groups/football"
              ? MessageCircle
              : item.href === "/explore"
              ? Search
              : User;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center gap-1 text-[11px] transition ${
                active ? "text-[#1D9E75]" : "text-slate-400"
              }`}
            >
              <Icon size={22} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
