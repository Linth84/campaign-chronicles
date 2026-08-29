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
  LuTrash2,
  LuUsers,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

type Language =
  | 'en'
  | 'es'

type NpcStatus =
  | 'unknown'
  | 'alive'
  | 'dead'
  | 'missing'
  | 'hostile'
  | 'friendly'

interface NpcsSectionProps {
  language: Language
  campaignId: string
}

interface CampaignNpc {
  id: string
  campaign_id: string
  name: string
  role: string | null
  faction: string | null
  status: NpcStatus
  description: string | null
  notes: string | null
  created_at: string
}

interface NpcForm {
  name: string
  role: string
  faction: string
  status: NpcStatus
  description: string
  notes: string
}

const emptyNpcForm: NpcForm = {
  name: '',
  role: '',
  faction: '',
  status: 'unknown',
  description: '',
  notes: '',
}

const translations = {
  en: {
    eyebrow: 'People of the World',
    title: 'NPCs',
    description:
      'Keep track of allies, enemies, contacts and recurring faces.',
    newNpc: 'New NPC',
    createNpc: 'Create NPC',
    editNpc: 'Edit NPC',
    saveNpc: 'Save NPC',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading NPCs...',
    noEntriesTitle: 'No NPCs recorded yet.',
    noEntriesText:
      'Add the first NPC your party meets.',
    name: 'Name',
    role: 'Role',
    faction: 'Faction',
    status: 'Status',
    descriptionLabel: 'Description',
    notes: 'Notes',
    nameRequired:
      'Give the NPC a name before saving.',
    loadError:
      'We could not load the NPCs.',
    saveError:
      'We could not save this NPC.',
    deleteError:
      'We could not delete this NPC.',
    deleteConfirm:
      'Delete this NPC? This action cannot be undone.',
    created: 'NPC created.',
    updated: 'NPC updated.',
    noDescription:
      'No description has been written for this NPC yet.',
    unknown: 'Unknown',
    alive: 'Alive',
    dead: 'Dead',
    missing: 'Missing',
    hostile: 'Hostile',
    friendly: 'Friendly',
  },

  es: {
    eyebrow: 'Personas del mundo',
    title: 'NPCs',
    description:
      'Registrá aliados, enemigos, contactos y personajes recurrentes.',
    newNpc: 'Nuevo NPC',
    createNpc: 'Crear NPC',
    editNpc: 'Editar NPC',
    saveNpc: 'Guardar NPC',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando NPCs...',
    noEntriesTitle: 'Todavía no hay NPCs registrados.',
    noEntriesText:
      'Agregá el primer NPC que encuentre el grupo.',
    name: 'Nombre',
    role: 'Rol',
    faction: 'Facción',
    status: 'Estado',
    descriptionLabel: 'Descripción',
    notes: 'Notas',
    nameRequired:
      'Escribí un nombre para el NPC antes de guardarlo.',
    loadError:
      'No pudimos cargar los NPCs.',
    saveError:
      'No pudimos guardar este NPC.',
    deleteError:
      'No pudimos eliminar este NPC.',
    deleteConfirm:
      '¿Eliminar este NPC? Esta acción no se puede deshacer.',
    created: 'NPC creado.',
    updated: 'NPC actualizado.',
    noDescription:
      'Todavía no hay una descripción para este NPC.',
    unknown: 'Desconocido',
    alive: 'Vivo',
    dead: 'Muerto',
    missing: 'Desaparecido',
    hostile: 'Hostil',
    friendly: 'Amistoso',
  },
}

function NpcsSection({
  language,
  campaignId,
}: NpcsSectionProps) {
  const t =
    translations[language]

  const [
    npcs,
    setNpcs,
  ] =
    useState<CampaignNpc[]>(
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
    useState<NpcForm>({
      ...emptyNpcForm,
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
    const loadNpcs =
      async () => {
        setLoading(true)
        setErrorMessage('')

        try {
          const {
            data,
            error,
          } =
            await supabase
              .from('npcs')
              .select(
                `
                  id,
                  campaign_id,
                  name,
                  role,
                  faction,
                  status,
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

          setNpcs(
            (data ??
              []) as CampaignNpc[],
          )
        } catch (error) {
          console.error(
            'Error al cargar NPCs:',
            error,
          )

          setErrorMessage(
            t.loadError,
          )
        } finally {
          setLoading(false)
        }
      }

    void loadNpcs()
  }, [
    campaignId,
    t.loadError,
  ])

  const openNew =
    () => {
      setEditingId(null)
      setForm({
        ...emptyNpcForm,
      })
      setErrorMessage('')
      setSuccessMessage('')
      setEditorOpen(true)
    }

  const openEdit =
    (
      npc:
        CampaignNpc,
    ) => {
      setEditingId(
        npc.id,
      )

      setForm({
        name:
          npc.name,
        role:
          npc.role ??
          '',
        faction:
          npc.faction ??
          '',
        status:
          npc.status,
        description:
          npc.description ??
          '',
        notes:
          npc.notes ??
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
        ...emptyNpcForm,
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

      const npcData = {
        campaign_id:
          campaignId,
        name:
          form.name.trim(),
        role:
          form.role.trim() ||
          null,
        faction:
          form.faction.trim() ||
          null,
        status:
          form.status,
        description:
          form.description.trim() ||
          null,
        notes:
          form.notes.trim() ||
          null,
      }

      try {
        if (editingId) {
          const {
            data,
            error,
          } =
            await supabase
              .from('npcs')
              .update(
                npcData,
              )
              .eq(
                'id',
                editingId,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .select()
              .single()

          if (error) {
            throw error
          }

          setNpcs(
            (
              current,
            ) =>
              current
                .map(
                  (
                    npc,
                  ) =>
                    npc.id ===
                    editingId
                      ? (data as CampaignNpc)
                      : npc,
                )
                .sort(
                  sortByName,
                ),
          )

          setSuccessMessage(
            t.updated,
          )
        } else {
          const {
            data,
            error,
          } =
            await supabase
              .from('npcs')
              .insert(
                npcData,
              )
              .select()
              .single()

          if (error) {
            throw error
          }

          setNpcs(
            (
              current,
            ) =>
              [
                ...current,
                data as CampaignNpc,
              ].sort(
                sortByName,
              ),
          )

          setSuccessMessage(
            t.created,
          )
        }

        setEditorOpen(false)
        setEditingId(null)
        setForm({
          ...emptyNpcForm,
        })
      } catch (error) {
        console.error(
          'Error al guardar NPC:',
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
      npcId:
        string,
    ) => {
      if (
        !window.confirm(
          t.deleteConfirm,
        )
      ) {
        return
      }

      setErrorMessage('')
      setSuccessMessage('')

      try {
        const {
          error,
        } =
          await supabase
            .from('npcs')
            .delete()
            .eq(
              'id',
              npcId,
            )
            .eq(
              'campaign_id',
              campaignId,
            )

        if (error) {
          throw error
        }

        setNpcs(
          (
            current,
          ) =>
            current.filter(
              (
                npc,
              ) =>
                npc.id !==
                npcId,
            ),
        )
      } catch (error) {
        console.error(
          'Error al eliminar NPC:',
          error,
        )

        setErrorMessage(
          t.deleteError,
        )
      }
    }

  return (
    <section className="campaign-sessions">
      <SectionHeader
        eyebrow={
          t.eyebrow
        }
        title={
          t.title
        }
        description={
          t.description
        }
        buttonLabel={
          t.newNpc
        }
        showButton={
          !editorOpen &&
          npcs.length >
            0
        }
        onNew={
          openNew
        }
      />

      {errorMessage && (
        <Message
          error
          text={
            errorMessage
          }
        />
      )}

      {successMessage && (
        <Message
          text={
            successMessage
          }
        />
      )}

      {editorOpen && (
        <form
          className="session-editor"
          onSubmit={
            handleSave
          }
        >
          <EditorHeader
            title={
              editingId
                ? t.editNpc
                : t.createNpc
            }
            heading={
              form.name.trim() ||
              t.newNpc
            }
            cancelLabel={
              t.cancel
            }
            onClose={
              closeEditor
            }
          />

          <div className="session-editor-grid">
            <TextField
              label={
                t.name
              }
              value={
                form.name
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    name:
                      value,
                  }),
                )
              }
              required
            />

            <TextField
              label={
                t.role
              }
              value={
                form.role
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    role:
                      value,
                  }),
                )
              }
            />

            <TextField
              label={
                t.faction
              }
              value={
                form.faction
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    faction:
                      value,
                  }),
                )
              }
            />

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
                        event.target.value as NpcStatus,
                    }),
                  )
                }
              >
                {(
                  [
                    'unknown',
                    'alive',
                    'dead',
                    'missing',
                    'hostile',
                    'friendly',
                  ] as NpcStatus[]
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

            <AreaField
              label={
                t.descriptionLabel
              }
              value={
                form.description
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    description:
                      value,
                  }),
                )
              }
            />

            <AreaField
              label={
                t.notes
              }
              value={
                form.notes
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    notes:
                      value,
                  }),
                )
              }
            />
          </div>

          <EditorActions
            cancelLabel={
              t.cancel
            }
            saveLabel={
              saving
                ? t.saving
                : t.saveNpc
            }
            saving={
              saving
            }
            onCancel={
              closeEditor
            }
          />
        </form>
      )}

      {!editorOpen &&
        loading && (
        <Loading
          text={
            t.loading
          }
        />
      )}

      {!editorOpen &&
        !loading &&
        npcs.length ===
          0 && (
        <EmptyState
          title={
            t.noEntriesTitle
          }
          text={
            t.noEntriesText
          }
          buttonLabel={
            t.newNpc
          }
          onNew={
            openNew
          }
        />
      )}

      {!editorOpen &&
        !loading &&
        npcs.length >
          0 && (
        <div className="sessions-list">
          {npcs.map(
            (
              npc,
            ) => (
              <article
                className="session-card"
                key={
                  npc.id
                }
              >
                <CardActions
                  onEdit={() =>
                    openEdit(
                      npc,
                    )
                  }
                  onDelete={() =>
                    void handleDelete(
                      npc.id,
                    )
                  }
                  editLabel={
                    t.edit
                  }
                  deleteLabel={
                    t.delete
                  }
                />

                <h3>
                  {npc.name}
                </h3>

                <p>
                  {[
                    npc.role,
                    npc.faction,
                    t[npc.status],
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                <p>
                  {npc.description ||
                    t.noDescription}
                </p>

                {npc.notes && (
                  <div className="session-card-notes">
                    <LuUsers />

                    <span>
                      {npc.notes}
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

function SectionHeader({
  eyebrow,
  title,
  description,
  buttonLabel,
  showButton,
  onNew,
}: {
  eyebrow: string
  title: string
  description: string
  buttonLabel: string
  showButton: boolean
  onNew: () => void
}) {
  return (
    <div className="campaign-sessions-header">
      <div>
        <p className="campaign-sessions-eyebrow">
          {eyebrow}
        </p>

        <h2>
          {title}
        </h2>

        <p className="campaign-sessions-description">
          {description}
        </p>
      </div>

      {showButton && (
        <button
          type="button"
          className="session-new-button"
          onClick={
            onNew
          }
        >
          <LuPlus />
          <span>
            {buttonLabel}
          </span>
        </button>
      )}
    </div>
  )
}

function EditorHeader({
  title,
  heading,
  cancelLabel,
  onClose,
}: {
  title: string
  heading: string
  cancelLabel: string
  onClose: () => void
}) {
  return (
    <div className="session-editor-heading">
      <div>
        <p>
          {title}
        </p>

        <h3>
          {heading}
        </h3>
      </div>

      <button
        type="button"
        className="session-editor-close"
        onClick={
          onClose
        }
        aria-label={
          cancelLabel
        }
      >
        <LuX />
      </button>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string
  value: string
  onChange: (
    value: string,
  ) => void
  required?: boolean
}) {
  return (
    <label>
      <span>
        {label}
      </span>

      <input
        type="text"
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        required={
          required
        }
      />
    </label>
  )
}

function AreaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (
    value: string,
  ) => void
}) {
  return (
    <label className="session-editor-full">
      <span>
        {label}
      </span>

      <textarea
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
      />
    </label>
  )
}

function EditorActions({
  cancelLabel,
  saveLabel,
  saving,
  onCancel,
}: {
  cancelLabel: string
  saveLabel: string
  saving: boolean
  onCancel: () => void
}) {
  return (
    <div className="session-editor-actions">
      <button
        type="button"
        className="session-cancel-button"
        onClick={
          onCancel
        }
        disabled={
          saving
        }
      >
        <LuX />
        <span>
          {cancelLabel}
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
          {saveLabel}
        </span>
      </button>
    </div>
  )
}

function Loading({
  text,
}: {
  text: string
}) {
  return (
    <div className="sessions-loading">
      <div className="app-loading-symbol" />
      <span>
        {text}
      </span>
    </div>
  )
}

function EmptyState({
  title,
  text,
  buttonLabel,
  onNew,
}: {
  title: string
  text: string
  buttonLabel: string
  onNew: () => void
}) {
  return (
    <div className="sessions-empty">
      <LuUsers />

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

      <button
        type="button"
        onClick={
          onNew
        }
      >
        <LuPlus />
        <span>
          {buttonLabel}
        </span>
      </button>
    </div>
  )
}

function CardActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: {
  onEdit: () => void
  onDelete: () => void
  editLabel: string
  deleteLabel: string
}) {
  return (
    <div className="session-card-top">
      <div />

      <div className="session-card-actions">
        <button
          type="button"
          onClick={
            onEdit
          }
          title={
            editLabel
          }
          aria-label={
            editLabel
          }
        >
          <LuFilePenLine />
        </button>

        <button
          type="button"
          className="session-delete-button"
          onClick={
            onDelete
          }
          title={
            deleteLabel
          }
          aria-label={
            deleteLabel
          }
        >
          <LuTrash2 />
        </button>
      </div>
    </div>
  )
}

function Message({
  text,
  error = false,
}: {
  text: string
  error?: boolean
}) {
  return (
    <div
      className={
        error
          ? 'session-message session-message-error'
          : 'session-message session-message-success'
      }
      role={
        error
          ? 'alert'
          : undefined
      }
    >
      {text}
    </div>
  )
}

function sortByName(
  first:
    CampaignNpc,
  second:
    CampaignNpc,
) {
  return first.name.localeCompare(
    second.name,
  )
}

export default NpcsSection
