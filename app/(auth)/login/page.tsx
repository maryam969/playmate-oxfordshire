"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { createSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const signInWithGoogle = async () => {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://oxsporties.com/auth/callback?next=/dashboard",
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
      }
    } catch {
      setMessage("Google sign in failed. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace("/dashboard");
    } catch {
      setMessage("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 sm:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#1D9E75]">Welcome back</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Sign in to OxSporties</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Access your games, messages, and Oxfordshire sports community.</p>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1D9E75]" />
            ) : (
              <FcGoogle size={20} />
            )}
            <span>Continue with Google</span>
          </button>

          <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200" />
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
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span>Password</span>
                <Link href="/reset-password" className="text-sm font-semibold text-[#1D9E75] hover:text-emerald-600">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
              />
            </label>

            {message ? <p className="text-sm text-red-600">{message}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#1D9E75] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don’t have an account?{' '}
            <Link href="/signup" className="font-semibold text-[#1D9E75] hover:text-emerald-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}