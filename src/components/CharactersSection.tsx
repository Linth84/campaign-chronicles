import { useConfirm } from './ConfirmProvider'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuBackpack,
  LuFilePenLine,
  LuHeartPulse,
  LuImagePlus,
  LuPlus,
  LuSave,
  LuShield,
  LuTrash2,
  LuUserRound,
  LuUsers,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'
import {
  removeCampaignPortrait,
  resolveCampaignImageUrl,
  uploadCampaignPortrait,
} from '../utils/campaignImages'

type Language =
  | 'en'
  | 'es'

type CharacterStatus =
  | 'active'
  | 'inactive'
  | 'missing'
  | 'dead'
  | 'retired'

type CampaignRole =
  | 'gm'
  | 'player'

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
  level: number | null
  current_hp: number | null
  max_hp: number | null
  armor_class: number | null
  notable_gear: string | null
  image_path: string | null
  created_at: string
}

interface CharacterForm {
  name: string
  playerName: string
  classOrArchetype: string
  ancestry: string
  level: string
  currentHp: string
  maxHp: string
  armorClass: string
  status: CharacterStatus
  description: string
  notableGear: string
  gmNotes: string
  notes: string
}

const emptyCharacterForm: CharacterForm = {
  name: '',
  playerName: '',
  classOrArchetype: '',
  ancestry: '',
  level: '',
  currentHp: '',
  maxHp: '',
  armorClass: '',
  status: 'active',
  description: '',
  notableGear: '',
  gmNotes: '',
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
    level: 'Level',
    currentHp: 'Current HP',
    maxHp: 'Max HP',
    armorClass: 'AC',
    status: 'Status',
    descriptionLabel: 'Description',
    descriptionPlaceholder:
      'Who is this character?',
    stats: 'Statistics',
    notableGear: 'Equipment / Magic Items',
    notableGearPlaceholder:
      'Magic items, signature weapons, armor or other important equipment...',
    gmNotes: 'GM Notes',
    gmNotesPlaceholder:
      'Private reminders, secrets or information useful to the GM...',
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
    portrait: 'Portrait',
    portraitHelp: 'JPG, PNG or WebP. The image is optimized automatically.',
    choosePortrait: 'Choose image',
    removePortrait: 'Remove portrait',
    imageError: 'We could not process the portrait.',
  },

  es: {
    eyebrow: 'Grupo de aventureros',
    title: 'Personajes',
    description:
      'Lleva un registro de los héroes y personajes jugadores que dan forma a la campaña.',
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
      'Agrega el primer personaje y empieza a construir el grupo.',
    name: 'Nombre',
    namePlaceholder: 'Nombre del personaje',
    player: 'Jugador',
    playerPlaceholder: 'Nombre del jugador',
    classArchetype: 'Clase / Arquetipo',
    classPlaceholder: 'Bardo, Investigador, Piloto...',
    ancestry: 'Ascendencia',
    ancestryPlaceholder: 'Humano, Elfo, Androide...',
    level: 'Nivel',
    currentHp: 'HP actual',
    maxHp: 'HP máximo',
    armorClass: 'AC',
    status: 'Estado',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder:
      '¿Quién es este personaje?',
    stats: 'Estadísticas',
    notableGear: 'Equipo / Objetos mágicos',
    notableGearPlaceholder:
      'Objetos mágicos, armas características, armaduras u otro equipo importante...',
    gmNotes: 'Notas del GM',
    gmNotesPlaceholder:
      'Recordatorios privados, secretos o información útil para el GM...',
    notes: 'Notas',
    notesPlaceholder:
      'Objetivos, relaciones, secretos, detalles memorables...',
    nameRequired:
      'Escribe un nombre para el personaje antes de guardarlo.',
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
    portrait: 'Retrato',
    portraitHelp: 'JPG, PNG o WebP. La imagen se optimiza automáticamente.',
    choosePortrait: 'Elegir imagen',
    removePortrait: 'Quitar retrato',
    imageError: 'No pudimos procesar el retrato.',
  },
}

function CharactersSection({
  language,
  campaignId,
}: CharactersSectionProps) {
  const confirmAction = useConfirm()
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

  const [
    campaignRole,
    setCampaignRole,
  ] =
    useState<CampaignRole | null>(
      null,
    )

  const [
    gmNotesByCharacter,
    setGmNotesByCharacter,
  ] =
    useState<Record<string, string>>(
      {},
    )

  const [portraitFile, setPortraitFile] =
    useState<File | null>(null)
  const [portraitPreview, setPortraitPreview] =
    useState<string | null>(null)
  const [removePortrait, setRemovePortrait] =
    useState(false)
  const [imageUrls, setImageUrls] =
    useState<Record<string, string>>({})
  const portraitInputRef =
    useRef<HTMLInputElement | null>(null)

  const canAccessGmNotes =
    campaignRole === 'gm'

  useEffect(() => {
    const loadCharacters =
      async () => {
        setLoading(true)
        setErrorMessage('')

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

          const resolvedRole: CampaignRole | null =
            membership?.role === 'gm' ||
            membership?.role === 'player'
              ? membership.role as CampaignRole
              : null

          setCampaignRole(
            resolvedRole,
          )

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
                  level,
                  current_hp,
                  max_hp,
                  armor_class,
                  notable_gear,
                  image_path,
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

          if (
            resolvedRole === 'gm'
          ) {
            const {
              data: privateNotes,
              error: privateNotesError,
            } =
              await supabase
                .from(
                  'character_gm_notes',
                )
                .select(
                  `
                    character_id,
                    notes
                  `,
                )
                .eq(
                  'campaign_id',
                  campaignId,
                )

            if (privateNotesError) {
              throw privateNotesError
            }

            const notesMap =
              (
                privateNotes ??
                []
              ).reduce<
                Record<string, string>
              >(
                (
                  accumulator,
                  note,
                ) => {
                  accumulator[
                    note.character_id
                  ] =
                    note.notes ??
                    ''

                  return accumulator
                },
                {},
              )

            setGmNotesByCharacter(
              notesMap,
            )
          } else {
            setGmNotesByCharacter(
              {},
            )
          }
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

  useEffect(() => {
    let cancelled = false

    const loadImageUrls = async () => {
      const entries = await Promise.all(
        characters
          .filter((character) => character.image_path)
          .map(async (character) => [
            character.id,
            await resolveCampaignImageUrl(character.image_path),
          ] as const),
      )

      if (!cancelled) {
        setImageUrls(
          Object.fromEntries(
            entries.filter(([, url]) => Boolean(url)),
          ) as Record<string, string>,
        )
      }
    }

    void loadImageUrls()

    return () => {
      cancelled = true
    }
  }, [characters])

  const resetPortraitEditor = () => {
    if (portraitPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(portraitPreview)
    }
    setPortraitFile(null)
    setPortraitPreview(null)
    setRemovePortrait(false)
    if (portraitInputRef.current) {
      portraitInputRef.current.value = ''
    }
  }

  const choosePortrait = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMessage(t.imageError)
      return
    }
    if (portraitPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(portraitPreview)
    }
    setPortraitFile(file)
    setPortraitPreview(URL.createObjectURL(file))
    setRemovePortrait(false)
  }

  const openNewCharacter =
    () => {
      setEditingId(null)
      resetPortraitEditor()

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
      resetPortraitEditor()
      setPortraitPreview(
        imageUrls[character.id] ?? null,
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

        level:
          character.level !== null
            ? String(character.level)
            : '',

        currentHp:
          character.current_hp !== null
            ? String(character.current_hp)
            : '',

        maxHp:
          character.max_hp !== null
            ? String(character.max_hp)
            : '',

        armorClass:
          character.armor_class !== null
            ? String(character.armor_class)
            : '',

        status:
          character.status,

        description:
          character.description ??
          '',

        notableGear:
          character.notable_gear ??
          '',

        gmNotes:
          canAccessGmNotes
            ? gmNotesByCharacter[
                character.id
              ] ?? ''
            : '',

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
      resetPortraitEditor()

      setForm({
        ...emptyCharacterForm,
      })

      setErrorMessage('')
    }

  const savePrivateGmNotes =
    async (
      characterId: string,
    ) => {
      if (!canAccessGmNotes) {
        return
      }

      const notes =
        form.gmNotes.trim()

      if (!notes) {
        const {
          error,
        } =
          await supabase
            .from(
              'character_gm_notes',
            )
            .delete()
            .eq(
              'character_id',
              characterId,
            )
            .eq(
              'campaign_id',
              campaignId,
            )

        if (error) {
          throw error
        }

        setGmNotesByCharacter(
          (
            current,
          ) => {
            const next = {
              ...current,
            }

            delete next[
              characterId
            ]

            return next
          },
        )

        return
      }

      const {
        error,
      } =
        await supabase
          .from(
            'character_gm_notes',
          )
          .upsert(
            {
              character_id:
                characterId,
              campaign_id:
                campaignId,
              notes,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                'character_id',
            },
          )

      if (error) {
        throw error
      }

      setGmNotesByCharacter(
        (
          current,
        ) => ({
          ...current,
          [characterId]:
            notes,
        }),
      )
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

        level:
          form.level.trim()
            ? Number(form.level)
            : null,

        current_hp:
          form.currentHp.trim()
            ? Number(form.currentHp)
            : null,

        max_hp:
          form.maxHp.trim()
            ? Number(form.maxHp)
            : null,

        armor_class:
          form.armorClass.trim()
            ? Number(form.armorClass)
            : null,

        status:
          form.status,

        description:
          form.description.trim() ||
          null,

        notable_gear:
          form.notableGear.trim() ||
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
                  level,
                  current_hp,
                  max_hp,
                  armor_class,
                  notable_gear,
                  image_path,
                  created_at
                `,
              )
              .single()

          if (error) {
            throw error
          }

          let savedCharacter =
            data as CampaignCharacter

          if (removePortrait && savedCharacter.image_path) {
            await removeCampaignPortrait(
              savedCharacter.image_path,
            )
            const { data: cleared, error: clearError } =
              await supabase
                .from('characters')
                .update({ image_path: null })
                .eq('id', editingId)
                .eq('campaign_id', campaignId)
                .select('*')
                .single()
            if (clearError) throw clearError
            savedCharacter = cleared as CampaignCharacter
          }

          if (portraitFile) {
            const imagePath = await uploadCampaignPortrait({
              campaignId,
              entityType: 'characters',
              entityId: editingId,
              file: portraitFile,
            })
            const { data: withImage, error: imageUpdateError } =
              await supabase
                .from('characters')
                .update({ image_path: imagePath })
                .eq('id', editingId)
                .eq('campaign_id', campaignId)
                .select('*')
                .single()
            if (imageUpdateError) throw imageUpdateError
            savedCharacter = withImage as CampaignCharacter
          }

          await savePrivateGmNotes(
            editingId,
          )

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
                      ? savedCharacter
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
                  level,
                  current_hp,
                  max_hp,
                  armor_class,
                  notable_gear,
                  image_path,
                  created_at
                `,
              )
              .single()

          if (error) {
            throw error
          }

          let savedCharacter =
            data as CampaignCharacter

          if (portraitFile) {
            const imagePath = await uploadCampaignPortrait({
              campaignId,
              entityType: 'characters',
              entityId: savedCharacter.id,
              file: portraitFile,
            })
            const { data: withImage, error: imageUpdateError } =
              await supabase
                .from('characters')
                .update({ image_path: imagePath })
                .eq('id', savedCharacter.id)
                .eq('campaign_id', campaignId)
                .select('*')
                .single()
            if (imageUpdateError) throw imageUpdateError
            savedCharacter = withImage as CampaignCharacter
          }

          await savePrivateGmNotes(
            savedCharacter.id,
          )

          setCharacters(
            (
              current,
            ) =>
              [
                ...current,
                savedCharacter,
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
        resetPortraitEditor()

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
        await confirmAction({ message: t.deleteConfirm, variant: 'danger' })

      if (!confirmed) {
        return
      }

      setErrorMessage('')
      setSuccessMessage('')

      try {
        const characterToDelete =
          characters.find((character) => character.id === characterId)
        if (characterToDelete?.image_path) {
          await removeCampaignPortrait(characterToDelete.image_path)
        }

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

          <div className="campaign-portrait-editor">
            <div className="campaign-portrait-preview">
              {portraitPreview && !removePortrait ? (
                <img src={portraitPreview} alt="" />
              ) : (
                <LuUserRound aria-hidden="true" />
              )}
            </div>
            <div className="campaign-portrait-copy">
              <strong>{t.portrait}</strong>
              <span>{t.portraitHelp}</span>
              <div className="campaign-portrait-actions">
                <input
                  ref={portraitInputRef}
                  className="campaign-portrait-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    choosePortrait(event.target.files?.[0] ?? null)
                  }
                />
                <button
                  type="button"
                  className="campaign-portrait-button"
                  onClick={() => portraitInputRef.current?.click()}
                >
                  <LuImagePlus />
                  {t.choosePortrait}
                </button>
                {(portraitPreview || (editingId &&
                  characters.find((item) => item.id === editingId)?.image_path)) && (
                  <button
                    type="button"
                    className="campaign-portrait-button campaign-portrait-button--danger"
                    onClick={() => {
                      if (portraitPreview?.startsWith('blob:')) {
                        URL.revokeObjectURL(portraitPreview)
                      }
                      setPortraitFile(null)
                      setPortraitPreview(null)
                      setRemovePortrait(true)
                    }}
                  >
                    <LuTrash2 />
                    {t.removePortrait}
                  </button>
                )}
              </div>
            </div>
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
                {t.level}
              </span>

              <input
                type="number"
                min="0"
                value={
                  form.level
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      level:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label>
              <span>
                {t.currentHp}
              </span>

              <input
                type="number"
                min="0"
                value={
                  form.currentHp
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      currentHp:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label>
              <span>
                {t.maxHp}
              </span>

              <input
                type="number"
                min="0"
                value={
                  form.maxHp
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      maxHp:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label>
              <span>
                {t.armorClass}
              </span>

              <input
                type="number"
                min="0"
                value={
                  form.armorClass
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      armorClass:
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
                {t.notableGear}
              </span>

              <textarea
                value={
                  form.notableGear
                }
                placeholder={
                  t.notableGearPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      notableGear:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            {canAccessGmNotes && (
              <label className="session-editor-full">
                <span>
                  {t.gmNotes}
                </span>

                <textarea
                  value={
                    form.gmNotes
                  }
                  placeholder={
                    t.gmNotesPlaceholder
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        gmNotes:
                          event.target.value,
                      }),
                    )
                  }
                />
              </label>
            )}

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
                <div className="campaign-card-portrait">
                  {imageUrls[character.id] ? (
                    <img
                      src={imageUrls[character.id]}
                      alt={character.name}
                    />
                  ) : (
                    <LuUserRound aria-hidden="true" />
                  )}
                </div>

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

                {(character.level !== null ||
                  character.current_hp !== null ||
                  character.max_hp !== null ||
                  character.armor_class !== null) && (
                  <div className="session-card-notes">
                    <LuHeartPulse />

                    <span>
                      <strong>
                        {t.stats}: {' '}
                      </strong>

                      {[
                        character.level !== null
                          ? `${t.level}: ${character.level}`
                          : null,
                        character.current_hp !== null ||
                        character.max_hp !== null
                          ? `HP: ${character.current_hp ?? '—'} / ${character.max_hp ?? '—'}`
                          : null,
                        character.armor_class !== null
                          ? `${t.armorClass}: ${character.armor_class}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                )}

                <p>
                  {character.description ||
                    t.noDescription}
                </p>

                {character.notable_gear && (
                  <div className="session-card-notes">
                    <LuBackpack />

                    <span>
                      <strong>
                        {t.notableGear}: {' '}
                      </strong>

                      {character.notable_gear}
                    </span>
                  </div>
                )}

                {canAccessGmNotes &&
                  gmNotesByCharacter[
                    character.id
                  ] && (
                  <div className="session-card-notes">
                    <LuShield />

                    <span>
                      <strong>
                        {t.gmNotes}: {' '}
                      </strong>

                      {
                        gmNotesByCharacter[
                          character.id
                        ]
                      }
                    </span>
                  </div>
                )}

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
