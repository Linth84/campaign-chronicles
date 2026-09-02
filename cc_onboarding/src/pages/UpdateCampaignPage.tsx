import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LuFileText, LuRefreshCw, LuUpload } from 'react-icons/lu'
import AppHeader from '../components/AppHeader'
import { parseCampaignImport } from '../utils/compactCampaignImport'
import { readCampaignFile } from '../utils/campaignFiles'
import { supabase } from '../utils/supabase'

type Language = 'en' | 'es'
type CampaignRole = 'gm' | 'co_gm' | 'player'
type ExistingSnapshot = {
  characters: Set<string>; sessions: Set<string>; npcs: Set<string>; locations: Set<string>; quests: Set<string>;
  items: Set<string>; notes: Set<string>; factions: Set<string>; timeline: Set<string>; gmNotes: Set<string>;
  secrets: Set<string>; clues: Set<string>; threads: Set<string>; planners: Set<string>;
}

const key = (value: string | null | undefined) => (value ?? '').trim().toLocaleLowerCase()
const composite = (...values: Array<string | number | null | undefined>) => values.map(v => key(String(v ?? ''))).join('::')
const emptySnapshot = (): ExistingSnapshot => ({
  characters:new Set(), sessions:new Set(), npcs:new Set(), locations:new Set(), quests:new Set(), items:new Set(), notes:new Set(),
  factions:new Set(), timeline:new Set(), gmNotes:new Set(), secrets:new Set(), clues:new Set(), threads:new Set(), planners:new Set(),
})

interface Props {
  language: Language
  onLanguageChange: (language: Language) => void
  onOpenProfile: () => void
  onSignOut: () => void
}

const copy = {
  en: {
    back:'Back to campaign', eyebrow:'Safe campaign merge', title:'Update Campaign',
    intro:'Upload a TXT, Word or PDF document to merge new and changed content into this campaign. Existing content is never deleted automatically.',
    current:'Updating', paste:'Paste update content', placeholder:'Paste the compact campaign document here…', choose:'Choose file', accepted:'TXT, DOCX or PDF', reading:'Reading document…',
    preview:'Update preview', previewHelp:'Entries are matched by their natural campaign key (usually name or title). Matches are updated; new entries are created.',
    newLabel:'new', updateLabel:'to update', detected:'detected', unchanged:'not in document = untouched', apply:'Apply update', applying:'Applying update…',
    success:'Campaign updated successfully.', readError:'We could not read this document.', updateError:'We could not update the campaign.', empty:'Add some text or choose a document first.',
    permission:'Only a GM or co-GM can update a campaign.', mismatch:'The document campaign name is different from the campaign you are updating.',
    campaignInfo:'Campaign info', characters:'Characters', sessions:'Sessions', npcs:'NPCs', locations:'Locations', quests:'Quests', items:'Items', notes:'Notes', factions:'Factions', relationships:'Relationships', timeline:'Timeline', gmNotes:'GM Notes', planners:'Session Plans', secrets:'Secrets', clues:'Clues', threads:'Plot Threads',
    mergeRule:'No destructive sync', mergeText:'Anything already in Campaign Chronicles that is missing from the document stays exactly as it is.',
  },
  es: {
    back:'Volver a la campaña', eyebrow:'Merge seguro de campaña', title:'Actualizar campaña',
    intro:'Subí un TXT, Word o PDF para fusionar contenido nuevo o modificado con esta campaña. El contenido existente nunca se elimina automáticamente.',
    current:'Actualizando', paste:'Pegá el contenido de actualización', placeholder:'Pegá acá el documento compacto de campaña…', choose:'Elegir archivo', accepted:'TXT, DOCX o PDF', reading:'Leyendo documento…',
    preview:'Vista previa de actualización', previewHelp:'Las entradas se reconocen por su clave natural (normalmente nombre o título). Las coincidencias se actualizan y las nuevas se crean.',
    newLabel:'nuevos', updateLabel:'a actualizar', detected:'detectadas', unchanged:'no aparece = se conserva', apply:'Aplicar actualización', applying:'Actualizando…',
    success:'Campaña actualizada correctamente.', readError:'No pudimos leer este documento.', updateError:'No pudimos actualizar la campaña.', empty:'Pegá contenido o elegí un documento primero.',
    permission:'Solo un GM o co-GM puede actualizar una campaña.', mismatch:'El nombre de campaña del documento es distinto de la campaña que estás actualizando.',
    campaignInfo:'Datos de campaña', characters:'Personajes', sessions:'Sesiones', npcs:'NPCs', locations:'Lugares', quests:'Misiones', items:'Objetos', notes:'Notas', factions:'Facciones', relationships:'Relaciones', timeline:'Timeline', gmNotes:'Notas del GM', planners:'Planes de sesión', secrets:'Secretos', clues:'Pistas', threads:'Hilos argumentales',
    mergeRule:'Sin sincronización destructiva', mergeText:'Todo lo que ya existe en Campaign Chronicles y no aparece en el documento queda exactamente como está.',
  }
} as const

async function mergeByKey<T extends Record<string, unknown>>(
  table: string,
  campaignId: string,
  rows: T[],
  rowKey: (row: T) => string,
  dbKey: (row: Record<string, unknown>) => string,
) {
  if (!rows.length) return
  const { data, error } = await supabase.from(table).select('*').eq('campaign_id', campaignId)
  if (error) throw error
  const existing = new Map((data ?? []).map(row => [dbKey(row as Record<string, unknown>), String((row as Record<string, unknown>).id)]))
  const inserts: T[] = []
  for (const row of rows) {
    const id = existing.get(rowKey(row))
    if (id) {
      const { error: updateError } = await supabase.from(table).update(row as any).eq('id', id).eq('campaign_id', campaignId)
      if (updateError) throw updateError
    } else inserts.push(row)
  }
  if (inserts.length) {
    const { error: insertError } = await supabase.from(table).insert(inserts as any[])
    if (insertError) throw insertError
  }
}

export default function UpdateCampaignPage({ language, onLanguageChange, onOpenProfile, onSignOut }: Props) {
  const t = copy[language]
  const navigate = useNavigate()
  const { campaignId } = useParams<{campaignId:string}>()
  const [campaignName,setCampaignName] = useState('')
  const [role,setRole] = useState<CampaignRole | null>(null)
  const [sourceText,setSourceText] = useState('')
  const [snapshot,setSnapshot] = useState<ExistingSnapshot>(emptySnapshot)
  const [loading,setLoading] = useState(true)
  const [reading,setReading] = useState(false)
  const [applying,setApplying] = useState(false)
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')

  const parsed = useMemo(() => parseCampaignImport(sourceText), [sourceText])
  const canEdit = role === 'gm' || role === 'co_gm'
  const nameMismatch = Boolean(parsed.campaign.name && campaignName && key(parsed.campaign.name) !== key(campaignName))

  useEffect(() => {
    if (!campaignId) return
    const load = async () => {
      setLoading(true); setError('')
      try {
        const { data:userData, error:userError } = await supabase.auth.getUser()
        if (userError || !userData.user) throw userError ?? new Error('No authenticated user')
        const [campaign, member, characters, sessions, npcs, locations, quests, items, notes, factions, timeline, gmNotes, gmTools] = await Promise.all([
          supabase.from('campaigns').select('name').eq('id',campaignId).single(),
          supabase.from('campaign_members').select('role').eq('campaign_id',campaignId).eq('user_id',userData.user.id).maybeSingle(),
          supabase.from('characters').select('name').eq('campaign_id',campaignId), supabase.from('sessions').select('session_number,title').eq('campaign_id',campaignId),
          supabase.from('npcs').select('name').eq('campaign_id',campaignId), supabase.from('locations').select('name').eq('campaign_id',campaignId),
          supabase.from('quests').select('title').eq('campaign_id',campaignId), supabase.from('items').select('name').eq('campaign_id',campaignId),
          supabase.from('notes').select('title,category').eq('campaign_id',campaignId), supabase.from('organizations').select('name').eq('campaign_id',campaignId),
          supabase.from('timeline_events').select('title,calendar_date').eq('campaign_id',campaignId), supabase.from('gm_notes').select('title').eq('campaign_id',campaignId),
          supabase.from('gm_tool_entries').select('kind,title').eq('campaign_id',campaignId),
        ])
        if (campaign.error) throw campaign.error
        if (member.error) throw member.error
        setCampaignName(campaign.data.name)
        setRole((member.data?.role as CampaignRole | undefined) ?? null)
        const next=emptySnapshot()
        characters.data?.forEach(r=>next.characters.add(key(r.name))); sessions.data?.forEach(r=>next.sessions.add(composite(r.session_number || '',r.title)));
        npcs.data?.forEach(r=>next.npcs.add(key(r.name))); locations.data?.forEach(r=>next.locations.add(key(r.name))); quests.data?.forEach(r=>next.quests.add(key(r.title)));
        items.data?.forEach(r=>next.items.add(key(r.name))); notes.data?.forEach(r=>next.notes.add(composite(r.title,r.category))); factions.data?.forEach(r=>next.factions.add(key(r.name)));
        timeline.data?.forEach(r=>next.timeline.add(composite(r.title,r.calendar_date))); gmNotes.data?.forEach(r=>next.gmNotes.add(key(r.title)));
        gmTools.data?.forEach(r=>{ const k=key(r.title); if(r.kind==='secret')next.secrets.add(k); else if(r.kind==='clue')next.clues.add(k); else if(r.kind==='plot_thread')next.threads.add(k); else if(r.kind==='session_planner')next.planners.add(k) })
        setSnapshot(next)
      } catch(e){ console.error(e); setError(t.updateError) } finally { setLoading(false) }
    }
    void load()
  },[campaignId,t.updateError])

  const preview = useMemo(() => {
    const count=(rows:Array<Record<string,unknown>>, set:Set<string>, get:(r:Record<string,unknown>)=>string)=>({total:rows.length, updates:rows.filter(r=>set.has(get(r))).length})
    return [
      [t.characters,count(parsed.characters as unknown as Array<Record<string,unknown>>,snapshot.characters,r=>key(String(r.name??'')))],
      [t.sessions,count(parsed.sessions as unknown as Array<Record<string,unknown>>,snapshot.sessions,r=>composite(r.session_number as number|undefined,String(r.title??'')))],
      [t.npcs,count(parsed.npcs as unknown as Array<Record<string,unknown>>,snapshot.npcs,r=>key(String(r.name??'')))],
      [t.locations,count(parsed.locations as unknown as Array<Record<string,unknown>>,snapshot.locations,r=>key(String(r.name??'')))],
      [t.quests,count(parsed.quests as unknown as Array<Record<string,unknown>>,snapshot.quests,r=>key(String(r.title??'')))],
      [t.items,count(parsed.items as unknown as Array<Record<string,unknown>>,snapshot.items,r=>key(String(r.name??'')))],
      [t.notes,count(parsed.notes as unknown as Array<Record<string,unknown>>,snapshot.notes,r=>composite(String(r.title??''),String(r.category??'')))],
      [t.factions,count(parsed.factions as unknown as Array<Record<string,unknown>>,snapshot.factions,r=>key(String(r.name??'')))],
      [t.timeline,count(parsed.timeline as unknown as Array<Record<string,unknown>>,snapshot.timeline,r=>composite(String(r.title??''),String(r.calendar_date??'')))],
      [t.gmNotes,count(parsed.gmNotes as unknown as Array<Record<string,unknown>>,snapshot.gmNotes,r=>key(String(r.title??'')))],
      [t.planners,count(parsed.sessionPlans as unknown as Array<Record<string,unknown>>,snapshot.planners,r=>key(String(r.title??'')))],
      [t.secrets,count(parsed.secrets as unknown as Array<Record<string,unknown>>,snapshot.secrets,r=>key(String(r.title??'')))],
      [t.clues,count(parsed.clues as unknown as Array<Record<string,unknown>>,snapshot.clues,r=>key(String(r.title??'')))],
      [t.threads,count(parsed.plotThreads as unknown as Array<Record<string,unknown>>,snapshot.threads,r=>key(String(r.title??'')))],
      [t.relationships,{total:parsed.relationships.length,updates:-1}],
    ] as const
  },[parsed,snapshot,t])

  const handleFile = async (event:ChangeEvent<HTMLInputElement>) => {
    const file=event.target.files?.[0]; if(!file)return
    setReading(true); setError(''); setSuccess('')
    try { setSourceText(await readCampaignFile(file)) } catch(e){ console.error(e); setError(t.readError) } finally { setReading(false); event.target.value='' }
  }

  const handleSubmit = async (event:FormEvent) => {
    event.preventDefault(); if(!campaignId)return
    if(!sourceText.trim()){setError(t.empty);return}
    if(!canEdit){setError(t.permission);return}
    if(nameMismatch){setError(t.mismatch);return}
    setApplying(true);setError('');setSuccess('')
    try {
      const {data:userData,error:userError}=await supabase.auth.getUser(); if(userError||!userData.user)throw userError??new Error('No auth')
      const p=parseCampaignImport(sourceText)
      const campaignPatch:Record<string,unknown>={}
      if(p.campaign.name.trim()) campaignPatch.name=p.campaign.name.trim()
      if(p.campaign.system) campaignPatch.system=p.campaign.system
      if(p.campaign.party_name) campaignPatch.party_name=p.campaign.party_name
      if(p.campaign.start_date) campaignPatch.start_date=p.campaign.start_date
      if(p.campaign.description) campaignPatch.description=p.campaign.description
      if(Object.keys(campaignPatch).length){const {error:e}=await supabase.from('campaigns').update(campaignPatch).eq('id',campaignId);if(e)throw e}

      await mergeByKey('characters',campaignId,p.characters.map(r=>({campaign_id:campaignId,name:r.name,player_name:r.player_name,class_or_archetype:r.class_or_archetype,ancestry:r.ancestry,status:r.status||'active',description:r.description,notes:r.notes})),r=>key(String(r.name)),r=>key(String(r.name)))
      await mergeByKey('sessions',campaignId,p.sessions.map(r=>({campaign_id:campaignId,session_number:r.session_number,title:r.title,session_date:r.session_date,summary:r.summary,notes:r.notes})),r=>composite(r.session_number as number|undefined,String(r.title)),r=>composite(r.session_number as number|undefined,String(r.title)))
      await mergeByKey('npcs',campaignId,p.npcs.map(r=>({campaign_id:campaignId,name:r.name,role:r.role,faction:r.faction,status:r.status||'unknown',description:r.description,notes:r.notes})),r=>key(String(r.name)),r=>key(String(r.name)))
      await mergeByKey('locations',campaignId,p.locations.map(r=>({campaign_id:campaignId,name:r.name,location_type:r.location_type,description:r.description,notes:r.notes})),r=>key(String(r.name)),r=>key(String(r.name)))
      await mergeByKey('quests',campaignId,p.quests.map(r=>({campaign_id:campaignId,title:r.title,status:r.status||'active',description:r.description,reward:r.reward,notes:r.notes})),r=>key(String(r.title)),r=>key(String(r.title)))
      await mergeByKey('items',campaignId,p.items.map(r=>({campaign_id:campaignId,name:r.name,item_type:r.item_type,rarity:r.rarity,quantity:r.quantity??1,description:r.description,notes:r.notes})),r=>key(String(r.name)),r=>key(String(r.name)))
      await mergeByKey('notes',campaignId,p.notes.map(r=>({campaign_id:campaignId,title:r.title,body:r.body,category:r.category,is_pinned:r.is_pinned})),r=>composite(String(r.title),String(r.category??'')),r=>composite(String(r.title),String(r.category??'')))
      await mergeByKey('organizations',campaignId,p.factions.map(r=>({campaign_id:campaignId,name:r.name,organization_type:r.organization_type,description:r.description,notes:r.notes,visibility:r.visibility,created_by:userData.user.id})),r=>key(String(r.name)),r=>key(String(r.name)))
      await mergeByKey('timeline_events',campaignId,p.timeline.map((r,index)=>({campaign_id:campaignId,created_by:userData.user.id,title:r.title,description:r.description,event_type:r.event_type,calendar_date:r.calendar_date,time_label:r.time_label,sort_order:index})),r=>composite(String(r.title),String(r.calendar_date??'')),r=>composite(String(r.title),String(r.calendar_date??'')))
      await mergeByKey('gm_notes',campaignId,p.gmNotes.map(r=>({campaign_id:campaignId,title:r.title,content:r.content,created_by:userData.user.id,updated_at:new Date().toISOString()})),r=>key(String(r.title)),r=>key(String(r.title)))

      const entityConfigs=[['characters','name'],['npcs','name'],['locations','name'],['organizations','name']] as const
      const entityIds:Record<string,Map<string,string>>={characters:new Map(),npcs:new Map(),locations:new Map(),factions:new Map()}
      for(const [table,label] of entityConfigs){const {data,error:e}=await supabase.from(table).select(`id,${label}`).eq('campaign_id',campaignId);if(e)throw e;const dest=table==='organizations'?entityIds.factions:entityIds[table];data?.forEach(row=>dest.set(key(String((row as Record<string,unknown>)[label]??'')),String(row.id)))}

      const basicTools=[...p.secrets.map(r=>({...r,kind:'secret' as const})),...p.clues.map(r=>({...r,kind:'clue' as const})),...p.plotThreads.map(r=>({...r,kind:'plot_thread' as const}))]
      await mergeByKey('gm_tool_entries',campaignId,basicTools.map(r=>({campaign_id:campaignId,kind:r.kind,title:r.title,content:r.content,status:r.status,session_date:null,details:{entityLinks:{characters:(r.characters??[]).map(n=>entityIds.characters.get(key(n))).filter(Boolean),npcs:(r.npcs??[]).map(n=>entityIds.npcs.get(key(n))).filter(Boolean),locations:(r.locations??[]).map(n=>entityIds.locations.get(key(n))).filter(Boolean),factions:(r.factions??[]).map(n=>entityIds.factions.get(key(n))).filter(Boolean)},related:r.related??''},created_by:userData.user.id})),r=>composite(String(r.kind),String(r.title)),r=>composite(String(r.kind),String(r.title)))

      const {data:toolRows,error:toolErr}=await supabase.from('gm_tool_entries').select('id,kind,title').eq('campaign_id',campaignId);if(toolErr)throw toolErr
      const toolIds={secret:new Map<string,string>(),clue:new Map<string,string>(),plot_thread:new Map<string,string>()}
      toolRows?.forEach(r=>{if(r.kind in toolIds)(toolIds[r.kind as keyof typeof toolIds]).set(key(r.title),r.id)})
      await mergeByKey('gm_tool_entries',campaignId,p.sessionPlans.map(r=>({campaign_id:campaignId,kind:'session_planner',title:r.title,content:r.content,status:r.status,session_date:r.session_date,details:{objective:r.objective,opening:r.opening,scenes:r.scenes,complications:r.complications,notes:r.notes,characters:r.characters.map(n=>entityIds.characters.get(key(n))).filter(Boolean),npcs:r.npcs.map(n=>entityIds.npcs.get(key(n))).filter(Boolean),locations:r.locations.map(n=>entityIds.locations.get(key(n))).filter(Boolean),factions:r.factions.map(n=>entityIds.factions.get(key(n))).filter(Boolean),secrets:r.secrets.map(n=>toolIds.secret.get(key(n))).filter(Boolean),clues:r.clues.map(n=>toolIds.clue.get(key(n))).filter(Boolean),threads:r.threads.map(n=>toolIds.plot_thread.get(key(n))).filter(Boolean)},created_by:userData.user.id})),r=>composite(String(r.kind),String(r.title)),r=>composite(String(r.kind),String(r.title)))

      if(p.relationships.length){
        const entityTypes=[['character','characters','name'],['npc','npcs','name'],['location','locations','name'],['organization','organizations','name'],['quest','quests','title'],['item','items','name']] as const
        const ids=new Map<string,string>(); for(const [type,table,label] of entityTypes){const {data,error:e}=await supabase.from(table).select(`id,${label}`).eq('campaign_id',campaignId);if(e)throw e;data?.forEach(row=>ids.set(`${type}:${key(String((row as Record<string,unknown>)[label]??''))}`,String(row.id)))}
        const {data:existing,error:e0}=await supabase.from('campaign_relationships').select('id,source_type,source_id,target_type,target_id,relationship_type').eq('campaign_id',campaignId);if(e0)throw e0
        const relMap=new Map((existing??[]).map(r=>[composite(r.source_type,r.source_id,r.target_type,r.target_id,r.relationship_type),r.id]))
        for(const r of p.relationships){const sourceId=ids.get(`${r.source_type}:${key(r.source_name)}`),targetId=ids.get(`${r.target_type}:${key(r.target_name)}`);if(!sourceId||!targetId)continue;const row={campaign_id:campaignId,source_type:r.source_type,source_id:sourceId,target_type:r.target_type,target_id:targetId,relationship_type:r.relationship_type,notes:r.notes,visibility:r.visibility,created_by:userData.user.id};const rk=composite(r.source_type,sourceId,r.target_type,targetId,r.relationship_type);const id=relMap.get(rk);const result=id?await supabase.from('campaign_relationships').update(row).eq('id',id):await supabase.from('campaign_relationships').insert(row);if(result.error)throw result.error}
      }
      setSuccess(t.success)
      const finalName=p.campaign.name.trim(); if(finalName)setCampaignName(finalName)
    } catch(e){console.error('Campaign update failed:',e);setError(t.updateError)} finally {setApplying(false)}
  }

  if(!campaignId) return null
  return (
    <div className="import-campaign-page">
      <div className="import-campaign-ambience" aria-hidden="true">
        <div className="import-campaign-ornament import-campaign-ornament-one"><span/><span/><span/><span/></div>
        <div className="import-campaign-ornament import-campaign-ornament-two"><span/><span/><span/><span/></div>
        <i className="import-campaign-glyph import-campaign-glyph-one">◇</i>
        <i className="import-campaign-glyph import-campaign-glyph-two">△</i>
        <i className="import-campaign-glyph import-campaign-glyph-three">◈</i>
      </div>

      <AppHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onOpenProfile={onOpenProfile}
        onSignOut={onSignOut}
        onBack={() => navigate(`/campaign/${campaignId}/overview`)}
        backLabel={t.back}
      />

      <main className="import-campaign-main">
        <section className="import-campaign-heading">
          <p className="import-campaign-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </section>

        <form className="import-campaign-form" onSubmit={handleSubmit}>
          <section className="import-source-card update-campaign-rule-card">
            <div className="import-source-heading">
              <LuRefreshCw />
              <div>
                <p className="import-campaign-eyebrow">{t.mergeRule}</p>
                <h2>{loading ? '…' : campaignName}</h2>
              </div>
            </div>
            <p className="import-file-help">{t.mergeText}</p>
          </section>

          {!loading && !canEdit && <div className="import-campaign-error" role="alert">{t.permission}</div>}
          {nameMismatch && <div className="import-campaign-warning" role="alert">{t.mismatch} <strong>{parsed.campaign.name}</strong></div>}

          <section className="import-source-card">
            <div className="import-source-heading"><LuFileText /><h2>{t.paste}</h2></div>
            <textarea value={sourceText} onChange={e=>{setSourceText(e.target.value);setSuccess('');setError('')}} placeholder={t.placeholder}/>
            <div className="import-divider"><span>o / or</span></div>
            <label className="import-file-button">
              <LuUpload /><span>{reading?t.reading:t.choose}</span>
              <input type="file" accept=".txt,.docx,.pdf" disabled={reading||applying} onChange={handleFile}/>
            </label>
            <p className="import-file-help">{t.accepted}</p>
          </section>

          {sourceText.trim() && (
            <section className="import-preview">
              <div className="import-preview-heading">
                <div><p>{t.preview}</p><h2>{t.current}: {campaignName}</h2></div>
                <LuRefreshCw />
              </div>
              <p className="import-preview-description">{t.previewHelp}</p>
              <div className="update-preview-grid">
                {preview.filter(([,c])=>c.total>0).map(([label,c])=>(
                  <div className="update-preview-item" key={label}>
                    <strong>{label}</strong>
                    {c.updates < 0 ? <span>{c.total} {t.detected}</span> : <>
                      <span>{c.total-c.updates} {t.newLabel}</span>
                      <span>{c.updates} {t.updateLabel}</span>
                    </>}
                  </div>
                ))}
              </div>
              <small className="update-preview-untouched">✓ {t.unchanged}</small>
            </section>
          )}

          {error && <div className="import-campaign-error" role="alert">{error}</div>}
          {success && <div className="import-success-message" role="status">{success}</div>}

          <div className="import-campaign-actions">
            <button type="button" className="import-cancel-button" onClick={()=>navigate(`/campaign/${campaignId}/overview`)} disabled={applying}>{t.back}</button>
            <button type="submit" className="import-submit-button" disabled={!canEdit||nameMismatch||applying||reading||!sourceText.trim()}>
              <LuRefreshCw/><span>{applying?t.applying:t.apply}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
