-- Frais KM : schéma Supabase (à exécuter dans SQL Editor d'un projet dédié)
-- Chaque utilisateur ne voit et ne modifie que ses propres données (RLS).

create table if not exists fk_vehicles (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  cv int not null,
  elec boolean not null default false,
  plate text,
  created_at timestamptz not null default now()
);

create table if not exists fk_trips (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  from_addr text,
  to_addr text,
  motif text,
  km_one numeric(9,2) not null,
  round_trip boolean not null default false,
  km numeric(9,2) not null,
  veh_id text references fk_vehicles(id) on delete set null,
  validated boolean not null default false,
  same_day_ok boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists fk_trips_user_date on fk_trips(user_id, date);
create index if not exists fk_vehicles_user on fk_vehicles(user_id);

create table if not exists fk_settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  places jsonb,
  bareme jsonb,
  updated_at timestamptz not null default now()
);

alter table fk_vehicles enable row level security;
alter table fk_trips    enable row level security;
alter table fk_settings enable row level security;

drop policy if exists "fk_vehicles_own" on fk_vehicles;
drop policy if exists "fk_trips_own"    on fk_trips;
drop policy if exists "fk_settings_own" on fk_settings;
create policy "fk_vehicles_own" on fk_vehicles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "fk_trips_own"    on fk_trips    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "fk_settings_own" on fk_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Mise à jour d'une base existante (v10 : onglet Arbitrage)
alter table fk_trips add column if not exists validated boolean not null default false;
-- v11 : statut validé / à valider / suspect
alter table fk_trips add column if not exists same_day_ok boolean not null default false;
-- v12 : un trajet validé ne peut pas être supprimé (contrôle côté base)
drop policy if exists "fk_trips_own" on fk_trips;
drop policy if exists "fk_trips_select" on fk_trips;
drop policy if exists "fk_trips_insert" on fk_trips;
drop policy if exists "fk_trips_update" on fk_trips;
drop policy if exists "fk_trips_delete" on fk_trips;
create policy "fk_trips_select" on fk_trips for select to authenticated using (user_id = auth.uid());
create policy "fk_trips_insert" on fk_trips for insert to authenticated with check (user_id = auth.uid());
create policy "fk_trips_update" on fk_trips for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "fk_trips_delete" on fk_trips for delete to authenticated using (user_id = auth.uid() and not validated);

-- Droits explicites (obligatoires pour les tables créées après le 30/10/2026 : Supabase ne les accorde plus automatiquement)
-- Seuls les utilisateurs connectés accèdent aux données ; la RLS ci-dessus limite chacun à ses propres lignes.
grant select, insert, update, delete on public.fk_vehicles, public.fk_trips, public.fk_settings to authenticated;
grant select, insert, update, delete on public.fk_vehicles, public.fk_trips, public.fk_settings to service_role;
revoke all on public.fk_vehicles, public.fk_trips, public.fk_settings from anon;

-- Keepalive : fonction appelée tous les 2 jours par GitHub Actions (.github/workflows/supabase-keepalive.yml)
-- pour éviter la mise en pause du projet gratuit. Elle ne lit ni n'expose aucune donnée.
create or replace function public.fk_ping() returns timestamptz
  language sql stable security definer set search_path = public as $$ select now() $$;
revoke all on function public.fk_ping() from public;
grant execute on function public.fk_ping() to anon, authenticated;
