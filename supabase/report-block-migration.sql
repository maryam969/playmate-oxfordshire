-- Report and block features, added for Apple App Review compliance
-- (Guideline 1.2 / 2.1 requires UGC apps to have reporting and blocking
-- mechanisms). Run this in Supabase SQL Editor.

CREATE TABLE reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade not null,
  reported_user_id uuid references auth.users(id) on delete cascade not null,
  reported_message_id uuid,
  sport text,
  reason text not null,
  details text,
  status text not null default 'pending',
  created_at timestamptz default now() not null
);

CREATE TABLE blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references auth.users(id) on delete cascade not null,
  blocked_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (blocker_id, blocked_id)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Reports: users can file their own reports and see reports they filed.
-- Reviewing/actioning reports happens by you directly in Supabase's
-- Table Editor (which uses the service role and bypasses RLS), so no
-- special "admin" policy is needed here.

CREATE POLICY "Users can file their own reports"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can see their own filed reports"
  ON reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

-- Blocked users: users manage their own block list only.

CREATE POLICY "Users can view their own block list"
  ON blocked_users FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block someone"
  ON blocked_users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock someone"
  ON blocked_users FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);
