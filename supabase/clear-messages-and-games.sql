-- Deletes ALL messages and ALL games (and their related data) for
-- every user. Irreversible. Run in Supabase SQL Editor.

-- Chat reads (per-user "last read" markers for group chats)
DELETE FROM chat_reads;

-- Chat messages
DELETE FROM messages;

-- Game waitlist entries
DELETE FROM game_waitlist;

-- Game player/join records
DELETE FROM game_players;

-- Games themselves
DELETE FROM games;

-- Note: polls, poll_options, poll_votes, reports, and blocked_users
-- are NOT touched by this script since they weren't part of the
-- request. Let me know if you want those cleared too.
