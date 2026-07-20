"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | null>(null);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (data.session) {
        setSessionValid(true);
        setMessage("");
        setMessageType(null);
      } else {
        setSessionValid(false);
        setMessage("This reset link is invalid or has expired.");
        setMessageType("error");
      }

      setCheckingSession(false);
    };

    void verifySession();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setMessageType(null);

    if (!sessionValid) {
      setMessage("This reset link is invalid or has expired.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Password updated ✓");
      setMessageType("success");
      window.setTimeout(() => {
        router.push("/login");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 sm:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#1D9E75]">Reset password</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Set a new password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Checking your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 sm:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#1D9E75]">Reset password</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Set a new password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
            <p className="mt-6 text-sm">
              <Link href="/reset-password" className="font-semibold text-[#1D9E75] hover:text-emerald-600">
                Back to reset password
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 sm:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#1D9E75]">Reset password</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Set a new password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Choose a new password for your OxSporties account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </label>

            {message ? (
              <p className={`text-sm ${messageType === "error" ? "text-red-600" : "text-emerald-700"}`}>{message}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#1D9E75] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link href="/login" className="font-semibold text-[#1D9E75] hover:text-emerald-600">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}