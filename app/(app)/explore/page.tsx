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
  current_players: number;
  max_players: number;
  host_user_id: string | null;
  host_profile: ProfileSummary | null;
};

type ProfileSummary = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type GamePlayersMap = Record<string, ProfileSummary[]>;
type GeocodeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; lat: number; lng: number };

const VenueLeafletMap = dynamic(() => import("@/components/maps/venue-leaflet-map"), {
  ssr: false,
  loading: () => <p className="text-xs text-slate-500">Loading map...</p>,
});

const getInitials = (name: string | null | undefined) => {
  const normalized = (name ?? "").trim();
  if (!normalized) return "U";
  return normalized
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function ExplorePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState<GameRow[]>([]);
  const [joinedGameIds, setJoinedGameIds] = useState<string[]>([]);
  const [gamePlayersByGame, setGamePlayersByGame] = useState<GamePlayersMap>({});
  const [loading, setLoading] = useState(true);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [geocodeByGameId, setGeocodeByGameId] = useState<Record<string, GeocodeState>>({});
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const loadGames = async () => {
      const supabase = createSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      type RawGameCreatedBy = {
        id: string;
        sport: string;
        title: string;
        date: string;
        start_time: string;
        venue: string;
        current_players: number;
        max_players: number;
        created_by: string | null;
      };

      type RawGameUserId = {
        id: string;
        sport: string;
        title: string;
        date: string;
        start_time: string;
        venue: string;
        current_players: number;
        max_players: number;
        user_id: string | null;
      };

      let hostKey: "created_by" | "user_id" = "created_by";
      let baseGames: Array<{
        id: string;
        sport: string;
        title: string;
        date: string;
        start_time: string;
        venue: string;
        current_players: number;
        max_players: number;
        host_user_id: string | null;
      }> = [];

      const createdByResult = await supabase
        .from("games")
        .select("id, sport, title, date, start_time, venue, current_players, max_players, created_by")
        .order("date", { ascending: true });

      if (!createdByResult.error && createdByResult.data) {
        const rows = createdByResult.data as RawGameCreatedBy[];
        baseGames = rows.map((row) => ({
          id: row.id,
          sport: row.sport,
          title: row.title,
          date: row.date,
          start_time: row.start_time,
          venue: row.venue,
          current_players: row.current_players,
          max_players: row.max_players,
          host_user_id: row.created_by,
        }));
      } else {
        hostKey = "user_id";
        const userIdResult = await supabase
          .from("games")
          .select("id, sport, title, date, start_time, venue, current_players, max_players, user_id")
          .order("date", { ascending: true });

        if (userIdResult.error || !userIdResult.data) {
          setGames([]);
          setLoading(false);
          return;
        }

        const rows = userIdResult.data as RawGameUserId[];
        baseGames = rows.map((row) => ({
          id: row.id,
          sport: row.sport,
          title: row.title,
          date: row.date,
          start_time: row.start_time,
          venue: row.venue,
          current_players: row.current_players,
          max_players: row.max_players,
          host_user_id: row.user_id,
        }));
      }

      const hostIds = Array.from(new Set(baseGames.map((game) => game.host_user_id).filter(Boolean))) as string[];
      let hostProfileById: Record<string, ProfileSummary> = {};

      if (hostIds.length > 0) {
        const { data: hostProfiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", hostIds);

        hostProfileById = (hostProfiles ?? []).reduce<Record<string, ProfileSummary>>((acc, profile) => {
          acc[profile.id] = profile as ProfileSummary;
          return acc;
        }, {});
      }

      const gameIds = baseGames.map((game) => game.id);
      let playersMap: GamePlayersMap = {};

      if (gameIds.length > 0) {
        const { data: gamePlayersData } = await supabase
          .from("game_players")
          .select("game_id, user_id")
          .in("game_id", gameIds);

        const playerUserIds = Array.from(
          new Set((gamePlayersData ?? []).map((row) => row.user_id).filter(Boolean))
        ) as string[];

        let playerProfileById: Record<string, ProfileSummary> = {};
        if (playerUserIds.length > 0) {
          const { data: playerProfiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", playerUserIds);

          playerProfileById = (playerProfiles ?? []).reduce<Record<string, ProfileSummary>>((acc, profile) => {
            acc[profile.id] = profile as ProfileSummary;
            return acc;
          }, {});
        }

        playersMap = (gamePlayersData ?? []).reduce<GamePlayersMap>((acc, row) => {
          const profile = playerProfileById[row.user_id];
          if (!profile) return acc;
          const current = acc[row.game_id] ?? [];
          if (!current.some((existing) => existing.id === profile.id)) {
            acc[row.game_id] = [...current, profile];
          }
          return acc;
        }, {});
      }

      if (user) {
        const { data: joinedData } = await supabase
          .from("game_players")
          .select("game_id")
          .eq("user_id", user.id);

        setJoinedGameIds((joinedData ?? []).map((row) => row.game_id));
      }

      const mergedGames: GameRow[] = baseGames.map((game) => ({
        ...game,
        host_profile: game.host_user_id ? hostProfileById[game.host_user_id] ?? null : null,
      }));

      setGames(mergedGames);
      setGamePlayersByGame(playersMap);
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

  const loadVenueCoordinates = async (game: GameRow) => {
    setGeocodeByGameId((current) => ({ ...current, [game.id]: { status: "loading" } }));

    try {
      const query = `${game.venue}, Oxfordshire`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      );

      if (!response.ok) {
        setGeocodeByGameId((current) => ({ ...current, [game.id]: { status: "error" } }));
        return;
      }

      const result = (await response.json()) as Array<{ lat: string; lon: string }>;
      if (!result[0]) {
        setGeocodeByGameId((current) => ({ ...current, [game.id]: { status: "error" } }));
        return;
      }

      setGeocodeByGameId((current) => ({
        ...current,
        [game.id]: { status: "success", lat: Number(result[0].lat), lng: Number(result[0].lon) },
      }));
    } catch {
      setGeocodeByGameId((current) => ({ ...current, [game.id]: { status: "error" } }));
    }
  };

  const handleCardClick = (game: GameRow) => {
    setExpandedGameId((current) => {
      if (current === game.id) return null;
      return game.id;
    });

    const currentGeocode = geocodeByGameId[game.id];
    if (!currentGeocode || currentGeocode.status === "idle" || currentGeocode.status === "error") {
      loadVenueCoordinates(game);
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
              const hostName = game.host_profile?.full_name?.trim() || "Unknown Host";
              const hostAvatar = game.host_profile?.avatar_url || "";
              const joinedPlayers = gamePlayersByGame[game.id] ?? [];
              const visiblePlayers = joinedPlayers.slice(0, 4);
              const hiddenCount = Math.max(joinedPlayers.length - 4, 0);
              const geocodeState = geocodeByGameId[game.id];
              return (
                <div
                  key={game.id}
                  onClick={() => handleCardClick(game)}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer"
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
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fewSpots ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {spotsLeft} spots left
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">📅 {game.date}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">🕐 {game.start_time}</span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">📍 {game.venue}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {hostAvatar ? (
                      <img
                        src={hostAvatar}
                        alt={hostName}
                        title={hostName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        title={hostName}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D9E75] text-[10px] font-semibold text-white"
                      >
                        {getInitials(hostName)}
                      </div>
                    )}
                    <p className="text-xs text-slate-600">Hosted by {hostName}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500">
                        {game.current_players}/{game.max_players} players
                      </div>
                      {joinedPlayers.length > 0 ? (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {visiblePlayers.map((player) => {
                              const playerName = player.full_name?.trim() || "Player";
                              return player.avatar_url ? (
                                <img
                                  key={player.id}
                                  src={player.avatar_url}
                                  alt={playerName}
                                  title={playerName}
                                  className="h-6 w-6 rounded-full border-2 border-white object-cover"
                                />
                              ) : (
                                <div
                                  key={player.id}
                                  title={playerName}
                                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1D9E75] text-[9px] font-semibold text-white"
                                >
                                  {getInitials(playerName)}
                                </div>
                              );
                            })}
                          </div>
                          {hiddenCount > 0 ? (
                            <span className="text-xs text-slate-500">+{hiddenCount} more</span>
                          ) : null}
                        </div>
                      ) : null}
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
