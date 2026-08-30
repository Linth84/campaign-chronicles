import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { FormEvent } from 'react'
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import type {
  Edge,
  Node,
  NodeProps,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  LuBuilding2,
  LuCirclePlus,
  LuEye,
  LuEyeOff,
  LuGem,
  LuMapPin,
  LuNetwork,
  LuPencil,
  LuScrollText,
  LuSearch,
  LuShield,
  LuTrash2,
  LuUserRound,
  LuUsers,
  LuX,
} from 'react-icons/lu'

import { supabase } from '../utils/supabase'
import { useConfirm } from './ConfirmProvider'
import '../styles/relationships.css'

type Language = 'en' | 'es'
type CampaignRole = 'gm' | 'co_gm' | 'player' | null
type EntityType =
  | 'character'
  | 'npc'
  | 'location'
  | 'organization'
  | 'quest'
  | 'item'
type Visibility = 'shared' | 'gm_only'

interface RelationshipsSectionProps {
  language: Language
  campaignId: string
  campaignRole: CampaignRole
}

interface EntityRecord {
  id: string
  type: EntityType
  name: string
  subtitle: string
  imagePath?: string | null
  visibility?: Visibility
}

interface RelationshipRecord {
  id: string
  campaign_id: string
  source_type: EntityType
  source_id: string
  target_type: EntityType
  target_id: string
  relationship_type: string
  notes: string | null
  visibility: Visibility
  created_by: string
}

interface PositionRecord {
  node_type: EntityType
  node_id: string
  position_x: number
  position_y: number
}

type ChronicleNodeData = {
  entity: EntityRecord
  language: Language
  dimmed: boolean
  focused: boolean
  gmOnly: boolean
}

type ChronicleNode = Node<ChronicleNodeData, 'chronicle'>

const nodeKey = (type: EntityType, id: string) => `${type}:${id}`

const TEXT = {
  en: {
    kicker: 'Narrative network',
    title: 'Relationships',
    intro: 'Explore how the people, places and factions of your campaign are connected.',
    addRelation: 'New relationship',
    addFaction: 'New faction',
    search: 'Find an entity...',
    all: 'All',
    character: 'Characters',
    npc: 'NPCs',
    location: 'Places',
    organization: 'Factions',
    quest: 'Quests',
    item: 'Items',
    loading: 'Mapping your chronicle...',
    emptyTitle: 'Your world is waiting to be connected.',
    emptyBody: 'Create a relationship and Campaign Chronicles will turn your campaign into a living network.',
    selected: 'Selected',
    connections: 'Connections',
    noConnections: 'No connections yet.',
    source: 'Origin',
    target: 'Destination',
    relation: 'Relationship',
    notes: 'Notes',
    visibility: 'Visibility',
    shared: 'Shared',
    gmOnly: 'GM only',
    chooseEntity: 'Choose an entity',
    relationPlaceholder: 'allied with, controls, belongs to...',
    save: 'Save relationship',
    update: 'Update relationship',
    cancel: 'Cancel',
    edit: 'Edit',
    remove: 'Delete',
    deleteTitle: 'Delete relationship?',
    deleteBody: 'This connection will be permanently removed.',
    deleteConfirm: 'Delete',
    factionTitle: 'Create faction',
    factionName: 'Name',
    factionType: 'Type',
    factionDescription: 'Description',
    factionNamePlaceholder: 'Order of the Dawn',
    factionTypePlaceholder: 'Order, guild, house, cult...',
    createFaction: 'Create faction',
    errorLoad: 'We could not load Relationships.',
    errorSave: 'We could not save that change.',
    sameEntity: 'Origin and destination must be different.',
    required: 'Choose an origin, destination and relationship.',
    resetFocus: 'Show entire network',
    hint: 'Drag nodes to arrange your map. Your layout is saved automatically.',
    inspectorHint: 'Select a node to focus its connections.',
    privateConnection: 'Private GM connection',
  },
  es: {
    kicker: 'Red narrativa',
    title: 'Relaciones',
    intro: 'Explorá cómo se conectan los personajes, lugares y facciones de tu campaña.',
    addRelation: 'Nueva relación',
    addFaction: 'Nueva facción',
    search: 'Buscar una entidad...',
    all: 'Todo',
    character: 'Personajes',
    npc: 'NPCs',
    location: 'Lugares',
    organization: 'Facciones',
    quest: 'Misiones',
    item: 'Objetos',
    loading: 'Trazando tu crónica...',
    emptyTitle: 'Tu mundo está esperando ser conectado.',
    emptyBody: 'Creá una relación y Campaign Chronicles convertirá tu campaña en una red narrativa viva.',
    selected: 'Seleccionado',
    connections: 'Conexiones',
    noConnections: 'Todavía no tiene conexiones.',
    source: 'Origen',
    target: 'Destino',
    relation: 'Relación',
    notes: 'Notas',
    visibility: 'Visibilidad',
    shared: 'Compartida',
    gmOnly: 'Solo GM',
    chooseEntity: 'Elegí una entidad',
    relationPlaceholder: 'aliado de, controla, pertenece a...',
    save: 'Guardar relación',
    update: 'Actualizar relación',
    cancel: 'Cancelar',
    edit: 'Editar',
    remove: 'Eliminar',
    deleteTitle: '¿Eliminar relación?',
    deleteBody: 'Esta conexión se eliminará permanentemente.',
    deleteConfirm: 'Eliminar',
    factionTitle: 'Crear facción',
    factionName: 'Nombre',
    factionType: 'Tipo',
    factionDescription: 'Descripción',
    factionNamePlaceholder: 'Orden del Alba',
    factionTypePlaceholder: 'Orden, gremio, casa, culto...',
    createFaction: 'Crear facción',
    errorLoad: 'No pudimos cargar Relaciones.',
    errorSave: 'No pudimos guardar ese cambio.',
    sameEntity: 'El origen y el destino deben ser diferentes.',
    required: 'Elegí un origen, un destino y una relación.',
    resetFocus: 'Mostrar toda la red',
    hint: 'Arrastrá los nodos para organizar el mapa. Tu distribución se guarda automáticamente.',
    inspectorHint: 'Seleccioná un nodo para enfocar sus conexiones.',
    privateConnection: 'Conexión privada del GM',
  },
} as const

const iconFor = {
  character: LuUserRound,
  npc: LuUsers,
  location: LuMapPin,
  organization: LuShield,
  quest: LuScrollText,
  item: LuGem,
} as const

function ChronicleEntityNode({ data }: NodeProps<ChronicleNode>) {
  const Icon = iconFor[data.entity.type]
  const image =
    data.entity.imagePath &&
    (/^https?:\/\//i.test(data.entity.imagePath) ||
      data.entity.imagePath.startsWith('/'))
      ? data.entity.imagePath
      : null

  return (
    <article
      className={[
        'cc-rel-node',
        `cc-rel-node--${data.entity.type}`,
        data.focused ? 'is-focused' : '',
        data.dimmed ? 'is-dimmed' : '',
      ].filter(Boolean).join(' ')}
    >
      <Handle type="target" position={Position.Left} className="cc-rel-handle" />

      <div className="cc-rel-node__portrait">
        {image ? (
          <img src={image} alt="" />
        ) : (
          <Icon aria-hidden="true" />
        )}
      </div>

      <div className="cc-rel-node__copy">
        <div className="cc-rel-node__meta">
          <span>{data.entity.subtitle}</span>
          {data.gmOnly && <LuEyeOff aria-label="GM only" />}
        </div>
        <strong>{data.entity.name}</strong>
      </div>

      <Handle type="source" position={Position.Right} className="cc-rel-handle" />
    </article>
  )
}

const nodeTypes: NodeTypes = {
  chronicle: ChronicleEntityNode,
}

function autoPosition(index: number, total: number) {
  if (total <= 1) return { x: 420, y: 250 }

  const columns = Math.max(3, Math.ceil(Math.sqrt(total * 1.55)))
  const row = Math.floor(index / columns)
  const column = index % columns
  const rowCount = Math.min(columns, total - row * columns)
  const offset = (columns - rowCount) * 105

  return {
    x: 90 + column * 250 + offset + (row % 2 ? 70 : 0),
    y: 80 + row * 155,
  }
}

function RelationshipsCanvas({
  language,
  campaignId,
  campaignRole,
}: RelationshipsSectionProps) {
  const t = TEXT[language]
  const isStaff = campaignRole === 'gm' || campaignRole === 'co_gm'
  const confirmAction = useConfirm()

  const [entities, setEntities] = useState<EntityRecord[]>([])
  const [relationships, setRelationships] = useState<RelationshipRecord[]>([])
  const [positions, setPositions] = useState<PositionRecord[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState<ChronicleNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | EntityType>('all')
  const [query, setQuery] = useState('')
  const [relationModal, setRelationModal] = useState(false)
  const [factionModal, setFactionModal] = useState(false)
  const [editing, setEditing] = useState<RelationshipRecord | null>(null)
  const [sourceKey, setSourceKey] = useState('')
  const [targetKey, setTargetKey] = useState('')
  const [relationType, setRelationType] = useState('')
  const [relationNotes, setRelationNotes] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('shared')
  const [factionName, setFactionName] = useState('')
  const [factionType, setFactionType] = useState('')
  const [factionDescription, setFactionDescription] = useState('')
  const [factionVisibility, setFactionVisibility] = useState<Visibility>('shared')
  const [saving, setSaving] = useState(false)
  const userIdRef = useRef<string | null>(null)
  const saveTimers = useRef<Record<string, number>>({})

  const entityMap = useMemo(() => {
    const map = new Map<string, EntityRecord>()
    entities.forEach((entity) => map.set(nodeKey(entity.type, entity.id), entity))
    return map
  }, [entities])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error('No user')
      userIdRef.current = userData.user.id

      const [
        characters,
        npcs,
        locations,
        organizations,
        quests,
        items,
        relationRows,
        positionRows,
      ] = await Promise.all([
        supabase.from('characters')
          .select('id,name,player_name,class_or_archetype,image_path')
          .eq('campaign_id', campaignId),
        supabase.from('npcs')
          .select('id,name,role,faction')
          .eq('campaign_id', campaignId),
        supabase.from('locations')
          .select('id,name,location_type')
          .eq('campaign_id', campaignId),
        supabase.from('organizations')
          .select('id,name,organization_type,image_path,visibility')
          .eq('campaign_id', campaignId),
        supabase.from('quests')
          .select('id,title,status')
          .eq('campaign_id', campaignId),
        supabase.from('items')
          .select('id,name,item_type,rarity')
          .eq('campaign_id', campaignId),
        supabase.from('campaign_relationships')
          .select('id,campaign_id,source_type,source_id,target_type,target_id,relationship_type,notes,visibility,created_by')
          .eq('campaign_id', campaignId)
          .order('created_at', { ascending: true }),
        supabase.from('campaign_relationship_positions')
          .select('node_type,node_id,position_x,position_y')
          .eq('campaign_id', campaignId)
          .eq('user_id', userData.user.id),
      ])

      const requestError = [
        characters.error,
        npcs.error,
        locations.error,
        organizations.error,
        quests.error,
        items.error,
        relationRows.error,
        positionRows.error,
      ].find(Boolean)

      if (requestError) throw requestError

      const nextEntities: EntityRecord[] = [
        ...(characters.data ?? []).map((row: any) => ({
          id: row.id,
          type: 'character' as const,
          name: row.name,
          subtitle: row.class_or_archetype || row.player_name || (language === 'es' ? 'Personaje' : 'Character'),
          imagePath: row.image_path,
        })),
        ...(npcs.data ?? []).map((row: any) => ({
          id: row.id,
          type: 'npc' as const,
          name: row.name,
          subtitle: row.role || row.faction || 'NPC',
        })),
        ...(locations.data ?? []).map((row: any) => ({
          id: row.id,
          type: 'location' as const,
          name: row.name,
          subtitle: row.location_type || (language === 'es' ? 'Lugar' : 'Place'),
        })),
        ...(organizations.data ?? []).map((row: any) => ({
          id: row.id,
          type: 'organization' as const,
          name: row.name,
          subtitle: row.organization_type || (language === 'es' ? 'Facción' : 'Faction'),
          imagePath: row.image_path,
          visibility: row.visibility,
        })),
        ...(quests.data ?? []).map((row: any) => ({
          id: row.id,
          type: 'quest' as const,
          name: row.title,
          subtitle: row.status || (language === 'es' ? 'Misión' : 'Quest'),
        })),
        ...(items.data ?? []).map((row: any) => ({
          id: row.id,
          type: 'item' as const,
          name: row.name,
          subtitle: row.item_type || row.rarity || (language === 'es' ? 'Objeto' : 'Item'),
        })),
      ]

      setEntities(nextEntities)
      setRelationships((relationRows.data ?? []) as RelationshipRecord[])
      setPositions((positionRows.data ?? []) as PositionRecord[])
    } catch (loadError) {
      console.error('Relationships load error:', loadError)
      setError(t.errorLoad)
    } finally {
      setLoading(false)
    }
  }, [campaignId, language, t.errorLoad])

  useEffect(() => {
    void load()
  }, [load])

  const positionMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    positions.forEach((position) => {
      map.set(nodeKey(position.node_type, position.node_id), {
        x: position.position_x,
        y: position.position_y,
      })
    })
    return map
  }, [positions])

  const connectedKeys = useMemo(() => {
    if (!selectedKey) return null
    const connected = new Set<string>([selectedKey])

    relationships.forEach((relationship) => {
      const source = nodeKey(relationship.source_type, relationship.source_id)
      const target = nodeKey(relationship.target_type, relationship.target_id)
      if (source === selectedKey) connected.add(target)
      if (target === selectedKey) connected.add(source)
    })

    return connected
  }, [relationships, selectedKey])

  const visibleEntities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(language)

    return entities.filter((entity) => {
      if (filter !== 'all' && entity.type !== filter) return false
      if (!normalized) return true

      return `${entity.name} ${entity.subtitle}`
        .toLocaleLowerCase(language)
        .includes(normalized)
    })
  }, [entities, filter, query, language])

  useEffect(() => {
    const visibleKeys = new Set(
      visibleEntities.map((entity) => nodeKey(entity.type, entity.id)),
    )

    const nextNodes: ChronicleNode[] = visibleEntities.map((entity, index) => {
      const key = nodeKey(entity.type, entity.id)
      const saved = positionMap.get(key)
      const position = saved ?? autoPosition(index, visibleEntities.length)

      return {
        id: key,
        type: 'chronicle',
        position,
        data: {
          entity,
          language,
          focused: selectedKey === key,
          dimmed: Boolean(connectedKeys && !connectedKeys.has(key)),
          gmOnly: entity.visibility === 'gm_only',
        },
      }
    })

    const nextEdges: Edge[] = relationships
      .filter((relationship) => {
        const source = nodeKey(relationship.source_type, relationship.source_id)
        const target = nodeKey(relationship.target_type, relationship.target_id)
        return visibleKeys.has(source) && visibleKeys.has(target)
      })
      .map((relationship) => {
        const source = nodeKey(relationship.source_type, relationship.source_id)
        const target = nodeKey(relationship.target_type, relationship.target_id)
        const active =
          !selectedKey ||
          source === selectedKey ||
          target === selectedKey

        return {
          id: relationship.id,
          source,
          target,
          label: relationship.relationship_type,
          type: 'smoothstep',
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
          },
          className: [
            'cc-rel-edge',
            active ? 'is-active' : 'is-dimmed',
            relationship.visibility === 'gm_only' ? 'is-private' : '',
          ].filter(Boolean).join(' '),
          labelStyle: {
            fill: active ? '#cbb27b' : '#5e5d5a',
            fontSize: 11,
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: '#0d1118',
            fillOpacity: 0.92,
          },
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 4,
          style: {
            stroke: active ? '#b59658' : '#3d4149',
            strokeWidth: active ? 1.7 : 1,
            opacity: active ? 0.92 : 0.12,
          },
        }
      })

    setNodes(nextNodes)
    setEdges(nextEdges)
  }, [
    visibleEntities,
    relationships,
    positionMap,
    language,
    selectedKey,
    connectedKeys,
    setNodes,
    setEdges,
  ])

  const selectedEntity = selectedKey
    ? entityMap.get(selectedKey) ?? null
    : null

  const selectedRelationships = useMemo(() => {
    if (!selectedKey) return []
    return relationships.filter((relationship) => {
      const source = nodeKey(relationship.source_type, relationship.source_id)
      const target = nodeKey(relationship.target_type, relationship.target_id)
      return source === selectedKey || target === selectedKey
    })
  }, [relationships, selectedKey])

  const persistPosition = useCallback((node: ChronicleNode) => {
    const userId = userIdRef.current
    if (!userId) return

    if (saveTimers.current[node.id]) {
      window.clearTimeout(saveTimers.current[node.id])
    }

    saveTimers.current[node.id] = window.setTimeout(async () => {
      const entity = node.data.entity

      const { error: saveError } = await supabase
        .from('campaign_relationship_positions')
        .upsert(
          {
            campaign_id: campaignId,
            user_id: userId,
            node_type: entity.type,
            node_id: entity.id,
            position_x: node.position.x,
            position_y: node.position.y,
          },
          {
            onConflict: 'campaign_id,user_id,node_type,node_id',
          },
        )

      if (saveError) {
        console.error('Relationship position save error:', saveError)
      }
    }, 250)
  }, [campaignId])

  const openNewRelationship = () => {
    setEditing(null)
    setSourceKey(selectedKey ?? '')
    setTargetKey('')
    setRelationType('')
    setRelationNotes('')
    setVisibility('shared')
    setError('')
    setRelationModal(true)
  }

  const openEditRelationship = (relationship: RelationshipRecord) => {
    setEditing(relationship)
    setSourceKey(nodeKey(relationship.source_type, relationship.source_id))
    setTargetKey(nodeKey(relationship.target_type, relationship.target_id))
    setRelationType(relationship.relationship_type)
    setRelationNotes(relationship.notes ?? '')
    setVisibility(relationship.visibility)
    setError('')
    setRelationModal(true)
  }

  const splitKey = (key: string): [EntityType, string] => {
    const separator = key.indexOf(':')
    return [
      key.slice(0, separator) as EntityType,
      key.slice(separator + 1),
    ]
  }

  const saveRelationship = async (event: FormEvent) => {
    event.preventDefault()

    if (!sourceKey || !targetKey || !relationType.trim()) {
      setError(t.required)
      return
    }

    if (sourceKey === targetKey) {
      setError(t.sameEntity)
      return
    }

    setSaving(true)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error('No user')

      const [sourceType, sourceId] = splitKey(sourceKey)
      const [targetType, targetId] = splitKey(targetKey)

      const payload = {
        campaign_id: campaignId,
        source_type: sourceType,
        source_id: sourceId,
        target_type: targetType,
        target_id: targetId,
        relationship_type: relationType.trim(),
        notes: relationNotes.trim() || null,
        visibility: isStaff ? visibility : 'shared',
        created_by: editing?.created_by ?? userData.user.id,
      }

      if (editing) {
        const { error: updateError } = await supabase
          .from('campaign_relationships')
          .update(payload)
          .eq('id', editing.id)
          .eq('campaign_id', campaignId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('campaign_relationships')
          .insert(payload)

        if (insertError) throw insertError
      }

      setRelationModal(false)
      await load()
    } catch (saveError) {
      console.error('Relationship save error:', saveError)
      setError(t.errorSave)
    } finally {
      setSaving(false)
    }
  }

  const deleteRelationship = async (relationship: RelationshipRecord) => {
    const accepted = await confirmAction({
      title: t.deleteTitle,
      message: t.deleteBody,
      confirmLabel: t.deleteConfirm,
      cancelLabel: t.cancel,
      variant: 'danger',
    })

    if (!accepted) return

    const { error: deleteError } = await supabase
      .from('campaign_relationships')
      .delete()
      .eq('id', relationship.id)
      .eq('campaign_id', campaignId)

    if (deleteError) {
      setError(t.errorSave)
      return
    }

    setRelationships((current) =>
      current.filter((item) => item.id !== relationship.id),
    )
  }

  const createFaction = async (event: FormEvent) => {
    event.preventDefault()
    if (!factionName.trim()) return

    setSaving(true)
    setError('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw userError ?? new Error('No user')

      const { error: insertError } = await supabase
        .from('organizations')
        .insert({
          campaign_id: campaignId,
          name: factionName.trim(),
          organization_type: factionType.trim() || null,
          description: factionDescription.trim() || null,
          visibility: isStaff ? factionVisibility : 'shared',
          created_by: userData.user.id,
        })

      if (insertError) throw insertError

      setFactionName('')
      setFactionType('')
      setFactionDescription('')
      setFactionVisibility('shared')
      setFactionModal(false)
      await load()
    } catch (factionError) {
      console.error('Faction create error:', factionError)
      setError(t.errorSave)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="cc-relationships">
      <header className="cc-relationships__header">
        <div className="cc-relationships__heading">
          <p>{t.kicker}</p>
          <h2><LuNetwork /> {t.title}</h2>
          <span>{t.intro}</span>
        </div>

        <div className="cc-relationships__actions">
          <button
            type="button"
            className="cc-rel-btn cc-rel-btn--ghost"
            onClick={() => setFactionModal(true)}
          >
            <LuBuilding2 />
            {t.addFaction}
          </button>

          <button
            type="button"
            className="cc-rel-btn cc-rel-btn--gold"
            onClick={openNewRelationship}
          >
            <LuCirclePlus />
            {t.addRelation}
          </button>
        </div>
      </header>

      {error && <div className="cc-rel-error">{error}</div>}

      <div className="cc-rel-toolbar">
        <label className="cc-rel-search">
          <LuSearch />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
          />
        </label>

        <div className="cc-rel-filters">
          {([
            ['all', t.all],
            ['character', t.character],
            ['npc', t.npc],
            ['organization', t.organization],
            ['location', t.location],
            ['quest', t.quest],
            ['item', t.item],
          ] as const).map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={filter === value ? 'is-active' : ''}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="cc-rel-stage">
        {loading ? (
          <div className="cc-rel-state">
            <LuNetwork />
            <span>{t.loading}</span>
          </div>
        ) : entities.length === 0 ? (
          <div className="cc-rel-state">
            <LuNetwork />
            <h3>{t.emptyTitle}</h3>
            <p>{t.emptyBody}</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) =>
              setSelectedKey((current) =>
                current === node.id ? null : node.id,
              )
            }
            onNodeDragStop={(_, node) =>
              persistPosition(node as ChronicleNode)
            }
            onPaneClick={() => setSelectedKey(null)}
            fitView
            fitViewOptions={{ padding: 0.22, maxZoom: 1 }}
            minZoom={0.25}
            maxZoom={1.65}
            nodesConnectable={false}
            deleteKeyCode={null}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              gap={30}
              size={1}
              color="rgba(200, 175, 120, .075)"
            />
            <Controls
              position="bottom-left"
              showInteractive={false}
            />
            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              maskColor="rgba(5, 8, 12, .74)"
              nodeColor="#806b45"
            />
          </ReactFlow>
        )}

        <div className="cc-rel-stage__hint">
          {t.hint}
        </div>

        {selectedEntity && (
          <aside className="cc-rel-inspector">
            <div className="cc-rel-inspector__top">
              <div>
                <small>{t.selected}</small>
                <h3>{selectedEntity.name}</h3>
                <p>{selectedEntity.subtitle}</p>
              </div>
              <button type="button" onClick={() => setSelectedKey(null)}>
                <LuX />
              </button>
            </div>

            <div className="cc-rel-inspector__title">
              <span>{t.connections}</span>
              <strong>{selectedRelationships.length}</strong>
            </div>

            <div className="cc-rel-inspector__list">
              {selectedRelationships.length === 0 ? (
                <p className="cc-rel-inspector__empty">
                  {t.noConnections}
                </p>
              ) : (
                selectedRelationships.map((relationship) => {
                  const source = nodeKey(
                    relationship.source_type,
                    relationship.source_id,
                  )
                  const target = nodeKey(
                    relationship.target_type,
                    relationship.target_id,
                  )
                  const selectedIsSource = source === selectedKey
                  const otherKey = selectedIsSource ? target : source
                  const other = entityMap.get(otherKey)

                  if (!other) return null

                  return (
                    <article
                      key={relationship.id}
                      className="cc-rel-connection"
                    >
                      <div className="cc-rel-connection__flow">
                        <button
                          type="button"
                          onClick={() => setSelectedKey(otherKey)}
                        >
                          {other.name}
                        </button>

                        <span>
                          {selectedIsSource ? '→' : '←'}
                          {' '}
                          {relationship.relationship_type}
                        </span>
                      </div>

                      {relationship.visibility === 'gm_only' && (
                        <small className="cc-rel-private">
                          <LuEyeOff />
                          {t.privateConnection}
                        </small>
                      )}

                      {relationship.notes && (
                        <p>{relationship.notes}</p>
                      )}

                      <div className="cc-rel-connection__actions">
                        <button
                          type="button"
                          onClick={() => openEditRelationship(relationship)}
                        >
                          <LuPencil />
                          {t.edit}
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => void deleteRelationship(relationship)}
                        >
                          <LuTrash2 />
                          {t.remove}
                        </button>
                      </div>
                    </article>
                  )
                })
              )}
            </div>

            <button
              type="button"
              className="cc-rel-inspector__add"
              onClick={openNewRelationship}
            >
              <LuCirclePlus />
              {t.addRelation}
            </button>
          </aside>
        )}

        {!selectedEntity && !loading && (
          <div className="cc-rel-stage__selection-hint">
            <LuNetwork />
            {t.inspectorHint}
          </div>
        )}
      </div>

      {relationModal && (
        <div
          className="cc-rel-modal-backdrop"
          onMouseDown={() => setRelationModal(false)}
        >
          <form
            className="cc-rel-modal"
            onSubmit={saveRelationship}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cc-rel-modal__header">
              <div>
                <small>{t.kicker}</small>
                <h3>{editing ? t.edit : t.addRelation}</h3>
              </div>
              <button type="button" onClick={() => setRelationModal(false)}>
                <LuX />
              </button>
            </div>

            <div className="cc-rel-builder">
              <label>
                <span>{t.source}</span>
                <select
                  value={sourceKey}
                  onChange={(event) => setSourceKey(event.target.value)}
                  required
                >
                  <option value="">{t.chooseEntity}</option>
                  {entities.map((entity) => (
                    <option
                      key={nodeKey(entity.type, entity.id)}
                      value={nodeKey(entity.type, entity.id)}
                    >
                      {entity.name} · {entity.subtitle}
                    </option>
                  ))}
                </select>
              </label>

              <div className="cc-rel-builder__line" />

              <label>
                <span>{t.relation}</span>
                <input
                  value={relationType}
                  onChange={(event) => setRelationType(event.target.value)}
                  placeholder={t.relationPlaceholder}
                  maxLength={80}
                  required
                />
              </label>

              <div className="cc-rel-builder__line" />

              <label>
                <span>{t.target}</span>
                <select
                  value={targetKey}
                  onChange={(event) => setTargetKey(event.target.value)}
                  required
                >
                  <option value="">{t.chooseEntity}</option>
                  {entities.map((entity) => (
                    <option
                      key={nodeKey(entity.type, entity.id)}
                      value={nodeKey(entity.type, entity.id)}
                    >
                      {entity.name} · {entity.subtitle}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="cc-rel-field">
              <span>{t.notes}</span>
              <textarea
                value={relationNotes}
                onChange={(event) => setRelationNotes(event.target.value)}
                maxLength={1200}
              />
            </label>

            {isStaff && (
              <div className="cc-rel-visibility">
                <span>{t.visibility}</span>
                <button
                  type="button"
                  className={visibility === 'shared' ? 'is-active' : ''}
                  onClick={() => setVisibility('shared')}
                >
                  <LuEye />
                  {t.shared}
                </button>
                <button
                  type="button"
                  className={visibility === 'gm_only' ? 'is-active' : ''}
                  onClick={() => setVisibility('gm_only')}
                >
                  <LuEyeOff />
                  {t.gmOnly}
                </button>
              </div>
            )}

            <div className="cc-rel-modal__actions">
              <button type="button" onClick={() => setRelationModal(false)}>
                {t.cancel}
              </button>
              <button type="submit" className="primary" disabled={saving}>
                {editing ? t.update : t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {factionModal && (
        <div
          className="cc-rel-modal-backdrop"
          onMouseDown={() => setFactionModal(false)}
        >
          <form
            className="cc-rel-modal"
            onSubmit={createFaction}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cc-rel-modal__header">
              <div>
                <small>{t.organization}</small>
                <h3>{t.factionTitle}</h3>
              </div>
              <button type="button" onClick={() => setFactionModal(false)}>
                <LuX />
              </button>
            </div>

            <label className="cc-rel-field">
              <span>{t.factionName}</span>
              <input
                value={factionName}
                onChange={(event) => setFactionName(event.target.value)}
                placeholder={t.factionNamePlaceholder}
                maxLength={120}
                required
              />
            </label>

            <label className="cc-rel-field">
              <span>{t.factionType}</span>
              <input
                value={factionType}
                onChange={(event) => setFactionType(event.target.value)}
                placeholder={t.factionTypePlaceholder}
                maxLength={80}
              />
            </label>

            <label className="cc-rel-field">
              <span>{t.factionDescription}</span>
              <textarea
                value={factionDescription}
                onChange={(event) => setFactionDescription(event.target.value)}
                maxLength={2200}
              />
            </label>

            {isStaff && (
              <div className="cc-rel-visibility">
                <span>{t.visibility}</span>
                <button
                  type="button"
                  className={factionVisibility === 'shared' ? 'is-active' : ''}
                  onClick={() => setFactionVisibility('shared')}
                >
                  <LuEye />
                  {t.shared}
                </button>
                <button
                  type="button"
                  className={factionVisibility === 'gm_only' ? 'is-active' : ''}
                  onClick={() => setFactionVisibility('gm_only')}
                >
                  <LuEyeOff />
                  {t.gmOnly}
                </button>
              </div>
            )}

            <div className="cc-rel-modal__actions">
              <button type="button" onClick={() => setFactionModal(false)}>
                {t.cancel}
              </button>
              <button type="submit" className="primary" disabled={saving}>
                {t.createFaction}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

function RelationshipsSection(props: RelationshipsSectionProps) {
  return (
    <ReactFlowProvider>
      <RelationshipsCanvas {...props} />
    </ReactFlowProvider>
  )
}

export default RelationshipsSection
