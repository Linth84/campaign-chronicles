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
  parseCampaignImportTemplate,
  readCampaignFile,
} from '../utils/campaignFiles'

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
  },

  es: {
    back:
      'Volver a campañas',

    eyebrow:
      'Traé tu historia',

    title:
      'Importar campaña',

    intro:
      'Pegá las notas de tu campaña o subí un documento TXT, Word o PDF.',

    campaignName:
      'Nombre de la campaña',

    campaignPlaceholder:
      'Mi campaña',

    system:
      'Sistema de juego',

    systemPlaceholder:
      'D&D 5e, Pathfinder, Call of Cthulhu...',

    templateEyebrow:
      'Empezá con una plantilla',

    templateTitle:
      'Usá nuestra plantilla de campaña',

    templateDescription:
      'Descargá una plantilla estructurada si empezás desde cero. La versión Word es editable; la versión PDF sirve como guía imprimible o de referencia.',

    wordTemplate:
      'Descargar plantilla Word',

    pdfTemplate:
      'Descargar plantilla PDF',

    pasteTitle:
      'Pegar notas',

    pastePlaceholder:
      'Pegá acá las notas de tu campaña...',

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

    nothing:
      'Primero pegá texto o elegí un documento.',

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
    parseCampaignImportTemplate(
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
          parseCampaignImportTemplate(
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
        !campaignName.trim() ||
        !sourceText.trim()
      ) {
        setErrorMessage(
          t.nothing,
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
          parseCampaignImportTemplate(
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
                      ...(npc.status
                        ? {
                            status:
                              npc.status,
                          }
                        : {}),
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
