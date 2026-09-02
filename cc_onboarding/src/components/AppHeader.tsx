import {
  LuArrowLeft,
  LuBookOpen,
  LuHeartHandshake,
  LuLanguages,
  LuLogOut,
  LuUserRound,
} from 'react-icons/lu'

type Language = 'en' | 'es'

interface AppHeaderProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onOpenProfile: () => void
  onSignOut: () => void
  onBack?: () => void
  backLabel?: string
  profileLabel?: string
  signOutLabel?: string
  profileActive?: boolean
  avatarUrl?: string
}

function AppHeader({
  language,
  onLanguageChange,
  onOpenProfile,
  onSignOut,
  onBack,
  backLabel,
  profileLabel,
  signOutLabel,
  profileActive = false,
  avatarUrl = '',
}: AppHeaderProps) {
  const resolvedBack = backLabel ?? (language === 'es' ? 'Volver' : 'Back')
  const resolvedProfile = profileLabel ?? (language === 'es' ? 'Perfil' : 'Profile')
  const resolvedSignOut = signOutLabel ?? (language === 'es' ? 'Cerrar sesión' : 'Sign out')

  const labels = language === 'es'
    ? {
        about: 'Acerca de',
        features: 'Funciones',
        blog: 'Dev Blog',
        tutorials: 'Tutoriales',
        faq: 'Preguntas frecuentes',
        support: 'Soporte',
        donations: 'Apoyar el proyecto',
      }
    : {
        about: 'About',
        features: 'Features',
        blog: 'Dev Blog',
        tutorials: 'Tutorials',
        faq: 'FAQ',
        support: 'Support',
        donations: 'Support the project',
      }

  return (
    <header className="app-header">
      <div className="app-header-main-row">
        <div className="app-header-left">
          {onBack ? (
            <button type="button" className="app-header-back" onClick={onBack}>
              <LuArrowLeft />
              <span>{resolvedBack}</span>
            </button>
          ) : (
            <span className="app-header-spacer" />
          )}
        </div>

        <a className="app-header-brand" href="/" aria-label="Campaign Chronicles">
          <LuBookOpen />
          <span>Campaign Chronicles</span>
        </a>

        <div className="app-header-actions">
          <button
            type="button"
            className={profileActive ? 'app-header-profile active' : 'app-header-profile'}
            onClick={onOpenProfile}
            aria-label={resolvedProfile}
            aria-current={profileActive ? 'page' : undefined}
          >
            <span className="app-header-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="" /> : <LuUserRound />}
            </span>
            <span className="app-header-profile-label">{resolvedProfile}</span>
          </button>

          <div className="app-header-language" aria-label={language === 'es' ? 'Seleccionar idioma' : 'Select language'}>
            <LuLanguages />
            <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => onLanguageChange('en')}>EN</button>
            <span className="app-header-language-divider" />
            <button type="button" className={language === 'es' ? 'active' : ''} onClick={() => onLanguageChange('es')}>ES</button>
          </div>

          <button type="button" className="app-header-signout" onClick={onSignOut}>
            <LuLogOut />
            <span>{resolvedSignOut}</span>
          </button>
        </div>
      </div>

      <nav className="app-header-public-nav" aria-label={language === 'es' ? 'Navegación pública' : 'Public navigation'}>
        <a href="/about">{labels.about}</a>
        <a href="/features">{labels.features}</a>
        <a href="/developer-blog">{labels.blog}</a>
        <a className="tutorial-nav-link" href="/tutorials">{labels.tutorials}</a>
        <a href="/faq">{labels.faq}</a>
        <a href="/support">{labels.support}</a>
        <a className="app-header-public-donations" href="/donations">
          <LuHeartHandshake />
          <span>{labels.donations}</span>
        </a>
      </nav>
    </header>
  )
}

export default AppHeader
