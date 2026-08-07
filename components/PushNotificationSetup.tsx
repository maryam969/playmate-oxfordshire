"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { createSupabaseClient } from "@/lib/supabase";

/**
 * Requests push notification permission on native platforms and stores
 * the device's FCM/APNs token against the signed-in user.
 *
 * REQUIRES (not done here — needs your own accounts/credentials):
 *  1. A Firebase project, with google-services.json dropped into
 *     android/app/ and GoogleService-Info.plist dropped into ios/App/App/
 *  2. An APNs auth key uploaded to Firebase (for iOS push to work)
 *  3. A `device_tokens` table in Supabase (user_id, token, platform)
 *     — mirrors the pattern used in lib/notify.ts's send-notification
 *     function, which can be extended to also send FCM pushes.
 *
 * Mount once near the root, alongside NativeAuthListener. No-op on web.
 */
export default function PushNotificationSetup() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== "granted") return;

      await PushNotifications.register();

      PushNotifications.addListener("registration", async (token) => {
        try {
          const supabase = createSupabaseClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          await supabase.from("device_tokens").upsert(
            {
              user_id: user.id,
              token: token.value,
              platform: Capacitor.getPlatform(),
            },
            { onConflict: "token" }
          );
        } catch (err) {
          console.error("Failed to store push token:", err);
        }
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.error("Push registration error:", err);
      });
    })();
  }, []);

  return null;
}
