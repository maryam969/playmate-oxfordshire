"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";

const sportOptions = ["Football", "Tennis", "Basketball", "Badminton", "Padel"];

const venues = [
  {
    name: "Cutteslowe Park (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
    sports: ["Football"],
  },
  {
    name: "Cowley Marsh (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
    sports: ["Football"],
  },
  {
    name: "Court Place Farm (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
    sports: ["Football"],
  },
  {
    name: "Barton Park 3G (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
    sports: ["Football"],
  },
  {
    name: "Five Mile Drive Recreation Park (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
    sports: ["Football"],
  },
  {
    name: "Donnington Recreation Ground (Oxford)",
    location: "Oxford",
    bookingUrl: "https://pitchbooking.com/partners/occ",
    sports: ["Football"],
  },
  {
    name: "Ferry Sports Centre (Oxford)",
    location: "Oxford",
    bookingUrl: "https://www.better.org.uk/leisure-centre/oxford/ferry-leisure-centre",
    sports: ["Football"],
  },
  {
    name: "Oxford City FC Community Arena (Oxford)",
    location: "Oxford",
    bookingUrl: "https://portal.sportskey.com/venues/oxford-city-f-c",
    sports: ["Football"],
  },
  {
    name: "Smash Padel Oxford",
    location: "Oxford",
    bookingUrl: "https://smashpadel.co/oxford/",
    sports: ["Padel"],
  },
  {
    name: "North Oxford Lawn Tennis Club (Padel)",
    location: "Oxford",
    bookingUrl: "https://noltc.co.uk/book-your-court",
    sports: ["Padel"],
  },
];

const timeOptions = ["09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00"];
const durationOptions = ["45 min", "60 min", "90 min", "120 min"];
const fortyEightHoursInMs = 48 * 60 * 60 * 1000;

type GeocodeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; lat: number; lng: number };

const VenueLeafletMap = dynamic(() => import("@/components/maps/venue-leaflet-map"), {
  ssr: false,
  loading: () => <p className="text-xs text-slate-500">Loading map...</p>,
});

function getMinimumSelectableDate() {
  const date = new Date();
  date.setTime(date.getTime() + fortyEightHoursInMs);
  return date;
}

function getDateOptions() {
  const minimumSelectableDate = getMinimumSelectableDate();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(minimumSelectableDate);
    date.setDate(date.getDate() + index);
    const day = date.toLocaleDateString("en-GB", { weekday: "short" });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    return {
      label: `${day} ${dayNum}`,
      value: date.toISOString().split("T")[0],
      isToday: index === 0,
      subtitle: month,
    };
  });
}

export default function CreateGamePage() {
  const router = useRouter();
  const [sport, setSport] = useState("Football");
  const [matchType, setMatchType] = useState("Mixed");
  const [skillLevel, setSkillLevel] = useState("All levels");
  const [selectedDate, setSelectedDate] = useState(() => getDateOptions()[0].value);
  const [startTime, setStartTime] = useState(timeOptions[1]);
  const [duration, setDuration] = useState(durationOptions[1]);
  const [players, setPlayers] = useState(8);
  const [selectedVenue, setSelectedVenue] = useState(venues[0].name);
  const [venueMode, setVenueMode] = useState<"preset" | "custom">("preset");
  const [customAddress, setCustomAddress] = useState("");
  const [customAddressGeocode, setCustomAddressGeocode] = useState<GeocodeState>({ status: "idle" });
  const [pitchCost, setPitchCost] = useState(0);
  const [isBooked, setIsBooked] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const dateOptions = useMemo(() => getDateOptions(), []);
  const minimumSelectableDate = useMemo(() => getMinimumSelectableDate().toISOString().split("T")[0], []);
  const visibleVenues = useMemo(
    () => venues.filter((venue) => venue.sports.includes(sport)),
    [sport]
  );
  const selectedVenueData = useMemo(
    () => visibleVenues.find((venue) => venue.name === selectedVenue) ?? null,
    [selectedVenue, visibleVenues]
  );
  const gameStart = useMemo(() => new Date(`${selectedDate}T${startTime}`), [selectedDate, startTime]);
  const canPostGame = Number.isFinite(gameStart.getTime()) && gameStart.getTime() - now >= fortyEightHoursInMs;

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (visibleVenues.length === 0) {
      return;
    }

    if (!visibleVenues.some((venue) => venue.name === selectedVenue)) {
      setSelectedVenue(visibleVenues[0].name);
    }
  }, [selectedVenue, visibleVenues]);

  const geocodeCustomAddress = async () => {
    const normalizedAddress = customAddress.trim();
    if (!normalizedAddress) {
      setCustomAddressGeocode({ status: "idle" });
      return;
    }

    setCustomAddressGeocode({ status: "loading" });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${normalizedAddress}, Oxford, UK`)}&format=json&limit=1`
      );

      if (!response.ok) {
        setCustomAddressGeocode({ status: "error" });
        return;
      }

      const result = (await response.json()) as Array<{ lat: string; lon: string }>;
      if (!result[0]) {
        setCustomAddressGeocode({ status: "error" });
        return;
      }

      setCustomAddressGeocode({
        status: "success",
        lat: Number.parseFloat(result[0].lat),
        lng: Number.parseFloat(result[0].lon),
      });
    } catch {
      setCustomAddressGeocode({ status: "error" });
    }
  };

  const handleSubmit = async () => {
    if (!canPostGame) {
      setErrorMessage("Games must be created at least 48 hours in advance. Please pick a later date or time.");
      return;
    }

    const normalizedCustomAddress = customAddress.trim();
    if (venueMode === "custom" && !normalizedCustomAddress) {
      setErrorMessage("Please enter an address for your custom location.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const supabase = createSupabaseClient();
    const {
      data: { user: initialUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !initialUser) {
      setLoading(false);
      setErrorMessage("You need to be signed in to create a game.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user?.id)
      .single()

    console.log('Profile data:', profile)
    console.log('User metadata:', user?.user_metadata)

    const creatorName = (profile?.first_name || profile?.last_name)
      ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
      : user?.user_metadata?.full_name
      || user?.user_metadata?.name
      || user?.email
      || 'Unknown'

    console.log('Final creator name:', creatorName)

    const usingCustomAddress = venueMode === "custom";
    const venueToSave = usingCustomAddress ? normalizedCustomAddress : selectedVenue;
    const customLat =
      usingCustomAddress && customAddressGeocode.status === "success" ? customAddressGeocode.lat : null;
    const customLng =
      usingCustomAddress && customAddressGeocode.status === "success" ? customAddressGeocode.lng : null;

    const { data: newGame, error: gameError } = await supabase
      .from("games")
      .insert({
        created_by: initialUser.id,
        creator_name: creatorName,
        sport,
        title: `${sport} Game`,
        date: selectedDate,
        start_time: startTime,
        duration,
        venue: venueToSave,
        custom_address: usingCustomAddress ? normalizedCustomAddress : null,
        venue_lat: customLat,
        venue_lng: customLng,
        pitch_cost: pitchCost,
        is_booked: isBooked,
        booking_url: usingCustomAddress ? null : selectedVenueData?.bookingUrl ?? null,
        description,
        match_type: matchType,
        skill_level: skillLevel,
        max_players: players,
        current_players: 1,
      })
      .select()
      .single();

    if (gameError || !newGame) {
      setLoading(false);
      setErrorMessage(gameError?.message ?? "Failed to create the game.");
      return;
    }

    const { error: playerError } = await supabase.from("game_players").insert({
      game_id: newGame.id,
      user_id: initialUser.id,
    });

    if (playerError) {
      setLoading(false);
      setErrorMessage(playerError.message);
      return;
    }

    setLoading(false);
    router.push("/explore");
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 pb-[calc(64px+env(safe-area-inset-bottom)+12px)] pt-4 text-[#1a1a1a]">
      <div className="mx-auto max-w-[480px] space-y-5 pb-6">
        <div className="rounded-[28px] bg-white p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">←</div>
            <div>
              <p className="text-lg font-semibold text-slate-950">Create a Game</p>
              <p className="text-sm text-slate-500">Set up the perfect match for your group.</p>
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
                {[
                  {
                    key: "Mixed",
                    label: "Mixed",
                    subtitle: "Everyone welcome",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                        <circle cx="9" cy="7" r="3" />
                        <circle cx="15" cy="7" r="3" />
                        <path d="M3 21v-2a6 6 0 0112 0v2" />
                      </svg>
                    ),
                  },
                  {
                    key: "Male Only",
                    label: "Male Only",
                    subtitle: "Men only",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                        <circle cx="10" cy="14" r="5" />
                        <line x1="19" y1="5" x2="14.14" y2="9.86" />
                        <polyline points="15 5 19 5 19 9" />
                      </svg>
                    ),
                  },
                  {
                    key: "Female Only",
                    label: "Female Only",
                    subtitle: "Women only",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                        <circle cx="12" cy="9" r="5" />
                        <line x1="12" y1="14" x2="12" y2="21" />
                        <line x1="9" y1="18" x2="15" y2="18" />
                      </svg>
                    ),
                  },
                ].map((option) => {
                  const selected = matchType === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setMatchType(option.key)}
                      className={`rounded-[12px] border px-2 py-3 text-center transition ${
                        selected
                          ? "border-[#1D9E75] bg-[#E1F5EE]"
                          : "border-[#E5E7EB] bg-white"
                      }`}
                    >
                      <div className={`mx-auto mb-3 flex h-7 w-7 items-center justify-center ${selected ? "text-[#1D9E75]" : "text-slate-400"}`}>
                        {option.icon}
                      </div>
                      <p className="text-sm font-semibold text-slate-950">{option.label}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{option.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-900">Skill level</p>
                <p className="mt-1 text-[13px] text-slate-500">Who is this game for?</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["All levels", "Beginner", "Intermediate", "Advanced"].map((option) => {
                  const selected = skillLevel === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSkillLevel(option)}
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
                    disabled={option.value < minimumSelectableDate}
                    onClick={() => setSelectedDate(option.value)}
                    className={`min-w-[96px] rounded-3xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      selectedDate === option.value
                        ? "border-[#1D9E75] bg-[#DCF8C6] text-[#1D9E75]"
                        : option.value < minimumSelectableDate
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
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

            {!canPostGame ? (
              <p className="text-sm text-amber-700">
                Games must be created at least 48 hours in advance. Please pick a later date or time.
              </p>
            ) : null}

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
                  <p className="text-xs text-slate-500">Choose a preset venue or enter your own location.</p>
                </div>
                <span className="text-xs font-semibold text-[#1D9E75]">
                  Selected: {venueMode === "custom" ? customAddress.trim() || "Custom address" : selectedVenue}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2">
                <button
                  type="button"
                  onClick={() => setVenueMode("preset")}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    venueMode === "preset" ? "bg-[#ECF8F2] text-[#1D9E75]" : "text-slate-600"
                  }`}
                >
                  Pick a venue
                </button>
                <button
                  type="button"
                  onClick={() => setVenueMode("custom")}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    venueMode === "custom" ? "bg-[#ECF8F2] text-[#1D9E75]" : "text-slate-600"
                  }`}
                >
                  Use my own location
                </button>
              </div>

              {venueMode === "custom" ? (
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 space-y-3">
                  <label className="block text-sm font-semibold text-slate-900" htmlFor="custom-address-input">
                    Address
                  </label>
                  <input
                    id="custom-address-input"
                    type="text"
                    value={customAddress}
                    onChange={(event) => {
                      setCustomAddress(event.target.value);
                      if (customAddressGeocode.status !== "idle") {
                        setCustomAddressGeocode({ status: "idle" });
                      }
                    }}
                    onBlur={geocodeCustomAddress}
                    placeholder="e.g. 12 Iffley Road, Oxford OX4 1EA"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                    style={{ fontSize: "16px" }}
                  />
                  <button
                    type="button"
                    onClick={geocodeCustomAddress}
                    className="inline-flex rounded-full bg-[#1D9E75] px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Find on map
                  </button>

                  {customAddressGeocode.status === "loading" ? (
                    <p className="text-xs text-slate-500">Finding location...</p>
                  ) : null}

                  {customAddressGeocode.status === "error" ? (
                    <p className="text-xs text-amber-700">
                      Couldn&apos;t find that address — the game will still save, but it may not show on the map.
                    </p>
                  ) : null}

                  {customAddressGeocode.status === "success" ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
                      <VenueLeafletMap
                        lat={customAddressGeocode.lat}
                        lng={customAddressGeocode.lng}
                        title={customAddress.trim() || "Custom address"}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {venueMode === "preset" ? (
              <div className="space-y-3">
                {visibleVenues.map((item) => (
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
              ) : null}

              {venueMode === "preset" && selectedVenueData?.bookingUrl && !isBooked ? (
                <a
                  href={selectedVenueData.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm font-semibold text-[#1D9E75]"
                >
                  Book this pitch on the venue&apos;s site →
                </a>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Pitch cost (optional)</p>
                <p className="mt-1 text-xs text-slate-500">Total cost of the venue — we&apos;ll show everyone their share</p>
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
                <p className="mt-1 text-xs text-slate-500">Add any notes for players — what you&apos;ll be wearing, what to bring, where to meet</p>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. I&apos;ll be there wearing a pink jacket 🧥"
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
          disabled={loading || !canPostGame}
          className="w-full rounded-3xl bg-[#1D9E75] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating game..." : "Post Game"}
        </button>
      </div>
    </div>
  );
}
