import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  LuBookOpen,
  LuCalendarDays,
  LuGamepad2,
  LuSave,
  LuShield,
  LuUsers,
} from 'react-icons/lu'
import { supabase } from '../utils/supabase'
import AppHeader from '../components/AppHeader'

type Language = 'en' | 'es'

interface CreateCampaignPageProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onBack: () => void
  onCreated: () => void
  onOpenProfile: () => void
  onSignOut: () => void
}

const translations = {
  en: {
    eyebrow: 'New campaign',
    title: 'Create Campaign',
    intro:
      'Set up the basic information for your campaign. You can add sessions, NPCs, locations, quests and items later.',
    back: 'Back',
    name: 'Campaign name',
    namePlaceholder: 'Curse of Strahd',
    system: 'Game system',
    systemPlaceholder: 'D&D 5e, Pathfinder 2e, Call of Cthulhu...',
    partyName: 'Party name',
    partyNamePlaceholder: 'The Silver Ravens',
    startDate: 'Start date',
    description: 'Description',
    descriptionPlaceholder:
      'A short description of the campaign, setting or adventure...',
    optional: 'Optional',
    create: 'Create Campaign',
    creating: 'Creating campaign...',
    requiredError: 'Campaign name is required.',
    genericError: 'We could not create the campaign. Please try again.',
    sessionError: 'Your session could not be found. Please sign in again.',
  },
  es: {
    eyebrow: 'Nueva campaña',
    title: 'Crear campaña',
    intro:
      'Configurá la información básica de tu campaña. Después vas a poder agregar sesiones, NPCs, lugares, misiones y objetos.',
    back: 'Volver',
    name: 'Nombre de la campaña',
    namePlaceholder: 'La maldición de Strahd',
    system: 'Sistema de juego',
    systemPlaceholder: 'D&D 5e, Pathfinder 2e, Call of Cthulhu...',
    partyName: 'Nombre del grupo',
    partyNamePlaceholder: 'Los Cuervos de Plata',
    startDate: 'Fecha de inicio',
    description: 'Descripción',
    descriptionPlaceholder:
      'Una breve descripción de la campaña, el escenario o la aventura...',
    optional: 'Opcional',
    create: 'Crear campaña',
    creating: 'Creando campaña...',
    requiredError: 'El nombre de la campaña es obligatorio.',
    genericError: 'No pudimos crear la campaña. Intentá nuevamente.',
    sessionError:
      'No pudimos encontrar tu sesión. Volvé a iniciar sesión.',
  },
}

function CreateCampaignPage({
  language,
  onLanguageChange,
  onBack,
  onCreated,
  onOpenProfile,
  onSignOut,
}: CreateCampaignPageProps) {
  const t = translations[language]

  const [name, setName] = useState('')
  const [system, setSystem] = useState('')
  const [partyName, setPartyName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setErrorMessage('')

    if (!name.trim()) {
      setErrorMessage(t.requiredError)
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setErrorMessage(t.sessionError)
        return
      }

      const { error } = await supabase.from('campaigns').insert({
        owner_id: user.id,
        name: name.trim(),
        system: system.trim() || null,
        party_name: partyName.trim() || null,
        start_date: startDate || null,
        description: description.trim() || null,
      })

      if (error) {
        console.error('Error al crear la campaña:', error)
        setErrorMessage(t.genericError)
        return
      }

      onCreated()
    } catch (error) {
      console.error('Error inesperado al crear la campaña:', error)
      setErrorMessage(t.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-campaign-page">
      {/* =================================================
          AMBIENTACIÓN — CREAR CAMPAÑA
          ================================================= */}

      <div
        className="create-campaign-ambience"
        aria-hidden="true"
      >
        <div className="create-campaign-ornament create-campaign-ornament-one">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="create-campaign-ornament create-campaign-ornament-two">
          <span />
          <span />
          <span />
          <span />
        </div>

        <i className="create-campaign-glyph create-campaign-glyph-one">◇</i>
        <i className="create-campaign-glyph create-campaign-glyph-two">△</i>
        <i className="create-campaign-glyph create-campaign-glyph-three">◈</i>

        <div className="create-campaign-dust">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <AppHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onOpenProfile={onOpenProfile}
        onSignOut={onSignOut}
        onBack={onBack}
        backLabel={t.back}
      />

      <main className="create-campaign-main">
        <div className="create-campaign-card">
          <div className="create-campaign-card-ornaments" aria-hidden="true">
            <span className="create-card-corner create-card-corner-tl" />
            <span className="create-card-corner create-card-corner-tr" />
            <span className="create-card-corner create-card-corner-bl" />
            <span className="create-card-corner create-card-corner-br" />

            <span className="create-card-node create-card-node-left" />
            <span className="create-card-node create-card-node-right" />

            <span className="create-card-line create-card-line-left" />
            <span className="create-card-line create-card-line-right" />
          </div>

          <div className="create-campaign-heading">
            <div className="create-campaign-seal" aria-hidden="true">
              <span className="create-campaign-seal-ring create-campaign-seal-ring-outer" />
              <span className="create-campaign-seal-ring create-campaign-seal-ring-inner" />
              <span className="create-campaign-seal-mark create-campaign-seal-mark-top" />
              <span className="create-campaign-seal-mark create-campaign-seal-mark-right" />
              <span className="create-campaign-seal-mark create-campaign-seal-mark-bottom" />
              <span className="create-campaign-seal-mark create-campaign-seal-mark-left" />

              <div className="create-campaign-icon">
                <LuShield />
              </div>
            </div>

            <p className="create-campaign-eyebrow">{t.eyebrow}</p>

            <h1>{t.title}</h1>

            <p className="create-campaign-intro">{t.intro}</p>
          </div>

          <form
            className="create-campaign-form"
            onSubmit={handleSubmit}
          >
            <div className="create-campaign-field">
              <label htmlFor="campaign-name">
                {t.name}
              </label>

              <div className="create-campaign-input">
                <LuBookOpen />

                <input
                  id="campaign-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setErrorMessage('')
                  }}
                  placeholder={t.namePlaceholder}
                  maxLength={120}
                  autoFocus
                />
              </div>
            </div>

            <div className="create-campaign-field">
              <label htmlFor="campaign-system">
                {t.system}
                <span>{t.optional}</span>
              </label>

              <div className="create-campaign-input">
                <LuGamepad2 />

                <input
                  id="campaign-system"
                  type="text"
                  value={system}
                  onChange={(event) =>
                    setSystem(event.target.value)
                  }
                  placeholder={t.systemPlaceholder}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="create-campaign-field">
              <label htmlFor="campaign-party">
                {t.partyName}
                <span>{t.optional}</span>
              </label>

              <div className="create-campaign-input">
                <LuUsers />

                <input
                  id="campaign-party"
                  type="text"
                  value={partyName}
                  onChange={(event) =>
                    setPartyName(event.target.value)
                  }
                  placeholder={t.partyNamePlaceholder}
                  maxLength={120}
                />
              </div>
            </div>

            <div className="create-campaign-field">
              <label htmlFor="campaign-start-date">
                {t.startDate}
                <span>{t.optional}</span>
              </label>

              <div className="create-campaign-input">
                <LuCalendarDays />

                <input
                  id="campaign-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="create-campaign-field">
              <label htmlFor="campaign-description">
                {t.description}
                <span>{t.optional}</span>
              </label>

              <textarea
                id="campaign-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder={t.descriptionPlaceholder}
                maxLength={1000}
                rows={5}
              />
            </div>

            {errorMessage && (
              <div
                className="create-campaign-feedback"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="create-campaign-submit"
              disabled={loading}
            >
              <LuSave />

              <span>
                {loading ? t.creating : t.create}
              </span>
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default CreateCampaignPage