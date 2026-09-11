-- ============================================================================
-- Ganesh Utsav 2026 - Supabase setup (tables + Row Level Security)
-- ----------------------------------------------------------------------------
-- HOW TO USE
--   1. Open your Supabase project -> SQL Editor -> New query.
--   2. Paste this whole file and click RUN.
--   3. Create the admin account:
--        a) Supabase dashboard -> Authentication -> Users -> Add user
--           (email + password for the single admin).
--        b) Run this update with that user's id (copy it from the Users table):
--
--           update public.profiles
--           set role = 'supa_admin'
--           where id = '<THE ADMIN USER ID>';
--
--   4. Only that account can log in at /auth/login and open /admin.
--      Every other visitor can only read announcements/schedule/games/teams
--      and register for games - they can never write to the database.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;          -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- profiles - one row per auth user; role 'supa_admin' marks THE single admin
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  room_number text,
  role        text not null default 'participant'
              check (role in ('participant', 'supa_admin')),
  created_at  timestamptz not null default now()
);

-- Create a profile automatically whenever a new auth user is added.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- True only for the single authenticated account whose profile role is
-- 'supa_admin'. SECURITY DEFINER lets it read profiles even under RLS.
create or replace function public.is_supa_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'supa_admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- teams - the groups participants are assigned to
-- ----------------------------------------------------------------------------
create table if not exists public.teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  short_name text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- participants - public registration, no account needed
-- ----------------------------------------------------------------------------
create table if not exists public.participants (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text not null,
  room_number text,
  team_id     uuid references public.teams (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- games - the activities the admin publishes
-- ----------------------------------------------------------------------------
create table if not exists public.games (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null unique,          -- public URL /games/<slug>
  game_type          text not null default 'Individual',
  description        text,
  icon               text,
  max_players        integer,
  registration_open  boolean not null default true,
  created_at         timestamptz not null default now()
);

-- If the games table already existed without slug/icon, add them now and
-- backfill a slug from the name for every existing row.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'games'
      and column_name = 'slug'
  ) then
    alter table public.games add column slug text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'games'
      and column_name = 'icon'
  ) then
    alter table public.games add column icon text;
  end if;
end $$;

do $$
begin
  update public.games
  set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
  where slug is null or slug = '';

  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'games'
      and constraint_type = 'UNIQUE'
      and constraint_name = 'games_slug_key'
  ) then
    alter table public.games add constraint games_slug_key unique (slug);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- registrations - one link between one participant and one game
-- ----------------------------------------------------------------------------
create table if not exists public.registrations (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants (id) on delete cascade,
  game_id        uuid not null references public.games (id) on delete cascade,
  status         text not null default 'confirmed',
  registered_at  timestamptz not null default now(),
  unique (participant_id, game_id)
);

-- ----------------------------------------------------------------------------
-- event_schedule - the daily event timetable
-- ----------------------------------------------------------------------------
create table if not exists public.event_schedule (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  day_number   integer not null default 1,
  event_date   date,
  start_time   time,
  end_time     time,
  location     text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- announcements - event updates published by the admin
-- ----------------------------------------------------------------------------
create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  message    text not null,
  priority   integer not null default 0,
  published  boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Public helper used by the /teams page (returns teams + visible member names)
-- SECURITY DEFINER bypasses RLS so members can be shown without exposing
-- phone numbers or room numbers.
-- ----------------------------------------------------------------------------
create or replace function public.get_public_team_members()
returns table (
  team_id    uuid,
  team_name  text,
  short_name text,
  member_id  uuid,
  full_name  text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.id         as team_id,
    t.name       as team_name,
    t.short_name,
    p.id         as member_id,
    p.full_name  as full_name
  from public.teams t
  left join public.participants p on p.team_id = t.id
  order by t.name, p.full_name
$$;

-- ----------------------------------------------------------------------------
-- chanda_payments - public chanda/donation records
-- ----------------------------------------------------------------------------
create table if not exists public.chanda_payments (
  id               uuid primary key default gen_random_uuid(),
  contributor_name text not null,
  phone            text,
  amount           numeric(10,2) not null,
  utr_number       text not null,
  payment_method   text not null default 'upi',
  created_at       timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Rule: everyone can READ public content and REGISTER (insert participants /
-- registrations). Only the supa_admin account can write to anything else.
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.teams          enable row level security;
alter table public.participants   enable row level security;
alter table public.games          enable row level security;
alter table public.registrations  enable row level security;
alter table public.event_schedule enable row level security;
alter table public.announcements  enable row level security;
alter table public.chanda_payments enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles_select_own"          on public.profiles;
drop policy if exists "profiles_insert_own"          on public.profiles;
drop policy if exists "profiles_admin_all"           on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (public.is_supa_admin());

-- teams ---------------------------------------------------------------------
drop policy if exists "teams_public_read"   on public.teams;
drop policy if exists "teams_admin_all"     on public.teams;

create policy "teams_public_read" on public.teams
  for select to anon, authenticated
  using (true);

create policy "teams_admin_all" on public.teams
  for all to authenticated
  using (public.is_supa_admin());

-- participants ---------------------------------------------------------------
drop policy if exists "participants_public_read"    on public.participants;
drop policy if exists "participants_public_register" on public.participants;
drop policy if exists "participants_admin_update"   on public.participants;
drop policy if exists "participants_admin_delete"   on public.participants;

create policy "participants_public_read" on public.participants
  for select to anon, authenticated
  using (true);

create policy "participants_public_register" on public.participants
  for insert to anon, authenticated
  with check (true);

create policy "participants_admin_update" on public.participants
  for update to authenticated
  using (public.is_supa_admin());

create policy "participants_admin_delete" on public.participants
  for delete to authenticated
  using (public.is_supa_admin());

-- games ---------------------------------------------------------------------
drop policy if exists "games_public_read" on public.games;
drop policy if exists "games_admin_all"   on public.games;

create policy "games_public_read" on public.games
  for select to anon, authenticated
  using (true);

create policy "games_admin_all" on public.games
  for all to authenticated
  using (public.is_supa_admin());

-- registrations ---------------------------------------------------------------
drop policy if exists "registrations_public_read" on public.registrations;
drop policy if exists "registrations_public_join" on public.registrations;
drop policy if exists "registrations_admin_all"   on public.registrations;

-- Anyone can see game registrations (the /my-games page reads them for the
-- participant id saved in that visitor's own browser).
create policy "registrations_public_read" on public.registrations
  for select to anon, authenticated
  using (true);

create policy "registrations_public_join" on public.registrations
  for insert to anon, authenticated
  with check (true);

create policy "registrations_admin_all" on public.registrations
  for all to authenticated
  using (public.is_supa_admin());

-- event_schedule -------------------------------------------------------------
drop policy if exists "event_schedule_public_read" on public.event_schedule;
drop policy if exists "event_schedule_admin_all"   on public.event_schedule;

create policy "event_schedule_public_read" on public.event_schedule
  for select to anon, authenticated
  using (true);

create policy "event_schedule_admin_all" on public.event_schedule
  for all to authenticated
  using (public.is_supa_admin());

-- announcements ---------------------------------------------------------------
drop policy if exists "announcements_public_read" on public.announcements;
drop policy if exists "announcements_admin_all"   on public.announcements;

create policy "announcements_public_read" on public.announcements
  for select to anon, authenticated
  using (true);

create policy "announcements_admin_all" on public.announcements
  for all to authenticated
  using (public.is_supa_admin());

-- chanda_payments -------------------------------------------------------------
drop policy if exists "chanda_public_insert" on public.chanda_payments;
drop policy if exists "chanda_admin_read"     on public.chanda_payments;

-- Anyone can submit a chanda / donation payment.
create policy "chanda_public_insert" on public.chanda_payments
  for insert to anon, authenticated
  with check (true);

-- Only supa_admin can read donation records.
create policy "chanda_admin_read" on public.chanda_payments
  for select to authenticated
  using (public.is_supa_admin());


-- ============================================================================
-- Seed games (only when the games table is empty so existing data is kept)
-- ============================================================================
insert into public.games (
  name, slug, game_type, description, icon, max_players, registration_open
)
select
  seed.name, seed.slug, seed.game_type, seed.description,
  seed.icon, seed.max_players, seed.registration_open
from (
  values
    ('Chess',       'chess',      'Individual',        'Individual chess tournament between hostel participants.', '♟️', 32,  true),
    ('Cricket',     'cricket',    'Team',              'Short-format team cricket competition.',                   '🏏', 44,  true),
    ('Carrom',      'carrom',     'Individual / Team', 'Friendly carrom competition.',                             '🎯', 32,  true),
    ('Quiz',        'quiz',       'Team',              'General knowledge and Ganesh Utsav quiz.',                 '🧠', null, true),
    ('Fun Games',   'fun',        'Team / Individual', 'Simple games and activities for everyone.',                '🎮', null, true)
) as seed (name, slug, game_type, description, icon, max_players, registration_open)
where not exists (select 1 from public.games);

-- ============================================================================
-- Next steps (after running this file)
--   1. Create the single admin user in Authentication -> Users.
--   2. Set their role:
--        update public.profiles set role = 'supa_admin'
--        where id = '<ADMIN USER ID>';
--   3. Log in at /auth/login and manage at /admin.
-- Every other visitor only reads public content and registers for games.
-- ============================================================================