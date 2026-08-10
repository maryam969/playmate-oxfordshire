-- Poll feature for group chats
-- Run this in Supabase SQL Editor

CREATE TABLE polls (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  creator_name text not null,
  question text not null,
  created_at timestamptz default now() not null
);

CREATE TABLE poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade not null,
  option_text text not null,
  position int not null default 0
);

CREATE TABLE poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_option_id uuid references poll_options(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  voter_name text not null,
  voted_at timestamptz default now() not null,
  unique (poll_option_id, user_id)
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Mirrors the open, per-sport access pattern already used by the
-- messages table: any signed-in user can read and post in any
-- sport's group.

CREATE POLICY "Authenticated users can read polls"
  ON polls FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create polls"
  ON polls FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can read poll options"
  ON poll_options FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can add poll options"
  ON poll_options FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read poll votes"
  ON poll_votes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can cast their own votes"
  ON poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
  ON poll_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for live vote updates
ALTER PUBLICATION supabase_realtime ADD TABLE poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
