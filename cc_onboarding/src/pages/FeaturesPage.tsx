import {
  LuArrowLeft,
  LuLibrary,
    LuNotebookPen,
    LuScrollText,
    LuShieldCheck,
    LuSparkles,
    LuUsers,
} from 'react-icons/lu'

type Language = 'en' | 'es'

interface PublicInfoPageProps {
  language: Language
}

function FeaturesPage({ language }: PublicInfoPageProps) {
  const es = language === 'es'
  const items = es ? [
    ['Archivo de campaña', 'Mantené sesiones, personajes, PNJ, lugares, misiones y objetos conectados a una misma campaña.', LuLibrary],
    ['Crónica compartida', 'Dale a toda la mesa un lugar confiable para volver a la historia sin buscar entre mensajes viejos.', LuScrollText],
    ['Notas privadas', 'Mantené tus notas personales separadas del conocimiento compartido de la campaña.', LuNotebookPen],
    ['Herramientas de GM', 'Protegé información exclusiva del GM mientras colaborás con Sub-GMs y jugadores.', LuShieldCheck],
    ['Roles de campaña', 'Los roles GM, Sub-GM y Jugador mantienen clara la colaboración.', LuUsers],
    ['Interfaz bilingüe', 'Usá Campaign Chronicles en español o inglés sin cambiar el contenido escrito por tu grupo.', LuSparkles],
  ] : [
    ['Campaign archive', 'Keep sessions, characters, NPCs, locations, quests and items connected to the same campaign.', LuLibrary],
    ['Shared chronicle', 'Give the whole table a reliable place to revisit the story without digging through chat history.', LuScrollText],
    ['Private notes', 'Keep personal notes separate from shared campaign knowledge.', LuNotebookPen],
    ['GM tools', 'Protect GM-only information while still collaborating with Sub-GMs and players.', LuShieldCheck],
    ['Campaign roles', 'Clear GM, Sub-GM and Player roles keep collaboration understandable.', LuUsers],
    ['Bilingual interface', 'Use Campaign Chronicles in English or Spanish without changing the content your group writes.', LuSparkles],
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
        <span className="public-info-eyebrow"><LuSparkles /> {es ? 'Funciones' : 'Features'}</span>
        <h1>{es ? 'La historia merece más que notas dispersas.' : 'The story deserves more than scattered notes.'}</h1>
        <p>{es
          ? 'Un lugar dedicado para conservar lo que pasó, lo que importa ahora y lo que debe permanecer oculto.'
          : 'A dedicated place to preserve what happened, what matters now, and what should remain hidden.'}</p>
      </section>
      <section className="public-feature-grid">
        {items.map(([title, text, Icon]) => (
          <article className="public-feature-card" key={String(title)}>
            <div className="public-feature-icon"><Icon /></div>
            <h2>{String(title)}</h2>
            <p>{String(text)}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
export default FeaturesPage
