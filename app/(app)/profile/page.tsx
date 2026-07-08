"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";
import { ChevronRight } from "lucide-react";

const sportOptions = [
  { emoji: "⚽", label: "Football" },
  { emoji: "🎾", label: "Tennis" },
  { emoji: "🏀", label: "Basketball" },
  { emoji: "🏸", label: "Badminton" },
  { emoji: "🥎", label: "Padel" },
];

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Profile updated successfully");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    const supabase = createSupabaseClient();

    const loadProfile = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        return;
      }

      setEmail(data.user.email ?? "");

      const metadata = data.user.user_metadata as {
        full_name?: string;
        name?: string;
        first_name?: string;
        last_name?: string;
      } | undefined;

      let metadataFirstName = "";
      let metadataLastName = "";

      if (metadata?.first_name || metadata?.last_name) {
        metadataFirstName = metadata.first_name ?? "";
        metadataLastName = metadata.last_name ?? "";
      } else {
        const fullName = metadata?.full_name ?? metadata?.name ?? "";
        const [first = "", ...rest] = fullName.trim().split(" ");
        metadataFirstName = first;
        metadataLastName = rest.join(" ");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, location, sports, skill_level, avatar_url")
        .eq("id", data.user.id)
        .single();

      if (!profileError && profileData) {
        setFirstName(profileData.first_name ?? metadataFirstName);
        setLastName(profileData.last_name ?? metadataLastName);
        setLocation(profileData.location ?? "");
        setSelectedSports(profileData.sports ?? []);
        setSkillLevel(profileData.skill_level ?? "");
        setProfileImage(profileData.avatar_url ?? null);
      } else {
        setFirstName(metadataFirstName);
        setLastName(metadataLastName);
      }
    };

    loadProfile();
  }, []);

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setToastType("error");
      setToastMessage("You need to be signed in to upload an avatar.");
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setAvatarUploading(true);

    const extensionFromName = file.name.split(".").pop()?.toLowerCase();
    const extensionFromType = file.type.split("/").pop()?.toLowerCase();
    const fileExtension = extensionFromName || extensionFromType || "jpg";
    const filePath = `${data.user.id}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      upsert: true,
    });

    if (uploadError) console.log("Upload error:", uploadError.message)

    if (uploadError) {
      setAvatarUploading(false);
      setToastType("error");
      setToastMessage(`Failed to upload avatar: ${uploadError.message}`);
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = publicUrlData.publicUrl;

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    setAvatarUploading(false);

    if (profileError) {
      setToastType("error");
      setToastMessage(`Failed to save avatar: ${profileError.message}`);
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setProfileImage(avatarUrl);
    setToastType("success");
    setToastMessage("Profile picture updated successfully");
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3000);
  };

  const toggleSport = (label: string) => {
    setSelectedSports((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return;
    }

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          location,
          sports: selectedSports,
          skill_level: skillLevel,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select();

    if (upsertError) {
      setToastType("error");
      setToastMessage(`Failed to save profile: ${upsertError.message}`);
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setToastType("success");
    setToastMessage("Profile updated successfully");
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] px-4 pb-[calc(64px+env(safe-area-inset-bottom)+12px)] pt-4 text-[#1a1a1a]">
      <div className="mx-auto max-w-[480px] space-y-5 pb-6">
        {showToast ? (
          <div
            className={`fixed right-4 top-4 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl ${
              toastType === "success" ? "bg-[#1D9E75] shadow-[#1D9E75]/20" : "bg-red-600 shadow-red-600/20"
            }`}
          >
            {toastType === "success" ? "✓ " : "! "}
            {toastMessage}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1D9E75] to-[#0F6E56] p-5 text-white shadow-xl shadow-[#0F6E75]/15">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={handlePictureClick}
              disabled={avatarUploading}
              className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 text-2xl font-bold text-white shadow-lg shadow-slate-900/10"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={`${firstName || "Profile"} ${lastName || ""}`.trim()}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                (firstName && lastName ? `${firstName[0] ?? ""}${lastName[0] ?? ""}` : "PL")
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />
            </button>
            <div className="flex-1">
              <p className="text-2xl font-semibold">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your profile"}
              </p>
              <p className="mt-1 text-sm text-white/80">{location || "Add your location"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSports.length > 0 ? (
                  selectedSports.map((sport) => (
                    <span
                      key={sport}
                      className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white"
                    >
                      {sportOptions.find((option) => option.label === sport)?.emoji ?? "🏅"} {sport}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    Add your sports
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={handleSave} className="space-y-5">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-slate-400">Personal Details</div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  First Name
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Last Name
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
                  />
                </label>
              </div>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Email
                <input
                  value={email}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Location
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-semibold text-slate-900">Sports I Play</div>
            <div className="flex flex-wrap gap-2">
              {sportOptions.map((sport) => {
                const active = selectedSports.includes(sport.label);
                return (
                  <button
                    key={sport.label}
                    type="button"
                    onClick={() => toggleSport(sport.label)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[#1D9E75] text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {active && <span>✓</span>}
                    <span>{sport.emoji}</span>
                    <span>{sport.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-sm font-semibold text-slate-900">Skill Level</div>
            <div className="space-y-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
                const selected = skillLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSkillLevel(level)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      selected
                        ? "border-[#1D9E75] bg-[#ECF8F2] text-[#1D9E75]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-3xl bg-[#1D9E75] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-emerald-600"
          >
            Save Profile
          </button>
        </form>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <Link href="/guidelines" className="flex items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            <span>Community Guidelines</span>
            <ChevronRight size={18} className="text-slate-400" />
          </Link>
        </section>
      </div>
    </div>
  );
}
