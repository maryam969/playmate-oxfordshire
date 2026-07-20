"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType(null);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://oxsporties.com/update-password",
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("If an account exists for that email, we've sent a reset link. Check your inbox.");
      setMessageType("success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 sm:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#1D9E75]">Reset password</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Reset your password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Enter your email and we&apos;ll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              {loading ? "Sending..." : "Send reset link"}
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