import {
  useEffect,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuFilePenLine,
  LuPlus,
  LuSave,
  LuScrollText,
  LuSwords,
  LuTrash2,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

type Language =
  | 'en'
  | 'es'

type QuestStatus =
  | 'active'
  | 'completed'
  | 'failed'
  | 'on_hold'
  | 'abandoned'

interface QuestsSectionProps {
  language: Language
  campaignId: string
}

interface CampaignQuest {
  id: string
  campaign_id: string
  title: string
  status: QuestStatus
  description: string | null
  reward: string | null
  notes: string | null
  created_at: string
}

interface QuestForm {
  title: string
  status: QuestStatus
  description: string
  reward: string
  notes: string
}

const emptyForm: QuestForm = {
  title: '',
  status: 'active',
  description: '',
  reward: '',
  notes: '',
}

const translations = {
  en: {
    eyebrow: 'Adventure Threads',
    title: 'Quests',
    description:
      'Track objectives, unresolved threads and completed adventures.',
    newEntry: 'New Quest',
    createEntry: 'Create Quest',
    editEntry: 'Edit Quest',
    saveEntry: 'Save Quest',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading quests...',
    emptyTitle: 'No quests recorded yet.',
    emptyText:
      'Add the first objective or adventure thread.',
    questTitle: 'Title',
    status: 'Status',
    descriptionLabel: 'Description',
    reward: 'Reward',
    notes: 'Notes',
    titleRequired:
      'Give the quest a title before saving.',
    loadError:
      'We could not load the quests.',
    saveError:
      'We could not save this quest.',
    deleteError:
      'We could not delete this quest.',
    deleteConfirm:
      'Delete this quest? This action cannot be undone.',
    created: 'Quest created.',
    updated: 'Quest updated.',
    noDescription:
      'No description has been written for this quest yet.',
    active: 'Active',
    completed: 'Completed',
    failed: 'Failed',
    on_hold: 'On hold',
    abandoned: 'Abandoned',
  },

  es: {
    eyebrow: 'Hilos de aventura',
    title: 'Misiones',
    description:
      'Seguí objetivos, asuntos pendientes y aventuras completadas.',
    newEntry: 'Nueva misión',
    createEntry: 'Crear misión',
    editEntry: 'Editar misión',
    saveEntry: 'Guardar misión',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando misiones...',
    emptyTitle: 'Todavía no hay misiones registradas.',
    emptyText:
      'Agregá el primer objetivo o hilo de aventura.',
    questTitle: 'Título',
    status: 'Estado',
    descriptionLabel: 'Descripción',
    reward: 'Recompensa',
    notes: 'Notas',
    titleRequired:
      'Escribí un título para la misión antes de guardarla.',
    loadError:
      'No pudimos cargar las misiones.',
    saveError:
      'No pudimos guardar esta misión.',
    deleteError:
      'No pudimos eliminar esta misión.',
    deleteConfirm:
      '¿Eliminar esta misión? Esta acción no se puede deshacer.',
    created: 'Misión creada.',
    updated: 'Misión actualizada.',
    noDescription:
      'Todavía no hay una descripción para esta misión.',
    active: 'Activa',
    completed: 'Completada',
    failed: 'Fallida',
    on_hold: 'En espera',
    abandoned: 'Abandonada',
  },
}

function QuestsSection({
  language,
  campaignId,
}: QuestsSectionProps) {
  const t =
    translations[language]

  const [
    entries,
    setEntries,
  ] =
    useState<CampaignQuest[]>(
      [],
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    editorOpen,
    setEditorOpen,
  ] =
    useState(false)

  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    form,
    setForm,
  ] =
    useState<QuestForm>({
      ...emptyForm,
    })

  const [
    saving,
    setSaving,
  ] =
    useState(false)

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

  useEffect(() => {
    const loadEntries =
      async () => {
        setLoading(true)
        setErrorMessage('')

        try {
          const {
            data,
            error,
          } =
            await supabase
              .from('quests')
              .select(
                `
                  id,
                  campaign_id,
                  title,
                  status,
                  description,
                  reward,
                  notes,
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

          if (error) {
            throw error
          }

          setEntries(
            (data ??
              []) as CampaignQuest[],
          )
        } catch (error) {
          console.error(
            'Error al cargar misiones:',
            error,
          )

          setErrorMessage(
            t.loadError,
          )
        } finally {
          setLoading(false)
        }
      }

    void loadEntries()
  }, [
    campaignId,
    t.loadError,
  ])

  const openNew =
    () => {
      setEditingId(null)
      setForm({
        ...emptyForm,
      })
      setErrorMessage('')
      setSuccessMessage('')
      setEditorOpen(true)
    }

  const openEdit =
    (
      entry:
        CampaignQuest,
    ) => {
      setEditingId(
        entry.id,
      )

      setForm({
        title:
          entry.title,
        status:
          entry.status,
        description:
          entry.description ??
          '',
        reward:
          entry.reward ??
          '',
        notes:
          entry.notes ??
          '',
      })

      setErrorMessage('')
      setSuccessMessage('')
      setEditorOpen(true)
    }

  const closeEditor =
    () => {
      setEditorOpen(false)
      setEditingId(null)
      setForm({
        ...emptyForm,
      })
      setErrorMessage('')
    }

  const handleSave =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      if (
        !form.title.trim()
      ) {
        setErrorMessage(
          t.titleRequired,
        )

        return
      }

      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      const entryData = {
        campaign_id:
          campaignId,
        title:
          form.title.trim(),
        status:
          form.status,
        description:
          form.description.trim() ||
          null,
        reward:
          form.reward.trim() ||
          null,
        notes:
          form.notes.trim() ||
          null,
      }

      try {
        const query =
          editingId
            ? supabase
                .from('quests')
                .update(
                  entryData,
                )
                .eq(
                  'id',
                  editingId,
                )
                .eq(
                  'campaign_id',
                  campaignId,
                )
            : supabase
                .from('quests')
                .insert(
                  entryData,
                )

        const {
          data,
          error,
        } =
          await query
            .select()
            .single()

        if (error) {
          throw error
        }

        const saved =
          data as CampaignQuest

        setEntries(
          (
            current,
          ) =>
            editingId
              ? current.map(
                  (
                    entry,
                  ) =>
                    entry.id ===
                    editingId
                      ? saved
                      : entry,
                )
              : [
                  saved,
                  ...current,
                ],
        )

        setSuccessMessage(
          editingId
            ? t.updated
            : t.created,
        )

        setEditorOpen(false)
        setEditingId(null)
        setForm({
          ...emptyForm,
        })
      } catch (error) {
        console.error(
          'Error al guardar misión:',
          error,
        )

        setErrorMessage(
          t.saveError,
        )
      } finally {
        setSaving(false)
      }
    }

  const handleDelete =
    async (
      entryId:
        string,
    ) => {
      if (
        !window.confirm(
          t.deleteConfirm,
        )
      ) {
        return
      }

      try {
        const {
          error,
        } =
          await supabase
            .from('quests')
            .delete()
            .eq(
              'id',
              entryId,
            )
            .eq(
              'campaign_id',
              campaignId,
            )

        if (error) {
          throw error
        }

        setEntries(
          (
            current,
          ) =>
            current.filter(
              (
                entry,
              ) =>
                entry.id !==
                entryId,
            ),
        )
      } catch (error) {
        console.error(
          'Error al eliminar misión:',
          error,
        )

        setErrorMessage(
          t.deleteError,
        )
      }
    }

  return (
    <section className="campaign-sessions">
      <div className="campaign-sessions-header">
        <div>
          <p className="campaign-sessions-eyebrow">
            {t.eyebrow}
          </p>

          <h2>
            {t.title}
          </h2>

          <p className="campaign-sessions-description">
            {t.description}
          </p>
        </div>

        {!editorOpen &&
          entries.length >
            0 && (
          <button
            type="button"
            className="session-new-button"
            onClick={
              openNew
            }
          >
            <LuPlus />
            <span>
              {t.newEntry}
            </span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div
          className="session-message session-message-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="session-message session-message-success">
          {successMessage}
        </div>
      )}

      {editorOpen && (
        <form
          className="session-editor"
          onSubmit={
            handleSave
          }
        >
          <div className="session-editor-heading">
            <div>
              <p>
                {editingId
                  ? t.editEntry
                  : t.createEntry}
              </p>

              <h3>
                {form.title.trim() ||
                  t.newEntry}
              </h3>
            </div>

            <button
              type="button"
              className="session-editor-close"
              onClick={
                closeEditor
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
                {t.questTitle}
              </span>

              <input
                type="text"
                value={
                  form.title
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      title:
                        event.target.value,
                    }),
                  )
                }
                required
              />
            </label>

            <label>
              <span>
                {t.status}
              </span>

              <select
                value={
                  form.status
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      status:
                        event.target.value as QuestStatus,
                    }),
                  )
                }
              >
                {(
                  [
                    'active',
                    'completed',
                    'failed',
                    'on_hold',
                    'abandoned',
                  ] as QuestStatus[]
                ).map(
                  (
                    value,
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        t[value]
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="session-editor-full">
              <span>
                {t.descriptionLabel}
              </span>

              <textarea
                value={
                  form.description
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      description:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label className="session-editor-full">
              <span>
                {t.reward}
              </span>

              <input
                type="text"
                value={
                  form.reward
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      reward:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label className="session-editor-full">
              <span>
                {t.notes}
              </span>

              <textarea
                value={
                  form.notes
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      notes:
                        event.target.value,
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
                closeEditor
              }
              disabled={
                saving
              }
            >
              <LuX />
              <span>
                {t.cancel}
              </span>
            </button>

            <button
              type="submit"
              className="session-save-button"
              disabled={
                saving
              }
            >
              <LuSave />
              <span>
                {saving
                  ? t.saving
                  : t.saveEntry}
              </span>
            </button>
          </div>
        </form>
      )}

      {!editorOpen &&
        loading && (
        <div className="sessions-loading">
          <div className="app-loading-symbol" />
          <span>
            {t.loading}
          </span>
        </div>
      )}

      {!editorOpen &&
        !loading &&
        entries.length ===
          0 && (
        <div className="sessions-empty">
          <LuSwords />

          <h3>
            {t.emptyTitle}
          </h3>

          <p>
            {t.emptyText}
          </p>

          <button
            type="button"
            onClick={
              openNew
            }
          >
            <LuPlus />
            <span>
              {t.newEntry}
            </span>
          </button>
        </div>
      )}

      {!editorOpen &&
        !loading &&
        entries.length >
          0 && (
        <div className="sessions-list">
          {entries.map(
            (
              entry,
            ) => (
              <article
                className="session-card"
                key={
                  entry.id
                }
              >
                <div className="session-card-top">
                  <div className="session-card-meta">
                    <span className="session-card-number">
                      {
                        t[
                          entry.status
                        ]
                      }
                    </span>
                  </div>

                  <div className="session-card-actions">
                    <button
                      type="button"
                      onClick={() =>
                        openEdit(
                          entry,
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
                        void handleDelete(
                          entry.id,
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
                  {entry.title}
                </h3>

                <p>
                  {entry.description ||
                    t.noDescription}
                </p>

                {entry.reward && (
                  <div className="session-card-notes">
                    <LuScrollText />
                    <span>
                      {t.reward}:{' '}
                      {entry.reward}
                    </span>
                  </div>
                )}

                {entry.notes && (
                  <div className="session-card-notes">
                    <LuSwords />
                    <span>
                      {entry.notes}
                    </span>
                  </div>
                )}
              </article>
            ),
          )}
        </div>
      )}
    </section>
  )
}

export default QuestsSection
