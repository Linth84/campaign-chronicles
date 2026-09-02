import { useConfirm } from '../components/ConfirmProvider'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  LuBookOpen,
  LuCalendarDays,
  LuDownload,
  LuFileText,
  LuGamepad2,
  LuMail,
  LuLogOut,
  LuShieldCheck,
  LuX,
  LuPlus,
  LuTrash2,
  LuUpload,
  LuUsers,
} from 'react-icons/lu'

import {
  exportCampaignDocx,
  exportCampaignJson,
  exportCampaignPdf,
  loadCampaignArchive,
} from '../utils/campaignFiles'

import {
  supabase,
} from '../utils/supabase'
import AppHeader from '../components/AppHeader'
import '../styles/dashboard-invitations.css'

/* =========================================================
   TIPOS
   ========================================================= */

type Language =
  | 'en'
  | 'es'

type CampaignRole =
  | 'gm'
  | 'co_gm'
  | 'player'

interface DashboardPageProps {
  language: Language

  onLanguageChange: (
    language: Language,
  ) => void

  onSignOut: () => void

  onOpenProfile:
    () => void

  onCreateCampaign:
    () => void

  onImportCampaign:
    () => void

  onOpenCampaign: (
    campaignId: string,
  ) => void
}

interface CampaignInvite {
  invite_id: string
  campaign_id: string
  campaign_name: string
  role: 'co_gm' | 'player'
  invited_by_name: string
  created_at: string
  expires_at: string
}

interface Campaign {
  id: string
  owner_id: string
  name: string
  system: string | null
  party_name: string | null
  description: string | null
  start_date: string | null
  banner_path: string | null
  created_at: string
  updated_at: string
  role?: CampaignRole | null
}

/* =========================================================
   TRADUCCIONES
   ========================================================= */

const translations = {
  en: {
    eyebrow:
      'Your adventures',

    title:
      'Campaigns',

    intro:
      'Create a new campaign or bring your existing notes into Campaign Chronicles.',

    createCampaign:
      'Create Campaign',

    importCampaign:
      'Import Campaign',

    signOut:
      'Sign out',

    profile:
      'Profile',

    loading:
      'Loading your campaigns...',

    loadError:
      'We could not load your campaigns.',

    emptyTitle:
      'No campaigns yet',

    emptyText:
      'Create your first campaign and start building the memory of your adventure.',

    openCampaign:
      'Open Campaign',

    campaignMenu:
      'Campaign options',

    exportWord:
      'Export Word',

    exportPdf:
      'Export PDF',

    jsonBackup:
      'JSON Backup',

    exporting:
      'Exporting...',

    exportError:
      'We could not export the campaign.',

    deleteCampaign:
      'Delete Campaign',

    deleteConfirm:
      'Are you sure you want to delete this campaign? This action cannot be undone.',

    deleteError:
      'We could not delete the campaign.',

    leaveCampaign:
      'Leave Campaign',

    leaveConfirm:
      'Are you sure you want to leave this campaign? You will lose access unless you are invited again.',

    leaveError:
      'We could not leave the campaign.',

    noDescription:
      'No description yet.',

    unknownSystem:
      'System not specified',

    unknownParty:
      'Party not specified',

    roleGm:
      'GM',

    roleCoGm:
      'Sub-GM',

    rolePlayer:
      'Player',

    invitationsEyebrow:
      'Campaign invitations',

    invitationsTitle:
      'You have a campaign invitation',

    invitationsTitlePlural:
      'You have campaign invitations',

    invitationsText:
      'Accept to add the campaign to your dashboard, or decline if you do not want to join.',

    invitedBy:
      'Invited by',

    asRole:
      'as',

    acceptInvite:
      'Accept',

    declineInvite:
      'Decline',

    inviteExpires:
      'Expires',

    inviteActionError:
      'We could not update this invitation.',

    invitesLoadError:
      'We could not load your invitations.',
  },

  es: {
    eyebrow:
      'Tus aventuras',

    title:
      'Campañas',

    intro:
      'Crea una nueva campaña o trae tus notas existentes a Campaign Chronicles.',

    createCampaign:
      'Crear campaña',

    importCampaign:
      'Importar campaña',

    signOut:
      'Cerrar sesión',

    profile:
      'Perfil',

    loading:
      'Cargando tus campañas...',

    loadError:
      'No pudimos cargar tus campañas.',

    emptyTitle:
      'Todavía no hay campañas',

    emptyText:
      'Crea tu primera campaña y empieza a construir la memoria de tu aventura.',

    openCampaign:
      'Abrir campaña',

    campaignMenu:
      'Opciones de campaña',

    exportWord:
      'Exportar Word',

    exportPdf:
      'Exportar PDF',

    jsonBackup:
      'Backup JSON',

    exporting:
      'Exportando...',

    exportError:
      'No pudimos exportar la campaña.',

    deleteCampaign:
      'Eliminar campaña',

    deleteConfirm:
      '¿Seguro que quieres eliminar esta campaña? Esta acción no se puede deshacer.',

    deleteError:
      'No pudimos eliminar la campaña.',

    leaveCampaign:
      'Salir de la campaña',

    leaveConfirm:
      '¿Seguro que quieres salir de esta campaña? Perderás el acceso a menos que vuelvan a invitarte.',

    leaveError:
      'No pudimos salir de la campaña.',

    noDescription:
      'Todavía no hay una descripción.',

    unknownSystem:
      'Sistema no especificado',

    unknownParty:
      'Grupo no especificado',

    roleGm:
      'GM',

    roleCoGm:
      'Sub-GM',

    rolePlayer:
      'Jugador',

    invitationsEyebrow:
      'Invitaciones a campañas',

    invitationsTitle:
      'Tienes una invitación a una campaña',

    invitationsTitlePlural:
      'Tienes invitaciones a campañas',

    invitationsText:
      'Acepta para agregar la campaña a tu panel, o rechaza si no quieres unirte.',

    invitedBy:
      'Invitado por',

    asRole:
      'como',

    acceptInvite:
      'Aceptar',

    declineInvite:
      'Rechazar',

    inviteExpires:
      'Vence',

    inviteActionError:
      'No pudimos actualizar esta invitación.',

    invitesLoadError:
      'No pudimos cargar tus invitaciones.',
  },
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function DashboardPage({
  language,
  onLanguageChange,
  onSignOut,
  onOpenProfile,
  onCreateCampaign,
  onImportCampaign,
  onOpenCampaign,
}: DashboardPageProps) {
  const confirmAction = useConfirm()
  const t =
    translations[
      language
    ]

  const [
    campaigns,
    setCampaigns,
  ] =
    useState<Campaign[]>([])

  const [
    invitations,
    setInvitations,
  ] =
    useState<CampaignInvite[]>([])

  const [
    invitationsLoading,
    setInvitationsLoading,
  ] =
    useState(true)

  const [
    invitationActionId,
    setInvitationActionId,
  ] =
    useState<string | null>(null)

  const [
    invitationError,
    setInvitationError,
  ] =
    useState('')

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
    openMenuId,
    setOpenMenuId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    exportingCampaignId,
    setExportingCampaignId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    profileAvatarUrl,
    setProfileAvatarUrl,
  ] =
    useState('')


  const [
    campaignBannerUrls,
    setCampaignBannerUrls,
  ] =
    useState<
      Record<string, string>
    >({})

  const menuAreaRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  /* =======================================================
     CARGAR AVATAR DEL PERFIL
     ======================================================= */

  useEffect(() => {
    let isMounted = true

    const loadProfileAvatar =
      async () => {
        try {
          const {
            data:
              userData,
            error:
              userError,
          } =
            await supabase.auth.getUser()

          if (
            userError ||
            !userData.user
          ) {
            return
          }

          const {
            data:
              profileData,
            error:
              profileError,
          } =
            await supabase
              .from('profiles')
              .select(
                'avatar_path',
              )
              .eq(
                'id',
                userData.user.id,
              )
              .maybeSingle()

          if (profileError) {
            throw profileError
          }

          if (
            !profileData
              ?.avatar_path
          ) {
            if (isMounted) {
              setProfileAvatarUrl(
                '',
              )
            }

            return
          }

          const {
            data:
              signedData,
            error:
              signedError,
          } =
            await supabase.storage
              .from(
                'campaign-assets',
              )
              .createSignedUrl(
                profileData
                  .avatar_path,
                60 * 60,
              )

          if (signedError) {
            throw signedError
          }

          if (isMounted) {
            setProfileAvatarUrl(
              signedData
                .signedUrl,
            )
          }
        } catch (error) {
          console.error(
            'Error al cargar avatar del perfil:',
            error,
          )

          if (isMounted) {
            setProfileAvatarUrl(
              '',
            )
          }
        }
      }

    void loadProfileAvatar()

    return () => {
      isMounted = false
    }
  }, [])

  /* =======================================================
     CARGAR CAMPAÑAS
     ======================================================= */

  useEffect(() => {
    const loadCampaigns =
      async () => {
        setLoading(true)
        setErrorMessage('')

        try {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'campaigns',
              )
              .select(
                `
                  id,
                  owner_id,
                  name,
                  system,
                  party_name,
                  description,
                  start_date,
                  banner_path,
                  created_at,
                  updated_at
                `,
              )
              .order(
                'created_at',
                {
                  ascending:
                    false,
                },
              )

          if (error) {
            throw error
          }

          const baseCampaigns =
            (data ??
              []) as Campaign[]

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

          const campaignIds =
            baseCampaigns.map(
              (campaign) =>
                campaign.id,
            )

          let rolesByCampaign:
            Record<string, CampaignRole> = {}

          if (campaignIds.length > 0) {
            const {
              data: memberships,
              error: membershipsError,
            } =
              await supabase
                .from('campaign_members')
                .select('campaign_id, role')
                .eq(
                  'user_id',
                  userData.user.id,
                )
                .in(
                  'campaign_id',
                  campaignIds,
                )

            if (membershipsError) {
              throw membershipsError
            }

            rolesByCampaign =
              Object.fromEntries(
                (memberships ?? [])
                  .filter(
                    (membership) =>
                      membership.role === 'gm' ||
                      membership.role === 'co_gm' ||
                      membership.role === 'player',
                  )
                  .map(
                    (membership) => [
                      membership.campaign_id,
                      membership.role as CampaignRole,
                    ],
                  ),
              )
          }

          const loadedCampaigns =
            baseCampaigns
              .filter(
                (campaign) =>
                  Boolean(
                    rolesByCampaign[
                      campaign.id
                    ],
                  ),
              )
              .map(
                (campaign) => ({
                  ...campaign,
                  role:
                    rolesByCampaign[
                      campaign.id
                    ],
                }),
              )

          setCampaigns(
            loadedCampaigns,
          )

          const bannerEntries =
            await Promise.all(
              loadedCampaigns.map(
                async (
                  campaign,
                ) => {
                  if (
                    !campaign.banner_path
                  ) {
                    return [
                      campaign.id,
                      '',
                    ] as const
                  }

                  const {
                    data:
                      signedData,
                    error:
                      signedError,
                  } =
                    await supabase.storage
                      .from(
                        'campaign-assets',
                      )
                      .createSignedUrl(
                        campaign.banner_path,
                        60 * 60 * 6,
                      )

                  if (
                    signedError
                  ) {
                    console.error(
                      'Error al cargar banner de campaña:',
                      signedError,
                    )

                    return [
                      campaign.id,
                      '',
                    ] as const
                  }

                  return [
                    campaign.id,
                    signedData.signedUrl,
                  ] as const
                },
              ),
            )

          setCampaignBannerUrls(
            Object.fromEntries(
              bannerEntries,
            ),
          )
        } catch (error) {
          console.error(
            'Error al cargar campañas:',
            error,
          )

          setErrorMessage(
            t.loadError,
          )
        } finally {
          setLoading(
            false,
          )
        }
      }

    void loadCampaigns()
  }, [t.loadError])

  /* =======================================================
     CARGAR INVITACIONES DEL USUARIO
     ======================================================= */

  const loadInvitations =
    async () => {
      setInvitationsLoading(true)
      setInvitationError('')

      try {
        const {
          data,
          error,
        } =
          await supabase.rpc(
            'get_my_campaign_invites',
          )

        if (error) {
          throw error
        }

        setInvitations(
          (data ??
            []) as CampaignInvite[],
        )
      } catch (error) {
        console.error(
          'Error al cargar invitaciones:',
          error,
        )

        setInvitationError(
          t.invitesLoadError,
        )
      } finally {
        setInvitationsLoading(false)
      }
    }

  useEffect(() => {
    void loadInvitations()
  }, [t.invitesLoadError])

  /* =======================================================
     ACEPTAR INVITACIÓN
     ======================================================= */

  const acceptInvitation =
    async (
      invite:
        CampaignInvite,
    ) => {
      setInvitationActionId(
        invite.invite_id,
      )
      setInvitationError('')

      try {
        const {
          error,
        } =
          await supabase.rpc(
            'accept_campaign_invite',
            {
              invite_id:
                invite.invite_id,
            },
          )

        if (error) {
          throw error
        }

        setInvitations(
          (current) =>
            current.filter(
              (item) =>
                item.invite_id !==
                invite.invite_id,
            ),
        )

        window.location.reload()
      } catch (error) {
        console.error(
          'Error al aceptar invitación:',
          error,
        )

        setInvitationError(
          t.inviteActionError,
        )
      } finally {
        setInvitationActionId(
          null,
        )
      }
    }

  /* =======================================================
     RECHAZAR INVITACIÓN
     ======================================================= */

  const declineInvitation =
    async (
      invite:
        CampaignInvite,
    ) => {
      setInvitationActionId(
        invite.invite_id,
      )
      setInvitationError('')

      try {
        const {
          error,
        } =
          await supabase.rpc(
            'decline_campaign_invite',
            {
              invite_id:
                invite.invite_id,
            },
          )

        if (error) {
          throw error
        }

        setInvitations(
          (current) =>
            current.filter(
              (item) =>
                item.invite_id !==
                invite.invite_id,
            ),
        )
      } catch (error) {
        console.error(
          'Error al rechazar invitación:',
          error,
        )

        setInvitationError(
          t.inviteActionError,
        )
      } finally {
        setInvitationActionId(
          null,
        )
      }
    }

  /* =======================================================
     CERRAR MENÚ AL HACER CLICK AFUERA
     ======================================================= */

  useEffect(() => {
    const handleOutsideClick =
      (
        event: MouseEvent,
      ) => {
        if (
          menuAreaRef.current &&
          !menuAreaRef.current.contains(
            event.target as Node,
          )
        ) {
          setOpenMenuId(
            null,
          )
        }
      }

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      )
    }
  }, [])

  /* =======================================================
     FORMATEAR FECHA
     ======================================================= */

  const formatDate = (
    date: string,
  ) => {
    return new Intl.DateTimeFormat(
      language === 'es'
        ? 'es-AR'
        : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      },
    ).format(
      new Date(
        `${date}T00:00:00Z`,
      ),
    )
  }

  /* =======================================================
     EXPORTAR CAMPAÑA
     ======================================================= */

  const handleExportCampaign =
    async (
      campaign: Campaign,
      format:
        | 'docx'
        | 'pdf'
        | 'json',
    ) => {
      setExportingCampaignId(
        campaign.id,
      )

      setErrorMessage('')

      try {
        const archive =
          await loadCampaignArchive({
            id:
              campaign.id,

            name:
              campaign.name,

            system:
              campaign.system,

            party_name:
              campaign.party_name,

            description:
              campaign.description,

            start_date:
              campaign.start_date,
          })

        if (
          format === 'docx'
        ) {
          await exportCampaignDocx(
            archive,
          )
        }

        if (
          format === 'pdf'
        ) {
          await exportCampaignPdf(
            archive,
          )
        }

        if (
          format === 'json'
        ) {
          exportCampaignJson(
            archive,
          )
        }

        setOpenMenuId(
          null,
        )
      } catch (error) {
        console.error(
          'Error al exportar campaña:',
          error,
        )

        setErrorMessage(
          t.exportError,
        )
      } finally {
        setExportingCampaignId(
          null,
        )
      }
    }

  /* =======================================================
     ELIMINAR CAMPAÑA
     ======================================================= */

  const deleteCampaign =
    async (
      campaign: Campaign,
    ) => {
      const confirmed =
        await confirmAction({ message: t.deleteConfirm, variant: 'danger' })

      if (!confirmed) {
        return
      }

      setErrorMessage('')

      const {
        error,
      } =
        await supabase
          .from(
            'campaigns',
          )
          .delete()
          .eq(
            'id',
            campaign.id,
          )

      if (error) {
        console.error(
          'Error al eliminar campaña:',
          error,
        )

        setErrorMessage(
          t.deleteError,
        )

        return
      }

      if (
        campaign.banner_path
      ) {
        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              'campaign-assets',
            )
            .remove([
              campaign.banner_path,
            ])

        if (storageError) {
          console.error(
            'Error al eliminar banner de campaña:',
            storageError,
          )
        }
      }

      setCampaignBannerUrls(
        (
          currentUrls,
        ) => {
          const nextUrls = {
            ...currentUrls,
          }

          delete nextUrls[
            campaign.id
          ]

          return nextUrls
        },
      )

      setCampaigns(
        (
          currentCampaigns,
        ) =>
          currentCampaigns.filter(
            (
              currentCampaign,
            ) =>
              currentCampaign.id !==
              campaign.id,
          ),
      )

      setOpenMenuId(
        null,
      )
    }

  /* =======================================================
     SALIR DE CAMPAÑA
     Player y Sub-GM abandonan su membresía.
     ======================================================= */

  const leaveCampaign =
    async (
      campaign: Campaign,
    ) => {
      const confirmed =
        await confirmAction({
          message:
            t.leaveConfirm,
          variant:
            'danger',
        })

      if (!confirmed) {
        return
      }

      setErrorMessage('')

      const {
        error,
      } =
        await supabase.rpc(
          'leave_campaign',
          {
            target_campaign_id:
              campaign.id,
          },
        )

      if (error) {
        console.error(
          'Error al salir de la campaña:',
          error,
        )

        setErrorMessage(
          t.leaveError,
        )

        return
      }

      setCampaignBannerUrls(
        (
          currentUrls,
        ) => {
          const nextUrls = {
            ...currentUrls,
          }

          delete nextUrls[
            campaign.id
          ]

          return nextUrls
        },
      )

      setCampaigns(
        (
          currentCampaigns,
        ) =>
          currentCampaigns.filter(
            (
              currentCampaign,
            ) =>
              currentCampaign.id !==
              campaign.id,
          ),
      )

      setOpenMenuId(
        null,
      )
    }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="dashboard-page">

      {/* =================================================
          AMBIENTACIÓN DEL DASHBOARD
          ================================================= */}

      <div
        className="dashboard-ambience"
        aria-hidden="true"
      >
        <div className="dashboard-arcane-ring dashboard-arcane-ring-left">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="dashboard-arcane-ring dashboard-arcane-ring-right">
          <span />
          <span />
          <span />
          <span />
        </div>

        <i className="dashboard-rune dashboard-rune-one">
          ◇
        </i>

        <i className="dashboard-rune dashboard-rune-two">
          △
        </i>

        <i className="dashboard-rune dashboard-rune-three">
          ◈
        </i>

        <i className="dashboard-rune dashboard-rune-four">
          ⌖
        </i>

        <i className="dashboard-rune dashboard-rune-five">
          ⋄
        </i>

        <div className="dashboard-dust">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* =================================================
          HEADER
          ================================================= */}
      <AppHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onOpenProfile={onOpenProfile}
        onSignOut={onSignOut}
        profileLabel={t.profile}
        signOutLabel={t.signOut}
        avatarUrl={profileAvatarUrl}
      />

      {/* =================================================
          CONTENIDO
          ================================================= */}

      <main className="dashboard-main">
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">
            {t.eyebrow}
          </p>

          <h1>
            {t.title}
          </h1>

          <p className="dashboard-intro">
            {t.intro}
          </p>

          <div className="dashboard-actions">
            <button
              type="button"
              className="dashboard-primary-action"
              onClick={
                onCreateCampaign
              }
            >
              <LuPlus />

              <span>
                {
                  t.createCampaign
                }
              </span>
            </button>

            <button
              type="button"
              className="dashboard-secondary-action"
              onClick={
                onImportCampaign
              }
            >
              <LuUpload />

              <span>
                {
                  t.importCampaign
                }
              </span>
            </button>
          </div>
        </section>

        {/* =================================================
            INVITACIONES PENDIENTES
            ================================================= */}

        {!invitationsLoading &&
          invitations.length > 0 && (
          <section className="dashboard-invitations">
            <div className="dashboard-invitations-heading">
              <div className="dashboard-invitations-icon">
                <LuMail />
              </div>

              <div>
                <p className="dashboard-invitations-eyebrow">
                  {t.invitationsEyebrow}
                </p>

                <h2>
                  {invitations.length === 1
                    ? t.invitationsTitle
                    : t.invitationsTitlePlural}
                </h2>

                <p>
                  {t.invitationsText}
                </p>
              </div>
            </div>

            <div className="dashboard-invitations-list">
              {invitations.map(
                (invite) => {
                  const busy =
                    invitationActionId ===
                    invite.invite_id

                  return (
                    <article
                      key={
                        invite.invite_id
                      }
                      className="dashboard-invitation-card"
                    >
                      <div className="dashboard-invitation-main">
                        <div className="dashboard-invitation-symbol">
                          <LuShieldCheck />
                        </div>

                        <div>
                          <strong>
                            {invite.campaign_name}
                          </strong>

                          <p className="dashboard-invitation-inviter">
                            {t.invitedBy}{' '}
                            <strong>
                              {invite.invited_by_name}
                            </strong>{' '}
                            {t.asRole}{' '}
                            <strong>
                              {invite.role === 'co_gm'
                                ? t.roleCoGm
                                : t.rolePlayer}
                            </strong>
                          </p>

                          <div className="dashboard-invitation-meta">
                            <span
                              className={
                                invite.role === 'co_gm'
                                  ? 'campaign-role-badge campaign-role-badge-co-gm'
                                  : 'campaign-role-badge campaign-role-badge-player'
                              }
                            >
                              {invite.role === 'co_gm'
                                ? t.roleCoGm
                                : t.rolePlayer}
                            </span>

                            <span>
                              {t.inviteExpires}{' '}
                              {new Intl.DateTimeFormat(
                                language === 'es'
                                  ? 'es-AR'
                                  : 'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              ).format(
                                new Date(
                                  invite.expires_at,
                                ),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="dashboard-invitation-actions">
                        <button
                          type="button"
                          className="dashboard-invitation-decline"
                          disabled={busy}
                          onClick={() =>
                            void declineInvitation(
                              invite,
                            )
                          }
                        >
                          <LuX />

                          <span>
                            {t.declineInvite}
                          </span>
                        </button>

                        <button
                          type="button"
                          className="dashboard-invitation-accept"
                          disabled={busy}
                          onClick={() =>
                            void acceptInvitation(
                              invite,
                            )
                          }
                        >
                          <LuShieldCheck />

                          <span>
                            {t.acceptInvite}
                          </span>
                        </button>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          </section>
        )}

        {invitationError && (
          <div
            className="dashboard-feedback"
            role="alert"
          >
            {invitationError}
          </div>
        )}

        {/* =================================================
            ERROR
            ================================================= */}

        {errorMessage && (
          <div
            className="dashboard-feedback"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {/* =================================================
            CARGANDO
            ================================================= */}

        {loading && (
          <section className="dashboard-empty">
            <div className="dashboard-loading-symbol" />

            <p>
              {t.loading}
            </p>
          </section>
        )}

        {/* =================================================
            VACÍO
            ================================================= */}

        {!loading &&
          campaigns.length ===
            0 && (
            <section className="dashboard-empty">
              <div className="dashboard-empty-icon">
                <LuBookOpen />
              </div>

              <h2>
                {
                  t.emptyTitle
                }
              </h2>

              <p>
                {
                  t.emptyText
                }
              </p>
            </section>
          )}

        {/* =================================================
            CAMPAÑAS
            ================================================= */}

        {!loading &&
          campaigns.length >
            0 && (
            <section className="campaign-grid">
              {campaigns.map(
                (
                  campaign,
                ) => {
                  const isExporting =
                    exportingCampaignId ===
                    campaign.id

                  return (
                    <article
                      key={
                        campaign.id
                      }
                      className="campaign-card"
                    >
                      {/* =================================
                          BANNER DE CAMPAÑA
                          ================================= */}

                      {campaignBannerUrls[
                        campaign.id
                      ] && (
                        <div className="campaign-card-banner">
                          <img
                            src={
                              campaignBannerUrls[
                                campaign.id
                              ]
                            }
                            alt=""
                          />
                        </div>
                      )}

                      {/* =================================
                          CABECERA DE CARD
                          ================================= */}

                      <div className="campaign-card-header">
                        <div className="campaign-card-identity">
                          <div className="campaign-card-symbol">
                          <LuBookOpen />
                        </div>

                          {campaign.role && (
                            <span
                              className={
                                campaign.role === 'gm'
                                  ? 'campaign-role-badge campaign-role-badge-gm'
                                  : campaign.role === 'co_gm'
                                    ? 'campaign-role-badge campaign-role-badge-co-gm'
                                    : 'campaign-role-badge campaign-role-badge-player'
                              }
                            >
                              {campaign.role === 'gm'
                                ? t.roleGm
                                : campaign.role === 'co_gm'
                                  ? t.roleCoGm
                                  : t.rolePlayer}
                            </span>
                          )}
                        </div>

                        <div
                          className="campaign-card-menu-area"
                          ref={
                            openMenuId ===
                            campaign.id
                              ? menuAreaRef
                              : null
                          }
                        >
                          <button
                            type="button"
                            className="campaign-card-menu-button"
                            aria-label={
                              t.campaignMenu
                            }
                            onClick={() =>
                              setOpenMenuId(
                                (
                                  current,
                                ) =>
                                  current ===
                                  campaign.id
                                    ? null
                                    : campaign.id,
                              )
                            }
                          >
                            <span>
                              •••
                            </span>
                          </button>

                          {/* =============================
                              MENÚ DE CAMPAÑA
                              ============================= */}

                          {openMenuId ===
                            campaign.id && (
                            <div className="campaign-card-menu">
                              <button
                                type="button"
                                disabled={
                                  isExporting
                                }
                                onClick={() =>
                                  void handleExportCampaign(
                                    campaign,
                                    'docx',
                                  )
                                }
                              >
                                <LuFileText />

                                <span>
                                  {isExporting
                                    ? t.exporting
                                    : t.exportWord}
                                </span>
                              </button>

                              <button
                                type="button"
                                disabled={
                                  isExporting
                                }
                                onClick={() =>
                                  void handleExportCampaign(
                                    campaign,
                                    'pdf',
                                  )
                                }
                              >
                                <LuFileText />

                                <span>
                                  {isExporting
                                    ? t.exporting
                                    : t.exportPdf}
                                </span>
                              </button>

                              <button
                                type="button"
                                disabled={
                                  isExporting
                                }
                                onClick={() =>
                                  void handleExportCampaign(
                                    campaign,
                                    'json',
                                  )
                                }
                              >
                                <LuDownload />

                                <span>
                                  {isExporting
                                    ? t.exporting
                                    : t.jsonBackup}
                                </span>
                              </button>

                              {campaign.role ===
                              'gm' ? (
                                <button
                                  type="button"
                                  className="campaign-menu-danger"
                                  disabled={
                                    isExporting
                                  }
                                  onClick={() =>
                                    void deleteCampaign(
                                      campaign,
                                    )
                                  }
                                >
                                  <LuTrash2 />

                                  <span>
                                    {
                                      t.deleteCampaign
                                    }
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="campaign-menu-danger"
                                  disabled={
                                    isExporting
                                  }
                                  onClick={() =>
                                    void leaveCampaign(
                                      campaign,
                                    )
                                  }
                                >
                                  <LuLogOut />

                                  <span>
                                    {
                                      t.leaveCampaign
                                    }
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* =================================
                          CONTENIDO
                          ================================= */}

                      <div className="campaign-card-content">
                        <h2>
                          {
                            campaign.name
                          }
                        </h2>

                        <p className="campaign-card-description">
                          {campaign.description ||
                            t.noDescription}
                        </p>

                        <div className="campaign-card-meta">
                          <div>
                            <LuGamepad2 />

                            <span>
                              {campaign.system ||
                                t.unknownSystem}
                            </span>
                          </div>

                          <div>
                            <LuUsers />

                            <span>
                              {campaign.party_name ||
                                t.unknownParty}
                            </span>
                          </div>

                          {campaign.start_date && (
                            <div>
                              <LuCalendarDays />

                              <span>
                                {formatDate(
                                  campaign.start_date,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* =================================
                          ABRIR
                          ================================= */}

                      <button
                        type="button"
                        className="campaign-open-button"
                        onClick={() =>
                          onOpenCampaign(
                            campaign.id,
                          )
                        }
                      >
                        <LuBookOpen />

                        <span>
                          {
                            t.openCampaign
                          }
                        </span>
                      </button>
                    </article>
                  )
                },
              )}
            </section>
          )}
      </main>
    </div>
  )
}

export default DashboardPage