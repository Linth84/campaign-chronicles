import { useState } from 'react'
  import {
  LuArrowLeft,
  LuChevronDown,
  LuCircleHelp,
} from 'react-icons/lu'

type Language = 'en' | 'es'
interface PublicInfoPageProps { language: Language }

function FaqPage({ language }: PublicInfoPageProps) {
  const [open, setOpen] = useState<number | null>(0)
  const es = language === 'es'
  const items = es ? [
    ['¿Campaign Chronicles es una VTT?', 'No. Es una herramienta de memoria y organización de campañas. Podés seguir usando la VTT, mapas, dados y reglas que ya prefieras.'],
    ['¿GM y jugadores pueden compartir la misma campaña?', 'Sí. Las campañas admiten roles de GM, Sub-GM y Jugador con distintos permisos.'],
    ['¿Las notas privadas y de GM están realmente separadas?', 'Sí. Las notas compartidas, personales y de GM se tratan como espacios diferentes.'],
    ['¿Puedo usarlo con distintos sistemas de TTRPG?', 'Sí. Campaign Chronicles está diseñado para ser independiente del sistema de reglas.'],
    ['¿Puedo importar una campaña existente?', 'La importación de campañas forma parte del proyecto para que una aventura existente no tenga que empezar desde cero.'],
    ['¿Campaign Chronicles es gratuito?', 'Campaign Chronicles se está desarrollando como un compañero de campaña accesible y sin publicidad.'],
  ] : [
    ['Is Campaign Chronicles a VTT?', 'No. It is a campaign memory and organization tool. Keep using the VTT, maps, dice and rules you already enjoy.'],
    ['Can GMs and players share the same campaign?', 'Yes. Campaigns support GM, Sub-GM and Player roles with different permissions.'],
    ['Are private and GM notes actually separate?', 'Yes. Shared notes, personal notes and GM notes are treated as different spaces.'],
    ['Can I use it for different TTRPG systems?', 'Yes. Campaign Chronicles is designed to be system-agnostic rather than tied to one ruleset.'],
    ['Can I import an existing campaign?', 'Campaign import is part of the project so existing adventures do not have to start from zero.'],
    ['Is Campaign Chronicles free?', 'Campaign Chronicles is currently being built as an accessible, ad-free campaign companion.'],
  ]
  return (
    <main className="public-info-page">
      <button
        type="button"
        className="public-back-button"
        onClick={() => window.history.back()}
      >
        <LuArrowLeft />
        <span>{language === 'es' ? 'Volver' : 'Back'}</span>
      </button>
      <section className="public-info-hero">
        <span className="public-info-eyebrow"><LuCircleHelp /> FAQ</span>
        <h1>{es ? 'Algunas cosas que vale la pena saber.' : 'A few things worth knowing.'}</h1>
      </section>
      <section className="public-faq-list">
        {items.map(([question, answer], index) => (
          <article className={open === index ? 'public-faq-item open' : 'public-faq-item'} key={question}>
            <button type="button" onClick={() => setOpen(open === index ? null : index)}>
              <span>{question}</span><LuChevronDown />
            </button>
            {open === index && <p>{answer}</p>}
          </article>
        ))}
      </section>
    </main>
  )
}
export default FaqPage
