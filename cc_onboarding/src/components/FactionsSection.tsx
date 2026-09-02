import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, FormEvent } from 'react'
import {
  LuActivity,
  LuBadgePlus,
  LuCamera,
  LuCrown,
  LuEye,
  LuEyeOff,
  LuGoal,
  LuPencil,
  LuShield,
  LuSparkles,
  LuTrash2,
  LuUpload,
  LuX,
} from 'react-icons/lu'

import { useConfirm } from './ConfirmProvider'
import { supabase } from '../utils/supabase'
import {
  removeCampaignPortrait,
  resolveCampaignImageUrl,
  uploadCampaignPortrait,
} from '../utils/campaignImages'

type Language = 'en' | 'es'
type CampaignRole = 'gm' | 'co_gm' | 'player'
type Visibility = 'shared' | 'gm_only'
type FactionStatus = 'active' | 'dormant' | 'destroyed' | 'unknown'
type FactionInfluence = 'minor' | 'local' | 'regional' | 'major'

interface FactionsSectionProps {
  language: Language
  campaignId: string
  campaignRole: CampaignRole
}

interface Organization {
  id: string
  campaign_id: string
  name: string
  organization_type: string | null
  description: string | null
  notes: string | null
  image_path: string | null
  visibility: Visibility
  color: string
  status: FactionStatus
  influence: FactionInfluence
  goal: string | null
  created_by: string
  created_at: string
  updated_at: string
}

interface FactionForm {
  name: string
  organizationType: string
  description: string
  notes: string
  visibility: Visibility
  color: string
  status: FactionStatus
  influence: FactionInfluence
  goal: string
}

const FACTION_COLORS = [
  '#c7a76a',
  '#c86f6f',
  '#6f93c8',
  '#78a77b',
  '#9a7bc3',
  '#c58a57',
  '#6fa9a2',
  '#8d929c',
] as const

const emptyForm: FactionForm = {
  name: '',
  organizationType: '',
  description: '',
  notes: '',
  visibility: 'shared',
  color: FACTION_COLORS[0],
  status: 'active',
  influence: 'local',
  goal: '',
}

const copy = {
  en: {
    eyebrow: 'Campaign organizations',
    title: 'Factions',
    description: 'Track the groups that shape the campaign: what they want, how much power they hold, and how they connect to the rest of the world.',
    newFaction: 'New faction',
    emptyTitle: 'No factions yet',
    emptyText: 'Create the first organization that shapes this campaign.',
    loading: 'Loading factions...',
    loadError: 'We could not load the factions.',
    createTitle: 'Create faction',
    editTitle: 'Edit faction',
    name: 'Name',
    namePlaceholder: 'e.g. The Gilded Archive',
    type: 'Type',
    typePlaceholder: 'Guild, house, cult, order...',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'What is this faction and what does it represent?',
    goal: 'Current goal',
    goalPlaceholder: 'What is this faction trying to achieve right now?',
    notes: 'Notes',
    notesPlaceholder: 'Resources, rumors, internal conflicts, plans...',
    status: 'Status',
    influence: 'Influence',
    color: 'Faction color',
    active: 'Active',
    dormant: 'Dormant',
    destroyed: 'Destroyed',
    unknown: 'Unknown',
    minor: 'Minor',
    local: 'Local',
    regional: 'Regional',
    major: 'Major',
    visibility: 'Visibility',
    shared: 'Shared',
    gmOnly: 'GM Only',
    sharedHelp: 'Visible to campaign members.',
    gmHelp: 'Visible only to the GM and Sub-GMs.',
    cancel: 'Cancel',
    save: 'Save faction',
    saving: 'Saving...',
    required: 'Give the faction a name before saving.',
    saveError: 'We could not save the faction.',
    deleteTitle: 'Delete faction?',
    deleteText: 'This removes the faction and its graph relationships from the campaign. This cannot be undone.',
    delete: 'Delete faction',
    deleteError: 'We could not delete the faction.',
    edit: 'Edit faction',
    upload: 'Upload emblem',
    replace: 'Replace emblem',
    removeImage: 'Remove emblem',
    imageError: 'We could not update the faction emblem.',
    private: 'GM Only',
    created: 'Faction created.',
    updated: 'Faction updated.',
    deleted: 'Faction deleted.',
  },
  es: {
    eyebrow: 'Organizaciones de campaña',
    title: 'Facciones',
    description: 'Seguí a los grupos que moldean la campaña: qué quieren, cuánto poder tienen y cómo se conectan con el resto del mundo.',
    newFaction: 'Nueva facción',
    emptyTitle: 'Todavía no hay facciones',
    emptyText: 'Creá la primera organización que influye en esta campaña.',
    loading: 'Cargando facciones...',
    loadError: 'No pudimos cargar las facciones.',
    createTitle: 'Crear facción',
    editTitle: 'Editar facción',
    name: 'Nombre',
    namePlaceholder: 'Ej. El Archivo Dorado',
    type: 'Tipo',
    typePlaceholder: 'Gremio, casa, culto, orden...',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: '¿Qué es esta facción y qué representa?',
    goal: 'Objetivo actual',
    goalPlaceholder: '¿Qué está intentando conseguir esta facción ahora mismo?',
    notes: 'Notas',
    notesPlaceholder: 'Recursos, rumores, conflictos internos, planes...',
    status: 'Estado',
    influence: 'Influencia',
    color: 'Color de facción',
    active: 'Activa',
    dormant: 'Dormida',
    destroyed: 'Destruida',
    unknown: 'Desconocida',
    minor: 'Menor',
    local: 'Local',
    regional: 'Regional',
    major: 'Mayor',
    visibility: 'Visibilidad',
    shared: 'Compartida',
    gmOnly: 'Solo GM',
    sharedHelp: 'Visible para los miembros de la campaña.',
    gmHelp: 'Visible solo para GM y Sub-GM.',
    cancel: 'Cancelar',
    save: 'Guardar facción',
    saving: 'Guardando...',
    required: 'Poné un nombre a la facción antes de guardar.',
    saveError: 'No pudimos guardar la facción.',
    deleteTitle: '¿Eliminar facción?',
    deleteText: 'Esto elimina la facción y sus relaciones del grafo de la campaña. No se puede deshacer.',
    delete: 'Eliminar facción',
    deleteError: 'No pudimos eliminar la facción.',
    edit: 'Editar facción',
    upload: 'Subir emblema',
    replace: 'Cambiar emblema',
    removeImage: 'Quitar emblema',
    imageError: 'No pudimos actualizar el emblema de la facción.',
    private: 'Solo GM',
    created: 'Facción creada.',
    updated: 'Facción actualizada.',
    deleted: 'Facción eliminada.',
  },
}

const selectColumns = 'id,campaign_id,name,organization_type,description,notes,image_path,visibility,color,status,influence,goal,created_by,created_at,updated_at'

function FactionsSection({ language, campaignId, campaignRole }: FactionsSectionProps) {
  const t = copy[language]
  const confirm = useConfirm()
  const isStaff = campaignRole === 'gm' || campaignRole === 'co_gm'
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Organization | null>(null)
  const [form, setForm] = useState<FactionForm>(emptyForm)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const loadFactions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [{ data: userData }, result] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('organizations')
          .select(selectColumns)
          .eq('campaign_id', campaignId)
          .order('name', { ascending: true }),
      ])
      if (result.error) throw result.error
      setCurrentUserId(userData.user?.id ?? '')
      const rows = (result.data ?? []) as Organization[]
      setOrganizations(rows)

      const resolved = await Promise.all(
        rows.map(async (row) => [row.id, await resolveCampaignImageUrl(row.image_path)] as const),
      )
      setImageUrls(Object.fromEntries(resolved.filter(([, url]) => Boolean(url))) as Record<string, string>)
    } catch (loadError) {
      console.error('Error al cargar facciones:', loadError)
      setError(t.loadError)
    } finally {
      setLoading(false)
    }
  }, [campaignId, t.loadError])

  useEffect(() => { void loadFactions() }, [loadFactions])

  const sortedOrganizations = useMemo(
    () => [...organizations].sort((a, b) => a.name.localeCompare(b.name, language)),
    [organizations, language],
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setPendingImage(null)
    setRemoveImage(false)
    setError('')
    setMessage('')
    setEditorOpen(true)
  }

  const openEdit = (organization: Organization) => {
    setEditing(organization)
    setForm({
      name: organization.name,
      organizationType: organization.organization_type ?? '',
      description: organization.description ?? '',
      notes: organization.notes ?? '',
      visibility: organization.visibility,
      color: organization.color || FACTION_COLORS[0],
      status: organization.status || 'active',
      influence: organization.influence || 'local',
      goal: organization.goal ?? '',
    })
    setPendingImage(null)
    setRemoveImage(false)
    setError('')
    setMessage('')
    setEditorOpen(true)
  }

  const closeEditor = () => {
    if (saving) return
    setEditorOpen(false)
    setEditing(null)
    setPendingImage(null)
    setRemoveImage(false)
  }

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError(t.imageError)
      return
    }
    setPendingImage(file)
    setRemoveImage(false)
  }

  const saveFaction = async (event: FormEvent) => {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setError(t.required)
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const visibility: Visibility = isStaff ? form.visibility : 'shared'
      const payload = {
        campaign_id: campaignId,
        name,
        organization_type: form.organizationType.trim() || null,
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
        goal: form.goal.trim() || null,
        color: form.color,
        status: form.status,
        influence: form.influence,
        visibility,
      }

      let saved: Organization
      if (editing) {
        const { data, error: updateError } = await supabase
          .from('organizations')
          .update(payload)
          .eq('id', editing.id)
          .eq('campaign_id', campaignId)
          .select(selectColumns)
          .single()
        if (updateError) throw updateError
        saved = data as Organization
      } else {
        const { data, error: insertError } = await supabase
          .from('organizations')
          .insert({ ...payload, created_by: currentUserId })
          .select(selectColumns)
          .single()
        if (insertError) throw insertError
        saved = data as Organization
      }

      let nextImagePath = saved.image_path
      try {
        if (removeImage && saved.image_path) {
          await removeCampaignPortrait(saved.image_path)
          nextImagePath = null
        }
        if (pendingImage) {
          if (saved.image_path) await removeCampaignPortrait(saved.image_path)
          nextImagePath = await uploadCampaignPortrait({
            campaignId,
            entityType: 'organizations',
            entityId: saved.id,
            file: pendingImage,
          })
        }
        if (nextImagePath !== saved.image_path) {
          const { data, error: imageUpdateError } = await supabase
            .from('organizations')
            .update({ image_path: nextImagePath })
            .eq('id', saved.id)
            .eq('campaign_id', campaignId)
            .select(selectColumns)
            .single()
          if (imageUpdateError) throw imageUpdateError
          saved = data as Organization
        }
      } catch (imageError) {
        console.error('Error al guardar emblema de facción:', imageError)
        setError(t.imageError)
      }

      setEditorOpen(false)
      setEditing(null)
      setPendingImage(null)
      setRemoveImage(false)
      setMessage(editing ? t.updated : t.created)
      await loadFactions()
    } catch (saveError) {
      console.error('Error al guardar facción:', saveError)
      setError(t.saveError)
    } finally {
      setSaving(false)
    }
  }

  const deleteFaction = async (organization: Organization) => {
    const accepted = await confirm({
      title: t.deleteTitle,
      message: t.deleteText,
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      variant: 'danger',
    })
    if (!accepted) return

    setError('')
    setMessage('')
    try {
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organization.id)
        .eq('campaign_id', campaignId)
      if (deleteError) throw deleteError
      if (organization.image_path) {
        try { await removeCampaignPortrait(organization.image_path) } catch (storageError) {
          console.error('Error al limpiar emblema:', storageError)
        }
      }
      setOrganizations((current) => current.filter((item) => item.id !== organization.id))
      setMessage(t.deleted)
    } catch (deleteError) {
      console.error('Error al eliminar facción:', deleteError)
      setError(t.deleteError)
    }
  }

  return (
    <section className="campaign-factions">
      <header className="campaign-factions-header">
        <div>
          <p className="campaign-factions-eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
          <p className="campaign-factions-description">{t.description}</p>
        </div>
        <button type="button" className="faction-new-button" onClick={openCreate}>
          <LuBadgePlus /> {t.newFaction}
        </button>
      </header>

      {error && <div className="faction-message faction-message-error">{error}</div>}
      {message && <div className="faction-message faction-message-success">{message}</div>}

      {editorOpen && (
        <form className="faction-editor" onSubmit={saveFaction}>
          <div className="faction-editor-heading">
            <div>
              <p>{t.eyebrow}</p>
              <h3>{editing ? t.editTitle : t.createTitle}</h3>
            </div>
            <button type="button" className="faction-editor-close" onClick={closeEditor} disabled={saving} aria-label={t.cancel}><LuX /></button>
          </div>

          <div className="faction-editor-layout">
            <div className="faction-emblem-editor">
              <div className="faction-emblem-preview" style={{ borderColor: form.color }}>
                {pendingImage ? (
                  <img src={URL.createObjectURL(pendingImage)} alt="" />
                ) : editing && imageUrls[editing.id] && !removeImage ? (
                  <img src={imageUrls[editing.id]} alt="" />
                ) : (
                  <LuShield style={{ color: form.color }} />
                )}
              </div>
              <input ref={imageInputRef} className="faction-image-input" type="file" accept="image/*" onChange={handleImage} />
              <button type="button" className="faction-image-button" onClick={() => imageInputRef.current?.click()}>
                {editing?.image_path && !removeImage ? <LuCamera /> : <LuUpload />}
                {editing?.image_path && !removeImage ? t.replace : t.upload}
              </button>
              {(pendingImage || (editing?.image_path && !removeImage)) && (
                <button type="button" className="faction-image-remove" onClick={() => { setPendingImage(null); setRemoveImage(true) }}>
                  <LuTrash2 /> {t.removeImage}
                </button>
              )}
            </div>

            <div className="faction-editor-grid">
              <label><span>{t.name}</span><input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder={t.namePlaceholder} maxLength={120} /></label>
              <label><span>{t.type}</span><input value={form.organizationType} onChange={(e) => setForm((current) => ({ ...current, organizationType: e.target.value }))} placeholder={t.typePlaceholder} maxLength={120} /></label>

              <label>
                <span>{t.status}</span>
                <select value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as FactionStatus }))}>
                  <option value="active">{t.active}</option>
                  <option value="dormant">{t.dormant}</option>
                  <option value="destroyed">{t.destroyed}</option>
                  <option value="unknown">{t.unknown}</option>
                </select>
              </label>

              <label>
                <span>{t.influence}</span>
                <select value={form.influence} onChange={(e) => setForm((current) => ({ ...current, influence: e.target.value as FactionInfluence }))}>
                  <option value="minor">{t.minor}</option>
                  <option value="local">{t.local}</option>
                  <option value="regional">{t.regional}</option>
                  <option value="major">{t.major}</option>
                </select>
              </label>

              <div className="faction-color-field faction-editor-full">
                <span>{t.color}</span>
                <div className="faction-color-options">
                  {FACTION_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={form.color === color ? 'active' : ''}
                      style={{ '--faction-swatch': color } as CSSProperties}
                      onClick={() => setForm((current) => ({ ...current, color }))}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>

              <label className="faction-editor-full"><span>{t.goal}</span><textarea value={form.goal} onChange={(e) => setForm((current) => ({ ...current, goal: e.target.value }))} placeholder={t.goalPlaceholder} maxLength={1600} /></label>
              <label className="faction-editor-full"><span>{t.descriptionLabel}</span><textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder={t.descriptionPlaceholder} maxLength={4000} /></label>
              <label className="faction-editor-full"><span>{t.notes}</span><textarea value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder={t.notesPlaceholder} maxLength={6000} /></label>
              {isStaff && (
                <div className="faction-visibility faction-editor-full">
                  <span>{t.visibility}</span>
                  <div className="faction-visibility-options">
                    <button type="button" className={form.visibility === 'shared' ? 'active' : ''} onClick={() => setForm((current) => ({ ...current, visibility: 'shared' }))}><LuEye /><strong>{t.shared}</strong><small>{t.sharedHelp}</small></button>
                    <button type="button" className={form.visibility === 'gm_only' ? 'active' : ''} onClick={() => setForm((current) => ({ ...current, visibility: 'gm_only' }))}><LuEyeOff /><strong>{t.gmOnly}</strong><small>{t.gmHelp}</small></button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="faction-editor-actions">
            <button type="button" className="faction-secondary" onClick={closeEditor} disabled={saving}>{t.cancel}</button>
            <button type="submit" className="faction-primary" disabled={saving}><LuCrown /> {saving ? t.saving : t.save}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="factions-state"><div className="app-loading-symbol" /><p>{t.loading}</p></div>
      ) : sortedOrganizations.length === 0 ? (
        <div className="factions-empty"><LuShield /><h3>{t.emptyTitle}</h3><p>{t.emptyText}</p><button type="button" onClick={openCreate}><LuBadgePlus />{t.newFaction}</button></div>
      ) : (
        <div className="factions-grid">
          {sortedOrganizations.map((organization) => {
            const canManage = isStaff || organization.created_by === currentUserId
            const statusLabel = t[organization.status]
            const influenceLabel = t[organization.influence]
            return (
              <article className="faction-card faction-card-v2" key={organization.id} style={{ '--faction-accent': organization.color || FACTION_COLORS[0] } as CSSProperties}>
                <div className="faction-card-emblem">
                  {imageUrls[organization.id] ? <img src={imageUrls[organization.id]} alt="" /> : <LuShield />}
                </div>
                <div className="faction-card-content">
                  <div className="faction-card-top">
                    <div>
                      {organization.organization_type && <span className="faction-card-type">{organization.organization_type}</span>}
                      <h3>{organization.name}</h3>
                    </div>
                    {organization.visibility === 'gm_only' && <span className="faction-private-badge"><LuEyeOff />{t.private}</span>}
                  </div>

                  <div className="faction-card-meta-v2">
                    <span className={`faction-status faction-status--${organization.status}`}><LuActivity />{statusLabel}</span>
                    <span><LuSparkles />{t.influence}: <strong>{influenceLabel}</strong></span>
                  </div>

                  {organization.goal && (
                    <div className="faction-card-goal">
                      <span><LuGoal /> {t.goal}</span>
                      <p>{organization.goal}</p>
                    </div>
                  )}

                  {organization.description && <p className="faction-card-description">{organization.description}</p>}
                  {organization.notes && <p className="faction-card-notes">{organization.notes}</p>}
                  {canManage && (
                    <div className="faction-card-actions">
                      <button type="button" onClick={() => openEdit(organization)} title={t.edit}><LuPencil />{t.edit}</button>
                      <button type="button" className="faction-delete" onClick={() => void deleteFaction(organization)} title={t.delete}><LuTrash2 />{t.delete}</button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default FactionsSection
