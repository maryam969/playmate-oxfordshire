"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";

const sportOptions = ["Football", "Tennis", "Basketball", "Badminton", "Padel"];

const venues = [
  {
    name: "Cutteslowe Park (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
  },
  {
    name: "Cowley Marsh (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
  },
  {
    name: "Court Place Farm (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
  },
  {
    name: "Barton Park 3G (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
  },
  {
    name: "Five Mile Drive Recreation Park (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
  },
  {
    name: "Donnington Recreation Ground (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
  },
  {
    name: "Ferry Sports Centre (Oxford)",
    location: "Oxford",
    bookingUrl: "https://www.better.org.uk/leisure-centre/oxford/ferry-leisure-centre",
  },
  {
    name: "Oxford City FC Community Arena (Oxford)",
    location: "Oxford",
    bookingUrl: "https://portal.sportskey.com/venues/oxford-city-f-c",
  },
];

const timeOptions = ["09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00"];
const durationOptions = ["45 min", "60 min", "90 min", "120 min"];

type GameRow = {
  id: string;
  created_by: string | null;
  sport: string;
  date: string;
  start_time: string;
  duration: string | null;
  venue: string;
  pitch_cost: number;
  is_booked: boolean;
  booking_url: string | null;
  description: string | null;
  match_type: string | null;
  max_players: number;
};

function getDateOptions() {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const day = date.toLocaleDateString("en-GB", { weekday: "short" });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    return {
      label: `${day} ${dayNum}`,
      value: date.toISOString().split("T")[0],
      subtitle: month,
    };
  });
}

export default function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [sport, setSport] = useState("Football");
  const [matchType, setMatchType] = useState("Mixed");
  const [selectedDate, setSelectedDate] = useState(getDateOptions()[0].value);
  const [startTime, setStartTime] = useState(timeOptions[1]);
  const [duration, setDuration] = useState(durationOptions[1]);
  const [players, setPlayers] = useState(8);
  const [selectedVenue, setSelectedVenue] = useState(venues[0].name);
  const [existingBookingUrl, setExistingBookingUrl] = useState<string | null>(null);
  const [pitchCost, setPitchCost] = useState(0);
  const [isBooked, setIsBooked] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGame, setLoadingGame] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dateOptions = useMemo(() => getDateOptions(), []);
  const selectedVenueData = useMemo(
    () => venues.find((venue) => venue.name === selectedVenue) ?? null,
    [selectedVenue]
  );

  const venueOptions = useMemo(() => {
    const hasVenue = venues.some((venue) => venue.name === selectedVenue);
    if (hasVenue) return venues;

    return [
      {
        name: selectedVenue,
        location: "Oxford",
        bookingUrl: existingBookingUrl ?? "",
      },
      ...venues,
    ];
  }, [selectedVenue, existingBookingUrl]);

  useEffect(() => {
    const loadGame = async () => {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You need to be signed in to edit a game.");
        setLoadingGame(false);
        return;
      }

      const { data: game, error } = await supabase
        .from("games")
        .select("id, created_by, sport, date, start_time, duration, venue, pitch_cost, is_booked, booking_url, description, match_type, max_players")
        .eq("id", id)
        .single();

      if (error || !game) {
        setErrorMessage("Game not found.");
        setLoadingGame(false);
        return;
      }

      const gameRow = game as GameRow;
      if (gameRow.created_by !== user.id) {
        setErrorMessage("Only the host can edit this game.");
        setLoadingGame(false);
        return;
      }

      setCanEdit(true);
      setSport(gameRow.sport || "Football");
      setMatchType(gameRow.match_type || "Mixed");
      setSelectedDate(gameRow.date || getDateOptions()[0].value);
      setStartTime(gameRow.start_time || timeOptions[1]);
      setDuration(gameRow.duration || durationOptions[1]);
      setPlayers(gameRow.max_players || 8);
      setSelectedVenue(gameRow.venue || venues[0].name);
      setExistingBookingUrl(gameRow.booking_url ?? null);
      setPitchCost(gameRow.pitch_cost || 0);
      setIsBooked(Boolean(gameRow.is_booked));
      setDescription(gameRow.description || "");
      setLoadingGame(false);
    };

    loadGame();
  }, [id]);

  const handleSubmit = async () => {
    if (!canEdit) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const supabase = createSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("You need to be signed in to edit this game.");
      return;
    }

    const { error: updateError } = await supabase
      .from("games")
      .update({
        sport,
        title: `${sport} Game`,
        date: selectedDate,
        start_time: startTime,
        duration,
        venue: selectedVenue,
        pitch_cost: pitchCost,
        is_booked: isBooked,
        booking_url: selectedVenueData?.bookingUrl || existingBookingUrl || null,
        description,
        match_type: matchType,
        max_players: players,
      })
      .eq("id", id)
      .eq("created_by", user.id);

    if (updateError) {
      setLoading(false);
      setErrorMessage(updateError.message);
      return;
    }

    setLoading(false);
    router.push("/explore");
  };

  if (loadingGame) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] px-4 py-6 text-[#1a1a1a]">
        <div className="mx-auto max-w-[480px] rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading game...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 pb-[calc(64px+env(safe-area-inset-bottom)+12px)] pt-4 text-[#1a1a1a]">
      <div className="mx-auto max-w-[480px] space-y-5 pb-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/explore" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">←</Link>
            <div>
              <p className="text-lg font-semibold text-slate-950">Edit Game</p>
              <p className="text-sm text-slate-500">Update your game details.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">Sport selector</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {sportOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSport(option)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      sport === option
                        ? "bg-[#1D9E75] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-900">Match Type</p>
                <p className="mt-1 text-[13px] text-slate-500">Who can join this game?</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Mixed", "Male Only", "Female Only"].map((option) => {
                  const selected = matchType === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMatchType(option)}
                      className={`rounded-[12px] border px-2 py-3 text-center transition ${
                        selected
                          ? "border-[#1D9E75] bg-[#E1F5EE]"
                          : "border-[#E5E7EB] bg-white"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-950">{option}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">Date</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedDate(option.value)}
                    className={`min-w-[96px] rounded-3xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      selectedDate === option.value
                        ? "border-[#1D9E75] bg-[#DCF8C6] text-[#1D9E75]"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">{option.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <span className="mb-2 block font-semibold">Start time</span>
                <select
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <span className="mb-2 block font-semibold">Duration</span>
                <select
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  {durationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Players needed</p>
                  <p className="text-xs text-slate-500">Choose how many teammates you want.</p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setPlayers((current) => Math.max(2, current - 1))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-slate-700 shadow-sm"
                  >
                    −
                  </button>
                  <span className="text-base font-semibold text-slate-950">{players}</span>
                  <button
                    type="button"
                    onClick={() => setPlayers((current) => current + 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-slate-700 shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Venue</p>
                  <p className="text-xs text-slate-500">Select a location, then book if needed.</p>
                </div>
                <span className="text-xs font-semibold text-[#1D9E75]">Selected: {selectedVenue}</span>
              </div>
              <div className="space-y-3">
                {venueOptions.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedVenue(item.name)}
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      selectedVenue === item.name
                        ? "border-[#1D9E75] bg-[#ECF8F2]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.location}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#1D9E75]">Book</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Pitch cost (optional)</p>
                <p className="mt-1 text-xs text-slate-500">Total cost of the venue.</p>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">£</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pitchCost === 0 ? "" : pitchCost}
                  onChange={(event) => setPitchCost(Number(event.target.value) || 0)}
                  placeholder="60"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm outline-none"
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900">Have you booked the pitch?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBooked(true)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isBooked ? "bg-[#1D9E75] text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Booked ✓
                </button>
                <button
                  type="button"
                  onClick={() => setIsBooked(false)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    !isBooked ? "bg-[#1D9E75] text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Not booked yet
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Description (optional)</p>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !canEdit}
          className="w-full rounded-3xl bg-[#1D9E75] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
