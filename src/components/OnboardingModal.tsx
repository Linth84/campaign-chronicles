import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { LuArrowLeft, LuArrowRight, LuBookOpen, LuCompass, LuMapPinned, LuNetwork, LuPlus, LuShieldCheck, LuSparkles, LuUpload, LuX, LuZap } from 'react-icons/lu'
import './OnboardingModal.css'

type Language = 'en' | 'es'
type TourPhase = 'dashboard' | 'campaign'

type TourStep = {
  icon: typeof LuSparkles
  eyebrow: string
  title: string
  text: string
  target?: string
  activate?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

interface OnboardingModalProps {
  language: Language
  open: boolean
  phase: TourPhase
  onClose: () => void
  onPhaseComplete: (phase: TourPhase) => void
}

type Rect = { top: number; left: number; width: number; height: number }

function OnboardingModal({ language, open, phase, onClose, onPhaseComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const es = language === 'es'

  const steps = useMemo<TourStep[]>(() => {
    if (phase === 'dashboard') {
      return es ? [
        { icon: LuSparkles, eyebrow: 'Bienvenido', title: 'Este es tu punto de partida.', text: 'En vez de contarte cómo funciona todo en una tarjeta, te vamos a mostrar la interfaz real. El recorrido es corto y podés salir cuando quieras.', placement: 'center' },
        { icon: LuPlus, eyebrow: 'Nueva crónica', title: 'Crear una campaña', text: 'Si empezás desde cero, este botón abre el formulario para crear tu campaña y definir sistema, grupo, descripción y fecha de inicio.', target: '[data-tour="create-campaign"]', placement: 'bottom' },
        { icon: LuUpload, eyebrow: 'Traé lo que ya tenés', title: 'Importar una campaña', text: 'Si ya tenés notas, podés importar TXT, DOCX o PDF y revisar la información antes de crear la campaña.', target: '[data-tour="import-campaign"]', placement: 'bottom' },
        { icon: LuBookOpen, eyebrow: 'Tus campañas', title: 'Entrá a una crónica para seguir.', text: 'Tus campañas aparecen acá. Abrí cualquiera para continuar el recorrido dentro de una campaña. Si todavía no tenés una, creá o importá la primera y el tour seguirá automáticamente.', target: '[data-tour="campaign-list"]', placement: 'top' },
      ] : [
        { icon: LuSparkles, eyebrow: 'Welcome', title: 'This is your starting point.', text: 'Instead of explaining everything in a card, we will show you the real interface. The tour is short and you can leave at any time.', placement: 'center' },
        { icon: LuPlus, eyebrow: 'New chronicle', title: 'Create a campaign', text: 'Starting from scratch? This button opens the form to define your campaign, system, party, description and start date.', target: '[data-tour="create-campaign"]', placement: 'bottom' },
        { icon: LuUpload, eyebrow: 'Bring what you already have', title: 'Import a campaign', text: 'If you already have notes, import TXT, DOCX or PDF and review the information before creating the campaign.', target: '[data-tour="import-campaign"]', placement: 'bottom' },
        { icon: LuBookOpen, eyebrow: 'Your campaigns', title: 'Open a chronicle to continue.', text: 'Your campaigns live here. Open one to continue the tour inside the campaign. If you do not have one yet, create or import your first and the tour will resume automatically.', target: '[data-tour="campaign-list"]', placement: 'top' },
      ]
    }

    return es ? [
      { icon: LuCompass, eyebrow: 'Dentro de la campaña', title: 'Esta barra es tu mapa.', text: 'Desde acá cambiás entre resumen, sesiones, personajes, NPCs, lugares, facciones, relaciones, mapas y el resto de tu crónica.', target: '[data-tour="campaign-sidebar"]', placement: 'right' },
      { icon: LuNetwork, eyebrow: 'El mundo conectado', title: 'Relaciones', text: 'Acá ves cómo se conectan personajes, NPCs, facciones, lugares y objetos. Te abrimos la pantalla para que veas dónde vive.', activate: '[data-tour="nav-relationships"]', target: '[data-tour="campaign-content"]', placement: 'left' },
      { icon: LuMapPinned, eyebrow: 'Exploración', title: 'Mapas y pins', text: 'Los mapas compartidos viven en esta sección. El GM decide qué mapas y pins están revelados a los jugadores.', activate: '[data-tour="nav-maps"]', target: '[data-tour="campaign-content"]', placement: 'left' },
      { icon: LuShieldCheck, eyebrow: 'Preparación privada', title: 'GM Tools', text: 'Si sos GM o co-GM, este grupo despliega notas privadas, Session Planner, Secrets, Clues, Plot Threads, Map Manager y GM Screen.', activate: '[data-tour="gm-tools-toggle"]', target: '[data-tour="gm-tools-group"]', placement: 'right' },
      { icon: LuZap, eyebrow: 'Durante la partida', title: 'Quick Capture', text: 'Este botón está siempre a mano para anotar una idea sin cortar el ritmo. Después podés convertir esas capturas en contenido permanente.', activate: '[data-tour="quick-capture-fab"]', target: '[data-tour="quick-capture-panel"]', placement: 'left' },
      { icon: LuSparkles, eyebrow: 'Listo', title: 'Ya sabés dónde está todo.', text: 'No hace falta memorizar cada función. Tutoriales queda disponible cuando quieras profundizar, y podés volver a ejecutar esta introducción desde ahí.', placement: 'center' },
    ] : [
      { icon: LuCompass, eyebrow: 'Inside the campaign', title: 'This sidebar is your map.', text: 'Use it to move between overview, sessions, characters, NPCs, locations, factions, relationships, maps and the rest of your chronicle.', target: '[data-tour="campaign-sidebar"]', placement: 'right' },
      { icon: LuNetwork, eyebrow: 'A connected world', title: 'Relationships', text: 'See how characters, NPCs, factions, locations and items connect. We opened the actual screen so you can see where it lives.', activate: '[data-tour="nav-relationships"]', target: '[data-tour="campaign-content"]', placement: 'left' },
      { icon: LuMapPinned, eyebrow: 'Exploration', title: 'Maps and pins', text: 'Shared maps live here. The GM controls which maps and pins are revealed to players.', activate: '[data-tour="nav-maps"]', target: '[data-tour="campaign-content"]', placement: 'left' },
      { icon: LuShieldCheck, eyebrow: 'Private preparation', title: 'GM Tools', text: 'If you are a GM or co-GM, this group contains private notes, Session Planner, Secrets, Clues, Plot Threads, Map Manager and GM Screen.', activate: '[data-tour="gm-tools-toggle"]', target: '[data-tour="gm-tools-group"]', placement: 'right' },
      { icon: LuZap, eyebrow: 'During play', title: 'Quick Capture', text: 'This button is always within reach for jotting down an idea without breaking the flow. You can turn captures into permanent campaign content later.', activate: '[data-tour="quick-capture-fab"]', target: '[data-tour="quick-capture-panel"]', placement: 'left' },
      { icon: LuSparkles, eyebrow: 'All set', title: 'Now you know where everything lives.', text: 'You do not need to memorize every feature. Tutorials is always available when you want a deeper explanation, and you can replay this introduction there.', placement: 'center' },
    ]
  }, [es, phase])

  const current = steps[Math.min(step, steps.length - 1)]

  useEffect(() => {
    if (open) setStep(0)
  }, [open, phase])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    let timeout = 0

    const resolveTarget = () => {
      if (cancelled) return

      if (current.activate) {
        const activator = document.querySelector<HTMLElement>(current.activate)
        if (activator) activator.click()
      }

      timeout = window.setTimeout(() => {
        if (cancelled || !current.target) {
          setTargetRect(null)
          return
        }
        const element = document.querySelector<HTMLElement>(current.target)
        if (!element) {
          setTargetRect(null)
          return
        }
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
        window.setTimeout(() => {
          const rect = element.getBoundingClientRect()
          setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
        }, 180)
      }, current.activate ? 220 : 40)
    }

    resolveTarget()
    const onResize = () => resolveTarget()
    window.addEventListener('resize', onResize)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      window.removeEventListener('resize', onResize)
    }
  }, [current, open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') {
        if (step === steps.length - 1) onPhaseComplete(phase)
        else setStep(value => value + 1)
      }
      if (event.key === 'ArrowLeft' && step > 0) setStep(value => value - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, onPhaseComplete, open, phase, step, steps.length])

  if (!open) return null
  const Icon = current.icon

  const cardStyle: CSSProperties = {}
  if (targetRect && current.placement !== 'center') {
    const gap = 18
    const cardWidth = Math.min(390, window.innerWidth - 32)
    if (current.placement === 'right') {
      cardStyle.left = Math.min(targetRect.left + targetRect.width + gap, window.innerWidth - cardWidth - 16)
      cardStyle.top = Math.max(16, Math.min(targetRect.top, window.innerHeight - 320))
    } else if (current.placement === 'left') {
      cardStyle.left = Math.max(16, targetRect.left - cardWidth - gap)
      cardStyle.top = Math.max(16, Math.min(targetRect.top, window.innerHeight - 320))
    } else if (current.placement === 'top') {
      cardStyle.left = Math.max(16, Math.min(targetRect.left, window.innerWidth - cardWidth - 16))
      cardStyle.top = Math.max(16, targetRect.top - 300)
    } else {
      cardStyle.left = Math.max(16, Math.min(targetRect.left, window.innerWidth - cardWidth - 16))
      cardStyle.top = Math.min(window.innerHeight - 300, targetRect.top + targetRect.height + gap)
    }
  }

  return (
    <div className="onboarding-backdrop onboarding-backdrop--tour" role="dialog" aria-modal="true" aria-label={es ? 'Recorrido de Campaign Chronicles' : 'Campaign Chronicles tour'}>
      {targetRect && (
        <div
          className="onboarding-spotlight"
          style={{ top: targetRect.top - 7, left: targetRect.left - 7, width: targetRect.width + 14, height: targetRect.height + 14 }}
        />
      )}

      <section className={`onboarding-card onboarding-card--tour ${targetRect ? 'is-anchored' : 'is-centered'}`} style={cardStyle}>
        <button type="button" className="onboarding-close" onClick={onClose} aria-label={es ? 'Cerrar' : 'Close'}><LuX /></button>
        <div className="onboarding-mark"><Icon /></div>
        <span className="onboarding-eyebrow">{current.eyebrow}</span>
        <h2>{current.title}</h2>
        <p>{current.text}</p>

        <div className="onboarding-progress" aria-label={`${step + 1}/${steps.length}`}>
          {steps.map((_, index) => <span key={index} className={index === step ? 'active' : index < step ? 'done' : ''} />)}
        </div>

        <div className="onboarding-actions">
          <button type="button" className="onboarding-skip" onClick={onClose}>{es ? 'Salir del recorrido' : 'Exit tour'}</button>
          <div className="onboarding-nav">
            {step > 0 && <button type="button" className="onboarding-secondary" onClick={() => setStep(value => value - 1)}><LuArrowLeft />{es ? 'Anterior' : 'Back'}</button>}
            <button type="button" className="onboarding-primary" onClick={() => step === steps.length - 1 ? onPhaseComplete(phase) : setStep(value => value + 1)}>
              {step === steps.length - 1 ? (phase === 'dashboard' ? (es ? 'Entendido' : 'Got it') : (es ? 'Terminar' : 'Finish')) : (es ? 'Siguiente' : 'Next')}
              {step < steps.length - 1 && <LuArrowRight />}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default OnboardingModal
