import {
  useState,
} from 'react'

import type {
  ChangeEvent,
  FormEvent,
} from 'react'

import {
  LuFileText,
  LuUpload,
} from 'react-icons/lu'

import {
  downloadCampaignTemplateDocx,
  downloadCampaignTemplatePdf,
  readCampaignFile,
} from '../utils/campaignFiles'

import { parseCampaignImport } from '../utils/compactCampaignImport'

import {
  supabase,
} from '../utils/supabase'

/* =========================================================
   TIPOS
   ========================================================= */

import AppHeader from '../components/AppHeader'

type Language =
  | 'en'
  | 'es'

type CampaignRole =
  | 'gm'
  | 'player'

interface ImportCampaignPageProps {
  language: Language
  onBack: () => void
  onImported: () => void
  onLanguageChange: (language: Language) => void
  onOpenProfile: () => void
  onSignOut: () => void
}

/* =========================================================
   TRADUCCIONES
   ========================================================= */

const translations = {
  en: {
    back:
      'Back to campaigns',

    eyebrow:
      'Bring your story',

    title:
      'Import Campaign',

    intro:
      'Paste your existing campaign notes or upload a TXT, Word or PDF document.',

    campaignName:
      'Campaign name',

    campaignPlaceholder:
      'My campaign',

    system:
      'Game system',

    systemPlaceholder:
      'D&D 5e, Pathfinder, Call of Cthulhu...',

    templateEyebrow:
      'Start with a template',

    templateTitle:
      'Use our campaign template',

    templateDescription:
      'Download a structured template if you are starting from scratch. The Word version is editable; the PDF version is useful as a printable guide or reference.',

    wordTemplate:
      'Download Word Template',

    pdfTemplate:
      'Download PDF Template',

    pasteTitle:
      'Paste notes',

    pastePlaceholder:
      'Paste your campaign notes here...',

    or:
      'or',

    upload:
      'Choose file',

    accepted:
      'TXT, DOCX or PDF',

    reading:
      'Reading document...',

    preview:
      'Import preview',

    previewDescription:
      'Structured templates are detected automatically and each entry is imported into its proper campaign section.',

    structuredDetected:
      'Structured template detected',

    unclassified:
      'Unclassified notes',

    characters:
      'Characters',

    sessions:
      'Sessions',

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

    factions:
      'Factions',

    relationships:
      'Relationships',

    timeline:
      'Timeline',

    nothing:
      'Add some text or choose a document first.',

    import:
      'Import Campaign',

    importing:
      'Importing...',

    errorReading:
      'We could not read this document.',

    errorImporting:
      'We could not import the campaign.',

    sourceTitle:
      'Imported campaign notes',

    roleQuestion:
      'Are you a GM or a player?',

    roleHelp:
      'Your role controls which campaign tools and private information you can access.',

    roleGm:
      'GM',

    roleGmDescription:
      'Manage the campaign and access private GM information.',

    rolePlayer:
      'Player',

    rolePlayerDescription:
      'Keep track of the campaign from a player perspective.',

    roleRequired:
      'Choose your role in this campaign.',
    playerImportNotice:
      'Player mode imports the shared chronicle you know, without granting GM permissions. Content marked GM-only is skipped.',
  },

  es: {
    back:
      'Volver a campañas',

    eyebrow:
      'Trae tu historia',

    title:
      'Importar campaña',

    intro:
      'Pega las notas de tu campaña o sube un documento TXT, Word o PDF.',

    campaignName:
      'Nombre de la campaña',

    campaignPlaceholder:
      'Mi campaña',

    system:
      'Sistema de juego',

    systemPlaceholder:
      'D&D 5e, Pathfinder, Call of Cthulhu...',

    templateEyebrow:
      'Empieza con una plantilla',

    templateTitle:
      'Usa nuestra plantilla de campaña',

    templateDescription:
      'Descarga una plantilla estructurada si empiezas desde cero. La versión Word es editable; la versión PDF sirve como guía imprimible o de referencia.',

    wordTemplate:
      'Descargar plantilla Word',

    pdfTemplate:
      'Descargar plantilla PDF',

    pasteTitle:
      'Pegar notas',

    pastePlaceholder:
      'Pega aquí las notas de tu campaña...',

    or:
      'o',

    upload:
      'Elegir archivo',

    accepted:
      'TXT, DOCX o PDF',

    reading:
      'Leyendo documento...',

    preview:
      'Vista previa',

    previewDescription:
      'Las plantillas estructuradas se detectan automáticamente y cada entrada se importa en la sección correspondiente.',

    structuredDetected:
      'Plantilla estructurada detectada',

    unclassified:
      'Notas sin clasificar',

    characters:
      'Personajes',

    sessions:
      'Sesiones',

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

    factions:
      'Facciones',

    relationships:
      'Relaciones',

    timeline:
      'Línea de tiempo',

    nothing:
      'Primero pega texto o elige un documento.',

    import:
      'Importar campaña',

    importing:
      'Importando...',

    errorReading:
      'No pudimos leer este documento.',

    errorImporting:
      'No pudimos importar la campaña.',

    sourceTitle:
      'Notas importadas de la campaña',

    roleQuestion:
      '¿Eres GM o jugador?',

    roleHelp:
      'Tu rol determina a qué herramientas e información privada de la campaña puedes acceder.',

    roleGm:
      'GM',

    roleGmDescription:
      'Gestiona la campaña y accede a la información privada del GM.',

    rolePlayer:
      'Jugador',

    rolePlayerDescription:
      'Lleva el registro de la campaña desde la perspectiva de un jugador.',

    roleRequired:
      'Elige tu rol en esta campaña.',
    playerImportNotice:
      'El modo Jugador importa la crónica compartida que conocés, sin darte permisos de GM. El contenido marcado como Solo GM se omite.',
  },
}

/* =========================================================
   IMPORTAR CAMPAÑA
   ========================================================= */

function ImportCampaignPage({
  language,
  onLanguageChange,
  onOpenProfile,
  onSignOut,
  onBack,
  onImported,
}: ImportCampaignPageProps) {
  const t =
    translations[
      language
    ]

  const [
    campaignName,
    setCampaignName,
  ] =
    useState('')

  const [
    system,
    setSystem,
  ] =
    useState('')

  const [
    campaignRole,
    setCampaignRole,
  ] =
    useState<CampaignRole | null>(
      null,
    )

  const [
    sourceText,
    setSourceText,
  ] =
    useState('')

  const [
    fileName,
    setFileName,
  ] =
    useState('')

  const [
    readingFile,
    setReadingFile,
  ] =
    useState(false)

  const [
    importing,
    setImporting,
  ] =
    useState(false)

  const [
    downloadingWord,
    setDownloadingWord,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')

  const parsedImport =
    parseCampaignImport(
      sourceText,
    )

  /* =======================================================
     DESCARGAR PLANTILLA WORD
     ======================================================= */

  const handleDownloadWordTemplate =
    async () => {
      setDownloadingWord(
        true,
      )

      try {
        await downloadCampaignTemplateDocx(
          language,
        )
      } catch (error) {
        console.error(
          'Error al descargar plantilla Word:',
          error,
        )
      } finally {
        setDownloadingWord(
          false,
        )
      }
    }

  /* =======================================================
     DESCARGAR PLANTILLA PDF
     ======================================================= */

  const handleDownloadPdfTemplate =
    () => {
      try {
        downloadCampaignTemplatePdf(
          language,
        )
      } catch (error) {
        console.error(
          'Error al descargar plantilla PDF:',
          error,
        )
      }
    }

  /* =======================================================
     LEER ARCHIVO
     ======================================================= */

  const handleFileChange =
    async (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0]

      if (!file) {
        return
      }

      setReadingFile(true)
      setErrorMessage('')
      setFileName(
        file.name,
      )

      try {
        const text =
          await readCampaignFile(
            file,
          )

        setSourceText(
          text,
        )

        const parsed =
          parseCampaignImport(
            text,
          )

        if (
          parsed.structured &&
          parsed.campaign.name
        ) {
          setCampaignName(
            parsed.campaign.name,
          )
        } else if (
          !campaignName.trim()
        ) {
          const suggestedName =
            file.name.replace(
              /\.(txt|docx|pdf)$/i,
              '',
            )

          setCampaignName(
            suggestedName,
          )
        }

        if (
          parsed.structured &&
          parsed.campaign.system
        ) {
          setSystem(
            parsed.campaign.system,
          )
        }
      } catch (error) {
        console.error(
          'Error al leer archivo:',
          error,
        )

        setErrorMessage(
          t.errorReading,
        )
      } finally {
        setReadingFile(
          false,
        )

        event.target.value =
          ''
      }
    }

  /* =======================================================
     IMPORTAR CAMPAÑA
     ======================================================= */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      if (
        !(campaignName.trim() || parsedImport.campaign.name.trim()) ||
        !sourceText.trim()
      ) {
        setErrorMessage(
          t.nothing,
        )

        return
      }

      if (!campaignRole) {
        setErrorMessage(
          t.roleRequired,
        )

        return
      }

      setImporting(true)
      setErrorMessage('')

      let createdCampaignId:
        | string
        | null = null

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
            userError ??
            new Error(
              'No authenticated user.',
            )
          )
        }

        const parsed =
          parseCampaignImport(
            sourceText,
          )

        const {
          data: campaign,
          error:
            campaignError,
        } =
          await supabase
            .from(
              'campaigns',
            )
            .insert({
              owner_id:
                userData.user.id,

              name:
                parsed.campaign.name.trim() ||
                campaignName.trim(),

              system:
                system.trim() ||
                parsed.campaign.system ||
                null,

              party_name:
                parsed.structured
                  ? parsed.campaign.party_name ||
                    null
                  : null,

              start_date:
                parsed.structured
                  ? parsed.campaign.start_date
                  : null,

              description:
                parsed.structured
                  ? parsed.campaign.description ||
                    null
                  : null,
            })
            .select(
              'id',
            )
            .single()

        if (
          campaignError
        ) {
          throw campaignError
        }

        createdCampaignId =
          campaign.id

        const {
          error: memberError,
        } =
          await supabase
            .from(
              'campaign_members',
            )
            .insert({
              campaign_id:
                campaign.id,
              user_id:
                userData.user.id,
              role:
                campaignRole,
            })

        if (memberError) {
          throw memberError
        }

        if (
          parsed.structured
        ) {
          if (
            parsed.characters.length >
            0
          ) {
            const {
              error,
            } =
              await supabase
                .from(
                  'characters',
                )
                .insert(
                  parsed.characters.map(
                    (character) => ({
                      campaign_id:
                        campaign.id,
                      name:
                        character.name,
                      player_name:
                        character.player_name,
                      class_or_archetype:
                        character.class_or_archetype,
                      ancestry:
                        character.ancestry,
                      ...(character.status
                        ? {
                            status:
                              character.status,
                          }
                        : {}),
                      description:
                        character.description,
                      notes:
                        character.notes,
                    }),
                  ),
                )

            if (error) {
              throw error
            }
          }

          if (
            parsed.sessions.length >
            0
          ) {
            const {
              error,
            } =
              await supabase
                .from(
                  'sessions',
                )
                .insert(
                  parsed.sessions.map(
                    (session) => ({
                      campaign_id:
                        campaign.id,
                      session_number:
                        session.session_number,
                      title:
                        session.title,
                      session_date:
                        session.session_date,
                      summary:
                        session.summary,
                      notes:
                        session.notes,
                    }),
                  ),
                )

            if (error) {
              throw error
            }
          }

          if (
            parsed.npcs.length >
            0
          ) {
            const {
              error,
            } =
              await supabase
                .from('npcs')
                .insert(
                  parsed.npcs.map(
                    (npc) => ({
                      campaign_id:
                        campaign.id,
                      name:
                        npc.name,
                      role:
                        npc.role,
                      faction:
                        npc.faction,
                      status:
                        npc.status ||
                        'unknown',
                      description:
                        npc.description,
                      notes:
                        npc.notes,
                    }),
                  ),
                )

            if (error) {
              throw error
            }
          }

          if (
            parsed.locations.length >
            0
          ) {
            const {
              error,
            } =
              await supabase
                .from(
                  'locations',
                )
                .insert(
                  parsed.locations.map(
                    (location) => ({
                      campaign_id:
                        campaign.id,
                      name:
                        location.name,
                      location_type:
                        location.location_type,
                      description:
                        location.description,
                      notes:
                        location.notes,
                    }),
                  ),
                )

            if (error) {
              throw error
            }
          }

          if (
            parsed.quests.length >
            0
          ) {
            const {
              error,
            } =
              await supabase
                .from(
                  'quests',
                )
                .insert(
                  parsed.quests.map(
                    (quest) => ({
                      campaign_id:
                        campaign.id,
                      title:
                        quest.title,
                      ...(quest.status
                        ? {
                            status:
                              quest.status,
                          }
                        : {}),
                      description:
                        quest.description,
                      reward:
                        quest.reward,
                      notes:
                        quest.notes,
                    }),
                  ),
                )

            if (error) {
              throw error
            }
          }

          if (
            parsed.items.length >
            0
          ) {
            const {
              error,
            } =
              await supabase
                .from('items')
                .insert(
                  parsed.items.map(
                    (item) => ({
                      campaign_id:
                        campaign.id,
                      name:
                        item.name,
                      item_type:
                        item.item_type,
                      rarity:
                        item.rarity,
                      ...(item.quantity !==
                      null
                        ? {
                            quantity:
                              item.quantity,
                          }
                        : {}),
                      description:
                        item.description,
                      notes:
                        item.notes,
                    }),
                  ),
                )

            if (error) {
              throw error
            }
          }

          if (
            parsed.notes.length >
            0
          ) {
            const {
              error,
            } =
              await supabase
                .from('notes')
                .insert(
                  parsed.notes.map(
                    (note) => ({
                      campaign_id:
                        campaign.id,
                      title:
                        note.title,
                      body:
                        note.body,
                      category:
                        note.category,
                      is_pinned:
                        note.is_pinned,
                    }),
                  ),
                )

            if (error) {
              throw error
            }
          }
          const importableFactions = parsed.factions.filter(
            (faction) => campaignRole === 'gm' || faction.visibility !== 'gm_only',
          )
          if (importableFactions.length > 0) {
            const { error } = await supabase.from('organizations').insert(
              importableFactions.map((faction) => ({
                campaign_id: campaign.id,
                name: faction.name,
                organization_type: faction.organization_type,
                description: faction.description,
                notes: faction.notes,
                visibility: campaignRole === 'gm' ? faction.visibility : 'shared',
                created_by: userData.user.id,
              })),
            )
            if (error) throw error
          }

          if (parsed.timeline.length > 0) {
            const { error } = await supabase.from('timeline_events').insert(
              parsed.timeline.map((timelineEvent, index) => ({
                campaign_id: campaign.id,
                created_by: userData.user.id,
                title: timelineEvent.title,
                description: timelineEvent.description,
                event_type: timelineEvent.event_type,
                calendar_date: timelineEvent.calendar_date,
                time_label: timelineEvent.time_label,
                sort_order: index,
              })),
            )
            if (error) throw error
          }

          if (parsed.relationships.length > 0) {
            const entityConfigs = [
              ['character', 'characters', 'name'],
              ['npc', 'npcs', 'name'],
              ['location', 'locations', 'name'],
              ['organization', 'organizations', 'name'],
              ['quest', 'quests', 'title'],
              ['item', 'items', 'name'],
            ] as const
            const entityIds = new Map<string, string>()
            const gmOnlyOrganizations = new Set<string>()

            for (const [type, table, label] of entityConfigs) {
              const selectFields =
                type === 'organization'
                  ? `id,${label},visibility`
                  : `id,${label}`

              const { data, error } = await supabase
                .from(table)
                .select(selectFields)
                .eq('campaign_id', campaign.id)

              if (error) throw error

              for (const row of data ?? []) {
                const typedRow = row as unknown as Record<string, unknown>
                const entityLabel = String(typedRow[label] ?? '')
                  .trim()
                  .toLocaleLowerCase()

                if (!entityLabel) continue

                const key = `${type}:${entityLabel}`
                entityIds.set(key, String(typedRow.id))

                if (
                  type === 'organization' &&
                  typedRow.visibility === 'gm_only'
                ) {
                  gmOnlyOrganizations.add(String(typedRow.id))
                }
              }
            }

            const rows = parsed.relationships.flatMap((relationship) => {
              if (campaignRole === 'player' && relationship.visibility === 'gm_only') return []

              const sourceId = entityIds.get(`${relationship.source_type}:${relationship.source_name.trim().toLocaleLowerCase()}`)
              const targetId = entityIds.get(`${relationship.target_type}:${relationship.target_name.trim().toLocaleLowerCase()}`)
              if (!sourceId || !targetId) return []

              const touchesGmOnlyOrganization =
                (relationship.source_type === 'organization' && gmOnlyOrganizations.has(sourceId)) ||
                (relationship.target_type === 'organization' && gmOnlyOrganizations.has(targetId))

              const visibility =
                campaignRole === 'gm'
                  ? touchesGmOnlyOrganization
                    ? 'gm_only'
                    : relationship.visibility
                  : 'shared'

              return [{
                campaign_id: campaign.id,
                source_type: relationship.source_type,
                source_id: sourceId,
                target_type: relationship.target_type,
                target_id: targetId,
                relationship_type: relationship.relationship_type,
                notes: relationship.notes,
                visibility,
                created_by: userData.user.id,
              }]
            })

            if (rows.length > 0) {
              const { error } = await supabase.from('campaign_relationships').insert(rows)
              if (error) throw error
            }
          }

        } else {
          const {
            error: noteError,
          } =
            await supabase
              .from('notes')
              .insert({
                campaign_id:
                  campaign.id,

                title:
                  t.sourceTitle,

                body:
                  sourceText.trim(),

                category:
                  'imported',

                is_pinned:
                  false,
              })

          if (
            noteError
          ) {
            throw noteError
          }
        }

        onImported()
      } catch (error) {
        console.error(
          'Error al importar campaña:',
          error,
        )

        if (
          createdCampaignId
        ) {
          await supabase
            .from(
              'campaigns',
            )
            .delete()
            .eq(
              'id',
              createdCampaignId,
            )
        }

        setErrorMessage(
          t.errorImporting,
        )
      } finally {
        setImporting(
          false,
        )
      }
    }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="import-campaign-page">
      {/* =================================================
          AMBIENTACIÓN — IMPORTAR CAMPAÑA
          ================================================= */}

      <div
        className="import-campaign-ambience"
        aria-hidden="true"
      >
        <div className="import-campaign-ornament import-campaign-ornament-one">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="import-campaign-ornament import-campaign-ornament-two">
          <span />
          <span />
          <span />
          <span />
        </div>

        <i className="import-campaign-glyph import-campaign-glyph-one">◇</i>
        <i className="import-campaign-glyph import-campaign-glyph-two">△</i>
        <i className="import-campaign-glyph import-campaign-glyph-three">◈</i>

        <div className="import-campaign-dust">
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
      <AppHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onOpenProfile={onOpenProfile}
        onSignOut={onSignOut}
        onBack={onBack}
        backLabel={t.back}
      />

      <main className="import-campaign-main">
        <section className="import-campaign-heading">
          <p className="import-campaign-eyebrow">
            {t.eyebrow}
          </p>

          <h1>
            {t.title}
          </h1>

          <p>
            {t.intro}
          </p>
        </section>

        <form
          className="import-campaign-form"
          onSubmit={
            handleSubmit
          }
        >
          <div className="import-campaign-fields">
            <label>
              <span>
                {
                  t.campaignName
                }
              </span>

              <input
                type="text"
                value={
                  campaignName
                }
                placeholder={
                  t.campaignPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setCampaignName(
                    event.target
                      .value,
                  )
                }
                required
              />
            </label>

            <label>
              <span>
                {t.system}
              </span>

              <input
                type="text"
                value={system}
                placeholder={
                  t.systemPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setSystem(
                    event.target
                      .value,
                  )
                }
              />
            </label>
          </div>


          <fieldset className="campaign-role-fieldset">
            <legend>
              {t.roleQuestion}
            </legend>

            <p className="campaign-role-help">
              {t.roleHelp}
            </p>

            <div className="campaign-role-options">
              <label className={`campaign-role-option ${campaignRole === 'gm' ? 'campaign-role-option-active' : ''}`}>
                <input
                  type="radio"
                  name="campaign-role"
                  value="gm"
                  checked={
                    campaignRole ===
                    'gm'
                  }
                  onChange={() => {
                    setCampaignRole(
                      'gm',
                    )
                    setErrorMessage('')
                  }}
                />

                <span>
                  <strong>
                    {t.roleGm}
                  </strong>

                  <small>
                    {t.roleGmDescription}
                  </small>
                </span>
              </label>

              <label className={`campaign-role-option ${campaignRole === 'player' ? 'campaign-role-option-active' : ''}`}>
                <input
                  type="radio"
                  name="campaign-role"
                  value="player"
                  checked={
                    campaignRole ===
                    'player'
                  }
                  onChange={() => {
                    setCampaignRole(
                      'player',
                    )
                    setErrorMessage('')
                  }}
                />

                <span>
                  <strong>
                    {t.rolePlayer}
                  </strong>

                  <small>
                    {t.rolePlayerDescription}
                  </small>
                </span>
              </label>
            </div>

            {campaignRole === 'player' && (
              <p className="campaign-role-help">
                {t.playerImportNotice}
              </p>
            )}
          </fieldset>

          {/* =============================================
              PLANTILLAS
              ============================================= */}

          <section className="import-source-card">
            <div className="import-source-heading">
              <LuFileText />

              <div>
                <p className="import-campaign-eyebrow">
                  {
                    t.templateEyebrow
                  }
                </p>

                <h2>
                  {
                    t.templateTitle
                  }
                </h2>
              </div>
            </div>

            <p className="import-file-help">
              {
                t.templateDescription
              }
            </p>

            <div className="import-campaign-actions">
              <button
                type="button"
                className="import-cancel-button"
                onClick={() =>
                  void handleDownloadWordTemplate()
                }
                disabled={
                  downloadingWord
                }
              >
                <LuFileText />

                <span>
                  {
                    t.wordTemplate
                  }
                </span>
              </button>

              <button
                type="button"
                className="import-submit-button"
                onClick={
                  handleDownloadPdfTemplate
                }
              >
                <LuFileText />

                <span>
                  {
                    t.pdfTemplate
                  }
                </span>
              </button>
            </div>
          </section>

          {/* =============================================
              FUENTE DE IMPORTACIÓN
              ============================================= */}

          <section className="import-source-card">
            <div className="import-source-heading">
              <LuFileText />

              <h2>
                {
                  t.pasteTitle
                }
              </h2>
            </div>

            <textarea
              value={
                sourceText
              }
              placeholder={
                t.pastePlaceholder
              }
              onChange={(
                event,
              ) =>
                setSourceText(
                  event.target
                    .value,
                )
              }
            />

            <div className="import-divider">
              <span>
                {t.or}
              </span>
            </div>

            <label className="import-file-button">
              <LuUpload />

              <span>
                {readingFile
                  ? t.reading
                  : t.upload}
              </span>

              <input
                type="file"
                accept=".txt,.docx,.pdf"
                onChange={
                  handleFileChange
                }
                disabled={
                  readingFile
                }
              />
            </label>

            <p className="import-file-help">
              {fileName ||
                t.accepted}
            </p>
          </section>

          {sourceText.trim() && (
            <section className="import-preview">
              <div className="import-preview-heading">
                <div>
                  <p>
                    {
                      t.preview
                    }
                  </p>

                  <h2>
                    {parsedImport.structured
                      ? t.structuredDetected
                      : t.unclassified}
                  </h2>
                </div>

                <LuFileText />
              </div>

              <p className="import-preview-description">
                {
                  t.previewDescription
                }
              </p>

              {parsedImport.structured ? (
                <div className="import-preview-content">
                  <p>
                    {t.characters}: {' '}
                    {
                      parsedImport.characters.length
                    }
                  </p>

                  <p>
                    {t.sessions}: {' '}
                    {
                      parsedImport.sessions.length
                    }
                  </p>

                  <p>
                    {t.npcs}: {' '}
                    {
                      parsedImport.npcs.length
                    }
                  </p>

                  <p>
                    {t.locations}: {' '}
                    {
                      parsedImport.locations.length
                    }
                  </p>

                  <p>
                    {t.quests}: {' '}
                    {
                      parsedImport.quests.length
                    }
                  </p>

                  <p>
                    {t.items}: {' '}
                    {
                      parsedImport.items.length
                    }
                  </p>

                  <p>
                    {t.notes}: {' '}
                    {
                      parsedImport.notes.length
                    }
                  </p>

                  <p>{t.factions}: {parsedImport.factions.length}</p>
                  <p>{t.relationships}: {parsedImport.relationships.length}</p>
                  <p>{t.timeline}: {parsedImport.timeline.length}</p>
                </div>
              ) : (
                <div className="import-preview-content">
                  {sourceText.slice(
                    0,
                    3000,
                  )}

                  {sourceText.length >
                    3000 &&
                    '…'}
                </div>
              )}
            </section>
          )}

          {errorMessage && (
            <div
              className="import-campaign-error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="import-campaign-actions">
            <button
              type="button"
              className="import-cancel-button"
              onClick={
                onBack
              }
              disabled={
                importing
              }
            >
              {t.back}
            </button>

            <button
              type="submit"
              className="import-submit-button"
              disabled={
                importing ||
                readingFile
              }
            >
              <LuUpload />

              <span>
                {importing
                  ? t.importing
                  : t.import}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default ImportCampaignPage
