-- Create a table to store direct messages between residents and managers
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
    flat_number TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL, -- 'resident' or 'manager'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Residents can view messages for their flat and society
CREATE POLICY "Residents can view their flat messages"
    ON public.direct_messages
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT resident_id FROM public.flats 
            WHERE flats.society_id = direct_messages.society_id 
            AND flats.flat_number = direct_messages.flat_number
        )
    );

-- Residents can insert messages for their flat and society
CREATE POLICY "Residents can insert their flat messages"
    ON public.direct_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT resident_id FROM public.flats 
            WHERE flats.society_id = direct_messages.society_id 
            AND flats.flat_number = direct_messages.flat_number
        )
    );

-- Managers can view all messages for their society
CREATE POLICY "Managers can view all messages in their society"
    ON public.direct_messages
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE users.society_id = direct_messages.society_id 
            AND users.role = 'manager'
        )
    );

-- Managers can insert messages for their society
CREATE POLICY "Managers can insert messages for their society"
    ON public.direct_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE users.society_id = direct_messages.society_id 
            AND users.role = 'manager'
        )
    );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_direct_messages_society_flat ON public.direct_messages(society_id, flat_number);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at);
