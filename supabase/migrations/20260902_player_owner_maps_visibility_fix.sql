-- Campaign Chronicles
-- Player-owner maps visibility fix
--
-- Root cause:
-- campaign_maps INSERT uses `return=representation` / `.select('*')`.
-- The newly-created map defaults to is_revealed=false.
-- The old SELECT policy only allowed GM/co-GM to read unrevealed maps,
-- so a player-owner could pass INSERT but fail the RETURNING/SELECT step
-- with RLS error 42501.
--
-- A technical campaign owner must be able to read/manage private maps/pins
-- in their own chronicle without becoming GM.

begin;

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

-- MAPS READ
drop policy if exists "campaign maps read" on public.campaign_maps;

create policy "campaign maps read"
on public.campaign_maps
for select
to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
  or (
    is_revealed = true
    and public.is_campaign_member(campaign_id)
  )
);

-- PINS READ
drop policy if exists "campaign map pins read" on public.campaign_map_pins;

create policy "campaign map pins read"
on public.campaign_map_pins
for select
to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or public.is_campaign_owner(campaign_id)
  or (
    is_revealed = true
    and public.is_campaign_member(campaign_id)
    and exists (
      select 1
      from public.campaign_maps m
      where m.id = campaign_map_pins.map_id
        and m.campaign_id = campaign_map_pins.campaign_id
        and m.is_revealed = true
    )
  )
);

commit;
