# Player role permissions

Campaign ownership and GM authorization are intentionally separate.

- `campaigns.owner_id` = who owns/created this Campaign Chronicles record.
- `campaign_members.role` = campaign role.
- `player` never gains GM Tools or GM-only visibility just because they are the owner.
- A player who created their own campaign may author/import the normal chronicle they own.
- An invited player in somebody else's campaign remains read-only for normal campaign content.
- Player imports include normal/shared characters, sessions, NPCs, places, quests, items, notes, timeline, factions and relationships.
- Explicit `gm_only` factions and relationships are skipped for Player imports.
- GM Tools, GM Notes, Secrets, Planner, GM Screen and hidden maps/pins remain GM/co-GM only.

Apply BOTH role-related migrations if needed, in filename order:

1. `20260902_role_based_campaign_permissions.sql`
2. `20260902_player_owned_chronicle_permissions.sql`
