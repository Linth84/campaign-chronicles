import { parseCampaignImportTemplate as parseLegacyCampaignImportTemplate } from './campaignFiles'

export type ImportVisibility = 'shared' | 'gm_only'
export type RelationshipEntityType = 'character' | 'npc' | 'location' | 'organization' | 'quest' | 'item'
export type TimelineEventType = 'event' | 'discovery' | 'travel' | 'combat' | 'social' | 'quest' | 'rest' | 'other'

type LegacyImport = ReturnType<typeof parseLegacyCampaignImportTemplate>

export interface CompactCampaignImport extends LegacyImport {
  version: 1 | 2
  factions: Array<{ name: string; organization_type: string | null; description: string | null; notes: string | null; visibility: ImportVisibility }>
  relationships: Array<{ source_type: RelationshipEntityType; source_name: string; target_type: RelationshipEntityType; target_name: string; relationship_type: string; notes: string | null; visibility: ImportVisibility }>
  timeline: Array<{ title: string; calendar_date: string | null; event_type: TimelineEventType; description: string | null; time_label: string | null }>
  gmNotes: Array<{ title: string; content: string }>
  secrets: Array<{ title: string; status: string; content: string | null; related: string | null; characters: string[]; npcs: string[]; locations: string[]; factions: string[] }>
  clues: Array<{ title: string; status: string; content: string | null; related: string | null; characters: string[]; npcs: string[]; locations: string[]; factions: string[] }>
  plotThreads: Array<{ title: string; status: string; content: string | null; related: string | null; characters: string[]; npcs: string[]; locations: string[]; factions: string[] }>
  sessionPlans: Array<{ title: string; status: string; session_date: string | null; objective: string; opening: string; scenes: string; complications: string; notes: string; content: string | null; characters: string[]; npcs: string[]; locations: string[]; factions: string[]; secrets: string[]; clues: string[]; threads: string[] }>
}

const SECTION_ALIASES = {
  campaign: ['CAMPAIGN INFORMATION', 'INFORMACIÓN DE LA CAMPAÑA'],
  characters: ['CHARACTERS', 'PERSONAJES'],
  sessions: ['SESSIONS', 'SESIONES'],
  npcs: ['NPCS'],
  locations: ['LOCATIONS', 'LUGARES'],
  quests: ['QUESTS', 'MISIONES', 'MISIONES / QUESTS'],
  items: ['ITEMS', 'OBJETOS'],
  notes: ['GENERAL NOTES', 'NOTAS GENERALES'],
  factions: ['FACTIONS', 'FACCIONES'],
  relationships: ['RELATIONSHIPS', 'RELACIONES'],
  timeline: ['TIMELINE', 'LÍNEA DE TIEMPO', 'LINEA DE TIEMPO'],
  gmNotes: ['GM NOTES', 'NOTAS DEL GM'],
  secrets: ['SECRETS', 'SECRETOS'],
  clues: ['CLUES', 'PISTAS'],
  plotThreads: ['PLOT THREADS', 'HILOS ARGUMENTALES'],
  sessionPlans: ['SESSION PLANNER', 'SESSION PLANS', 'PLANIFICADOR DE SESIÓN', 'PLANIFICADOR DE SESION', 'PLANES DE SESIÓN', 'PLANES DE SESION'],
} as const

type SectionName = keyof typeof SECTION_ALIASES
const HEADING_MAP = new Map<string, SectionName>()
Object.entries(SECTION_ALIASES).forEach(([section, headings]) => headings.forEach((heading) => HEADING_MAP.set(heading.toUpperCase(), section as SectionName)))

const clean = (value?: string) => {
  const result = (value ?? '').trim()
  return result && result !== '-' ? result : null
}
const parts = (line: string) => line.split('|').map((value) => value.trim())
const visibility = (value?: string): ImportVisibility => ['gm', 'gm_only', 'private', 'privado', 'solo gm', 'sólo gm'].includes((value ?? '').trim().toLowerCase()) ? 'gm_only' : 'shared'
const entityType = (value?: string): RelationshipEntityType | null => ({
  character: 'character', personaje: 'character', npc: 'npc', location: 'location', lugar: 'location',
  faction: 'organization', faccion: 'organization', 'facción': 'organization', organization: 'organization', organizacion: 'organization', 'organización': 'organization',
  quest: 'quest', mision: 'quest', 'misión': 'quest', item: 'item', objeto: 'item',
} as Record<string, RelationshipEntityType>)[(value ?? '').trim().toLowerCase()] ?? null
const eventType = (value?: string): TimelineEventType => ({
  event: 'event', evento: 'event', discovery: 'discovery', descubrimiento: 'discovery', journey: 'travel', travel: 'travel', viaje: 'travel',
  conflict: 'combat', combat: 'combat', combate: 'combat', conflicto: 'combat', social: 'social', quest: 'quest', mision: 'quest', 'misión': 'quest', rest: 'rest', descanso: 'rest', other: 'other', otro: 'other',
} as Record<string, TimelineEventType>)[(value ?? '').trim().toLowerCase()] ?? 'event'
const date = (value?: string) => /^\d{4}-\d{2}-\d{2}$/.test((value ?? '').trim()) ? (value ?? '').trim() : null

const collectSections = (source: string) => {
  const sections: Record<SectionName, string[]> = {
    campaign: [],
    characters: [],
    sessions: [],
    npcs: [],
    locations: [],
    quests: [],
    items: [],
    notes: [],
    factions: [],
    relationships: [],
    timeline: [],
    gmNotes: [],
    secrets: [],
    clues: [],
    plotThreads: [],
    sessionPlans: [],
  }
  let current: SectionName | null = null
  let compactRows = 0
  for (const rawLine of source.replace(/\r/g, '').split('\n')) {
    const line = rawLine.trim()
    const heading = HEADING_MAP.get(line.replace(/:$/, '').toUpperCase())
    if (heading) { current = heading; continue }
    if (!current || !line || line.startsWith('#') || line.startsWith('//')) continue
    const lower = line.toLowerCase()
    if (lower.startsWith('format:') || lower.startsWith('formato:') || lower.startsWith('example:') || lower.startsWith('ejemplo:')) continue
    sections[current].push(line)
    if (current !== 'campaign' && line.includes('|')) compactRows += 1
  }
  return { sections, compactRows }
}

const campaignField = (lines: string[], ...names: string[]) => {
  const wanted = names.map((name) => name.toLowerCase())
  for (const line of lines) {
    const index = line.indexOf(':')
    if (index < 0) continue
    if (wanted.includes(line.slice(0, index).trim().toLowerCase())) return line.slice(index + 1).trim()
  }
  return ''
}

export const parseCampaignImport = (source: string): CompactCampaignImport => {
  const { sections, compactRows } = collectSections(source)
  const explicitV2 = /(?:\bV2\b|FORMATO COMPACTO|COMPACT(?: CAMPAIGN)? IMPORT)/i.test(source)
  if (compactRows === 0 && !explicitV2) {
    const legacy = parseLegacyCampaignImportTemplate(source)
    return { ...legacy, version: 1, factions: [], relationships: [], timeline: [], gmNotes: [], secrets: [], clues: [], plotThreads: [], sessionPlans: [] }
  }

  const spanish = source.toUpperCase().includes('INFORMACIÓN DE LA CAMPAÑA')
  const legacyHeader = spanish ? 'INFORMACIÓN DE LA CAMPAÑA' : 'CAMPAIGN INFORMATION'
  const nameLabel = spanish ? 'Nombre de la campaña' : 'Campaign Name'
  const systemLabel = spanish ? 'Sistema de juego' : 'Game System'
  const partyLabel = spanish ? 'Nombre del grupo' : 'Party Name'
  const startLabel = spanish ? 'Fecha de inicio' : 'Start Date'
  const descriptionLabel = spanish ? 'Descripción' : 'Description'

  // Reutilizamos las normalizaciones y defaults del parser V1 convirtiendo V2 a su forma estructurada internamente.
  const legacyLines: string[] = [legacyHeader,
    `${nameLabel}: ${campaignField(sections.campaign, 'Campaign Name', 'Campaign name', 'Nombre de la campaña')}`,
    `${systemLabel}: ${campaignField(sections.campaign, 'Game System', 'Game system', 'Sistema de juego')}`,
    `${partyLabel}: ${campaignField(sections.campaign, 'Party Name', 'Party name', 'Nombre del grupo')}`,
    `${startLabel}: ${campaignField(sections.campaign, 'Start Date', 'Start date', 'Fecha de inicio')}`,
    `${descriptionLabel}: ${campaignField(sections.campaign, 'Description', 'Descripción')}`,
    spanish ? 'PERSONAJES' : 'CHARACTERS']

  for (const p of sections.characters.map(parts)) legacyLines.push(
    spanish ? 'PERSONAJE' : 'CHARACTER', `${spanish ? 'Nombre' : 'Name'}: ${p[0] ?? ''}`, `${spanish ? 'Jugador' : 'Player'}: ${p[1] ?? ''}`,
    `${spanish ? 'Clase / Arquetipo' : 'Class / Archetype'}: ${p[2] ?? ''}`, `${spanish ? 'Linaje / Ascendencia' : 'Ancestry'}: ${p[3] ?? ''}`,
    `${spanish ? 'Estado' : 'Status'}: ${p[4] ?? ''}`, `${spanish ? 'Descripción' : 'Description'}: ${p[5] ?? ''}`, `${spanish ? 'Notas' : 'Notes'}: ${p[6] ?? ''}`)

  legacyLines.push(spanish ? 'SESIONES' : 'SESSIONS')
  for (const p of sections.sessions.map(parts)) legacyLines.push(spanish ? 'SESIÓN' : 'SESSION', `${spanish ? 'Número' : 'Number'}: ${p[0] ?? ''}`, `${spanish ? 'Título' : 'Title'}: ${p[1] ?? ''}`, `${spanish ? 'Fecha' : 'Date'}: ${p[2] ?? ''}`, `${spanish ? 'Resumen' : 'Summary'}: ${p[3] ?? ''}`, `${spanish ? 'Notas' : 'Notes'}: ${p[4] ?? ''}`)
  legacyLines.push('NPCS')
  for (const p of sections.npcs.map(parts)) legacyLines.push('NPC', `${spanish ? 'Nombre' : 'Name'}: ${p[0] ?? ''}`, `${spanish ? 'Rol' : 'Role'}: ${p[1] ?? ''}`, `${spanish ? 'Facción' : 'Faction'}: ${p[2] ?? ''}`, `${spanish ? 'Estado' : 'Status'}: ${p[3] ?? ''}`, `${spanish ? 'Descripción' : 'Description'}: ${p[4] ?? ''}`, `${spanish ? 'Notas' : 'Notes'}: ${p[5] ?? ''}`)
  legacyLines.push(spanish ? 'LUGARES' : 'LOCATIONS')
  for (const p of sections.locations.map(parts)) legacyLines.push(spanish ? 'LUGAR' : 'LOCATION', `${spanish ? 'Nombre' : 'Name'}: ${p[0] ?? ''}`, `${spanish ? 'Tipo' : 'Type'}: ${p[1] ?? ''}`, `${spanish ? 'Descripción' : 'Description'}: ${p[2] ?? ''}`, `${spanish ? 'Notas' : 'Notes'}: ${p[3] ?? ''}`)
  legacyLines.push(spanish ? 'MISIONES' : 'QUESTS')
  for (const p of sections.quests.map(parts)) legacyLines.push(spanish ? 'MISIÓN' : 'QUEST', `${spanish ? 'Título' : 'Title'}: ${p[0] ?? ''}`, `${spanish ? 'Estado' : 'Status'}: ${p[1] ?? ''}`, `${spanish ? 'Descripción' : 'Description'}: ${p[2] ?? ''}`, `${spanish ? 'Recompensa' : 'Reward'}: ${p[3] ?? ''}`, `${spanish ? 'Notas' : 'Notes'}: ${p[4] ?? ''}`)
  legacyLines.push(spanish ? 'OBJETOS' : 'ITEMS')
  for (const p of sections.items.map(parts)) legacyLines.push(spanish ? 'OBJETO' : 'ITEM', `${spanish ? 'Nombre' : 'Name'}: ${p[0] ?? ''}`, `${spanish ? 'Tipo' : 'Type'}: ${p[1] ?? ''}`, `${spanish ? 'Rareza' : 'Rarity'}: ${p[2] ?? ''}`, `${spanish ? 'Cantidad' : 'Quantity'}: ${p[3] ?? ''}`, `${spanish ? 'Descripción' : 'Description'}: ${p[4] ?? ''}`, `${spanish ? 'Notas' : 'Notes'}: ${p[5] ?? ''}`)
  legacyLines.push(spanish ? 'NOTAS GENERALES' : 'GENERAL NOTES')
  for (const p of sections.notes.map(parts)) legacyLines.push(spanish ? 'NOTA' : 'NOTE', `${spanish ? 'Título' : 'Title'}: ${p[0] ?? ''}`, `${spanish ? 'Categoría' : 'Category'}: ${p[1] ?? ''}`, `${spanish ? 'Contenido' : 'Content'}: ${p.slice(2).join(' | ')}`)

  const legacy = parseLegacyCampaignImportTemplate(legacyLines.join('\n'))
  const factions = sections.factions.map(parts).filter((p) => clean(p[0])).map((p) => ({ name: p[0], organization_type: clean(p[1]), description: clean(p[2]), notes: clean(p[3]), visibility: visibility(p[4]) }))
  const relationships = sections.relationships.map(parts).map((p) => ({ source_type: entityType(p[0]), source_name: clean(p[1]), target_type: entityType(p[2]), target_name: clean(p[3]), relationship_type: clean(p[4]), notes: clean(p[5]), visibility: visibility(p[6]) })).filter((r): r is CompactCampaignImport['relationships'][number] => Boolean(r.source_type && r.source_name && r.target_type && r.target_name && r.relationship_type))
  const timeline = sections.timeline.map(parts).filter((p) => clean(p[0])).map((p) => ({ title: p[0], calendar_date: date(p[1]), event_type: eventType(p[2]), description: clean(p[3]), time_label: clean(p[4]) }))
  const list = (value?: string) => (value ?? '').split(';').map((item) => item.trim()).filter(Boolean)
  const gmNotes = sections.gmNotes.map(parts).filter((p) => clean(p[0])).map((p) => ({ title: p[0], content: p.slice(1).join(' | ').trim() }))
  const toolRows = (lines: string[], fallbackStatus: string) => lines.map(parts).filter((p) => clean(p[0])).map((p) => ({
    title: p[0], status: clean(p[1]) ?? fallbackStatus, content: clean(p[2]), related: clean(p[3]),
    characters: list(p[4]), npcs: list(p[5]), locations: list(p[6]), factions: list(p[7]),
  }))
  const secrets = toolRows(sections.secrets, 'hidden')
  const clues = toolRows(sections.clues, 'undiscovered')
  const plotThreads = toolRows(sections.plotThreads, 'active')
  const sessionPlans = sections.sessionPlans.map(parts).filter((p) => clean(p[0])).map((p) => ({
    title: p[0], status: clean(p[1]) ?? 'draft', session_date: date(p[2]), objective: clean(p[3]) ?? '', opening: clean(p[4]) ?? '',
    scenes: clean(p[5]) ?? '', complications: clean(p[6]) ?? '', notes: clean(p[7]) ?? '', content: clean(p[8]),
    characters: list(p[9]), npcs: list(p[10]), locations: list(p[11]), factions: list(p[12]), secrets: list(p[13]), clues: list(p[14]), threads: list(p[15]),
  }))
  return { ...legacy, version: 2, factions, relationships, timeline, gmNotes, secrets, clues, plotThreads, sessionPlans }
}
