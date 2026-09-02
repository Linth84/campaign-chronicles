import {
  LuBadgeCheck,
  LuLogIn,
} from 'react-icons/lu'

type Language =
  | 'en'
  | 'es'

interface EmailVerifiedPageProps {
  language: Language

  onContinue: () => void
}

const translations = {
  en: {
    title:
      'Your account has been verified',

    subtitle:
      'Your email address has been successfully confirmed. You can now sign in to Campaign Chronicles.',

    button:
      'Sign in',

    logoAlt:
      'Campaign Chronicles',
  },

  es: {
    title:
      'Tu cuenta ha sido verificada',

    subtitle:
      'Tu correo electrónico se confirmó correctamente. Ya podés iniciar sesión en Campaign Chronicles.',

    button:
      'Iniciar sesión',

    logoAlt:
      'Campaign Chronicles',
  },
}

function EmailVerifiedPage({
  language,
  onContinue,
}: EmailVerifiedPageProps) {
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
          <LuBadgeCheck />
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

export default EmailVerifiedPage
