-- Campaign Chronicles: role-based campaign permissions
-- owner_id is technical ownership; campaign_members.role grants permissions.

create or replace function public.is_campaign_gm(target_campaign_id uuid)
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
      and cm.role in ('gm', 'co_gm', 'co-gm')
  );
$$;

grant execute on function public.is_campaign_gm(uuid) to authenticated;
