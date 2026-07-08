"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";
import { Clock3, MapPin } from "lucide-react";
import { getSportIcon } from "@/lib/sport-icons";

type DashboardGameRow = {
  id: string;
  sport: string;
  title: string;
  status: string | null;
  date: string;
  start_time: string;
  venue: string;
  current_players: number;
  max_players: number;
  created_by: string | null;
};

type DashboardGame = DashboardGameRow & {
  isHost: boolean;
  startsAt: Date;
};

const joiningCutoffInMs = 24 * 60 * 60 * 1000;

function toGameStart(date: string, startTime: string): Date {
  return new Date(`${date}T${startTime}`);
}

function getGreetingByHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getCountdownLabel(startsAt: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const gameDay = new Date(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate());
  const diffDays = Math.floor((gameDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays} days`;
}

export default function DashboardPage() {
  const [firstName, setFirstName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [myGames, setMyGames] = useState<DashboardGame[]>([]);
  const [discoverGames, setDiscoverGames] = useState<DashboardGame[]>([]);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const loadDashboardData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .single();

      setFirstName(profileData?.first_name ?? "");

      const { data: joinedRows } = await supabase
        .from("game_players")
        .select("game_id")
        .eq("user_id", userId);

      const joinedGameIds = (joinedRows ?? []).map((row) => row.game_id as string);

      const [hostedGamesResult, joinedGamesResult, discoverResult] = await Promise.all([
        supabase
          .from("games")
          .select("id, sport, title, status, date, start_time, venue, current_players, max_players, created_by")
          .eq("status", "active")
          .eq("created_by", userId),
        joinedGameIds.length > 0
          ? supabase
              .from("games")
              .select("id, sport, title, status, date, start_time, venue, current_players, max_players, created_by")
              .eq("status", "active")
              .in("id", joinedGameIds)
          : Promise.resolve({ data: [] as DashboardGameRow[], error: null }),
        supabase
          .from("games")
          .select("id, sport, title, status, date, start_time, venue, current_players, max_players, created_by")
          .eq("status", "active")
          .order("date", { ascending: true }),
      ]);

      const now = new Date();

      const mergedById = new Map<string, DashboardGame>();
      const myGameCandidates = [
        ...((hostedGamesResult.data ?? []) as DashboardGameRow[]),
        ...((joinedGamesResult.data ?? []) as DashboardGameRow[]),
      ];

      myGameCandidates.forEach((game) => {
        const startsAt = toGameStart(game.date, game.start_time);
        if (game.status !== "active" || startsAt.getTime() < now.getTime()) {
          return;
        }

        const existing = mergedById.get(game.id);
        const isHost = game.created_by === userId;

        if (!existing) {
          mergedById.set(game.id, { ...game, isHost, startsAt });
          return;
        }

        if (!existing.isHost && isHost) {
          mergedById.set(game.id, { ...existing, isHost: true });
        }
      });

      const myGamesList = Array.from(mergedById.values()).sort(
        (a, b) => a.startsAt.getTime() - b.startsAt.getTime()
      );

      const myGameIds = new Set(myGamesList.map((game) => game.id));

      const discoverList = ((discoverResult.data ?? []) as DashboardGameRow[])
        .map((game) => ({
          ...game,
          startsAt: toGameStart(game.date, game.start_time),
          isHost: game.created_by === userId,
        }))
        .filter((game) => {
          if (game.status !== "active") return false;
          if (game.startsAt.getTime() < now.getTime()) return false;
          if (myGameIds.has(game.id)) return false;
          if (game.created_by === userId) return false;
          if (game.current_players >= game.max_players) return false;
          if (game.startsAt.getTime() - now.getTime() <= joiningCutoffInMs) return false;
          return true;
        })
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
        .slice(0, 3);

      setMyGames(myGamesList);
      setDiscoverGames(discoverList);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const greeting = `${getGreetingByHour(new Date().getHours())}, ${firstName || "there"} 👋`;
  const hostingCount = myGames.filter((game) => game.isHost).length;
  const nextGame = myGames[0] ?? null;
  const remainingGames = nextGame ? myGames.slice(1) : [];

  const statsChips = [
    { label: `${myGames.length} Games` },
    { label: `${hostingCount} Hosting` },
    { label: "0 Friends" },
  ];

  return (
    <div className="space-y-6 pb-[90px]">
      <section className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="space-y-2">
          <p className="text-[22px] font-semibold text-slate-950">{loading ? "Hello 👋" : greeting}</p>
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

      {nextGame ? (
        <section className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Your next game</p>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECF8F2]">
                  {(() => {
                    const SportIcon = getSportIcon(nextGame.sport);
                    return <SportIcon size={24} className="text-[#1D9E75]" aria-hidden="true" />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{nextGame.sport}</span>
                    {nextGame.isHost ? (
                      <span className="rounded-full bg-[#DEF7ED] px-2 py-0.5 text-[11px] font-semibold text-[#0F6E56]">
                        Hosting
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-base font-semibold text-slate-950">{nextGame.title}</p>
                </div>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1D9E75]">
                {getCountdownLabel(nextGame.startsAt)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                <Clock3 size={14} />
                {nextGame.start_time}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                <MapPin size={14} />
                {nextGame.venue}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-slate-600">
                {nextGame.current_players}/{nextGame.max_players} players · {Math.max(nextGame.max_players - nextGame.current_players, 0)} spots left
              </span>
              <Link href="/explore" className="rounded-2xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
                View
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      {myGames.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-900">No upcoming games yet</p>
          <p className="mt-1 text-sm text-slate-500">Find a game to join or host your own.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/explore" className="rounded-2xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
              Find a game to join
            </Link>
            <Link href="/create-game" className="rounded-2xl border border-[#1D9E75] bg-white px-4 py-2.5 text-sm font-semibold text-[#1D9E75] transition hover:bg-[#ECF8F0]">
              Host a game
            </Link>
          </div>
        </section>
      ) : null}

      {remainingGames.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Your games</p>
            <Link href="/explore" className="text-sm font-semibold text-[#1D9E75]">
              See all
            </Link>
          </div>

          <div className="space-y-3">
            {remainingGames.map((game) => {
              const spotsLeft = Math.max(game.max_players - game.current_players, 0);
              const SportIcon = getSportIcon(game.sport);

              return (
                <article key={game.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECF8F2]">
                        <SportIcon size={22} className="text-[#1D9E75]" aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#DEF7ED] px-3 py-1 text-xs font-semibold text-[#0F6E56]">
                          {game.sport}
                        </span>
                        {game.isHost ? (
                          <span className="rounded-full bg-[#ECF8F2] px-2 py-0.5 text-[11px] font-semibold text-[#1D9E75]">
                            Hosting
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {game.startsAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-semibold text-slate-950">{game.title}</h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                      <Clock3 size={14} />
                      {game.start_time}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                      <MapPin size={14} />
                      {game.venue}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500">
                      {game.current_players}/{game.max_players} players · {spotsLeft} spots left
                    </span>
                    <Link href="/explore" className="rounded-2xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
                      View
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {discoverGames.length > 0 ? (
        <section className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Games near you this week</p>
            <p className="text-xs text-slate-500">Open games you can join</p>
          </div>
          <div className="space-y-3">
            {discoverGames.map((game) => {
              const SportIcon = getSportIcon(game.sport);
              const spotsLeft = Math.max(game.max_players - game.current_players, 0);

              return (
                <article key={game.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ECF8F2]">
                        <SportIcon size={20} className="text-[#1D9E75]" aria-hidden="true" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{game.sport}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {game.startsAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {game.start_time}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">{game.venue}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500">{spotsLeft} spots left</span>
                    <Link href="/explore" className="rounded-2xl bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600">
                      Join
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

