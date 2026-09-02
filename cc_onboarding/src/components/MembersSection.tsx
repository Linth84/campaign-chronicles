import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuClock3,
  LuMailPlus,
  LuRefreshCw,
  LuShield,
  LuTrash2,
  LuUserRound,
  LuUsers,
  LuTriangleAlert,
  LuBadgeCheck,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

import '../styles/members-section.css'

type Language =
  | 'en'
  | 'es'

type CampaignRole =
  | 'gm'
  | 'co_gm'
  | 'player'

type InviteRole =
  | 'co_gm'
  | 'player'

interface MembersSectionProps {
  language: Language
  campaignId: string
  campaignRole: CampaignRole | null
}

interface CampaignMember {
  id: string
  user_id: string
  role: CampaignRole
  joined_at: string
}

interface MemberProfile {
  id: string
  display_name: string | null
}

interface CampaignInvite {
  id: string
  email: string
  role: InviteRole
  status: string
  created_at: string
  expires_at: string
}

interface CampaignBan {
  id: string
  user_id: string
  created_at: string
}

const translations = {
  en: {
    eyebrow:
      'Campaign Access',

    title:
      'Members',

    description:
      'See who belongs to this campaign and manage pending invitations.',

    invite:
      'Invite member',

    email:
      'Email',

    emailPlaceholder:
      'player@example.com',

    role:
      'Role',

    player:
      'Player',

    coGm:
      'Sub-GM',

    gm:
      'GM',

    sendInvite:
      'Create invitation',

    creating:
      'Creating...',

    invitationCreated:
      'Invitation created.',

    inviteError:
      'We could not create the invitation.',

    duplicateInvite:
      'There is already a pending invitation for this email.',

    members:
      'Campaign members',

    pendingInvites:
      'Pending invitations',

    noInvites:
      'There are no pending invitations.',

    noMembers:
      'No members found.',

    joined:
      'Joined',

    expires:
      'Expires',

    cancel:
      'Cancel invitation',

    cancelConfirm:
      'Cancel this invitation?',

    cancelError:
      'We could not cancel the invitation.',

    loadError:
      'We could not load the campaign members.',

    refresh:
      'Refresh',

    limited:
      'Only GM and Sub-GM can create invitations.',

    promote:
      'Promote to Sub-GM',

    demote:
      'Remove Sub-GM',

    kick:
      'Kick',

    ban:
      'Ban',

    unban:
      'Unban',

    bannedMembers:
      'Banned members',

    noBans:
      'There are no banned members.',

    bannedOn:
      'Banned',

    promoteConfirm:
      'Promote this player to Sub-GM?',

    demoteConfirm:
      'Remove Sub-GM permissions from this member?',

    kickConfirm:
      'Remove this member from the campaign?',

    banConfirm:
      'Ban this member? They will be removed and cannot rejoin until unbanned.',

    unbanConfirm:
      'Unban this user? They will be allowed to receive a new invitation.',

    memberActionError:
      'We could not update this campaign member.',

    memberUpdated:
      'Campaign member updated.',

    memberFallback:
      'Campaign member',
  },

  es: {
    eyebrow:
      'Acceso a la campaña',

    title:
      'Miembros',

    description:
      'Consulta quién forma parte de esta campaña y administra las invitaciones pendientes.',

    invite:
      'Invitar miembro',

    email:
      'Correo electrónico',

    emailPlaceholder:
      'jugador@ejemplo.com',

    role:
      'Rol',

    player:
      'Jugador',

    coGm:
      'Sub-GM',

    gm:
      'GM',

    sendInvite:
      'Crear invitación',

    creating:
      'Creando...',

    invitationCreated:
      'Invitación creada.',

    inviteError:
      'No pudimos crear la invitación.',

    duplicateInvite:
      'Ya existe una invitación pendiente para este correo.',

    members:
      'Miembros de la campaña',

    pendingInvites:
      'Invitaciones pendientes',

    noInvites:
      'No hay invitaciones pendientes.',

    noMembers:
      'No se encontraron miembros.',

    joined:
      'Se unió',

    expires:
      'Vence',

    cancel:
      'Cancelar invitación',

    cancelConfirm:
      '¿Cancelar esta invitación?',

    cancelError:
      'No pudimos cancelar la invitación.',

    loadError:
      'No pudimos cargar los miembros de la campaña.',

    refresh:
      'Actualizar',

    limited:
      'Solo GM y Sub-GM pueden crear invitaciones.',

    promote:
      'Dar rango de Sub-GM',

    demote:
      'Quitar rango de Sub-GM',

    kick:
      'Expulsar',

    ban:
      'Banear',

    unban:
      'Quitar ban',

    bannedMembers:
      'Miembros baneados',

    noBans:
      'No hay miembros baneados.',

    bannedOn:
      'Baneado',

    promoteConfirm:
      '¿Dar rango de Sub-GM a este jugador?',

    demoteConfirm:
      '¿Quitar el rango de Sub-GM a este miembro?',

    kickConfirm:
      '¿Expulsar a este miembro de la campaña?',

    banConfirm:
      '¿Banear a este miembro? Será expulsado y no podrá volver hasta que se quite el ban.',

    unbanConfirm:
      '¿Quitar el ban a este usuario? Podrá volver a recibir una invitación.',

    memberActionError:
      'No pudimos actualizar este miembro de la campaña.',

    memberUpdated:
      'Miembro de la campaña actualizado.',

    memberFallback:
      'Miembro de la campaña',
  },
}

type ConfirmVariant =
  | 'gold'
  | 'danger'
  | 'neutral'

interface ConfirmDialogState {
  title: string
  message: string
  confirmLabel: string
  variant: ConfirmVariant
  onConfirm: () => void | Promise<void>
}

function MembersSection({
  language,
  campaignId,
  campaignRole,
}: MembersSectionProps) {
  const t =
    translations[
      language
    ]

  const isStaff =
    campaignRole === 'gm' ||
    campaignRole === 'co_gm'

  const isPrimaryGm =
    campaignRole === 'gm'

  const [
    members,
    setMembers,
  ] =
    useState<CampaignMember[]>(
      [],
    )

  const [
    profiles,
    setProfiles,
  ] =
    useState<
      Record<string, MemberProfile>
    >({})

  const [
    invites,
    setInvites,
  ] =
    useState<CampaignInvite[]>(
      [],
    )

  const [
    bans,
    setBans,
  ] =
    useState<CampaignBan[]>(
      [],
    )

  const [
    memberActionId,
    setMemberActionId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState('')

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    inviteRole,
    setInviteRole,
  ] =
    useState<InviteRole>(
      'player',
    )

  const [
    creatingInvite,
    setCreatingInvite,
  ] =
    useState(false)


  const [
    confirmDialog,
    setConfirmDialog,
  ] =
    useState<ConfirmDialogState | null>(
      null,
    )

  const closeConfirmDialog = () => {
    if (memberActionId) {
      return
    }

    setConfirmDialog(null)
  }

  const runConfirmedAction =
    async () => {
      if (!confirmDialog) {
        return
      }

      const action =
        confirmDialog.onConfirm

      setConfirmDialog(null)
      await action()
    }

  const loadMembers =
    useCallback(
      async () => {
        setLoading(true)
        setErrorMessage('')

        try {
         

          const {
            data: memberData,
            error: memberError,
          } =
            await supabase
              .from(
                'campaign_members',
              )
              .select(
                `
                  id,
                  user_id,
                  role,
                  joined_at
                `,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .order(
                'joined_at',
                {
                  ascending:
                    true,
                },
              )

          if (memberError) {
            throw memberError
          }

          const typedMembers =
            (
              memberData ??
              []
            ) as CampaignMember[]

          setMembers(
            typedMembers,
          )

          let typedBans: CampaignBan[] = []

          if (isPrimaryGm) {
            const {
              data: banData,
              error: banError,
            } =
              await supabase
                .from(
                  'campaign_bans',
                )
                .select(
                  `
                    id,
                    user_id,
                    created_at
                  `,
                )
                .eq(
                  'campaign_id',
                  campaignId,
                )
                .order(
                  'created_at',
                  {
                    ascending: false,
                  },
                )

            if (banError) {
              throw banError
            }

            typedBans =
              (banData ?? []) as CampaignBan[]

            setBans(typedBans)
          } else {
            setBans([])
          }

          const userIds =
            Array.from(
              new Set([
                ...typedMembers.map(
                  (member) =>
                    member.user_id,
                ),
                ...typedBans.map(
                  (ban) =>
                    ban.user_id,
                ),
              ]),
            )

          if (
            userIds.length >
            0
          ) {
            const {
              data:
                profileData,
              error:
                profileError,
            } =
              await supabase
                .from(
                  'profiles',
                )
                .select(
                  `
                    id,
                    display_name
                  `,
                )
                .in(
                  'id',
                  userIds,
                )

            if (
              profileError
            ) {
              console.warn(
                'No se pudieron cargar los nombres de los miembros:',
                profileError,
              )
            } else {
              const profileMap:
                Record<
                  string,
                  MemberProfile
                > = {}

              for (
                const profile
                of profileData ??
                  []
              ) {
                profileMap[
                  profile.id
                ] =
                  profile as MemberProfile
              }

              setProfiles(
                profileMap,
              )
            }
          } else {
            setProfiles({})
          }

          if (isStaff) {
            const {
              data:
                inviteData,
              error:
                inviteError,
            } =
              await supabase
                .from(
                  'campaign_invites',
                )
                .select(
                  `
                    id,
                    email,
                    role,
                    status,
                    created_at,
                    expires_at
                  `,
                )
                .eq(
                  'campaign_id',
                  campaignId,
                )
                .eq(
                  'status',
                  'pending',
                )
                .order(
                  'created_at',
                  {
                    ascending:
                      false,
                  },
                )

            if (
              inviteError
            ) {
              throw inviteError
            }

            setInvites(
              (
                inviteData ??
                []
              ) as CampaignInvite[],
            )
          } else {
            setInvites([])
          }
        } catch (error) {
          console.error(
            'Error al cargar miembros:',
            error,
          )

          setErrorMessage(
            t.loadError,
          )
        } finally {
          setLoading(false)
        }
      },
      [
        campaignId,
        isStaff,
        isPrimaryGm,
        t.loadError,
      ],
    )

  useEffect(() => {
    void loadMembers()
  }, [
    loadMembers,
  ])

  const handleInvite =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      if (
        !isStaff ||
        creatingInvite
      ) {
        return
      }

      const cleanEmail =
        email
          .trim()
          .toLowerCase()

      if (
        !cleanEmail
      ) {
        return
      }

      setCreatingInvite(
        true,
      )

      setErrorMessage('')
      setSuccessMessage('')

      try {
        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser()

        if (
          userError ||
          !userData.user
        ) {
          throw (
            userError ||
            new Error(
              'Usuario no disponible.',
            )
          )
        }

        const {
          data,
          error,
        } =
          await supabase
            .from(
              'campaign_invites',
            )
            .insert({
              campaign_id:
                campaignId,

              email:
                cleanEmail,

              role:
                isPrimaryGm
                  ? inviteRole
                  : 'player',

              invited_by:
                userData.user.id,
            })
            .select(
              `
                id,
                email,
                role,
                status,
                created_at,
                expires_at
              `,
            )
            .single()

        if (error) {
          if (
            error.code ===
            '23505'
          ) {
            setErrorMessage(
              t.duplicateInvite,
            )

            return
          }

          throw error
        }

        setInvites(
          (
            current,
          ) => [
            data as CampaignInvite,
            ...current,
          ],
        )

        // Enviar el correo de invitación mediante la Edge Function.
const {
  data: sessionData,
  error: sessionError,
} =
  await supabase.auth.getSession()

if (
  sessionError ||
  !sessionData.session
) {
  throw (
    sessionError ||
    new Error(
      'No hay una sesión activa.',
    )
  )
}

const {
  error: emailError,
} =
  await supabase.functions.invoke(
    'send-campaign-invite',
    {
      body: {
        invite_id: data.id,
        language,
      },

      headers: {
        Authorization:
          `Bearer ${sessionData.session.access_token}`,
      },
    },
  )

        if (emailError) {
          console.error(
            'La invitación se creó, pero no se pudo enviar el correo:',
            emailError,
          )
        }

        setEmail('')
        setInviteRole(
          'player',
        )

        setSuccessMessage(
          t.invitationCreated,
        )
      } catch (error) {
        console.error(
          'Error al crear invitación:',
          error,
        )

        setErrorMessage(
          t.inviteError,
        )
      } finally {
        setCreatingInvite(
          false,
        )
      }
    }

  const cancelInvite =
    async (
      inviteId: string,
    ) => {
      setErrorMessage('')
      setSuccessMessage('')

      try {
        const {
          error,
        } =
          await supabase
            .from(
              'campaign_invites',
            )
            .update({
              status:
                'cancelled',
            })
            .eq(
              'id',
              inviteId,
            )
            .eq(
              'campaign_id',
              campaignId,
            )

        if (error) {
          throw error
        }

        setInvites(
          (
            current,
          ) =>
            current.filter(
              (
                invite,
              ) =>
                invite.id !==
                inviteId,
            ),
        )
      } catch (error) {
        console.error(
          'Error al cancelar invitación:',
          error,
        )

        setErrorMessage(
          t.cancelError,
        )
      }
    }

  const handleCancelInvite =
    (
      inviteId: string,
      inviteEmail: string,
    ) => {
      if (!isStaff) {
        return
      }

      setConfirmDialog({
        title:
          language === 'es'
            ? 'Cancelar invitación'
            : 'Cancel invitation',
        message:
          language === 'es'
            ? `¿Cancelar la invitación pendiente para ${inviteEmail}?`
            : `Cancel the pending invitation for ${inviteEmail}?`,
        confirmLabel:
          language === 'es'
            ? 'Cancelar invitación'
            : 'Cancel invitation',
        variant: 'danger',
        onConfirm: () =>
          cancelInvite(
            inviteId,
          ),
      })
    }

  const handleMemberAction =
    async (
      action:
        | 'promote'
        | 'demote'
        | 'kick'
        | 'ban'
        | 'unban',
      targetUserId: string,
      displayName: string,
    ) => {
      if (
        !isPrimaryGm ||
        memberActionId
      ) {
        return
      }

      const dialogCopy = {
        promote: {
          title:
            language === 'es'
              ? 'Dar rango de Sub-GM'
              : 'Promote to Sub-GM',
          message:
            language === 'es'
              ? `¿Dar rango de Sub-GM a ${displayName}? Tendrá permisos adicionales para administrar la campaña.`
              : `Promote ${displayName} to Sub-GM? They will gain additional campaign management permissions.`,
          confirmLabel:
            language === 'es'
              ? 'Dar rango'
              : 'Promote',
          variant:
            'gold' as ConfirmVariant,
        },
        demote: {
          title:
            language === 'es'
              ? 'Quitar rango de Sub-GM'
              : 'Remove Sub-GM',
          message:
            language === 'es'
              ? `¿Quitar el rango de Sub-GM a ${displayName}? Volverá a tener permisos de Jugador.`
              : `Remove Sub-GM permissions from ${displayName}? They will return to Player permissions.`,
          confirmLabel:
            language === 'es'
              ? 'Quitar rango'
              : 'Remove rank',
          variant:
            'gold' as ConfirmVariant,
        },
        kick: {
          title:
            language === 'es'
              ? 'Expulsar miembro'
              : 'Kick member',
          message:
            language === 'es'
              ? `¿Expulsar a ${displayName} de la campaña? Podrá volver si recibe y acepta una nueva invitación.`
              : `Remove ${displayName} from the campaign? They can return if they receive and accept a new invitation.`,
          confirmLabel:
            language === 'es'
              ? 'Expulsar'
              : 'Kick',
          variant:
            'danger' as ConfirmVariant,
        },
        ban: {
          title:
            language === 'es'
              ? 'Banear miembro'
              : 'Ban member',
          message:
            language === 'es'
              ? `¿Banear a ${displayName}? Será expulsado y no podrá volver a la campaña hasta que se quite el ban.`
              : `Ban ${displayName}? They will be removed and cannot rejoin until the ban is removed.`,
          confirmLabel:
            language === 'es'
              ? 'Banear'
              : 'Ban',
          variant:
            'danger' as ConfirmVariant,
        },
        unban: {
          title:
            language === 'es'
              ? 'Quitar ban'
              : 'Unban member',
          message:
            language === 'es'
              ? `¿Quitar el ban a ${displayName}? Podrá volver a recibir una invitación a la campaña.`
              : `Unban ${displayName}? They will be allowed to receive a new campaign invitation.`,
          confirmLabel:
            language === 'es'
              ? 'Quitar ban'
              : 'Unban',
          variant:
            'neutral' as ConfirmVariant,
        },
      }[action]

      setConfirmDialog({
        ...dialogCopy,
        onConfirm: async () => {
          setMemberActionId(
            targetUserId,
          )
      setErrorMessage('')
      setSuccessMessage('')

      try {
        const rpcName = {
          promote:
            'promote_campaign_member',
          demote:
            'demote_campaign_member',
          kick:
            'kick_campaign_member',
          ban:
            'ban_campaign_member',
          unban:
            'unban_campaign_member',
        }[action]

        const { error } =
          await supabase.rpc(
            rpcName,
            {
              target_campaign_id:
                campaignId,
              target_user_id:
                targetUserId,
            },
          )

        if (error) {
          throw error
        }

        setSuccessMessage(
          t.memberUpdated,
        )

        await loadMembers()
      } catch (error) {
        console.error(
          'Error al administrar miembro:',
          error,
        )

        setErrorMessage(
          t.memberActionError,
        )
      } finally {
        setMemberActionId(
          null,
        )
      }
        },
      })
    }

  const roleLabel =
    (
      role:
        CampaignRole |
        InviteRole,
    ) => {
      if (
        role === 'gm'
      ) {
        return t.gm
      }

      if (
        role === 'co_gm'
      ) {
        return t.coGm
      }

      return t.player
    }

  const formatDate =
    (
      value: string,
    ) =>
      new Intl.DateTimeFormat(
        language === 'es'
          ? 'es-AR'
          : 'en-US',
        {
          year:
            'numeric',
          month:
            'short',
          day:
            'numeric',
        },
      ).format(
        new Date(value),
      )

  const sortedMembers =
    useMemo(
      () =>
        [...members].sort(
          (
            a,
            b,
          ) => {
            const weight = {
              gm: 0,
              co_gm: 1,
              player: 2,
            }

            return (
              weight[a.role] -
              weight[b.role]
            )
          },
        ),
      [
        members,
      ],
    )

  return (
    <section className="members-section">
      <div className="members-section-header">
        <div>
          <span className="members-section-eyebrow">
            {t.eyebrow}
          </span>

          <h2>
            {t.title}
          </h2>

          <p>
            {t.description}
          </p>
        </div>

        <button
          type="button"
          className="members-refresh-button"
          onClick={() =>
            void loadMembers()
          }
          title={
            t.refresh
          }
          aria-label={
            t.refresh
          }
          disabled={
            loading
          }
        >
          <LuRefreshCw />
        </button>
      </div>

      {errorMessage && (
        <div className="members-message members-message-error">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="members-message members-message-success">
          {successMessage}
        </div>
      )}

      {isStaff ? (
        <form
          className="members-invite-card"
          onSubmit={
            handleInvite
          }
        >
          <div className="members-invite-heading">
            <LuMailPlus />

            <div>
              <h3>
                {t.invite}
              </h3>
            </div>
          </div>

          <div className="members-invite-grid">
            <label>
              <span>
                {t.email}
              </span>

              <input
                type="email"
                value={
                  email
                }
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event
                      .target
                      .value,
                  )
                }
                placeholder={
                  t.emailPlaceholder
                }
                autoComplete="email"
                required
              />
            </label>

            <label>
              <span>
                {t.role}
              </span>

              <select
                value={
                  inviteRole
                }
                onChange={(
                  event,
                ) =>
                  setInviteRole(
                    event
                      .target
                      .value as InviteRole,
                  )
                }
              >
                <option value="player">
                  {t.player}
                </option>

                {isPrimaryGm && (
                  <option value="co_gm">
                    {t.coGm}
                  </option>
                )}
              </select>
            </label>

            <button
              type="submit"
              className="members-invite-submit"
              disabled={
                creatingInvite
              }
            >
              <LuMailPlus />

              <span>
                {creatingInvite
                  ? t.creating
                  : t.sendInvite}
              </span>
            </button>
          </div>
        </form>
      ) : (
        <div className="members-limited-card">
          <LuShield />

          <span>
            {t.limited}
          </span>
        </div>
      )}

      <div className="members-content-grid">
        <article className="members-panel">
          <div className="members-panel-heading">
            <div>
              <LuUsers />

              <h3>
                {t.members}
              </h3>
            </div>

            <span>
              {
                members.length
              }
            </span>
          </div>

          {loading ? (
            <div className="members-empty">
              {t.refresh}
            </div>
          ) : sortedMembers.length ===
            0 ? (
            <div className="members-empty">
              {t.noMembers}
            </div>
          ) : (
            <div className="members-list">
              {sortedMembers.map(
                (
                  member,
                ) => {
                  const profile =
                    profiles[
                      member.user_id
                    ]

                  const displayName =
                        profile
                          ?.display_name
                          ?.trim() ||
                        t.memberFallback

                  return (
                    <div
                      key={
                        member.id
                      }
                      className="member-row"
                    >
                      <div className="member-avatar">
                        <LuUserRound />
                      </div>

                      <div className="member-main">
                        <strong>
                          {
                            displayName
                          }
                        </strong>

                        <span>
                          {t.joined}{' '}
                          {
                            formatDate(
                              member.joined_at,
                            )
                          }
                        </span>
                      </div>

                      <div className="member-side">
                        <span
                          className={`member-role member-role-${member.role}`}
                        >
                          {
                            roleLabel(
                              member.role,
                            )
                          }
                        </span>

                        {isPrimaryGm &&
                          member.role !== 'gm' && (
                            <div className="member-actions">
                              {member.role === 'player' ? (
                                <button
                                  type="button"
                                  className="member-action-button"
                                  disabled={
                                    memberActionId ===
                                    member.user_id
                                  }
                                  onClick={() =>
                                    void handleMemberAction(
                                      'promote',
                                      member.user_id,
                                      displayName,
                                    )
                                  }
                                >
                                  {t.promote}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="member-action-button"
                                  disabled={
                                    memberActionId ===
                                    member.user_id
                                  }
                                  onClick={() =>
                                    void handleMemberAction(
                                      'demote',
                                      member.user_id,
                                      displayName,
                                    )
                                  }
                                >
                                  {t.demote}
                                </button>
                              )}

                              <button
                                type="button"
                                className="member-action-button member-action-kick"
                                disabled={
                                  memberActionId ===
                                  member.user_id
                                }
                                onClick={() =>
                                  void handleMemberAction(
                                    'kick',
                                    member.user_id,
                                      displayName,
                                  )
                                }
                              >
                                {t.kick}
                              </button>

                              <button
                                type="button"
                                className="member-action-button member-action-danger"
                                disabled={
                                  memberActionId ===
                                  member.user_id
                                }
                                onClick={() =>
                                  void handleMemberAction(
                                    'ban',
                                    member.user_id,
                                      displayName,
                                  )
                                }
                              >
                                {t.ban}
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </article>

        {isPrimaryGm && (
          <article className="members-panel members-panel-bans">
            <div className="members-panel-heading">
              <div>
                <LuShield />

                <h3>
                  {t.bannedMembers}
                </h3>
              </div>

              <span>
                {bans.length}
              </span>
            </div>

            {bans.length === 0 ? (
              <div className="members-empty">
                {t.noBans}
              </div>
            ) : (
              <div className="members-list">
                {bans.map(
                  (ban) => {
                    const profile =
                      profiles[ban.user_id]

                    const displayName =
                      profile
                        ?.display_name
                        ?.trim() ||
                      t.memberFallback

                    return (
                      <div
                        key={ban.id}
                        className="member-row member-row-banned"
                      >
                        <div className="member-avatar member-avatar-banned">
                          <LuShield />
                        </div>

                        <div className="member-main">
                          <strong>
                            {displayName}
                          </strong>

                          <span>
                            {t.bannedOn}{' '}
                            {formatDate(
                              ban.created_at,
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="member-action-button member-action-unban"
                          disabled={
                            memberActionId ===
                            ban.user_id
                          }
                          onClick={() =>
                            void handleMemberAction(
                              'unban',
                              ban.user_id,
                              displayName,
                            )
                          }
                        >
                          {t.unban}
                        </button>
                      </div>
                    )
                  },
                )}
              </div>
            )}
          </article>
        )}

        {isStaff && (
          <article className="members-panel">
            <div className="members-panel-heading">
              <div>
                <LuClock3 />

                <h3>
                  {
                    t.pendingInvites
                  }
                </h3>
              </div>

              <span>
                {
                  invites.length
                }
              </span>
            </div>

            {invites.length ===
            0 ? (
              <div className="members-empty">
                {t.noInvites}
              </div>
            ) : (
              <div className="members-list">
                {invites.map(
                  (
                    invite,
                  ) => (
                    <div
                      key={
                        invite.id
                      }
                      className="member-row member-row-invite"
                    >
                      <div className="member-avatar">
                        <LuMailPlus />
                      </div>

                      <div className="member-main">
                        <strong>
                          {
                            invite.email
                          }
                        </strong>

                        <span>
                          {t.expires}{' '}
                          {
                            formatDate(
                              invite.expires_at,
                            )
                          }
                        </span>
                      </div>

                      <span
                        className={`member-role member-role-${invite.role}`}
                      >
                        {
                          roleLabel(
                            invite.role,
                          )
                        }
                      </span>

                      <button
                        type="button"
                        className="member-cancel-button"
                        onClick={() =>
                          void handleCancelInvite(
                            invite.id,
                            invite.email,
                          )
                        }
                        title={
                          t.cancel
                        }
                        aria-label={
                          t.cancel
                        }
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
          </article>
        )}
      </div>

      {confirmDialog && (
        <div
          className="cc-confirm-backdrop"
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeConfirmDialog()
            }
          }}
        >
          <div
            className={`cc-confirm-modal cc-confirm-modal-${confirmDialog.variant}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-confirm-title"
          >
            <button
              type="button"
              className="cc-confirm-close"
              onClick={
                closeConfirmDialog
              }
              aria-label={
                language === 'es'
                  ? 'Cerrar'
                  : 'Close'
              }
            >
              <LuX />
            </button>

            <div className="cc-confirm-icon">
              {confirmDialog.variant ===
              'danger' ? (
                <LuTriangleAlert />
              ) : confirmDialog.variant ===
                'gold' ? (
                <LuShield />
              ) : (
                <LuBadgeCheck />
              )}
            </div>

            <div className="cc-confirm-copy">
              <h3 id="cc-confirm-title">
                {confirmDialog.title}
              </h3>

              <p>
                {confirmDialog.message}
              </p>
            </div>

            <div className="cc-confirm-actions">
              <button
                type="button"
                className="cc-confirm-button cc-confirm-button-cancel"
                onClick={
                  closeConfirmDialog
                }
              >
                {language === 'es'
                  ? 'Volver'
                  : 'Go back'}
              </button>

              <button
                type="button"
                className={`cc-confirm-button cc-confirm-button-${confirmDialog.variant}`}
                onClick={() =>
                  void runConfirmedAction()
                }
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default MembersSection
