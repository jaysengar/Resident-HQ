-- 17.6 NOC / Move Requests Table
create table if not exists noc_requests (
    id uuid primary key default uuid_generate_v4(),
    society_id uuid references societies(id) on delete cascade not null,
    user_id uuid references users(id) on delete cascade not null,
    flat_number text not null,
    type text not null check (type in ('Move-In', 'Move-Out')),
    moving_date timestamp with time zone not null,
    reason text,
    status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
    admin_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table noc_requests enable row level security;

create policy "Society members can view noc requests." on noc_requests for select using (
  society_id = get_my_society_id()
);

create policy "Residents can insert noc requests." on noc_requests for insert with check (
  society_id = get_my_society_id()
);

create policy "Managers can update noc requests." on noc_requests for update using (
  society_id = get_my_society_id()
);

-- Enable realtime for noc_requests
alter publication supabase_realtime add table noc_requests;
