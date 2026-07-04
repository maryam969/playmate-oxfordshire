"use client";

import dynamic from "next/dynamic";
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
  pitch_cost: number;
  is_booked: boolean;
  booking_url: string | null;
  current_players: number;
  max_players: number;
  created_by: string | null;
  creator_name: string | null;
};
type GeocodeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; lat: number; lng: number };

const VenueLeafletMap = dynamic(() => import("@/components/maps/venue-leaflet-map"), {
  ssr: false,
  loading: () => <p className="text-xs text-slate-500">Loading map...</p>,
});

export default function ExplorePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<GameRow[]>([]);
  const [joinedGameIds, setJoinedGameIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [geocodeByVenue, setGeocodeByVenue] = useState<Record<string, GeocodeState>>({});
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const loadGames = async () => {
      const supabase = createSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      const result = await supabase
        .from("games")
        .select("id, sport, title, date, start_time, venue, pitch_cost, is_booked, booking_url, current_players, max_players, creator_name, created_by")
        .order("date", { ascending: true });

      if (result.error) {
        setGames([]);
        setLoading(false);
        return;
      }

      const gameRows = (result.data ?? []) as GameRow[];

      if (user) {
        const { data: joinedData } = await supabase
          .from("game_players")
          .select("game_id")
          .eq("user_id", user.id);

        setJoinedGameIds((joinedData ?? []).map((row) => row.game_id));
      }

      setGames(gameRows);
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

  const loadVenueCoordinates = async (venue: string) => {
    setGeocodeByVenue((current) => ({ ...current, [venue]: { status: "loading" } }));

    try {
      const query = `${venue}, Oxford`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      );

      if (!response.ok) {
        setGeocodeByVenue((current) => ({ ...current, [venue]: { status: "error" } }));
        return;
      }

      const result = (await response.json()) as Array<{ lat: string; lon: string }>;
      if (!result[0]) {
        setGeocodeByVenue((current) => ({ ...current, [venue]: { status: "error" } }));
        return;
      }

      setGeocodeByVenue((current) => ({
        ...current,
        [venue]: { status: "success", lat: Number(result[0].lat), lng: Number(result[0].lon) },
      }));
    } catch {
      setGeocodeByVenue((current) => ({ ...current, [venue]: { status: "error" } }));
    }
  };

  const handleMapToggle = (game: GameRow) => {
    setExpandedGameId((current) => {
      if (current === game.id) return null;
      return game.id;
    });

    const currentGeocode = geocodeByVenue[game.venue];
    if (!currentGeocode || currentGeocode.status === "idle" || currentGeocode.status === "error") {
      loadVenueCoordinates(game.venue);
    }
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
              const hostName = game.creator_name || "Unknown Host";
              const hostInitial = hostName.trim() ? hostName.trim().charAt(0).toUpperCase() : "U";
              const geocodeState = geocodeByVenue[game.venue];
              const encodedVenue = encodeURIComponent(`${game.venue}, Oxford`);
              const hasCoords = geocodeState?.status === "success";
              const googleUrl = hasCoords
                ? `https://www.google.com/maps/search/?api=1&query=${geocodeState.lat},${geocodeState.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodedVenue}`;
              const appleUrl = hasCoords
                ? `https://maps.apple.com/?ll=${geocodeState.lat},${geocodeState.lng}`
                : `https://maps.apple.com/?q=${encodedVenue}`;
              const wazeUrl = hasCoords
                ? `https://waze.com/ul?ll=${geocodeState.lat},${geocodeState.lng}&navigate=yes`
                : `https://waze.com/ul?q=${encodedVenue}`;
              return (
                <div
                  key={game.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                >
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
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fewSpots ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {spotsLeft} spots left
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          game.is_booked ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {game.is_booked ? "Pitch booked ✓" : "Pitch not booked yet"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">📅 {game.date}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">🕐 {game.start_time}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">📍 {game.venue}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMapToggle(game)}
                    className="mt-3 text-sm font-semibold text-[#1D9E75]"
                  >
                    {expandedGameId === game.id ? "Hide map" : "See map"}
                  </button>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Directions:</span>
                    <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#1D9E75] hover:underline">
                      Google Maps
                    </a>
                    <a href={appleUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#1D9E75] hover:underline">
                      Apple Maps
                    </a>
                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#1D9E75] hover:underline">
                      Waze
                    </a>
                  </div>

                  {game.pitch_cost > 0 ? (
                    <p className="mt-3 text-sm text-slate-600">
                      £{game.pitch_cost} total · £{(game.pitch_cost / game.max_players).toFixed(2)} each
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center gap-2">
                    <div
                      title={hostName}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D9E75] text-[10px] font-semibold text-white"
                    >
                      {hostInitial}
                    </div>
                    <p className="text-xs text-slate-600">Hosted by {hostName}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-500">
                      {game.current_players}/{game.max_players} players
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleJoin(game);
                      }}
                      disabled={joined || joiningGameId === game.id}
                      className="rounded-full bg-[#1D9E75] px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {joined ? "Joined" : joiningGameId === game.id ? "Joining..." : "Join"}
                    </button>
                  </div>

                  {expandedGameId === game.id ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                      {geocodeState?.status === "loading" ? (
                        <p className="px-2 py-4 text-sm text-slate-500">Finding location...</p>
                      ) : geocodeState?.status === "success" ? (
                        <VenueLeafletMap
                          lat={geocodeState.lat}
                          lng={geocodeState.lng}
                          title={game.venue}
                        />
                      ) : (
                        <p className="px-2 py-4 text-sm text-slate-500">Location not found</p>
                      )}
                    </div>
                  ) : null}
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
