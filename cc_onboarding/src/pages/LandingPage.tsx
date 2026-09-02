import { useEffect } from 'react'
import {
  LuBookOpen,
  LuLogIn,
  LuHeartHandshake,
  LuUserPlus,
} from 'react-icons/lu'

import en from '../i18n/en'
import es from '../i18n/es'

type Language = 'en' | 'es'
type AuthMode = 'login' | 'signup'

interface LandingPageProps {
  language: Language
  onOpenAuth: (mode: AuthMode) => void
}

const copy = {
  en: {
    nav: { about: 'About', features: 'Features', faq: 'FAQ', support: 'Support', signIn: 'Sign in' },
    heroKicker: 'A living archive for tabletop campaigns',
    heroDescription: 'Keep the people, places, quests, discoveries and notes that make your campaign worth remembering — organized in one shared chronicle.',
    create: 'Create account',
    signIn: 'Sign in',
    featuresEyebrow: 'Built for campaign memory',
    featuresTitle: 'The story deserves more than scattered notes.',
    featuresText: 'Campaign Chronicles gives your group a dedicated place to preserve what happened, what matters now, and what should remain hidden.',
    features: [
      ['Campaign archive', 'Keep sessions, characters, NPCs, locations, quests and items connected to the same campaign.'],
      ['Shared chronicle', 'Give the whole table a reliable place to revisit the story without digging through chat history.'],
      ['Private notes', 'Keep personal notes separate from shared campaign knowledge.'],
      ['GM tools', 'Protect GM-only information while still collaborating with Sub-GMs and players.'],
      ['Campaign roles', 'Clear GM, Sub-GM and Player roles keep collaboration understandable.'],
      ['Bilingual interface', 'Use Campaign Chronicles in English or Spanish without changing the content your group writes.'],
    ],
    aboutEyebrow: 'About',
    aboutTitle: 'Remember the campaign, not the bookkeeping.',
    aboutP1: 'Campaign Chronicles is a campaign memory and organization tool for tabletop role-playing groups. It is designed around the story your table creates together: the characters you meet, the places you discover, the quests you pursue and the details everyone swears they will remember later.',
    aboutP2: 'It is not a virtual tabletop and it is not trying to replace your rules, dice, maps or preferred way to play. It is the archive that stays useful between sessions and long after them.',
    faqEyebrow: 'FAQ',
    faqTitle: 'A few things worth knowing.',
    faqs: [
      ['Is Campaign Chronicles a VTT?', 'No. It is a campaign memory and organization tool. Keep using the VTT, maps, dice and rules you already enjoy.'],
      ['Can GMs and players share the same campaign?', 'Yes. Campaigns support GM, Sub-GM and Player roles with different permissions.'],
      ['Are private and GM notes actually separate?', 'Yes. Shared notes, personal notes and GM notes are treated as different spaces.'],
      ['Can I use it for different TTRPG systems?', 'Yes. Campaign Chronicles is designed to be system-agnostic rather than tied to one ruleset.'],
      ['Can I import an existing campaign?', 'Campaign import is part of the project so existing adventures do not have to start from zero.'],
      ['Is Campaign Chronicles free?', 'Campaign Chronicles is currently being built as an accessible, ad-free campaign companion.'],
    ],
    supportEyebrow: 'Support',
    supportTitle: 'Need a hand?',
    supportText: 'Send us your question or tell us what went wrong. Your message will go directly to Campaign Chronicles support.',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'How can we help?',
    send: 'Send message',
    formNotice: 'Support sending will be connected in the next step.',
    footerAbout: 'About',
    footerFaq: 'FAQ',
    footerSupport: 'Support',
    footerDonations: 'Support the project',
    terms: 'Terms',
    privacy: 'Privacy',
  },
  es: {
    nav: { about: 'Acerca de', features: 'Funciones', faq: 'Preguntas frecuentes', support: 'Soporte', signIn: 'Iniciar sesión' },
    heroKicker: 'Un archivo vivo para campañas de rol',
    heroDescription: 'Guardá las personas, lugares, misiones, descubrimientos y notas que hacen que tu campaña merezca ser recordada, todo organizado en una crónica compartida.',
    create: 'Crear cuenta',
    signIn: 'Iniciar sesión',
    featuresEyebrow: 'Creado para recordar campañas',
    featuresTitle: 'La historia merece más que notas dispersas.',
    featuresText: 'Campaign Chronicles le da a tu grupo un lugar dedicado para conservar lo que pasó, lo que importa ahora y lo que debe permanecer oculto.',
    features: [
      ['Archivo de campaña', 'Mantené sesiones, personajes, PNJ, lugares, misiones y objetos conectados a una misma campaña.'],
      ['Crónica compartida', 'Dale a toda la mesa un lugar confiable para volver a la historia sin buscar entre mensajes viejos.'],
      ['Notas privadas', 'Mantené tus notas personales separadas del conocimiento compartido de la campaña.'],
      ['Herramientas de GM', 'Protegé información exclusiva del GM mientras colaborás con Sub-GM y jugadores.'],
      ['Roles de campaña', 'Los roles GM, Sub-GM y Jugador mantienen claras las responsabilidades y permisos.'],
      ['Interfaz bilingüe', 'Usá Campaign Chronicles en español o inglés sin modificar el contenido escrito por tu grupo.'],
    ],
    aboutEyebrow: 'Acerca de',
    aboutTitle: 'Recordá la campaña, no el trabajo de organizarla.',
    aboutP1: 'Campaign Chronicles es una herramienta de memoria y organización para grupos de rol de mesa. Está pensada alrededor de la historia que la mesa crea en conjunto: los personajes que conoce, los lugares que descubre, las misiones que persigue y esos detalles que todos juran que van a recordar después.',
    aboutP2: 'No es una mesa virtual y no busca reemplazar reglas, dados, mapas ni la forma en la que preferís jugar. Es el archivo que sigue siendo útil entre sesiones y mucho tiempo después.',
    faqEyebrow: 'Preguntas frecuentes',
    faqTitle: 'Algunas cosas que conviene saber.',
    faqs: [
      ['¿Campaign Chronicles es un VTT?', 'No. Es una herramienta de memoria y organización de campañas. Podés seguir usando el VTT, mapas, dados y reglas que ya preferís.'],
      ['¿GM y jugadores pueden compartir una campaña?', 'Sí. Las campañas admiten roles GM, Sub-GM y Jugador con permisos diferentes.'],
      ['¿Las notas privadas y de GM están realmente separadas?', 'Sí. Las notas compartidas, personales y de GM funcionan como espacios diferentes.'],
      ['¿Sirve para distintos sistemas de rol?', 'Sí. Campaign Chronicles está diseñado para ser independiente del sistema y no depender de un reglamento específico.'],
      ['¿Puedo importar una campaña existente?', 'La importación forma parte del proyecto para que una aventura existente no tenga que empezar desde cero.'],
      ['¿Campaign Chronicles es gratis?', 'Campaign Chronicles se está desarrollando como un compañero de campaña accesible y sin anuncios.'],
    ],
    supportEyebrow: 'Soporte',
    supportTitle: '¿Necesitás ayuda?',
    supportText: 'Mandanos tu consulta o contanos qué salió mal. Tu mensaje llegará directamente al soporte de Campaign Chronicles.',
    name: 'Nombre',
    email: 'Correo electrónico',
    subject: 'Asunto',
    message: '¿Cómo podemos ayudarte?',
    send: 'Enviar mensaje',
    formNotice: 'El envío del formulario se conectará en el próximo paso.',
    footerAbout: 'Acerca de',
    footerFaq: 'Preguntas frecuentes',
    footerSupport: 'Soporte',
    footerDonations: 'Apoyar el proyecto',
    terms: 'Términos',
    privacy: 'Privacidad',
  },
}


function LandingPage({ language, onOpenAuth }: LandingPageProps) {
  const t = language === 'en' ? en : es
  const c = copy[language]


  useEffect(() => {
    const section =
      window.location.hash.replace(
        '#',
        '',
      )

    if (!section) {
      return
    }

    window.requestAnimationFrame(
      () => {
        document
          .getElementById(section)
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
      },
    )
  }, [])


  return (
    <div className="app landing-page">
      <div className="landing-ambience" aria-hidden="true">
        <div className="arcane-orbit arcane-orbit-left"><span /><span /><span /><span /></div>
        <div className="arcane-orbit arcane-orbit-right"><span /><span /><span /><span /></div>

        <div className="arcane-sigil arcane-sigil-one"><i>◇</i></div>
        <div className="arcane-sigil arcane-sigil-two"><i>⌁</i></div>
        <div className="arcane-sigil arcane-sigil-three"><i>△</i></div>
        <div className="arcane-sigil arcane-sigil-four"><i>◈</i></div>
        <div className="arcane-sigil arcane-sigil-five"><i>⌖</i></div>
        <div className="arcane-sigil arcane-sigil-six"><i>⋄</i></div>

        <div className="arcane-particles arcane-particles-left">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={`left-${index}`} />
          ))}
        </div>

        <div className="arcane-particles arcane-particles-right">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={`right-${index}`} />
          ))}
        </div>
      </div>

      <main>
        <section id="home" className="hero landing-section-anchor">
          <div className="hero-content">
            <p className="hero-eyebrow">{c.heroKicker}</p>
            <div className="hero-logo-wrapper">
              <img src={`${import.meta.env.BASE_URL}images/campaign-chronicles-logo.png`} alt="" className="hero-logo" aria-hidden="true" />
              <h1 className="sr-only">{t.app.name}</h1>
            </div>
            <p className="hero-tagline">{t.app.tagline}</p>
            <p className="hero-description">{c.heroDescription}</p>
            <div className="chronicle-line"><span /><i /><span /></div>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => onOpenAuth('signup')}><LuUserPlus />{c.create}</button>
              <button type="button" className="secondary-button" onClick={() => onOpenAuth('login')}><LuLogIn />{c.signIn}</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer landing-footer">
        <div className="landing-footer-brand">
          <LuBookOpen />
          <span>{t.app.name}</span>
          <span className="footer-dot" />
          <span>{t.app.footer}</span>
        </div>

        <nav
          className="landing-footer-legal"
          aria-label="Legal navigation"
        >
          <a className="landing-footer-support" href="/donations"><LuHeartHandshake />{c.footerDonations}</a>
          <a href="/terms">{c.terms}</a>
          <a href="/privacy">{c.privacy}</a>
        </nav>
      </footer>
    </div>
  )
}

export default LandingPage
