"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const skills = ["Beginner", "Intermediate", "Advanced"];
const sports = ["Football", "Tennis", "Basketball", "Badminton", "Padel"];

export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("Oxfordshire");
  const [skill, setSkill] = useState("Intermediate");
  const [preferences, setPreferences] = useState<string[]>(["Football"]);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleToggleSport = (sport: string) => {
    setPreferences((current) =>
      current.includes(sport) ? current.filter((item) => item !== sport) : [...current, sport]
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setProfileImage(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12 sm:px-8">
        <div className="rounded-[12px] border border-[#e5e7eb] bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#1D9E75]">Welcome to PlayMate</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Complete your profile</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Tell us a bit about yourself so we can match you to the best games.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                First name
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  className="w-full rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Last name
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  className="w-full rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Profile picture
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-slate-900 outline-none transition file:cursor-pointer file:border-0 file:bg-white file:text-[#1D9E75] file:font-semibold focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
              />
              {profileImage ? <p className="mt-2 text-sm text-slate-600">Selected: {profileImage.name}</p> : null}
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Location
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </label>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Skill level</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {skills.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSkill(option)}
                    className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition ${
                      skill === option
                        ? "bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Sport preferences</p>
                <p className="text-sm text-slate-500">Select one or more</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {sports.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleToggleSport(option)}
                    className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition ${
                      preferences.includes(option)
                        ? "bg-[#1D9E75] text-white shadow-lg shadow-[#1D9E75]/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] p-4 text-right">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-[8px] bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
