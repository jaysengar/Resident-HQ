-- Add the notifications table to the publication so that WebSocket (Realtime) subscriptions work
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
