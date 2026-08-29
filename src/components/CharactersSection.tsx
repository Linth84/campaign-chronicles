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
  LuUserRound,
  LuUsers,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

type Language =
  | 'en'
  | 'es'

type CharacterStatus =
  | 'active'
  | 'inactive'
  | 'missing'
  | 'dead'
  | 'retired'

interface CharactersSectionProps {
  language: Language
  campaignId: string
}

interface CampaignCharacter {
  id: string
  campaign_id: string
  name: string
  player_name: string | null
  class_or_archetype: string | null
  ancestry: string | null
  status: CharacterStatus
  description: string | null
  notes: string | null
  created_at: string
}

interface CharacterForm {
  name: string
  playerName: string
  classOrArchetype: string
  ancestry: string
  status: CharacterStatus
  description: string
  notes: string
}

const emptyCharacterForm: CharacterForm = {
  name: '',
  playerName: '',
  classOrArchetype: '',
  ancestry: '',
  status: 'active',
  description: '',
  notes: '',
}

const translations = {
  en: {
    eyebrow: 'Party Roster',
    title: 'Characters',
    description:
      'Keep track of the heroes and player characters who shape the campaign.',
    newCharacter: 'New Character',
    createCharacter: 'Create Character',
    editCharacter: 'Edit Character',
    saveCharacter: 'Save Character',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading characters...',
    noCharactersTitle: 'No characters recorded yet.',
    noCharactersText:
      'Add the first character and start building the party roster.',
    name: 'Name',
    namePlaceholder: 'Character name',
    player: 'Player',
    playerPlaceholder: 'Player name',
    classArchetype: 'Class / Archetype',
    classPlaceholder: 'Bard, Investigator, Pilot...',
    ancestry: 'Ancestry',
    ancestryPlaceholder: 'Human, Elf, Android...',
    status: 'Status',
    descriptionLabel: 'Description',
    descriptionPlaceholder:
      'Who is this character?',
    notes: 'Notes',
    notesPlaceholder:
      'Goals, relationships, secrets, memorable details...',
    nameRequired:
      'Give the character a name before saving.',
    loadError:
      'We could not load the characters.',
    saveError:
      'We could not save this character.',
    deleteError:
      'We could not delete this character.',
    deleteConfirm:
      'Delete this character? This action cannot be undone.',
    created: 'Character created.',
    updated: 'Character updated.',
    noDescription:
      'No description has been written for this character yet.',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    statusMissing: 'Missing',
    statusDead: 'Dead',
    statusRetired: 'Retired',
  },

  es: {
    eyebrow: 'Grupo de aventureros',
    title: 'Personajes',
    description:
      'Llevá un registro de los héroes y personajes jugadores que dan forma a la campaña.',
    newCharacter: 'Nuevo personaje',
    createCharacter: 'Crear personaje',
    editCharacter: 'Editar personaje',
    saveCharacter: 'Guardar personaje',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando personajes...',
    noCharactersTitle: 'Todavía no hay personajes registrados.',
    noCharactersText:
      'Agregá el primer personaje y empezá a construir el grupo.',
    name: 'Nombre',
    namePlaceholder: 'Nombre del personaje',
    player: 'Jugador',
    playerPlaceholder: 'Nombre del jugador',
    classArchetype: 'Clase / Arquetipo',
    classPlaceholder: 'Bardo, Investigador, Piloto...',
    ancestry: 'Ascendencia',
    ancestryPlaceholder: 'Humano, Elfo, Androide...',
    status: 'Estado',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder:
      '¿Quién es este personaje?',
    notes: 'Notas',
    notesPlaceholder:
      'Objetivos, relaciones, secretos, detalles memorables...',
    nameRequired:
      'Escribí un nombre para el personaje antes de guardarlo.',
    loadError:
      'No pudimos cargar los personajes.',
    saveError:
      'No pudimos guardar este personaje.',
    deleteError:
      'No pudimos eliminar este personaje.',
    deleteConfirm:
      '¿Eliminar este personaje? Esta acción no se puede deshacer.',
    created: 'Personaje creado.',
    updated: 'Personaje actualizado.',
    noDescription:
      'Todavía no hay una descripción para este personaje.',
    statusActive: 'Activo',
    statusInactive: 'Inactivo',
    statusMissing: 'Desaparecido',
    statusDead: 'Muerto',
    statusRetired: 'Retirado',
  },
}

function CharactersSection({
  language,
  campaignId,
}: CharactersSectionProps) {
  const t =
    translations[language]

  const [
    characters,
    setCharacters,
  ] =
    useState<CampaignCharacter[]>(
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
    useState<CharacterForm>({
      ...emptyCharacterForm,
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
    const loadCharacters =
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
                'characters',
              )
              .select(
                `
                  id,
                  campaign_id,
                  name,
                  player_name,
                  class_or_archetype,
                  ancestry,
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

          setCharacters(
            (data ??
              []) as CampaignCharacter[],
          )
        } catch (error) {
          console.error(
            'Error al cargar personajes:',
            error,
          )

          setErrorMessage(
            t.loadError,
          )
        } finally {
          setLoading(false)
        }
      }

    void loadCharacters()
  }, [
    campaignId,
    t.loadError,
  ])

  const openNewCharacter =
    () => {
      setEditingId(null)

      setForm({
        ...emptyCharacterForm,
      })

      setErrorMessage('')
      setSuccessMessage('')
      setEditorOpen(true)
    }

  const openEditCharacter =
    (
      character:
        CampaignCharacter,
    ) => {
      setEditingId(
        character.id,
      )

      setForm({
        name:
          character.name,

        playerName:
          character.player_name ??
          '',

        classOrArchetype:
          character.class_or_archetype ??
          '',

        ancestry:
          character.ancestry ??
          '',

        status:
          character.status,

        description:
          character.description ??
          '',

        notes:
          character.notes ??
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
        ...emptyCharacterForm,
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

      const characterData = {
        campaign_id:
          campaignId,

        name:
          form.name.trim(),

        player_name:
          form.playerName.trim() ||
          null,

        class_or_archetype:
          form.classOrArchetype.trim() ||
          null,

        ancestry:
          form.ancestry.trim() ||
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
              .from(
                'characters',
              )
              .update(
                characterData,
              )
              .eq(
                'id',
                editingId,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .select(
                `
                  id,
                  campaign_id,
                  name,
                  player_name,
                  class_or_archetype,
                  ancestry,
                  status,
                  description,
                  notes,
                  created_at
                `,
              )
              .single()

          if (error) {
            throw error
          }

          setCharacters(
            (
              current,
            ) =>
              current
                .map(
                  (
                    character,
                  ) =>
                    character.id ===
                    editingId
                      ? (data as CampaignCharacter)
                      : character,
                )
                .sort(
                  sortCharacters,
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
              .from(
                'characters',
              )
              .insert(
                characterData,
              )
              .select(
                `
                  id,
                  campaign_id,
                  name,
                  player_name,
                  class_or_archetype,
                  ancestry,
                  status,
                  description,
                  notes,
                  created_at
                `,
              )
              .single()

          if (error) {
            throw error
          }

          setCharacters(
            (
              current,
            ) =>
              [
                ...current,
                data as CampaignCharacter,
              ].sort(
                sortCharacters,
              ),
          )

          setSuccessMessage(
            t.created,
          )
        }

        setEditorOpen(false)
        setEditingId(null)

        setForm({
          ...emptyCharacterForm,
        })
      } catch (error) {
        console.error(
          'Error al guardar personaje:',
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
      characterId:
        string,
    ) => {
      const confirmed =
        window.confirm(
          t.deleteConfirm,
        )

      if (!confirmed) {
        return
      }

      setErrorMessage('')
      setSuccessMessage('')

      try {
        const {
          error,
        } =
          await supabase
            .from(
              'characters',
            )
            .delete()
            .eq(
              'id',
              characterId,
            )
            .eq(
              'campaign_id',
              campaignId,
            )

        if (error) {
          throw error
        }

        setCharacters(
          (
            current,
          ) =>
            current.filter(
              (
                character,
              ) =>
                character.id !==
                characterId,
            ),
        )

        if (
          editingId ===
          characterId
        ) {
          closeEditor()
        }
      } catch (error) {
        console.error(
          'Error al eliminar personaje:',
          error,
        )

        setErrorMessage(
          t.deleteError,
        )
      }
    }

  const statusLabel =
    (
      status:
        CharacterStatus,
    ) => {
      switch (status) {
        case 'inactive':
          return t.statusInactive

        case 'missing':
          return t.statusMissing

        case 'dead':
          return t.statusDead

        case 'retired':
          return t.statusRetired

        default:
          return t.statusActive
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
          characters.length >
            0 && (
          <button
            type="button"
            className="session-new-button"
            onClick={
              openNewCharacter
            }
          >
            <LuPlus />

            <span>
              {t.newCharacter}
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
                  ? t.editCharacter
                  : t.createCharacter}
              </p>

              <h3>
                {form.name.trim() ||
                  t.newCharacter}
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
                placeholder={
                  t.namePlaceholder
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
                {t.player}
              </span>

              <input
                type="text"
                value={
                  form.playerName
                }
                placeholder={
                  t.playerPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      playerName:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label>
              <span>
                {t.classArchetype}
              </span>

              <input
                type="text"
                value={
                  form.classOrArchetype
                }
                placeholder={
                  t.classPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      classOrArchetype:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label>
              <span>
                {t.ancestry}
              </span>

              <input
                type="text"
                value={
                  form.ancestry
                }
                placeholder={
                  t.ancestryPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      ancestry:
                        event.target.value,
                    }),
                  )
                }
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
                        event.target.value as CharacterStatus,
                    }),
                  )
                }
              >
                <option value="active">
                  {t.statusActive}
                </option>

                <option value="inactive">
                  {t.statusInactive}
                </option>

                <option value="missing">
                  {t.statusMissing}
                </option>

                <option value="dead">
                  {t.statusDead}
                </option>

                <option value="retired">
                  {t.statusRetired}
                </option>
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
                placeholder={
                  t.descriptionPlaceholder
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
                placeholder={
                  t.notesPlaceholder
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
                  : t.saveCharacter}
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
        characters.length ===
          0 && (
        <div className="sessions-empty">
          <LuUsers />

          <h3>
            {t.noCharactersTitle}
          </h3>

          <p>
            {t.noCharactersText}
          </p>

          <button
            type="button"
            onClick={
              openNewCharacter
            }
          >
            <LuPlus />

            <span>
              {t.newCharacter}
            </span>
          </button>
        </div>
      )}

      {!editorOpen &&
        !loading &&
        characters.length >
          0 && (
        <div className="sessions-list">
          {characters.map(
            (
              character,
            ) => (
              <article
                className="session-card"
                key={
                  character.id
                }
              >
                <div className="session-card-top">
                  <div className="session-card-meta">
                    <span className="session-card-number">
                      <LuUserRound />

                      {statusLabel(
                        character.status,
                      )}
                    </span>

                    {character.player_name && (
                      <span className="session-card-date">
                        {t.player}:{' '}
                        {character.player_name}
                      </span>
                    )}
                  </div>

                  <div className="session-card-actions">
                    <button
                      type="button"
                      onClick={() =>
                        openEditCharacter(
                          character,
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
                          character.id,
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
                  {character.name}
                </h3>

                {(character.class_or_archetype ||
                  character.ancestry) && (
                  <p>
                    {[
                      character.class_or_archetype,
                      character.ancestry,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}

                <p>
                  {character.description ||
                    t.noDescription}
                </p>

                {character.notes && (
                  <div className="session-card-notes">
                    <LuUserRound />

                    <span>
                      {character.notes}
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

function sortCharacters(
  first:
    CampaignCharacter,
  second:
    CampaignCharacter,
) {
  return first.name.localeCompare(
    second.name,
  )
}

export default CharactersSection
