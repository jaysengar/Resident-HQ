-- Run this in your Supabase SQL Editor to create the society_settings table

create table if not exists society_settings (
    society_id uuid primary key references societies(id) on delete cascade,
    razorpay_key_id text,
    razorpay_key_secret text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table society_settings enable row level security;

-- Drop policy if exists
drop policy if exists "Managers can manage their society settings." on society_settings;

create policy "Managers can manage their society settings." on society_settings
  for all using (
    society_id = get_my_society_id() and get_my_role() = 'manager'
  );

-- Add to publication for realtime (optional, but good for reactivity)
do $$
begin
  if not exists (
    select 1 
    from pg_publication_rel pr 
    join pg_class c on pr.prrelid = c.oid 
    join pg_publication p on pr.prpubid = p.oid 
    where c.relname = 'society_settings' and p.pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table society_settings;
  end if;
end $$;

-- Fix any missing privileges
GRANT ALL PRIVILEGES ON TABLE society_settings TO postgres, anon, authenticated, service_role;

-- Add branding columns
ALTER TABLE society_settings
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#6d28d9',
  ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#4f46e5',
  ADD COLUMN IF NOT EXISTS society_photos text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text;

-- Allow public read access for colony public pages
DROP POLICY IF EXISTS "Public can read branding." ON society_settings;

CREATE POLICY "Public can read branding." ON society_settings
  FOR SELECT USING (true);

