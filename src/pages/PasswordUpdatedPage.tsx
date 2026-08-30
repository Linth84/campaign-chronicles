import {
  LuKeyRound,
  LuLogIn,
} from 'react-icons/lu'

type Language =
  | 'en'
  | 'es'

interface PasswordUpdatedPageProps {
  language: Language

  onContinue: () => void
}

const translations = {
  en: {
    title:
      'Password updated',

    subtitle:
      'Your password has been changed successfully. You can now sign in to Campaign Chronicles.',

    button:
      'Sign in',

    logoAlt:
      'Campaign Chronicles',
  },

  es: {
    title:
      'Contraseña actualizada',

    subtitle:
      'Tu contraseña se cambió correctamente. Ya podés iniciar sesión en Campaign Chronicles.',

    button:
      'Iniciar sesión',

    logoAlt:
      'Campaign Chronicles',
  },
}

function PasswordUpdatedPage({
  language,
  onContinue,
}: PasswordUpdatedPageProps) {
  const t =
    translations[language]

  return (
    <main className="auth-page">
      <section className="auth-card auth-success-card">
        {/* =================================================
            MARCA
            ================================================= */}

        <img
          className="auth-success-logo"
          src={`${import.meta.env.BASE_URL}images/campaign-chronicles-logo.png`}
          alt={t.logoAlt}
        />

        {/* =================================================
            CONFIRMACIÓN
            ================================================= */}

        <div
          className="auth-success-seal"
          aria-hidden="true"
        >
          <LuKeyRound />
        </div>

        <div className="auth-success-heading">
          <h1>
            {t.title}
          </h1>

          <p>
            {t.subtitle}
          </p>
        </div>

        {/* =================================================
            INICIAR SESIÓN
            ================================================= */}

        <button
          type="button"
          className="auth-submit-button auth-success-button"
          onClick={
            onContinue
          }
        >
          <LuLogIn />

          <span>
            {t.button}
          </span>
        </button>
      </section>
    </main>
  )
}

export default PasswordUpdatedPage
