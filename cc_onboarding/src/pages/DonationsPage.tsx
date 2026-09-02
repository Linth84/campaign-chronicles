import { LuArrowUpRight, LuHeartHandshake, LuShieldCheck, LuSparkles } from 'react-icons/lu'
import { SiKofi, SiPatreon } from 'react-icons/si'

type Language = 'en' | 'es'

interface DonationsPageProps { language: Language }

const copy = {
  en: {
    eyebrow: 'Support the project',
    title: 'Help keep the chronicle growing.',
    intro: 'Campaign Chronicles is built as an independent, ad-free tool for tabletop groups. If it is useful to your table, you can support its continued development through any of these platforms.',
    voluntary: 'Support is completely optional. The campaign tools are not locked behind a donation.',
    kofi: 'A simple way to leave a one-time contribution.',
    ceneka: 'Support Campaign Chronicles directly through Ceneka.',
    patreon: 'Join as a recurring supporter and help sustain future development.',
    visit: 'Open',
    thanks: 'Every contribution helps with hosting, infrastructure and the time that goes into improving Campaign Chronicles.',
  },
  es: {
    eyebrow: 'Apoya el proyecto',
    title: 'Ayuda a que la crónica siga creciendo.',
    intro: 'Campaign Chronicles se desarrolla como una herramienta independiente y sin anuncios para grupos de rol de mesa. Si resulta útil para tu mesa, puedes apoyar su desarrollo mediante cualquiera de estas plataformas.',
    voluntary: 'El apoyo es completamente opcional. Las herramientas de campaña no están bloqueadas detrás de una donación.',
    kofi: 'Una forma sencilla de hacer un aporte único.',
    ceneka: 'Apoya Campaign Chronicles directamente mediante Ceneka.',
    patreon: 'Únete como colaborador recurrente y ayuda a sostener el desarrollo futuro.',
    visit: 'Abrir',
    thanks: 'Cada aporte ayuda con el alojamiento, la infraestructura y el tiempo dedicado a mejorar Campaign Chronicles.',
  },
}

const platforms = [
  { id: 'kofi', name: 'Ko-fi', href: 'https://ko-fi.com/campaignchronicles' },
  { id: 'ceneka', name: 'Ceneka', href: 'https://ceneka.net/campaign-chronicles' },
  { id: 'patreon', name: 'Patreon', href: 'https://www.patreon.com/cw/campaignchronicles' },
] as const

function BrandIcon({ id }: { id: 'kofi' | 'ceneka' | 'patreon' }) {
  if (id === 'kofi') return <SiKofi />
  if (id === 'patreon') return <SiPatreon />
  return <span className="donation-ceneka-mark" aria-hidden="true">C</span>
}

function DonationsPage({ language }: DonationsPageProps) {
  const t = copy[language]
  return (
    <main className="public-page donations-page">
      <section className="public-page-hero donations-hero">
        <p className="public-page-eyebrow"><LuHeartHandshake /> {t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>

      <section className="donations-content">
        <div className="donations-notice"><LuShieldCheck /><p>{t.voluntary}</p></div>
        <div className="donations-grid">
          {platforms.map((platform) => (
            <a key={platform.id} className="donation-card" href={platform.href} target="_blank" rel="noreferrer">
              <div className="donation-brand-icon"><BrandIcon id={platform.id} /></div>
              <div className="donation-card-copy">
                <h2>{platform.name}</h2>
                <p>{t[platform.id]}</p>
              </div>
              <span className="donation-open">{t.visit}<LuArrowUpRight /></span>
            </a>
          ))}
        </div>
        <div className="donations-thanks"><LuSparkles /><p>{t.thanks}</p></div>
      </section>
    </main>
  )
}

export default DonationsPage
