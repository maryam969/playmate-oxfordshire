'use client'

import Image from 'next/image'
import Link from 'next/link'
import { UserCircle, CalendarCheck, Trophy } from 'lucide-react'

const stats = [
  { value: '3,800+', label: 'Active Players' },
  { value: '5', label: 'Sports' },
  { value: '50+', label: 'Venues in Oxford' },
  { value: 'Free', label: 'To Join' },
]

const steps = [
  {
    number: '01',
    icon: '👤',
    title: 'Create your profile',
    description: 'Set up your player details and discover the right match.',
  },
  {
    number: '02',
    icon: 'calendar',
    title: 'Join a game',
    description: 'Reserve your spot, find venues and connect with a team.',
  },
  {
    number: '03',
    icon: '🏆',
    title: 'Play together',
    description: 'Show up, enjoy the match and grow your local community.',
  },
]

const communities = [
  { emoji: '⚽', name: 'Football', players: '1,250 active players' },
  { emoji: '🎾', name: 'Tennis', players: '860 active players' },
  { emoji: '🏀', name: 'Basketball', players: '720 active players' },
  { emoji: '🏸', name: 'Badminton', players: '540 active players' },
  { emoji: '🥎', name: 'Padel', players: '430 active players' },
]

const testimonials = [
  {
    quote: 'OxSporties helped me find regular football matches across the city. The app feels polished and easy to use.',
    name: 'Emily Taylor',
    badge: 'Football',
  },
  {
    quote: 'I joined a tennis doubles group within days. The community is welcoming and the scheduling is simple.',
    name: 'Oliver Reed',
    badge: 'Tennis',
  },
  {
    quote: 'From booking courts to meeting new players, it made every step effortless. It feels like the future of local sport.',
    name: 'Mia Foster',
    badge: 'Padel',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#F0F0F0] px-12">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
              <Image src="/logo.png" alt="OxSporties logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-base font-black text-[#0a1628]">OxSporties</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#1D9E75] px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-white pt-[100px] pb-[80px]">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 800px 600px at 50% 40%, rgba(29,158,117,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 lg:flex-row lg:items-center lg:gap-24">
          <div className="lg:w-[55%]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ECFBF4] px-4 py-2 text-sm font-semibold text-[#047857]">
              <div className="relative h-5 w-5 overflow-hidden rounded-full bg-white">
                <Image src="/logo.png" alt="OxSporties logo" fill className="object-cover" />
              </div>
              Oxford's #1 Sports Platform
            </span>
            <h1 className="mt-10 text-[52px] font-black leading-[1.05] text-[#0a1628] sm:text-[72px]">
              <span className="block">Find Players.</span>
              <span className="relative block">
                <span className="text-[#1D9E75]">Book Venues.</span>
              </span>
              <span className="block">Play Sport.</span>
            </h1>
            <p className="mt-8 max-w-[480px] text-[18px] leading-8 text-[#6B7280]">
              Connect with players across Oxfordshire. Create games, discover venues and join a sports community you'll love.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#1D9E75] px-8 text-base font-semibold text-white transition hover:bg-emerald-600"
              >
                Get Started →
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-semibold text-[#0a1628] transition hover:border-[#1D9E75]"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
              <div className="flex -space-x-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white bg-[#D1FAE5] text-xs font-semibold text-[#047857]">J</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white bg-[#D1FAE5] text-xs font-semibold text-[#047857]">A</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white bg-[#D1FAE5] text-xs font-semibold text-[#047857]">S</span>
              </div>
              <p>Join 3,800+ players in Oxfordshire</p>
            </div>
          </div>

          <div className="lg:w-[45%]">
            <div className="relative mx-auto w-full max-w-lg md:rotate-1 rounded-2xl bg-white p-6 shadow-2xl shadow-[#D1FAE5]/40">
              <div className="flex items-center justify-between rounded-3xl bg-slate-950 px-4 py-3 text-white">
                <div className="flex items-center gap-3">
                  <div className="relative h-7 w-7 overflow-hidden rounded-full bg-white">
                    <Image src="/logo.png" alt="OxSporties logo" fill className="object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">OxSporties</p>
                    <p className="text-xs text-slate-300">Dashboard</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#047857] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  Live
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-100 p-4 text-center">
                  <p className="text-lg font-black text-[#0a1628]">12</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Games</p>
                </div>
                <div className="rounded-3xl bg-slate-100 p-4 text-center">
                  <p className="text-lg font-black text-[#0a1628]">5</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Upcoming</p>
                </div>
                <div className="rounded-3xl bg-slate-100 p-4 text-center">
                  <p className="text-lg font-black text-[#0a1628]">34</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Friends</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>⚽ Saturday Kickoff</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-[#047857]">6 spots left</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Tilsley Park</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>🎾 Sunday Doubles</span>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold text-[#B45309]">2 spots left</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">University Parks</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button className="inline-flex h-12 items-center justify-center rounded-full bg-[#1D9E75] px-6 text-base font-semibold text-white transition hover:bg-emerald-600">
                  Create a game +
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Stats</p>
            <div className="grid w-full grid-cols-1 gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={stat.label} className={`flex flex-col items-center ${index !== 0 ? 'border-l border-slate-200' : ''} px-4 text-center`}>
                  <p className="text-3xl font-black text-[#0a1628]">{stat.value}</p>
                  <p className="mt-2 text-sm text-[#6B7280]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">HOW IT WORKS</p>
          <h2 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">As easy as 1, 2, 3</h2>
        </div>
        <div className="mx-auto mt-16 grid max-w-7xl gap-6 px-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const iconMap = {
              '01': UserCircle,
              '02': CalendarCheck,
              '03': Trophy,
            }
            const IconComponent = iconMap[step.number as keyof typeof iconMap]
            return (
              <div key={step.number} className="rounded-[28px] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-[#047857]">{step.number}</div>
                  {IconComponent && <IconComponent size={24} color="#1D9E75" />}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="mt-6 flex items-center justify-end text-2xl text-slate-200">→</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-[#F0FDF7] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Pick Your Sport</h2>
        </div>
        <div className="mx-auto mt-12 max-w-7xl px-6">
          <div
            className="flex overflow-x-auto scrollbar-hide gap-4 py-2 md:grid md:grid-cols-5 md:gap-6"
            style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {communities.map((community) => (
              <div
                key={community.name}
                className="min-w-[160px] md:min-w-0 rounded-2xl border border-gray-100 bg-white p-6 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-4xl">{community.emoji}</div>
                <h3 className="mt-6 text-lg font-semibold text-slate-950">{community.name}</h3>
                <p className="mt-2 text-sm font-semibold text-[#047857]">{community.players}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-lg leading-8 text-slate-700">"{testimonial.quote}"</p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.badge}</p>
                  </div>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-[#047857]">
                    {testimonial.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#0a1628] px-6 py-14 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <p className="text-lg font-black text-white">OxSporties</p>
            <p className="mt-3 text-sm text-slate-400">Bringing Oxford together through sport</p>
          </div>
          <div>
            <p className="mb-4 font-semibold text-white">Product</p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="transition hover:text-white">Features</Link></li>
              <li><Link href="#" className="transition hover:text-white">Pricing</Link></li>
              <li><Link href="#" className="transition hover:text-white">Updates</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 font-semibold text-white">Community</p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="transition hover:text-white">Stories</Link></li>
              <li><Link href="#" className="transition hover:text-white">Events</Link></li>
              <li><Link href="#" className="transition hover:text-white">Support</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 font-semibold text-white">Legal</p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="transition hover:text-white">Terms</Link></li>
              <li><Link href="#" className="transition hover:text-white">Privacy</Link></li>
              <li><Link href="#" className="transition hover:text-white">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-slate-500">© {new Date().getFullYear()} OxSporties. All rights reserved.</p>
      </footer>
    </div>
  )
}
