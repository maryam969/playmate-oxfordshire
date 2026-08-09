"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { createSupabaseClient } from "@/lib/supabase";

/**
 * Handles the OAuth redirect when running inside the native app shell.
 *
 * Google blocks sign-in inside an embedded WebView (Capacitor's default),
 * so on native platforms the OAuth flow opens in the system browser
 * (see lib/native-auth.ts) and redirects back to the custom URL scheme
 * `com.oxsporties.app://auth/callback?code=...`. This listener catches
 * that deep link, exchanges the code for a session inside the app's
 * WebView, and closes the in-app browser.
 *
 * Mount this once near the root of the app. It's a no-op on web.
 */
export default function NativeAuthListener() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | undefined;

    (async () => {
      const { App } = await import("@capacitor/app");
      const { Browser } = await import("@capacitor/browser");

      const sub = await App.addListener("appUrlOpen", async ({ url }) => {
        console.log("appUrlOpen fired with:", url);
        if (!url.startsWith("com.oxsporties.app://auth/callback")) {
          console.log("URL did not match auth callback, ignoring");
          return;
        }

        try {
          await Browser.close();
        } catch {
          // browser may already be closed, ignore
        }

        const code = new URL(url).searchParams.get("code");
        const next = new URL(url).searchParams.get("next") ?? "/dashboard";
        console.log("Extracted code:", code ? "present" : "MISSING");

        if (code) {
          const supabase = createSupabaseClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            console.log("Session exchange succeeded, redirecting to", next);
            router.replace(next);
          } else {
            console.log("Session exchange failed:", error.message);
            router.replace("/login?error=auth");
          }
        }
      });

      removeListener = () => sub.remove();
    })();

    return () => removeListener?.();
  }, [router]);

  return null;
}
