import { useConfirm } from '../components/ConfirmProvider'
import {
  useEffect,
  useState,
} from 'react'

import type {
  ChangeEvent,
  FormEvent,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  LuArrowLeft,
  LuBookOpen,
  LuBox,
  LuCalendarDays,
  LuClock3,
  LuFilePenLine,
  LuShield,
  LuImagePlus,
  LuLayoutDashboard,
  LuMap,
  LuNetwork,
  LuLock,
  LuNotebookPen,
  LuNotebookTabs,
  LuPlus,
  LuSave,
  LuSearch,
  LuScrollText,
  LuSwords,
  LuTrash2,
  LuUsers,
  LuX,
} from 'react-icons/lu'

import CharactersSection from '../components/CharactersSection'
import ItemsSection from '../components/ItemsSection'
import LocationsSection from '../components/LocationsSection'
import NotesSection from '../components/NotesSection'
import MyNotesSection from '../components/MyNotesSection'
import GmNotesSection from '../components/GmNotesSection'
import MembersSection from '../components/MembersSection'
import NpcsSection from '../components/NpcsSection'
import OverviewSection from '../components/OverviewSection'
import TimelineSection from '../components/TimelineSection'
import RelationshipsSection from '../components/RelationshipsSection'
import FactionsSection from '../components/FactionsSection'
import QuickCapture from '../components/QuickCapture'
import AppHeader from '../components/AppHeader'
import QuestsSection from '../components/QuestsSection'
import {
  supabase,
} from '../utils/supabase'

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

type CampaignSection =
  | 'overview'
  | 'sessions'
  | 'timeline'
  | 'relationships'
  | 'factions'
  | 'characters'
  | 'npcs'
  | 'locations'
  | 'quests'
  | 'items'
  | 'notes'
  | 'my-notes'
  | 'gm-notes'
  | 'members'

const campaignSections:
  CampaignSection[] = [
    'overview',
    'sessions',
    'timeline',
    'relationships',
    'factions',
    'characters',
    'npcs',
    'locations',
    'quests',
    'items',
    'notes',
    'my-notes',
    'gm-notes',
    'members',
  ]

interface CampaignPageProps {
  language: Language

  campaignId: string

  onLanguageChange: (
    language: Language,
  ) => void

  onBack: () => void

  onSignOut: () => void

  onOpenProfile: () => void
}

interface Campaign {
  id: string
  name: string
  system: string | null
  party_name: string | null
  description: string | null
  start_date: string | null
  banner_path: string | null
}

interface CampaignSession {
  id: string
  campaign_id: string
  session_number: number | null
  title: string
  session_date: string | null
  summary: string | null
  notes: string | null
  created_at: string
}

interface SessionForm {
  sessionNumber: string
  title: string
  sessionDate: string
  summary: string
  notes: string
}

interface CampaignEditForm {
  name: string
  system: string
  partyName: string
  startDate: string
  description: string
}

interface SearchResult {
  id: string
  section: CampaignSection
  category: string
  title: string
  subtitle: string
}

/* =========================================================
   FORMULARIO VACÍO
   ========================================================= */

const emptySessionForm: SessionForm = {
  sessionNumber: '',
  title: '',
  sessionDate: '',
  summary: '',
  notes: '',
}

/* =========================================================
   TRADUCCIONES
   ========================================================= */

const translations = {
  en: {
    back:
      'Campaigns',

    signOut:
      'Sign out',

    addBanner:
      'Add banner',

    changeBanner:
      'Change banner',

    removeBanner:
      'Remove banner',

    bannerUploading:
      'Uploading...',

    bannerFileError:
      'Choose a JPG, PNG or WebP image up to 3 MB.',

    bannerUploadError:
      'We could not save the campaign banner.',

    bannerRemoveError:
      'We could not remove the campaign banner.',

    editCampaign:
      'Edit campaign',

    editCampaignTitle:
      'Campaign details',

    editCampaignText:
      'Update the information shown throughout this campaign.',

    campaignName:
      'Campaign name',

    campaignNamePlaceholder:
      'The Shattered Crown',

    gameSystem:
      'Game system',

    gameSystemPlaceholder:
      'D&D 5e, Pathfinder, Call of Cthulhu...',

    partyName:
      'Party name',

    partyNamePlaceholder:
      'The Wayward Company',

    startDate:
      'Start date',

    campaignDescription:
      'Description',

    campaignDescriptionPlaceholder:
      'A short description of the campaign, its premise or current situation...',

    saveCampaign:
      'Save changes',

    campaignNameRequired:
      'Give the campaign a name before saving.',

    campaignSaveError:
      'We could not save the campaign changes.',

    campaignSaved:
      'Campaign updated.',

    loading:
      'Opening campaign...',

    loadError:
      'We could not open this campaign.',

    overview:
      'Overview',

    sessions:
      'Sessions',

    timeline:
      'Timeline',

    relationships:
      'Relationships',

    factions:
      'Factions',

    characters:
      'Characters',

    npcs:
      'NPCs',

    locations:
      'Locations',

    quests:
      'Quests',

    items:
      'Items',

    notes:
      'Notes',

    myNotes:
      'My Notes',

    gmNotes:
      'GM Notes',

    members:
      'Members',

    search:
      'Search campaign...',

    searching:
      'Searching...',

    searchNoResults:
      'No matches found.',

    searchError:
      'We could not search the campaign.',

    searchHint:
      'Type at least 2 characters.',

    campaignOverview:
      'Campaign Overview',

    welcomeTitle:
      'Your campaign memory starts here.',

    welcomeText:
      'Sessions, characters, places, quests, items and notes will come together here as your adventure grows.',

    system:
      'System',

    party:
      'Party',

    description:
      'Description',

    notSpecified:
      'Not specified',

    noDescription:
      'No description yet.',

    sectionComingSoon:
      'This section is ready for the next step.',

    sessionsEyebrow:
      'Campaign Journal',

    sessionsTitle:
      'Sessions',

    sessionsDescription:
      'Keep a record of every chapter of your adventure.',

    newSession:
      'New Session',

    noSessionsTitle:
      'No sessions recorded yet.',

    noSessionsText:
      'Create your first session and start building the history of this campaign.',

    session:
      'Session',

    sessionNumber:
      'Session number',

    sessionNumberPlaceholder:
      '1',

    sessionTitle:
      'Title',

    sessionTitlePlaceholder:
      'Into the forgotten ruins',

    sessionDate:
      'Date',

    sessionSummary:
      'Summary',

    sessionSummaryPlaceholder:
      'What happened during this session?',

    sessionNotes:
      'Notes',

    sessionNotesPlaceholder:
      'Clues, decisions, memorable moments, unresolved threads...',

    createSession:
      'Create Session',

    editSession:
      'Edit Session',

    saveSession:
      'Save Session',

    saving:
      'Saving...',

    cancel:
      'Cancel',

    edit:
      'Edit',

    delete:
      'Delete',

    untitledSession:
      'Untitled Session',

    noSummary:
      'No summary has been written for this session yet.',

    sessionsLoadError:
      'We could not load the sessions.',

    sessionSaveError:
      'We could not save this session.',

    sessionDeleteError:
      'We could not delete this session.',

    sessionTitleRequired:
      'Give the session a title before saving.',

    deleteSessionConfirm:
      'Delete this session? This action cannot be undone.',

    created:
      'Session created.',

    updated:
      'Session updated.',

    roleGm:
      'GM',

    roleCoGm:
      'Sub-GM',

    rolePlayer:
      'Player',
  },

  es: {
    back:
      'Campañas',

    signOut:
      'Cerrar sesión',

    addBanner:
      'Agregar banner',

    changeBanner:
      'Cambiar banner',

    removeBanner:
      'Quitar banner',

    bannerUploading:
      'Subiendo...',

    bannerFileError:
      'Elige una imagen JPG, PNG o WebP de hasta 3 MB.',

    bannerUploadError:
      'No pudimos guardar el banner de la campaña.',

    bannerRemoveError:
      'No pudimos quitar el banner de la campaña.',

    editCampaign:
      'Editar campaña',

    editCampaignTitle:
      'Datos de la campaña',

    editCampaignText:
      'Actualiza la información que se muestra en toda la campaña.',

    campaignName:
      'Nombre de la campaña',

    campaignNamePlaceholder:
      'La Corona Quebrada',

    gameSystem:
      'Sistema de juego',

    gameSystemPlaceholder:
      'D&D 5e, Pathfinder, Call of Cthulhu...',

    partyName:
      'Nombre del grupo',

    partyNamePlaceholder:
      'La Compañía Errante',

    startDate:
      'Fecha de inicio',

    campaignDescription:
      'Descripción',

    campaignDescriptionPlaceholder:
      'Una descripción breve de la campaña, su premisa o situación actual...',

    saveCampaign:
      'Guardar cambios',

    campaignNameRequired:
      'Pon un nombre a la campaña antes de guardar.',

    campaignSaveError:
      'No pudimos guardar los cambios de la campaña.',

    campaignSaved:
      'Campaña actualizada.',

    loading:
      'Abriendo campaña...',

    loadError:
      'No pudimos abrir esta campaña.',

    overview:
      'Resumen',

    sessions:
      'Sesiones',

    timeline:
      'Timeline',

    relationships:
      'Relaciones',

    factions:
      'Facciones',

    characters:
      'Personajes',

    npcs:
      'NPCs',

    locations:
      'Lugares',

    quests:
      'Misiones',

    items:
      'Objetos',

    notes:
      'Notas',

    myNotes:
      'Mis notas',

    gmNotes:
      'Notas del GM',

    members:
      'Miembros',

    search:
      'Buscar en la campaña...',

    searching:
      'Buscando...',

    searchNoResults:
      'No encontramos coincidencias.',

    searchError:
      'No pudimos buscar en la campaña.',

    searchHint:
      'Escribe al menos 2 caracteres.',

    campaignOverview:
      'Resumen de campaña',

    welcomeTitle:
      'La memoria de tu campaña empieza aquí.',

    welcomeText:
      'Sesiones, personajes, lugares, misiones, objetos y notas se conectarán aquí a medida que crece tu aventura.',

    system:
      'Sistema',

    party:
      'Grupo',

    description:
      'Descripción',

    notSpecified:
      'No especificado',

    noDescription:
      'Todavía no hay una descripción.',

    sectionComingSoon:
      'Esta sección ya está preparada para el próximo paso.',

    sessionsEyebrow:
      'Diario de campaña',

    sessionsTitle:
      'Sesiones',

    sessionsDescription:
      'Guarda un registro de cada capítulo de tu aventura.',

    newSession:
      'Nueva sesión',

    noSessionsTitle:
      'Todavía no registraste ninguna sesión.',

    noSessionsText:
      'Crea la primera sesión y empieza a construir la historia de esta campaña.',

    session:
      'Sesión',

    sessionNumber:
      'Número de sesión',

    sessionNumberPlaceholder:
      '1',

    sessionTitle:
      'Título',

    sessionTitlePlaceholder:
      'Las ruinas olvidadas',

    sessionDate:
      'Fecha',

    sessionSummary:
      'Resumen',

    sessionSummaryPlaceholder:
      '¿Qué ocurrió durante esta sesión?',

    sessionNotes:
      'Notas',

    sessionNotesPlaceholder:
      'Pistas, decisiones, momentos memorables, asuntos pendientes...',

    createSession:
      'Crear sesión',

    editSession:
      'Editar sesión',

    saveSession:
      'Guardar sesión',

    saving:
      'Guardando...',

    cancel:
      'Cancelar',

    edit:
      'Editar',

    delete:
      'Eliminar',

    untitledSession:
      'Sesión sin título',

    noSummary:
      'Todavía no escribiste un resumen para esta sesión.',

    sessionsLoadError:
      'No pudimos cargar las sesiones.',

    sessionSaveError:
      'No pudimos guardar esta sesión.',

    sessionDeleteError:
      'No pudimos eliminar esta sesión.',

    sessionTitleRequired:
      'Escribe un título para la sesión antes de guardarla.',

    deleteSessionConfirm:
      '¿Eliminar esta sesión? Esta acción no se puede deshacer.',

    created:
      'Sesión creada.',

    updated:
      'Sesión actualizada.',

    roleGm:
      'GM',

    roleCoGm:
      'Sub-GM',

    rolePlayer:
      'Jugador',
  },
}

/* =========================================================
   CAMPAIGN PAGE
   ========================================================= */

function CampaignPage({
  language,
  campaignId,
  onLanguageChange,
  onBack,
  onSignOut,
  onOpenProfile,
}: CampaignPageProps) {
  const confirmAction = useConfirm()
  const t =
    translations[
      language
    ]

  const [
    campaign,
    setCampaign,
  ] =
    useState<Campaign | null>(
      null,
    )


  const [
    campaignRole,
    setCampaignRole,
  ] =
    useState<CampaignRole | null>(
      null,
    )

  const [
    campaignBannerUrl,
    setCampaignBannerUrl,
  ] =
    useState('')

  const [
    uploadingBanner,
    setUploadingBanner,
  ] =
    useState(false)

  const [
    bannerError,
    setBannerError,
  ] =
    useState('')

  const [
    campaignEditorOpen,
    setCampaignEditorOpen,
  ] =
    useState(false)

  const [
    campaignEditForm,
    setCampaignEditForm,
  ] =
    useState<CampaignEditForm>({
      name: '',
      system: '',
      partyName: '',
      startDate: '',
      description: '',
    })

  const [
    savingCampaign,
    setSavingCampaign,
  ] =
    useState(false)

  const [
    campaignEditError,
    setCampaignEditError,
  ] =
    useState('')

  const [
    campaignEditSuccess,
    setCampaignEditSuccess,
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

  const navigate =
    useNavigate()

  const {
    section,
  } =
    useParams<{
      section?: string
    }>()

  const activeSection:
    CampaignSection =
    section &&
    campaignSections.includes(
      section as CampaignSection,
    )
      ? (
          section as
            CampaignSection
        )
      : 'overview'

  const navigateToSection =
    (
      nextSection:
        CampaignSection,
    ) => {
      navigate(
        `/campaign/${campaignId}/${nextSection}`,
      )
    }


  /* =======================================================
     BÚSQUEDA GLOBAL
     ======================================================= */

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState('')

  const [
    searchResults,
    setSearchResults,
  ] =
    useState<SearchResult[]>(
      [],
    )

  const [
    searchLoading,
    setSearchLoading,
  ] =
    useState(false)

  const [
    searchError,
    setSearchError,
  ] =
    useState('')

  const [
    searchOpen,
    setSearchOpen,
  ] =
    useState(false)

  /* =======================================================
     ESTADO DE SESIONES
     ======================================================= */

  const [
    sessions,
    setSessions,
  ] =
    useState<CampaignSession[]>(
      [],
    )

  const [
    sessionsLoading,
    setSessionsLoading,
  ] =
    useState(false)

  const [
    sessionsLoaded,
    setSessionsLoaded,
  ] =
    useState(false)

  const [
    sessionEditorOpen,
    setSessionEditorOpen,
  ] =
    useState(false)

  const [
    editingSessionId,
    setEditingSessionId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    sessionForm,
    setSessionForm,
  ] =
    useState<SessionForm>({
      ...emptySessionForm,
    })

  const [
    savingSession,
    setSavingSession,
  ] =
    useState(false)

  const [
    sessionError,
    setSessionError,
  ] =
    useState('')

  const [
    sessionSuccess,
    setSessionSuccess,
  ] =
    useState('')

  /* =======================================================
     CARGAR CAMPAÑA
     ======================================================= */

  useEffect(() => {
    const loadCampaign =
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
                  name,
                  system,
                  party_name,
                  description,
                  start_date,
                  banner_path
                `,
              )
              .eq(
                'id',
                campaignId,
              )
              .single()

          if (error) {
            console.error(
              'Error al abrir campaña:',
              error,
            )

            setErrorMessage(
              t.loadError,
            )

            return
          }

          setCampaign(
            data as Campaign,
          )
        } catch (error) {
          console.error(
            'Error inesperado al abrir campaña:',
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

    void loadCampaign()
  }, [
    campaignId,
    t.loadError,
  ])

  /* =======================================================
     CARGAR ROL DEL USUARIO EN LA CAMPAÑA
     ======================================================= */

  useEffect(() => {
    const loadCampaignRole =
      async () => {
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
            setCampaignRole(null)
            return
          }

          const {
            data: membership,
            error: membershipError,
          } =
            await supabase
              .from(
                'campaign_members',
              )
              .select(
                'role',
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .eq(
                'user_id',
                userData.user.id,
              )
              .maybeSingle()

          if (membershipError) {
            throw membershipError
          }

          if (
            membership?.role === 'gm' ||
            membership?.role === 'co_gm' ||
            membership?.role === 'player'
          ) {
            setCampaignRole(
              membership.role as CampaignRole,
            )
          } else {
            setCampaignRole(null)
          }
        } catch (error) {
          console.error(
            'Error al cargar el rol de campaña:',
            error,
          )

          setCampaignRole(null)
        }
      }

    void loadCampaignRole()
  }, [
    campaignId,
  ])

  /* =======================================================
     EDITAR DATOS DE LA CAMPAÑA
     ======================================================= */

  const openCampaignEditor = () => {
    if (!campaign) {
      return
    }

    setCampaignEditForm({
      name: campaign.name,
      system: campaign.system ?? '',
      partyName: campaign.party_name ?? '',
      startDate: campaign.start_date ?? '',
      description: campaign.description ?? '',
    })

    setCampaignEditError('')
    setCampaignEditSuccess('')
    setCampaignEditorOpen(true)
  }

  const closeCampaignEditor = () => {
    if (savingCampaign) {
      return
    }

    setCampaignEditorOpen(false)
    setCampaignEditError('')
    setCampaignEditSuccess('')
  }

  const handleCampaignEditSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      if (!campaign) {
        return
      }

      const cleanName =
        campaignEditForm.name.trim()

      if (!cleanName) {
        setCampaignEditError(
          t.campaignNameRequired,
        )
        return
      }

      setSavingCampaign(true)
      setCampaignEditError('')
      setCampaignEditSuccess('')

      const cleanSystem =
        campaignEditForm.system.trim()
      const cleanPartyName =
        campaignEditForm.partyName.trim()
      const cleanDescription =
        campaignEditForm.description.trim()

      try {
        const { error } =
          await supabase
            .from('campaigns')
            .update({
              name: cleanName,
              system:
                cleanSystem || null,
              party_name:
                cleanPartyName || null,
              start_date:
                campaignEditForm.startDate || null,
              description:
                cleanDescription || null,
            })
            .eq(
              'id',
              campaign.id,
            )

        if (error) {
          throw error
        }

        setCampaign((current) =>
          current
            ? {
                ...current,
                name: cleanName,
                system:
                  cleanSystem || null,
                party_name:
                  cleanPartyName || null,
                start_date:
                  campaignEditForm.startDate || null,
                description:
                  cleanDescription || null,
              }
            : current,
        )

        setCampaignEditSuccess(
          t.campaignSaved,
        )

        window.setTimeout(() => {
          setCampaignEditorOpen(false)
          setCampaignEditSuccess('')
        }, 650)
      } catch (error) {
        console.error(
          'Error al editar campaña:',
          error,
        )
        setCampaignEditError(
          t.campaignSaveError,
        )
      } finally {
        setSavingCampaign(false)
      }
    }

  /* =======================================================
     CARGAR URL DEL BANNER DE CAMPAÑA
     ======================================================= */

  useEffect(() => {
    let isMounted = true

    const loadBanner =
      async () => {
        const bannerPath =
          campaign?.banner_path

        if (!bannerPath) {
          setCampaignBannerUrl('')
          return
        }

        const {
          data,
          error,
        } =
          await supabase.storage
            .from(
              'campaign-assets',
            )
            .createSignedUrl(
              bannerPath,
              60 * 60 * 6,
            )

        if (error) {
          console.error(
            'Error al cargar banner de campaña:',
            error,
          )

          if (isMounted) {
            setCampaignBannerUrl('')
          }

          return
        }

        if (isMounted) {
          setCampaignBannerUrl(
            data.signedUrl,
          )
        }
      }

    void loadBanner()

    return () => {
      isMounted = false
    }
  }, [
    campaign?.banner_path,
  ])

  /* =======================================================
     SUBIR / CAMBIAR BANNER
     ======================================================= */

  const handleBannerChange =
    async (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0]

      event.target.value = ''

      if (
        !file ||
        !campaign
      ) {
        return
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
      ]

      const maxSize =
        3 * 1024 * 1024

      if (
        !allowedTypes.includes(
          file.type,
        ) ||
        file.size > maxSize
      ) {
        setBannerError(
          t.bannerFileError,
        )

        return
      }

      setUploadingBanner(true)
      setBannerError('')

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
          throw (
            userError ||
            new Error(
              'Usuario no disponible.',
            )
          )
        }

        const extension =
          file.name
            .split('.')
            .pop()
            ?.toLowerCase() ||
          'jpg'

        const newPath =
          `users/${userData.user.id}/campaigns/${campaign.id}/banner-${Date.now()}.${extension}`

        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              'campaign-assets',
            )
            .upload(
              newPath,
              file,
              {
                cacheControl:
                  '3600',
                upsert: false,
              },
            )

        if (uploadError) {
          throw uploadError
        }

        const previousPath =
          campaign.banner_path

        const {
          error:
            updateError,
        } =
          await supabase
            .from(
              'campaigns',
            )
            .update({
              banner_path:
                newPath,
            })
            .eq(
              'id',
              campaign.id,
            )

        if (updateError) {
          await supabase.storage
            .from(
              'campaign-assets',
            )
            .remove([
              newPath,
            ])

          throw updateError
        }

        setCampaign(
          (
            current,
          ) =>
            current
              ? {
                  ...current,
                  banner_path:
                    newPath,
                }
              : current,
        )

        if (previousPath) {
          const {
            error:
              removeOldError,
          } =
            await supabase.storage
              .from(
                'campaign-assets',
              )
              .remove([
                previousPath,
              ])

          if (removeOldError) {
            console.error(
              'Error al eliminar banner anterior:',
              removeOldError,
            )
          }
        }
      } catch (error) {
        console.error(
          'Error al guardar banner de campaña:',
          error,
        )

        setBannerError(
          t.bannerUploadError,
        )
      } finally {
        setUploadingBanner(false)
      }
    }

  /* =======================================================
     QUITAR BANNER
     ======================================================= */

  const handleRemoveBanner =
    async () => {
      if (
        !campaign?.banner_path ||
        uploadingBanner
      ) {
        return
      }

      setUploadingBanner(true)
      setBannerError('')

      try {
        const bannerPath =
          campaign.banner_path

        const {
          error:
            updateError,
        } =
          await supabase
            .from(
              'campaigns',
            )
            .update({
              banner_path:
                null,
            })
            .eq(
              'id',
              campaign.id,
            )

        if (updateError) {
          throw updateError
        }

        setCampaign(
          (
            current,
          ) =>
            current
              ? {
                  ...current,
                  banner_path:
                    null,
                }
              : current,
        )

        setCampaignBannerUrl('')

        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              'campaign-assets',
            )
            .remove([
              bannerPath,
            ])

        if (storageError) {
          console.error(
            'Error al eliminar archivo de banner:',
            storageError,
          )
        }
      } catch (error) {
        console.error(
          'Error al quitar banner de campaña:',
          error,
        )

        setBannerError(
          t.bannerRemoveError,
        )
      } finally {
        setUploadingBanner(false)
      }
    }

  /* =======================================================
     EJECUTAR BÚSQUEDA GLOBAL
     ======================================================= */

  useEffect(() => {
    const term =
      searchQuery.trim()

    if (
      term.length < 2
    ) {
      setSearchResults([])
      setSearchError('')
      setSearchLoading(false)

      return
    }

    let cancelled =
      false

    const timer =
      window.setTimeout(
        () => {
          const runSearch =
            async () => {
              setSearchLoading(true)
              setSearchError('')

              try {
                const canReadGmNotes =
                  campaignRole === 'gm' ||
                  campaignRole === 'co_gm'

                const [
                  sessionsResult,
                  timelineResult,
                  charactersResult,
                  npcsResult,
                  locationsResult,
                  organizationsResult,
                  questsResult,
                  itemsResult,
                  notesResult,
                  userNotesResult,
                  gmNotesResult,
                ] = await Promise.all([
                  supabase
                    .from('sessions')
                    .select(`
                      id,
                      session_number,
                      title,
                      summary,
                      notes
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('timeline_events')
                    .select(`
                      id,
                      title,
                      description,
                      event_type,
                      calendar_date,
                      time_label
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('characters')
                    .select(`
                      id,
                      name,
                      player_name,
                      class_or_archetype,
                      ancestry,
                      description,
                      notes
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('npcs')
                    .select(`
                      id,
                      name,
                      role,
                      faction,
                      description,
                      notes
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('locations')
                    .select(`
                      id,
                      name,
                      location_type,
                      description,
                      notes
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('organizations')
                    .select(`
                      id,
                      name,
                      organization_type,
                      description,
                      notes
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('quests')
                    .select(`
                      id,
                      title,
                      status,
                      description,
                      reward,
                      notes
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('items')
                    .select(`
                      id,
                      name,
                      item_type,
                      rarity,
                      description,
                      notes
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('notes')
                    .select(`
                      id,
                      title,
                      body,
                      category
                    `)
                    .eq('campaign_id', campaignId),
                  supabase
                    .from('user_notes')
                    .select(`
                      id,
                      title,
                      content
                    `)
                    .eq('campaign_id', campaignId),
                  canReadGmNotes
                    ? supabase
                        .from('gm_notes')
                        .select(`
                          id,
                          title,
                          content
                        `)
                        .eq('campaign_id', campaignId)
                    : Promise.resolve({
                        data: [],
                        error: null,
                      }),
                ])

                const results = [
                  sessionsResult,
                  timelineResult,
                  charactersResult,
                  npcsResult,
                  locationsResult,
                  organizationsResult,
                  questsResult,
                  itemsResult,
                  notesResult,
                  userNotesResult,
                  gmNotesResult,
                ]

                const firstError =
                  results.find(
                    (result) =>
                      result.error,
                  )?.error

                if (
                  firstError
                ) {
                  throw firstError
                }

                const normalizedTerm =
                  normalizeSearchText(
                    term,
                  )

                const matches: SearchResult[] =
                  []

                for (
                  const session
                  of sessionsResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      session.title,
                      session.summary,
                      session.notes,
                      session.session_number,
                    )
                  ) {
                    matches.push({
                      id: session.id,
                      section: 'sessions',
                      category: t.sessions,
                      title:
                        session.session_number
                          ? `${t.session} ${session.session_number}: ${session.title}`
                          : session.title,
                      subtitle:
                        session.summary ??
                        session.notes ??
                        '',
                    })
                  }
                }

                for (
                  const timelineEvent
                  of timelineResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      timelineEvent.title,
                      timelineEvent.description,
                      timelineEvent.event_type,
                      timelineEvent.calendar_date,
                      timelineEvent.time_label,
                    )
                  ) {
                    matches.push({
                      id: timelineEvent.id,
                      section: 'timeline',
                      category: t.timeline,
                      title: timelineEvent.title,
                      subtitle:
                        timelineEvent.calendar_date ??
                        timelineEvent.time_label ??
                        timelineEvent.description ??
                        '',
                    })
                  }
                }

                for (
                  const character
                  of charactersResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      character.name,
                      character.player_name,
                      character.class_or_archetype,
                      character.ancestry,
                      character.description,
                      character.notes,
                    )
                  ) {
                    matches.push({
                      id: character.id,
                      section: 'characters',
                      category: t.characters,
                      title: character.name,
                      subtitle: [
                        character.class_or_archetype,
                        character.player_name,
                      ]
                        .filter(Boolean)
                        .join(' · '),
                    })
                  }
                }

                for (
                  const npc
                  of npcsResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      npc.name,
                      npc.role,
                      npc.faction,
                      npc.description,
                      npc.notes,
                    )
                  ) {
                    matches.push({
                      id: npc.id,
                      section: 'npcs',
                      category: t.npcs,
                      title: npc.name,
                      subtitle: [
                        npc.role,
                        npc.faction,
                      ]
                        .filter(Boolean)
                        .join(' · '),
                    })
                  }
                }

                for (
                  const location
                  of locationsResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      location.name,
                      location.location_type,
                      location.description,
                      location.notes,
                    )
                  ) {
                    matches.push({
                      id: location.id,
                      section: 'locations',
                      category: t.locations,
                      title: location.name,
                      subtitle:
                        location.location_type ??
                        location.description ??
                        '',
                    })
                  }
                }

                for (
                  const organization
                  of organizationsResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      organization.name,
                      organization.organization_type,
                      organization.description,
                      organization.notes,
                    )
                  ) {
                    matches.push({
                      id: organization.id,
                      section: 'factions',
                      category: t.factions,
                      title: organization.name,
                      subtitle:
                        organization.organization_type ??
                        organization.description ??
                        '',
                    })
                  }
                }

                for (
                  const quest
                  of questsResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      quest.title,
                      quest.status,
                      quest.description,
                      quest.reward,
                      quest.notes,
                    )
                  ) {
                    matches.push({
                      id: quest.id,
                      section: 'quests',
                      category: t.quests,
                      title: quest.title,
                      subtitle:
                        quest.description ??
                        quest.reward ??
                        '',
                    })
                  }
                }

                for (
                  const item
                  of itemsResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      item.name,
                      item.item_type,
                      item.rarity,
                      item.description,
                      item.notes,
                    )
                  ) {
                    matches.push({
                      id: item.id,
                      section: 'items',
                      category: t.items,
                      title: item.name,
                      subtitle: [
                        item.item_type,
                        item.rarity,
                      ]
                        .filter(Boolean)
                        .join(' · '),
                    })
                  }
                }

                for (
                  const note
                  of notesResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      note.title,
                      note.body,
                      note.category,
                    )
                  ) {
                    matches.push({
                      id: note.id,
                      section: 'notes',
                      category: t.notes,
                      title: note.title,
                      subtitle:
                        note.category ??
                        note.body ??
                        '',
                    })
                  }
                }

                for (
                  const note
                  of userNotesResult.data ?? []
                ) {
                  if (
                    matchesSearch(
                      normalizedTerm,
                      note.title,
                      note.content,
                    )
                  ) {
                    matches.push({
                      id: note.id,
                      section: 'my-notes',
                      category: t.myNotes,
                      title: note.title,
                      subtitle: note.content ?? '',
                    })
                  }
                }

                if (
                  canReadGmNotes
                ) {
                  for (
                    const note
                    of gmNotesResult.data ?? []
                  ) {
                    if (
                      matchesSearch(
                        normalizedTerm,
                        note.title,
                        note.content,
                      )
                    ) {
                      matches.push({
                        id: note.id,
                        section: 'gm-notes',
                        category: t.gmNotes,
                        title: note.title,
                        subtitle: note.content ?? '',
                      })
                    }
                  }
                }

                if (
                  cancelled
                ) {
                  return
                }

                setSearchResults(
                  matches.slice(
                    0,
                    40,
                  ),
                )
              } catch (error) {
                console.error(
                  'Error en búsqueda global:',
                  error,
                )

                if (
                  !cancelled
                ) {
                  setSearchError(
                    t.searchError,
                  )

                  setSearchResults([])
                }
              } finally {
                if (
                  !cancelled
                ) {
                  setSearchLoading(false)
                }
              }
            }

          void runSearch()
        },
        250,
      )

    return () => {
      cancelled = true

      window.clearTimeout(timer)
    }
  }, [
    campaignId,
    campaignRole,
    searchQuery,
    t.characters,
    t.factions,
    t.gmNotes,
    t.items,
    t.locations,
    t.myNotes,
    t.notes,
    t.npcs,
    t.quests,
    t.searchError,
    t.session,
    t.sessions,
    t.timeline,
  ])

  const openSearchResult =
    (
      result: SearchResult,
    ) => {
      navigateToSection(
        result.section,
      )

      setSearchOpen(false)
      setSearchQuery('')
    }

  /* =======================================================
     CARGAR SESIONES
     ======================================================= */

  useEffect(() => {
    if (
      activeSection !==
        'sessions' ||
      sessionsLoaded
    ) {
      return
    }

    const loadSessions =
      async () => {
        setSessionsLoading(
          true,
        )

        setSessionError('')

        try {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'sessions',
              )
              .select(
                `
                  id,
                  campaign_id,
                  session_number,
                  title,
                  session_date,
                  summary,
                  notes,
                  created_at
                `,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .order(
                'session_number',
                {
                  ascending:
                    false,
                  nullsFirst:
                    false,
                },
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

          setSessions(
            (data ??
              []) as CampaignSession[],
          )

          setSessionsLoaded(
            true,
          )
        } catch (error) {
          console.error(
            'Error al cargar sesiones:',
            error,
          )

          setSessionError(
            t.sessionsLoadError,
          )
        } finally {
          setSessionsLoading(
            false,
          )
        }
      }

    void loadSessions()
  }, [
    activeSection,
    campaignId,
    sessionsLoaded,
    t.sessionsLoadError,
  ])

  /* =======================================================
     NAVEGACIÓN
     ======================================================= */

  const navigation = [
    {
      id:
        'overview' as CampaignSection,

      label:
        t.overview,

      icon:
        LuLayoutDashboard,
    },

    {
      id:
        'sessions' as CampaignSection,

      label:
        t.sessions,

      icon:
        LuScrollText,
    },

    {
      id:
        'timeline' as CampaignSection,

      label:
        t.timeline,

      icon:
        LuClock3,
    },

    {
      id:
        'relationships' as CampaignSection,

      label:
        t.relationships,

      icon:
        LuNetwork,
    },

    {
      id:
        'factions' as CampaignSection,

      label:
        t.factions,

      icon:
        LuShield,
    },

    {
      id:
        'characters' as CampaignSection,

      label:
        t.characters,

      icon:
        LuUsers,
    },

    {
      id:
        'npcs' as CampaignSection,

      label:
        t.npcs,

      icon:
        LuUsers,
    },

    {
      id:
        'locations' as CampaignSection,

      label:
        t.locations,

      icon:
        LuMap,
    },

    {
      id:
        'quests' as CampaignSection,

      label:
        t.quests,

      icon:
        LuSwords,
    },

    {
      id:
        'items' as CampaignSection,

      label:
        t.items,

      icon:
        LuBox,
    },

    {
      id:
        'members' as CampaignSection,

      label:
        t.members,

      icon:
        LuUsers,
    },

    {
      id:
        'notes' as CampaignSection,

      label:
        t.notes,

      icon:
        LuNotebookTabs,
    },

    {
      id:
        'my-notes' as CampaignSection,

      label:
        t.myNotes,

      icon:
        LuNotebookPen,
    },

    ...(
      campaignRole === 'gm' ||
      campaignRole === 'co_gm'
        ? [
          {
            id:
              'gm-notes' as CampaignSection,

            label:
              t.gmNotes,

            icon:
              LuLock,
          },
        ]
      : []),
  ]

  /* =======================================================
     NUEVA SESIÓN
     ======================================================= */

  const openNewSession =
    () => {
      setEditingSessionId(
        null,
      )

      setSessionForm({
        ...emptySessionForm,

        sessionNumber:
          String(
            Math.max(
              0,
              ...sessions.map(
                (session) =>
                  session.session_number ??
                  0,
              ),
            ) + 1,
          ),
      })

      setSessionError('')
      setSessionSuccess('')

      setSessionEditorOpen(
        true,
      )
    }

  /* =======================================================
     EDITAR SESIÓN
     ======================================================= */

  const openEditSession =
    (
      session:
        CampaignSession,
    ) => {
      setEditingSessionId(
        session.id,
      )

      setSessionForm({
        sessionNumber:
          session.session_number !==
          null
            ? String(
                session.session_number,
              )
            : '',

        title:
          session.title,

        sessionDate:
          session.session_date ??
          '',

        summary:
          session.summary ??
          '',

        notes:
          session.notes ??
          '',
      })

      setSessionError('')
      setSessionSuccess('')

      setSessionEditorOpen(
        true,
      )
    }

  /* =======================================================
     CERRAR EDITOR
     ======================================================= */

  const closeSessionEditor =
    () => {
      setSessionEditorOpen(
        false,
      )

      setEditingSessionId(
        null,
      )

      setSessionForm({
        ...emptySessionForm,
      })

      setSessionError('')
    }

  /* =======================================================
     GUARDAR SESIÓN
     ======================================================= */

  const handleSaveSession =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      if (
        !sessionForm.title.trim()
      ) {
        setSessionError(
          t.sessionTitleRequired,
        )

        return
      }

      setSavingSession(true)
      setSessionError('')
      setSessionSuccess('')

      const parsedNumber =
        sessionForm.sessionNumber.trim()
          ? Number(
              sessionForm.sessionNumber,
            )
          : null

      const sessionData = {
        campaign_id:
          campaignId,

        session_number:
          parsedNumber !== null &&
          Number.isFinite(
            parsedNumber,
          )
            ? parsedNumber
            : null,

        title:
          sessionForm.title.trim(),

        session_date:
          sessionForm.sessionDate ||
          null,

        summary:
          sessionForm.summary.trim() ||
          null,

        notes:
          sessionForm.notes.trim() ||
          null,
      }

      try {
        if (
          editingSessionId
        ) {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'sessions',
              )
              .update(
                sessionData,
              )
              .eq(
                'id',
                editingSessionId,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .select(
                `
                  id,
                  campaign_id,
                  session_number,
                  title,
                  session_date,
                  summary,
                  notes,
                  created_at
                `,
              )
              .single()

          if (error) {
            throw error
          }

          setSessions(
            (
              current,
            ) =>
              current
                .map(
                  (
                    session,
                  ) =>
                    session.id ===
                    editingSessionId
                      ? (data as CampaignSession)
                      : session,
                )
                .sort(
                  sortSessions,
                ),
          )

          setSessionSuccess(
            t.updated,
          )
        } else {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'sessions',
              )
              .insert(
                sessionData,
              )
              .select(
                `
                  id,
                  campaign_id,
                  session_number,
                  title,
                  session_date,
                  summary,
                  notes,
                  created_at
                `,
              )
              .single()

          if (error) {
            throw error
          }

          setSessions(
            (
              current,
            ) =>
              [
                ...current,
                data as CampaignSession,
              ].sort(
                sortSessions,
              ),
          )

          setSessionSuccess(
            t.created,
          )
        }

        setSessionEditorOpen(
          false,
        )

        setEditingSessionId(
          null,
        )

        setSessionForm({
          ...emptySessionForm,
        })
      } catch (error) {
        console.error(
          'Error al guardar sesión:',
          error,
        )

        setSessionError(
          t.sessionSaveError,
        )
      } finally {
        setSavingSession(
          false,
        )
      }
    }

  /* =======================================================
     ELIMINAR SESIÓN
     ======================================================= */

  const handleDeleteSession =
    async (
      sessionId:
        string,
    ) => {
      const confirmed =
        await confirmAction({ message: t.deleteSessionConfirm, variant: 'danger' })

      if (!confirmed) {
        return
      }

      setSessionError('')
      setSessionSuccess('')

      try {
        const {
          error,
        } =
          await supabase
            .from(
              'sessions',
            )
            .delete()
            .eq(
              'id',
              sessionId,
            )
            .eq(
              'campaign_id',
              campaignId,
            )

        if (error) {
          throw error
        }

        setSessions(
          (
            current,
          ) =>
            current.filter(
              (
                session,
              ) =>
                session.id !==
                sessionId,
            ),
        )

        if (
          editingSessionId ===
          sessionId
        ) {
          closeSessionEditor()
        }
      } catch (error) {
        console.error(
          'Error al eliminar sesión:',
          error,
        )

        setSessionError(
          t.sessionDeleteError,
        )
      }
    }

  /* =======================================================
     FORMATEAR FECHA
     ======================================================= */

  const formatSessionDate =
    (
      value:
        string | null,
    ) => {
      if (!value) {
        return null
      }

      const date =
        new Date(
          `${value}T00:00:00`,
        )

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return value
      }

      return new Intl.DateTimeFormat(
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
        date,
      )
    }

  /* =======================================================
     CARGA
     ======================================================= */

  if (loading) {
    return (
      <div className="campaign-page-loading">
        <div className="app-loading-symbol" />

        <span>
          {t.loading}
        </span>
      </div>
    )
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (
    errorMessage ||
    !campaign
  ) {
    return (
      <div className="campaign-page-error">
        <LuBookOpen />

        <p>
          {errorMessage ||
            t.loadError}
        </p>

        <button
          type="button"
          onClick={
            onBack
          }
        >
          <LuArrowLeft />

          {t.back}
        </button>
      </div>
    )
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="campaign-page">

      {/* =================================================
          AMBIENTACIÓN DE CAMPAÑA
          ================================================= */}

      <div
        className="campaign-ambience"
        aria-hidden="true"
      >
        <div className="campaign-arcane-ring">
          <span />
          <span />
          <span />
          <span />
        </div>

        <i className="campaign-rune campaign-rune-one">
          ◇
        </i>

        <i className="campaign-rune campaign-rune-two">
          ◈
        </i>

        <i className="campaign-rune campaign-rune-three">
          △
        </i>

        <i className="campaign-rune campaign-rune-four">
          ⋄
        </i>

        <div className="campaign-dust">
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
        onBack={onBack}
        backLabel={t.back}
        signOutLabel={t.signOut}
      />

      {/* =================================================
          CUERPO
          ================================================= */}

      <div className="campaign-layout">
        {/* ===============================================
            SIDEBAR
            =============================================== */}

        <aside className="campaign-sidebar">
          <div className="campaign-sidebar-title">
            <p>
              {campaign.system ||
                t.notSpecified}
            </p>

            <h1>
              {campaign.name}
            </h1>
          </div>

          <nav className="campaign-navigation">
            {navigation.map(
              (
                item,
              ) => {
                const Icon =
                  item.icon

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    className={
                      activeSection ===
                      item.id
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      navigateToSection(
                        item.id,
                      )
                    }
                  >
                    <Icon />

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </button>
                )
              },
            )}
          </nav>
        </aside>

        {/* ===============================================
            CONTENIDO
            =============================================== */}

        <main className="campaign-content">
          {/* =============================================
              BANNER / HERO DE CAMPAÑA
              ============================================= */}

          <section
            className={
              campaignBannerUrl
                ? 'campaign-hero-banner campaign-hero-banner-has-image'
                : 'campaign-hero-banner'
            }
          >
            {campaignBannerUrl && (
              <img
                className="campaign-hero-banner-image"
                src={
                  campaignBannerUrl
                }
                alt=""
              />
            )}

            <div className="campaign-hero-banner-shade" />

            <div className="campaign-hero-banner-copy">
              <span>
                {[
                  campaign.system ||
                    t.notSpecified,
                  campaignRole === 'gm'
                    ? t.roleGm
                    : campaignRole === 'co_gm'
                      ? t.roleCoGm
                      : campaignRole === 'player'
                        ? t.rolePlayer
                        : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>

              <h2>
                {campaign.name}
              </h2>
            </div>

            <div className="campaign-hero-banner-actions">
              <button
                type="button"
                className="campaign-banner-action"
                disabled={
                  savingCampaign
                }
                onClick={
                  openCampaignEditor
                }
              >
                <LuFilePenLine />

                <span>
                  {t.editCampaign}
                </span>
              </button>

              <input
                id="campaign-banner-input"
                className="campaign-banner-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  uploadingBanner
                }
                onChange={
                  handleBannerChange
                }
              />

              <label
                className="campaign-banner-action"
                htmlFor="campaign-banner-input"
                aria-disabled={
                  uploadingBanner
                }
              >
                <LuImagePlus />

                <span>
                  {uploadingBanner
                    ? t.bannerUploading
                    : campaignBannerUrl
                      ? t.changeBanner
                      : t.addBanner}
                </span>
              </label>

              {campaignBannerUrl && (
                <button
                  type="button"
                  className="campaign-banner-action campaign-banner-action-danger"
                  disabled={
                    uploadingBanner
                  }
                  onClick={() =>
                    void handleRemoveBanner()
                  }
                >
                  <LuTrash2 />

                  <span>
                    {t.removeBanner}
                  </span>
                </button>
              )}
            </div>
          </section>

          {bannerError && (
            <p className="campaign-banner-error">
              {bannerError}
            </p>
          )}

          {campaignEditorOpen && (
            <form
              className="campaign-details-editor"
              onSubmit={
                handleCampaignEditSubmit
              }
            >
              <div className="campaign-details-editor-heading">
                <div>
                  <p>{t.editCampaign}</p>
                  <h3>{t.editCampaignTitle}</h3>
                  <span>{t.editCampaignText}</span>
                </div>

                <button
                  type="button"
                  className="campaign-details-editor-close"
                  aria-label={t.cancel}
                  disabled={savingCampaign}
                  onClick={closeCampaignEditor}
                >
                  <LuX />
                </button>
              </div>

              {campaignEditError && (
                <p className="campaign-details-message campaign-details-message-error">
                  {campaignEditError}
                </p>
              )}

              {campaignEditSuccess && (
                <p className="campaign-details-message campaign-details-message-success">
                  {campaignEditSuccess}
                </p>
              )}

              <div className="campaign-details-editor-grid">
                <label>
                  <span>{t.campaignName}</span>
                  <input
                    type="text"
                    maxLength={120}
                    value={campaignEditForm.name}
                    placeholder={t.campaignNamePlaceholder}
                    disabled={savingCampaign}
                    onChange={(event) =>
                      setCampaignEditForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>{t.gameSystem}</span>
                  <input
                    type="text"
                    maxLength={120}
                    value={campaignEditForm.system}
                    placeholder={t.gameSystemPlaceholder}
                    disabled={savingCampaign}
                    onChange={(event) =>
                      setCampaignEditForm((current) => ({
                        ...current,
                        system: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>{t.partyName}</span>
                  <input
                    type="text"
                    maxLength={120}
                    value={campaignEditForm.partyName}
                    placeholder={t.partyNamePlaceholder}
                    disabled={savingCampaign}
                    onChange={(event) =>
                      setCampaignEditForm((current) => ({
                        ...current,
                        partyName: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>{t.startDate}</span>
                  <input
                    type="date"
                    value={campaignEditForm.startDate}
                    disabled={savingCampaign}
                    onChange={(event) =>
                      setCampaignEditForm((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="campaign-details-editor-full">
                  <span>{t.campaignDescription}</span>
                  <textarea
                    rows={5}
                    maxLength={1200}
                    value={campaignEditForm.description}
                    placeholder={t.campaignDescriptionPlaceholder}
                    disabled={savingCampaign}
                    onChange={(event) =>
                      setCampaignEditForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="campaign-details-editor-actions">
                <button
                  type="button"
                  className="campaign-details-secondary"
                  disabled={savingCampaign}
                  onClick={closeCampaignEditor}
                >
                  <LuX />
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  className="campaign-details-primary"
                  disabled={savingCampaign}
                >
                  <LuSave />
                  {savingCampaign
                    ? t.saving
                    : t.saveCampaign}
                </button>
              </div>
            </form>
          )}

          <div className="campaign-content-toolbar">
            <div className="campaign-search-wrapper">
              <div
                className={
                  searchOpen
                    ? 'campaign-search campaign-search-active'
                    : 'campaign-search'
                }
              >
                <LuSearch />

                <input
                  type="search"
                  placeholder={
                    t.search
                  }
                  value={
                    searchQuery
                  }
                  onChange={(
                    event,
                  ) => {
                    setSearchQuery(
                      event.target.value,
                    )

                    setSearchOpen(
                      true,
                    )
                  }}
                  onFocus={() =>
                    setSearchOpen(
                      true,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      'Escape'
                    ) {
                      setSearchOpen(
                        false,
                      )
                    }
                  }}
                  aria-label={
                    t.search
                  }
                />
              </div>

              {searchOpen &&
                searchQuery.trim()
                  .length > 0 && (
                <div className="campaign-search-results">
                  {searchQuery.trim()
                    .length < 2 && (
                    <div className="campaign-search-state">
                      {t.searchHint}
                    </div>
                  )}

                  {searchQuery.trim()
                    .length >= 2 &&
                    searchLoading && (
                    <div className="campaign-search-state">
                      <div className="app-loading-symbol" />

                      <span>
                        {
                          t.searching
                        }
                      </span>
                    </div>
                  )}

                  {searchQuery.trim()
                    .length >= 2 &&
                    !searchLoading &&
                    searchError && (
                    <div className="campaign-search-state campaign-search-state-error">
                      {
                        searchError
                      }
                    </div>
                  )}

                  {searchQuery.trim()
                    .length >= 2 &&
                    !searchLoading &&
                    !searchError &&
                    searchResults.length ===
                      0 && (
                    <div className="campaign-search-state">
                      {
                        t.searchNoResults
                      }
                    </div>
                  )}

                  {searchQuery.trim()
                    .length >= 2 &&
                    !searchLoading &&
                    !searchError &&
                    searchResults.length >
                      0 && (
                    <div className="campaign-search-results-list">
                      {searchResults.map(
                        (
                          result,
                        ) => (
                          <button
                            type="button"
                            className="campaign-search-result"
                            key={`${result.section}-${result.id}`}
                            onClick={() =>
                              openSearchResult(
                                result,
                              )
                            }
                          >
                            <span className="campaign-search-result-category">
                              {
                                result.category
                              }
                            </span>

                            <strong>
                              {
                                result.title
                              }
                            </strong>

                            {result.subtitle && (
                              <span className="campaign-search-result-subtitle">
                                {
                                  result.subtitle
                                }
                              </span>
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* =============================================
              OVERVIEW
              ============================================= */}

          {activeSection ===
            'overview' && (
            <OverviewSection
              language={
                language
              }
              campaignId={
                campaignId
              }
              campaignName={
                campaign.name
              }
              system={
                campaign.system
              }
              partyName={
                campaign.party_name
              }
              description={
                campaign.description
              }
              onNavigate={
                navigateToSection
              }
            />
          )}

          {/* =============================================
              TIMELINE
              ============================================= */}

          {activeSection ===
            'timeline' && (
            <TimelineSection
              language={language}
              campaignId={campaignId}
              campaignRole={campaignRole}
            />
          )}


          {/* =============================================
              RELACIONES
              ============================================= */}

          {activeSection ===
            'relationships' &&
            campaignRole && (
            <RelationshipsSection
              language={language}
              campaignId={campaignId}
              campaignRole={campaignRole}
            />
          )}

          {/* =============================================
              FACCIONES
              ============================================= */}

          {activeSection ===
            'factions' &&
            campaignRole && (
            <FactionsSection
              language={language}
              campaignId={campaignId}
              campaignRole={campaignRole}
            />
          )}

          {/* =============================================
              SESIONES
              ============================================= */}

          {activeSection ===
            'sessions' && (
            <section className="campaign-sessions">
              <div className="campaign-sessions-header">
                <div>
                  <p className="campaign-sessions-eyebrow">
                    {
                      t.sessionsEyebrow
                    }
                  </p>

                  <h2>
                    {
                      t.sessionsTitle
                    }
                  </h2>

                  <p className="campaign-sessions-description">
                    {
                      t.sessionsDescription
                    }
                  </p>
                </div>

                {!sessionEditorOpen && (
                  <button
                    type="button"
                    className="session-new-button"
                    onClick={
                      openNewSession
                    }
                  >
                    <LuPlus />

                    <span>
                      {
                        t.newSession
                      }
                    </span>
                  </button>
                )}
              </div>

              {sessionError && (
                <div
                  className="session-message session-message-error"
                  role="alert"
                >
                  {sessionError}
                </div>
              )}

              {sessionSuccess && (
                <div className="session-message session-message-success">
                  {sessionSuccess}
                </div>
              )}

              {/* =========================================
                  EDITOR
                  ========================================= */}

              {sessionEditorOpen && (
                <form
                  className="session-editor"
                  onSubmit={
                    handleSaveSession
                  }
                >
                  <div className="session-editor-heading">
                    <div>
                      <p>
                        {editingSessionId
                          ? t.editSession
                          : t.createSession}
                      </p>

                      <h3>
                        {sessionForm.title.trim() ||
                          t.untitledSession}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="session-editor-close"
                      onClick={
                        closeSessionEditor
                      }
                      aria-label={
                        t.cancel
                      }
                    >
                      <LuX />
                    </button>
                  </div>

                  <div className="session-editor-grid">
                    <label>
                      <span>
                        {
                          t.sessionNumber
                        }
                      </span>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder={
                          t.sessionNumberPlaceholder
                        }
                        value={
                          sessionForm.sessionNumber
                        }
                        onChange={(
                          event,
                        ) =>
                          setSessionForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              sessionNumber:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        {
                          t.sessionDate
                        }
                      </span>

                      <input
                        type="date"
                        value={
                          sessionForm.sessionDate
                        }
                        onChange={(
                          event,
                        ) =>
                          setSessionForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              sessionDate:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label className="session-editor-full">
                      <span>
                        {
                          t.sessionTitle
                        }
                      </span>

                      <input
                        type="text"
                        placeholder={
                          t.sessionTitlePlaceholder
                        }
                        value={
                          sessionForm.title
                        }
                        onChange={(
                          event,
                        ) =>
                          setSessionForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              title:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        required
                      />
                    </label>

                    <label className="session-editor-full">
                      <span>
                        {
                          t.sessionSummary
                        }
                      </span>

                      <textarea
                        className="session-summary-input"
                        placeholder={
                          t.sessionSummaryPlaceholder
                        }
                        value={
                          sessionForm.summary
                        }
                        onChange={(
                          event,
                        ) =>
                          setSessionForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              summary:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label className="session-editor-full">
                      <span>
                        {
                          t.sessionNotes
                        }
                      </span>

                      <textarea
                        placeholder={
                          t.sessionNotesPlaceholder
                        }
                        value={
                          sessionForm.notes
                        }
                        onChange={(
                          event,
                        ) =>
                          setSessionForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              notes:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="session-editor-actions">
                    <button
                      type="button"
                      className="session-cancel-button"
                      onClick={
                        closeSessionEditor
                      }
                      disabled={
                        savingSession
                      }
                    >
                      <LuX />

                      <span>
                        {
                          t.cancel
                        }
                      </span>
                    </button>

                    <button
                      type="submit"
                      className="session-save-button"
                      disabled={
                        savingSession
                      }
                    >
                      <LuSave />

                      <span>
                        {savingSession
                          ? t.saving
                          : t.saveSession}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================
                  LISTADO
                  ========================================= */}

              {!sessionEditorOpen &&
                sessionsLoading && (
                  <div className="sessions-loading">
                    <div className="app-loading-symbol" />

                    <span>
                      {
                        t.loading
                      }
                    </span>
                  </div>
                )}

              {!sessionEditorOpen &&
                !sessionsLoading &&
                sessions.length ===
                  0 && (
                  <div className="sessions-empty">
                    <LuScrollText />

                    <h3>
                      {
                        t.noSessionsTitle
                      }
                    </h3>

                    <p>
                      {
                        t.noSessionsText
                      }
                    </p>

                    <button
                      type="button"
                      onClick={
                        openNewSession
                      }
                    >
                      <LuPlus />

                      <span>
                        {
                          t.newSession
                        }
                      </span>
                    </button>
                  </div>
                )}

              {!sessionEditorOpen &&
                !sessionsLoading &&
                sessions.length >
                  0 && (
                  <div className="sessions-list">
                    {sessions.map(
                      (
                        session,
                      ) => {
                        const formattedDate =
                          formatSessionDate(
                            session.session_date,
                          )

                        return (
                          <article
                            className="session-card"
                            key={
                              session.id
                            }
                          >
                            <div className="session-card-top">
                              <div className="session-card-meta">
                                <span className="session-card-number">
                                  {t.session}

                                  {session.session_number !==
                                    null &&
                                    ` ${session.session_number}`}
                                </span>

                                {formattedDate && (
                                  <span className="session-card-date">
                                    <LuCalendarDays />

                                    {
                                      formattedDate
                                    }
                                  </span>
                                )}
                              </div>

                              <div className="session-card-actions">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditSession(
                                      session,
                                    )
                                  }
                                  title={
                                    t.edit
                                  }
                                  aria-label={
                                    t.edit
                                  }
                                >
                                  <LuFilePenLine />
                                </button>

                                <button
                                  type="button"
                                  className="session-delete-button"
                                  onClick={() =>
                                    void handleDeleteSession(
                                      session.id,
                                    )
                                  }
                                  title={
                                    t.delete
                                  }
                                  aria-label={
                                    t.delete
                                  }
                                >
                                  <LuTrash2 />
                                </button>
                              </div>
                            </div>

                            <h3>
                              {session.title ||
                                t.untitledSession}
                            </h3>

                            <p>
                              {session.summary ||
                                t.noSummary}
                            </p>

                            {session.notes && (
                              <div className="session-card-notes">
                                <LuNotebookTabs />

                                <span>
                                  {
                                    session.notes
                                  }
                                </span>
                              </div>
                            )}
                          </article>
                        )
                      },
                    )}
                  </div>
                )}
            </section>
          )}

          
          
                     {/* =============================================
              PERSONAJES
              ============================================= */}

          {activeSection ===
            'characters' && (
            <CharactersSection
              language={
                language
              }
              campaignId={
                campaignId
              }
            />
          )}

          {/* =============================================
              NPCS
              ============================================= */}

          {activeSection ===
            'npcs' && (
            <NpcsSection
              language={
                language
              }
              campaignId={
                campaignId
              }
            />
          )}

          {/* =============================================
              LUGARES
              ============================================= */}

          {activeSection ===
            'locations' && (
            <LocationsSection
              language={
                language
              }
              campaignId={
                campaignId
              }
            />
          )}

          {/* =============================================
              MISIONES
              ============================================= */}

          {activeSection ===
            'quests' && (
            <QuestsSection
              language={
                language
              }
              campaignId={
                campaignId
              }
            />
          )}

          {/* =============================================
              OBJETOS
              ============================================= */}

          {activeSection ===
            'items' && (
            <ItemsSection
              language={
                language
              }
              campaignId={
                campaignId
              }
            />
          )}

          {/* =============================================
              MIEMBROS
              ============================================= */}

          {activeSection ===
            'members' && (
            <MembersSection
              language={
                language
              }
              campaignId={
                campaignId
              }
              campaignRole={
                campaignRole
              }
            />
          )}

          {/* =============================================
              NOTAS COMPARTIDAS
              ============================================= */}

          {activeSection ===
            'notes' && (
            <NotesSection
              language={
                language
              }
              campaignId={
                campaignId
              }
            />
          )}

          {/* =============================================
              MIS NOTAS
              ============================================= */}

          {activeSection ===
            'my-notes' && (
            <MyNotesSection
              language={
                language
              }
              campaignId={
                campaignId
              }
            />
          )}

          {/* =============================================
              NOTAS DEL GM
              Visible para GM y Sub-GM
              ============================================= */}

          {activeSection ===
            'gm-notes' &&
            (
              campaignRole === 'gm' ||
              campaignRole === 'co_gm'
            ) && (
            <GmNotesSection
              language={
                language
              }
              campaignId={
                campaignId
              }
            />
          )}

        </main>
      </div>

      <QuickCapture
        language={language}
        campaignId={campaignId}
      />
    </div>
  )
}

/* =========================================================
   UTILIDADES DE BÚSQUEDA
   ========================================================= */

function normalizeSearchText(
  value:
    string | number | null | undefined,
) {
  return String(
    value ?? '',
  )
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
}

function matchesSearch(
  normalizedTerm:
    string,
  ...values:
    Array<
      string |
      number |
      null |
      undefined
    >
) {
  return values.some(
    (
      value,
    ) =>
      normalizeSearchText(
        value,
      ).includes(
        normalizedTerm,
      ),
  )
}


/* =========================================================
   ORDENAR SESIONES
   ========================================================= */

function sortSessions(
  first: CampaignSession,
  second: CampaignSession,
) {
  const firstNumber =
    first.session_number ??
    -1

  const secondNumber =
    second.session_number ??
    -1

  if (
    firstNumber !==
    secondNumber
  ) {
    return (
      secondNumber -
      firstNumber
    )
  }

  return (
    new Date(
      second.created_at,
    ).getTime() -
    new Date(
      first.created_at,
    ).getTime()
  )
}

export default CampaignPage