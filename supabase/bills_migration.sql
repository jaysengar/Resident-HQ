-- Run this in your Supabase SQL Editor

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

-- Drop policies if they already exist to prevent "policy already exists" errors
drop policy if exists "Residents can view their bills." on bills;
drop policy if exists "Managers can insert bills." on bills;
drop policy if exists "Managers can update bills." on bills;

create policy "Residents can view their bills." on bills for select using (
  society_id = get_my_society_id()
);
create policy "Managers can insert bills." on bills for insert with check (
  society_id = get_my_society_id()
);
create policy "Managers can update bills." on bills for update using (
  society_id = get_my_society_id()
);

-- Add to publication if not already added
do $$
begin
  if not exists (
    select 1 
    from pg_publication_rel pr 
    join pg_class c on pr.prrelid = c.oid 
    join pg_publication p on pr.prpubid = p.oid 
    where c.relname = 'bills' and p.pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table bills;
  end if;
end $$;

