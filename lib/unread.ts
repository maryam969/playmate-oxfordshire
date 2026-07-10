import type { SupabaseClient } from "@supabase/supabase-js";

export const SPORTS = [
  { label: "Football", slug: "football" },
  { label: "Tennis", slug: "tennis" },
  { label: "Basketball", slug: "basketball" },
  { label: "Badminton", slug: "badminton" },
  { label: "Padel", slug: "padel" },
] as const;

export type SportSlug = (typeof SPORTS)[number]["slug"];

type ChatReadRow = {
  sport: string;
  last_read_at: string;
};

type UnreadBySport = Record<SportSlug, number>;

const FALLBACK_LAST_READ_AT = new Date(0).toISOString();

const createEmptyUnreadBySport = (): UnreadBySport => ({
  football: 0,
  tennis: 0,
  basketball: 0,
  badminton: 0,
  padel: 0,
});

export const getUnreadCountsForUser = async (
  supabase: SupabaseClient,
  userId: string
): Promise<{ total: number; bySport: UnreadBySport }> => {
  const bySport = createEmptyUnreadBySport();

  const { data: readsData, error: readsError } = await supabase
    .from("chat_reads")
    .select("sport, last_read_at")
    .eq("user_id", userId);

  if (readsError) {
    console.error("Failed to load chat read timestamps:", readsError.message);
  }

  const lastReadBySport = new Map<string, string>();
  (readsData as ChatReadRow[] | null)?.forEach((row) => {
    if (row.last_read_at) {
      lastReadBySport.set(row.sport.toLowerCase(), row.last_read_at);
    }
  });

  await Promise.all(
    SPORTS.map(async ({ slug }) => {
      const lastReadAt = lastReadBySport.get(slug) ?? FALLBACK_LAST_READ_AT;

      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sport", slug)
        .neq("user_id", userId)
        .gt("created_at", lastReadAt);

      if (error) {
        console.error(`Failed to load unread count for ${slug}:`, error.message);
        bySport[slug] = 0;
        return;
      }

      bySport[slug] = count ?? 0;
    })
  );

  const total = Object.values(bySport).reduce((sum, value) => sum + value, 0);

  return {
    total,
    bySport,
  };
};