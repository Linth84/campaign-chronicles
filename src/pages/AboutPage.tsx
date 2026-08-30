import {
  LuArrowLeft,
  LuBookOpen, LuBookMarked
} from 'react-icons/lu'

type Language = 'en' | 'es'

interface PublicInfoPageProps {
  language: Language
}

function AboutPage({ language }: PublicInfoPageProps) {
  const es = language === 'es'
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
        <span className="public-info-eyebrow"><LuBookOpen /> {es ? 'Acerca de' : 'About'}</span>
        <h1>{es ? 'Recordá la campaña, no el trabajo administrativo.' : 'Remember the campaign, not the bookkeeping.'}</h1>
        <p>{es
          ? 'Campaign Chronicles es una herramienta de memoria y organización para grupos de juegos de rol de mesa.'
          : 'Campaign Chronicles is a campaign memory and organization tool for tabletop role-playing groups.'}</p>
      </section>

      <section className="public-info-content public-about-grid">
        <div className="public-info-mark"><LuBookMarked /></div>
        <div>
          <h2>{es ? 'Un archivo para la historia que crea tu mesa.' : 'An archive for the story your table creates.'}</h2>
          <p>{es
            ? 'Está pensado alrededor de los personajes que conocen, los lugares que descubren, las misiones que siguen y esos detalles que todos juran que van a recordar después.'
            : 'It is designed around the characters you meet, the places you discover, the quests you pursue and the details everyone swears they will remember later.'}</p>
          <p>{es
            ? 'No es una mesa virtual y no intenta reemplazar tus reglas, dados, mapas ni tu forma preferida de jugar. Es el archivo que sigue siendo útil entre sesiones y mucho después de que terminan.'
            : 'It is not a virtual tabletop and it is not trying to replace your rules, dice, maps or preferred way to play. It is the archive that stays useful between sessions and long after them.'}</p>
        </div>
      </section>
    </main>
  )
}
export default AboutPage
