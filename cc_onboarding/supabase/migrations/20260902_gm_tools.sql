-- Campaign Chronicles · GM Tools
create table if not exists public.gm_tool_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  kind text not null check (kind in ('session_planner','secret','clue','plot_thread')),
  title text not null,
  content text,
  status text not null default 'draft',
  session_date date,
  details jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gm_tool_entries_campaign_idx on public.gm_tool_entries(campaign_id, kind, created_at desc);
alter table public.gm_tool_entries enable row level security;

-- GM and co-GM only. Uses the same campaign_members role model as the app.
drop policy if exists "gm tools read" on public.gm_tool_entries;
create policy "gm tools read" on public.gm_tool_entries for select to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = gm_tool_entries.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
drop policy if exists "gm tools insert" on public.gm_tool_entries;
create policy "gm tools insert" on public.gm_tool_entries for insert to authenticated with check (
  created_by = auth.uid() and exists (select 1 from public.campaign_members cm where cm.campaign_id = gm_tool_entries.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
drop policy if exists "gm tools update" on public.gm_tool_entries;
create policy "gm tools update" on public.gm_tool_entries for update to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = gm_tool_entries.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
) with check (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = gm_tool_entries.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
drop policy if exists "gm tools delete" on public.gm_tool_entries;
create policy "gm tools delete" on public.gm_tool_entries for delete to authenticated using (
  exists (select 1 from public.campaign_members cm where cm.campaign_id = gm_tool_entries.campaign_id and cm.user_id = auth.uid() and cm.role in ('gm','co_gm'))
);
