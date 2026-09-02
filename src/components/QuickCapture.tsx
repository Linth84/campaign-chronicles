import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  LuArrowRight,
  LuCheck,
  LuNotebookPen,
  LuPlus,
  LuSave,
  LuTrash2,
  LuX,
} from 'react-icons/lu'

import { useConfirm } from './ConfirmProvider'
import { supabase } from '../utils/supabase'

type Language = 'en' | 'es'

interface QuickCaptureProps {
  language: Language
  campaignId: string
}

interface Capture {
  id: string
  campaign_id: string
  created_by: string
  content: string
  created_at: string
  updated_at: string
}

const copy = {
  en: {
    button: 'Quick capture',
    eyebrow: 'Capture now, organize later',
    title: 'Quick Capture',
    placeholder: 'Write the thing you do not want to forget...',
    save: 'Save capture',
    saving: 'Saving...',
    empty: 'No pending captures.',
    recent: 'Pending captures',
    loadError: 'We could not load your captures.',
    saveError: 'We could not save this capture.',
    deleteError: 'We could not delete this capture.',
    timelineError: 'We could not move this capture to Timeline.',
    required: 'Write something before saving.',
    deleteTitle: 'Delete this capture?',
    deleteText: 'This quick capture will be permanently removed.',
    deleteConfirm: 'Delete capture',
    toTimeline: 'Move to Timeline',
    moved: 'Moved to Timeline.',
    saved: 'Captured.',
    close: 'Close',
  },
  es: {
    button: 'Captura rápida',
    eyebrow: 'Guarda ahora, organiza después',
    title: 'Captura rápida',
    placeholder: 'Escribe eso que no quieres olvidar...',
    save: 'Guardar captura',
    saving: 'Guardando...',
    empty: 'No tienes capturas pendientes.',
    recent: 'Capturas pendientes',
    loadError: 'No pudimos cargar tus capturas.',
    saveError: 'No pudimos guardar esta captura.',
    deleteError: 'No pudimos eliminar esta captura.',
    timelineError: 'No pudimos mover esta captura a Timeline.',
    required: 'Escribe algo antes de guardar.',
    deleteTitle: '¿Eliminar esta captura?',
    deleteText: 'Esta captura rápida se eliminará permanentemente.',
    deleteConfirm: 'Eliminar captura',
    toTimeline: 'Mover a Timeline',
    moved: 'Movida a Timeline.',
    saved: 'Capturado.',
    close: 'Cerrar',
  },
} as const

function titleFromContent(content: string) {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? content.trim()

  if (firstLine.length <= 80) {
    return firstLine
  }

  return `${firstLine.slice(0, 77).trimEnd()}...`
}

function QuickCapture({ language, campaignId }: QuickCaptureProps) {
  const t = copy[language]
  const confirmAction = useConfirm()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [captures, setCaptures] = useState<Capture[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadCaptures = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error: loadError } = await supabase
        .from('quick_captures')
        .select('id, campaign_id, created_by, content, created_at, updated_at')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (loadError) {
        throw loadError
      }

      setCaptures((data ?? []) as Capture[])
    } catch (loadError) {
      console.error('Error al cargar capturas rápidas:', loadError)
      setError(t.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    void loadCaptures()
  }, [open, campaignId])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const value = content.trim()

    if (!value) {
      setError(t.required)
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw authError ?? new Error('Missing authenticated user')
      }

      const { data, error: saveError } = await supabase
        .from('quick_captures')
        .insert({
          campaign_id: campaignId,
          created_by: authData.user.id,
          content: value,
        })
        .select('id, campaign_id, created_by, content, created_at, updated_at')
        .single()

      if (saveError) {
        throw saveError
      }

      setCaptures((current) => [data as Capture, ...current])
      setContent('')
      setMessage(t.saved)
    } catch (saveError) {
      console.error('Error al guardar captura rápida:', saveError)
      setError(t.saveError)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (capture: Capture) => {
    const confirmed = await confirmAction({
      title: t.deleteTitle,
      message: t.deleteText,
      confirmLabel: t.deleteConfirm,
      cancelLabel: t.close,
      variant: 'danger',
    })

    if (!confirmed) {
      return
    }

    setWorkingId(capture.id)
    setError('')
    setMessage('')

    try {
      const { error: deleteError } = await supabase
        .from('quick_captures')
        .delete()
        .eq('id', capture.id)
        .eq('campaign_id', campaignId)

      if (deleteError) {
        throw deleteError
      }

      setCaptures((current) => current.filter((item) => item.id !== capture.id))
    } catch (deleteError) {
      console.error('Error al eliminar captura rápida:', deleteError)
      setError(t.deleteError)
    } finally {
      setWorkingId(null)
    }
  }

  const handleMoveToTimeline = async (capture: Capture) => {
    setWorkingId(capture.id)
    setError('')
    setMessage('')

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        throw authError ?? new Error('Missing authenticated user')
      }

      const { error: timelineError } = await supabase
        .from('timeline_events')
        .insert({
          campaign_id: campaignId,
          created_by: authData.user.id,
          title: titleFromContent(capture.content),
          description: capture.content,
          event_type: 'event',
        })

      if (timelineError) {
        throw timelineError
      }

      const { error: deleteError } = await supabase
        .from('quick_captures')
        .delete()
        .eq('id', capture.id)
        .eq('campaign_id', campaignId)

      if (deleteError) {
        throw deleteError
      }

      setCaptures((current) => current.filter((item) => item.id !== capture.id))
      setMessage(t.moved)
    } catch (timelineError) {
      console.error('Error al mover captura a Timeline:', timelineError)
      setError(t.timelineError)
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <>
      <button
        type="button"
        className="quick-capture-fab"
        data-tour="quick-capture-fab"
        onClick={() => setOpen(true)}
        aria-label={t.button}
      >
        <LuPlus />
        <span>{t.button}</span>
      </button>

      {open && (
        <div
          className="quick-capture-backdrop"
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <aside
            className="quick-capture-panel"
            data-tour="quick-capture-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="quick-capture-heading">
              <div>
                <p>{t.eyebrow}</p>
                <h2>{t.title}</h2>
              </div>

              <button
                type="button"
                className="quick-capture-close"
                onClick={() => setOpen(false)}
                aria-label={t.close}
              >
                <LuX />
              </button>
            </div>

            <form className="quick-capture-form" onSubmit={handleSave}>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={t.placeholder}
                autoFocus
                maxLength={4000}
              />

              <button type="submit" disabled={saving}>
                <LuSave />
                {saving ? t.saving : t.save}
              </button>
            </form>

            {error && <div className="quick-capture-message quick-capture-error">{error}</div>}
            {message && (
              <div className="quick-capture-message quick-capture-success">
                <LuCheck />
                {message}
              </div>
            )}

            <div className="quick-capture-list-heading">
              <LuNotebookPen />
              <span>{t.recent}</span>
            </div>

            <div className="quick-capture-list">
              {loading ? (
                <div className="quick-capture-empty">...</div>
              ) : captures.length === 0 ? (
                <div className="quick-capture-empty">{t.empty}</div>
              ) : (
                captures.map((capture) => (
                  <article key={capture.id} className="quick-capture-card">
                    <p>{capture.content}</p>

                    <div className="quick-capture-card-actions">
                      <button
                        type="button"
                        onClick={() => void handleMoveToTimeline(capture)}
                        disabled={workingId === capture.id}
                      >
                        <LuArrowRight />
                        {t.toTimeline}
                      </button>

                      <button
                        type="button"
                        className="quick-capture-delete"
                        onClick={() => void handleDelete(capture)}
                        disabled={workingId === capture.id}
                        aria-label={t.deleteConfirm}
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

export default QuickCapture
