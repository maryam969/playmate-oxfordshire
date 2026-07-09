import { createSupabaseClient } from "@/lib/supabase";

export async function sendNotification(to: string, subject: string, html: string) {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      "https://iihqeomacudfuzvjwuuq.supabase.co/functions/v1/send-notification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ to, subject, html }),
      }
    );
    if (!res.ok) console.error("Notification failed:", await res.text());
  } catch (err) {
    console.error("Notification error:", err);
  }
}