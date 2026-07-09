"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, MoreVertical, Search } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";
import { getSportIcon } from "@/lib/sport-icons";

const filters = ["All", "Football", "Tennis", "Basketball", "Badminton", "Padel"];

type GameRow = {
  id: string;
  sport: string;
  title: string;
  match_type: string | null;
  date: string;
  start_time: string;
  venue: string;
  description: string | null;
  pitch_cost: number;
  is_booked: boolean;
  booking_url: string | null;
  current_players: number;
  max_players: number;
  created_by: string | null;
  creator_name: string | null;
  status: string | null;
};
type GeocodeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; lat: number; lng: number };

type WaitlistRow = {
  game_id: string;
  user_id: string;
  user_name: string | null;
};

const joiningCutoffInMs = 24 * 60 * 60 * 1000;

const VenueLeafletMap = dynamic(() => import("@/components/maps/venue-leaflet-map"), {
  ssr: false,
  loading: () => <p className="text-xs text-slate-500">Loading map...</p>,
});

export default function ExplorePage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState<GameRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [joinedGameIds, setJoinedGameIds] = useState<string[]>([]);
  const [waitlistedGameIds, setWaitlistedGameIds] = useState<string[]>([]);
  const [waitlistCounts, setWaitlistCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);
  const [leavingGameId, setLeavingGameId] = useState<string | null>(null);
  const [waitlistActionGameId, setWaitlistActionGameId] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [expandedDetailsGameId, setExpandedDetailsGameId] = useState<string | null>(null);
  const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null);
  const [geocodeByVenue, setGeocodeByVenue] = useState<Record<string, GeocodeState>>({});
  const [joinError, setJoinError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loadGames = async () => {
      const supabase = createSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      setCurrentUserId(user?.id ?? null);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        const resolvedName = profileData?.first_name
          ? `${profileData.first_name} ${profileData.last_name || ""}`.trim()
          : user.email?.split("@")[0] || "User";
        setCurrentUserName(resolvedName);
      } else {
        setCurrentUserName("");
      }

      let joinedIds: string[] = [];
      if (user) {
        const { data: joinedData } = await supabase
          .from("game_players")
          .select("game_id")
          .eq("user_id", user.id);

        joinedIds = (joinedData ?? []).map((row) => row.game_id);
        setJoinedGameIds(joinedIds);
      }

      const result = await supabase
        .from("games")
        .select("id, sport, title, match_type, date, start_time, venue, description, pitch_cost, is_booked, booking_url, current_players, max_players, creator_name, created_by, status")
        .neq("status", "cancelled")
        .order("date", { ascending: true });

      if (result.error) {
        setGames([]);
        setLoading(false);
        return;
      }

      const gameRows = (result.data ?? []) as GameRow[];
      const displayedGames = gameRows;

      if (user && joinedIds.length > 0) {
        const { data: cancelledJoinedGames } = await supabase
          .from("games")
          .select("id, sport, title, match_type, date, start_time, venue, description, pitch_cost, is_booked, booking_url, current_players, max_players, creator_name, created_by, status")
          .eq("status", "cancelled")
          .in("id", joinedIds);

        const merged = [...displayedGames, ...((cancelledJoinedGames ?? []) as GameRow[])];
        const deduped = Array.from(new Map(merged.map((game) => [game.id, game])).values());
        setGames(deduped);

        const gameIds = deduped.map((game) => game.id);
        if (gameIds.length > 0) {
          const { data: waitlistData } = await supabase
            .from("game_waitlist")
            .select("game_id, user_id, user_name")
            .in("game_id", gameIds);

          const counts: Record<string, number> = {};
          const userWaitlistIds: string[] = [];
          (waitlistData ?? []).forEach((row: WaitlistRow) => {
            counts[row.game_id] = (counts[row.game_id] ?? 0) + 1;
            if (row.user_id === user?.id) {
              userWaitlistIds.push(row.game_id);
            }
          });

          setWaitlistCounts(counts);
          setWaitlistedGameIds(userWaitlistIds);
        } else {
          setWaitlistCounts({});
          setWaitlistedGameIds([]);
        }
        setLoading(false);
        return;
      }

      setGames(displayedGames);

      if (user) {
        const gameIds = displayedGames.map((game) => game.id);
        if (gameIds.length > 0) {
          const { data: waitlistData } = await supabase
            .from("game_waitlist")
            .select("game_id, user_id, user_name")
            .in("game_id", gameIds);

          const counts: Record<string, number> = {};
          const userWaitlistIds: string[] = [];
          (waitlistData ?? []).forEach((row: WaitlistRow) => {
            counts[row.game_id] = (counts[row.game_id] ?? 0) + 1;
            if (row.user_id === user.id) {
              userWaitlistIds.push(row.game_id);
            }
          });

          setWaitlistCounts(counts);
          setWaitlistedGameIds(userWaitlistIds);
        } else {
          setWaitlistCounts({});
          setWaitlistedGameIds([]);
        }
      } else {
        setWaitlistCounts({});
        setWaitlistedGameIds([]);
      }
      setLoading(false);
    };

    loadGames();
  }, []);

  const filteredGames = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return games.filter((game) => {
      const matchesFilter = selectedFilter === "All" || game.sport === selectedFilter;
      const matchesSearch =
        normalizedQuery === "" ||
        [
          game.title,
          game.sport,
          game.venue,
          game.creator_name,
          game.match_type,
          game.description,
        ].some((field) => (field ?? "").toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesSearch;
    });
  }, [games, selectedFilter, searchQuery]);

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

    const gameStart = new Date(`${game.date}T${game.start_time}`);
    if (!Number.isFinite(gameStart.getTime()) || gameStart.getTime() - now < joiningCutoffInMs) {
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

  const handleJoinWaitlist = async (game: GameRow) => {
    const supabase = createSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setJoinError("You need to be signed in to join the waitlist.");
      return;
    }

    if (joinedGameIds.includes(game.id) || waitlistedGameIds.includes(game.id) || game.created_by === userData.user.id || game.status === "cancelled") {
      return;
    }

    const gameStart = new Date(`${game.date}T${game.start_time}`);
    if (!Number.isFinite(gameStart.getTime()) || gameStart.getTime() - now < joiningCutoffInMs) {
      return;
    }

    setWaitlistActionGameId(game.id);
    setJoinError("");

    const { error: waitlistError } = await supabase.from("game_waitlist").insert({
      game_id: game.id,
      user_id: userData.user.id,
      user_name: currentUserName || userData.user.email?.split("@")[0] || "User",
    });

    if (waitlistError) {
      setJoinError(waitlistError.message);
      setWaitlistActionGameId(null);
      return;
    }

    setWaitlistedGameIds((current) => [...current, game.id]);
    setWaitlistCounts((current) => ({
      ...current,
      [game.id]: (current[game.id] ?? 0) + 1,
    }));
    setWaitlistActionGameId(null);
  };

  const handleLeaveWaitlist = async (game: GameRow) => {
    const supabase = createSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return;
    }

    if (!waitlistedGameIds.includes(game.id)) {
      return;
    }

    setWaitlistActionGameId(game.id);
    setJoinError("");

    const { error: waitlistError } = await supabase
      .from("game_waitlist")
      .delete()
      .eq("game_id", game.id)
      .eq("user_id", userData.user.id);

    if (waitlistError) {
      setJoinError(waitlistError.message);
      setWaitlistActionGameId(null);
      return;
    }

    setWaitlistedGameIds((current) => current.filter((id) => id !== game.id));
    setWaitlistCounts((current) => ({
      ...current,
      [game.id]: Math.max((current[game.id] ?? 0) - 1, 0),
    }));
    setWaitlistActionGameId(null);
  };

  const handleLeave = async (game: GameRow) => {
    if (!currentUserId || game.created_by === currentUserId) {
      return;
    }

    const confirmed = window.confirm("Leave this game?");
    if (!confirmed) {
      return;
    }

    setLeavingGameId(game.id);
    setJoinError("");

    const supabase = createSupabaseClient();
    const { error: deleteError } = await supabase
      .from("game_players")
      .delete()
      .eq("game_id", game.id)
      .eq("user_id", currentUserId);

    if (deleteError) {
      setJoinError(deleteError.message);
      setLeavingGameId(null);
      return;
    }

    let nextCount = Math.max(game.current_players - 1, 0);

    const { data: waitlistData, error: waitlistFetchError } = await supabase
      .from("game_waitlist")
      .select("game_id, user_id, user_name")
      .eq("game_id", game.id)
      .order("created_at", { ascending: true })
      .limit(1);

    if (waitlistFetchError) {
      console.error("Failed to load waitlist:", waitlistFetchError.message);
    }

    const firstWaitlistEntry = waitlistData?.[0] as WaitlistRow | undefined;
    if (firstWaitlistEntry) {
      const { error: promoteError } = await supabase.from("game_players").insert({
        game_id: game.id,
        user_id: firstWaitlistEntry.user_id,
      });

      if (promoteError) {
        console.error("Failed to promote waitlisted player:", promoteError.message);
      } else {
        const { error: removeWaitlistError } = await supabase
          .from("game_waitlist")
          .delete()
          .eq("game_id", game.id)
          .eq("user_id", firstWaitlistEntry.user_id);

        if (removeWaitlistError) {
          console.error("Failed to remove waitlist entry:", removeWaitlistError.message);
        }

        nextCount = game.current_players;
        setWaitlistCounts((current) => ({
          ...current,
          [game.id]: Math.max((current[game.id] ?? 0) - 1, 0),
        }));
      }
    }

    const { error: updateError } = await supabase
      .from("games")
      .update({ current_players: nextCount })
      .eq("id", game.id);

    if (updateError) {
      setJoinError(updateError.message);
      setLeavingGameId(null);
      return;
    }

    setJoinedGameIds((current) => current.filter((id) => id !== game.id));
    setGames((current) =>
      current.map((item) => (item.id === game.id ? { ...item, current_players: Math.max(item.current_players - 1, 0) } : item))
    );
    setLeavingGameId(null);
  };

  const handleCancelGame = async (game: GameRow) => {
    if (!currentUserId || game.created_by !== currentUserId) {
      return;
    }

    const confirmed = window.confirm("Cancel this game? Players will be notified.");
    if (!confirmed) {
      return;
    }

    setJoinError("");
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from("games")
      .update({ status: "cancelled" })
      .eq("id", game.id);

    if (error) {
      setJoinError(error.message);
      return;
    }

    setGames((current) => current.map((item) => (item.id === game.id ? { ...item, status: "cancelled" } : item)));
    setOpenMenuGameId(null);
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
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search games, venues, teams"
              className="w-full bg-transparent text-sm text-[#1a1a1a] outline-none placeholder:text-slate-400"
              style={{ fontSize: "16px" }}
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
              const isHost = currentUserId !== null && game.created_by === currentUserId;
              const isCancelled = game.status === "cancelled";
              const joined = joinedGameIds.includes(game.id);
              const spotsLeft = Math.max(game.max_players - game.current_players, 0);
              const hostName = game.creator_name || "Unknown Host";
              const hostInitial = hostName.trim() ? hostName.trim().charAt(0).toUpperCase() : "U";
              const SportIcon = getSportIcon(game.sport);
              const geocodeState = geocodeByVenue[game.venue];
              const hasDescription = Boolean(game.description?.trim());
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
              const gameStart = new Date(`${game.date}T${game.start_time}`);
              const hoursUntilGame = (gameStart.getTime() - now) / (1000 * 60 * 60);
              const joiningClosed = !Number.isFinite(hoursUntilGame) || hoursUntilGame < 24;
              const full = game.current_players >= game.max_players;
              const waitlistCount = waitlistCounts[game.id] ?? 0;
              const waitlisted = waitlistedGameIds.includes(game.id);
              const matchTypeLabel =
                game.match_type === "Male Only"
                  ? "Male only"
                  : game.match_type === "Female Only"
                  ? "Female only"
                  : "Mixed";
              const matchTypeClass =
                game.match_type === "Male Only"
                  ? "rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                  : game.match_type === "Female Only"
                  ? "rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600"
                  : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600";
              return (
                <div
                  key={game.id}
                  className={`rounded-3xl border p-4 shadow-sm space-y-3 ${
                    isCancelled ? "border-slate-300 bg-slate-100/80" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF5]">
                        <SportIcon size={24} className="text-[#1D9E75]" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{game.title}</p>
                        <p className="text-xs text-slate-500">{game.sport}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isHost && !isCancelled ? (
                        <div className="relative z-10">
                          <button
                            type="button"
                            onClick={() => setOpenMenuGameId((current) => (current === game.id ? null : game.id))}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
                            aria-label="Game options"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuGameId === game.id ? (
                            <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuGameId(null);
                                  router.push(`/games/${game.id}/edit`);
                                }}
                                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelGame(game)}
                                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                Cancel game
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {spotsLeft} spots left
                    </span>
                    <span className={matchTypeClass}>{matchTypeLabel}</span>
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        game.is_booked ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {game.is_booked ? "Pitch booked ✓" : "Pitch not booked yet"}
                    </span>
                    {isCancelled ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        Cancelled
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {game.date}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {game.start_time}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {game.venue}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleMapToggle(game)}
                      className="text-sm font-semibold text-[#1D9E75] hover:underline"
                    >
                      {expandedGameId === game.id ? "Hide map" : "See map"}
                    </button>

                    {hasDescription ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDetailsGameId((current) => (current === game.id ? null : game.id))
                        }
                        className="text-sm font-semibold text-[#1D9E75] hover:underline"
                      >
                        {expandedDetailsGameId === game.id ? "Hide details" : "See details"}
                      </button>
                    ) : null}
                  </div>

                  {hasDescription && expandedDetailsGameId === game.id ? (
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {game.description}
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
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
                    <p className="text-sm text-slate-600">
                      £{game.pitch_cost} total · £{(game.pitch_cost / game.max_players).toFixed(2)} each
                    </p>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <div
                      title={hostName}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D9E75] text-[10px] font-semibold text-white"
                    >
                      {hostInitial}
                    </div>
                    <p className="text-xs text-slate-600">Hosted by {hostName}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-500">
                      {game.current_players}/{game.max_players} players
                      {full ? ` · ${waitlistCount} on waitlist` : ""}
                    </div>
                    {isCancelled ? null : isHost ? (
                      <span className="text-xs font-semibold text-[#1D9E75]">You are hosting</span>
                    ) : joined ? (
                      <div className="text-right">
                        <button
                          type="button"
                          disabled
                          className="rounded-full bg-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
                        >
                          Joined
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLeave(game)}
                          disabled={leavingGameId === game.id}
                          className="mt-2 block w-full text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                        >
                          {leavingGameId === game.id ? "Leaving..." : "Leave game"}
                        </button>
                      </div>
                    ) : full ? (
                      waitlisted ? (
                        <div className="text-right">
                          <button
                            type="button"
                            disabled
                            className="rounded-full bg-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
                          >
                            On waitlist
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLeaveWaitlist(game)}
                            disabled={waitlistActionGameId === game.id}
                            className="mt-2 block w-full text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                          >
                            {waitlistActionGameId === game.id ? "Leaving..." : "Leave waitlist"}
                          </button>
                        </div>
                      ) : joiningClosed ? (
                        <div className="text-right">
                          <button
                            type="button"
                            disabled
                            className="rounded-full bg-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
                          >
                            Joining closed
                          </button>
                          <p className="mt-2 text-xs text-slate-500">Joining closes 24 hours before the game</p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleJoinWaitlist(game);
                            }}
                            disabled={waitlistActionGameId === game.id}
                            className="rounded-full bg-[#1D9E75] px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {waitlistActionGameId === game.id ? "Joining..." : "Join waitlist"}
                          </button>
                          <p className="mt-2 text-xs text-slate-500">{waitlistCount} on waitlist</p>
                        </div>
                      )
                    ) : joiningClosed ? (
                      <div className="text-right">
                        <button
                          type="button"
                          disabled
                          className="rounded-full bg-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
                        >
                          Joining closed
                        </button>
                        <p className="mt-2 text-xs text-slate-500">Joining closes 24 hours before the game</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleJoin(game);
                        }}
                        disabled={joiningGameId === game.id}
                        className="rounded-full bg-[#1D9E75] px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {joiningGameId === game.id ? "Joining..." : "Join"}
                      </button>
                    )}
                  </div>

                  {expandedGameId === game.id ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
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
              <p className="text-base font-semibold text-slate-900">No games match your search</p>
              <p className="mt-2 text-sm text-slate-500">Try a different sport or keyword.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
