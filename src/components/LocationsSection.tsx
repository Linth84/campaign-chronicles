import {
  useEffect,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuFilePenLine,
  LuMap,
  LuPlus,
  LuSave,
  LuTrash2,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

type Language =
  | 'en'
  | 'es'

interface LocationsSectionProps {
  language: Language
  campaignId: string
}

interface CampaignLocation {
  id: string
  campaign_id: string
  name: string
  location_type: string | null
  description: string | null
  notes: string | null
  created_at: string
}

interface LocationForm {
  name: string
  locationType: string
  description: string
  notes: string
}

const emptyForm: LocationForm = {
  name: '',
  locationType: '',
  description: '',
  notes: '',
}

const translations = {
  en: {
    eyebrow: 'World Atlas',
    title: 'Locations',
    description:
      'Record cities, ruins, regions and every place worth remembering.',
    newEntry: 'New Location',
    createEntry: 'Create Location',
    editEntry: 'Edit Location',
    saveEntry: 'Save Location',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading locations...',
    emptyTitle: 'No locations recorded yet.',
    emptyText:
      'Add the first place your party has visited.',
    name: 'Name',
    type: 'Type',
    descriptionLabel: 'Description',
    notes: 'Notes',
    nameRequired:
      'Give the location a name before saving.',
    loadError:
      'We could not load the locations.',
    saveError:
      'We could not save this location.',
    deleteError:
      'We could not delete this location.',
    deleteConfirm:
      'Delete this location? This action cannot be undone.',
    created: 'Location created.',
    updated: 'Location updated.',
    noDescription:
      'No description has been written for this location yet.',
  },

  es: {
    eyebrow: 'Atlas del mundo',
    title: 'Lugares',
    description:
      'Registrá ciudades, ruinas, regiones y cada lugar que valga la pena recordar.',
    newEntry: 'Nuevo lugar',
    createEntry: 'Crear lugar',
    editEntry: 'Editar lugar',
    saveEntry: 'Guardar lugar',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando lugares...',
    emptyTitle: 'Todavía no hay lugares registrados.',
    emptyText:
      'Agregá el primer lugar que visitó el grupo.',
    name: 'Nombre',
    type: 'Tipo',
    descriptionLabel: 'Descripción',
    notes: 'Notas',
    nameRequired:
      'Escribí un nombre para el lugar antes de guardarlo.',
    loadError:
      'No pudimos cargar los lugares.',
    saveError:
      'No pudimos guardar este lugar.',
    deleteError:
      'No pudimos eliminar este lugar.',
    deleteConfirm:
      '¿Eliminar este lugar? Esta acción no se puede deshacer.',
    created: 'Lugar creado.',
    updated: 'Lugar actualizado.',
    noDescription:
      'Todavía no hay una descripción para este lugar.',
  },
}

function LocationsSection({
  language,
  campaignId,
}: LocationsSectionProps) {
  const t =
    translations[language]

  const [
    entries,
    setEntries,
  ] =
    useState<CampaignLocation[]>(
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
    useState<LocationForm>({
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
              .from(
                'locations',
              )
              .select(
                `
                  id,
                  campaign_id,
                  name,
                  location_type,
                  description,
                  notes,
                  created_at
                `,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .order(
                'name',
                {
                  ascending: true,
                },
              )

          if (error) {
            throw error
          }

          setEntries(
            (data ??
              []) as CampaignLocation[],
          )
        } catch (error) {
          console.error(
            'Error al cargar lugares:',
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
        CampaignLocation,
    ) => {
      setEditingId(
        entry.id,
      )

      setForm({
        name:
          entry.name,
        locationType:
          entry.location_type ??
          '',
        description:
          entry.description ??
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
        !form.name.trim()
      ) {
        setErrorMessage(
          t.nameRequired,
        )

        return
      }

      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      const entryData = {
        campaign_id:
          campaignId,
        name:
          form.name.trim(),
        location_type:
          form.locationType.trim() ||
          null,
        description:
          form.description.trim() ||
          null,
        notes:
          form.notes.trim() ||
          null,
      }

      try {
        const query =
          editingId
            ? supabase
                .from(
                  'locations',
                )
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
                .from(
                  'locations',
                )
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
          data as CampaignLocation

        setEntries(
          (
            current,
          ) =>
            editingId
              ? current
                  .map(
                    (
                      entry,
                    ) =>
                      entry.id ===
                      editingId
                        ? saved
                        : entry,
                  )
                  .sort(
                    sortByName,
                  )
              : [
                  ...current,
                  saved,
                ].sort(
                  sortByName,
                ),
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
          'Error al guardar lugar:',
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
            .from(
              'locations',
            )
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
          'Error al eliminar lugar:',
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
                {form.name.trim() ||
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
                {t.name}
              </span>

              <input
                type="text"
                value={
                  form.name
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      name:
                        event.target.value,
                    }),
                  )
                }
                required
              />
            </label>

            <label>
              <span>
                {t.type}
              </span>

              <input
                type="text"
                value={
                  form.locationType
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      locationType:
                        event.target.value,
                    }),
                  )
                }
              />
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
          <LuMap />

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
                    {entry.location_type && (
                      <span className="session-card-number">
                        {entry.location_type}
                      </span>
                    )}
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
                  {entry.name}
                </h3>

                <p>
                  {entry.description ||
                    t.noDescription}
                </p>

                {entry.notes && (
                  <div className="session-card-notes">
                    <LuMap />
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

function sortByName(
  first:
    CampaignLocation,
  second:
    CampaignLocation,
) {
  return first.name.localeCompare(
    second.name,
  )
}

export default LocationsSection
