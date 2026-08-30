import {
  LuBookOpen,
  LuCheck,
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
    eyebrow:
      'Campaign Chronicles',

    title:
      'Password updated',

    subtitle:
      'Your password has been changed successfully. You can now sign in to Campaign Chronicles.',

    button:
      'Sign in',
  },

  es: {
    eyebrow:
      'Campaign Chronicles',

    title:
      'Contraseña actualizada',

    subtitle:
      'Tu contraseña se cambió correctamente. Ya podés iniciar sesión en Campaign Chronicles.',

    button:
      'Iniciar sesión',
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
      <section className="auth-card">
        {/* =================================================
            MARCA
            ================================================= */}

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <LuBookOpen />
          </div>

          <p className="auth-eyebrow">
            {t.eyebrow}
          </p>
        </div>

        {/* =================================================
            CONFIRMACIÓN
            ================================================= */}

        <div className="auth-heading">
          <div
            className="auth-brand-icon"
            style={{
              margin:
                '0 auto 20px',
            }}
          >
            <LuCheck />
          </div>

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
          className="auth-submit-button"
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
