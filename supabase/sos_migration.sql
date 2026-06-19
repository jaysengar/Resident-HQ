-- 17.5 Emergencies / SOS Table
create table if not exists emergencies (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    flat_number text not null,
    user_id uuid references users(id) on delete cascade not null,
    status text default 'active' check (status in ('active', 'resolved', 'false_alarm')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    resolved_at timestamp with time zone
);

alter table emergencies enable row level security;
create policy "Society members can view emergencies." on emergencies for select using (
  society_id = get_my_society_id()
);
create policy "Residents can insert emergencies." on emergencies for insert with check (
  society_id = get_my_society_id()
);
create policy "Guards and Managers can update emergencies." on emergencies for update using (
  society_id = get_my_society_id()
);

-- Enable realtime for emergencies
alter publication supabase_realtime add table emergencies;
