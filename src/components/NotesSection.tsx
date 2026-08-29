import {
  useEffect,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuFilePenLine,
  LuNotebookTabs,
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

interface NotesSectionProps {
  language: Language
  campaignId: string
}

interface CampaignNote {
  id: string
  campaign_id: string
  title: string
  body: string | null
  category: string | null
  is_pinned: boolean
  created_at: string
}

interface NoteForm {
  title: string
  body: string
  category: string
  isPinned: boolean
}

/* =========================================================
   FORMULARIO VACÍO
   ========================================================= */

const emptyNoteForm: NoteForm = {
  title: '',
  body: '',
  category: '',
  isPinned: false,
}

/* =========================================================
   TRADUCCIONES
   ========================================================= */

const translations = {
  en: {
    eyebrow:
      'Campaign Archive',

    title:
      'Notes',

    description:
      'Keep clues, ideas, reminders and anything that does not belong somewhere else.',

    newNote:
      'New Note',

    createNote:
      'Create Note',

    editNote:
      'Edit Note',

    titleLabel:
      'Title',

    titlePlaceholder:
      'The mysterious symbol',

    category:
      'Category',

    categoryPlaceholder:
      'Lore, clue, reminder...',

    body:
      'Content',

    bodyPlaceholder:
      'Write your note here...',

    pinned:
      'Pin this note',

    save:
      'Save Note',

    saving:
      'Saving...',

    cancel:
      'Cancel',

    edit:
      'Edit',

    delete:
      'Delete',

    noNotesTitle:
      'No notes yet.',

    noNotesText:
      'Create a note for clues, lore, reminders or anything you want to remember.',

    untitled:
      'Untitled Note',

    emptyBody:
      'This note has no content yet.',

    imported:
      'Imported',

    loadError:
      'We could not load the notes.',

    saveError:
      'We could not save this note.',

    deleteError:
      'We could not delete this note.',

    titleRequired:
      'Give the note a title before saving.',

    deleteConfirm:
      'Delete this note? This action cannot be undone.',
  },

  es: {
    eyebrow:
      'Archivo de campaña',

    title:
      'Notas',

    description:
      'Guardá pistas, ideas, recordatorios y todo lo que no pertenezca a otra sección.',

    newNote:
      'Nueva nota',

    createNote:
      'Crear nota',

    editNote:
      'Editar nota',

    titleLabel:
      'Título',

    titlePlaceholder:
      'El símbolo misterioso',

    category:
      'Categoría',

    categoryPlaceholder:
      'Lore, pista, recordatorio...',

    body:
      'Contenido',

    bodyPlaceholder:
      'Escribí tu nota acá...',

    pinned:
      'Fijar esta nota',

    save:
      'Guardar nota',

    saving:
      'Guardando...',

    cancel:
      'Cancelar',

    edit:
      'Editar',

    delete:
      'Eliminar',

    noNotesTitle:
      'Todavía no hay notas.',

    noNotesText:
      'Creá una nota para pistas, lore, recordatorios o cualquier cosa que quieras recordar.',

    untitled:
      'Nota sin título',

    emptyBody:
      'Esta nota todavía no tiene contenido.',

    imported:
      'Importado',

    loadError:
      'No pudimos cargar las notas.',

    saveError:
      'No pudimos guardar esta nota.',

    deleteError:
      'No pudimos eliminar esta nota.',

    titleRequired:
      'Escribí un título para la nota antes de guardarla.',

    deleteConfirm:
      '¿Eliminar esta nota? Esta acción no se puede deshacer.',
  },
}

/* =========================================================
   NOTES SECTION
   ========================================================= */

function NotesSection({
  language,
  campaignId,
}: NotesSectionProps) {
  const t =
    translations[
      language
    ]

  const [
    notes,
    setNotes,
  ] =
    useState<CampaignNote[]>(
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
    editingNoteId,
    setEditingNoteId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    noteForm,
    setNoteForm,
  ] =
    useState<NoteForm>({
      ...emptyNoteForm,
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

  /* =======================================================
     CARGAR NOTAS
     ======================================================= */

  useEffect(() => {
    const loadNotes =
      async () => {
        setLoading(true)
        setErrorMessage('')

        try {
          const {
            data,
            error,
          } =
            await supabase
              .from('notes')
              .select(
                `
                  id,
                  campaign_id,
                  title,
                  body,
                  category,
                  is_pinned,
                  created_at
                `,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .order(
                'is_pinned',
                {
                  ascending:
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

          setNotes(
            (data ??
              []) as CampaignNote[],
          )
        } catch (error) {
          console.error(
            'Error al cargar notas:',
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

    void loadNotes()
  }, [
    campaignId,
    t.loadError,
  ])

  /* =======================================================
     NUEVA NOTA
     ======================================================= */

  const openNewNote =
    () => {
      setEditingNoteId(
        null,
      )

      setNoteForm({
        ...emptyNoteForm,
      })

      setErrorMessage('')

      setEditorOpen(
        true,
      )
    }

  /* =======================================================
     EDITAR NOTA
     ======================================================= */

  const openEditNote =
    (
      note:
        CampaignNote,
    ) => {
      setEditingNoteId(
        note.id,
      )

      setNoteForm({
        title:
          note.title,

        body:
          note.body ??
          '',

        category:
          note.category ??
          '',

        isPinned:
          note.is_pinned,
      })

      setErrorMessage('')

      setEditorOpen(
        true,
      )
    }

  /* =======================================================
     CERRAR EDITOR
     ======================================================= */

  const closeEditor =
    () => {
      setEditorOpen(
        false,
      )

      setEditingNoteId(
        null,
      )

      setNoteForm({
        ...emptyNoteForm,
      })

      setErrorMessage('')
    }

  /* =======================================================
     GUARDAR NOTA
     ======================================================= */

  const handleSave =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      if (
        !noteForm.title.trim()
      ) {
        setErrorMessage(
          t.titleRequired,
        )

        return
      }

      setSaving(true)
      setErrorMessage('')

      const noteData = {
        campaign_id:
          campaignId,

        title:
          noteForm.title.trim(),

        body:
          noteForm.body.trim() ||
          null,

        category:
          noteForm.category.trim() ||
          null,

        is_pinned:
          noteForm.isPinned,
      }

      try {
        if (
          editingNoteId
        ) {
          const {
            data,
            error,
          } =
            await supabase
              .from('notes')
              .update(
                noteData,
              )
              .eq(
                'id',
                editingNoteId,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .select(
                `
                  id,
                  campaign_id,
                  title,
                  body,
                  category,
                  is_pinned,
                  created_at
                `,
              )
              .single()

          if (error) {
            throw error
          }

          setNotes(
            (
              current,
            ) =>
              current
                .map(
                  (
                    note,
                  ) =>
                    note.id ===
                    editingNoteId
                      ? data as CampaignNote
                      : note,
                )
                .sort(
                  sortNotes,
                ),
          )
        } else {
          const {
            data,
            error,
          } =
            await supabase
              .from('notes')
              .insert(
                noteData,
              )
              .select(
                `
                  id,
                  campaign_id,
                  title,
                  body,
                  category,
                  is_pinned,
                  created_at
                `,
              )
              .single()

          if (error) {
            throw error
          }

          setNotes(
            (
              current,
            ) =>
              [
                data as CampaignNote,
                ...current,
              ].sort(
                sortNotes,
              ),
          )
        }

        closeEditor()
      } catch (error) {
        console.error(
          'Error al guardar nota:',
          error,
        )

        setErrorMessage(
          t.saveError,
        )
      } finally {
        setSaving(
          false,
        )
      }
    }

  /* =======================================================
     ELIMINAR NOTA
     ======================================================= */

  const handleDelete =
    async (
      noteId:
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

      try {
        const {
          error,
        } =
          await supabase
            .from('notes')
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

        setNotes(
          (
            current,
          ) =>
            current.filter(
              (
                note,
              ) =>
                note.id !==
                noteId,
            ),
        )
      } catch (error) {
        console.error(
          'Error al eliminar nota:',
          error,
        )

        setErrorMessage(
          t.deleteError,
        )
      }
    }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section className="campaign-notes">
      <div className="campaign-notes-header">
        <div>
          <p className="campaign-notes-eyebrow">
            {t.eyebrow}
          </p>

          <h2>
            {t.title}
          </h2>

          <p className="campaign-notes-description">
            {t.description}
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

      {/* =================================================
          EDITOR
          ================================================= */}

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
            <label>
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
                {t.category}
              </span>

              <input
                type="text"
                value={
                  noteForm.category
                }
                placeholder={
                  t.categoryPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setNoteForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      category:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label className="note-editor-full">
              <span>
                {t.body}
              </span>

              <textarea
                value={
                  noteForm.body
                }
                placeholder={
                  t.bodyPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  setNoteForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      body:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label className="note-pin-option">
              <input
                type="checkbox"
                checked={
                  noteForm.isPinned
                }
                onChange={(
                  event,
                ) =>
                  setNoteForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      isPinned:
                        event.target.checked,
                    }),
                  )
                }
              />

              <span>
                {t.pinned}
              </span>
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

      {/* =================================================
          CARGA
          ================================================= */}

      {!editorOpen &&
        loading && (
          <div className="notes-loading">
            <div className="app-loading-symbol" />
          </div>
        )}

      {/* =================================================
          SIN NOTAS
          ================================================= */}

      {!editorOpen &&
        !loading &&
        notes.length ===
          0 && (
          <div className="notes-empty">
            <LuNotebookTabs />

            <h3>
              {t.noNotesTitle}
            </h3>

            <p>
              {t.noNotesText}
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

      {/* =================================================
          LISTADO DE NOTAS
          ================================================= */}

      {!editorOpen &&
        !loading &&
        notes.length >
          0 && (
          <div className="notes-grid">
            {notes.map(
              (
                note,
              ) => (
                <article
                  key={
                    note.id
                  }
                  className={
                    note.is_pinned
                      ? 'note-card note-card-pinned'
                      : 'note-card'
                  }
                >
                  <div className="note-card-top">
                    <div className="note-card-labels">
                      {note.is_pinned && (
                        <span className="note-card-pinned-label">
                          PIN
                        </span>
                      )}

                      {note.category && (
                        <span className="note-card-category">
                          {note.category ===
                          'imported'
                            ? t.imported
                            : note.category}
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
                    {note.body ||
                      t.emptyBody}
                  </p>
                </article>
              ),
            )}
          </div>
        )}
    </section>
  )
}

/* =========================================================
   ORDENAR NOTAS
   ========================================================= */

function sortNotes(
  first: CampaignNote,
  second: CampaignNote,
) {
  if (
    first.is_pinned !==
    second.is_pinned
  ) {
    return first.is_pinned
      ? -1
      : 1
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

export default NotesSection