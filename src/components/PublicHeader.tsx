import {
  LuBookOpen,
  LuHeartHandshake,
  LuLanguages,
  LuLogIn,
} from 'react-icons/lu'

type Language = 'en' | 'es'

interface PublicHeaderProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onNavigate: (path: string) => void
  onSignIn: () => void
}

const labels = {
  en: {
    about: 'About',
    features: 'Features',
    faq: 'FAQ',
    support: 'Support',
    donations: 'Support the project',
    signIn: 'Sign in',
  },
  es: {
    about: 'Acerca de',
    features: 'Funciones',
    faq: 'Preguntas frecuentes',
    support: 'Soporte',
    donations: 'Apoyar el proyecto',
    signIn: 'Iniciar sesión',
  },
}

function PublicHeader({
  language,
  onLanguageChange,
  onNavigate,
  onSignIn,
}: PublicHeaderProps) {
  const t = labels[language]

  return (
    <header className="public-header">
      <button
        type="button"
        className="public-header-brand"
        onClick={() => onNavigate('/')}
      >
        <LuBookOpen />
        <span>Campaign Chronicles</span>
      </button>

      <nav className="public-header-nav" aria-label="Primary navigation">
        <button type="button" onClick={() => onNavigate('/about')}>{t.about}</button>
        <button type="button" onClick={() => onNavigate('/features')}>{t.features}</button>
        <button type="button" onClick={() => onNavigate('/faq')}>{t.faq}</button>
        <button type="button" onClick={() => onNavigate('/support')}>{t.support}</button>
        <button
          type="button"
          className="public-header-donations"
          onClick={() => onNavigate('/donations')}
        >
          <LuHeartHandshake />
          <span>{t.donations}</span>
        </button>
      </nav>

      <div className="public-header-actions">
        <div className="public-header-language">
          <LuLanguages />
          <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => onLanguageChange('en')}>EN</button>
          <span />
          <button type="button" className={language === 'es' ? 'active' : ''} onClick={() => onLanguageChange('es')}>ES</button>
        </div>

        <button type="button" className="public-header-signin" onClick={onSignIn}>
          <LuLogIn />
          <span>{t.signIn}</span>
        </button>
      </div>
    </header>
  )
}

export default PublicHeader
