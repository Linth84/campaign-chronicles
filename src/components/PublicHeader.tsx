import {
  LuBookOpen,
  LuLanguages,
  LuLogIn,
} from 'react-icons/lu'

type Language = 'en' | 'es'
interface PublicHeaderProps {
  language: Language
  onLanguageChange: (
    language: Language,
  ) => void
  onNavigate: (
    path: string,
  ) => void
  onSignIn: () => void
  hideSignIn?: boolean
}

const labels = {
  en: {
    features: 'Features',
    about: 'About',
    faq: 'FAQ',
    support: 'Support',
    signIn: 'Sign in',
  },
  es: {
    features: 'Funciones',
    about: 'Acerca de',
    faq: 'Preguntas frecuentes',
    support: 'Soporte',
    signIn: 'Iniciar sesión',
  },
}

function PublicHeader({
  language,
  onLanguageChange,
  onNavigate,
  onSignIn,
  hideSignIn = false,
}: PublicHeaderProps) {
  const t = labels[language]

  return (
    <header className="public-header">
      <button
        type="button"
        className="public-header-brand"
        onClick={() =>
          onNavigate('/')
        }
      >
        <LuBookOpen />

        <span>
          Campaign Chronicles
        </span>
      </button>

      <nav
        className="public-header-nav"
        aria-label="Primary navigation"
      >
        <button type="button" onClick={() => onNavigate('/about')}>
          {t.about}
        </button>

        <button type="button" onClick={() => onNavigate('/features')}>
          {t.features}
        </button>

        <button type="button" onClick={() => onNavigate('/faq')}>
          {t.faq}
        </button>

        <button type="button" onClick={() => onNavigate('/support')}>
          {t.support}
        </button>
      </nav>

      <div className="public-header-actions">
        <div className="public-header-language">
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

          <span />

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

        {!hideSignIn && (
          <button
            type="button"
            className="public-header-signin"
            onClick={onSignIn}
          >
            <LuLogIn />

            <span>
              {t.signIn}
            </span>
          </button>
        )}
      </div>
    </header>
  )
}

export default PublicHeader
