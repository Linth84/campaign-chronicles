-- =========================================================
-- Campaign Chronicles - Relationships + Factions 2.0
-- Adds richer faction metadata and relationship semantics.
-- =========================================================

alter table public.organizations
  add column if not exists color text not null default '#c7a76a',
  add column if not exists status text not null default 'active',
  add column if not exists influence text not null default 'local',
  add column if not exists goal text;

alter table public.campaign_relationships
  add column if not exists relationship_category text not null default 'custom',
  add column if not exists strength smallint not null default 3,
  add column if not exists direction text not null default 'directed';

-- Keep values predictable while still allowing existing installations to migrate safely.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_status_check'
  ) then
    alter table public.organizations
      add constraint organizations_status_check
      check (status in ('active','dormant','destroyed','unknown'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'organizations_influence_check'
  ) then
    alter table public.organizations
      add constraint organizations_influence_check
      check (influence in ('minor','local','regional','major'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'campaign_relationships_category_check'
  ) then
    alter table public.campaign_relationships
      add constraint campaign_relationships_category_check
      check (relationship_category in ('alliance','rivalry','hostility','loyalty','family','control','debt','custom'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'campaign_relationships_strength_check'
  ) then
    alter table public.campaign_relationships
      add constraint campaign_relationships_strength_check
      check (strength between 1 and 5);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'campaign_relationships_direction_check'
  ) then
    alter table public.campaign_relationships
      add constraint campaign_relationships_direction_check
      check (direction in ('directed','mutual'));
  end if;
end $$;

-- Existing grants on these tables normally cover the new columns, but these are harmless
-- and make the migration resilient on hardened projects.
grant select, insert, update, delete on table public.organizations to authenticated;
grant select, insert, update, delete on table public.campaign_relationships to authenticated;
