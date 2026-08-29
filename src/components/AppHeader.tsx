import {
  LuArrowLeft,
  LuBookOpen,
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
  const resolvedBack =
    backLabel ??
    (language === 'es' ? 'Volver' : 'Back')

  const resolvedProfile =
    profileLabel ??
    (language === 'es' ? 'Perfil' : 'Profile')

  const resolvedSignOut =
    signOutLabel ??
    (language === 'es' ? 'Cerrar sesión' : 'Sign out')

  return (
    <header className="app-header">
      <div className="app-header-left">
        {onBack ? (
          <button
            type="button"
            className="app-header-back"
            onClick={onBack}
          >
            <LuArrowLeft />
            <span>{resolvedBack}</span>
          </button>
        ) : (
          <span className="app-header-spacer" />
        )}
      </div>

      <div className="app-header-brand">
        <LuBookOpen />
        <span>Campaign Chronicles</span>
      </div>

      <div className="app-header-actions">
        <button
          type="button"
          className={
            profileActive
              ? 'app-header-profile active'
              : 'app-header-profile'
          }
          onClick={onOpenProfile}
          aria-label={resolvedProfile}
          aria-current={profileActive ? 'page' : undefined}
        >
          <span className="app-header-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <LuUserRound />
            )}
          </span>
          <span className="app-header-profile-label">
            {resolvedProfile}
          </span>
        </button>

        <div
          className="app-header-language"
          aria-label={
            language === 'es'
              ? 'Seleccionar idioma'
              : 'Select language'
          }
        >
          <LuLanguages />

          <button
            type="button"
            className={language === 'en' ? 'active' : ''}
            onClick={() => onLanguageChange('en')}
          >
            EN
          </button>

          <span className="app-header-language-divider" />

          <button
            type="button"
            className={language === 'es' ? 'active' : ''}
            onClick={() => onLanguageChange('es')}
          >
            ES
          </button>
        </div>

        <button
          type="button"
          className="app-header-signout"
          onClick={onSignOut}
        >
          <LuLogOut />
          <span>{resolvedSignOut}</span>
        </button>
      </div>
    </header>
  )
}

export default AppHeader
