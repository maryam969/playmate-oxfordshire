import { Capacitor } from "@capacitor/core";
import { createSupabaseClient } from "@/lib/supabase";

/**
 * Google refuses to complete sign-in inside an embedded WebView
 * (returns `disallowed_useragent`). On native platforms we get the
 * OAuth URL from Supabase without redirecting, then open it in the
 * system browser (SFSafariViewController on iOS / Custom Tabs on
 * Android) via @capacitor/browser. Google redirects back to our
 * custom URL scheme, which NativeAuthListener picks up.
 *
 * On web this behaves exactly as before (standard redirect flow).
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = createSupabaseClient();

  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import("@capacitor/browser");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "com.oxsporties.app://auth/callback?next=/dashboard",
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      return { error: error?.message ?? "Google sign in failed. Please try again." };
    }

    await Browser.open({ url: data.url, presentationStyle: "popover" });
    return { error: null };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://oxsporties.com/auth/callback?next=/dashboard",
    },
  });

  return { error: error?.message ?? null };
}
