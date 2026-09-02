-- Campaign Chronicles
-- Player-owner map permissions
--
-- A player who owns a chronicle may manage maps and pins in THAT chronicle
-- without becoming a GM. Invited players remain read-only and only see
-- revealed maps/pins. GM/co-GM retain full management permissions.

-- Helper: technical owner of the chronicle (independent from GM role).
create or replace function public.is_campaign_owner(target_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.campaigns c
    where c.id = target_campaign_id
      and c.owner_id = auth.uid()
  );
$$;

grant execute on function public.is_campaign_owner(uuid) to authenticated;

-- Rebuild map write policies so ownership is an explicit alternative to GM.
drop policy if exists "campaign_maps_insert_gm" on public.campaign_maps;
drop policy if exists "campaign_maps_update_gm" on public.campaign_maps;
drop policy if exists "campaign_maps_delete_gm" on public.campaign_maps;
drop policy if exists "GM can insert campaign maps" on public.campaign_maps;
drop policy if exists "GM can update campaign maps" on public.campaign_maps;
drop policy if exists "GM can delete campaign maps" on public.campaign_maps;
drop policy if exists "Campaign owners and GMs can insert maps" on public.campaign_maps;
drop policy if exists "Campaign owners and GMs can update maps" on public.campaign_maps;
drop policy if exists "Campaign owners and GMs can delete maps" on public.campaign_maps;

create policy "Campaign owners and GMs can insert maps"
on public.campaign_maps
for insert
to authenticated
with check (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
);

create policy "Campaign owners and GMs can update maps"
on public.campaign_maps
for update
to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
)
with check (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
);

create policy "Campaign owners and GMs can delete maps"
on public.campaign_maps
for delete
to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
);

-- Same rule for pins.
drop policy if exists "campaign_map_pins_insert_gm" on public.campaign_map_pins;
drop policy if exists "campaign_map_pins_update_gm" on public.campaign_map_pins;
drop policy if exists "campaign_map_pins_delete_gm" on public.campaign_map_pins;
drop policy if exists "GM can insert campaign map pins" on public.campaign_map_pins;
drop policy if exists "GM can update campaign map pins" on public.campaign_map_pins;
drop policy if exists "GM can delete campaign map pins" on public.campaign_map_pins;
drop policy if exists "Campaign owners and GMs can insert map pins" on public.campaign_map_pins;
drop policy if exists "Campaign owners and GMs can update map pins" on public.campaign_map_pins;
drop policy if exists "Campaign owners and GMs can delete map pins" on public.campaign_map_pins;

create policy "Campaign owners and GMs can insert map pins"
on public.campaign_map_pins
for insert
to authenticated
with check (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
);

create policy "Campaign owners and GMs can update map pins"
on public.campaign_map_pins
for update
to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
)
with check (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
);

create policy "Campaign owners and GMs can delete map pins"
on public.campaign_map_pins
for delete
to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
);
