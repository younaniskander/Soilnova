-- SoilNova Supabase schema. Apply through Supabase migrations after configuring auth.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, service_uuid text not null, characteristic_uuid text not null, firmware_version text,
  last_seen_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.measurement_sessions (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null, name text not null, status text not null check (status in ('active','paused','completed')),
  origin text not null check (origin in ('demo','ble','manual')), started_at timestamptz not null, ended_at timestamptz,
  notes text not null default '', location text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.measurement_sessions(id) on delete cascade, recorded_at timestamptz not null,
  origin text not null check (origin in ('demo','ble','manual')), quality text not null check (quality in ('good','fair','poor','unknown')),
  sequence integer, raw jsonb not null, values jsonb not null
);
create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.measurement_sessions(id) on delete cascade, created_at timestamptz not null default now(),
  crop_type text not null, soil_type text not null, growth_stage text not null, findings jsonb not null, recommendations jsonb not null, warnings jsonb not null
);
create table if not exists public.events_alerts (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.measurement_sessions(id) on delete cascade, event_type text not null, message text not null,
  severity text not null default 'info', occurred_at timestamptz not null default now()
);
create table if not exists public.reference_ranges (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  parameter text not null, crop_type text not null, soil_type text not null, growth_stage text not null,
  min_value numeric not null, max_value numeric not null, unit text not null, source_note text not null, verified boolean not null default false,
  check (max_value >= min_value)
);

create index if not exists idx_sessions_owner_started on public.measurement_sessions(owner_id, started_at desc);
create index if not exists idx_readings_session_recorded on public.readings(session_id, recorded_at asc);
create index if not exists idx_analysis_session_created on public.analysis_results(session_id, created_at desc);
create index if not exists idx_ranges_owner_context on public.reference_ranges(owner_id, parameter, crop_type, soil_type, growth_stage);

alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.measurement_sessions enable row level security;
alter table public.readings enable row level security;
alter table public.analysis_results enable row level security;
alter table public.events_alerts enable row level security;
alter table public.reference_ranges enable row level security;

create policy "profiles owner access" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "devices owner access" on public.devices for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "sessions owner access" on public.measurement_sessions for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "readings owner access" on public.readings for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "analysis owner access" on public.analysis_results for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "events owner access" on public.events_alerts for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "ranges owner access" on public.reference_ranges for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Prevent a caller from combining a child row with a session owned by another user.
create or replace function public.enforce_session_owner_match() returns trigger language plpgsql as $$
begin
  if not exists (select 1 from public.measurement_sessions s where s.id = new.session_id and s.owner_id = new.owner_id) then
    raise exception 'session owner mismatch';
  end if;
  return new;
end;
$$;
drop trigger if exists readings_owner_match on public.readings;
create trigger readings_owner_match before insert or update on public.readings for each row execute function public.enforce_session_owner_match();
drop trigger if exists analysis_owner_match on public.analysis_results;
create trigger analysis_owner_match before insert or update on public.analysis_results for each row execute function public.enforce_session_owner_match();
drop trigger if exists events_owner_match on public.events_alerts;
create trigger events_owner_match before insert or update on public.events_alerts for each row execute function public.enforce_session_owner_match();
