"use client";

import { useEffect } from "react";
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
 * REQUIRES (not done here — needs your own accounts/credentials):
 *  1. A Firebase project, with google-services.json in android/app/
 *     and GoogleService-Info.plist added to the iOS Xcode target
 *  2. An APNs auth key uploaded to Firebase (for iOS push to work)
 *  3. A `device_tokens` table in Supabase (user_id, token, platform)
 *
 * Mount once near the root, alongside NativeAuthListener. No-op on web.
 */
export default function PushNotificationSetup() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    (async () => {
      const { FirebaseMessaging } = await import("@capacitor-firebase/messaging");

      let permStatus = await FirebaseMessaging.checkPermissions();
      if (permStatus.receive === "prompt") {
        permStatus = await FirebaseMessaging.requestPermissions();
      }
      if (permStatus.receive !== "granted") return;

      const storeToken = async (token: string) => {
        try {
          const supabase = createSupabaseClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          await supabase.from("device_tokens").upsert(
            {
              user_id: user.id,
              token,
              platform: Capacitor.getPlatform(),
            },
            { onConflict: "token" }
          );
        } catch (err) {
          console.error("Failed to store push token:", err);
        }
      };

      // Get the current token immediately (also fires on iOS once APNs
      // registration completes under the hood)
      const { token } = await FirebaseMessaging.getToken();
      if (token) await storeToken(token);

      // Refresh if the token rotates while the app is running
      await FirebaseMessaging.addListener("tokenReceived", async (event) => {
        if (event.token) await storeToken(event.token);
      });
    })();
  }, []);

  return null;
}
