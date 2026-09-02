import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LuBookOpen, LuBox, LuClock3, LuMap, LuNetwork,
  LuScrollText, LuShield, LuSwords, LuUsers,
} from 'react-icons/lu'
import AppHeader from '../components/AppHeader'
import MapsSection from '../components/MapsSection'
import { supabase } from '../utils/supabase'
import '../styles/player-view.css'

type Language = 'en' | 'es'
type CampaignRole = 'gm' | 'co_gm' | 'player'
type Section = 'overview'|'sessions'|'timeline'|'relationships'|'factions'|'characters'|'npcs'|'locations'|'maps'|'quests'|'items'|'notes'

interface Props {
  language: Language
  onLanguageChange: (language: Language) => void
  onSignOut: () => void
  onOpenProfile: () => void
}

type Campaign = { id:string; name:string; system:string|null; party_name:string|null; description:string|null; start_date:string|null }
type Row = Record<string, unknown> & { id?: string }

type DataState = {
  sessions: Row[]; timeline: Row[]; relationships: Row[]; factions: Row[];
  characters: Row[]; npcs: Row[]; locations: Row[]; quests: Row[]; items: Row[]; notes: Row[]
}

const emptyData: DataState = { sessions:[], timeline:[], relationships:[], factions:[], characters:[], npcs:[], locations:[], quests:[], items:[], notes:[] }

const copy = {
  en: {
    back:'Back to campaign', signOut:'Sign out', eyebrow:'PLAYER VIEW', title:'Shared chronicle',
    intro:'This is the campaign as players see it. GM-only information, private maps and unrevealed pins are excluded.',
    preview:'GM preview', player:'Player view', loading:'Preparing the shared chronicle…', error:'We could not load Player View.',
    empty:'Nothing shared here yet.', overview:'Overview', sessions:'Sessions', timeline:'Timeline', relationships:'Relationships', factions:'Factions', characters:'Characters', npcs:'NPCs', locations:'Locations', maps:'Maps', quests:'Quests', items:'Items', notes:'Notes',
    shared:'Shared', noDescription:'No description yet.', status:'Status', date:'Date', type:'Type', role:'Role', playerName:'Player', reward:'Reward', quantity:'Quantity', relationship:'Relationship', notesLabel:'Notes',
  },
  es: {
    back:'Volver a la campaña', signOut:'Cerrar sesión', eyebrow:'VISTA DE JUGADORES', title:'Crónica compartida',
    intro:'Así ven la campaña los jugadores. La información solo para GM, los mapas privados y los pins no revelados quedan afuera.',
    preview:'Vista previa del GM', player:'Vista de jugador', loading:'Preparando la crónica compartida…', error:'No pudimos cargar la Vista de jugadores.',
    empty:'Todavía no hay nada compartido acá.', overview:'Resumen', sessions:'Sesiones', timeline:'Línea de tiempo', relationships:'Relaciones', factions:'Facciones', characters:'Personajes', npcs:'NPCs', locations:'Lugares', maps:'Mapas', quests:'Misiones', items:'Objetos', notes:'Notas',
    shared:'Compartido', noDescription:'Todavía no hay descripción.', status:'Estado', date:'Fecha', type:'Tipo', role:'Rol', playerName:'Jugador', reward:'Recompensa', quantity:'Cantidad', relationship:'Relación', notesLabel:'Notas',
  },
}

const txt = (row: Row, key: string) => typeof row[key] === 'string' ? row[key] as string : ''
const num = (row: Row, key: string) => typeof row[key] === 'number' ? String(row[key]) : ''

export default function PlayerViewPage({ language, onLanguageChange, onSignOut, onOpenProfile }: Props) {
  const { campaignId } = useParams<{campaignId:string}>()
  const navigate = useNavigate()
  const t = copy[language]
  const [campaign, setCampaign] = useState<Campaign|null>(null)
  const [role, setRole] = useState<CampaignRole|null>(null)
  const [data, setData] = useState<DataState>(emptyData)
  const [active, setActive] = useState<Section>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!campaignId) return
    let alive = true
    const load = async () => {
      setLoading(true); setError('')
      try {
        const { data:userData, error:userError } = await supabase.auth.getUser()
        if (userError || !userData.user) throw userError ?? new Error('Not authenticated')
        const [campaignRes, memberRes] = await Promise.all([
          supabase.from('campaigns').select('id,name,system,party_name,description,start_date').eq('id',campaignId).single(),
          supabase.from('campaign_members').select('role').eq('campaign_id',campaignId).eq('user_id',userData.user.id).maybeSingle(),
        ])
        if (campaignRes.error) throw campaignRes.error
        if (memberRes.error) throw memberRes.error
        const resolvedRole = memberRes.data?.role as CampaignRole|undefined
        if (!resolvedRole || !['gm','co_gm','player'].includes(resolvedRole)) throw new Error('No campaign access')

        const [sessions, timeline, relationships, factions, characters, npcs, locations, quests, items, notes] = await Promise.all([
          supabase.from('sessions').select('*').eq('campaign_id',campaignId).order('session_number',{ascending:false}),
          supabase.from('timeline_events').select('*').eq('campaign_id',campaignId).order('sort_order',{ascending:true}),
          supabase.from('campaign_relationships').select('*').eq('campaign_id',campaignId).eq('visibility','shared').order('created_at',{ascending:true}),
          supabase.from('organizations').select('*').eq('campaign_id',campaignId).eq('visibility','shared').order('name',{ascending:true}),
          supabase.from('characters').select('*').eq('campaign_id',campaignId).order('name',{ascending:true}),
          supabase.from('npcs').select('*').eq('campaign_id',campaignId).order('name',{ascending:true}),
          supabase.from('locations').select('*').eq('campaign_id',campaignId).order('name',{ascending:true}),
          supabase.from('quests').select('*').eq('campaign_id',campaignId).order('created_at',{ascending:false}),
          supabase.from('items').select('*').eq('campaign_id',campaignId).order('name',{ascending:true}),
          supabase.from('notes').select('*').eq('campaign_id',campaignId).order('updated_at',{ascending:false}),
        ])
        const firstError = [sessions,timeline,relationships,factions,characters,npcs,locations,quests,items,notes].find(r=>r.error)?.error
        if (firstError) throw firstError
        if (!alive) return
        setCampaign(campaignRes.data as Campaign)
        setRole(resolvedRole)
        setData({
          sessions:(sessions.data??[]) as Row[], timeline:(timeline.data??[]) as Row[], relationships:(relationships.data??[]) as Row[], factions:(factions.data??[]) as Row[],
          characters:(characters.data??[]) as Row[], npcs:(npcs.data??[]) as Row[], locations:(locations.data??[]) as Row[], quests:(quests.data??[]) as Row[], items:(items.data??[]) as Row[], notes:(notes.data??[]) as Row[],
        })
      } catch (e) { console.error(e); if (alive) setError(t.error) }
      finally { if (alive) setLoading(false) }
    }
    void load()
    return () => { alive = false }
  }, [campaignId, t.error])

  const nav = useMemo(() => ([
    ['overview',t.overview,LuBookOpen], ['sessions',t.sessions,LuScrollText], ['timeline',t.timeline,LuClock3], ['relationships',t.relationships,LuNetwork], ['factions',t.factions,LuShield], ['characters',t.characters,LuUsers], ['npcs',t.npcs,LuUsers], ['locations',t.locations,LuMap], ['maps',t.maps,LuMap], ['quests',t.quests,LuSwords], ['items',t.items,LuBox], ['notes',t.notes,LuBookOpen],
  ] as const), [t])

  const relationshipEntityNames = useMemo(() => {
    const map = new Map<string, string>()
    const add = (type: string, rows: Row[], labelKey: string) => {
      rows.forEach((row) => {
        if (!row.id) return
        const label = txt(row, labelKey)
        if (label) map.set(`${type}:${row.id}`, label)
      })
    }
    add('character', data.characters, 'name')
    add('npc', data.npcs, 'name')
    add('location', data.locations, 'name')
    add('organization', data.factions, 'name')
    add('quest', data.quests, 'title')
    add('item', data.items, 'name')
    return map
  }, [data])

  if (!campaignId) return null
  if (loading) return <div className="player-view-state"><span className="app-loading-symbol"/><p>{t.loading}</p></div>
  if (error || !campaign) return <div className="player-view-state"><LuBookOpen/><p>{error || t.error}</p><button onClick={()=>navigate('/dashboard')}>{t.back}</button></div>

  const relationshipLabel = (row: Row) => {
    const source = relationshipEntityNames.get(`${txt(row,'source_type')}:${txt(row,'source_id')}`) || '—'
    const target = relationshipEntityNames.get(`${txt(row,'target_type')}:${txt(row,'target_id')}`) || '—'
    return `${source} → ${target}`
  }
  const titleFor = (row:Row, section:Section) => section==='relationships' ? relationshipLabel(row) : section==='sessions' ? txt(row,'title') : section==='timeline' ? txt(row,'title') : section==='quests' ? txt(row,'title') : section==='notes' ? txt(row,'title') : txt(row,'name')
  const bodyFor = (row:Row, section:Section) => section==='sessions' ? txt(row,'summary') : section==='timeline' ? txt(row,'description') : section==='relationships' ? txt(row,'notes') : txt(row,'description') || txt(row,'body') || txt(row,'content')
  const metaFor = (row:Row, section:Section) => {
    const parts:string[]=[]
    if(section==='sessions'){ const n=num(row,'session_number'); if(n) parts.push(`#${n}`); if(txt(row,'session_date')) parts.push(txt(row,'session_date')) }
    if(section==='timeline' && txt(row,'calendar_date')) parts.push(txt(row,'calendar_date'))
    if(section==='relationships') parts.push(txt(row,'relationship_type'))
    if(section==='factions') { if(txt(row,'organization_type')) parts.push(txt(row,'organization_type')); if(txt(row,'status')) parts.push(txt(row,'status')) }
    if(section==='characters') { if(txt(row,'player_name')) parts.push(`${t.playerName}: ${txt(row,'player_name')}`); if(txt(row,'class_or_archetype')) parts.push(txt(row,'class_or_archetype')) }
    if(section==='npcs') { if(txt(row,'role')) parts.push(txt(row,'role')); if(txt(row,'faction')) parts.push(txt(row,'faction')) }
    if(section==='locations' && txt(row,'location_type')) parts.push(txt(row,'location_type'))
    if(section==='quests') { if(txt(row,'status')) parts.push(txt(row,'status')); if(txt(row,'reward')) parts.push(`${t.reward}: ${txt(row,'reward')}`) }
    if(section==='items') { if(txt(row,'item_type')) parts.push(txt(row,'item_type')); const q=num(row,'quantity'); if(q) parts.push(`${t.quantity}: ${q}`) }
    if(section==='notes' && txt(row,'category')) parts.push(txt(row,'category'))
    return parts.filter(Boolean)
  }
  const rows = active==='maps'||active==='overview' ? [] : data[active]

  return <div className="player-view-page">
    <AppHeader language={language} onLanguageChange={onLanguageChange} onOpenProfile={onOpenProfile} onSignOut={onSignOut} onBack={()=>navigate(`/campaign/${campaignId}`)} backLabel={t.back} signOutLabel={t.signOut}/>
    <header className="player-view-hero">
      <div><span>{t.eyebrow}</span><h1>{campaign.name}</h1><p>{campaign.description || t.noDescription}</p></div>
      <aside><strong>{role==='player'?t.player:t.preview}</strong><small>{t.intro}</small></aside>
    </header>
    <div className="player-view-shell">
      <nav className="player-view-nav" aria-label={t.title}>{nav.map(([id,label,Icon])=><button key={id} className={active===id?'active':''} onClick={()=>setActive(id)}><Icon/><span>{label}</span></button>)}</nav>
      <main className="player-view-content">
        {active==='overview' && <>
          <div className="player-view-heading"><span>{t.shared}</span><h2>{t.title}</h2><p>{t.intro}</p></div>
          <div className="player-view-stats">
            {nav.filter(([id])=>!['overview','maps'].includes(id)).map(([id,label,Icon])=><button key={id} onClick={()=>setActive(id)}><Icon/><strong>{data[id as keyof DataState].length}</strong><span>{label}</span></button>)}
          </div>
        </>}
        {active==='maps' && <MapsSection language={language} campaignId={campaignId} campaignRole="player" mode="player"/>}
        {active!=='overview' && active!=='maps' && <>
          <div className="player-view-heading"><span>{t.shared}</span><h2>{nav.find(([id])=>id===active)?.[1]}</h2></div>
          {rows.length===0 ? <div className="player-view-empty">{t.empty}</div> : <div className="player-view-grid">{rows.map((row,index)=><article key={String(row.id??index)} className="player-view-card"><div className="player-view-card-meta">{metaFor(row,active).map(m=><span key={m}>{m}</span>)}</div><h3>{titleFor(row,active) || '—'}</h3>{bodyFor(row,active)&&<p>{bodyFor(row,active)}</p>}</article>)}</div>}
        </>}
      </main>
    </div>
  </div>
}
