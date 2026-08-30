import { useConfirm } from './ConfirmProvider'
import {
  useEffect,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuFilePenLine,
  LuLock,
  LuNotebookPen,
  LuPlus,
  LuSave,
  LuTrash2,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

/* =========================================================
   TIPOS
   ========================================================= */

type Language =
  | 'en'
  | 'es'

interface PrivateNotesSectionProps {
  language: Language
  campaignId: string
  mode: 'personal' | 'gm'
}

interface PrivateNote {
  id: string
  campaign_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

interface NoteForm {
  title: string
  content: string
}

const emptyNoteForm: NoteForm = {
  title: '',
  content: '',
}

/* =========================================================
   TRADUCCIONES
   ========================================================= */

const translations = {
  en: {
    personal: {
      eyebrow: 'Private Journal',
      title: 'My Notes',
      description:
        'Your private notes for this campaign. Only you can read, edit or delete them.',
      emptyTitle: 'No personal notes yet.',
      emptyText:
        'Write down theories, reminders, plans or anything you want to keep to yourself.',
    },
    gm: {
      eyebrow: 'GM Workspace',
      title: 'GM Notes',
      description:
        'Private campaign notes available only to GMs.',
      emptyTitle: 'No GM notes yet.',
      emptyText:
        'Keep secrets, future plans, hidden information and campaign preparation here.',
    },
    newNote: 'New Note',
    createNote: 'Create Note',
    editNote: 'Edit Note',
    titleLabel: 'Title',
    titlePlaceholder: 'Something worth remembering',
    content: 'Content',
    contentPlaceholder: 'Write your note here...',
    save: 'Save Note',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    untitled: 'Untitled Note',
    emptyContent: 'This note has no content yet.',
    loadError: 'We could not load these notes.',
    saveError: 'We could not save this note.',
    deleteError: 'We could not delete this note.',
    titleRequired: 'Give the note a title before saving.',
    deleteConfirm: 'Delete this note? This action cannot be undone.',
    authError: 'We could not identify the current user.',
  },

  es: {
    personal: {
      eyebrow: 'Diario privado',
      title: 'Mis notas',
      description:
        'Tus notas privadas de esta campaña. Solo tú puedes leerlas, editarlas o eliminarlas.',
      emptyTitle: 'Todavía no tienes notas personales.',
      emptyText:
        'Guarda teorías, recordatorios, planes o cualquier cosa que quieras conservar para ti.',
    },
    gm: {
      eyebrow: 'Espacio del GM',
      title: 'Notas del GM',
      description:
        'Notas privadas de la campaña disponibles únicamente para los GM.',
      emptyTitle: 'Todavía no hay notas del GM.',
      emptyText:
        'Guarda secretos, planes futuros, información oculta y preparación de campaña aquí.',
    },
    newNote: 'Nueva nota',
    createNote: 'Crear nota',
    editNote: 'Editar nota',
    titleLabel: 'Título',
    titlePlaceholder: 'Algo que vale la pena recordar',
    content: 'Contenido',
    contentPlaceholder: 'Escribe tu nota aquí...',
    save: 'Guardar nota',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    untitled: 'Nota sin título',
    emptyContent: 'Esta nota todavía no tiene contenido.',
    loadError: 'No pudimos cargar estas notas.',
    saveError: 'No pudimos guardar esta nota.',
    deleteError: 'No pudimos eliminar esta nota.',
    titleRequired: 'Escribe un título para la nota antes de guardarla.',
    deleteConfirm: '¿Eliminar esta nota? Esta acción no se puede deshacer.',
    authError: 'No pudimos identificar al usuario actual.',
  },
}

/* =========================================================
   COMPONENTE REUTILIZABLE DE NOTAS PRIVADAS
   ========================================================= */

function PrivateNotesSection({
  language,
  campaignId,
  mode,
}: PrivateNotesSectionProps) {
  const confirmAction = useConfirm()
  const t = translations[language]
  const sectionText =
    mode === 'gm'
      ? t.gm
      : t.personal

  const tableName =
    mode === 'gm'
      ? 'gm_notes'
      : 'user_notes'

  const [
    notes,
    setNotes,
  ] = useState<PrivateNote[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    editorOpen,
    setEditorOpen,
  ] = useState(false)

  const [
    editingNoteId,
    setEditingNoteId,
  ] = useState<string | null>(null)

  const [
    noteForm,
    setNoteForm,
  ] = useState<NoteForm>({
    ...emptyNoteForm,
  })

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  /* =======================================================
     CARGAR NOTAS
     ======================================================= */

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true)
      setErrorMessage('')

      try {
        const {
          data,
          error,
        } = await supabase
          .from(tableName)
          .select(`
            id,
            campaign_id,
            title,
            content,
            created_at,
            updated_at
          `)
          .eq(
            'campaign_id',
            campaignId,
          )
          .order(
            'updated_at',
            {
              ascending: false,
            },
          )

        if (error) {
          throw error
        }

        setNotes(
          (data ?? []) as PrivateNote[],
        )
      } catch (error) {
        console.error(
          `Error al cargar ${tableName}:`,
          error,
        )

        setErrorMessage(
          t.loadError,
        )
      } finally {
        setLoading(false)
      }
    }

    void loadNotes()
  }, [
    campaignId,
    tableName,
    t.loadError,
  ])

  const openNewNote = () => {
    setEditingNoteId(null)
    setNoteForm({
      ...emptyNoteForm,
    })
    setErrorMessage('')
    setEditorOpen(true)
  }

  const openEditNote = (
    note: PrivateNote,
  ) => {
    setEditingNoteId(note.id)
    setNoteForm({
      title: note.title,
      content: note.content ?? '',
    })
    setErrorMessage('')
    setEditorOpen(true)
  }

  const closeEditor = () => {
    if (saving) {
      return
    }

    setEditorOpen(false)
    setEditingNoteId(null)
    setNoteForm({
      ...emptyNoteForm,
    })
    setErrorMessage('')
  }

  /* =======================================================
     GUARDAR NOTA
     ======================================================= */

  const handleSave = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!noteForm.title.trim()) {
      setErrorMessage(
        t.titleRequired,
      )
      return
    }

    setSaving(true)
    setErrorMessage('')

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser()

      if (
        userError ||
        !userData.user
      ) {
        throw (
          userError ||
          new Error(t.authError)
        )
      }

      const now =
        new Date().toISOString()

      const baseData = {
        campaign_id:
          campaignId,
        title:
          noteForm.title.trim(),
        content:
          noteForm.content.trim(),
        updated_at:
          now,
      }

      if (editingNoteId) {
        const {
          data,
          error,
        } = await supabase
          .from(tableName)
          .update(baseData)
          .eq(
            'id',
            editingNoteId,
          )
          .eq(
            'campaign_id',
            campaignId,
          )
          .select(`
            id,
            campaign_id,
            title,
            content,
            created_at,
            updated_at
          `)
          .single()

        if (error) {
          throw error
        }

        setNotes((current) =>
          current
            .map((note) =>
              note.id === editingNoteId
                ? data as PrivateNote
                : note,
            )
            .sort(sortPrivateNotes),
        )
      } else {
        const ownershipData =
          mode === 'gm'
            ? {
                created_by:
                  userData.user.id,
              }
            : {
                user_id:
                  userData.user.id,
              }

        const {
          data,
          error,
        } = await supabase
          .from(tableName)
          .insert({
            ...baseData,
            ...ownershipData,
          })
          .select(`
            id,
            campaign_id,
            title,
            content,
            created_at,
            updated_at
          `)
          .single()

        if (error) {
          throw error
        }

        setNotes((current) =>
          [
            data as PrivateNote,
            ...current,
          ].sort(sortPrivateNotes),
        )
      }

      setEditorOpen(false)
      setEditingNoteId(null)
      setNoteForm({
        ...emptyNoteForm,
      })
    } catch (error) {
      console.error(
        `Error al guardar ${tableName}:`,
        error,
      )

      setErrorMessage(
        t.saveError,
      )
    } finally {
      setSaving(false)
    }
  }

  /* =======================================================
     ELIMINAR NOTA
     ======================================================= */

  const handleDelete = async (
    noteId: string,
  ) => {
    const confirmed =
      await confirmAction({ message: t.deleteConfirm, variant: 'danger' })

    if (!confirmed) {
      return
    }

    setErrorMessage('')

    try {
      const {
        error,
      } = await supabase
        .from(tableName)
        .delete()
        .eq(
          'id',
          noteId,
        )
        .eq(
          'campaign_id',
          campaignId,
        )

      if (error) {
        throw error
      }

      setNotes((current) =>
        current.filter(
          (note) =>
            note.id !== noteId,
        ),
      )
    } catch (error) {
      console.error(
        `Error al eliminar ${tableName}:`,
        error,
      )

      setErrorMessage(
        t.deleteError,
      )
    }
  }

  const EmptyIcon =
    mode === 'gm'
      ? LuLock
      : LuNotebookPen

  /* =======================================================
     RENDER
     Reutiliza el diseño existente de NotesSection
     ======================================================= */

  return (
    <section className="campaign-notes">
      <div className="campaign-notes-header">
        <div>
          <p className="campaign-notes-eyebrow">
            {sectionText.eyebrow}
          </p>

          <h2>
            {sectionText.title}
          </h2>

          <p className="campaign-notes-description">
            {sectionText.description}
          </p>
        </div>

        {!editorOpen &&
          notes.length > 0 && (
          <button
            type="button"
            className="note-new-button"
            onClick={
              openNewNote
            }
          >
            <LuPlus />

            <span>
              {t.newNote}
            </span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div
          className="note-message-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {editorOpen && (
        <form
          className="note-editor"
          onSubmit={
            handleSave
          }
        >
          <div className="note-editor-heading">
            <div>
              <p>
                {editingNoteId
                  ? t.editNote
                  : t.createNote}
              </p>

              <h3>
                {noteForm.title.trim() ||
                  t.untitled}
              </h3>
            </div>

            <button
              type="button"
              className="note-editor-close"
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

          <div className="note-editor-grid">
            <label className="note-editor-full">
              <span>
                {t.titleLabel}
              </span>

              <input
                type="text"
                value={
                  noteForm.title
                }
                placeholder={
                  t.titlePlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setNoteForm(
                    (current) => ({
                      ...current,
                      title:
                        event.target.value,
                    }),
                  )
                }
                required
              />
            </label>

            <label className="note-editor-full">
              <span>
                {t.content}
              </span>

              <textarea
                value={
                  noteForm.content
                }
                placeholder={
                  t.contentPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setNoteForm(
                    (current) => ({
                      ...current,
                      content:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>
          </div>

          <div className="note-editor-actions">
            <button
              type="button"
              className="note-cancel-button"
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
              className="note-save-button"
              disabled={
                saving
              }
            >
              <LuSave />

              <span>
                {saving
                  ? t.saving
                  : t.save}
              </span>
            </button>
          </div>
        </form>
      )}

      {!editorOpen &&
        loading && (
        <div className="notes-loading">
          <div className="app-loading-symbol" />
        </div>
      )}

      {!editorOpen &&
        !loading &&
        notes.length === 0 && (
        <div className="notes-empty">
          <EmptyIcon />

          <h3>
            {sectionText.emptyTitle}
          </h3>

          <p>
            {sectionText.emptyText}
          </p>

          <button
            type="button"
            onClick={
              openNewNote
            }
          >
            <LuPlus />

            <span>
              {t.newNote}
            </span>
          </button>
        </div>
      )}

      {!editorOpen &&
        !loading &&
        notes.length > 0 && (
        <div className="notes-grid">
          {notes.map(
            (note) => (
              <article
                key={
                  note.id
                }
                className="note-card"
              >
                <div className="note-card-top">
                  <div className="note-card-labels">
                    {mode === 'gm' && (
                      <span className="note-card-category">
                        GM
                      </span>
                    )}
                  </div>

                  <div className="note-card-actions">
                    <button
                      type="button"
                      onClick={() =>
                        openEditNote(
                          note,
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
                      className="note-delete-button"
                      onClick={() =>
                        void handleDelete(
                          note.id,
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
                  {note.title ||
                    t.untitled}
                </h3>

                <p>
                  {note.content ||
                    t.emptyContent}
                </p>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  )
}

function sortPrivateNotes(
  first: PrivateNote,
  second: PrivateNote,
) {
  return (
    new Date(
      second.updated_at,
    ).getTime() -
    new Date(
      first.updated_at,
    ).getTime()
  )
}

export default PrivateNotesSection
