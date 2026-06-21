-- Add the table to the publication so that WebSocket (Realtime) subscriptions work
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
