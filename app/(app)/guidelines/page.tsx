"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const sections = [
  {
    title: "Hosting a game",
    points: [
      "You must create games at least 48 hours before they start. This gives players time to see it, join, and plan.",
      "As the host, you're responsible for booking the pitch (or marking it as booked) and setting the cost so players know their share.",
      "You count as one of the players in your own game.",
      "You can edit your game details any time before it starts.",
      "If you need to cancel, do it as early as possible so players can make other plans.",
    ],
  },
  {
    title: "Joining a game",
    points: [
      "You must join a game at least 48 hours before it starts. This helps hosts confirm numbers and secure the pitch.",
      "Only join if you genuinely plan to turn up — other players and the host are counting on you.",
      "If your plans change, leave the game as early as you can so someone else can take your spot.",
      "You can't join a game that's full, cancelled, or one you're already in.",
    ],
  },
  {
    title: "Paying your share",
    points: [
      "When a host sets a pitch cost, PlayMate splits it fairly between players.",
      "Pay your share to the host promptly, before or on the day of the game.",
      "Turning up and not paying isn't fair on the host who fronted the cost.",
    ],
  },
  {
    title: "Being a good PlayMate",
    points: [
      "Treat everyone with respect, on and off the pitch.",
      "Show up on time and ready to play.",
      "Communicate — if you're running late or can't make it, let the group know in the chat.",
      "Keep it inclusive. PlayMate is for players of all levels.",
    ],
  },
  {
    title: "Safety",
    points: [
      "PlayMate is for players aged 16 and over. Under-18s should have a parent or guardian's permission to take part.",
      "Games happen in public venues. Use common sense and look out for one another.",
      "If someone behaves inappropriately, report it so we can keep the community safe.",
    ],
  },
];

export default function GuidelinesPage() {
  const router = useRouter();

  return (
    <div className="min-h-full bg-[#F0F2F5] px-4 py-4 text-[#1a1a1a]">
      <div className="mx-auto max-w-[560px] space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft size={20} strokeWidth={2.25} />
          </button>
        </div>

        <header className="space-y-2 px-1 pt-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1D9E75]">Community Guidelines</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Community Guidelines</h1>
          <p className="max-w-prose text-sm leading-6 text-slate-600">
            A few simple rules to keep PlayMate fun, fair, and reliable for everyone.
          </p>
        </header>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D9E75]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="rounded-[24px] border border-[#DCECE6] bg-[#F7FCFA] px-5 py-4 text-sm leading-6 text-slate-700">
          By using PlayMate, you agree to follow these guidelines. Thanks for being part of the community! 🏆
        </footer>
      </div>
    </div>
  );
}