"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";

const filters = ["All", "Football", "Tennis", "Basketball", "Badminton", "Padel"];

const emojiBySport: Record<string, string> = {
  Football: "⚽",
  Tennis: "🎾",
  Basketball: "🏀",
  Badminton: "🏸",
  Padel: "🥎",
};

type GameRow = {
  id: string;
  sport: string;
  title: string;
  date: string;
  start_time: string;
  venue: string;
  current_players: number;
  max_players: number;
};

export default function ExplorePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<GameRow[]>([]);
  const [joinedGameIds, setJoinedGameIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const loadGames = async () => {
      const supabase = createSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select("id, sport, title, date, start_time, venue, current_players, max_players")
        .order("date", { ascending: true });

      if (gamesError) {
        setGames([]);
        setLoading(false);
        return;
      }

      if (user) {
        const { data: joinedData } = await supabase
          .from("game_players")
          .select("game_id")
          .eq("user_id", user.id);

        setJoinedGameIds((joinedData ?? []).map((row) => row.game_id));
      }

      setGames(gamesData ?? []);
      setLoading(false);
    };

    loadGames();
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesFilter = selectedFilter === "All" || game.sport === selectedFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.venue.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [games, selectedFilter, searchTerm]);

  const handleJoin = async (game: GameRow) => {
    const supabase = createSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setJoinError("You need to be signed in to join a game.");
      return;
    }

    if (joinedGameIds.includes(game.id)) {
      return;
    }

    setJoiningGameId(game.id);
    setJoinError("");

    const { error: joinError } = await supabase.from("game_players").insert({
      game_id: game.id,
      user_id: userData.user.id,
    });

    if (joinError) {
      setJoinError(joinError.message);
      setJoiningGameId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("games")
      .update({ current_players: game.current_players + 1 })
      .eq("id", game.id);

    if (updateError) {
      setJoinError(updateError.message);
      setJoiningGameId(null);
      return;
    }

    setJoinedGameIds((current) => [...current, game.id]);
    setGames((current) =>
      current.map((item) => (item.id === game.id ? { ...item, current_players: item.current_players + 1 } : item))
    );
    setJoiningGameId(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 pb-[calc(64px+env(safe-area-inset-bottom)+12px)] pt-4 text-[#1a1a1a]">
      <div className="mx-auto max-w-[480px] space-y-5 pb-6">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-950">Explore Games</p>
          <p className="text-sm text-slate-500">Search Oxfordshire games and join the community.</p>
        </div>

        <div className="rounded-3xl bg-white px-4 py-3 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 rounded-3xl bg-slate-100 px-3 py-2">
            <span className="text-slate-400">🔍</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search games, venues, teams"
              className="w-full bg-transparent text-sm text-[#1a1a1a] outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const active = selectedFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-[#1D9E75] text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {joinError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {joinError}
          </div>
        ) : null}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
              <p className="text-base font-semibold text-slate-900">Loading games…</p>
            </div>
          ) : filteredGames.length > 0 ? (
            filteredGames.map((game) => {
              const joined = joinedGameIds.includes(game.id);
              const spotsLeft = Math.max(game.max_players - game.current_players, 0);
              const fewSpots = spotsLeft <= 3;
              return (
                <div key={game.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                        {emojiBySport[game.sport] ?? "🎉"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{game.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{game.sport}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fewSpots ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {spotsLeft} spots left
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">📅 {game.date}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">🕐 {game.start_time}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">📍 {game.venue}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-500">
                      {game.current_players}/{game.max_players} players
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJoin(game)}
                      disabled={joined || joiningGameId === game.id}
                      className="rounded-full bg-[#1D9E75] px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {joined ? "Joined" : joiningGameId === game.id ? "Joining..." : "Join"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
              <p className="text-base font-semibold text-slate-900">No games yet — be the first to create one!</p>
              <Link href="/create-game" className="mt-3 inline-flex text-sm font-semibold text-[#1D9E75]">
                Create a game
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
