import type {
  CSSProperties,
} from 'react'

import {
  LuBookOpen,
  LuLanguages,
  LuLogIn,
  LuUserPlus,
} from 'react-icons/lu'

import en from '../i18n/en'
import es from '../i18n/es'

type Language = 'en' | 'es'

type AuthMode =
  | 'login'
  | 'signup'

interface LandingPageProps {
  language: Language
  onLanguageChange: (
    language: Language,
  ) => void
  onOpenAuth: (
    mode: AuthMode,
  ) => void
}

function LandingPage({
  language,
  onLanguageChange,
  onOpenAuth,
}: LandingPageProps) {
  const t =
    language === 'en'
      ? en
      : es

  return (
    <div className="app">

      {/* ===================================================
          AMBIENTACIÓN ARCANA
          =================================================== */}

      <div
        className="landing-ambience"
        aria-hidden="true"
      >
        <div className="arcane-orbit arcane-orbit-left">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="arcane-orbit arcane-orbit-right">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="arcane-sigil arcane-sigil-one">
          <i>◇</i>
        </div>

        <div className="arcane-sigil arcane-sigil-two">
          <i>⌁</i>
        </div>

        <div className="arcane-sigil arcane-sigil-three">
          <i>△</i>
        </div>

        <div className="arcane-sigil arcane-sigil-four">
          <i>◈</i>
        </div>

        <div className="arcane-sigil arcane-sigil-five">
          <i>⌖</i>
        </div>

        <div className="arcane-sigil arcane-sigil-six">
          <i>⋄</i>
        </div>

        <div className="arcane-particles">
          {Array.from({
            length: 18,
          }).map(
            (_, index) => (
              <span
                key={index}
                style={
                  {
                    '--particle-index':
                      index,
                  } as CSSProperties
                }
              />
            ),
          )}
        </div>
      </div>

      {/* ===================================================
          CABECERA
          =================================================== */}

      <header className="header">
        <div className="brand">
          <LuBookOpen className="brand-icon" />

          <span>
            {t.app.name}
          </span>
        </div>

        <div className="language-selector">
          <LuLanguages />

          <button
            type="button"
            className={
              language === 'en'
                ? 'active'
                : ''
            }
            onClick={() =>
              onLanguageChange(
                'en',
              )
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
              onLanguageChange(
                'es',
              )
            }
          >
            ES
          </button>
        </div>
      </header>

      {/* ===================================================
          HERO
          =================================================== */}

      <main className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">
            {t.app.eyebrow}
          </p>

          {/* =================================================
              LOGO PRINCIPAL
              ================================================= */}

          <div className="hero-logo-wrapper">
            <img
              src="/images/campaign-chronicles-logo.png"
              alt=""
              className="hero-logo"
              aria-hidden="true"
            />

            <h1 className="sr-only">
              {t.app.name}
            </h1>
          </div>

          <p className="hero-tagline">
            {t.app.tagline}
          </p>

          {/* Línea decorativa */}

          <div className="chronicle-line">
            <span />
            <i />
            <span />
          </div>

          {/* =================================================
              ACCESO
              ================================================= */}

          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                onOpenAuth(
                  'signup',
                )
              }
            >
              <LuUserPlus />

              {language === 'es'
                ? 'Crear cuenta'
                : 'Create account'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                onOpenAuth(
                  'login',
                )
              }
            >
              <LuLogIn />

              {language === 'es'
                ? 'Iniciar sesión'
                : 'Sign in'}
            </button>
          </div>
        </div>
      </main>

      {/* ===================================================
          PIE DE PÁGINA
          =================================================== */}

      <footer className="footer">
        <span>
          {t.app.name}
        </span>

        <span className="footer-dot" />

        <span>
          {t.app.footer}
        </span>
      </footer>
    </div>
  )
}

export default LandingPage