import {
  LuArrowLeft,
  LuBookOpen,
  LuLanguages,
} from 'react-icons/lu'

type Language = 'en' | 'es'

interface PrivacyPageProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onBack: () => void
}

const translations = {
  en: {
    eyebrow: 'Campaign Chronicles',
    title: 'Privacy Policy',
    updated: 'Last updated: August 29, 2026',
    back: 'Back',
    language: 'Language',

    intro:
      'This Privacy Policy explains what information Campaign Chronicles may collect, how it is used and what choices you have regarding your information.',

    sections: [
      {
        title: '1. Information we collect',
        paragraphs: [
          'When you create an account, Campaign Chronicles may collect information such as your email address, display name and authentication-related information necessary to provide your account.',
          'We also store the content you create while using the service, including campaigns, sessions, characters, locations, quests, items, notes and other campaign-related information.',
        ],
      },
      {
        title: '2. How we use your information',
        paragraphs: [
          'We use your information to create and maintain your account, authenticate access, store your campaign data, provide application features and keep the service functioning.',
          'We may also use technical information to diagnose errors, improve performance, prevent abuse and protect the security of Campaign Chronicles.',
        ],
      },
      {
        title: '3. Campaign content',
        paragraphs: [
          'The campaign information and other original content you create remains yours.',
          'Campaign Chronicles processes and stores this information only as necessary to provide the service and its features.',
          'We do not claim ownership of your original campaign content.',
        ],
      },
      {
        title: '4. Authentication and infrastructure',
        paragraphs: [
          'Campaign Chronicles currently uses Supabase to provide services such as user authentication and database infrastructure.',
          'As a result, certain account and application data may be processed through Supabase infrastructure in accordance with its applicable privacy and security practices.',
        ],
      },
      {
        title: '5. Data sharing',
        paragraphs: [
          'Campaign Chronicles does not sell your personal information.',
          'Information may be shared with service providers only when necessary to operate the application, maintain infrastructure, provide requested features, comply with applicable law or protect the security of the service and its users.',
        ],
      },
      {
        title: '6. Shared campaigns',
        paragraphs: [
          'Campaign Chronicles may allow users to share campaigns or campaign information with other users.',
          'When you choose to share content, the information you make available may be visible to the users who have been granted access to that campaign.',
        ],
      },
      {
        title: '7. Data retention',
        paragraphs: [
          'Account and campaign data may be retained while your account remains active and for as long as reasonably necessary to provide the service.',
          'Some information may need to be retained for a limited period after deletion when required for security, backups, legal obligations or fraud prevention.',
        ],
      },
      {
        title: '8. Account and data deletion',
        paragraphs: [
          'You may request deletion of your account and associated personal information.',
          'Campaign Chronicles intends to provide account deletion tools as the service develops. Before public release, information explaining how to request deletion will be made available through the application.',
          'Deleting an account may permanently remove campaigns and other information associated exclusively with that account.',
        ],
      },
      {
        title: '9. Security',
        paragraphs: [
          'We use reasonable technical and organizational measures intended to protect account and campaign information.',
          'No online service can guarantee absolute security. You are also responsible for protecting your password and access to your account.',
        ],
      },
      {
        title: '10. Cookies and local storage',
        paragraphs: [
          'Campaign Chronicles may use browser storage, cookies or similar technologies when necessary for authentication, session persistence, language preferences and other essential application functionality.',
          'If optional analytics, advertising or other non-essential technologies are introduced in the future, this policy will be updated as appropriate.',
        ],
      },
      {
        title: '11. Children',
        paragraphs: [
          'Campaign Chronicles is not intended to knowingly collect personal information from children where parental or guardian consent would be required by applicable law.',
          'Age requirements may be updated before public release depending on the jurisdictions in which the service becomes available.',
        ],
      },
      {
        title: '12. International processing',
        paragraphs: [
          'Campaign Chronicles and its infrastructure providers may process or store information in countries other than your own.',
          'Where required, appropriate measures will be used to protect personal information transferred across jurisdictions.',
        ],
      },
      {
        title: '13. Future integrations',
        paragraphs: [
          'Campaign Chronicles may add optional integrations with third-party services in the future, such as supporter platforms or other external tools.',
          'If an integration requires additional personal information or data sharing, relevant information will be provided before the integration is used.',
        ],
      },
      {
        title: '14. Changes to this policy',
        paragraphs: [
          'This Privacy Policy may be updated as Campaign Chronicles evolves or when legal, technical or operational requirements change.',
          'When material changes are made, notice may be provided through the service or another appropriate method.',
        ],
      },
      {
        title: '15. Contact',
        paragraphs: [
          'Contact information for privacy-related questions, requests or account deletion will be published through Campaign Chronicles before the service is made publicly available.',
        ],
      },
    ],
  },

  es: {
    eyebrow: 'Campaign Chronicles',
    title: 'Política de Privacidad',
    updated: 'Última actualización: 29 de agosto de 2026',
    back: 'Volver',
    language: 'Idioma',

    intro:
      'Esta Política de Privacidad explica qué información puede recopilar Campaign Chronicles, cómo se utiliza y qué opciones tenés respecto de tus datos.',

    sections: [
      {
        title: '1. Información que recopilamos',
        paragraphs: [
          'Cuando creás una cuenta, Campaign Chronicles puede recopilar información como tu dirección de correo electrónico, nombre visible e información relacionada con la autenticación necesaria para proporcionar tu cuenta.',
          'También almacenamos el contenido que creás al utilizar el servicio, incluyendo campañas, sesiones, personajes, ubicaciones, misiones, objetos, notas y otra información relacionada con tus campañas.',
        ],
      },
      {
        title: '2. Cómo utilizamos tu información',
        paragraphs: [
          'Utilizamos tu información para crear y mantener tu cuenta, autenticar el acceso, almacenar los datos de tus campañas, proporcionar las funciones de la aplicación y mantener el servicio en funcionamiento.',
          'También podremos utilizar información técnica para diagnosticar errores, mejorar el rendimiento, prevenir abusos y proteger la seguridad de Campaign Chronicles.',
        ],
      },
      {
        title: '3. Contenido de las campañas',
        paragraphs: [
          'La información de tus campañas y el contenido original que creás continúa siendo de tu propiedad.',
          'Campaign Chronicles procesa y almacena esta información únicamente en la medida necesaria para proporcionar el servicio y sus funciones.',
          'No reclamamos la propiedad de tu contenido original.',
        ],
      },
      {
        title: '4. Autenticación e infraestructura',
        paragraphs: [
          'Campaign Chronicles utiliza actualmente Supabase para proporcionar servicios como autenticación de usuarios e infraestructura de base de datos.',
          'Como resultado, determinados datos de la cuenta y de la aplicación pueden ser procesados mediante la infraestructura de Supabase conforme a sus prácticas de privacidad y seguridad aplicables.',
        ],
      },
      {
        title: '5. Compartir información',
        paragraphs: [
          'Campaign Chronicles no vende tu información personal.',
          'La información podrá ser compartida con proveedores de servicios únicamente cuando sea necesario para operar la aplicación, mantener la infraestructura, proporcionar funciones solicitadas, cumplir con la legislación aplicable o proteger la seguridad del servicio y de sus usuarios.',
        ],
      },
      {
        title: '6. Campañas compartidas',
        paragraphs: [
          'Campaign Chronicles podrá permitir que los usuarios compartan campañas o información de las campañas con otros usuarios.',
          'Cuando decidas compartir contenido, la información que habilites podrá ser visible para los usuarios a quienes hayas otorgado acceso a esa campaña.',
        ],
      },
      {
        title: '7. Conservación de los datos',
        paragraphs: [
          'Los datos de la cuenta y de las campañas podrán conservarse mientras tu cuenta permanezca activa y durante el tiempo razonablemente necesario para prestar el servicio.',
          'Parte de la información podrá conservarse durante un período limitado después de su eliminación cuando sea necesario por razones de seguridad, copias de respaldo, obligaciones legales o prevención del fraude.',
        ],
      },
      {
        title: '8. Eliminación de cuenta y datos',
        paragraphs: [
          'Podrás solicitar la eliminación de tu cuenta y de la información personal asociada.',
          'Campaign Chronicles tiene previsto incorporar herramientas para eliminar cuentas a medida que evolucione el servicio. Antes del lanzamiento público, la aplicación proporcionará información sobre cómo solicitar la eliminación.',
          'La eliminación de una cuenta podrá borrar permanentemente campañas y otra información asociada exclusivamente con dicha cuenta.',
        ],
      },
      {
        title: '9. Seguridad',
        paragraphs: [
          'Utilizamos medidas técnicas y organizativas razonables destinadas a proteger la información de las cuentas y las campañas.',
          'Ningún servicio en línea puede garantizar seguridad absoluta. También sos responsable de proteger tu contraseña y el acceso a tu cuenta.',
        ],
      },
      {
        title: '10. Cookies y almacenamiento local',
        paragraphs: [
          'Campaign Chronicles puede utilizar almacenamiento del navegador, cookies o tecnologías similares cuando sean necesarias para la autenticación, persistencia de sesión, preferencias de idioma y otras funciones esenciales de la aplicación.',
          'Si en el futuro incorporamos analítica opcional, publicidad u otras tecnologías no esenciales, esta política será actualizada cuando corresponda.',
        ],
      },
      {
        title: '11. Menores de edad',
        paragraphs: [
          'Campaign Chronicles no está diseñado para recopilar deliberadamente información personal de menores cuando la legislación aplicable exija consentimiento de sus padres o tutores.',
          'Los requisitos de edad podrán actualizarse antes del lanzamiento público dependiendo de las jurisdicciones en las que el servicio esté disponible.',
        ],
      },
      {
        title: '12. Procesamiento internacional',
        paragraphs: [
          'Campaign Chronicles y sus proveedores de infraestructura pueden procesar o almacenar información en países distintos al tuyo.',
          'Cuando corresponda, se utilizarán medidas adecuadas para proteger la información personal transferida entre jurisdicciones.',
        ],
      },
      {
        title: '13. Integraciones futuras',
        paragraphs: [
          'Campaign Chronicles podrá incorporar en el futuro integraciones opcionales con servicios de terceros, como plataformas para colaboradores u otras herramientas externas.',
          'Si una integración requiere información personal adicional o compartir datos, se proporcionará la información correspondiente antes de utilizarla.',
        ],
      },
      {
        title: '14. Cambios en esta política',
        paragraphs: [
          'Esta Política de Privacidad podrá actualizarse a medida que Campaign Chronicles evolucione o cuando cambien requisitos legales, técnicos u operativos.',
          'Cuando existan modificaciones importantes, podremos informarlas mediante el servicio u otro medio apropiado.',
        ],
      },
      {
        title: '15. Contacto',
        paragraphs: [
          'La información de contacto para consultas relacionadas con privacidad, solicitudes o eliminación de cuentas será publicada en Campaign Chronicles antes de que el servicio esté disponible públicamente.',
        ],
      },
    ],
  },
}

function PrivacyPage({
  language,
  onLanguageChange,
  onBack,
}: PrivacyPageProps) {
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

          <h1>
            {t.title}
          </h1>

          <p className="legal-updated">
            {t.updated}
          </p>
        </div>

        <p className="legal-intro">
          {t.intro}
        </p>

        <div className="legal-sections">
          {t.sections.map(
            (section) => (
              <section
                key={section.title}
              >
                <h2>
                  {section.title}
                </h2>

                {section.paragraphs.map(
                  (paragraph) => (
                    <p key={paragraph}>
                      {paragraph}
                    </p>
                  ),
                )}
              </section>
            ),
          )}
        </div>
      </article>
    </main>
  )
}

export default PrivacyPage