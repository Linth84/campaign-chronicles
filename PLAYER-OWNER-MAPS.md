# Player-owner maps

A player who technically owns their chronicle can manage maps and pins without becoming a GM.

UI:
- `CampaignPage` detects `campaign.owner_id === currentUserId`.
- General Maps renders `MapsSection` in manager mode for GM/co-GM or campaign owner.
- `MapsSection` receives `canManage={isCampaignOwner}`.
- Editing controls are enabled by `mode === 'manager' && (isGm || canManage)`.

This does not change campaignRole and does not expose GM Tools.
