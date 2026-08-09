"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { createSupabaseClient } from "@/lib/supabase";

/**
 * Requests push notification permission on native platforms and stores
 * the device's FCM token against the signed-in user.
 *
 * Uses @capacitor-firebase/messaging (not the plain @capacitor/push-
 * notifications plugin) so that iOS produces a real FCM token rather
 * than a raw APNs token — this lets the Firebase Admin SDK (or Cloud
 * Functions) send to both platforms through one consistent API.
 *
 * IMPORTANT: token retrieval and sign-in are independent async flows —
 * a token can arrive before the user has finished signing in (e.g.
 * while they're still in the system browser completing Google OAuth).
 * So this component keeps the latest token in a ref and ALSO listens
 * for auth state changes, storing the token whenever a user becomes
 * available — not just once on mount.
 *
 * REQUIRES (not done here — needs your own accounts/credentials):
 *  1. A Firebase project, with google-services.json in android/app/
 *     and GoogleService-Info.plist added to the iOS Xcode target
 *  2. An APNs auth key uploaded to Firebase (for iOS push to work)
 *  3. A `device_tokens` table in Supabase (user_id, token, platform)
 *
 * Mount once near the root, alongside NativeAuthListener. No-op on web.
 */
export default function PushNotificationSetup() {
  const latestToken = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const supabase = createSupabaseClient();

    const storeToken = async (token: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("Push token ready, waiting for sign-in to store it");
          return;
        }

        const { error } = await supabase.from("device_tokens").upsert(
          {
            user_id: user.id,
            token,
            platform: Capacitor.getPlatform(),
          },
          { onConflict: "token" }
        );

        if (error) {
          console.error("Failed to store push token:", error.message);
        } else {
          console.log("Push token stored successfully");
        }
      } catch (err) {
        console.error("Failed to store push token:", err);
      }
    };

    // Re-attempt storing whenever auth state changes (covers the case
    // where the token arrived before sign-in finished)
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && latestToken.current) {
        storeToken(latestToken.current);
      }
    });

    (async () => {
      const { FirebaseMessaging } = await import("@capacitor-firebase/messaging");

      let permStatus = await FirebaseMessaging.checkPermissions();
      if (permStatus.receive === "prompt") {
        permStatus = await FirebaseMessaging.requestPermissions();
      }
      if (permStatus.receive !== "granted") return;

      const { token } = await FirebaseMessaging.getToken();
      if (token) {
        latestToken.current = token;
        await storeToken(token);
      }

      await FirebaseMessaging.addListener("tokenReceived", async (event) => {
        if (event.token) {
          latestToken.current = event.token;
          await storeToken(event.token);
        }
      });
    })();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return null;
}
