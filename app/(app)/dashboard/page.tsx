import Link from "next/link";

const statsChips = [
  { label: "12 Games", value: "" },
  { label: "5 Upcoming", value: "" },
  { label: "34 Friends", value: "" },
];

const upcomingGames = [
  {
    emoji: "⚽",
    sport: "Football",
    badge: "Match",
    date: "Sat, Jun 22",
    title: "Saturday Kickoff",
    time: "10:00 AM",
    venue: "Tilsley Park Abingdon",
    spots: "4 spots left",
    avatars: ["AL", "MJ", "SR"],
  },
  {
    emoji: "🎾",
    sport: "Tennis",
    badge: "Doubles",
    date: "Sun, Jun 23",
    title: "Sunday Doubles",
    time: "2:30 PM",
    venue: "Ferry Sports Centre",
    spots: "2 spots left",
    avatars: ["PR", "LN", "KA"],
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div className="space-y-2">
          <p className="text-[22px] font-semibold text-slate-950">Good morning, Olivia 👋</p>
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Your upcoming games</p>
            <p className="text-xs text-slate-500">Plan ahead and join the fun</p>
          </div>
          <Link href="/explore" className="text-sm font-semibold text-[#1D9E75]">
            See all
          </Link>
        </div>

        <div className="space-y-3">
          {upcomingGames.map((game) => (
            <article key={game.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECF8F2] text-xl">
                    {game.emoji}
                  </div>
                  <span className="rounded-full bg-[#DEF7ED] px-3 py-1 text-xs font-semibold text-[#0F6E56]">
                    {game.badge}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500">{game.date}</span>
              </div>

              <h2 className="mt-4 text-base font-semibold text-slate-950">{game.title}</h2>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                  <span>🕐</span>
                  <span>{game.time}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                  <span>📍</span>
                  <span>{game.venue}</span>
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {game.avatars.map((avatar) => (
                      <div key={avatar} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#D9F5E9] text-xs font-semibold text-[#1D9E75]">
                        {avatar}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-slate-500">{game.spots}</span>
                </div>
                <button className="rounded-2xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
                  Join
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/create-game" className="rounded-2xl border border-dashed border-[#1D9E75] bg-white px-4 py-5 text-center text-sm font-semibold text-[#1D9E75] transition hover:bg-[#ECF8F0]">
          <div className="text-xl">➕</div>
          <div className="mt-2">Create Game</div>
        </Link>
        <Link href="/explore" className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-semibold text-slate-700 transition hover:border-[#1D9E75] hover:text-[#1D9E75]">
          <div className="text-xl">🔍</div>
          <div className="mt-2">Find Games</div>
        </Link>
      </section>
    </div>
  );
}

