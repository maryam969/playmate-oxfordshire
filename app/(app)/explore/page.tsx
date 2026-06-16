"use client";

import { useMemo, useState } from "react";

const filters = ["All", "Football", "Tennis", "Basketball", "Badminton", "Padel"];

const games = [
  {
    id: 1,
    sport: "Football",
    emoji: "⚽",
    title: "Saturday Kickoff",
    host: "Hosted by Harry",
    date: "Sat, 15 Jun",
    time: "18:00",
    venue: "Tilsley Park",
    spotsLeft: 6,
    players: ["JL", "RM", "ES", "MK"],
  },
  {
    id: 2,
    sport: "Tennis",
    emoji: "🎾",
    title: "Sunday Doubles",
    host: "Hosted by Priya",
    date: "Sun, 16 Jun",
    time: "11:30",
    venue: "University Parks",
    spotsLeft: 2,
    players: ["AC", "TB", "LF"],
  },
  {
    id: 3,
    sport: "Basketball",
    emoji: "🏀",
    title: "Wednesday League Match",
    host: "Hosted by Mark",
    date: "Wed, 19 Jun",
    time: "20:00",
    venue: "Blackbird Leys",
    spotsLeft: 4,
    players: ["ZM", "JW", "SM", "KH"],
  },
  {
    id: 4,
    sport: "Badminton",
    emoji: "🏸",
    title: "Midweek Smash",
    host: "Hosted by Naomi",
    date: "Thu, 20 Jun",
    time: "19:00",
    venue: "Spendlove Centre",
    spotsLeft: 5,
    players: ["LV", "NX", "RB"],
  },
  {
    id: 5,
    sport: "Padel",
    emoji: "🥎",
    title: "Weekend Rally",
    host: "Hosted by Dan",
    date: "Sat, 22 Jun",
    time: "14:00",
    venue: "Oxford Brookes",
    spotsLeft: 3,
    players: ["YA", "KS"],
  },
  {
    id: 6,
    sport: "Football",
    emoji: "⚽",
    title: "Friendly Match",
    host: "Hosted by Sarah",
    date: "Fri, 21 Jun",
    time: "17:30",
    venue: "Ferry Sports Centre",
    spotsLeft: 8,
    players: ["GA", "HB", "JL", "SR"],
  },
];

export default function ExplorePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesFilter = selectedFilter === "All" || game.sport === selectedFilter;
      const matchesSearch =
        searchTerm.trim() === "" ||
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.venue.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [selectedFilter, searchTerm]);

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

        <div className="space-y-4">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => {
              const fewSpots = game.spotsLeft <= 3;
              return (
                <div key={game.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl">{game.emoji}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{game.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{game.host}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fewSpots ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {game.spotsLeft} spots left
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">📅 {game.date}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">🕐 {game.time}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">📍 {game.venue}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex -space-x-2">
                      {game.players.slice(0, 3).map((player) => (
                        <div key={player} className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-[#E6F6EE] text-xs font-semibold text-[#047857]">
                          {player}
                        </div>
                      ))}
                      {game.players.length > 3 && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-100 text-xs font-semibold text-slate-500">
                          +{game.players.length - 3}
                        </div>
                      )}
                    </div>
                    <button className="rounded-full bg-[#1D9E75] px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600">
                      Join
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
              <p className="text-base font-semibold text-slate-900">No games found</p>
              <p className="mt-2 text-sm">Try a different filter or search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
