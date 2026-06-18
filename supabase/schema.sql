-- Supabase Database Schema for Smart Society SaaS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Societies Table (Multi-tenant isolation)
create table societies (
    id uuid primary key default uuid_generate_v4(),
    slug text unique not null,
    name text not null,
    address text,
    logo_url text,
    primary_color text default '#6d28d9',
    max_flats integer default 50,
    plan text default 'basic',
    bill_amount integer default 2500, -- Configurable per society
    subscription_expires_at timestamp with time zone default timezone('utc'::text, now() + interval '30 days'),
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Users Table (Extends Supabase Auth)
-- This assumes users are created in auth.users first.
create table users (
    id uuid primary key references auth.users(id) on delete cascade,
    society_id uuid references societies(id) on delete cascade, -- Nullable for Super Admin
    role text not null check (role in ('resident', 'guard', 'manager', 'admin')),
    name text not null,
    email text, -- Stored here so client can access it (auth.users is not joinable)
    phone text,
    flat_no text, -- For residents
    members_count integer default 1,
    aadhaar_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Flats Table
create table flats (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    flat_number text not null,
    resident_id uuid references users(id) on delete set null,
    dues_status text default 'paid' check (dues_status in ('paid', 'unpaid', 'partial')),
    dues_amount integer default 0, -- DEPRECATED in favor of bills table
    due_date timestamp with time zone, -- DEPRECATED
    flat_type text default '3 BHK',
    occupancy_type text default 'Owner' check (occupancy_type in ('Owner', 'Tenant')),
    move_in_date timestamp with time zone default timezone('utc'::text, now()), -- When resident moved in
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(society_id, flat_number)
);

-- 4. Visitors Table (Used by Guard App for realtime)
create table visitors (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    flat_number text not null, -- denormalized for easier guard UI
    name text not null,
    company text,
    phone text,
    type text not null check (type in ('Visitor', 'Delivery', 'Cab', 'Staff')),
    status text default 'pending' check (status in ('pending', 'approved', 'denied', 'exited', 'pre_approved')),
    entry_code text,
    entered_at timestamp with time zone default timezone('utc'::text, now()) not null,
    exited_at timestamp with time zone
);

-- 5. Helpdesk Tickets Table (Viewable by both Guard and Manager)
create table helpdesk_tickets (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    flat_number text not null,
    resident_name text not null,
    title text not null,
    description text,
    category text,
    status text default 'Open' check (status in ('Open', 'In Progress', 'Resolved')),
    priority text default 'Medium' check (priority in ('Low', 'Medium', 'High')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Announcements Table
create table announcements (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    title text not null,
    body text not null,
    author_role text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Community Posts Table
create table community_posts (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    author_name text not null,
    flat_number text not null,
    content text not null,
    type text not null check (type in ('General', 'Buy/Sell')),
    price text,
    image_url text, -- For Cloudinary integration
    contact text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Helper function for RLS policies (returns the society_id of the logged-in user)
create or replace function get_my_society_id()
returns uuid
language sql
security definer
stable
as $$
  select society_id from users where id = auth.uid()
$$;

-- Helper function to get role of logged-in user
create or replace function get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from users where id = auth.uid()
$$;

-- 8. Row Level Security (RLS) Policies
alter table societies enable row level security;
alter table users enable row level security;
alter table flats enable row level security;
alter table visitors enable row level security;
alter table helpdesk_tickets enable row level security;
alter table announcements enable row level security;
alter table community_posts enable row level security;

-- Strict RLS setup based on auth token society_id
create policy "Societies are viewable by everyone." on societies for select using (true);
create policy "Societies can be created by admin." on societies for insert with check (auth.jwt() ->> 'role' = 'admin');
create policy "Societies can be updated by admin." on societies for update using (
  get_my_role() = 'admin'
);
create policy "Societies can be deleted by admin." on societies for delete using (
  get_my_role() = 'admin'
);

create policy "Users are viewable by society members." on users for select using (
  id = auth.uid() or
  society_id = get_my_society_id() or
  get_my_role() = 'admin'
);
create policy "Users can insert their own profile." on users for insert with check (
  auth.uid() = id
);
create policy "Managers can delete users in their society." on users for delete using (
  society_id = get_my_society_id() and get_my_role() = 'manager'
);

create policy "Flats are viewable by society members." on flats for select using (
  society_id = get_my_society_id()
);
create policy "Managers can delete flats." on flats for delete using (
  society_id = get_my_society_id() and get_my_role() = 'manager'
);

-- Visitors: scoped to society members (not open to all)
create policy "Visitors are viewable by society members." on visitors for select using (
  society_id = get_my_society_id()
);
create policy "Guards can insert visitors." on visitors for insert with check (
  society_id = get_my_society_id()
);
create policy "Guards and Managers can update visitors." on visitors for update using (
  society_id = get_my_society_id()
);

-- Helpdesk tickets: scoped to society members (not open to all)
create policy "Helpdesk tickets are viewable by society members." on helpdesk_tickets for select using (
  society_id = get_my_society_id()
);
create policy "Residents can insert tickets." on helpdesk_tickets for insert with check (
  society_id = get_my_society_id()
);
create policy "Managers and Guards can update tickets." on helpdesk_tickets for update using (
  society_id = get_my_society_id()
);

create policy "Announcements are viewable by society members." on announcements for select using (
  society_id = get_my_society_id()
);
create policy "Managers and Guards can insert announcements." on announcements for insert with check (
  society_id = get_my_society_id()
);
create policy "Managers and Guards can delete announcements." on announcements for delete using (
  society_id = get_my_society_id()
);

create policy "Community posts are viewable by society members." on community_posts for select using (
  society_id = get_my_society_id()
);
create policy "Residents can insert posts." on community_posts for insert with check (
  society_id = get_my_society_id()
);

-- NOTE: Realtime publication setup has been moved to the end of this file
-- to ensure all tables are created before they are added to the publication.

-- 8. Payments Table
create table if not exists payments (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    flat_number text not null,
    amount numeric not null,
    method text not null,
    status text default 'Success',
    month text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table payments enable row level security;
create policy "Residents can view their own payments." on payments for select using (
  society_id = get_my_society_id()
);
create policy "Residents can insert payments." on payments for insert with check (
  society_id = get_my_society_id()
);

-- 8.5 Bills Table
create table if not exists bills (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    flat_number text not null,
    title text not null,
    amount numeric not null,
    status text default 'unpaid' check (status in ('unpaid', 'paid', 'partial')),
    due_date timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table bills enable row level security;
create policy "Residents can view their bills." on bills for select using (
  society_id = get_my_society_id()
);
create policy "Managers can insert bills." on bills for insert with check (
  society_id = get_my_society_id()
);
create policy "Managers can update bills." on bills for update using (
  society_id = get_my_society_id()
);

-- 9. Polls Table
create table if not exists polls (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    question text not null,
    options jsonb not null, -- e.g. ["Option A", "Option B"]
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table polls enable row level security;
create policy "Society members can view polls." on polls for select using (
  society_id = get_my_society_id()
);
create policy "Managers can create polls." on polls for insert with check (
  society_id = get_my_society_id()
);

-- 10. Poll Votes Table
create table if not exists poll_votes (
    id uuid primary key default uuid_generate_v4(),
    poll_id uuid references polls(id) on delete cascade not null,
    flat_number text not null,
    option_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(poll_id, flat_number)
);

alter table poll_votes enable row level security;
create policy "Society members can view votes." on poll_votes for select using (
  poll_id in (select id from polls where society_id = get_my_society_id())
);
create policy "Residents can vote." on poll_votes for insert with check (
  poll_id in (select id from polls where society_id = get_my_society_id())
);

-- 11. Documents Table
create table if not exists documents (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    title text not null,
    category text not null,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table documents enable row level security;
create policy "Society members can view documents." on documents for select using (
  society_id = get_my_society_id()
);
create policy "Managers can upload documents." on documents for insert with check (
  society_id = get_my_society_id()
);

-- 12. System Logs Table
create table if not exists system_logs (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
    severity text not null,
    message text not null,
    source text not null
);

-- System logs are typically fetched by the backend (Service Role), so RLS can just restrict client writes.
alter table system_logs enable row level security;
create policy "No direct client writes to system_logs" on system_logs for insert with check (false);
create policy "Super Admins can read system_logs" on system_logs for select using (
  get_my_role() = 'admin'
);

-- 13. Service Providers Table
create table if not exists service_providers (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    name text not null,
    category text not null,
    phone text not null,
    rating numeric default 0,
    reviews_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table service_providers enable row level security;
create policy "Society members can view providers." on service_providers for select using (
  society_id = get_my_society_id()
);
create policy "Managers can insert providers." on service_providers for insert with check (
  society_id = get_my_society_id()
);
create policy "Managers can update providers." on service_providers for update using (
  society_id = get_my_society_id()
);

-- 14. Notifications Table (In-app notifications for reminders, alerts, etc.)
create table if not exists notifications (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    flat_number text, -- null for society-wide notifications
    type text not null check (type in ('payment_reminder', 'gate_alert', 'announcement', 'ticket_update', 'general')),
    title text not null,
    body text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notifications enable row level security;
create policy "Society members can view their notifications." on notifications for select using (
  society_id = get_my_society_id()
);
create policy "Managers can insert notifications." on notifications for insert with check (
  society_id = get_my_society_id()
);
create policy "Users can update own notifications." on notifications for update using (
  society_id = get_my_society_id()
);

-- 15. Billing History Table (Track monthly bills for historical charts)
create table if not exists billing_history (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    month text not null, -- e.g. "Jan", "Feb"
    year integer not null,
    total_billed numeric not null default 0,
    total_collected numeric not null default 0,
    total_pending numeric not null default 0,
    flats_count integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(society_id, month, year)
);

alter table billing_history enable row level security;
create policy "Society members can view billing history." on billing_history for select using (
  society_id = get_my_society_id()
);

-- 16. Subscription Plans Table
create table if not exists subscription_plans (
    id text primary key, -- e.g. "Basic", "Pro"
    price_inr integer not null,
    max_flats integer not null,
    features jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pre-populate some plans
insert into subscription_plans (id, price_inr, max_flats, features) values
  ('Basic', 5000, 100, '["Resident App", "Guard App", "Basic Helpdesk"]'::jsonb),
  ('Pro', 15000, 300, '["Everything in Basic", "Payment Gateway", "Polls & Notices"]'::jsonb),
  ('Enterprise', 25000, 1000, '["Everything in Pro", "Custom Branding", "Priority Support"]'::jsonb)
on conflict do nothing;

create policy "Plans are viewable by everyone." on subscription_plans for select using (true);

-- 17. Service Categories Table
create table if not exists service_categories (
    id text primary key, -- e.g. "plumbing"
    label text not null,
    icon_name text not null,
    color_class text not null,
    type text not null check (type in ('helpdesk', 'directory')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pre-populate some categories
insert into service_categories (id, label, icon_name, color_class, type) values
  ('plumbing', 'Plumbing', 'Droplet', 'text-sky-600 bg-sky-50', 'helpdesk'),
  ('electrical', 'Electrical', 'Zap', 'text-amber-600 bg-amber-50', 'helpdesk'),
  ('maids', 'Maids', 'Users', 'text-pink-600 bg-pink-50', 'directory'),
  ('car_wash', 'Car Wash', 'Car', 'text-blue-600 bg-blue-50', 'directory')
on conflict do nothing;

create policy "Service categories viewable by everyone." on service_categories for select using (true);

-- Enable realtime on tables (after ALL table definitions)
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table visitors;
alter publication supabase_realtime add table helpdesk_tickets;
alter publication supabase_realtime add table announcements;
alter publication supabase_realtime add table community_posts;
alter publication supabase_realtime add table polls;
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table bills;
alter publication supabase_realtime add table notifications;

-- 18. Society Settings
create table if not exists society_settings (
    society_id uuid primary key references societies(id) on delete cascade,
    razorpay_key_id text,
    razorpay_key_secret text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table society_settings enable row level security;
create policy "Managers can manage their society settings." on society_settings
  for all using (
    society_id = get_my_society_id() and get_my_role() = 'manager'
  );

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
