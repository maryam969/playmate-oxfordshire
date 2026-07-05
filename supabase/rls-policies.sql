CREATE POLICY "Users can delete their own game_players"
ON game_players
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Hosts can update their own games"
ON games
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);
