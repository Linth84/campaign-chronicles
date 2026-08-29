import {
  LuArrowLeft,
  LuBookOpen,
  LuLanguages,
} from 'react-icons/lu'

type Language = 'en' | 'es'

interface TermsPageProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onBack: () => void
}

const translations = {
  en: {
    eyebrow: 'Campaign Chronicles',
    title: 'Terms and Conditions',
    updated: 'Last updated: August 29, 2026',
    back: 'Back',
    language: 'Language',

    intro:
      'These Terms and Conditions govern your use of Campaign Chronicles. By creating an account or using the service, you agree to these terms.',

    sections: [
      {
        title: '1. About Campaign Chronicles',
        paragraphs: [
          'Campaign Chronicles is a digital campaign journal designed to help tabletop role-playing game players and groups organize and remember their adventures, including campaigns, sessions, characters, locations, quests, items, notes and related information.',
          'Campaign Chronicles is an independent service and is not affiliated with, endorsed by or sponsored by the publishers of the tabletop role-playing games that users may reference while using the service.',
        ],
      },
      {
        title: '2. Accounts',
        paragraphs: [
          'You may need to create an account to access certain features. You are responsible for providing accurate information and for maintaining the security of your account credentials.',
          'You are responsible for activity performed through your account. If you believe your account has been accessed without authorization, you should take appropriate steps to secure it.',
        ],
      },
      {
        title: '3. Your content',
        paragraphs: [
          'You retain ownership of the original content you create and store through Campaign Chronicles.',
          'By using the service, you grant Campaign Chronicles the limited permission necessary to store, process and display your content solely for the purpose of operating and providing the service.',
          'You are responsible for ensuring that content you upload or create does not violate applicable law or the rights of third parties.',
        ],
      },
      {
        title: '4. Acceptable use',
        paragraphs: [
          'You may not use Campaign Chronicles to interfere with the service, attempt unauthorized access to accounts or systems, distribute malicious software, abuse other users, or engage in unlawful activity.',
          'We may restrict or terminate access when reasonably necessary to protect the service, its users or third parties.',
        ],
      },
      {
        title: '5. Service availability',
        paragraphs: [
          'We aim to keep Campaign Chronicles available and reliable, but uninterrupted or error-free operation cannot be guaranteed.',
          'Features may be changed, improved, temporarily unavailable or discontinued as the service evolves.',
        ],
      },
      {
        title: '6. Third-party services',
        paragraphs: [
          'Campaign Chronicles may rely on third-party infrastructure and services to provide features such as authentication, data storage, hosting or optional integrations.',
          'Those services may operate under their own terms and privacy policies.',
        ],
      },
      {
        title: '7. Supporter features',
        paragraphs: [
          'Campaign Chronicles may offer optional supporter or paid features in the future. Any applicable pricing, benefits and additional conditions will be presented before a purchase or subscription is made.',
          'Core content ownership is not transferred by purchasing or using supporter features.',
        ],
      },
      {
        title: '8. Disclaimer and limitation of liability',
        paragraphs: [
          'Campaign Chronicles is provided on an as-available basis. To the extent permitted by applicable law, we do not guarantee that the service will always be available, secure or free from errors.',
          'To the extent permitted by applicable law, Campaign Chronicles is not responsible for indirect or consequential losses resulting from use of, or inability to use, the service.',
        ],
      },
      {
        title: '9. Account termination',
        paragraphs: [
          'You may stop using Campaign Chronicles at any time. Account deletion functionality may also be provided through the service.',
          'We may suspend or terminate accounts that seriously or repeatedly violate these terms or threaten the security or operation of the service.',
        ],
      },
      {
        title: '10. Changes to these terms',
        paragraphs: [
          'These terms may be updated as Campaign Chronicles evolves. When material changes are made, we may provide notice through the service or request acceptance of the updated terms where appropriate.',
        ],
      },
      {
        title: '11. Contact',
        paragraphs: [
          'Contact information for questions about these terms will be published through Campaign Chronicles before the service is made publicly available.',
        ],
      },
    ],
  },

  es: {
    eyebrow: 'Campaign Chronicles',
    title: 'Términos y Condiciones',
    updated: 'Última actualización: 29 de agosto de 2026',
    back: 'Volver',
    language: 'Idioma',

    intro:
      'Estos Términos y Condiciones regulan el uso de Campaign Chronicles. Al crear una cuenta o utilizar el servicio, aceptás estos términos.',

    sections: [
      {
        title: '1. Acerca de Campaign Chronicles',
        paragraphs: [
          'Campaign Chronicles es un diario digital de campañas diseñado para ayudar a jugadores y grupos de juegos de rol de mesa a organizar y recordar sus aventuras, incluyendo campañas, sesiones, personajes, ubicaciones, misiones, objetos, notas e información relacionada.',
          'Campaign Chronicles es un servicio independiente y no está afiliado, respaldado ni patrocinado por los editores de los juegos de rol de mesa que los usuarios puedan mencionar al utilizar el servicio.',
        ],
      },
      {
        title: '2. Cuentas',
        paragraphs: [
          'Es posible que necesites crear una cuenta para acceder a determinadas funciones. Sos responsable de proporcionar información correcta y de mantener seguras las credenciales de tu cuenta.',
          'Sos responsable de la actividad realizada a través de tu cuenta. Si creés que alguien accedió a ella sin autorización, deberás tomar las medidas correspondientes para protegerla.',
        ],
      },
      {
        title: '3. Tu contenido',
        paragraphs: [
          'Conservás la propiedad del contenido original que creás y almacenás mediante Campaign Chronicles.',
          'Al utilizar el servicio, otorgás a Campaign Chronicles únicamente el permiso limitado necesario para almacenar, procesar y mostrar tu contenido con el fin de operar y prestar el servicio.',
          'Sos responsable de asegurarte de que el contenido que subís o creás no infrinja la legislación aplicable ni los derechos de terceros.',
        ],
      },
      {
        title: '4. Uso aceptable',
        paragraphs: [
          'No podés utilizar Campaign Chronicles para interferir con el servicio, intentar acceder sin autorización a cuentas o sistemas, distribuir software malicioso, abusar de otros usuarios o realizar actividades ilegales.',
          'Podremos restringir o finalizar el acceso cuando sea razonablemente necesario para proteger el servicio, a sus usuarios o a terceros.',
        ],
      },
      {
        title: '5. Disponibilidad del servicio',
        paragraphs: [
          'Nuestro objetivo es mantener Campaign Chronicles disponible y confiable, pero no podemos garantizar un funcionamiento ininterrumpido o libre de errores.',
          'Las funciones pueden cambiar, mejorar, quedar temporalmente fuera de servicio o ser discontinuadas a medida que evoluciona Campaign Chronicles.',
        ],
      },
      {
        title: '6. Servicios de terceros',
        paragraphs: [
          'Campaign Chronicles puede utilizar infraestructura y servicios de terceros para ofrecer funciones como autenticación, almacenamiento de datos, alojamiento o integraciones opcionales.',
          'Esos servicios pueden operar bajo sus propios términos y políticas de privacidad.',
        ],
      },
      {
        title: '7. Funciones para colaboradores',
        paragraphs: [
          'Campaign Chronicles podrá ofrecer en el futuro funciones opcionales para colaboradores o funciones pagas. Los precios, beneficios y condiciones adicionales aplicables serán informados antes de realizar una compra o suscripción.',
          'La adquisición o utilización de estas funciones no transfiere la propiedad del contenido del usuario.',
        ],
      },
      {
        title: '8. Exención y limitación de responsabilidad',
        paragraphs: [
          'Campaign Chronicles se proporciona según disponibilidad. En la medida permitida por la legislación aplicable, no garantizamos que el servicio esté siempre disponible, sea completamente seguro o esté libre de errores.',
          'En la medida permitida por la legislación aplicable, Campaign Chronicles no será responsable por pérdidas indirectas o consecuentes derivadas del uso o de la imposibilidad de utilizar el servicio.',
        ],
      },
      {
        title: '9. Finalización de la cuenta',
        paragraphs: [
          'Podés dejar de utilizar Campaign Chronicles en cualquier momento. El servicio también podrá ofrecer una función para eliminar tu cuenta.',
          'Podremos suspender o finalizar cuentas que incumplan de manera grave o reiterada estos términos o que amenacen la seguridad o el funcionamiento del servicio.',
        ],
      },
      {
        title: '10. Cambios en estos términos',
        paragraphs: [
          'Estos términos podrán actualizarse a medida que Campaign Chronicles evolucione. Cuando existan cambios importantes, podremos informarlos mediante el servicio o solicitar la aceptación de la nueva versión cuando corresponda.',
        ],
      },
      {
        title: '11. Contacto',
        paragraphs: [
          'La información de contacto para realizar consultas relacionadas con estos términos será publicada en Campaign Chronicles antes de que el servicio esté disponible públicamente.',
        ],
      },
    ],
  },
}

function TermsPage({
  language,
  onLanguageChange,
  onBack,
}: TermsPageProps) {
  const t = translations[language]

  return (
    <main className="legal-page">
      <header className="legal-header">
        <button
          type="button"
          className="legal-back"
          onClick={onBack}
        >
          <LuArrowLeft />
          <span>{t.back}</span>
        </button>

        <div className="legal-brand">
          <LuBookOpen />
          <span>{t.eyebrow}</span>
        </div>

        <div
          className="language-selector"
          aria-label={t.language}
        >
          <LuLanguages />

          <button
            type="button"
            className={
              language === 'en'
                ? 'active'
                : ''
            }
            onClick={() =>
              onLanguageChange('en')
            }
          >
            EN
          </button>

          <span className="language-divider" />

          <button
            type="button"
            className={
              language === 'es'
                ? 'active'
                : ''
            }
            onClick={() =>
              onLanguageChange('es')
            }
          >
            ES
          </button>
        </div>
      </header>

      <article className="legal-document">
        <div className="legal-title">
          <p className="legal-eyebrow">
            {t.eyebrow}
          </p>

          <h1>{t.title}</h1>

          <p className="legal-updated">
            {t.updated}
          </p>
        </div>

        <p className="legal-intro">
          {t.intro}
        </p>

        <div className="legal-sections">
          {t.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>

              {section.paragraphs.map(
                (paragraph) => (
                  <p key={paragraph}>
                    {paragraph}
                  </p>
                ),
              )}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}

export default TermsPage