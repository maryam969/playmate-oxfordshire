"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createElement, useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Share2, Users } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";
import { getSportIcon } from "@/lib/sport-icons";

const VenueLeafletMap = dynamic(() => import("@/components/maps/venue-leaflet-map"), {
  ssr: false,
});

type GameRow = {
  id: string;
  sport: string;
  title: string;
  match_type: string | null;
  skill_level: string | null;
  date: string;
  start_time: string;
  venue: string;
  description: string | null;
  pitch_cost: number;
  is_booked: boolean;
  booking_url: string | null;
  custom_address: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  current_players: number;
  max_players: number;
  created_by: string | null;
  creator_name: string | null;
  status: string | null;
};

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [game, setGame] = useState<GameRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      setCurrentUserId(userId);

      const { data, error } = await supabase.from("games").select("*").eq("id", gameId).single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setGame(data as GameRow);

      if (userId) {
        const { data: playerRow } = await supabase
          .from("game_players")
          .select("id")
          .eq("game_id", gameId)
          .eq("user_id", userId)
          .maybeSingle();
        setHasJoined(!!playerRow);
      }

      setLoading(false);
    };

    load();
  }, [gameId]);

  const handleJoin = async () => {
    if (!game) return;
    const supabase = createSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      router.push("/login");
      return;
    }

    setJoining(true);
    setJoinError("");

    const { error: joinError } = await supabase.from("game_players").insert({
      game_id: game.id,
      user_id: userData.user.id,
    });

    if (joinError) {
      if (joinError.code === "23505") {
        setHasJoined(true);
        setJoining(false);
        return;
      }
      setJoinError(joinError.message);
      setJoining(false);
      return;
    }

    await supabase.from("games").update({ current_players: game.current_players + 1 }).eq("id", game.id);

    setGame((cur) => (cur ? { ...cur, current_players: cur.current_players + 1 } : cur));
    setHasJoined(true);
    setJoining(false);
  };

  const handleShare = async () => {
    const url = `https://oxsporties.com/games/${gameId}`;
    const shareData = {
      title: game ? `${game.title} — OxSporties` : "OxSporties game",
      text: game ? `Join this ${game.sport} game on OxSporties!` : "Check out this game on OxSporties",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled the share sheet, do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] px-4 py-6 text-[#1a1a1a]">
        <div className="mx-auto max-w-[480px] rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading game…
        </div>
      </div>
    );
  }

  if (notFound || !game) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] px-4 py-6 text-[#1a1a1a]">
        <div className="mx-auto max-w-[480px] rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-900">Game not found</p>
          <p className="mt-1 text-sm text-slate-500">This game may have been removed.</p>
          <Link href="/explore" className="mt-4 inline-block text-sm font-semibold text-[#1D9E75]">
            Browse other games →
          </Link>
        </div>
      </div>
    );
  }

  const SportIcon = getSportIcon(game.sport);
  const spotsLeft = Math.max(game.max_players - game.current_players, 0);
  const isCancelled = game.status === "cancelled";
  const isOwn = currentUserId === game.created_by;
  const gameStart = new Date(`${game.date}T${game.start_time}`);
  const isPast = Number.isFinite(gameStart.getTime()) && gameStart.getTime() < Date.now();

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 pb-10 pt-[calc(env(safe-area-inset-top)+16px)] text-[#1a1a1a]">
      <div className="mx-auto max-w-[480px] space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/explore" className="text-sm font-semibold text-[#1D9E75]">
            ← Back
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1D9E75] bg-white px-3 py-1.5 text-sm font-semibold text-[#1D9E75]"
          >
            <Share2 size={15} />
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ECF8F2]">
              {createElement(SportIcon, { size: 26, className: "text-[#1D9E75]" })}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-950">{game.title}</p>
              <p className="text-sm text-slate-500">{game.sport}</p>
            </div>
          </div>

          {isCancelled && (
            <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
              This game has been cancelled.
            </div>
          )}

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar size={16} className="text-slate-400" />
              {new Date(game.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Clock size={16} className="text-slate-400" />
              {game.start_time}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin size={16} className="text-slate-400" />
              {game.venue}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Users size={16} className="text-slate-400" />
              {game.current_players}/{game.max_players} players
              {spotsLeft > 0 && !isCancelled ? (
                <span className="text-[#1D9E75]"> · {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left</span>
              ) : null}
            </div>
          </div>

          {(game.skill_level || game.match_type) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {game.skill_level && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {game.skill_level}
                </span>
              )}
              {game.match_type && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {game.match_type}
                </span>
              )}
            </div>
          )}

          {game.description && <p className="mt-4 text-sm text-slate-600">{game.description}</p>}

          {game.creator_name && (
            <p className="mt-4 text-xs text-slate-400">Hosted by {game.creator_name}</p>
          )}

          {game.venue_lat && game.venue_lng ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <VenueLeafletMap lat={game.venue_lat} lng={game.venue_lng} title={game.venue} />
            </div>
          ) : null}

          {joinError && <p className="mt-3 text-sm text-red-600">{joinError}</p>}

          {!isOwn && !isCancelled && !isPast && (
            <button
              type="button"
              onClick={handleJoin}
              disabled={joining || hasJoined || spotsLeft === 0}
              className="mt-5 w-full rounded-full bg-[#1D9E75] py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasJoined ? "You're in ✓" : spotsLeft === 0 ? "Full" : joining ? "Joining…" : "Join this game"}
            </button>
          )}

          {isOwn && (
            <Link
              href={`/games/${game.id}/edit`}
              className="mt-5 block w-full rounded-full border border-[#1D9E75] py-3 text-center text-sm font-semibold text-[#1D9E75]"
            >
              Manage this game
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
