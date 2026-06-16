"use client"

import Link from "next/link";
import { use, useState } from "react";

const chatMessages = [
  {
    name: "Ava",
    initials: "A",
    time: "9:10 AM",
    text: "Looking forward to the next session!",
    avatarBg: "bg-[#FF6B6B]",
  },
  {
    name: "Rio",
    initials: "R",
    time: "9:14 AM",
    text: "Perfect, I’ll bring extra balls and cones.",
    avatarBg: "bg-[#4ECDC4]",
  },
  {
    name: "You",
    initials: "Y",
    time: "9:16 AM",
    text: "I’m in! Can someone confirm the start time?",
    isOwn: true,
  },
  {
    name: "Liam",
    initials: "L",
    time: "9:17 AM",
    text: "I’ll be there by 9:50, ready for a good game.",
    avatarBg: "bg-[#A855F7]",
  },
  {
    name: "You",
    initials: "Y",
    time: "9:19 AM",
    text: "Let’s aim for 10:00 AM and keep the game friendly.",
    isOwn: true,
  },
];

const games = [
  {
    title: "Weekend Match",
    host: "Hosted by Zara",
    date: "Sat, Jun 8",
    time: "10:00 AM",
    venue: "Tilsley Park Abingdon",
    spotsLeft: 4,
    status: "Open",
  },
  {
    title: "Evening Practice",
    host: "Hosted by Milo",
    date: "Wed, Jun 12",
    time: "7:15 PM",
    venue: "Ferry Sports Centre Oxford",
    spotsLeft: 2,
    status: "Open",
  },
];

const sportIcons: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  badminton: "🏸",
  padel: "🥎",
};

export default function SportGroupPage({ params }: { params: Promise<{ sport: string }> }) {
  const [activeTab, setActiveTab] = useState("chat");
  const { sport } = use(params);
  const sportLabel = sport.charAt(0).toUpperCase() + sport.slice(1);
  const sportIcon = sportIcons[sport.toLowerCase()] || "⚽";

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 pb-[calc(64px+env(safe-area-inset-bottom)+12px)] pt-4 text-[#1a1a1a]">
      <div className="mx-auto max-w-[480px] space-y-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <Link href="/groups" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 transition hover:bg-slate-200">
              ←
            </Link>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 transition hover:bg-slate-200">
              ⋯
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECF8F2] text-xl">
              {sportIcon}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-950">{sportLabel}</p>
              <p className="text-sm text-slate-500">28 members</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-2 shadow-sm">
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

        <div className="min-h-[calc(100vh-260px)] overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          {activeTab === "chat" ? (
            <div className="space-y-4">
              {chatMessages.map((message, index) => {
                const isStartOfGroup = !message.isOwn && (index === 0 || chatMessages[index - 1].name !== message.name);
                const isEndOfGroup = !message.isOwn && (index === chatMessages.length - 1 || chatMessages[index + 1].name !== message.name);
                const avatarBg = message.avatarBg ?? "bg-[#1D9E75]";
                return (
                  <div key={`${message.name}-${message.time}-${index}`} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    {message.isOwn ? (
                      <div className="max-w-[80%] text-right">
                        <div className="inline-block rounded-[18px] bg-[#DCF8C6] px-4 py-3 text-sm">
                          <p className="text-[#1a1a1a]">{message.text}</p>
                          <p className="mt-2 text-right text-[11px] text-slate-500">{message.time}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-end gap-2">
                        {isEndOfGroup ? (
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarBg} text-sm font-bold text-white`}>
                            {message.initials}
                          </div>
                        ) : (
                          <div className="h-9 w-9" />
                        )}
                        <div className="max-w-[80%]">
                          {isStartOfGroup ? (
                            <div className="mb-1 text-[12px] font-semibold text-[#1D9E75]">{message.name}</div>
                          ) : null}
                          <div className="rounded-[18px] bg-[#F0F2F5] px-4 py-3 text-sm">
                            <p className="text-[#1a1a1a]">{message.text}</p>
                            <p className="mt-2 text-right text-[11px] text-slate-500">{message.time}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div key={game.title} className="rounded-3xl border border-slate-200 bg-[#FBFEFC] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{game.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{game.host}</p>
                    </div>
                    <span className="rounded-full bg-[#E7F8EE] px-3 py-1 text-[11px] font-semibold text-[#0F6E56]">
                      {game.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
                      <span>📅</span>
                      <span>{game.date}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
                      <span>🕐</span>
                      <span>{game.time}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
                      <span>📍</span>
                      <span>{game.venue}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <span className="h-9 w-9 rounded-full bg-[#D9F5E9]" />
                        <span className="h-9 w-9 rounded-full bg-[#BBE8D6]" />
                        <span className="h-9 w-9 rounded-full bg-[#89D4B6]" />
                      </div>
                      <span className="text-xs text-slate-500">{game.spotsLeft} spots left</span>
                    </div>
                    <button className="rounded-2xl bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/create-game" className="inline-flex items-center rounded-full border border-[#1D9E75] bg-white px-4 py-2 text-sm font-semibold text-[#1D9E75] transition hover:bg-[#ECF8F0]">
              + Add game
            </Link>
            <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] px-3 py-2">
              <input
                type="text"
                placeholder="Message..."
                className="flex-1 bg-transparent text-sm text-[#1a1a1a] outline-none placeholder:text-slate-400"
              />
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9E75] text-lg text-white transition hover:bg-emerald-600">
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
