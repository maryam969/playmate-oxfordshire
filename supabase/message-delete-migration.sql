-- Allow users to delete their own chat messages.
-- Run this in Supabase SQL Editor.

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
