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

/* =========================================================
   TIPOS
   ========================================================= */

type Language =
  | 'en'
  | 'es'

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

    noDescription:
      'No description yet.',

    unknownSystem:
      'System not specified',

    unknownParty:
      'Party not specified',
  },

  es: {
    eyebrow:
      'Tus aventuras',

    title:
      'Campañas',

    intro:
      'Creá una nueva campaña o traé tus notas existentes a Campaign Chronicles.',

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
      'Creá tu primera campaña y empezá a construir la memoria de tu aventura.',

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
      '¿Seguro que querés eliminar esta campaña? Esta acción no se puede deshacer.',

    deleteError:
      'No pudimos eliminar la campaña.',

    noDescription:
      'Todavía no hay una descripción.',

    unknownSystem:
      'Sistema no especificado',

    unknownParty:
      'Grupo no especificado',
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

          const loadedCampaigns =
            (data ??
              []) as Campaign[]

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
        window.confirm(
          t.deleteConfirm,
        )

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
                        <div className="campaign-card-symbol">
                          <LuBookOpen />
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