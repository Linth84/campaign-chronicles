import { useEffect, useMemo, useState } from 'react'
import { LuBookOpen, LuCompass, LuNetwork, LuShieldCheck, LuSparkles, LuX } from 'react-icons/lu'
import './OnboardingModal.css'

type Language = 'en' | 'es'

interface OnboardingModalProps {
  language: Language
  open: boolean
  onClose: () => void
}

function OnboardingModal({ language, open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const es = language === 'es'

  const steps = useMemo(() => es ? [
    { Icon: LuSparkles, eyebrow: 'Bienvenido', title: 'Tu campaña, sin perder el hilo.', text: 'Campaign Chronicles es la memoria de tu campaña: un lugar para guardar lo que pasó, organizar tu mundo y encontrar rápido lo que necesitás.' },
    { Icon: LuBookOpen, eyebrow: 'Tu crónica', title: 'Empezá como te resulte más cómodo.', text: 'Podés crear una campaña desde cero, importar una que ya tengas o actualizarla más adelante sin borrar lo que ya cargaste.' },
    { Icon: LuNetwork, eyebrow: 'Tu mundo', title: 'Conectá personas, lugares y facciones.', text: 'Personajes, NPCs, lugares, relaciones, facciones y mapas viven dentro de la misma crónica para que el mundo tenga contexto.' },
    { Icon: LuShieldCheck, eyebrow: 'Para el GM', title: 'Prepará sin revelar de más.', text: 'Usá secretos, pistas, hilos argumentales, Session Planner, GM Screen y mapas privados para preparar y dirigir la partida.' },
    { Icon: LuCompass, eyebrow: 'Todo listo', title: 'La crónica crece con la campaña.', text: 'Capturá ideas durante la partida, registrá sesiones y volvé a los Tutoriales cuando quieras profundizar en una función.' },
  ] : [
    { Icon: LuSparkles, eyebrow: 'Welcome', title: 'Keep your campaign story in sight.', text: 'Campaign Chronicles is your campaign memory: one place to record what happened, organize your world and quickly find what you need.' },
    { Icon: LuBookOpen, eyebrow: 'Your chronicle', title: 'Start the way that works for you.', text: 'Create a campaign from scratch, import one you already have, or update it later without deleting what is already there.' },
    { Icon: LuNetwork, eyebrow: 'Your world', title: 'Connect people, places and factions.', text: 'Characters, NPCs, locations, relationships, factions and maps live in the same chronicle so your world keeps its context.' },
    { Icon: LuShieldCheck, eyebrow: 'For the GM', title: 'Prepare without revealing too much.', text: 'Use secrets, clues, plot threads, Session Planner, GM Screen and private maps to prepare and run your game.' },
    { Icon: LuCompass, eyebrow: 'You are ready', title: 'Your chronicle grows with the campaign.', text: 'Capture ideas during play, record sessions and return to Tutorials whenever you want a deeper look at a feature.' },
  ], [es])

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight' && step < steps.length - 1) setStep(current => current + 1)
      if (event.key === 'ArrowLeft' && step > 0) setStep(current => current - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open, step, steps.length])

  if (!open) return null
  const current = steps[step]

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-label={es ? 'Introducción a Campaign Chronicles' : 'Campaign Chronicles introduction'}>
      <section className="onboarding-card">
        <button type="button" className="onboarding-close" onClick={onClose} aria-label={es ? 'Cerrar' : 'Close'}><LuX /></button>
        <div className="onboarding-mark"><current.Icon /></div>
        <span className="onboarding-eyebrow">{current.eyebrow}</span>
        <h2>{current.title}</h2>
        <p>{current.text}</p>
        <div className="onboarding-progress" aria-label={`${step + 1}/${steps.length}`}>
          {steps.map((_, index) => <span key={index} className={index === step ? 'active' : index < step ? 'done' : ''} />)}
        </div>
        <div className="onboarding-actions">
          <button type="button" className="onboarding-skip" onClick={onClose}>{es ? 'Explorar por mi cuenta' : 'Explore on my own'}</button>
          <div className="onboarding-nav">
            {step > 0 && <button type="button" className="onboarding-secondary" onClick={() => setStep(currentStep => currentStep - 1)}>{es ? 'Anterior' : 'Back'}</button>}
            <button type="button" className="onboarding-primary" onClick={() => step === steps.length - 1 ? onClose() : setStep(currentStep => currentStep + 1)}>
              {step === steps.length - 1 ? (es ? 'Empezar' : 'Get started') : (es ? 'Siguiente' : 'Next')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default OnboardingModal
