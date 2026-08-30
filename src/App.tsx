import {
  useEffect,
  useState,
} from 'react'

import type {
  Session,
} from '@supabase/supabase-js'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import CreateCampaignPage from './pages/CreateCampaignPage'
import ImportCampaignPage from './pages/ImportCampaignPage'
import CampaignPage from './pages/CampaignPage'
import ProfilePage from './pages/ProfilePage'
import './components/MagicCursor'
import EmailVerifiedPage from './pages/EmailVerifiedPage'

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

type PublicView =
  | 'landing'
  | 'auth'
  | 'terms'
  | 'privacy'

type PrivateView =
  | 'dashboard'
  | 'create-campaign'
  | 'import-campaign'
  | 'campaign'
  | 'profile'

type AuthMode =
  | 'login'
  | 'signup'

/* =========================================================
   APP
   ========================================================= */

function App() {
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
     NAVEGACIÓN PÚBLICA
     ======================================================= */

  const [
    publicView,
    setPublicView,
  ] =
    useState<PublicView>(
      'landing',
    )

  const [
    authMode,
    setAuthMode,
  ] =
    useState<AuthMode>(
      'login',
    )

  /* =======================================================
     NAVEGACIÓN PRIVADA
     ======================================================= */

  const [
    privateView,
    setPrivateView,
  ] =
    useState<PrivateView>(
      'dashboard',
    )

  const [
    selectedCampaignId,
    setSelectedCampaignId,
  ] =
    useState<string | null>(
      null,
    )

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
     AUTH
     ======================================================= */

  const openAuth = (
    mode: AuthMode,
  ) => {
    setAuthMode(mode)

    setPublicView(
      'auth',
    )
  }

  const closeAuth =
    () => {
      setPublicView(
        'landing',
      )
    }

  /* =======================================================
     LEGALES
     ======================================================= */

  const openTerms =
    () => {
      setPublicView(
        'terms',
      )
    }

  const openPrivacy =
    () => {
      setPublicView(
        'privacy',
      )
    }

  const returnToAuth =
    () => {
      setPublicView(
        'auth',
      )
    }

  /* =======================================================
     CREAR CAMPAÑA
     ======================================================= */

  const openCreateCampaign =
    () => {
      setSelectedCampaignId(
        null,
      )

      setPrivateView(
        'create-campaign',
      )
    }

  /* =======================================================
     IMPORTAR CAMPAÑA
     ======================================================= */

  const openImportCampaign =
    () => {
      setSelectedCampaignId(
        null,
      )

      setPrivateView(
        'import-campaign',
      )
    }

  /* =======================================================
     ABRIR PERFIL
     ======================================================= */

  const openProfile =
    () => {
      setSelectedCampaignId(
        null,
      )

      setPrivateView(
        'profile',
      )
    }

  /* =======================================================
     ABRIR CAMPAÑA
     ======================================================= */

  const openCampaign = (
    campaignId: string,
  ) => {
    setSelectedCampaignId(
      campaignId,
    )

    setPrivateView(
      'campaign',
    )
  }

  /* =======================================================
     VOLVER AL DASHBOARD
     ======================================================= */

  const returnToDashboard =
    () => {
      setSelectedCampaignId(
        null,
      )

      setPrivateView(
        'dashboard',
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

            setPublicView(
              'auth',
            )
          }

          setSession(
            currentSession,
          )

          setSessionLoading(
            false,
          )

          if (
            !currentSession
          ) {
            setSelectedCampaignId(
              null,
            )

            setPrivateView(
              'dashboard',
            )
          }
        },
      )

    return () => {
      mounted = false

      authListener.subscription.unsubscribe()
    }
  }, [])

  /* =======================================================
     FINALIZAR RECUPERACIÓN DE CONTRASEÑA
     ======================================================= */

  const handleRecoveryComplete =
    () => {
      setPasswordRecovery(
        false,
      )

      setPrivateView(
        'dashboard',
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

      window.history.replaceState(
        {},
        '',
        window.location.pathname,
      )

      setEmailVerificationSuccess(
        false,
      )

      setSession(
        null,
      )

      setAuthMode(
        'login',
      )

      setPublicView(
        'auth',
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

      setSelectedCampaignId(
        null,
      )

      setPrivateView(
        'dashboard',
      )

      setPublicView(
        'landing',
      )

      setAuthMode(
        'login',
      )

      setPasswordRecovery(
        false,
      )
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
      <AuthPage
        language={
          language
        }
        mode="login"
        onModeChange={
          setAuthMode
        }
        onClose={() => {}}
        onOpenTerms={
          openTerms
        }
        onOpenPrivacy={
          openPrivacy
        }
        recoveryMode
        onRecoveryComplete={
          handleRecoveryComplete
        }
      />
    )
  }

  /* =======================================================
     ÁREA PRIVADA
     ======================================================= */

  if (session) {
    /* =====================================================
       PERFIL
       ===================================================== */

    if (
      privateView ===
      'profile'
    ) {
      return (
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
      )
    }

    /* =====================================================
       CREAR CAMPAÑA
       ===================================================== */

    if (
      privateView ===
      'create-campaign'
    ) {
      return (
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
      )
    }

    /* =====================================================
       IMPORTAR CAMPAÑA
       ===================================================== */

    if (
      privateView ===
      'import-campaign'
    ) {
      return (
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
      )
    }

    /* =====================================================
       INTERIOR DE CAMPAÑA
       ===================================================== */

    if (
      privateView ===
        'campaign' &&
      selectedCampaignId
    ) {
      return (
        <CampaignPage
          language={
            language
          }
          campaignId={
            selectedCampaignId
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
          onOpenProfile={
            openProfile
          }
        />
      )
    }

    /* =====================================================
       DASHBOARD
       ===================================================== */

    return (
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
    )
  }

  /* =======================================================
     TÉRMINOS
     ======================================================= */

  if (
    publicView ===
    'terms'
  ) {
    return (
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
    )
  }

  /* =======================================================
     PRIVACIDAD
     ======================================================= */

  if (
    publicView ===
    'privacy'
  ) {
    return (
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
    )
  }

  /* =======================================================
     AUTH
     ======================================================= */

  if (
    publicView ===
    'auth'
  ) {
    return (
      <AuthPage
        language={
          language
        }
        mode={
          authMode
        }
        onModeChange={
          setAuthMode
        }
        onClose={
          closeAuth
        }
        onOpenTerms={
          openTerms
        }
        onOpenPrivacy={
          openPrivacy
        }
        recoveryMode={
          false
        }
        onRecoveryComplete={
          handleRecoveryComplete
        }
      />
    )
  }

  /* =======================================================
     LANDING
     ======================================================= */

  return (
    <LandingPage
      language={
        language
      }
      onLanguageChange={
        changeLanguage
      }
      onOpenAuth={
        openAuth
      }
    />
  )
}

export default App