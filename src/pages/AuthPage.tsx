import { useState } from 'react'
import type {
  FormEvent,
} from 'react'

import {
  LuBookOpen,
  LuCheck,
  LuEye,
  LuEyeOff,
  LuLockKeyhole,
  LuLogIn,
  LuMail,
  LuUserPlus,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

type AuthMode =
  | 'login'
  | 'signup'

type Language =
  | 'en'
  | 'es'

interface AuthPageProps {
  language: Language

  mode: AuthMode

  onModeChange: (
    mode: AuthMode,
  ) => void

  onClose: () => void

  onOpenTerms: () => void

  onOpenPrivacy: () => void

  recoveryMode: boolean

  onRecoveryComplete: () => void
}

/* =========================================================
   TRADUCCIONES
   ========================================================= */

const translations = {
  en: {
    eyebrow:
      'Campaign Chronicles',

    titleLogin:
      'Welcome back',

    titleSignup:
      'Create your account',

    subtitleLogin:
      'Return to your campaigns and continue the story.',

    subtitleSignup:
      'Create your account and start remembering every adventure.',

    email:
      'Email',

    password:
      'Password',

    displayName:
      'Display name',

    login:
      'Sign in',

    signup:
      'Create account',

    loadingLogin:
      'Signing in...',

    loadingSignup:
      'Creating account...',

    noAccount:
      "Don't have an account?",

    hasAccount:
      'Already have an account?',

    createOne:
      'Create one',

    signInInstead:
      'Sign in',

    confirmation:
      'Account created. Check your email to confirm your address.',

    genericError:
      'Something went wrong. Please try again.',

    invalidPassword:
      'Your password does not meet all security requirements.',

    acceptLegalError:
      'You must accept the Terms and Conditions and Privacy Policy to create an account.',

    showPassword:
      'Show password',

    hidePassword:
      'Hide password',

    close:
      'Close',

    passwordSecurity:
      'Strength',

    strengthEmpty:
      'Enter a password',

    strengthVeryWeak:
      'Very weak',

    strengthWeak:
      'Weak',

    strengthGood:
      'Good',

    strengthStrong:
      'Strong',

    strengthVeryStrong:
      'Very strong',

    requirementLength:
      'At least 8 characters',

    requirementUppercase:
      'One uppercase letter',

    requirementLowercase:
      'One lowercase letter',

    requirementNumber:
      'One number',

    requirementSymbol:
      'One symbol',

    acceptPrefix:
      'I accept the',

    terms:
      'Terms and Conditions',

    and:
      'and',

    privacy:
      'Privacy Policy',

    forgotPassword:
      'Forgot your password?',

    recoveryTitle:
      'Reset your password',

    recoverySubtitle:
      'Enter your email and we will send you a secure recovery link.',

    sendRecovery:
      'Send recovery link',

    sendingRecovery:
      'Sending recovery link...',

    recoverySent:
      'Recovery link sent. Check your email and open the link to continue.',

    backToLogin:
      'Back to sign in',

    newPasswordTitle:
      'Choose a new password',

    newPasswordSubtitle:
      'Create a new secure password for your Campaign Chronicles account.',

    newPassword:
      'New password',

    confirmPassword:
      'Confirm password',

    updatePassword:
      'Update password',

    updatingPassword:
      'Updating password...',

    passwordsDoNotMatch:
      'The passwords do not match.',

    passwordUpdated:
      'Password updated successfully.',

    recoveryExpired:
      'This recovery link is invalid or has expired. Request a new one.',
  },

  es: {
    eyebrow:
      'Campaign Chronicles',

    titleLogin:
      'Bienvenido de nuevo',

    titleSignup:
      'Creá tu cuenta',

    subtitleLogin:
      'Volvé a tus campañas y continuá la historia.',

    subtitleSignup:
      'Creá tu cuenta y empezá a recordar cada aventura.',

    email:
      'Correo electrónico',

    password:
      'Contraseña',

    displayName:
      'Nombre visible',

    login:
      'Iniciar sesión',

    signup:
      'Crear cuenta',

    loadingLogin:
      'Iniciando sesión...',

    loadingSignup:
      'Creando cuenta...',

    noAccount:
      '¿Todavía no tenés una cuenta?',

    hasAccount:
      '¿Ya tenés una cuenta?',

    createOne:
      'Crear una',

    signInInstead:
      'Iniciar sesión',

    confirmation:
      'Cuenta creada. Revisá tu correo para confirmar tu dirección.',

    genericError:
      'Ocurrió un error. Intentá nuevamente.',

    invalidPassword:
      'La contraseña no cumple con todos los requisitos de seguridad.',

    acceptLegalError:
      'Tenés que aceptar los Términos y Condiciones y la Política de Privacidad para crear una cuenta.',

    showPassword:
      'Mostrar contraseña',

    hidePassword:
      'Ocultar contraseña',

    close:
      'Cerrar',

    passwordSecurity:
      'Seguridad',

    strengthEmpty:
      'Ingresá una contraseña',

    strengthVeryWeak:
      'Muy débil',

    strengthWeak:
      'Débil',

    strengthGood:
      'Buena',

    strengthStrong:
      'Fuerte',

    strengthVeryStrong:
      'Muy fuerte',

    requirementLength:
      'Al menos 8 caracteres',

    requirementUppercase:
      'Una mayúscula',

    requirementLowercase:
      'Una minúscula',

    requirementNumber:
      'Un número',

    requirementSymbol:
      'Un símbolo',

    acceptPrefix:
      'Acepto los',

    terms:
      'Términos y Condiciones',

    and:
      'y la',

    privacy:
      'Política de Privacidad',

    forgotPassword:
      '¿Olvidaste tu contraseña?',

    recoveryTitle:
      'Recuperá tu contraseña',

    recoverySubtitle:
      'Ingresá tu correo y te enviaremos un enlace seguro para recuperarla.',

    sendRecovery:
      'Enviar enlace de recuperación',

    sendingRecovery:
      'Enviando enlace...',

    recoverySent:
      'Enlace enviado. Revisá tu correo y abrilo para continuar.',

    backToLogin:
      'Volver a iniciar sesión',

    newPasswordTitle:
      'Elegí una nueva contraseña',

    newPasswordSubtitle:
      'Creá una nueva contraseña segura para tu cuenta de Campaign Chronicles.',

    newPassword:
      'Nueva contraseña',

    confirmPassword:
      'Confirmar contraseña',

    updatePassword:
      'Actualizar contraseña',

    updatingPassword:
      'Actualizando contraseña...',

    passwordsDoNotMatch:
      'Las contraseñas no coinciden.',

    passwordUpdated:
      'Contraseña actualizada correctamente.',

    recoveryExpired:
      'Este enlace de recuperación no es válido o venció. Solicitá uno nuevo.',
  },
}

/* =========================================================
   VALIDACIÓN DE CONTRASEÑA
   ========================================================= */

const getPasswordRequirements = (
  password: string,
) => ({
  length:
    password.length >= 8,

  uppercase:
    /[A-Z]/.test(password),

  lowercase:
    /[a-z]/.test(password),

  number:
    /[0-9]/.test(password),

  symbol:
    /[^A-Za-z0-9]/.test(
      password,
    ),
})

/* =========================================================
   COMPONENTE
   ========================================================= */

function AuthPage({
  language,
  mode,
  onModeChange,
  onClose,
  onOpenTerms,
  onOpenPrivacy,
  recoveryMode,
  onRecoveryComplete,
}: AuthPageProps) {
  /* =======================================================
     ESTADO DEL FORMULARIO
     ======================================================= */

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    password,
    setPassword,
  ] =
    useState('')

  const [
    displayName,
    setDisplayName,
  ] =
    useState('')

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false)

  const [
    acceptedLegal,
    setAcceptedLegal,
  ] =
    useState(false)

  const [
    loading,
    setLoading,
  ] =
    useState(false)

  const [
    message,
    setMessage,
  ] =
    useState('')

  const [
    error,
    setError,
  ] =
    useState('')


  const [
    forgotPasswordMode,
    setForgotPasswordMode,
  ] =
    useState(false)

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('')

  const t =
    translations[language]

  /* =======================================================
     SEGURIDAD DE CONTRASEÑA
     ======================================================= */

  const passwordRequirements =
    getPasswordRequirements(
      password,
    )

  const passwordScore = [
    passwordRequirements.length,
    passwordRequirements.uppercase,
    passwordRequirements.lowercase,
    passwordRequirements.number,
    passwordRequirements.symbol,
  ].filter(Boolean).length

  const isPasswordValid =
    passwordScore === 5

  const getStrengthLabel =
    () => {
      if (!password) {
        return t.strengthEmpty
      }

      switch (
        passwordScore
      ) {
        case 0:
        case 1:
          return (
            t.strengthVeryWeak
          )

        case 2:
          return (
            t.strengthWeak
          )

        case 3:
          return (
            t.strengthGood
          )

        case 4:
          return (
            t.strengthStrong
          )

        case 5:
          return (
            t.strengthVeryStrong
          )

        default:
          return (
            t.strengthVeryWeak
          )
      }
    }

  /* =======================================================
     LIMPIAR MENSAJES
     ======================================================= */

  const resetFeedback =
    () => {
      setMessage('')
      setError('')
    }

  /* =======================================================
     CAMBIAR LOGIN / REGISTRO
     ======================================================= */

  const changeMode = (
    newMode: AuthMode,
  ) => {
    onModeChange(
      newMode,
    )

    setPassword('')
    setShowPassword(false)
    setAcceptedLegal(false)

    resetFeedback()
  }

  /* =======================================================
     RECUPERAR CONTRASEÑA
     ======================================================= */

  const handleSendRecovery =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      resetFeedback()

      if (
        !email.trim()
      ) {
        return
      }

      setLoading(true)

      try {
        const redirectTo =
          `${window.location.origin}${window.location.pathname}?recovery=1&lang=${language}`

        const {
          error:
            recoveryError,
        } =
          await supabase.auth.resetPasswordForEmail(
            email.trim(),
            {
              redirectTo,
            },
          )

        if (
          recoveryError
        ) {
          throw recoveryError
        }

        setMessage(
          t.recoverySent,
        )
      } catch (
        caughtError
      ) {
        if (
          caughtError
          instanceof Error
        ) {
          setError(
            caughtError.message,
          )
        } else {
          setError(
            t.genericError,
          )
        }
      } finally {
        setLoading(false)
      }
    }

  const handleUpdatePassword =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      resetFeedback()

      if (
        !isPasswordValid
      ) {
        setError(
          t.invalidPassword,
        )

        return
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          t.passwordsDoNotMatch,
        )

        return
      }

      setLoading(true)

      try {
        const {
          error:
            updateError,
        } =
          await supabase.auth.updateUser(
            {
              password,
            },
          )

        if (
          updateError
        ) {
          throw updateError
        }

        setMessage(
          t.passwordUpdated,
        )

        setPassword('')
        setConfirmPassword('')

        window.setTimeout(
          () => {
            onRecoveryComplete()
          },
          900,
        )
      } catch (
        caughtError
      ) {
        if (
          caughtError
          instanceof Error
        ) {
          setError(
            caughtError.message,
          )
        } else {
          setError(
            t.genericError,
          )
        }
      } finally {
        setLoading(false)
      }
    }

  /* =======================================================
     ENVIAR FORMULARIO
     ======================================================= */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      resetFeedback()

      /* ---------------------------------------------------
         VALIDAR REGISTRO
         --------------------------------------------------- */

      if (
        (mode === 'signup' ||
          recoveryMode) &&
        !isPasswordValid
      ) {
        setError(
          t.invalidPassword,
        )

        return
      }

      if (
        mode === 'signup' &&
        !acceptedLegal
      ) {
        setError(
          t.acceptLegalError,
        )

        return
      }

      setLoading(true)

      try {
        /* -------------------------------------------------
           CREAR CUENTA
           ------------------------------------------------- */

        if (
          mode === 'signup'
        ) {
          const {
            error:
              signUpError,
          } =
            await supabase.auth.signUp(
              {
                email:
                  email.trim(),

                password,

                options: {
                  emailRedirectTo:
                    `${window.location.origin}${window.location.pathname}?verified=1&lang=${language}`,

                  data: {
                    display_name:
                      displayName.trim(),

                    language,
                  },
                },
              },
            )

          if (
            signUpError
          ) {
            throw signUpError
          }

          setMessage(
            t.confirmation,
          )

          setPassword('')
          setAcceptedLegal(
            false,
          )

          return
        }

        /* -------------------------------------------------
           INICIAR SESIÓN
           ------------------------------------------------- */

        const {
          error:
            signInError,
        } =
          await supabase.auth.signInWithPassword(
            {
              email:
                email.trim(),

              password,
            },
          )

        if (
          signInError
        ) {
          throw signInError
        }
      } catch (
        caughtError
      ) {
        if (
          caughtError
          instanceof Error
        ) {
          setError(
            caughtError.message,
          )
        } else {
          setError(
            t.genericError,
          )
        }
      } finally {
        setLoading(false)
      }
    }

  /* =======================================================
     REQUISITO DE CONTRASEÑA
     ======================================================= */

  const PasswordRequirement = ({
    valid,
    children,
  }: {
    valid: boolean
    children: string
  }) => (
    <div
      className={
        valid
          ? 'password-requirement valid'
          : 'password-requirement'
      }
    >
      <span className="password-requirement-icon">
        {valid && (
          <LuCheck />
        )}
      </span>

      <span>
        {children}
      </span>
    </div>
  )

  /* =======================================================
     RENDER
     ======================================================= */

  if (
    recoveryMode
  ) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <LuBookOpen />
            </div>

            <p className="auth-eyebrow">
              {t.eyebrow}
            </p>
          </div>

          <div className="auth-heading">
            <h1>
              {t.newPasswordTitle}
            </h1>

            <p>
              {t.newPasswordSubtitle}
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={
              handleUpdatePassword
            }
          >
            <label className="auth-field">
              <span>
                {t.newPassword}
              </span>

              <div className="auth-input-wrapper">
                <LuLockKeyhole />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    password
                  }
                  onChange={(
                    event,
                  ) => {
                    setPassword(
                      event.target.value,
                    )

                    resetFeedback()
                  }}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? t.hidePassword
                      : t.showPassword
                  }
                  title={
                    showPassword
                      ? t.hidePassword
                      : t.showPassword
                  }
                >
                  {showPassword ? (
                    <LuEyeOff />
                  ) : (
                    <LuEye />
                  )}
                </button>
              </div>
            </label>

            <label className="auth-field">
              <span>
                {t.confirmPassword}
              </span>

              <div className="auth-input-wrapper">
                <LuLockKeyhole />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(
                    event,
                  ) => {
                    setConfirmPassword(
                      event.target.value,
                    )

                    resetFeedback()
                  }}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </label>

            <div className="password-security">
              <div className="password-strength-heading">
                <span>
                  {t.passwordSecurity}
                </span>

                <strong
                  data-strength={
                    password
                      ? passwordScore
                      : 0
                  }
                >
                  {getStrengthLabel()}
                </strong>
              </div>

              <div
                className="password-strength-bar"
                aria-hidden="true"
              >
                {[1, 2, 3, 4, 5].map(
                  (
                    segment,
                  ) => (
                    <span
                      key={
                        segment
                      }
                      className={
                        password &&
                        passwordScore >=
                          segment
                          ? 'active'
                          : ''
                      }
                      data-strength={
                        passwordScore
                      }
                    />
                  ),
                )}
              </div>

              <div className="password-requirements">
                <PasswordRequirement
                  valid={
                    passwordRequirements.length
                  }
                >
                  {t.requirementLength}
                </PasswordRequirement>

                <PasswordRequirement
                  valid={
                    passwordRequirements.uppercase
                  }
                >
                  {t.requirementUppercase}
                </PasswordRequirement>

                <PasswordRequirement
                  valid={
                    passwordRequirements.lowercase
                  }
                >
                  {t.requirementLowercase}
                </PasswordRequirement>

                <PasswordRequirement
                  valid={
                    passwordRequirements.number
                  }
                >
                  {t.requirementNumber}
                </PasswordRequirement>

                <PasswordRequirement
                  valid={
                    passwordRequirements.symbol
                  }
                >
                  {t.requirementSymbol}
                </PasswordRequirement>
              </div>
            </div>

            {error && (
              <p className="auth-feedback auth-feedback-error">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-feedback auth-feedback-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={
                loading
              }
            >
              {loading
                ? t.updatingPassword
                : t.updatePassword}
            </button>
          </form>
        </section>
      </main>
    )
  }

  if (
    forgotPasswordMode
  ) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <button
            type="button"
            className="auth-close-button"
            onClick={onClose}
            aria-label={t.close}
            title={t.close}
          >
            <LuX />
          </button>

          <div className="auth-brand">
            <div className="auth-brand-icon">
              <LuBookOpen />
            </div>

            <p className="auth-eyebrow">
              {t.eyebrow}
            </p>
          </div>

          <div className="auth-heading">
            <h1>
              {t.recoveryTitle}
            </h1>

            <p>
              {t.recoverySubtitle}
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={
              handleSendRecovery
            }
          >
            <label className="auth-field">
              <span>
                {t.email}
              </span>

              <div className="auth-input-wrapper">
                <LuMail />

                <input
                  type="email"
                  value={
                    email
                  }
                  onChange={(
                    event,
                  ) => {
                    setEmail(
                      event.target.value,
                    )

                    resetFeedback()
                  }}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            {error && (
              <p className="auth-feedback auth-feedback-error">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-feedback auth-feedback-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={
                loading
              }
            >
              {loading
                ? t.sendingRecovery
                : t.sendRecovery}
            </button>

            <button
              type="button"
              className="auth-recovery-link"
              disabled={
                loading
              }
              onClick={() => {
                setForgotPasswordMode(
                  false,
                )

                resetFeedback()
              }}
            >
              {t.backToLogin}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* =================================================
            CERRAR
            ================================================= */}

        <button
          type="button"
          className="auth-close-button"
          onClick={onClose}
          aria-label={t.close}
          title={t.close}
        >
          <LuX />
        </button>

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
            ENCABEZADO
            ================================================= */}

        <div className="auth-heading">
          <h1>
            {mode === 'login'
              ? t.titleLogin
              : t.titleSignup}
          </h1>

          <p>
            {mode === 'login'
              ? t.subtitleLogin
              : t.subtitleSignup}
          </p>
        </div>

        {/* =================================================
            FORMULARIO
            ================================================= */}

        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
        >
          {/* -------------------------------------------------
              NOMBRE VISIBLE
              ------------------------------------------------- */}

          {mode ===
            'signup' && (
            <label className="auth-field">
              <span>
                {t.displayName}
              </span>

              <div className="auth-input-wrapper">
                <LuUserPlus />

                <input
                  type="text"
                  value={
                    displayName
                  }
                  onChange={(
                    event,
                  ) => {
                    setDisplayName(
                      event
                        .target
                        .value,
                    )

                    resetFeedback()
                  }}
                  autoComplete="name"
                  required
                />
              </div>
            </label>
          )}

          {/* -------------------------------------------------
              CORREO
              ------------------------------------------------- */}

          <label className="auth-field">
            <span>
              {t.email}
            </span>

            <div className="auth-input-wrapper">
              <LuMail />

              <input
                type="email"
                value={
                  email
                }
                onChange={(
                  event,
                ) => {
                  setEmail(
                    event
                      .target
                      .value,
                  )

                  resetFeedback()
                }}
                autoComplete="email"
                required
              />
            </div>
          </label>

          {/* -------------------------------------------------
              CONTRASEÑA
              ------------------------------------------------- */}

          <label className="auth-field">
            <span>
              {t.password}
            </span>

            <div className="auth-input-wrapper">
              {mode ===
              'signup' ? (
                <LuLockKeyhole />
              ) : (
                <LuLogIn />
              )}

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  password
                }
                onChange={(
                  event,
                ) => {
                  setPassword(
                    event
                      .target
                      .value,
                  )

                  resetFeedback()
                }}
                autoComplete={
                  mode ===
                  'login'
                    ? 'current-password'
                    : 'new-password'
                }
                minLength={
                  mode ===
                  'signup'
                    ? 8
                    : undefined
                }
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
                aria-label={
                  showPassword
                    ? t.hidePassword
                    : t.showPassword
                }
                title={
                  showPassword
                    ? t.hidePassword
                    : t.showPassword
                }
              >
                {showPassword ? (
                  <LuEyeOff />
                ) : (
                  <LuEye />
                )}
              </button>
            </div>
          </label>

          {mode ===
            'login' && (
            <button
              type="button"
              className="auth-recovery-link"
              onClick={() => {
                setForgotPasswordMode(
                  true,
                )

                setPassword('')
                setShowPassword(false)
                resetFeedback()
              }}
            >
              {t.forgotPassword}
            </button>
          )}

          {/* =================================================
              SEGURIDAD
              ================================================= */}

          {mode ===
            'signup' && (
            <div className="password-security">
              <div className="password-strength-heading">
                <span>
                  {
                    t.passwordSecurity
                  }
                </span>

                <strong
                  data-strength={
                    password
                      ? passwordScore
                      : 0
                  }
                >
                  {
                    getStrengthLabel()
                  }
                </strong>
              </div>

              <div
                className="password-strength-bar"
                aria-hidden="true"
              >
                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                ].map(
                  (
                    segment,
                  ) => (
                    <span
                      key={
                        segment
                      }
                      className={
                        password &&
                        passwordScore >=
                          segment
                          ? 'active'
                          : ''
                      }
                      data-strength={
                        passwordScore
                      }
                    />
                  ),
                )}
              </div>

              <div className="password-requirements">
                <PasswordRequirement
                  valid={
                    passwordRequirements.length
                  }
                >
                  {
                    t.requirementLength
                  }
                </PasswordRequirement>

                <PasswordRequirement
                  valid={
                    passwordRequirements.uppercase
                  }
                >
                  {
                    t.requirementUppercase
                  }
                </PasswordRequirement>

                <PasswordRequirement
                  valid={
                    passwordRequirements.lowercase
                  }
                >
                  {
                    t.requirementLowercase
                  }
                </PasswordRequirement>

                <PasswordRequirement
                  valid={
                    passwordRequirements.number
                  }
                >
                  {
                    t.requirementNumber
                  }
                </PasswordRequirement>

                <PasswordRequirement
                  valid={
                    passwordRequirements.symbol
                  }
                >
                  {
                    t.requirementSymbol
                  }
                </PasswordRequirement>
              </div>
            </div>
          )}

          {/* =================================================
              ACEPTACIÓN LEGAL
              ================================================= */}

          {mode ===
            'signup' && (
            <div className="auth-legal">
              <label className="auth-legal-control">
                <input
                  type="checkbox"
                  checked={
                    acceptedLegal
                  }
                  onChange={(
                    event,
                  ) => {
                    setAcceptedLegal(
                      event
                        .target
                        .checked,
                    )

                    resetFeedback()
                  }}
                />

                <span className="auth-legal-checkbox">
                  {acceptedLegal && (
                    <LuCheck />
                  )}
                </span>
              </label>

              <p className="auth-legal-text">
                {t.acceptPrefix}{' '}

                <button
                  type="button"
                  className="auth-legal-link"
                  onClick={
                    onOpenTerms
                  }
                >
                  {t.terms}
                </button>

                {' '}
                {t.and}
                {' '}

                <button
                  type="button"
                  className="auth-legal-link"
                  onClick={
                    onOpenPrivacy
                  }
                >
                  {t.privacy}
                </button>
                .
              </p>
            </div>
          )}

          {/* =================================================
              MENSAJES
              ================================================= */}

          {error && (
            <p className="auth-feedback auth-feedback-error">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-feedback auth-feedback-success">
              {message}
            </p>
          )}

          {/* =================================================
              BOTÓN PRINCIPAL
              ================================================= */}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={
              loading
            }
          >
            {loading
              ? mode ===
                'login'
                ? t.loadingLogin
                : t.loadingSignup
              : mode ===
                  'login'
                ? t.login
                : t.signup}
          </button>
        </form>

        {/* =================================================
            CAMBIAR LOGIN / REGISTRO
            ================================================= */}

        <div className="auth-switch">
          <span>
            {mode ===
            'login'
              ? t.noAccount
              : t.hasAccount}
          </span>

          <button
            type="button"
            disabled={
              loading
            }
            onClick={() =>
              changeMode(
                mode ===
                  'login'
                  ? 'signup'
                  : 'login',
              )
            }
          >
            {mode ===
            'login'
              ? t.createOne
              : t.signInInstead}
          </button>
        </div>
      </section>
    </main>
  )
}

export default AuthPage