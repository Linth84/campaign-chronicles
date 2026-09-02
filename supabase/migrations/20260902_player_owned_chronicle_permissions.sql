-- Campaign Chronicles · Player-owned chronicle permissions
--
-- A player does NOT become a GM because they own the campaign record.
-- The owner may, however, author the normal (non-GM) chronicle they created.
-- GM-only capabilities remain role-based through public.is_campaign_gm().

create or replace function public.is_campaign_member(target_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.campaign_members cm
    where cm.campaign_id = target_campaign_id
      and cm.user_id = auth.uid()
  );
$$;

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

grant execute on function public.is_campaign_member(uuid) to authenticated;
grant execute on function public.is_campaign_owner(uuid) to authenticated;

-- Normal chronicle tables: every campaign member can read them.
-- The campaign owner can author their personal chronicle without receiving GM role.
-- GM/co-GM retain write access through is_campaign_gm().
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'characters',
    'sessions',
    'npcs',
    'locations',
    'quests',
    'items',
    'notes',
    'timeline_events'
  ] loop
    execute format('drop policy if exists "cc member read" on public.%I', tbl);
    execute format(
      'create policy "cc member read" on public.%I for select to authenticated using (public.is_campaign_member(campaign_id))',
      tbl
    );

    execute format('drop policy if exists "cc owner or gm insert" on public.%I', tbl);
    execute format(
      'create policy "cc owner or gm insert" on public.%I for insert to authenticated with check (public.is_campaign_owner(campaign_id) or public.is_campaign_gm(campaign_id))',
      tbl
    );

    execute format('drop policy if exists "cc owner or gm update" on public.%I', tbl);
    execute format(
      'create policy "cc owner or gm update" on public.%I for update to authenticated using (public.is_campaign_owner(campaign_id) or public.is_campaign_gm(campaign_id)) with check (public.is_campaign_owner(campaign_id) or public.is_campaign_gm(campaign_id))',
      tbl
    );

    execute format('drop policy if exists "cc owner or gm delete" on public.%I', tbl);
    execute format(
      'create policy "cc owner or gm delete" on public.%I for delete to authenticated using (public.is_campaign_owner(campaign_id) or public.is_campaign_gm(campaign_id))',
      tbl
    );
  end loop;
end $$;

-- Factions: players only see shared rows. A player-owner may only create/edit shared rows.
drop policy if exists "cc factions member read" on public.organizations;
create policy "cc factions member read"
on public.organizations for select to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_member(campaign_id) and visibility = 'shared')
);

drop policy if exists "cc factions owner or gm insert" on public.organizations;
create policy "cc factions owner or gm insert"
on public.organizations for insert to authenticated
with check (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_owner(campaign_id) and visibility = 'shared')
);

drop policy if exists "cc factions owner or gm update" on public.organizations;
create policy "cc factions owner or gm update"
on public.organizations for update to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_owner(campaign_id) and visibility = 'shared')
)
with check (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_owner(campaign_id) and visibility = 'shared')
);

drop policy if exists "cc factions owner or gm delete" on public.organizations;
create policy "cc factions owner or gm delete"
on public.organizations for delete to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_owner(campaign_id) and visibility = 'shared')
);

-- Relationships follow the same shared/GM-only split.
drop policy if exists "cc relationships member read" on public.campaign_relationships;
create policy "cc relationships member read"
on public.campaign_relationships for select to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_member(campaign_id) and visibility = 'shared')
);

drop policy if exists "cc relationships owner or gm insert" on public.campaign_relationships;
create policy "cc relationships owner or gm insert"
on public.campaign_relationships for insert to authenticated
with check (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_owner(campaign_id) and visibility = 'shared')
);

drop policy if exists "cc relationships owner or gm update" on public.campaign_relationships;
create policy "cc relationships owner or gm update"
on public.campaign_relationships for update to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_owner(campaign_id) and visibility = 'shared')
)
with check (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_owner(campaign_id) and visibility = 'shared')
);

drop policy if exists "cc relationships owner or gm delete" on public.campaign_relationships;
create policy "cc relationships owner or gm delete"
on public.campaign_relationships for delete to authenticated
using (
  public.is_campaign_gm(campaign_id)
  or (public.is_campaign_owner(campaign_id) and visibility = 'shared')
);
