"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";

const emojiBySport: Record<string, string> = {
  Football: "⚽",
  Tennis: "🎾",
  Basketball: "🏀",
  Badminton: "🏸",
  Padel: "🥎",
};

type DashboardGame = {
  id: string;
  sport: string;
  title: string;
  date: string;
  start_time: string;
  venue: string;
  current_players: number;
  max_players: number;
};

export default function DashboardPage() {
  const [name, setName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(true);
  const [gamesCount, setGamesCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [upcomingGames, setUpcomingGames] = useState<DashboardGame[]>([]);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const loadDashboardData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setLoadingName(false);
        return;
      }

      const metadata = userData.user.user_metadata as {
        full_name?: string;
        name?: string;
      } | undefined;

      const profileName = metadata?.full_name ?? metadata?.name ?? null;
      if (profileName) {
        setName(profileName);
      } else if (userData.user.email) {
        setName(userData.user.email.split("@")[0]);
      }

      const today = new Date().toISOString().split("T")[0];

      const [{ count: joinedCount }, { data: joinedGamesData, error: gamesError }, { count: upcomingCountValue }] = await Promise.all([
        supabase.from("game_players").select("*", { count: "exact", head: true }).eq("user_id", userData.user.id),
        supabase
          .from("games")
          .select("id, sport, title, date, start_time, venue, current_players, max_players")
          .in("id", (await supabase.from("game_players").select("game_id").eq("user_id", userData.user.id)).data?.map((row) => row.game_id) ?? [])
          .order("date", { ascending: true })
          .limit(3),
        supabase
          .from("games")
          .select("*", { count: "exact", head: true })
          .gte("date", today)
          .in("id", (await supabase.from("game_players").select("game_id").eq("user_id", userData.user.id)).data?.map((row) => row.game_id) ?? []),
      ]);

      setGamesCount(joinedCount ?? 0);
      setUpcomingCount(upcomingCountValue ?? 0);
      setUpcomingGames((joinedGamesData as DashboardGame[]) ?? []);
      setLoadingName(false);
    };

    loadDashboardData();
  }, []);

  const greeting = loadingName || !name ? "Good morning 👋" : `Good morning, ${name} 👋`;
  const statsChips = [
    { label: `${gamesCount} Games` },
    { label: `${upcomingCount} Upcoming` },
    { label: "0 Friends" },
  ];

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="space-y-2">
          <p className="text-[22px] font-semibold text-slate-950">{greeting}</p>
          <p className="text-sm text-slate-500">Ready to play today?</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Your activity</p>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#1D9E75]">Live</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {statsChips.map((chip) => (
            <div key={chip.label} className="min-w-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">{chip.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Your upcoming games</p>
            <p className="text-xs text-slate-500">Plan ahead and join the fun</p>
          </div>
          <Link href="/explore" className="text-sm font-semibold text-[#1D9E75]">
            See all
          </Link>
        </div>

        <div className="space-y-3">
          {upcomingGames.length > 0 ? (
            upcomingGames.map((game) => {
              const spotsLeft = Math.max(game.max_players - game.current_players, 0);
              return (
                <article key={game.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECF8F2] text-xl">
                        {emojiBySport[game.sport] ?? "🎉"}
                      </div>
                      <span className="rounded-full bg-[#DEF7ED] px-3 py-1 text-xs font-semibold text-[#0F6E56]">
                        {game.sport}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{game.date}</span>
                  </div>

                  <h2 className="mt-4 text-base font-semibold text-slate-950">{game.title}</h2>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                      <span>🕐</span>
                      <span>{game.start_time}</span>
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                      <span>📍</span>
                      <span>{game.venue}</span>
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-slate-500">
                      {game.current_players}/{game.max_players} players · {spotsLeft} spots left
                    </span>
                    <Link href="/explore" className="rounded-2xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
                      View
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              <p className="font-semibold text-slate-900">No upcoming games — find one in Explore!</p>
              <Link href="/explore" className="mt-2 inline-flex font-semibold text-[#1D9E75]">
                Explore games
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/create-game" className="rounded-2xl border border-dashed border-[#1D9E75] bg-white px-4 py-5 text-center text-sm font-semibold text-[#1D9E75] transition hover:bg-[#ECF8F0]">
          <div className="text-xl">➕</div>
          <div className="mt-2">Create Game</div>
        </Link>
        <Link href="/explore" className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-semibold text-slate-700 transition hover:border-[#1D9E75] hover:text-[#1D9E75]">
          <div className="text-xl">🔍</div>
          <div className="mt-2">Find Games</div>
        </Link>
      </section>
    </div>
  );
}

