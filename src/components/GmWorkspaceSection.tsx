import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  LuCalendarCheck,
  LuEye,
  LuEyeOff,
  LuFilePenLine,
  LuLightbulb,
  LuListTodo,
  LuMapPin,
  LuMonitor,
  LuPlus,
  LuSave,
  LuScrollText,
  LuShield,
  LuTarget,
  LuTrash2,
  LuUsers,
  LuX,
} from 'react-icons/lu'
import { useConfirm } from './ConfirmProvider'
import { supabase } from '../utils/supabase'

type Language = 'en' | 'es'
type ToolKind = 'session_planner' | 'secret' | 'clue' | 'plot_thread'
type ToolView = ToolKind | 'gm_screen'
type EntityKind = 'characters' | 'npcs' | 'locations' | 'factions'

interface Props {
  language: Language
  campaignId: string
  view: ToolView
}

interface Entry {
  id: string
  campaign_id: string
  kind: ToolKind
  title: string
  content: string | null
  status: string
  session_date: string | null
  details: Record<string, unknown> | null
  created_at: string
}

interface EntityOption {
  id: string
  name: string
  kind: EntityKind
  meta?: string | null
}

interface PlannerDetails {
  objective: string
  opening: string
  scenes: string
  complications: string
  notes: string
  characters: string[]
  npcs: string[]
  locations: string[]
  factions: string[]
  secrets: string[]
  clues: string[]
  threads: string[]
}

interface FormState {
  title: string
  content: string
  status: string
  sessionDate: string
  related: string
  planner: PlannerDetails
  entityLinks: Record<EntityKind, string[]>
}

const emptyPlanner = (): PlannerDetails => ({
  objective: '',
  opening: '',
  scenes: '',
  complications: '',
  notes: '',
  characters: [],
  npcs: [],
  locations: [],
  factions: [],
  secrets: [],
  clues: [],
  threads: [],
})

const copy = {
  en: {
    session_planner: ['Session Planner', 'Build the next session around scenes, people, places, clues and unresolved threads.', 'New plan'],
    secret: ['Secrets', 'Keep campaign truths private until the right moment.', 'New secret'],
    clue: ['Clue Tracker', 'Track what the party has discovered and what is still waiting.', 'New clue'],
    plot_thread: ['Plot Threads', 'Keep long-running stories visible, even months later.', 'New thread'],
    gm_screen: ['GM Screen', 'Run the session from one private view built from your preparation.', ''],
    title: 'Title',
    content: 'Details',
    related: 'Private notes / context',
    date: 'Planned date',
    status: 'Status',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    del: 'Delete',
    loading: 'Loading GM tools...',
    empty: 'Nothing here yet.',
    titleReq: 'Give this entry a title before saving.',
    loadErr: 'We could not load the GM tools.',
    saveErr: 'We could not save this entry.',
    deleteConfirm: 'Delete this entry? This cannot be undone.',
    convert: 'Finish & create Session',
    converted: 'Session created from this plan.',
    convertErr: 'We could not create the session.',
    screenEmpty: 'Create a session plan and connect it to clues, secrets and plot threads to build your live GM Screen.',
    quickHint: 'Quick Capture remains available from the floating button for anything unexpected.',
    activeSession: 'Current session plan',
    clues: 'Clues',
    secrets: 'Secrets',
    threads: 'Plot threads',
    people: 'People',
    places: 'Places',
    factions: 'Factions',
    objective: 'Session objective',
    objectivePlaceholder: 'What should move forward by the end of this session?',
    opening: 'Opening / recap',
    openingPlaceholder: 'How does the session begin? What do you want to remind the table?',
    scenes: 'Planned scenes',
    scenesPlaceholder: 'One scene per line, or a loose sequence of beats...',
    complications: 'Possible complications',
    complicationsPlaceholder: 'What could change if the party goes off-script?',
    gmNotes: 'GM-only notes',
    gmNotesPlaceholder: 'Names, improvised details, reminders, rulings to revisit...',
    linkCampaign: 'Connect campaign entities',
    linkGmTools: 'Connect GM tools',
    characters: 'Characters',
    npcs: 'NPCs',
    locations: 'Locations',
    noOptions: 'Nothing available yet.',
    selectPlan: 'Session on screen',
    unplanned: 'Unlinked active items',
    planOverview: 'At the table',
    markDiscovered: 'Mark discovered',
    markRevealed: 'Reveal',
    markResolved: 'Resolve',
    linked: 'Linked to this plan',
    legacyRelated: 'Additional context',
  },
  es: {
    session_planner: ['Planificador de sesión', 'Armá la próxima sesión alrededor de escenas, personas, lugares, pistas y tramas pendientes.', 'Nuevo plan'],
    secret: ['Secretos', 'Guardá las verdades de la campaña en privado hasta el momento indicado.', 'Nuevo secreto'],
    clue: ['Rastreador de pistas', 'Controlá qué descubrió el grupo y qué sigue esperando.', 'Nueva pista'],
    plot_thread: ['Hilos argumentales', 'Mantené visibles las tramas largas, incluso meses después.', 'Nuevo hilo'],
    gm_screen: ['Pantalla del GM', 'Dirigí la sesión desde una sola vista privada construida con tu preparación.', ''],
    title: 'Título',
    content: 'Detalles',
    related: 'Notas privadas / contexto',
    date: 'Fecha prevista',
    status: 'Estado',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    del: 'Eliminar',
    loading: 'Cargando herramientas del GM...',
    empty: 'Todavía no hay nada acá.',
    titleReq: 'Poné un título antes de guardar.',
    loadErr: 'No pudimos cargar las herramientas del GM.',
    saveErr: 'No pudimos guardar esta entrada.',
    deleteConfirm: '¿Eliminar esta entrada? Esta acción no se puede deshacer.',
    convert: 'Finalizar y crear Sesión',
    converted: 'Sesión creada a partir del plan.',
    convertErr: 'No pudimos crear la sesión.',
    screenEmpty: 'Creá un plan de sesión y conectalo con pistas, secretos e hilos argumentales para armar tu Pantalla del GM.',
    quickHint: 'Quick Capture sigue disponible desde el botón flotante para todo lo inesperado.',
    activeSession: 'Plan de sesión actual',
    clues: 'Pistas',
    secrets: 'Secretos',
    threads: 'Hilos argumentales',
    people: 'Personas',
    places: 'Lugares',
    factions: 'Facciones',
    objective: 'Objetivo de la sesión',
    objectivePlaceholder: '¿Qué debería avanzar antes de terminar esta sesión?',
    opening: 'Inicio / recap',
    openingPlaceholder: '¿Cómo empieza la sesión? ¿Qué querés recordarle a la mesa?',
    scenes: 'Escenas previstas',
    scenesPlaceholder: 'Una escena por línea, o una secuencia flexible de momentos...',
    complications: 'Posibles complicaciones',
    complicationsPlaceholder: '¿Qué puede cambiar si la party se sale de lo previsto?',
    gmNotes: 'Notas solo para GM',
    gmNotesPlaceholder: 'Nombres, detalles improvisados, recordatorios, reglas para revisar...',
    linkCampaign: 'Conectar entidades de campaña',
    linkGmTools: 'Conectar herramientas de GM',
    characters: 'Personajes',
    npcs: 'NPCs',
    locations: 'Lugares',
    noOptions: 'Todavía no hay nada disponible.',
    selectPlan: 'Sesión en pantalla',
    unplanned: 'Activos no vinculados',
    planOverview: 'En la mesa',
    markDiscovered: 'Marcar descubierta',
    markRevealed: 'Revelar',
    markResolved: 'Resolver',
    linked: 'Vinculado a este plan',
    legacyRelated: 'Contexto adicional',
  },
} as const

const statuses: Record<ToolKind, string[]> = {
  session_planner: ['draft', 'ready', 'completed'],
  secret: ['hidden', 'revealed'],
  clue: ['undiscovered', 'discovered'],
  plot_thread: ['active', 'dormant', 'resolved', 'abandoned'],
}

const labels: Record<Language, Record<string, string>> = {
  en: {
    draft: 'Draft', ready: 'Ready', completed: 'Completed', hidden: 'Hidden', revealed: 'Revealed',
    undiscovered: 'Undiscovered', discovered: 'Discovered', active: 'Active', dormant: 'Dormant',
    resolved: 'Resolved', abandoned: 'Abandoned',
  },
  es: {
    draft: 'Borrador', ready: 'Lista', completed: 'Completada', hidden: 'Oculto', revealed: 'Revelado',
    undiscovered: 'No descubierta', discovered: 'Descubierta', active: 'Activo', dormant: 'Dormido',
    resolved: 'Resuelto', abandoned: 'Abandonado',
  },
}

const stringArray = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
const stringValue = (value: unknown): string => typeof value === 'string' ? value : ''

const plannerFromEntry = (entry?: Entry | null): PlannerDetails => {
  if (!entry?.details) return emptyPlanner()
  const details = entry.details
  return {
    objective: stringValue(details.objective),
    opening: stringValue(details.opening),
    scenes: stringValue(details.scenes),
    complications: stringValue(details.complications),
    notes: stringValue(details.notes),
    characters: stringArray(details.characters),
    npcs: stringArray(details.npcs),
    locations: stringArray(details.locations),
    factions: stringArray(details.factions),
    secrets: stringArray(details.secrets),
    clues: stringArray(details.clues),
    threads: stringArray(details.threads),
  }
}

const entityLinksFromEntry = (entry?: Entry | null): Record<EntityKind, string[]> => ({
  characters: stringArray(entry?.details?.characters),
  npcs: stringArray(entry?.details?.npcs),
  locations: stringArray(entry?.details?.locations),
  factions: stringArray(entry?.details?.factions),
})

const initial = (kind: ToolKind): FormState => ({
  title: '',
  content: '',
  status: statuses[kind][0],
  sessionDate: '',
  related: '',
  planner: emptyPlanner(),
  entityLinks: { characters: [], npcs: [], locations: [], factions: [] },
})

export default function GmWorkspaceSection({ language, campaignId, view }: Props) {
  const t = copy[language]
  const confirmAction = useConfirm()
  const [entries, setEntries] = useState<Entry[]>([])
  const [allGmEntries, setAllGmEntries] = useState<Entry[]>([])
  const [entities, setEntities] = useState<EntityOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const kind: ToolKind = view === 'gm_screen' ? 'session_planner' : view
  const [form, setForm] = useState<FormState>(() => initial(kind))
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    const [gmResult, characters, npcs, locations, factions] = await Promise.all([
      supabase.from('gm_tool_entries').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }),
      supabase.from('characters').select('id,name,class_or_archetype').eq('campaign_id', campaignId).order('name'),
      supabase.from('npcs').select('id,name,role').eq('campaign_id', campaignId).order('name'),
      supabase.from('locations').select('id,name,location_type').eq('campaign_id', campaignId).order('name'),
      supabase.from('organizations').select('id,name,organization_type').eq('campaign_id', campaignId).order('name'),
    ])

    if (gmResult.error) {
      console.error(gmResult.error)
      setError(t.loadErr)
      setEntries([])
      setAllGmEntries([])
    } else {
      const loaded = (gmResult.data ?? []) as Entry[]
      setAllGmEntries(loaded)
      setEntries(view === 'gm_screen' ? loaded : loaded.filter(entry => entry.kind === view))
    }

    const entityErrors = [characters.error, npcs.error, locations.error, factions.error].filter(Boolean)
    if (entityErrors.length) console.warn('Some GM Planner entity links could not be loaded.', entityErrors)

    setEntities([
      ...(characters.data ?? []).map(row => ({ id: row.id, name: row.name, kind: 'characters' as const, meta: row.class_or_archetype })),
      ...(npcs.data ?? []).map(row => ({ id: row.id, name: row.name, kind: 'npcs' as const, meta: row.role })),
      ...(locations.data ?? []).map(row => ({ id: row.id, name: row.name, kind: 'locations' as const, meta: row.location_type })),
      ...(factions.data ?? []).map(row => ({ id: row.id, name: row.name, kind: 'factions' as const, meta: row.organization_type })),
    ])
    setLoading(false)
  }, [campaignId, t.loadErr, view])

  useEffect(() => { void load() }, [load])
  useEffect(() => { setForm(initial(kind)); setEditing(null); setOpen(false) }, [kind])

  const edit = (entry: Entry) => {
    setEditing(entry.id)
    setOpen(true)
    setError('')
    setSuccess('')
    setForm({
      title: entry.title,
      content: entry.content ?? '',
      status: entry.status,
      sessionDate: entry.session_date ?? '',
      related: stringValue(entry.details?.related),
      planner: plannerFromEntry(entry),
      entityLinks: entityLinksFromEntry(entry),
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError(t.titleReq)
      return
    }

    setError('')
    setSuccess('')

    const details = kind === 'session_planner'
      ? {
          related: form.related.trim(),
          ...form.planner,
        }
      : {
          related: form.related.trim(),
          ...form.entityLinks,
        }

    const payload = {
      campaign_id: campaignId,
      kind,
      title: form.title.trim(),
      content: form.content.trim() || null,
      status: form.status,
      session_date: form.sessionDate || null,
      details,
    }

    const result = editing
      ? await supabase.from('gm_tool_entries').update(payload).eq('id', editing)
      : await supabase.from('gm_tool_entries').insert(payload)

    if (result.error) {
      console.error(result.error)
      setError(t.saveErr)
      return
    }

    setOpen(false)
    setEditing(null)
    setForm(initial(kind))
    await load()
  }

  const remove = async (id: string) => {
    if (!(await confirmAction({ message: t.deleteConfirm, variant: 'danger' }))) return
    const { error: deleteError } = await supabase.from('gm_tool_entries').delete().eq('id', id)
    if (deleteError) setError(t.saveErr)
    else await load()
  }

  const setStatus = async (entry: Entry, status: string) => {
    const { error: updateError } = await supabase.from('gm_tool_entries').update({ status }).eq('id', entry.id)
    if (updateError) setError(t.saveErr)
    else await load()
  }

  const toggleStatus = async (entry: Entry) => {
    const list = statuses[entry.kind]
    const next = list[(list.indexOf(entry.status) + 1) % list.length]
    await setStatus(entry, next)
  }

  const convertPlan = async (entry: Entry) => {
    const details = plannerFromEntry(entry)
    const { data } = await supabase
      .from('sessions')
      .select('session_number')
      .eq('campaign_id', campaignId)
      .order('session_number', { ascending: false })
      .limit(1)

    const next = ((data?.[0]?.session_number as number | null) ?? 0) + 1
    const summaryParts = [details.objective, entry.content].filter(Boolean)
    const noteParts = [
      details.opening && `${language === 'es' ? 'Inicio / recap' : 'Opening / recap'}:\n${details.opening}`,
      details.scenes && `${language === 'es' ? 'Escenas previstas' : 'Planned scenes'}:\n${details.scenes}`,
      details.complications && `${language === 'es' ? 'Posibles complicaciones' : 'Possible complications'}:\n${details.complications}`,
      details.notes,
      stringValue(entry.details?.related),
    ].filter(Boolean)

    const { error: sessionError } = await supabase.from('sessions').insert({
      campaign_id: campaignId,
      session_number: next,
      title: entry.title,
      session_date: entry.session_date,
      summary: summaryParts.join('\n\n') || null,
      notes: noteParts.join('\n\n') || null,
    })

    if (sessionError) {
      console.error(sessionError)
      setError(t.convertErr)
      return
    }

    await supabase.from('gm_tool_entries').update({ status: 'completed' }).eq('id', entry.id)
    setSuccess(t.converted)
    await load()
  }

  if (view === 'gm_screen') {
    return (
      <GmScreen
        language={language}
        entries={entries}
        entities={entities}
        loading={loading}
        error={error}
        onSetStatus={setStatus}
      />
    )
  }

  const meta = t[view]
  const toolEntries = {
    secrets: allGmEntries.filter(entry => entry.kind === 'secret' && entry.status !== 'revealed'),
    clues: allGmEntries.filter(entry => entry.kind === 'clue' && entry.status !== 'discovered'),
    threads: allGmEntries.filter(entry => entry.kind === 'plot_thread' && !['resolved', 'abandoned'].includes(entry.status)),
  }

  return (
    <section className="gm-workspace">
      <header className="gm-tool-header">
        <div>
          <span className="section-eyebrow">GM TOOLS · PRIVATE</span>
          <h2>{meta[0]}</h2>
          <p>{meta[1]}</p>
        </div>
        <button
          className="gm-new-entry-button"
          type="button"
          onClick={() => {
            setEditing(null)
            setForm(initial(kind))
            setOpen(true)
          }}
        >
          <LuPlus aria-hidden="true" />
          <span>{meta[2]}</span>
        </button>
      </header>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      {open && (
        <form className="gm-tool-editor" onSubmit={submit}>
          <div className="gm-editor-top">
            <h3>{editing ? t.edit : meta[2]}</h3>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.cancel}><LuX /></button>
          </div>

          <div className="gm-editor-grid gm-editor-grid-primary">
            <label>
              <span>{t.title}</span>
              <input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} autoFocus />
            </label>
            {kind === 'session_planner' && (
              <label>
                <span>{t.date}</span>
                <input type="date" value={form.sessionDate} onChange={event => setForm({ ...form, sessionDate: event.target.value })} />
              </label>
            )}
            <label>
              <span>{t.status}</span>
              <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}>
                {statuses[kind].map(status => <option key={status} value={status}>{labels[language][status]}</option>)}
              </select>
            </label>
          </div>

          {kind === 'session_planner' ? (
            <SessionPlannerEditor
              language={language}
              form={form}
              setForm={setForm}
              entities={entities}
              secrets={toolEntries.secrets}
              clues={toolEntries.clues}
              threads={toolEntries.threads}
            />
          ) : (
            <>
              <label>
                <span>{t.content}</span>
                <textarea rows={6} value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} />
              </label>
              <label>
                <span>{t.related}</span>
                <textarea rows={3} value={form.related} onChange={event => setForm({ ...form, related: event.target.value })} />
              </label>
              <EntityLinkEditor language={language} entities={entities} links={form.entityLinks} onChange={entityLinks => setForm({ ...form, entityLinks })} />
            </>
          )}

          <div className="gm-editor-actions">
            <button type="button" className="gm-editor-button gm-editor-button-secondary" onClick={() => setOpen(false)}>{t.cancel}</button>
            <button type="submit" className="gm-editor-button gm-editor-button-primary"><LuSave aria-hidden="true" /><span>{t.save}</span></button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="section-state">{t.loading}</p>
      ) : entries.length === 0 ? (
        <div className="gm-empty"><LuScrollText /><h3>{t.empty}</h3></div>
      ) : (
        <div className="gm-entry-grid">
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              language={language}
              entities={entities}
              allEntries={allGmEntries}
              onEdit={edit}
              onDelete={remove}
              onToggle={toggleStatus}
              onConvert={convertPlan}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function SessionPlannerEditor({
  language,
  form,
  setForm,
  entities,
  secrets,
  clues,
  threads,
}: {
  language: Language
  form: FormState
  setForm: (form: FormState) => void
  entities: EntityOption[]
  secrets: Entry[]
  clues: Entry[]
  threads: Entry[]
}) {
  const t = copy[language]
  const updatePlanner = (patch: Partial<PlannerDetails>) => setForm({ ...form, planner: { ...form.planner, ...patch } })

  return (
    <>
      <div className="gm-planner-section">
        <div className="gm-planner-section-title"><LuTarget /><div><h4>{t.planOverview}</h4><p>{language === 'es' ? 'Definí la intención de la sesión sin convertir el plan en un guion rígido.' : 'Set the intention of the session without turning the plan into a rigid script.'}</p></div></div>
        <label>
          <span>{t.objective}</span>
          <textarea rows={3} value={form.planner.objective} placeholder={t.objectivePlaceholder} onChange={event => updatePlanner({ objective: event.target.value })} />
        </label>
        <label>
          <span>{t.opening}</span>
          <textarea rows={3} value={form.planner.opening} placeholder={t.openingPlaceholder} onChange={event => updatePlanner({ opening: event.target.value })} />
        </label>
        <label>
          <span>{t.scenes}</span>
          <textarea rows={6} value={form.planner.scenes} placeholder={t.scenesPlaceholder} onChange={event => updatePlanner({ scenes: event.target.value })} />
        </label>
        <label>
          <span>{t.complications}</span>
          <textarea rows={4} value={form.planner.complications} placeholder={t.complicationsPlaceholder} onChange={event => updatePlanner({ complications: event.target.value })} />
        </label>
        <label>
          <span>{t.gmNotes}</span>
          <textarea rows={4} value={form.planner.notes} placeholder={t.gmNotesPlaceholder} onChange={event => updatePlanner({ notes: event.target.value })} />
        </label>
      </div>

      <div className="gm-planner-section">
        <div className="gm-planner-section-title"><LuUsers /><div><h4>{t.linkCampaign}</h4><p>{language === 'es' ? 'Elegí qué elementos querés tener a mano durante esta sesión.' : 'Choose the campaign elements you want at hand during this session.'}</p></div></div>
        <div className="gm-link-columns">
          {(['characters', 'npcs', 'locations', 'factions'] as EntityKind[]).map(entityKind => (
            <LinkPicker
              key={entityKind}
              title={t[entityKind]}
              options={entities.filter(entity => entity.kind === entityKind).map(entity => ({ id: entity.id, title: entity.name, meta: entity.meta }))}
              selected={form.planner[entityKind]}
              empty={t.noOptions}
              onChange={ids => updatePlanner({ [entityKind]: ids } as Partial<PlannerDetails>)}
            />
          ))}
        </div>
      </div>

      <div className="gm-planner-section">
        <div className="gm-planner-section-title"><LuLightbulb /><div><h4>{t.linkGmTools}</h4><p>{language === 'es' ? 'Estas conexiones alimentan automáticamente la Pantalla del GM.' : 'These connections automatically feed the GM Screen.'}</p></div></div>
        <div className="gm-link-columns gm-link-columns-three">
          <LinkPicker title={t.secrets} options={secrets.map(entry => ({ id: entry.id, title: entry.title }))} selected={form.planner.secrets} empty={t.noOptions} onChange={ids => updatePlanner({ secrets: ids })} />
          <LinkPicker title={t.clues} options={clues.map(entry => ({ id: entry.id, title: entry.title }))} selected={form.planner.clues} empty={t.noOptions} onChange={ids => updatePlanner({ clues: ids })} />
          <LinkPicker title={t.threads} options={threads.map(entry => ({ id: entry.id, title: entry.title }))} selected={form.planner.threads} empty={t.noOptions} onChange={ids => updatePlanner({ threads: ids })} />
        </div>
      </div>

      <label>
        <span>{t.legacyRelated}</span>
        <textarea rows={3} value={form.related} onChange={event => setForm({ ...form, related: event.target.value })} />
      </label>
    </>
  )
}

function EntityLinkEditor({ language, entities, links, onChange }: { language: Language; entities: EntityOption[]; links: Record<EntityKind, string[]>; onChange: (links: Record<EntityKind, string[]>) => void }) {
  const t = copy[language]
  return (
    <div className="gm-planner-section gm-compact-links">
      <div className="gm-planner-section-title"><LuUsers /><div><h4>{t.linkCampaign}</h4><p>{language === 'es' ? 'Relacioná esta entrada con personas, lugares o facciones existentes.' : 'Relate this entry to existing people, places or factions.'}</p></div></div>
      <div className="gm-link-columns">
        {(['characters', 'npcs', 'locations', 'factions'] as EntityKind[]).map(entityKind => (
          <LinkPicker
            key={entityKind}
            title={t[entityKind]}
            options={entities.filter(entity => entity.kind === entityKind).map(entity => ({ id: entity.id, title: entity.name, meta: entity.meta }))}
            selected={links[entityKind]}
            empty={t.noOptions}
            onChange={ids => onChange({ ...links, [entityKind]: ids })}
          />
        ))}
      </div>
    </div>
  )
}

function LinkPicker({ title, options, selected, empty, onChange }: { title: string; options: { id: string; title: string; meta?: string | null }[]; selected: string[]; empty: string; onChange: (ids: string[]) => void }) {
  return (
    <fieldset className="gm-link-picker">
      <legend>{title}<span>{selected.length}</span></legend>
      {options.length === 0 ? <p>{empty}</p> : (
        <div className="gm-link-picker-list">
          {options.map(option => {
            const checked = selected.includes(option.id)
            return (
              <label key={option.id} className={checked ? 'is-selected' : ''}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(checked ? selected.filter(id => id !== option.id) : [...selected, option.id])}
                />
                <span><strong>{option.title}</strong>{option.meta && <small>{option.meta}</small>}</span>
              </label>
            )
          })}
        </div>
      )}
    </fieldset>
  )
}

function EntryCard({ entry, language, entities, allEntries, onEdit, onDelete, onToggle, onConvert }: {
  entry: Entry
  language: Language
  entities: EntityOption[]
  allEntries: Entry[]
  onEdit: (entry: Entry) => void
  onDelete: (id: string) => Promise<void>
  onToggle: (entry: Entry) => Promise<void>
  onConvert: (entry: Entry) => Promise<void>
}) {
  const t = copy[language]
  const planner = plannerFromEntry(entry)
  const entityIds = entry.kind === 'session_planner'
    ? [...planner.characters, ...planner.npcs, ...planner.locations, ...planner.factions]
    : Object.values(entityLinksFromEntry(entry)).flat()
  const linkedEntities = entities.filter(entity => entityIds.includes(entity.id))
  const linkedToolIds = entry.kind === 'session_planner' ? [...planner.secrets, ...planner.clues, ...planner.threads] : []
  const linkedTools = allEntries.filter(tool => linkedToolIds.includes(tool.id))
  const nextStatus = statuses[entry.kind][(statuses[entry.kind].indexOf(entry.status) + 1) % statuses[entry.kind].length]

  return (
    <article className={`gm-entry-card ${entry.kind === 'session_planner' ? 'gm-plan-card' : ''}`}>
      <div className="gm-entry-card-top">
        <span className={`gm-status gm-status-${entry.status}`}>{labels[language][entry.status] ?? entry.status}</span>
        <div className="gm-card-actions">
          <button title={t.edit} onClick={() => onEdit(entry)}><LuFilePenLine /></button>
          <button title={t.del} onClick={() => void onDelete(entry.id)}><LuTrash2 /></button>
        </div>
      </div>
      <h3>{entry.title}</h3>
      {entry.session_date && <p className="gm-date"><LuCalendarCheck /> {entry.session_date}</p>}

      {entry.kind === 'session_planner' ? (
        <>
          {planner.objective && <div className="gm-plan-objective"><LuTarget /><span><small>{t.objective}</small><strong>{planner.objective}</strong></span></div>}
          {planner.opening && <p className="gm-plan-preview">{planner.opening}</p>}
          <div className="gm-plan-counts">
            <span><LuUsers /> {linkedEntities.length} {language === 'es' ? 'entidades' : 'entities'}</span>
            <span><LuLightbulb /> {linkedTools.length} {language === 'es' ? 'herramientas vinculadas' : 'linked tools'}</span>
          </div>
        </>
      ) : entry.content && <p>{entry.content}</p>}

      {linkedEntities.length > 0 && (
        <div className="gm-linked-chips">
          {linkedEntities.slice(0, 8).map(entity => <span key={`${entity.kind}-${entity.id}`}>{entity.name}</span>)}
          {linkedEntities.length > 8 && <span>+{linkedEntities.length - 8}</span>}
        </div>
      )}
      {stringValue(entry.details?.related) && <div className="gm-related">{stringValue(entry.details?.related)}</div>}

      <div className="gm-card-footer">
        <button className="gm-card-button gm-card-button-secondary" type="button" onClick={() => void onToggle(entry)}>
          {entry.kind === 'secret' ? (entry.status === 'hidden' ? <LuEye /> : <LuEyeOff />) : <LuListTodo />}
          {labels[language][nextStatus]}
        </button>
        {entry.kind === 'session_planner' && entry.status !== 'completed' && (
          <button className="gm-card-button gm-card-button-primary" type="button" onClick={() => void onConvert(entry)}>{t.convert}</button>
        )}
      </div>
    </article>
  )
}

function GmScreen({ language, entries, entities, loading, error, onSetStatus }: {
  language: Language
  entries: Entry[]
  entities: EntityOption[]
  loading: boolean
  error: string
  onSetStatus: (entry: Entry, status: string) => Promise<void>
}) {
  const t = copy[language]
  const plans = useMemo(() => entries.filter(entry => entry.kind === 'session_planner' && entry.status !== 'completed'), [entries])
  const defaultPlan = plans.find(plan => plan.status === 'ready') ?? plans[0] ?? null
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')

  useEffect(() => {
    if (!plans.length) {
      setSelectedPlanId('')
      return
    }
    if (!selectedPlanId || !plans.some(plan => plan.id === selectedPlanId)) setSelectedPlanId(defaultPlan?.id ?? plans[0].id)
  }, [defaultPlan?.id, plans, selectedPlanId])

  const selectedPlan = plans.find(plan => plan.id === selectedPlanId) ?? defaultPlan
  const details = plannerFromEntry(selectedPlan)
  const linkedEntityIds = [...details.characters, ...details.npcs, ...details.locations, ...details.factions]
  const linkedEntities = entities.filter(entity => linkedEntityIds.includes(entity.id))
  const linkedClues = entries.filter(entry => entry.kind === 'clue' && details.clues.includes(entry.id) && entry.status !== 'discovered')
  const linkedSecrets = entries.filter(entry => entry.kind === 'secret' && details.secrets.includes(entry.id) && entry.status !== 'revealed')
  const linkedThreads = entries.filter(entry => entry.kind === 'plot_thread' && details.threads.includes(entry.id) && !['resolved', 'abandoned'].includes(entry.status))
  const hasLinkedTools = details.clues.length + details.secrets.length + details.threads.length > 0

  const fallbackClues = hasLinkedTools ? [] : entries.filter(entry => entry.kind === 'clue' && entry.status !== 'discovered')
  const fallbackSecrets = hasLinkedTools ? [] : entries.filter(entry => entry.kind === 'secret' && entry.status !== 'revealed')
  const fallbackThreads = hasLinkedTools ? [] : entries.filter(entry => entry.kind === 'plot_thread' && !['resolved', 'abandoned'].includes(entry.status))
  const clues = linkedClues.length || hasLinkedTools ? linkedClues : fallbackClues
  const secrets = linkedSecrets.length || hasLinkedTools ? linkedSecrets : fallbackSecrets
  const threads = linkedThreads.length || hasLinkedTools ? linkedThreads : fallbackThreads

  const people = linkedEntities.filter(entity => entity.kind === 'characters' || entity.kind === 'npcs')
  const places = linkedEntities.filter(entity => entity.kind === 'locations')
  const factions = linkedEntities.filter(entity => entity.kind === 'factions')

  return (
    <section className="gm-workspace gm-screen">
      <header className="gm-tool-header gm-screen-header">
        <div>
          <span className="section-eyebrow">GM TOOLS · LIVE</span>
          <h2><LuMonitor /> {t.gm_screen[0]}</h2>
          <p>{t.gm_screen[1]}</p>
        </div>
        {plans.length > 0 && (
          <label className="gm-screen-plan-select">
            <span>{t.selectPlan}</span>
            <select value={selectedPlan?.id ?? ''} onChange={event => setSelectedPlanId(event.target.value)}>
              {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.title}</option>)}
            </select>
          </label>
        )}
      </header>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p className="section-state">{t.loading}</p>
      ) : !selectedPlan ? (
        <div className="gm-empty"><LuMonitor /><h3>{t.screenEmpty}</h3><p>{t.quickHint}</p></div>
      ) : (
        <>
          <section className="gm-live-plan">
            <div className="gm-live-plan-heading">
              <div>
                <span className={`gm-status gm-status-${selectedPlan.status}`}>{labels[language][selectedPlan.status]}</span>
                <h3>{selectedPlan.title}</h3>
                {selectedPlan.session_date && <p className="gm-date"><LuCalendarCheck /> {selectedPlan.session_date}</p>}
              </div>
              {details.objective && <div className="gm-live-objective"><LuTarget /><span><small>{t.objective}</small><strong>{details.objective}</strong></span></div>}
            </div>
            {(details.opening || details.scenes || details.complications) && (
              <div className="gm-live-prep-grid">
                {details.opening && <div><h4>{t.opening}</h4><p>{details.opening}</p></div>}
                {details.scenes && <div><h4>{t.scenes}</h4><p>{details.scenes}</p></div>}
                {details.complications && <div><h4>{t.complications}</h4><p>{details.complications}</p></div>}
              </div>
            )}
          </section>

          <div className="gm-screen-grid gm-screen-grid-live">
            <LiveEntityPanel title={t.people} icon={<LuUsers />} items={people} />
            <LiveEntityPanel title={t.places} icon={<LuMapPin />} items={places} />
            <LiveEntityPanel title={t.factions} icon={<LuShield />} items={factions} />
            <LiveToolPanel language={language} title={t.clues} icon={<LuLightbulb />} entries={clues} actionLabel={t.markDiscovered} onAction={entry => onSetStatus(entry, 'discovered')} />
            <LiveToolPanel language={language} title={t.secrets} icon={<LuEyeOff />} entries={secrets} actionLabel={t.markRevealed} onAction={entry => onSetStatus(entry, 'revealed')} />
            <LiveToolPanel language={language} title={t.threads} icon={<LuScrollText />} entries={threads} actionLabel={t.markResolved} onAction={entry => onSetStatus(entry, 'resolved')} />
          </div>

          {details.notes && <div className="gm-live-notes"><h4>{t.gmNotes}</h4><p>{details.notes}</p></div>}
        </>
      )}
      <p className="gm-screen-quick-hint">{t.quickHint}</p>
    </section>
  )
}

function LiveEntityPanel({ title, icon, items }: { title: string; icon: ReactNode; items: EntityOption[] }) {
  return (
    <section className="gm-screen-panel">
      <h3>{icon} {title}<span>{items.length}</span></h3>
      {items.length === 0 ? <p className="gm-panel-empty">—</p> : (
        <div className="gm-live-entity-list">
          {items.map(item => <div key={`${item.kind}-${item.id}`}><strong>{item.name}</strong>{item.meta && <small>{item.meta}</small>}</div>)}
        </div>
      )}
    </section>
  )
}

function LiveToolPanel({ language, title, icon, entries, actionLabel, onAction }: { language: Language; title: string; icon: ReactNode; entries: Entry[]; actionLabel: string; onAction: (entry: Entry) => Promise<void> }) {
  return (
    <section className="gm-screen-panel">
      <h3>{icon} {title}<span>{entries.length}</span></h3>
      {entries.length === 0 ? <p className="gm-panel-empty">—</p> : entries.map(entry => (
        <div className="gm-live-tool-row" key={entry.id}>
          <div><strong>{entry.title}</strong>{entry.content && <small>{entry.content}</small>}<em>{labels[language][entry.status] ?? entry.status}</em></div>
          <button type="button" onClick={() => void onAction(entry)}>{actionLabel}</button>
        </div>
      ))}
    </section>
  )
}
