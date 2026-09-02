-- Campaign Chronicles · Campaign Maps v1
-- Run this once in Supabase SQL Editor before using Maps.

create table if not exists public.campaign_maps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  description text,
  image_path text not null,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_map_pins (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.campaign_maps(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  pin_type text not null default 'custom' check (pin_type in ('location','party','npc','faction','custom')),
  label text not null,
  description text,
  x double precision not null check (x >= 0 and x <= 100),
  y double precision not null check (y >= 0 and y <= 100),
  linked_entity_type text check (linked_entity_type is null or linked_entity_type in ('locations','npcs','factions')),
  linked_entity_id uuid,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaign_maps_campaign_idx on public.campaign_maps(campaign_id, created_at);
create index if not exists campaign_map_pins_map_idx on public.campaign_map_pins(map_id, created_at);
create index if not exists campaign_map_pins_campaign_idx on public.campaign_map_pins(campaign_id);

alter table public.campaign_maps enable row level security;
alter table public.campaign_map_pins enable row level security;

-- Every campaign member can see the atlas.
drop policy if exists "campaign maps read" on public.campaign_maps;
create policy "campaign maps read" on public.campaign_maps for select to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_maps.campaign_id and cm.user_id = auth.uid())
);

drop policy if exists "campaign map pins read" on public.campaign_map_pins;
create policy "campaign map pins read" on public.campaign_map_pins for select to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_map_pins.campaign_id and cm.user_id = auth.uid())
);

-- Editing is deliberately GM/Sub-GM only in v1.
drop policy if exists "campaign maps insert" on public.campaign_maps;
create policy "campaign maps insert" on public.campaign_maps for insert to authenticated with check (
  created_by = auth.uid() and exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_maps.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
drop policy if exists "campaign maps update" on public.campaign_maps;
create policy "campaign maps update" on public.campaign_maps for update to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_maps.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
) with check (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_maps.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
drop policy if exists "campaign maps delete" on public.campaign_maps;
create policy "campaign maps delete" on public.campaign_maps for delete to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_maps.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);

drop policy if exists "campaign map pins insert" on public.campaign_map_pins;
create policy "campaign map pins insert" on public.campaign_map_pins for insert to authenticated with check (
  created_by = auth.uid() and exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_map_pins.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
drop policy if exists "campaign map pins update" on public.campaign_map_pins;
create policy "campaign map pins update" on public.campaign_map_pins for update to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_map_pins.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
) with check (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_map_pins.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
drop policy if exists "campaign map pins delete" on public.campaign_map_pins;
create policy "campaign map pins delete" on public.campaign_map_pins for delete to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = campaign_map_pins.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
