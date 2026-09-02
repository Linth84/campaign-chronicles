import {
  useEffect,
  useState,
} from 'react'

import type {
  Session,
} from '@supabase/supabase-js'

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import CreateCampaignPage from './pages/CreateCampaignPage'
import ImportCampaignPage from './pages/ImportCampaignPage'
import UpdateCampaignPage from './pages/UpdateCampaignPage'
import CampaignPage from './pages/CampaignPage'
import ProfilePage from './pages/ProfilePage'
import EmailVerifiedPage from './pages/EmailVerifiedPage'
import InvitePage from './pages/InvitePage'
import PublicHeader from './components/PublicHeader'
import AboutPage from './pages/AboutPage'
import FeaturesPage from './pages/FeaturesPage'
import FaqPage from './pages/FaqPage'
import SupportPage from './pages/SupportPage'
import DonationsPage from './pages/DonationsPage'
import DeveloperBlogPage from './pages/DeveloperBlogPage'
import TutorialsPage from './pages/TutorialsPage'
import OnboardingModal from './components/OnboardingModal'

import './components/MagicCursor'

import {
  supabase,
} from './utils/supabase'

import './App.css'

/* =========================================================
   TIPOS
   ========================================================= */

type Language =
  | 'en'
  | 'es'

type AuthMode =
  | 'login'
  | 'signup'

/* =========================================================
   RUTA DE AUTENTICACIÓN
   ========================================================= */

interface AuthRouteProps {
  language: Language

  passwordRecovery: boolean

  onRecoveryComplete:
    () => void

  onOpenTerms:
    () => void

  onOpenPrivacy:
    () => void
}

function AuthRoute({
  language,
  passwordRecovery,
  onRecoveryComplete,
  onOpenTerms,
  onOpenPrivacy,
}: AuthRouteProps) {
  const navigate =
    useNavigate()

  const {
    mode,
  } =
    useParams<{
      mode?: string
    }>()

  const authMode:
    AuthMode =
    mode === 'signup'
      ? 'signup'
      : 'login'

  const changeAuthMode = (
    nextMode: AuthMode,
  ) => {
    navigate(
      `/auth/${nextMode}`,
    )
  }

  const closeAuth =
    () => {
      navigate('/')
    }

  return (
    <AuthPage
      language={
        language
      }
      mode={
        passwordRecovery
          ? 'login'
          : authMode
      }
      onModeChange={
        changeAuthMode
      }
      onClose={
        passwordRecovery
          ? () => {}
          : closeAuth
      }
      onOpenTerms={
        onOpenTerms
      }
      onOpenPrivacy={
        onOpenPrivacy
      }
      recoveryMode={
        passwordRecovery
      }
      onRecoveryComplete={
        onRecoveryComplete
      }
    />
  )
}

/* =========================================================
   RUTA DE CAMPAÑA
   ========================================================= */

interface CampaignRouteProps {
  language: Language

  onLanguageChange: (
    language: Language,
  ) => void

  onSignOut:
    () => void

  onOpenProfile:
    () => void
}

function CampaignRoute({
  language,
  onLanguageChange,
  onSignOut,
  onOpenProfile,
}: CampaignRouteProps) {
  const navigate =
    useNavigate()

  const {
    campaignId,
  } =
    useParams<{
      campaignId: string
    }>()

  if (!campaignId) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return (
    <CampaignPage
      language={
        language
      }
      campaignId={
        campaignId
      }
      onLanguageChange={
        onLanguageChange
      }
      onBack={() =>
        navigate(
          '/dashboard',
        )
      }
      onSignOut={
        onSignOut
      }
      onOpenProfile={
        onOpenProfile
      }
    />
  )
}

/* =========================================================
   APP INTERNA
   ========================================================= */

function AppContent() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  /* =======================================================
     IDIOMA
     ======================================================= */

  const [
    language,
    setLanguage,
  ] =
    useState<Language>(() => {
      const params =
        new URLSearchParams(
          window.location.search,
        )

      const verificationLanguage =
        params.get('lang')

      if (
        verificationLanguage ===
          'en' ||
        verificationLanguage ===
          'es'
      ) {
        return verificationLanguage
      }

      const savedLanguage =
        localStorage.getItem(
          'campaign-chronicles-language',
        )

      if (
        savedLanguage ===
          'en' ||
        savedLanguage ===
          'es'
      ) {
        return savedLanguage
      }

      return 'en'
    })

  /* =======================================================
     SESIÓN
     ======================================================= */

  const [
    session,
    setSession,
  ] =
    useState<Session | null>(
      null,
    )

  const [
    sessionLoading,
    setSessionLoading,
  ] =
    useState(true)

  const [
    passwordRecovery,
    setPasswordRecovery,
  ] =
    useState(false)

  const [
    onboardingOpen,
    setOnboardingOpen,
  ] = useState(false)

  const [
    emailVerificationSuccess,
    setEmailVerificationSuccess,
  ] =
    useState(() => {
      const params =
        new URLSearchParams(
          window.location.search,
        )

      return (
        params.get('verified') ===
        '1'
      )
    })

  /* =======================================================
     CAMBIAR IDIOMA
     ======================================================= */

  const changeLanguage = (
    newLanguage: Language,
  ) => {
    setLanguage(
      newLanguage,
    )

    localStorage.setItem(
      'campaign-chronicles-language',
      newLanguage,
    )
  }

  /* =======================================================
     RECUPERAR SESIÓN DE SUPABASE
     ======================================================= */

  useEffect(() => {
    let mounted = true

    const loadSession =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth.getSession()

          if (!mounted) {
            return
          }

          if (error) {
            console.error(
              'Error al recuperar la sesión:',
              error,
            )
          }

          setSession(
            data.session,
          )
        } catch (error) {
          console.error(
            'Error inesperado al recuperar la sesión:',
            error,
          )
        } finally {
          if (mounted) {
            setSessionLoading(
              false,
            )
          }
        }
      }

    void loadSession()

    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          currentSession,
        ) => {
          if (
            event ===
            'PASSWORD_RECOVERY'
          ) {
            setPasswordRecovery(
              true,
            )

            navigate(
              '/auth/login',
              {
                replace: true,
              },
            )
          }

          setSession(
            currentSession,
          )

          setSessionLoading(
            false,
          )
        },
      )

    return () => {
      mounted = false

      authListener.subscription.unsubscribe()
    }
  }, [
    navigate,
  ])

  /* =======================================================
     ONBOARDING
     ======================================================= */

  useEffect(() => {
    if (!session?.user?.id || sessionLoading || passwordRecovery || emailVerificationSuccess) return

    const storageKey = `campaign-chronicles-onboarding-v1:${session.user.id}`
    if (localStorage.getItem(storageKey) !== 'completed') {
      setOnboardingOpen(true)
    }
  }, [emailVerificationSuccess, passwordRecovery, session, sessionLoading])

  const closeOnboarding = () => {
    if (session?.user?.id) {
      localStorage.setItem(`campaign-chronicles-onboarding-v1:${session.user.id}`, 'completed')
    }
    setOnboardingOpen(false)
  }

  const openOnboarding = () => setOnboardingOpen(true)

  /* =======================================================
     REDIRECCIÓN DESPUÉS DEL LOGIN
     ======================================================= */

  useEffect(() => {
    if (
      sessionLoading ||
      !session ||
      passwordRecovery ||
      emailVerificationSuccess
    ) {
      return
    }

    if (
      location.pathname === '/' ||
      location.pathname.startsWith(
        '/auth',
      )
    ) {
      navigate(
        '/dashboard',
        {
          replace: true,
        },
      )
    }
  }, [
    emailVerificationSuccess,
    location.pathname,
    navigate,
    passwordRecovery,
    session,
    sessionLoading,
  ])

  /* =======================================================
     FINALIZAR RECUPERACIÓN DE CONTRASEÑA
     ======================================================= */

  const handleRecoveryComplete =
    () => {
      setPasswordRecovery(
        false,
      )

      navigate(
        '/dashboard',
        {
          replace: true,
        },
      )
    }

  /* =======================================================
     CONTINUAR DESPUÉS DE VERIFICAR EL CORREO
     ======================================================= */

  const handleVerificationContinue =
    async () => {
      const {
        error,
      } =
        await supabase.auth.signOut()

      if (error) {
        console.error(
          'Error al cerrar la sesión de verificación:',
          error,
        )

        return
      }

      setEmailVerificationSuccess(
        false,
      )

      setSession(
        null,
      )

      navigate(
        '/auth/login',
        {
          replace: true,
        },
      )
    }

  /* =======================================================
     CERRAR SESIÓN
     ======================================================= */

  const handleSignOut =
    async () => {
      const {
        error,
      } =
        await supabase.auth.signOut()

      if (error) {
        console.error(
          'Error al cerrar sesión:',
          error,
        )

        return
      }

      setSession(
        null,
      )

      setPasswordRecovery(
        false,
      )

      navigate(
        '/',
        {
          replace: true,
        },
      )
    }

  /* =======================================================
     NAVEGACIÓN
     ======================================================= */

  const openProfile =
    () => {
      navigate('/profile')
    }

  const openCreateCampaign =
    () => {
      navigate(
        '/create-campaign',
      )
    }

  const openImportCampaign =
    () => {
      navigate(
        '/import-campaign',
      )
    }

  const openCampaign = (
    campaignId: string,
  ) => {
    navigate(
      `/campaign/${campaignId}/overview`,
    )
  }

  const returnToDashboard =
    () => {
      navigate('/dashboard')
    }

  const openTerms =
    () => {
      navigate('/terms')
    }

  const openPrivacy =
    () => {
      navigate('/privacy')
    }

  const returnToAuth =
    () => {
      navigate('/auth/login')
    }

  const openPublicPage = (
    path: string,
  ) => {
    navigate(path)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  /* =======================================================
     PANTALLA DE CARGA
     ======================================================= */

  if (sessionLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-symbol" />

        <span>
          Campaign Chronicles
        </span>
      </div>
    )
  }

  /* =======================================================
     CORREO VERIFICADO
     ======================================================= */

  if (
    emailVerificationSuccess
  ) {
    return (
      <EmailVerifiedPage
        language={
          language
        }
        onContinue={
          handleVerificationContinue
        }
      />
    )
  }

  /* =======================================================
     RECUPERACIÓN DE CONTRASEÑA
     ======================================================= */

  if (
    passwordRecovery
  ) {
    return (
      <AuthRoute
        language={
          language
        }
        passwordRecovery
        onRecoveryComplete={
          handleRecoveryComplete
        }
        onOpenTerms={
          openTerms
        }
        onOpenPrivacy={
          openPrivacy
        }
      />
    )
  }

  /* =======================================================
     ÁREA PRIVADA
     ======================================================= */

  if (session) {
    return (
      <>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              language={
                language
              }
              onLanguageChange={
                changeLanguage
              }
              onSignOut={
                handleSignOut
              }
              onOpenProfile={
                openProfile
              }
              onCreateCampaign={
                openCreateCampaign
              }
              onImportCampaign={
                openImportCampaign
              }
              onOpenCampaign={
                openCampaign
              }
            />
          }
        />

        <Route
          path="/profile"
          element={
            <ProfilePage
              language={
                language
              }
              onLanguageChange={
                changeLanguage
              }
              onBack={
                returnToDashboard
              }
              onSignOut={
                handleSignOut
              }
            />
          }
        />

        <Route
          path="/create-campaign"
          element={
            <CreateCampaignPage
              language={
                language
              }
              onBack={
                returnToDashboard
              }
              onCreated={
                returnToDashboard
              }
              onLanguageChange={
                changeLanguage
              }
              onOpenProfile={
                openProfile
              }
              onSignOut={
                handleSignOut
              }
            />
          }
        />

        <Route
          path="/import-campaign"
          element={
            <ImportCampaignPage
              language={
                language
              }
              onBack={
                returnToDashboard
              }
              onImported={
                returnToDashboard
              }
              onLanguageChange={
                changeLanguage
              }
              onOpenProfile={
                openProfile
              }
              onSignOut={
                handleSignOut
              }
            />
          }
        />


        <Route
          path="/campaign/:campaignId/update"
          element={
            <UpdateCampaignPage
              language={language}
              onLanguageChange={changeLanguage}
              onOpenProfile={openProfile}
              onSignOut={handleSignOut}
            />
          }
        />

        <Route
          path="/campaign/:campaignId"
          element={
            <Navigate
              to="overview"
              replace
            />
          }
        />

        <Route
          path="/campaign/:campaignId/:section"
          element={
            <CampaignRoute
              language={
                language
              }
              onLanguageChange={
                changeLanguage
              }
              onSignOut={
                handleSignOut
              }
              onOpenProfile={
                openProfile
              }
            />
          }
        />


        <Route path="/about" element={<AboutPage language={language} />} />
        <Route path="/features" element={<FeaturesPage language={language} />} />
        <Route path="/faq" element={<FaqPage language={language} />} />
        <Route path="/support" element={<SupportPage language={language} />} />
        <Route path="/donations" element={<DonationsPage language={language} />} />
        <Route path="/developer-blog" element={<DeveloperBlogPage language={language} />} />
        <Route path="/tutorials" element={<TutorialsPage language={language} onOpenOnboarding={openOnboarding} />} />

        <Route
          path="/invite"
          element={
            <InvitePage
              language={
                language
              }
              onCreateAccount={() =>
                navigate(
                  '/dashboard',
                )
              }
              onSignIn={() =>
                navigate(
                  '/dashboard',
                )
              }
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
      <OnboardingModal language={language} open={onboardingOpen} onClose={closeOnboarding} />
      </>
    )
  }

  /* =======================================================
     ÁREA PÚBLICA
     ======================================================= */

  return (
    <div className="public-shell">
      <PublicHeader
        language={language}
        onLanguageChange={
          changeLanguage
        }
        onNavigate={
          openPublicPage
        }
        onSignIn={() =>
          navigate('/auth/login')
        }
      />

      <Routes>
        <Route
          path="/"
        element={
          <LandingPage
            language={
              language
            }
            onOpenAuth={(
              mode,
            ) =>
              navigate(
                `/auth/${mode}`,
              )
            }
          />
        }
      />


      <Route path="/about" element={<AboutPage language={language} />} />
        <Route path="/features" element={<FeaturesPage language={language} />} />
        <Route path="/faq" element={<FaqPage language={language} />} />
        <Route path="/support" element={<SupportPage language={language} />} />
        <Route path="/donations" element={<DonationsPage language={language} />} />
        <Route path="/developer-blog" element={<DeveloperBlogPage language={language} />} />
        <Route path="/tutorials" element={<TutorialsPage language={language} />} />

      <Route
        path="/invite"
        element={
          <InvitePage
            language={
              language
            }
            onCreateAccount={() =>
              navigate(
                '/auth/signup?from=invite',
              )
            }
            onSignIn={() =>
              navigate(
                '/auth/login?from=invite',
              )
            }
          />
        }
      />

      <Route
        path="/auth"
        element={
          <Navigate
            to="/auth/login"
            replace
          />
        }
      />

      <Route
        path="/auth/:mode"
        element={
          <AuthRoute
            language={
              language
            }
            passwordRecovery={
              false
            }
            onRecoveryComplete={
              handleRecoveryComplete
            }
            onOpenTerms={
              openTerms
            }
            onOpenPrivacy={
              openPrivacy
            }
          />
        }
      />

      <Route
        path="/terms"
        element={
          <TermsPage
            language={
              language
            }
            onLanguageChange={
              changeLanguage
            }
            onBack={
              returnToAuth
            }
          />
        }
      />

      <Route
        path="/privacy"
        element={
          <PrivacyPage
            language={
              language
            }
            onLanguageChange={
              changeLanguage
            }
            onBack={
              returnToAuth
            }
          />
        }
      />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </div>
  )
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
