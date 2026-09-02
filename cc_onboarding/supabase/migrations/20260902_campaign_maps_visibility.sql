-- Campaign Chronicles · Maps visibility / Player View
alter table public.campaign_maps add column if not exists is_revealed boolean not null default false;
alter table public.campaign_map_pins add column if not exists is_revealed boolean not null default false;

-- Party location is safe to reveal by default for existing pins.
update public.campaign_map_pins set is_revealed = true where pin_type = 'party' and is_revealed = false;

-- GM/Sub-GM can read every map. Players can only read revealed maps.
drop policy if exists "campaign maps read" on public.campaign_maps;
create policy "campaign maps read" on public.campaign_maps for select to authenticated using (
  exists (
    select 1 from public.campaign_members cm
    where cm.campaign_id = campaign_maps.campaign_id and cm.user_id = auth.uid()
      and (cm.role in ('gm','co_gm') or campaign_maps.is_revealed = true)
  )
);

drop policy if exists "campaign map pins read" on public.campaign_map_pins;
create policy "campaign map pins read" on public.campaign_map_pins for select to authenticated using (
  exists (
    select 1 from public.campaign_members cm
    join public.campaign_maps m on m.id = campaign_map_pins.map_id
    where cm.campaign_id = campaign_map_pins.campaign_id and cm.user_id = auth.uid()
      and (cm.role in ('gm','co_gm') or (m.is_revealed = true and campaign_map_pins.is_revealed = true))
  )
);
