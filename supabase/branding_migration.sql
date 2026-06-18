-- Branding columns for society_settings (run after settings_migration.sql)
-- Supports Pro/Enterprise plan branding features

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
