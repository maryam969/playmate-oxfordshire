"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { getSportIcon } from "@/lib/sport-icons";
import { getUnreadCountsForUser, SPORTS, type SportSlug } from "@/lib/unread";

const sportGroups = SPORTS.map((sport) => ({
  ...sport,
  members:
    sport.slug === "football"
      ? 142
      : sport.slug === "tennis"
      ? 78
      : sport.slug === "basketball"
      ? 55
      : sport.slug === "badminton"
      ? 41
      : 29,
  href: `/groups/${sport.slug}`,
}));

const emptyUnreadBySport: Record<SportSlug, number> = {
  football: 0,
  tennis: 0,
  basketball: 0,
  badminton: 0,
  padel: 0,
};

export default function GroupsPage() {
  const [unreadBySport, setUnreadBySport] = useState<Record<SportSlug, number>>(emptyUnreadBySport);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const loadUnreadCounts = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setUnreadBySport(emptyUnreadBySport);
        return;
      }

      const { bySport } = await getUnreadCountsForUser(supabase, userData.user.id);
      setUnreadBySport(bySport);
    };

    loadUnreadCounts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 pb-[calc(64px+env(safe-area-inset-bottom)+12px)] pt-4 text-[#1a1a1a]">
      <div className="mx-auto max-w-[480px] space-y-4 pb-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold text-slate-950">Sport Groups</p>
              <p className="mt-1 text-sm text-slate-500">Browse and join the active sports communities.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sportGroups.map((group) => {
            const SportIcon = getSportIcon(group.label);
            const unreadCount = unreadBySport[group.slug] ?? 0;

            return (
              <Link
                key={group.label}
                href={group.href}
                className="block rounded-xl border border-slate-200 bg-white px-4 py-4 transition hover:border-[#D1FAE5] hover:bg-[#F8FFFB]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECFDF5]">
                    <SportIcon size={24} className="text-[#1D9E75]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[18px] font-semibold text-slate-950">{group.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{group.members} members</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 ? (
                      <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    ) : null}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
