import {
  LuArrowLeft,
  LuBookOpen,
  LuGitBranch,
  LuImport,
  LuNetwork,
  LuUsers,
  LuSparkles,
  LuWrench,
} from 'react-icons/lu'

type Language = 'en' | 'es'

interface DeveloperBlogPageProps { language: Language }

type Post = {
  date: string
  title: string
  summary: string
  paragraphs: string[]
  icon: typeof LuWrench
  tag: string
}

const posts: Record<Language, Post[]> = {
  en: [
    {
      date: 'September 2, 2026',
      title: 'A Chronicle Can Belong to a Player Too',
      tag: 'Player experience',
      icon: LuUsers,
      summary: 'Player View and player-owned chronicles expand Campaign Chronicles beyond the GM side of the table without blurring the line between ownership and role.',
      paragraphs: [
        'Until now, much of Campaign Chronicles was designed around the person running the campaign. With this update, we are starting to expand that idea. Players can create or import their own chronicle to keep a personal record of an adventure without becoming a GM inside the application.',
        'We have also introduced Player View, a dedicated way to experience the shared campaign record from the other side of the table. Sessions, timeline events, characters, NPCs, locations, factions, relationships, maps, quests, items and shared notes can live there while private GM information stays out of sight.',
        'This update also formalizes an important distinction in the permission model: owning a chronicle and being the GM are not the same thing. A player who owns the Campaign Chronicles record can maintain the normal content of that personal chronicle, including maps and pins, while remaining a player and without gaining access to GM Tools.',
        'Invited players remain consumers of the shared campaign canon rather than editors of it. The goal is to support both sides naturally: a GM can maintain the campaign workspace for the table, while a player can keep a chronicle of the same adventure from their own perspective.',
        'It is another step toward the idea behind Campaign Chronicles: not replacing the way we play, but helping us remember the stories we build around the table.',
      ],
    },
    {
      date: 'September 2, 2026',
      title: 'Introducing GM Tools',
      tag: 'New tools',
      icon: LuWrench,
      summary: 'A dedicated private workspace for the person running the campaign, without turning Campaign Chronicles into a VTT.',
      paragraphs: [
        'Campaign Chronicles has always been about remembering the campaign, but running one also means keeping track of information the rest of the table should not see yet. GM Tools gives that work a proper home.',
        'GM Notes now lives alongside Session Planner, Secrets, Clue Tracker, Plot Threads and GM Screen. The goal is for these tools to work together: prepare what may happen, keep the important hidden information close during play, and turn what actually happened into campaign memory afterwards.',
        'Quick Capture deliberately remains outside GM Tools. Fast notes are useful to everyone at the table, not only the GM. This separation also gives us a clearer rule going forward: GM Tools is for private GM-only information and workflows.',
        'GM Screen is the piece that will eventually bring the system together during play, surfacing the current plan, relevant secrets, undiscovered clues and active plot threads without forcing the GM to jump between pages.',
      ],
    },
    {
      date: 'September 1, 2026',
      title: 'A Better Way to Import Campaigns',
      tag: 'Quality of life',
      icon: LuImport,
      summary: 'Importing a large existing campaign should not require writing a second campaign just to describe the first one.',
      paragraphs: [
        'The original import format was powerful, but too demanding. Characters, NPCs, factions and other campaign information could require long repeated structures that became uncomfortable to prepare for a large campaign.',
        'The importer has been redesigned around simpler grouped sections. Instead of forcing a separate oversized structure for every entity, Campaign Chronicles can work from more natural lists under headings such as Characters, NPCs and Factions.',
        'The intention is simple: moving an existing campaign into Campaign Chronicles should feel like bringing your notes with you, not completing paperwork before you are allowed to use the app.',
      ],
    },
    {
      date: 'August 31, 2026',
      title: 'Relationships, Factions & What We Learned From Feedback',
      tag: 'Community feedback',
      icon: LuNetwork,
      summary: 'Some of the most useful direction for Campaign Chronicles has come from seeing what testers naturally gravitate toward.',
      paragraphs: [
        'Recent feedback highlighted Relationships and Factions as some of the most interesting parts of Campaign Chronicles. That reinforced an idea that has been growing with the project: campaign information becomes much more valuable when it is connected.',
        'An NPC is not only a card in a list. They belong to factions, know other characters, appear in locations, affect plot threads and leave consequences across sessions. Relationships should help make those connections visible instead of asking the GM to remember all of them independently.',
        'There is more work to do here. Better customization and deeper connections between campaign entities are now part of the direction for future iterations.',
      ],
    },
    {
      date: 'August 30, 2026',
      title: 'Polishing the Campaign Workspace',
      tag: 'Development',
      icon: LuGitBranch,
      summary: 'Small UX decisions add up when the same workspace is meant to stay useful for months or years of play.',
      paragraphs: [
        'Alongside larger features, we have been continuing to refine navigation, responsive behavior, bilingual text and the everyday flow of moving through a campaign.',
        'We are also keeping an eye on performance feedback across different browsers and machines. Campaign Chronicles has a deliberately atmospheric interface, but visual identity should never get in the way of using the workspace comfortably.',
        'Not every report means removing an effect immediately. The approach is to reproduce issues where possible, optimize conservatively and preserve the character of the interface while making it more dependable.',
      ],
    },
    {
      date: 'August 29, 2026',
      title: 'Where Campaign Chronicles Is Going Next',
      tag: 'Roadmap',
      icon: LuSparkles,
      summary: 'Maps, better guidance for new users and deeper campaign connections are the next pieces of the campaign-memory idea.',
      paragraphs: [
        'Maps are planned as a campaign feature rather than a GM-only tool: upload a world, region or location map, place useful pins and eventually connect those pins to existing locations, NPCs, factions or the party position. The goal is context, not combat automation.',
        'Tutorials and onboarding are also planned. As Campaign Chronicles grows, dropping a new user into every feature at once is no longer enough. Tutorials should explain specific workflows with concise guidance and lightweight visual demonstrations, while onboarding should provide a short introduction and then get out of the way.',
        'Most importantly, Campaign Chronicles is not trying to become a virtual tabletop. The direction remains the same: be the place that remembers the people, places, relationships, threads and history your table creates together.',
      ],
    },
  ],
  es: [
    {
      date: '2 de septiembre de 2026',
      title: 'Una crónica también puede pertenecer a un jugador',
      tag: 'Experiencia de jugador',
      icon: LuUsers,
      summary: 'Player View y las crónicas propias de jugadores amplían Campaign Chronicles más allá del lado del GM sin mezclar propiedad y rol.',
      paragraphs: [
        'Hasta ahora, gran parte de Campaign Chronicles estaba pensada alrededor de quien dirige la campaña. Con esta actualización empezamos a ampliar esa idea. Un jugador también puede crear o importar su propia crónica para llevar un registro personal de la aventura sin necesidad de convertirse en GM dentro de la aplicación.',
        'También incorporamos Player View, una forma dedicada de recorrer el registro compartido de la campaña desde el otro lado de la mesa. Sesiones, timeline, personajes, NPCs, lugares, facciones, relaciones, mapas, quests, items y notas compartidas pueden vivir ahí mientras la información privada del GM queda fuera de vista.',
        'Esta actualización también formaliza una distinción importante en el sistema de permisos: ser dueño de una crónica y ser GM no son lo mismo. Un jugador que sea propietario del registro en Campaign Chronicles puede mantener el contenido normal de su propia crónica, incluidos mapas y pins, mientras sigue siendo jugador y sin obtener acceso a GM Tools.',
        'Los jugadores invitados siguen consumiendo el canon compartido de la campaña en lugar de editarlo. La idea es acompañar naturalmente ambos lados: un GM puede mantener el espacio de campaña para la mesa, mientras que un jugador puede llevar su propia crónica de esa misma aventura desde su perspectiva.',
        'Es otro paso hacia la idea que guía Campaign Chronicles: no reemplazar la forma en que jugamos, sino ayudarnos a recordar las historias que construimos alrededor de la mesa.',
      ],
    },
    {
      date: '2 de septiembre de 2026',
      title: 'Presentamos GM Tools',
      tag: 'Nuevas herramientas',
      icon: LuWrench,
      summary: 'Un espacio privado dedicado a quien dirige la campaña, sin convertir Campaign Chronicles en un VTT.',
      paragraphs: [
        'Campaign Chronicles siempre estuvo pensado para recordar la campaña, pero dirigir también implica manejar información que el resto de la mesa todavía no debería ver. GM Tools le da un lugar propio a ese trabajo.',
        'GM Notes ahora convive con Session Planner, Secrets, Clue Tracker, Plot Threads y GM Screen. La idea es que estas herramientas trabajen juntas: preparar lo que podría pasar, tener cerca la información privada importante durante la partida y transformar después lo que realmente ocurrió en memoria de campaña.',
        'Quick Capture queda deliberadamente fuera de GM Tools. Las notas rápidas sirven para todos los integrantes de la mesa, no solamente para el GM. Esta separación también nos deja una regla clara para el futuro: GM Tools contiene información y flujos privados exclusivos del GM.',
        'GM Screen será la pieza que termine reuniendo el sistema durante la partida, mostrando el plan actual, secretos relevantes, pistas todavía no descubiertas y tramas activas sin obligar al GM a saltar entre páginas.',
      ],
    },
    {
      date: '1 de septiembre de 2026',
      title: 'Una mejor forma de importar campañas',
      tag: 'Calidad de vida',
      icon: LuImport,
      summary: 'Importar una campaña grande no debería significar escribir una segunda campaña solamente para describir la primera.',
      paragraphs: [
        'El formato original de importación era potente, pero demasiado exigente. Personajes, NPCs, facciones y otra información podían requerir estructuras largas y repetidas que se volvían incómodas al preparar una campaña grande.',
        'Rediseñamos el importador alrededor de secciones agrupadas más simples. En lugar de exigir una estructura enorme separada para cada entidad, Campaign Chronicles puede trabajar con listas más naturales bajo encabezados como Personajes, NPCs y Facciones.',
        'La intención es simple: pasar una campaña existente a Campaign Chronicles debería sentirse como traer tus notas con vos, no como llenar papeles antes de poder usar la aplicación.',
      ],
    },
    {
      date: '31 de agosto de 2026',
      title: 'Relaciones, facciones y lo que aprendimos del feedback',
      tag: 'Feedback de la comunidad',
      icon: LuNetwork,
      summary: 'Parte de la dirección más útil del proyecto apareció al ver qué herramientas llamaban naturalmente la atención de quienes lo probaron.',
      paragraphs: [
        'El feedback reciente destacó Relationships y Factions como algunas de las partes más interesantes de Campaign Chronicles. Eso reforzó una idea que viene creciendo con el proyecto: la información de una campaña se vuelve mucho más valiosa cuando está conectada.',
        'Un NPC no es solamente una ficha en una lista. Pertenece a facciones, conoce personajes, aparece en lugares, afecta tramas y deja consecuencias a través de las sesiones. Relationships debería permitir ver esas conexiones en lugar de pedirle al GM que las recuerde por separado.',
        'Todavía hay trabajo por hacer. Más personalización y conexiones más profundas entre las entidades de campaña ya forman parte de la dirección para futuras iteraciones.',
      ],
    },
    {
      date: '30 de agosto de 2026',
      title: 'Puliendo el espacio de campaña',
      tag: 'Desarrollo',
      icon: LuGitBranch,
      summary: 'Las decisiones pequeñas de UX importan cuando el mismo espacio de trabajo tiene que seguir siendo útil durante meses o años de campaña.',
      paragraphs: [
        'Además de las funciones grandes, seguimos refinando navegación, comportamiento responsive, textos bilingües y el flujo cotidiano de moverse dentro de una campaña.',
        'También estamos observando el feedback de rendimiento en distintos navegadores y equipos. Campaign Chronicles tiene una interfaz intencionalmente atmosférica, pero la identidad visual nunca debería estorbar al uso cómodo del espacio de trabajo.',
        'No todo reporte implica eliminar un efecto inmediatamente. La idea es reproducir los problemas cuando sea posible, optimizar de manera conservadora y conservar el carácter de la interfaz mientras la hacemos más confiable.',
      ],
    },
    {
      date: '29 de agosto de 2026',
      title: 'Lo próximo para Campaign Chronicles',
      tag: 'Roadmap',
      icon: LuSparkles,
      summary: 'Mapas, una mejor introducción para usuarios nuevos y conexiones más profundas son las próximas piezas de la idea de memoria de campaña.',
      paragraphs: [
        'Maps está pensado como una función general de campaña y no como una herramienta exclusiva del GM: subir un mapa de mundo, región o lugar, colocar pines útiles y eventualmente conectarlos con Locations, NPCs, Factions o la posición de la party. El objetivo es dar contexto, no automatizar combate.',
        'También están planeados Tutorials y Onboarding. A medida que Campaign Chronicles crece, ya no alcanza con dejar al usuario nuevo frente a todas las funciones de una vez. Los tutoriales deberían explicar flujos concretos con instrucciones breves y demostraciones visuales livianas, mientras que el onboarding debería dar una introducción corta y después dejar explorar libremente.',
        'Lo más importante es que Campaign Chronicles no intenta convertirse en una mesa virtual. La dirección sigue siendo la misma: ser el lugar que recuerda las personas, lugares, relaciones, tramas y la historia que la mesa crea en conjunto.',
      ],
    },
  ],
}

function DeveloperBlogPage({ language }: DeveloperBlogPageProps) {
  const es = language === 'es'
  return (
    <main className="public-info-page developer-blog-page">
      <button type="button" className="public-back-button" onClick={() => window.history.back()}>
        <LuArrowLeft /> <span>{es ? 'Volver' : 'Back'}</span>
      </button>

      <section className="public-info-hero developer-blog-hero">
        <span className="public-info-eyebrow"><LuBookOpen /> {es ? 'Blog de desarrollo' : 'Developer Blog'}</span>
        <h1>{es ? 'Construyendo Campaign Chronicles.' : 'Building Campaign Chronicles.'}</h1>
        <p>{es
          ? 'Decisiones de diseño, nuevas funciones y lo que vamos aprendiendo mientras construimos un lugar capaz de recordar una campaña junto a tu mesa.'
          : 'Design decisions, new features and what we learn while building a place that can remember a campaign alongside your table.'}</p>
      </section>

      <section className="developer-blog-feed">
        {posts[language].map((post, index) => {
          const Icon = post.icon
          return (
            <article className="developer-blog-post" key={post.title}>
              <aside className="developer-blog-post-meta">
                <span className="developer-blog-icon"><Icon /></span>
                <time>{post.date}</time>
                <span className="developer-blog-tag">{post.tag}</span>
              </aside>
              <div className="developer-blog-post-body">
                {index === 0 && <span className="developer-blog-latest">{es ? 'Última actualización' : 'Latest update'}</span>}
                <h2>{post.title}</h2>
                <p className="developer-blog-summary">{post.summary}</p>
                <div className="developer-blog-divider"><span /></div>
                {post.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default DeveloperBlogPage
