import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  LuCalendarDays,
  LuClock3,
  LuPencil,
  LuPlus,
  LuSave,
  LuTrash2,
  LuX,
} from 'react-icons/lu'

import { useConfirm } from './ConfirmProvider'
import { supabase } from '../utils/supabase'

type Language = 'en' | 'es'
type CampaignRole = 'gm' | 'co_gm' | 'player'
type EventType =
  | 'event'
  | 'discovery'
  | 'travel'
  | 'combat'
  | 'social'
  | 'quest'
  | 'rest'
  | 'other'
type DurationUnit =
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years'

interface TimelineSectionProps {
  language: Language
  campaignId: string
  campaignRole: CampaignRole | null
}

interface SessionOption {
  id: string
  session_number: number
  title: string
}

interface TimelineEvent {
  id: string
  campaign_id: string
  created_by: string
  session_id: string | null
  title: string
  description: string | null
  event_type: EventType
  calendar_date: string | null
  campaign_year: number | null
  campaign_month: number | null
  campaign_week: number | null
  campaign_day: number | null
  campaign_hour: number | null
  campaign_minute: number | null
  time_label: string | null
  duration_value: number | null
  duration_unit: DurationUnit | null
  sort_order: number | null
  created_at: string
  updated_at: string
}

interface EventForm {
  title: string
  description: string
  eventType: EventType
  calendarDate: string
  campaignYear: string
  campaignMonth: string
  campaignWeek: string
  campaignDay: string
  campaignHour: string
  campaignMinute: string
  timeLabel: string
  durationValue: string
  durationUnit: DurationUnit | ''
  sessionId: string
}

const emptyForm: EventForm = {
  title: '',
  description: '',
  eventType: 'event',
  calendarDate: '',
  campaignYear: '',
  campaignMonth: '',
  campaignWeek: '',
  campaignDay: '',
  campaignHour: '',
  campaignMinute: '',
  timeLabel: '',
  durationValue: '',
  durationUnit: '',
  sessionId: '',
}

const copy = {
  en: {
    eyebrow: 'Campaign chronology',
    title: 'Timeline',
    description: 'Keep the important moments of the story in order. Dates and campaign time are always optional.',
    newEvent: 'New event',
    emptyTitle: 'The chronicle has not begun yet',
    emptyText: 'Add the first important event, discovery, journey or turning point of the campaign.',
    loading: 'Loading timeline...',
    loadError: 'We could not load the timeline.',
    createTitle: 'Add timeline event',
    editTitle: 'Edit timeline event',
    titleLabel: 'Title',
    titlePlaceholder: 'The party leaves for the Frozen Sea...',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'What happened?',
    typeLabel: 'Type',
    calendarDate: 'Date / calendar reference',
    calendarPlaceholder: '3 Eleasis, 1492 DR',
    campaignTime: 'Campaign time',
    campaignTimeHelp: 'Use only the fields your group tracks. You can leave all of them empty.',
    year: 'Year',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    hour: 'Hour',
    minute: 'Minute',
    timeLabel: 'Free time reference',
    timeLabelPlaceholder: 'Three days after the battle...',
    duration: 'Duration',
    durationValue: 'Amount',
    durationUnit: 'Unit',
    relatedSession: 'Related session',
    noSession: 'No related session',
    cancel: 'Cancel',
    save: 'Save event',
    saving: 'Saving...',
    required: 'Give the event a title.',
    durationIncomplete: 'Complete both the duration amount and unit, or leave both empty.',
    saveError: 'We could not save the event.',
    deleteError: 'We could not delete the event.',
    deleteTitle: 'Delete timeline event?',
    deleteText: 'This event will be permanently removed from the campaign timeline.',
    deleteConfirm: 'Delete event',
    edit: 'Edit',
    remove: 'Delete',
    date: 'Date',
    durationWord: 'Duration',
    session: 'Session',
    types: {
      event: 'Event', discovery: 'Discovery', travel: 'Travel', combat: 'Combat',
      social: 'Social', quest: 'Quest', rest: 'Rest', other: 'Other',
    },
    units: {
      minutes: 'minutes', hours: 'hours', days: 'days', weeks: 'weeks',
      months: 'months', years: 'years',
    },
  },
  es: {
    eyebrow: 'Cronología de campaña',
    title: 'Timeline',
    description: 'Mantén en orden los momentos importantes de la historia. Las fechas y el tiempo de campaña son siempre opcionales.',
    newEvent: 'Nuevo evento',
    emptyTitle: 'La crónica aún no ha comenzado',
    emptyText: 'Agrega el primer evento importante, descubrimiento, viaje o punto de inflexión de la campaña.',
    loading: 'Cargando timeline...',
    loadError: 'No pudimos cargar la timeline.',
    createTitle: 'Agregar evento a la timeline',
    editTitle: 'Editar evento de la timeline',
    titleLabel: 'Título',
    titlePlaceholder: 'El grupo parte hacia el Mar Helado...',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: '¿Qué ocurrió?',
    typeLabel: 'Tipo',
    calendarDate: 'Fecha / referencia de calendario',
    calendarPlaceholder: '3 de Eleasis, 1492 DR',
    campaignTime: 'Tiempo de campaña',
    campaignTimeHelp: 'Usa solo los campos que lleve tu grupo. Puedes dejarlos todos vacíos.',
    year: 'Año',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    hour: 'Hora',
    minute: 'Minuto',
    timeLabel: 'Referencia temporal libre',
    timeLabelPlaceholder: 'Tres días después de la batalla...',
    duration: 'Duración',
    durationValue: 'Cantidad',
    durationUnit: 'Unidad',
    relatedSession: 'Sesión relacionada',
    noSession: 'Sin sesión relacionada',
    cancel: 'Cancelar',
    save: 'Guardar evento',
    saving: 'Guardando...',
    required: 'Pon un título al evento.',
    durationIncomplete: 'Completa la cantidad y la unidad de duración, o deja ambas vacías.',
    saveError: 'No pudimos guardar el evento.',
    deleteError: 'No pudimos eliminar el evento.',
    deleteTitle: '¿Eliminar evento de la timeline?',
    deleteText: 'Este evento se eliminará permanentemente de la cronología de la campaña.',
    deleteConfirm: 'Eliminar evento',
    edit: 'Editar',
    remove: 'Eliminar',
    date: 'Fecha',
    durationWord: 'Duración',
    session: 'Sesión',
    types: {
      event: 'Evento', discovery: 'Descubrimiento', travel: 'Viaje', combat: 'Combate',
      social: 'Social', quest: 'Misión', rest: 'Descanso', other: 'Otro',
    },
    units: {
      minutes: 'minutos', hours: 'horas', days: 'días', weeks: 'semanas',
      months: 'meses', years: 'años',
    },
  },
}

const eventTypes: EventType[] = ['event', 'discovery', 'travel', 'combat', 'social', 'quest', 'rest', 'other']
const durationUnits: DurationUnit[] = ['minutes', 'hours', 'days', 'weeks', 'months', 'years']

const optionalNumber = (value: string) => value.trim() === '' ? null : Number(value)
const cleanText = (value: string) => value.trim() || null

function TimelineSection({ language, campaignId, campaignRole }: TimelineSectionProps) {
  const t = copy[language]
  const confirmAction = useConfirm()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EventForm>(emptyForm)

  const isStaff = campaignRole === 'gm' || campaignRole === 'co_gm'

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      const [{ data: authData }, eventsResult, sessionsResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('timeline_events')
          .select('*')
          .eq('campaign_id', campaignId)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true }),
        supabase
          .from('sessions')
          .select('id, session_number, title')
          .eq('campaign_id', campaignId)
          .order('session_number', { ascending: true }),
      ])

      if (cancelled) return

      if (eventsResult.error) {
        console.error('Timeline load error:', eventsResult.error)
        setError(t.loadError)
      } else {
        setEvents((eventsResult.data ?? []) as TimelineEvent[])
      }

      if (!sessionsResult.error) {
        setSessions((sessionsResult.data ?? []) as SessionOption[])
      }

      setUserId(authData.user?.id ?? null)
      setLoading(false)
    }

    void load()
    return () => { cancelled = true }
  }, [campaignId, t.loadError])

  const sessionNames = useMemo(() => new Map(sessions.map(session => [session.id, session])), [sessions])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setEditorOpen(true)
  }

  const openEdit = (event: TimelineEvent) => {
    setEditingId(event.id)
    setForm({
      title: event.title,
      description: event.description ?? '',
      eventType: event.event_type,
      calendarDate: event.calendar_date ?? '',
      campaignYear: event.campaign_year?.toString() ?? '',
      campaignMonth: event.campaign_month?.toString() ?? '',
      campaignWeek: event.campaign_week?.toString() ?? '',
      campaignDay: event.campaign_day?.toString() ?? '',
      campaignHour: event.campaign_hour?.toString() ?? '',
      campaignMinute: event.campaign_minute?.toString() ?? '',
      timeLabel: event.time_label ?? '',
      durationValue: event.duration_value?.toString() ?? '',
      durationUnit: event.duration_unit ?? '',
      sessionId: event.session_id ?? '',
    })
    setError('')
    setEditorOpen(true)
  }

  const closeEditor = () => {
    if (saving) return
    setEditorOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const saveEvent = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError(t.required)
      return
    }

    const hasDurationValue = form.durationValue.trim() !== ''
    const hasDurationUnit = form.durationUnit !== ''
    if (hasDurationValue !== hasDurationUnit) {
      setError(t.durationIncomplete)
      return
    }

    if (!userId) {
      setError(t.saveError)
      return
    }

    setSaving(true)

    const payload = {
      campaign_id: campaignId,
      title: form.title.trim(),
      description: cleanText(form.description),
      event_type: form.eventType,
      calendar_date: cleanText(form.calendarDate),
      campaign_year: optionalNumber(form.campaignYear),
      campaign_month: optionalNumber(form.campaignMonth),
      campaign_week: optionalNumber(form.campaignWeek),
      campaign_day: optionalNumber(form.campaignDay),
      campaign_hour: optionalNumber(form.campaignHour),
      campaign_minute: optionalNumber(form.campaignMinute),
      time_label: cleanText(form.timeLabel),
      duration_value: optionalNumber(form.durationValue),
      duration_unit: form.durationUnit || null,
      session_id: form.sessionId || null,
      updated_at: new Date().toISOString(),
    }

    const result = editingId
      ? await supabase
          .from('timeline_events')
          .update(payload)
          .eq('id', editingId)
          .select('*')
          .single()
      : await supabase
          .from('timeline_events')
          .insert({ ...payload, created_by: userId, sort_order: events.length })
          .select('*')
          .single()

    setSaving(false)

    if (result.error || !result.data) {
      console.error('Timeline save error:', result.error)
      setError(t.saveError)
      return
    }

    const saved = result.data as TimelineEvent
    setEvents(current => editingId
      ? current.map(item => item.id === saved.id ? saved : item)
      : [...current, saved])
    closeEditor()
  }

  const deleteEvent = async (timelineEvent: TimelineEvent) => {
    const accepted = await confirmAction({
      title: t.deleteTitle,
      message: t.deleteText,
      confirmLabel: t.deleteConfirm,
      cancelLabel: t.cancel,
      variant: 'danger',
    })

    if (!accepted) return

    const { error: deleteError } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', timelineEvent.id)

    if (deleteError) {
      console.error('Timeline delete error:', deleteError)
      setError(t.deleteError)
      return
    }

    setEvents(current => current.filter(item => item.id !== timelineEvent.id))
  }

  const campaignTime = (event: TimelineEvent) => {
    const parts: string[] = []
    if (event.campaign_year !== null) parts.push(`${t.year} ${event.campaign_year}`)
    if (event.campaign_month !== null) parts.push(`${t.month} ${event.campaign_month}`)
    if (event.campaign_week !== null) parts.push(`${t.week} ${event.campaign_week}`)
    if (event.campaign_day !== null) parts.push(`${t.day} ${event.campaign_day}`)
    if (event.campaign_hour !== null) {
      const minute = event.campaign_minute ?? 0
      parts.push(`${String(event.campaign_hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
    } else if (event.campaign_minute !== null) {
      parts.push(`${t.minute} ${event.campaign_minute}`)
    }
    return parts.join(' · ')
  }

  return (
    <section className="campaign-timeline">
      <div className="timeline-header">
        <div>
          <p className="timeline-eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <p className="timeline-description">{t.description}</p>
        </div>
        <button type="button" className="timeline-new-button" onClick={openCreate}>
          <LuPlus />
          <span>{t.newEvent}</span>
        </button>
      </div>

      {error && !editorOpen && <div className="timeline-message timeline-message-error">{error}</div>}

      {editorOpen && (
        <form className="timeline-editor" onSubmit={saveEvent}>
          <div className="timeline-editor-heading">
            <div>
              <p>{t.eyebrow}</p>
              <h3>{editingId ? t.editTitle : t.createTitle}</h3>
            </div>
            <button type="button" className="timeline-editor-close" onClick={closeEditor} aria-label={t.cancel}>
              <LuX />
            </button>
          </div>

          {error && <div className="timeline-editor-message timeline-message-error">{error}</div>}

          <div className="timeline-editor-grid">
            <label className="timeline-editor-full">
              <span>{t.titleLabel}</span>
              <input value={form.title} onChange={e => setForm(current => ({ ...current, title: e.target.value }))} placeholder={t.titlePlaceholder} maxLength={180} autoFocus />
            </label>

            <label>
              <span>{t.typeLabel}</span>
              <select value={form.eventType} onChange={e => setForm(current => ({ ...current, eventType: e.target.value as EventType }))}>
                {eventTypes.map(type => <option key={type} value={type}>{t.types[type]}</option>)}
              </select>
            </label>

            <label>
              <span>{t.relatedSession}</span>
              <select value={form.sessionId} onChange={e => setForm(current => ({ ...current, sessionId: e.target.value }))}>
                <option value="">{t.noSession}</option>
                {sessions.map(session => <option key={session.id} value={session.id}>#{session.session_number} · {session.title}</option>)}
              </select>
            </label>

            <label className="timeline-editor-full">
              <span>{t.descriptionLabel}</span>
              <textarea value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} placeholder={t.descriptionPlaceholder} maxLength={5000} />
            </label>

            <div className="timeline-time-panel timeline-editor-full">
              <div className="timeline-time-panel-heading">
                <LuCalendarDays />
                <div><strong>{t.campaignTime}</strong><span>{t.campaignTimeHelp}</span></div>
              </div>

              <div className="timeline-time-grid">
                <label className="timeline-time-wide"><span>{t.calendarDate}</span><input value={form.calendarDate} onChange={e => setForm(current => ({ ...current, calendarDate: e.target.value }))} placeholder={t.calendarPlaceholder} maxLength={120} /></label>
                <label><span>{t.year}</span><input type="number" min="0" value={form.campaignYear} onChange={e => setForm(current => ({ ...current, campaignYear: e.target.value }))} /></label>
                <label><span>{t.month}</span><input type="number" min="0" value={form.campaignMonth} onChange={e => setForm(current => ({ ...current, campaignMonth: e.target.value }))} /></label>
                <label><span>{t.week}</span><input type="number" min="0" value={form.campaignWeek} onChange={e => setForm(current => ({ ...current, campaignWeek: e.target.value }))} /></label>
                <label><span>{t.day}</span><input type="number" min="0" value={form.campaignDay} onChange={e => setForm(current => ({ ...current, campaignDay: e.target.value }))} /></label>
                <label><span>{t.hour}</span><input type="number" min="0" max="23" value={form.campaignHour} onChange={e => setForm(current => ({ ...current, campaignHour: e.target.value }))} /></label>
                <label><span>{t.minute}</span><input type="number" min="0" max="59" value={form.campaignMinute} onChange={e => setForm(current => ({ ...current, campaignMinute: e.target.value }))} /></label>
                <label className="timeline-time-wide"><span>{t.timeLabel}</span><input value={form.timeLabel} onChange={e => setForm(current => ({ ...current, timeLabel: e.target.value }))} placeholder={t.timeLabelPlaceholder} maxLength={180} /></label>
              </div>
            </div>

            <div className="timeline-duration-panel timeline-editor-full">
              <div className="timeline-duration-heading"><LuClock3 /><strong>{t.duration}</strong></div>
              <div className="timeline-duration-fields">
                <label><span>{t.durationValue}</span><input type="number" min="0.01" step="any" value={form.durationValue} onChange={e => setForm(current => ({ ...current, durationValue: e.target.value }))} /></label>
                <label><span>{t.durationUnit}</span><select value={form.durationUnit} onChange={e => setForm(current => ({ ...current, durationUnit: e.target.value as DurationUnit | '' }))}><option value="">—</option>{durationUnits.map(unit => <option key={unit} value={unit}>{t.units[unit]}</option>)}</select></label>
              </div>
            </div>
          </div>

          <div className="timeline-editor-actions">
            <button type="button" className="timeline-cancel-button" onClick={closeEditor} disabled={saving}>{t.cancel}</button>
            <button type="submit" className="timeline-save-button" disabled={saving}><LuSave /><span>{saving ? t.saving : t.save}</span></button>
          </div>
        </form>
      )}

      {!editorOpen && loading && <div className="timeline-loading">{t.loading}</div>}

      {!editorOpen && !loading && events.length === 0 && (
        <div className="timeline-empty">
          <LuClock3 />
          <h3>{t.emptyTitle}</h3>
          <p>{t.emptyText}</p>
          <button type="button" onClick={openCreate}><LuPlus />{t.newEvent}</button>
        </div>
      )}

      {!editorOpen && !loading && events.length > 0 && (
        <div className="timeline-list">
          {events.map(event => {
            const time = campaignTime(event)
            const session = event.session_id ? sessionNames.get(event.session_id) : null
            const canManage = isStaff || event.created_by === userId
            return (
              <article className="timeline-entry" key={event.id}>
                <div className="timeline-entry-rail"><span /></div>
                <div className="timeline-entry-card">
                  <div className="timeline-entry-top">
                    <div className="timeline-entry-meta">
                      <span className={`timeline-type timeline-type-${event.event_type}`}>{t.types[event.event_type]}</span>
                      {event.calendar_date && <span><LuCalendarDays />{event.calendar_date}</span>}
                      {time && <span><LuClock3 />{time}</span>}
                    </div>
                    {canManage && <div className="timeline-entry-actions"><button type="button" onClick={() => openEdit(event)} title={t.edit} aria-label={t.edit}><LuPencil /></button><button type="button" className="timeline-delete-button" onClick={() => void deleteEvent(event)} title={t.remove} aria-label={t.remove}><LuTrash2 /></button></div>}
                  </div>
                  <h3>{event.title}</h3>
                  {event.description && <p>{event.description}</p>}
                  {(event.time_label || event.duration_value || session) && <div className="timeline-entry-details">
                    {event.time_label && <span>{event.time_label}</span>}
                    {event.duration_value && event.duration_unit && <span><strong>{t.durationWord}:</strong> {event.duration_value} {t.units[event.duration_unit]}</span>}
                    {session && <span><strong>{t.session}:</strong> #{session.session_number} · {session.title}</span>}
                  </div>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default TimelineSection
