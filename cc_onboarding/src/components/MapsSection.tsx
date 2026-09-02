import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, MouseEvent } from 'react'
import { LuCrosshair, LuEye, LuEyeOff, LuImagePlus, LuLock, LuMapPinned, LuMinus, LuPlus, LuSave, LuTrash2, LuUsers, LuX } from 'react-icons/lu'
import { useConfirm } from './ConfirmProvider'
import { supabase } from '../utils/supabase'
import { CAMPAIGN_IMAGE_BUCKET, resolveCampaignImageUrl } from '../utils/campaignImages'

type Language = 'en' | 'es'
type Role = 'gm' | 'co_gm' | 'player'
type PinType = 'location' | 'party' | 'npc' | 'faction' | 'custom'
type EntityKind = 'locations' | 'npcs' | 'factions'

type MapRow = { id:string; campaign_id:string; name:string; description:string|null; image_path:string; is_revealed:boolean; created_at:string }
type PinRow = { id:string; map_id:string; campaign_id:string; pin_type:PinType; label:string; description:string|null; color:string; x:number; y:number; is_revealed:boolean; linked_entity_type:EntityKind|null; linked_entity_id:string|null }
type Entity = { id:string; name:string; kind:EntityKind }

type Props = { language:Language; campaignId:string; campaignRole:Role|null; mode?:'player'|'manager' }

const text = {
  es: { title:'Mapas', eyebrow:'ATLAS DE CAMPAÑA', intro:'Subí mapas de tu mundo, regiones o lugares y marcá dónde están las cosas importantes.', newMap:'Nuevo mapa', mapName:'Nombre del mapa', desc:'Descripción', image:'Imagen del mapa', choose:'Elegir JPG, PNG o WebP', save:'Guardar mapa', cancel:'Cancelar', empty:'Todavía no hay mapas en esta campaña.', emptyHint:'Creá el primero para empezar a construir el atlas de la campaña.', select:'Seleccioná un mapa', addPin:'Agregar pin', pinHint:'Elegí “Agregar pin” y hacé clic sobre el mapa.', pinName:'Nombre del pin', pinDesc:'Descripción', type:'Tipo', linked:'Vincular con', none:'Sin vínculo', location:'Lugar', party:'Party', npc:'NPC', faction:'Facción', custom:'Personalizado', savePin:'Guardar pin', deleteMap:'Eliminar mapa', deletePin:'Eliminar pin', zoomIn:'Acercar', zoomOut:'Alejar', reset:'Restablecer vista', loadErr:'No pudimos cargar los mapas.', setupErr:'Maps todavía no está inicializado en Supabase. Ejecutá la migración de Campaign Maps y recargá la página.', permissionErr:'No tenés permiso para consultar los mapas de esta campaña.', saveErr:'No pudimos guardar el mapa.', pinErr:'No pudimos guardar el pin.', fileErr:'Elegí una imagen JPG, PNG o WebP de hasta 10 MB.', confirmMap:'Este mapa y todos sus pins se eliminarán de forma permanente.', confirmPin:'Este pin se eliminará del mapa de forma permanente.', deleteMapTitle:'Eliminar mapa', deletePinTitle:'Eliminar pin', deleteConfirm:'Eliminar', deletePinConfirm:'Eliminar pin', pins:'Pins', noPins:'Este mapa todavía no tiene pins.', partyHere:'Ubicación de la party', readOnly:'Esta vista muestra exactamente el atlas revelado a los jugadores.', managerTitle:'Gestión de mapas', managerIntro:'Prepará mapas privados, pins secretos y decidí exactamente qué conoce la party.', privateMap:'Solo GM', revealedMap:'Revelado', revealMap:'Revelar mapa', hideMap:'Ocultar mapa', privatePin:'Solo GM', revealedPin:'Revelado', revealPin:'Revelar pin', hidePin:'Ocultar pin', compressed:'La imagen se optimiza automáticamente a WebP antes de subirla.', color:'Color'  },
  en: { title:'Maps', eyebrow:'CAMPAIGN ATLAS', intro:'Upload maps of your world, regions or locations and mark where important things are.', newMap:'New map', mapName:'Map name', desc:'Description', image:'Map image', choose:'Choose JPG, PNG or WebP', save:'Save map', cancel:'Cancel', empty:'There are no maps in this campaign yet.', emptyHint:'Create the first one to start building your campaign atlas.', select:'Select a map', addPin:'Add pin', pinHint:'Choose “Add pin” and click on the map.', pinName:'Pin name', pinDesc:'Description', type:'Type', linked:'Link to', none:'No link', location:'Location', party:'Party', npc:'NPC', faction:'Faction', custom:'Custom', savePin:'Save pin', deleteMap:'Delete map', deletePin:'Delete pin', zoomIn:'Zoom in', zoomOut:'Zoom out', reset:'Reset view', loadErr:'We could not load the maps.', setupErr:'Maps is not initialized in Supabase yet. Run the Campaign Maps migration and reload the page.', permissionErr:'You do not have permission to read this campaign atlas.', saveErr:'We could not save the map.', pinErr:'We could not save the pin.', fileErr:'Choose a JPG, PNG or WebP image up to 10 MB.', confirmMap:'This map and all of its pins will be permanently deleted.', confirmPin:'This pin will be permanently removed from the map.', deleteMapTitle:'Delete map', deletePinTitle:'Delete pin', deleteConfirm:'Delete', deletePinConfirm:'Delete pin', pins:'Pins', noPins:'This map does not have any pins yet.', partyHere:'Party location', readOnly:'This view shows exactly the atlas revealed to players.', managerTitle:'Map Manager', managerIntro:'Prepare private maps, secret pins and decide exactly what the party knows.', privateMap:'GM only', revealedMap:'Revealed', revealMap:'Reveal map', hideMap:'Hide map', privatePin:'GM only', revealedPin:'Revealed', revealPin:'Reveal pin', hidePin:'Hide pin', compressed:'The image is automatically optimized to WebP before upload.', color:'Color'  },
}

async function optimizeMapImage(file:File):Promise<Blob>{
  const bitmap=await createImageBitmap(file)
  const maxSide=4000
  const ratio=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height))
  const canvas=document.createElement('canvas')
  canvas.width=Math.max(1,Math.round(bitmap.width*ratio)); canvas.height=Math.max(1,Math.round(bitmap.height*ratio))
  const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('CANVAS')
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close()
  return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('WEBP')),'image/webp',.85))
}

export default function MapsSection({ language, campaignId, campaignRole, mode='player' }:Props) {
  const t = text[language]
  const isGm = campaignRole === 'gm' || campaignRole === 'co_gm'
  const canEdit = isGm && mode === 'manager'
  const confirmAction = useConfirm()
  const [maps,setMaps] = useState<MapRow[]>([])
  const [pins,setPins] = useState<PinRow[]>([])
  const [entities,setEntities] = useState<Entity[]>([])
  const [selectedId,setSelectedId] = useState<string>('')
  const [imageUrl,setImageUrl] = useState('')
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [mapEditor,setMapEditor] = useState(false)
  const [mapName,setMapName] = useState('')
  const [mapDescription,setMapDescription] = useState('')
  const [mapFile,setMapFile] = useState<File|null>(null)
  const [saving,setSaving] = useState(false)
  const [placing,setPlacing] = useState(false)
  const [draftPoint,setDraftPoint] = useState<{x:number;y:number}|null>(null)
  const [pinType,setPinType] = useState<PinType>('custom')
  const [pinLabel,setPinLabel] = useState('')
  const [pinDescription,setPinDescription] = useState('')
  const [pinColor,setPinColor] = useState('#c4a45a')
  const [linked,setLinked] = useState('')
  const [selectedPin,setSelectedPin] = useState<PinRow|null>(null)
  const [zoom,setZoom] = useState(1)
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{x:number;y:number;left:number;top:number;moved:boolean}|null>(null)
  const suppressClickRef = useRef(false)

  const selectedMap = maps.find(m => m.id === selectedId) ?? null
  const visibleMaps = useMemo(() => mode === 'manager' ? maps : maps.filter(m => m.is_revealed), [maps, mode])
  const mapPins = useMemo(() => pins.filter(p => p.map_id === selectedId && (mode === 'manager' || p.is_revealed)),[pins,selectedId,mode])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const [mapRes,pinRes,locations,npcs,factions] = await Promise.all([
      supabase.from('campaign_maps').select('*').eq('campaign_id',campaignId).order('created_at'),
      supabase.from('campaign_map_pins').select('*').eq('campaign_id',campaignId).order('created_at'),
      supabase.from('locations').select('id,name').eq('campaign_id',campaignId).order('name'),
      supabase.from('npcs').select('id,name').eq('campaign_id',campaignId).order('name'),
      supabase.from('organizations').select('id,name').eq('campaign_id',campaignId).order('name'),
    ])
    if (mapRes.error || pinRes.error) {
      const dbError = mapRes.error || pinRes.error
      console.error('Campaign Maps load error:', dbError)
      const code = dbError?.code ?? ''
      if (code === '42P01' || code === 'PGRST205') setError(t.setupErr)
      else if (code === '42501') setError(t.permissionErr)
      else setError(t.loadErr)
      setLoading(false)
      return
    }
    const loadedMaps=(mapRes.data??[]) as MapRow[]; setMaps(loadedMaps); setPins((pinRes.data??[]) as PinRow[])
    setEntities([
      ...(locations.data??[]).map(e=>({...e,kind:'locations' as const})),
      ...(npcs.data??[]).map(e=>({...e,kind:'npcs' as const})),
      ...(factions.data??[]).map(e=>({...e,kind:'factions' as const})),
    ])
    const selectable = mode === 'manager' ? loadedMaps : loadedMaps.filter(m=>m.is_revealed)
    setSelectedId(current => current && selectable.some(m=>m.id===current) ? current : (selectable[0]?.id ?? ''))
    setLoading(false)
  },[campaignId,t.loadErr,mode])

  useEffect(()=>{ void load() },[load])
  useEffect(()=>{ setZoom(1); setPlacing(false); setDraftPoint(null); setSelectedPin(null) },[selectedId])
  useEffect(()=>{
    let alive=true
    if (!selectedMap) { setImageUrl(''); return }
    void resolveCampaignImageUrl(selectedMap.image_path).then(url=>{ if(alive) setImageUrl(url??'') })
    return ()=>{ alive=false }
  },[selectedMap])

  const uploadMap = async (event:FormEvent) => {
    event.preventDefault(); if(!mapFile || !mapName.trim()) return
    if(!['image/jpeg','image/png','image/webp'].includes(mapFile.type) || mapFile.size>10*1024*1024){ setError(t.fileErr); return }
    setSaving(true); setError('')
    try {
      const {data:userData}=await supabase.auth.getUser(); if(!userData.user) throw new Error('AUTH')
      const id=crypto.randomUUID(); const optimized=await optimizeMapImage(mapFile); const path=`${campaignId}/maps/${id}.webp`
      const up=await supabase.storage.from(CAMPAIGN_IMAGE_BUCKET).upload(path,optimized,{contentType:'image/webp',upsert:false,cacheControl:'3600'}); if(up.error) throw up.error
      const insert=await supabase.from('campaign_maps').insert({id,campaign_id:campaignId,name:mapName.trim(),description:mapDescription.trim()||null,image_path:path,is_revealed:false,created_by:userData.user.id}).select('*').single()
      if(insert.error){ await supabase.storage.from(CAMPAIGN_IMAGE_BUCKET).remove([path]); throw insert.error }
      setMaps(current=>[...current,insert.data as MapRow]); setSelectedId(id); setMapEditor(false); setMapName(''); setMapDescription(''); setMapFile(null)
    } catch(e){ console.error(e); setError(t.saveErr) } finally { setSaving(false) }
  }

  const mapClick=(event:MouseEvent<HTMLDivElement>)=>{
    if(suppressClickRef.current){ suppressClickRef.current=false; return }
    if(!placing || !canEdit){ setSelectedPin(null); return }
    const rect=event.currentTarget.getBoundingClientRect(); const x=((event.clientX-rect.left)/rect.width)*100; const y=((event.clientY-rect.top)/rect.height)*100
    setDraftPoint({x:Math.max(0,Math.min(100,x)),y:Math.max(0,Math.min(100,y))}); setPinLabel(''); setPinDescription(''); setPinType('custom'); setPinColor('#c4a45a'); setLinked(''); setPlacing(false)
  }

  const savePin=async(event:FormEvent)=>{
    event.preventDefault(); if(!draftPoint || !selectedMap || !pinLabel.trim()) return
    const linkedEntity=entities.find(e=>`${e.kind}:${e.id}`===linked)
    const payload={map_id:selectedMap.id,campaign_id:campaignId,pin_type:pinType,label:pinLabel.trim(),description:pinDescription.trim()||null,color:pinColor,x:draftPoint.x,y:draftPoint.y,linked_entity_type:linkedEntity?.kind??null,linked_entity_id:linkedEntity?.id??null,is_revealed:pinType==='party'}
    const res=await supabase.from('campaign_map_pins').insert(payload).select('*').single()
    if(res.error){ console.error(res.error); setError(t.pinErr); return }
    setPins(current=>[...current,res.data as PinRow]); setDraftPoint(null)
  }

  const removeMap=async()=>{
    if(!selectedMap) return
    const accepted=await confirmAction({
      title:t.deleteMapTitle,
      message:`${t.confirmMap} ${language==='es'?'Mapa':'Map'}: “${selectedMap.name}”.`,
      confirmLabel:t.deleteConfirm,
      cancelLabel:t.cancel,
      variant:'danger',
    })
    if(!accepted) return
    const del=await supabase.from('campaign_maps').delete().eq('id',selectedMap.id)
    if(del.error){setError(t.saveErr);return}
    await supabase.storage.from(CAMPAIGN_IMAGE_BUCKET).remove([selectedMap.image_path])
    setMaps(current=>current.filter(m=>m.id!==selectedMap.id))
    setPins(current=>current.filter(p=>p.map_id!==selectedMap.id))
    setSelectedId(maps.find(m=>m.id!==selectedMap.id)?.id??'')
  }
  const removePin=async(pin:PinRow)=>{
    const accepted=await confirmAction({
      title:t.deletePinTitle,
      message:`${t.confirmPin} “${pin.label}”.`,
      confirmLabel:t.deletePinConfirm,
      cancelLabel:t.cancel,
      variant:'danger',
    })
    if(!accepted) return
    const del=await supabase.from('campaign_map_pins').delete().eq('id',pin.id)
    if(del.error){setError(t.pinErr);return}
    setPins(current=>current.filter(p=>p.id!==pin.id))
    setSelectedPin(null)
  }
  const startPan=(event:MouseEvent<HTMLDivElement>)=>{ if(placing || event.button!==0) return; const el=event.currentTarget; dragRef.current={x:event.clientX,y:event.clientY,left:el.scrollLeft,top:el.scrollTop,moved:false} }
  const movePan=(event:MouseEvent<HTMLDivElement>)=>{ const drag=dragRef.current; if(!drag) return; const dx=event.clientX-drag.x,dy=event.clientY-drag.y; if(Math.abs(dx)+Math.abs(dy)>4) drag.moved=true; event.currentTarget.scrollLeft=drag.left-dx; event.currentTarget.scrollTop=drag.top-dy }
  const endPan=()=>{ if(dragRef.current?.moved) suppressClickRef.current=true; dragRef.current=null }
  const entityName=(pin:PinRow)=>entities.find(e=>e.kind===pin.linked_entity_type&&e.id===pin.linked_entity_id)?.name
  const toggleMapVisibility=async(map:MapRow)=>{ const next=!map.is_revealed; const res=await supabase.from('campaign_maps').update({is_revealed:next}).eq('id',map.id); if(res.error){setError(t.saveErr);return} setMaps(current=>current.map(m=>m.id===map.id?{...m,is_revealed:next}:m)) }
  const togglePinVisibility=async(pin:PinRow)=>{ const next=!pin.is_revealed; const res=await supabase.from('campaign_map_pins').update({is_revealed:next}).eq('id',pin.id); if(res.error){setError(t.pinErr);return} setPins(current=>current.map(p=>p.id===pin.id?{...p,is_revealed:next}:p)); setSelectedPin({...pin,is_revealed:next}) }
  const typeLabel=(type:PinType)=>({location:t.location,party:t.party,npc:t.npc,faction:t.faction,custom:t.custom}[type])

  useEffect(()=>{
    if(!selectedPin) return
    const onKeyDown=(event:KeyboardEvent)=>{ if(event.key==='Escape') setSelectedPin(null) }
    window.addEventListener('keydown',onKeyDown)
    return ()=>window.removeEventListener('keydown',onKeyDown)
  },[selectedPin])

  if(loading) return <section className="maps-section"><div className="maps-loading">{t.title}…</div></section>

  return <section className="maps-section">
    <div className="maps-heading"><div><span className="maps-eyebrow">{mode==='manager'?t.managerTitle:t.eyebrow}</span><h2><LuMapPinned /> {mode==='manager'?t.managerTitle:t.title}</h2><p>{mode==='manager'?t.managerIntro:t.intro}</p></div>{canEdit&&<button className="gm-new-entry-button" onClick={()=>setMapEditor(true)}><LuPlus />{t.newMap}</button>}</div>
    {error&&<div className="maps-error">{error}</div>}
    {mode==='player'&&<div className="maps-readonly"><LuEye /> {t.readOnly}</div>}
    {mapEditor&&<form className="maps-editor" onSubmit={uploadMap}><div className="maps-editor-grid"><label>{t.mapName}<input value={mapName} onChange={e=>setMapName(e.target.value)} required /></label><label>{t.desc}<input value={mapDescription} onChange={e=>setMapDescription(e.target.value)} /></label><label className="maps-file">{t.image}<span><LuImagePlus /> {mapFile?.name||t.choose}</span><small className="maps-compression-note">{t.compressed}</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e:ChangeEvent<HTMLInputElement>)=>setMapFile(e.target.files?.[0]??null)} required /></label></div><div className="gm-editor-actions maps-editor-actions"><button type="button" className="gm-editor-button gm-editor-button-secondary" onClick={()=>setMapEditor(false)}><LuX aria-hidden="true"/><span>{t.cancel}</span></button><button type="submit" className="gm-editor-button gm-editor-button-primary" disabled={saving}><LuSave aria-hidden="true"/><span>{t.save}</span></button></div></form>}
    {!visibleMaps.length?<div className="maps-empty"><LuMapPinned /><h3>{t.empty}</h3><p>{t.emptyHint}</p></div>:<>
      <div className="maps-toolbar"><div className="maps-tabs">{visibleMaps.map(map=><button key={map.id} className={map.id===selectedId?'active':''} onClick={()=>setSelectedId(map.id)}>{map.name}</button>)}</div><div className="maps-controls"><button title={t.zoomOut} onClick={()=>setZoom(z=>Math.max(.6,z-.15))}><LuMinus /></button><span>{Math.round(zoom*100)}%</span><button title={t.zoomIn} onClick={()=>setZoom(z=>Math.min(2.5,z+.15))}><LuPlus /></button><button title={t.reset} onClick={()=>setZoom(1)}><LuCrosshair /></button>{canEdit&&<button className={placing?'active':''} onClick={()=>setPlacing(v=>!v)}><LuMapPinned />{t.addPin}</button>}{canEdit&&selectedMap&&<button className={selectedMap.is_revealed?'visibility revealed':'visibility private'} onClick={()=>toggleMapVisibility(selectedMap)}>{selectedMap.is_revealed?<LuEye/>:<LuEyeOff/>}{selectedMap.is_revealed?t.hideMap:t.revealMap}</button>}{canEdit&&<button className="danger" onClick={removeMap}><LuTrash2 />{t.deleteMap}</button>}</div></div>
      {selectedMap&&<div className="maps-workspace"><div className={`maps-viewport ${placing?'placing':''}`} onMouseDown={startPan} onMouseMove={movePan} onMouseUp={endPan} onMouseLeave={endPan}><div ref={stageRef} className="maps-stage" style={{transform:`scale(${zoom})`}} onClick={mapClick}>{imageUrl&&<img src={imageUrl} alt={selectedMap.name} draggable={false}/>} {mapPins.map(pin=><button key={pin.id} className={`map-pin map-pin-${pin.pin_type} ${!pin.is_revealed?'map-pin-private':''}`} style={{left:`${pin.x}%`,top:`${pin.y}%`,'--pin-color':pin.color||'#c4a45a'} as React.CSSProperties} onClick={e=>{e.stopPropagation();setSelectedPin(pin)}} title={pin.label}><span>{pin.pin_type==='party'?<LuUsers/>:<LuMapPinned/>}</span><b>{pin.label}</b></button>)}{draftPoint&&<span className="map-pin map-pin-draft" style={{left:`${draftPoint.x}%`,top:`${draftPoint.y}%`}}><span><LuPlus/></span></span>}</div></div>
        <aside className="maps-panel"><div><span className="maps-eyebrow">{selectedMap.name}</span>{selectedMap.description&&<p>{selectedMap.description}</p>}{placing&&<div className="maps-tip">{t.pinHint}</div>}</div>{draftPoint&&<form className="pin-editor" onSubmit={savePin}><h3>{t.addPin}</h3><label>{t.pinName}<input value={pinLabel} onChange={e=>setPinLabel(e.target.value)} required autoFocus /></label><label>{t.type}<select value={pinType} onChange={e=>setPinType(e.target.value as PinType)}><option value="custom">{t.custom}</option><option value="party">{t.party}</option><option value="location">{t.location}</option><option value="npc">{t.npc}</option><option value="faction">{t.faction}</option></select></label><label>{t.color}<div className="pin-color-palette">{['#c4a45a','#b85c55','#587ca8','#668c6b','#80699d','#bd7a45','#7b8088','#4d9a9a'].map(color=><button key={color} type="button" className={pinColor===color?'selected':''} style={{backgroundColor:color}} onClick={()=>setPinColor(color)} aria-label={color}/>)}</div></label><label>{t.linked}<select value={linked} onChange={e=>setLinked(e.target.value)}><option value="">{t.none}</option>{entities.filter(e=>pinType==='custom'||pinType==='party'||(pinType==='location'&&e.kind==='locations')||(pinType==='npc'&&e.kind==='npcs')||(pinType==='faction'&&e.kind==='factions')).map(e=><option key={`${e.kind}:${e.id}`} value={`${e.kind}:${e.id}`}>{e.name}</option>)}</select></label><label>{t.pinDesc}<textarea value={pinDescription} onChange={e=>setPinDescription(e.target.value)} rows={3}/></label><div className="gm-editor-actions maps-editor-actions"><button type="button" className="gm-editor-button gm-editor-button-secondary" onClick={()=>setDraftPoint(null)}><LuX aria-hidden="true"/><span>{t.cancel}</span></button><button className="gm-editor-button gm-editor-button-primary" type="submit"><LuSave aria-hidden="true"/><span>{t.savePin}</span></button></div></form>}
        {selectedPin&&<div className="pin-detail"><button type="button" className="pin-detail-close" onClick={()=>setSelectedPin(null)} aria-label={t.cancel} title={t.cancel}><LuX/></button><span className="maps-eyebrow">{typeLabel(selectedPin.pin_type)}</span><div className={`pin-visibility-badge ${selectedPin.is_revealed?'revealed':'private'}`}>{selectedPin.is_revealed?t.revealedPin:t.privatePin}</div><h3>{selectedPin.label}</h3>{selectedPin.description&&<p>{selectedPin.description}</p>}{entityName(selectedPin)&&<div className="pin-linked">{t.linked}: <strong>{entityName(selectedPin)}</strong></div>}{canEdit&&<button className={`maps-pin-visibility ${selectedPin.is_revealed?'revealed':'private'}`} onClick={()=>togglePinVisibility(selectedPin)}>{selectedPin.is_revealed?<LuEye/>:<LuLock/>}{selectedPin.is_revealed?t.hidePin:t.revealPin}</button>}{canEdit&&<button className="maps-delete-pin" onClick={()=>removePin(selectedPin)}><LuTrash2/>{t.deletePin}</button>}</div>}
        {!draftPoint&&!selectedPin&&<div className="maps-pin-list"><h3>{t.pins} <span>{mapPins.length}</span></h3>{mapPins.length?mapPins.map(pin=><div className="maps-pin-list-item" key={pin.id}><button className="maps-pin-open" onClick={()=>setSelectedPin(pin)}><span className="pin-dot" style={{backgroundColor:pin.color||'#c4a45a'}}/><span><strong>{pin.label}</strong><small>{pin.pin_type==='party'?t.partyHere:typeLabel(pin.pin_type)}</small></span></button><span className={`pin-visibility-badge ${pin.is_revealed?'revealed':'private'}`}>{pin.is_revealed?t.revealedPin:t.privatePin}</span>{canEdit&&<button type="button" className="maps-pin-quick-visibility" onClick={()=>togglePinVisibility(pin)}>{pin.is_revealed?<LuEyeOff/>:<LuEye/>}<span>{pin.is_revealed?t.hidePin:t.revealPin}</span></button>}</div>):<p>{t.noPins}</p>}</div>}</aside></div>}
    </>}
  </section>
}
