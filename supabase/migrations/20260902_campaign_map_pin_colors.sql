-- Campaign Chronicles · Map pin colors + base privileges
alter table public.campaign_map_pins
  add column if not exists color text not null default '#c4a45a';

grant select, insert, update, delete on table public.campaign_maps to authenticated;
grant select, insert, update, delete on table public.campaign_map_pins to authenticated;
