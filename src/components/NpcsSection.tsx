import { useConfirm } from './ConfirmProvider'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuFilePenLine,
  LuMapPin,
  LuPlus,
  LuSave,
  LuSearch,
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

type NpcRelationship =
  | 'ally'
  | 'neutral'
  | 'enemy'

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
  location: string | null
  relationship: NpcRelationship | null
  status: NpcStatus
  description: string | null
  notes: string | null
  created_at: string
}

interface NpcForm {
  name: string
  role: string
  faction: string
  location: string
  relationship: NpcRelationship
  status: NpcStatus
  description: string
  notes: string
}

const emptyNpcForm: NpcForm = {
  name: '',
  role: '',
  faction: '',
  location: '',
  relationship: 'neutral',
  status: 'unknown',
  description: '',
  notes: '',
}

const translations = {
  en: {
    eyebrow: 'People of the World',
    title: 'NPCs',
    description:
      'Organize allies, enemies, contacts and recurring faces by location.',
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
    noMatchesTitle:
      'No NPCs match these filters.',
    name: 'Name',
    role: 'Role',
    faction: 'Faction',
    location: 'Location',
    relationship: 'Relationship',
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
    ally: 'Ally',
    neutral: 'Neutral',
    enemy: 'Enemy',
    filters: 'Search and filters',
    search: 'Search NPCs...',
    allLocations: 'All locations',
    allRelationships: 'All relationships',
    allFactions: 'All factions',
    allStatuses: 'All statuses',
    noLocation: 'Unassigned location',
  },

  es: {
    eyebrow: 'Personas del mundo',
    title: 'NPCs',
    description:
      'Organiza aliados, enemigos, contactos y personajes recurrentes por ubicación.',
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
      'Agrega el primer NPC que encuentre el grupo.',
    noMatchesTitle:
      'No hay NPCs que coincidan con estos filtros.',
    name: 'Nombre',
    role: 'Rol',
    faction: 'Facción',
    location: 'Ubicación',
    relationship: 'Relación',
    status: 'Estado',
    descriptionLabel: 'Descripción',
    notes: 'Notas',
    nameRequired:
      'Escribe un nombre para el NPC antes de guardarlo.',
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
    ally: 'Aliado',
    neutral: 'Neutral',
    enemy: 'Enemigo',
    filters: 'Búsqueda y filtros',
    search: 'Buscar NPCs...',
    allLocations: 'Todas las ubicaciones',
    allRelationships: 'Todas las relaciones',
    allFactions: 'Todas las facciones',
    allStatuses: 'Todos los estados',
    noLocation: 'Sin ubicación',
  },
}

function NpcsSection({
  language,
  campaignId,
}: NpcsSectionProps) {
  const confirmAction = useConfirm()
  const t = translations[language]

  const [npcs, setNpcs] =
    useState<CampaignNpc[]>([])

  const [loading, setLoading] =
    useState(true)

  const [editorOpen, setEditorOpen] =
    useState(false)

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [form, setForm] =
    useState<NpcForm>({
      ...emptyNpcForm,
    })

  const [saving, setSaving] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

  const [
    locationFilter,
    setLocationFilter,
  ] = useState('')

  const [
    relationshipFilter,
    setRelationshipFilter,
  ] = useState('')

  const [
    factionFilter,
    setFactionFilter,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('')

  useEffect(() => {
    const loadNpcs = async () => {
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
                location,
                relationship,
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

  const locations =
    useMemo(
      () =>
        Array.from(
          new Set(
            npcs
              .map(
                (npc) =>
                  npc.location?.trim(),
              )
              .filter(
                (
                  value,
                ): value is string =>
                  Boolean(value),
              ),
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        npcs,
      ],
    )

  const factions =
    useMemo(
      () =>
        Array.from(
          new Set(
            npcs
              .map(
                (npc) =>
                  npc.faction?.trim(),
              )
              .filter(
                (
                  value,
                ): value is string =>
                  Boolean(value),
              ),
          ),
        ).sort(
          (
            first,
            second,
          ) =>
            first.localeCompare(
              second,
            ),
        ),
      [
        npcs,
      ],
    )

  const filteredNpcs =
    useMemo(
      () => {
        const normalizedSearch =
          searchQuery
            .trim()
            .toLocaleLowerCase()

        return npcs.filter(
          (npc) => {
            const matchesSearch =
              !normalizedSearch ||
              [
                npc.name,
                npc.role,
                npc.faction,
                npc.location,
                npc.description,
                npc.notes,
              ]
                .filter(Boolean)
                .some(
                  (value) =>
                    String(value)
                      .toLocaleLowerCase()
                      .includes(
                        normalizedSearch,
                      ),
                )

            const matchesLocation =
              !locationFilter ||
              (npc.location ??
                '') ===
                locationFilter

            const matchesRelationship =
              !relationshipFilter ||
              (npc.relationship ??
                'neutral') ===
                relationshipFilter

            const matchesFaction =
              !factionFilter ||
              (npc.faction ??
                '') ===
                factionFilter

            const matchesStatus =
              !statusFilter ||
              npc.status ===
                statusFilter

            return (
              matchesSearch &&
              matchesLocation &&
              matchesRelationship &&
              matchesFaction &&
              matchesStatus
            )
          },
        )
      },
      [
        npcs,
        searchQuery,
        locationFilter,
        relationshipFilter,
        factionFilter,
        statusFilter,
      ],
    )

  const groupedNpcs =
    useMemo(
      () => {
        const groups =
          new Map<
            string,
            Map<
              NpcRelationship,
              CampaignNpc[]
            >
          >()

        filteredNpcs.forEach(
          (npc) => {
            const location =
              npc.location?.trim() ||
              t.noLocation

            const relationship =
              npc.relationship ??
              'neutral'

            if (
              !groups.has(location)
            ) {
              groups.set(
                location,
                new Map(),
              )
            }

            const relationGroups =
              groups.get(location)!

            if (
              !relationGroups.has(
                relationship,
              )
            ) {
              relationGroups.set(
                relationship,
                [],
              )
            }

            relationGroups
              .get(
                relationship,
              )!
              .push(npc)
          },
        )

        return Array.from(
          groups.entries(),
        ).sort(
          (
            [first],
            [second],
          ) =>
            first.localeCompare(
              second,
            ),
        )
      },
      [
        filteredNpcs,
        t.noLocation,
      ],
    )

  const openNew = () => {
    setEditingId(null)
    setForm({
      ...emptyNpcForm,
    })
    setErrorMessage('')
    setSuccessMessage('')
    setEditorOpen(true)
  }

  const openEdit = (
    npc: CampaignNpc,
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
      location:
        npc.location ??
        '',
      relationship:
        npc.relationship ??
        'neutral',
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

  const closeEditor = () => {
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
        location:
          form.location.trim() ||
          null,
        relationship:
          form.relationship,
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
            (current) =>
              current
                .map(
                  (npc) =>
                    npc.id ===
                    editingId
                      ? (
                          data as CampaignNpc
                        )
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
            (current) =>
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
        !(await confirmAction({ message: t.deleteConfirm, variant: 'danger' }))
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
          (current) =>
            current.filter(
              (npc) =>
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
        eyebrow={t.eyebrow}
        title={t.title}
        description={
          t.description
        }
        buttonLabel={
          t.newNpc
        }
        showButton={
          !editorOpen &&
          npcs.length > 0
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
              label={t.name}
              value={form.name}
              onChange={(value) =>
                setForm(
                  (current) => ({
                    ...current,
                    name: value,
                  }),
                )
              }
              required
            />

            <TextField
              label={t.role}
              value={form.role}
              onChange={(value) =>
                setForm(
                  (current) => ({
                    ...current,
                    role: value,
                  }),
                )
              }
            />

            <TextField
              label={t.location}
              value={
                form.location
              }
              onChange={(value) =>
                setForm(
                  (current) => ({
                    ...current,
                    location:
                      value,
                  }),
                )
              }
            />

            <TextField
              label={t.faction}
              value={
                form.faction
              }
              onChange={(value) =>
                setForm(
                  (current) => ({
                    ...current,
                    faction:
                      value,
                  }),
                )
              }
            />

            <label>
              <span>
                {t.relationship}
              </span>

              <select
                value={
                  form.relationship
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (current) => ({
                      ...current,
                      relationship:
                        event.target
                          .value as NpcRelationship,
                    }),
                  )
                }
              >
                {(
                  [
                    'ally',
                    'neutral',
                    'enemy',
                  ] as NpcRelationship[]
                ).map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {t[value]}
                    </option>
                  ),
                )}
              </select>
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
                    (current) => ({
                      ...current,
                      status:
                        event.target
                          .value as NpcStatus,
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
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {t[value]}
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
              onChange={(value) =>
                setForm(
                  (current) => ({
                    ...current,
                    description:
                      value,
                  }),
                )
              }
            />

            <AreaField
              label={t.notes}
              value={
                form.notes
              }
              onChange={(value) =>
                setForm(
                  (current) => ({
                    ...current,
                    notes: value,
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
            saving={saving}
            onCancel={
              closeEditor
            }
          />
        </form>
      )}

      {!editorOpen &&
        !loading &&
        npcs.length > 0 && (
        <div className="session-editor">
          <div className="session-editor-heading">
            <div>
              <p>
                {t.filters}
              </p>

              <h3>
                {t.title}
              </h3>
            </div>

            <LuSearch />
          </div>

          <div className="session-editor-grid">
            <label>
              <span>
                {t.search}
              </span>

              <input
                type="search"
                value={
                  searchQuery
                }
                placeholder={
                  t.search
                }
                onChange={(
                  event,
                ) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>
                {t.location}
              </span>

              <select
                value={
                  locationFilter
                }
                onChange={(
                  event,
                ) =>
                  setLocationFilter(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {t.allLocations}
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={
                        location
                      }
                      value={
                        location
                      }
                    >
                      {location}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>
                {t.relationship}
              </span>

              <select
                value={
                  relationshipFilter
                }
                onChange={(
                  event,
                ) =>
                  setRelationshipFilter(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {t.allRelationships}
                </option>
                <option value="ally">
                  {t.ally}
                </option>
                <option value="neutral">
                  {t.neutral}
                </option>
                <option value="enemy">
                  {t.enemy}
                </option>
              </select>
            </label>

            <label>
              <span>
                {t.faction}
              </span>

              <select
                value={
                  factionFilter
                }
                onChange={(
                  event,
                ) =>
                  setFactionFilter(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {t.allFactions}
                </option>

                {factions.map(
                  (faction) => (
                    <option
                      key={
                        faction
                      }
                      value={
                        faction
                      }
                    >
                      {faction}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>
                {t.status}
              </span>

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {t.allStatuses}
                </option>

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
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {t[value]}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
        </div>
      )}

      {!editorOpen &&
        loading && (
        <Loading
          text={t.loading}
        />
      )}

      {!editorOpen &&
        !loading &&
        npcs.length === 0 && (
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
          onNew={openNew}
        />
      )}

      {!editorOpen &&
        !loading &&
        npcs.length > 0 &&
        filteredNpcs.length ===
          0 && (
        <div className="sessions-empty">
          <LuSearch />
          <h3>
            {t.noMatchesTitle}
          </h3>
        </div>
      )}

      {!editorOpen &&
        !loading &&
        groupedNpcs.map(
          ([
            location,
            relationGroups,
          ]) => (
            <section
              key={location}
            >
              <div className="campaign-sessions-header">
                <div>
                  <p className="campaign-sessions-eyebrow">
                    {t.location}
                  </p>

                  <h3>
                    <LuMapPin />
                    {' '}
                    {location}
                  </h3>
                </div>
              </div>

              {(
                [
                  'ally',
                  'neutral',
                  'enemy',
                ] as NpcRelationship[]
              ).map(
                (
                  relationship,
                ) => {
                  const entries =
                    relationGroups.get(
                      relationship,
                    ) ?? []

                  if (
                    entries.length ===
                    0
                  ) {
                    return null
                  }

                  return (
                    <div
                      key={
                        relationship
                      }
                    >
                      <p className="campaign-sessions-eyebrow">
                        {
                          t[
                            relationship
                          ]
                        }
                      </p>

                      <div className="sessions-list">
                        {entries
                          .slice()
                          .sort(
                            sortByName,
                          )
                          .map(
                            (npc) => (
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
                                    t[
                                      npc.status
                                    ],
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
                                      {
                                        npc.notes
                                      }
                                    </span>
                                  </div>
                                )}
                              </article>
                            ),
                          )}
                      </div>
                    </div>
                  )
                },
              )}
            </section>
          ),
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
