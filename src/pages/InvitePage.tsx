import {
  LuLogIn,
  LuScrollText,
  LuUserPlus,
} from 'react-icons/lu'

import '../styles/invite.css'

type Language =
  | 'en'
  | 'es'

interface InvitePageProps {
  language: Language

  onCreateAccount:
    () => void

  onSignIn:
    () => void
}

function InvitePage({
  language,
  onCreateAccount,
  onSignIn,
}: InvitePageProps) {
  const copy = {
    en: {
      eyebrow:
        'Campaign Invitation',

      title:
        "You've been invited",

      description:
        'Someone has invited you to join a campaign on Campaign Chronicles.',

      accountTitle:
        'New to Campaign Chronicles?',

      accountDescription:
        'Create your account using the same email address that received the invitation. Once you sign in, your pending invitation will be waiting for you.',

      createAccount:
        'Create account',

      existingAccount:
        'Already have an account?',

      signIn:
        'Sign in',

      note:
        'Use the email address that received the invitation.',
    },

    es: {
      eyebrow:
        'Invitación a campaña',

      title:
        'Has sido invitado',

      description:
        'Alguien te ha invitado a formar parte de una campaña en Campaign Chronicles.',

      accountTitle:
        '¿Eres nuevo en Campaign Chronicles?',

      accountDescription:
        'Crea tu cuenta utilizando la misma dirección de correo que recibió la invitación. Cuando inicies sesión, tu invitación pendiente estará esperándote.',

      createAccount:
        'Crear cuenta',

      existingAccount:
        '¿Ya tienes una cuenta?',

      signIn:
        'Iniciar sesión',

      note:
        'Utiliza la dirección de correo que recibió la invitación.',
    },
  } as const

  const t =
    copy[language]

  return (
    <main className="invite-page">
      <section
        className="invite-card"
        aria-labelledby="invite-title"
      >
        {/* =====================================================
            LOGO
            ===================================================== */}

        <img
          className="invite-logo"
          src="/images/campaign-chronicles-logo.png"
          alt="Campaign Chronicles"
        />

        {/* =====================================================
            SELLO DE INVITACIÓN
            ===================================================== */}

        <div className="invite-seal">
          <LuScrollText
            aria-hidden="true"
          />
        </div>

        {/* =====================================================
            ENCABEZADO
            ===================================================== */}

        <header className="invite-heading">
          <p className="invite-eyebrow">
            {t.eyebrow}
          </p>

          <h1 id="invite-title">
            {t.title}
          </h1>

          <p>
            {t.description}
          </p>
        </header>

        {/* =====================================================
            INFORMACIÓN PARA NUEVOS USUARIOS
            ===================================================== */}

        <div className="invite-account-panel">
          <h2>
            {t.accountTitle}
          </h2>

          <p>
            {t.accountDescription}
          </p>
        </div>

        {/* =====================================================
            CREAR CUENTA
            ===================================================== */}

        <button
          type="button"
          className="invite-primary-button"
          onClick={
            onCreateAccount
          }
        >
          <LuUserPlus
            aria-hidden="true"
          />

          <span>
            {t.createAccount}
          </span>
        </button>

        {/* =====================================================
            SEPARADOR
            ===================================================== */}

        <div className="invite-divider">
          <span>
            {t.existingAccount}
          </span>
        </div>

        {/* =====================================================
            INICIAR SESIÓN
            ===================================================== */}

        <button
          type="button"
          className="invite-secondary-button"
          onClick={
            onSignIn
          }
        >
          <LuLogIn
            aria-hidden="true"
          />

          <span>
            {t.signIn}
          </span>
        </button>

        {/* =====================================================
            NOTA
            ===================================================== */}

        <p className="invite-note">
          {t.note}
        </p>
      </section>
    </main>
  )
}

export default InvitePage