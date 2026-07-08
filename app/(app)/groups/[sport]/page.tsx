"use client"

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createElement, use, useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";
import { getSportIcon } from "@/lib/sport-icons";

type ChatMessage = {
  id: string;
  sport: string;
  user_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  reply_to_id?: string;
  reply_to_content?: string;
  reply_to_sender?: string;
};

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
  current_players: number;
  max_players: number;
  created_by: string | null;
  status: string | null;
};

type GeocodeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; lat: number; lng: number };

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

export default function SportGroupPage({ params }: { params: Promise<{ sport: string }> }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [games, setGames] = useState<GameRow[]>([]);
  const [joinedGameIds, setJoinedGameIds] = useState<string[]>([]);
  const [waitlistedGameIds, setWaitlistedGameIds] = useState<string[]>([]);
  const [waitlistCounts, setWaitlistCounts] = useState<Record<string, number>>({});
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);
  const [leavingGameId, setLeavingGameId] = useState<string | null>(null);
  const [waitlistActionGameId, setWaitlistActionGameId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState("");
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [expandedDetailsGameId, setExpandedDetailsGameId] = useState<string | null>(null);
  const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null);
  const [geocodeByVenue, setGeocodeByVenue] = useState<Record<string, GeocodeState>>({});
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({})
  const [now, setNow] = useState(() => Date.now());
  const { sport } = use(params);
  const sportLabel = sport.charAt(0).toUpperCase() + sport.slice(1);
  const sportHeaderIcon = getSportIcon(sport);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1");
    }

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, []);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const loadMessages = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setCurrentUserId(userData.user.id);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", userData.user.id)
          .single()

        const fullName = profileData?.first_name
          ? `${profileData.first_name} ${profileData.last_name || ""}`.trim()
          : userData.user.email?.split("@")[0] || "User"

        setCurrentUserName(fullName);

        const { data: myProfile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", userData.user.id)
          .single()
        if (myProfile?.avatar_url) {
          setUserAvatars((prev) => ({ ...prev, [userData.user.id]: myProfile.avatar_url }))
        }
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("sport", sport)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as ChatMessage[]);

        const uniqueUserIds = [...new Set(data.map((m: ChatMessage) => m.user_id))]
        if (uniqueUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, avatar_url")
            .in("id", uniqueUserIds)
          console.log("Fetched avatars for users:", uniqueUserIds)
          console.log("Avatar profiles result:", profiles)
          if (profiles) {
            const avatarMap: Record<string, string> = {}
            profiles.forEach((p: { id: string; avatar_url: string | null }) => {
              if (p.avatar_url) avatarMap[p.id] = p.avatar_url
            })
            console.log("Avatar map built:", avatarMap)
            setUserAvatars(avatarMap)
          }
        }
      }
    };

    const loadGames = async () => {
      const supabase = createSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData.user) {
        setCurrentUserId(userData.user.id);
      }

      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select("id, sport, title, match_type, date, start_time, venue, description, pitch_cost, is_booked, current_players, max_players, created_by, status")
        .ilike("sport", sport);

      if (!gamesError && gamesData) {
        setGames(gamesData as GameRow[]);
      }

      if (userData.user) {
        const { data: joinedData } = await supabase
          .from("game_players")
          .select("game_id")
          .eq("user_id", userData.user.id);

        setJoinedGameIds((joinedData ?? []).map((row) => row.game_id));

        if (gamesData && gamesData.length > 0) {
          const { data: waitlistData } = await supabase
            .from("game_waitlist")
            .select("game_id, user_id, user_name")
            .in("game_id", gamesData.map((game) => game.id));

          const counts: Record<string, number> = {};
          const userWaitlistIds: string[] = [];
          (waitlistData ?? []).forEach((row: WaitlistRow) => {
            counts[row.game_id] = (counts[row.game_id] ?? 0) + 1;
            if (row.user_id === userData.user.id) {
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
    };

    loadMessages();
    loadGames();

    const channelName = `chat-${sport}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sport=eq.${sport}`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((current) => {
            // If message with same id already exists, skip
            if (current.some((m) => m.id === newMsg.id)) return current;

            // Try to find a temp message to replace (optimistic)
            const tempIndex = current.findIndex(
              (m) => m.id.startsWith("temp-") && m.content === newMsg.content && m.sender_name === newMsg.sender_name
            );
            if (tempIndex !== -1) {
              const copy = [...current];
              copy[tempIndex] = newMsg;
              return copy;
            }

            return [...current, newMsg];
          });

          if (!userAvatars[newMsg.user_id]) {
            const { data: newProfile } = await supabase.from("profiles").select("avatar_url").eq("id", newMsg.user_id).single()
            if (newProfile?.avatar_url) {
              setUserAvatars(prev => ({ ...prev, [newMsg.user_id]: newProfile.avatar_url }))
            }
          }
        }
      )
      .subscribe();

    return () => {
      try {
        subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, [sport]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialScrollDoneRef = useRef(false);

  useEffect(() => {
    if (!messagesEndRef.current) return;

    if (!hasInitialScrollDoneRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant", block: "end" });
      hasInitialScrollDoneRef.current = true;
      return;
    }

    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || !currentUserId) return;
    const replyTarget = replyingTo;

    // optimistic message
    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const optimistic: ChatMessage = {
      id: tempId,
      sport,
      user_id: currentUserId,
      sender_name: currentUserName || "You",
      content,
      created_at: createdAt,
      reply_to_id: replyTarget?.id || undefined,
      reply_to_content: replyTarget?.content || undefined,
      reply_to_sender: replyTarget?.sender_name || undefined,
    };

    setSending(true);
    setMessages((cur) => [...cur, optimistic]);
    setMessageInput("");
    setReplyingTo(null);

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("messages").insert({
      sport,
      user_id: currentUserId,
      sender_name: currentUserName || "You",
      content,
      reply_to_id: replyTarget?.id || null,
      reply_to_content: replyTarget?.content || null,
      reply_to_sender: replyTarget?.sender_name || null,
    }).select();

    setSending(false);

    if (error) {
      // remove optimistic message
      setMessages((cur) => cur.filter((m) => m.id !== tempId));
      console.error("Failed to send message:", error.message);
      return;
    }

    const real = (data && data[0]) as ChatMessage | undefined;
    if (real) {
      // replace the temp message if still present
      setMessages((cur) => cur.map((m) => (m.id === tempId ? real : m)));
    }
  };

  const handleJoin = async (game: GameRow) => {
    if (!currentUserId || joinedGameIds.includes(game.id) || game.created_by === currentUserId || game.status === "cancelled") {
      return;
    }

    const gameStart = new Date(`${game.date}T${game.start_time}`);
    if (!Number.isFinite(gameStart.getTime()) || gameStart.getTime() - now < joiningCutoffInMs) {
      return;
    }

    setJoiningGameId(game.id);
    setJoinError("");

    const supabase = createSupabaseClient();
    const { error: joinError } = await supabase.from("game_players").insert({
      game_id: game.id,
      user_id: currentUserId,
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
    if (!currentUserId || joinedGameIds.includes(game.id) || waitlistedGameIds.includes(game.id) || game.created_by === currentUserId || game.status === "cancelled") {
      return;
    }

    const gameStart = new Date(`${game.date}T${game.start_time}`);
    if (!Number.isFinite(gameStart.getTime()) || gameStart.getTime() - now < joiningCutoffInMs) {
      return;
    }

    setWaitlistActionGameId(game.id);
    setJoinError("");

    const supabase = createSupabaseClient();
    const { error: waitlistError } = await supabase.from("game_waitlist").insert({
      game_id: game.id,
      user_id: currentUserId,
      user_name: currentUserName || "User",
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
    if (!currentUserId || !waitlistedGameIds.includes(game.id)) {
      return;
    }

    setWaitlistActionGameId(game.id);
    setJoinError("");

    const supabase = createSupabaseClient();
    const { error: waitlistError } = await supabase
      .from("game_waitlist")
      .delete()
      .eq("game_id", game.id)
      .eq("user_id", currentUserId);

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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${venue}, Oxford`)}&format=json&limit=1`
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
    setExpandedGameId((current) => (current === game.id ? null : game.id));

    const currentGeocode = geocodeByVenue[game.venue];
    if (!currentGeocode || currentGeocode.status === "idle" || currentGeocode.status === "error") {
      loadVenueCoordinates(game.venue);
    }
  };

  return (
    <div
      className="flex flex-col bg-[#F0F2F5]"
      style={{
        height: "100dvh",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 70px)",
      }}
    >
      <div className="flex h-full flex-col">
        <div className="shrink-0 bg-white px-3 py-2 border-b border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <Link href="/groups" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 transition hover:bg-slate-200">
              ←
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECF8F2]">
                {createElement(sportHeaderIcon, { size: 24, className: "text-[#1D9E75]", "aria-hidden": true })}
              </div>
              <p className="text-base font-semibold text-slate-950">{sportLabel}</p>
            </div>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 transition hover:bg-slate-200">
              ⋯
            </button>
          </div>
        </div>

        <div className="shrink-0 bg-white px-3 py-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                activeTab === "chat" ? "bg-[#DCF8C6] text-[#1D9E75]" : "text-slate-500"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("games")}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                activeTab === "games" ? "bg-[#DCF8C6] text-[#1D9E75]" : "text-slate-500"
              }`}
            >
              Games
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          {activeTab === "chat" ? (
            <div className="h-full overflow-y-auto p-2">
              <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-slate-500">
                  No messages yet — say hi! 👋
                </div>
              ) : messages.map((message) => {
                const isOwn = message.user_id === currentUserId;
                const initials = (message.sender_name || "U").split(" ").map((part) => part[0]).join("").slice(0, 1).toUpperCase();
                const avatarColors = ["bg-violet-500", "bg-blue-500", "bg-orange-500", "bg-rose-500", "bg-cyan-500"];
                const avatarIndex = (message.sender_name || "").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % avatarColors.length;
                const avatarBg = avatarColors[avatarIndex];
                return (
                  <div key={message.id} className={`${isOwn ? "flex items-end justify-end gap-2" : "flex items-start gap-2 justify-start"}`}>
                    {isOwn ? (
                      <button
                        type="button"
                        onClick={() => setReplyingTo(message)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Reply"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 17 4 12 9 7"></polyline>
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                        </svg>
                      </button>
                    ) : null}
                    {isOwn ? (
                      <div className="max-w-[75%] text-right">
                        <div className="ml-auto w-fit max-w-[75%] rounded-2xl rounded-tr-md bg-[#1D9E75] px-4 py-2 text-white whitespace-pre-wrap break-normal">
                          {message.reply_to_content ? (
                            <div className="mb-2 rounded-lg border-l-2 border-white/70 bg-white/15 px-2 py-1 text-left">
                              <p className="text-[11px] font-semibold text-white/90">{message.reply_to_sender}</p>
                              <p className="truncate text-[11px] text-white/80">{message.reply_to_content}</p>
                            </div>
                          ) : null}
                          <p className="text-sm text-white">{message.content}</p>
                          <p className="mt-1 text-right text-[11px] text-white/75">{new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {userAvatars[message.user_id] ? (
                          <img src={userAvatars[message.user_id]} alt={message.sender_name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarBg} text-sm font-bold text-white`}>
                            {initials}
                          </div>
                        )}
                        <div className="flex flex-col items-start min-w-0">
                          <span className="mb-1 text-xs text-slate-500">{message.sender_name}</span>
                          <div className="w-fit max-w-[75%] rounded-2xl rounded-tl-md bg-slate-200 px-4 py-2 text-slate-800 whitespace-pre-wrap break-normal">
                            {message.reply_to_content ? (
                              <div className="mb-2 rounded-lg border-l-2 border-slate-300 bg-slate-100 px-2 py-1">
                                <p className="text-[11px] font-semibold text-[#1D9E75]">{message.reply_to_sender}</p>
                                <p className="truncate text-[11px] text-slate-600">{message.reply_to_content}</p>
                              </div>
                            ) : null}
                            <p className="text-sm text-slate-800">{message.content}</p>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingTo(message)}
                              className="text-slate-400 hover:text-slate-600"
                              title="Reply"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 17 4 12 9 7"></polyline>
                                <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                              </svg>
                            </button>
                            <span className="text-xs text-slate-400">{new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-2">
              <div className="space-y-4">
              {joinError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {joinError}
                </div>
              ) : null}

              {games.length > 0 ? (
                games.map((game) => {
                  const isHost = currentUserId !== null && game.created_by === currentUserId;
                  const isCancelled = game.status === "cancelled";
                  const joined = joinedGameIds.includes(game.id);
                  const spotsLeft = Math.max(game.max_players - game.current_players, 0);
                  const gameSportIcon = getSportIcon(game.sport);
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
                    <div key={game.id} className={`rounded-3xl border p-4 space-y-3 ${isCancelled ? "border-slate-300 bg-slate-100/80" : "border-slate-200 bg-[#FBFEFC]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ECFDF5]">
                            {createElement(gameSportIcon, { size: 24, className: "text-[#1D9E75]", "aria-hidden": true })}
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

                      <div className="grid gap-3 text-sm text-slate-600">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
                          <span>📅</span>
                          <span>{game.date}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
                          <span>🕐</span>
                          <span>{game.start_time}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
                          <span>📍</span>
                          <span>{game.venue}</span>
                        </div>
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

                      {expandedGameId === game.id ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
                          {geocodeState?.status === "loading" ? (
                            <p className="px-2 py-4 text-sm text-slate-500">Finding location...</p>
                          ) : geocodeState?.status === "success" ? (
                            <VenueLeafletMap lat={geocodeState.lat} lng={geocodeState.lng} title={game.venue} />
                          ) : (
                            <p className="px-2 py-4 text-sm text-slate-500">Location not found</p>
                          )}
                        </div>
                      ) : null}

                      {game.pitch_cost > 0 ? (
                        <p className="text-sm text-slate-600">
                          £{game.pitch_cost} total · £{(game.pitch_cost / game.max_players).toFixed(2)} each
                        </p>
                      ) : null}

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">
                          {game.current_players}/{game.max_players} players{full ? ` · ${waitlistCount} on waitlist` : ""}
                        </span>
                        {isCancelled ? null : isHost ? (
                          <span className="text-xs font-semibold text-[#1D9E75]">You are hosting</span>
                        ) : joined ? (
                          <div className="text-right">
                            <button
                              type="button"
                              disabled
                              className="rounded-2xl bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
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
                                className="rounded-2xl bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
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
                                className="rounded-2xl bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
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
                                className="rounded-2xl bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
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
                              className="rounded-2xl bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                              Joining closed
                            </button>
                            <p className="mt-2 text-xs text-slate-500">Joining closes 24 hours before the game</p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleJoin(game)}
                            disabled={joiningGameId === game.id}
                            className="rounded-2xl bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {joiningGameId === game.id ? "Joining..." : "Join"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                  <p className="text-base font-semibold text-slate-900">No games yet for this sport — create one!</p>
                  <Link href="/create-game" className="mt-3 inline-flex text-sm font-semibold text-[#1D9E75]">
                    Create a game
                  </Link>
                </div>
              )}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 bg-white border-t border-slate-200 px-3 py-3">
          {replyingTo ? (
            <div className="bg-green-50 border-l-4 border-[#1D9E75] px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#1D9E75]">{replyingTo.sender_name}</p>
                <p className="text-xs text-slate-500 truncate max-w-[250px]">{replyingTo.content}</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-slate-400 text-lg">✕</button>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/create-game" className="inline-flex items-center rounded-full border border-[#1D9E75] bg-white px-4 py-2 text-sm font-semibold text-[#1D9E75] transition hover:bg-[#ECF8F0]">
              + Add game
            </Link>
              <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] px-3 py-2">
              <input
                type="text"
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message..."
                className="flex-1 bg-transparent text-base text-[#1a1a1a] outline-none placeholder:text-slate-400"
                style={{ fontSize: "16px" }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !messageInput.trim()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9E75] text-lg text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? "…" : "➤"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
