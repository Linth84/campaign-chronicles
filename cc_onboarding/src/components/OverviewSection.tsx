import {
  useEffect,
  useState,
} from 'react'

import {
  LuBookOpen,
  LuBox,
  LuCalendarDays,
  LuGamepad2,
  LuMap,
  LuNotebookPen,
  LuScrollText,
  LuSwords,
  LuUserRound,
  LuUsers,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

type Language =
  | 'en'
  | 'es'

interface OverviewSectionProps {
  language: Language
  campaignId: string
  campaignName: string
  system: string | null
  partyName: string | null
  description: string | null
  onNavigate: (
    section:
      | 'sessions'
      | 'characters'
      | 'npcs'
      | 'locations'
      | 'quests'
      | 'items'
      | 'notes',
  ) => void
}

interface OverviewCounts {
  sessions: number
  characters: number
  npcs: number
  locations: number
  quests: number
  items: number
  notes: number
}

interface RecentSession {
  id: string
  session_number: number | null
  title: string
  session_date: string | null
  summary: string | null
}

interface ActiveQuest {
  id: string
  title: string
  status: string
  description: string | null
}

interface PinnedNote {
  id: string
  title: string
  body: string | null
  category: string | null
}

const emptyCounts: OverviewCounts = {
  sessions: 0,
  characters: 0,
  npcs: 0,
  locations: 0,
  quests: 0,
  items: 0,
  notes: 0,
}

const translations = {
  en: {
    eyebrow: 'Campaign Overview',
    archive: 'Campaign archive',
    archiveText:
      'A live snapshot of everything recorded in this campaign.',
    system: 'System',
    party: 'Party',
    description: 'Description',
    notSpecified: 'Not specified',
    noDescription: 'No description yet.',
    sessions: 'Sessions',
    characters: 'Characters',
    npcs: 'NPCs',
    locations: 'Locations',
    quests: 'Quests',
    items: 'Items',
    notes: 'Notes',
    latestSession: 'Latest Session',
    noSessions: 'No sessions recorded yet.',
    activeQuests: 'Active Quests',
    noActiveQuests: 'No active quests right now.',
    pinnedNotes: 'Pinned Notes',
    noPinnedNotes: 'No pinned notes yet.',
    loading: 'Loading campaign overview...',
    loadError:
      'We could not load all overview data.',
    session: 'Session',
    noSummary: 'No summary yet.',
    noQuestDescription:
      'No quest description yet.',
    uncategorized: 'Uncategorized',
  },

  es: {
    eyebrow: 'Resumen de campaña',
    archive: 'Archivo de campaña',
    archiveText:
      'Una vista en vivo de todo lo registrado en esta campaña.',
    system: 'Sistema',
    party: 'Grupo',
    description: 'Descripción',
    notSpecified: 'No especificado',
    noDescription: 'Todavía no hay una descripción.',
    sessions: 'Sesiones',
    characters: 'Personajes',
    npcs: 'NPCs',
    locations: 'Lugares',
    quests: 'Misiones',
    items: 'Objetos',
    notes: 'Notas',
    latestSession: 'Última sesión',
    noSessions: 'Todavía no hay sesiones registradas.',
    activeQuests: 'Misiones activas',
    noActiveQuests: 'No hay misiones activas en este momento.',
    pinnedNotes: 'Notas fijadas',
    noPinnedNotes: 'Todavía no hay notas fijadas.',
    loading: 'Cargando resumen de campaña...',
    loadError:
      'No pudimos cargar todos los datos del resumen.',
    session: 'Sesión',
    noSummary: 'Todavía no hay resumen.',
    noQuestDescription:
      'Todavía no hay descripción para esta misión.',
    uncategorized: 'Sin categoría',
  },
}

function OverviewSection({
  language,
  campaignId,
  campaignName,
  system,
  partyName,
  description,
  onNavigate,
}: OverviewSectionProps) {
  const t =
    translations[language]

  const [
    counts,
    setCounts,
  ] =
    useState<OverviewCounts>({
      ...emptyCounts,
    })

  const [
    latestSession,
    setLatestSession,
  ] =
    useState<RecentSession | null>(
      null,
    )

  const [
    activeQuests,
    setActiveQuests,
  ] =
    useState<ActiveQuest[]>(
      [],
    )

  const [
    pinnedNotes,
    setPinnedNotes,
  ] =
    useState<PinnedNote[]>(
      [],
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')

  useEffect(() => {
    const loadOverview =
      async () => {
        setLoading(true)
        setErrorMessage('')

        try {
          const [
            sessionsCount,
            charactersCount,
            npcsCount,
            locationsCount,
            questsCount,
            itemsCount,
            notesCount,
            latestSessionResult,
            activeQuestsResult,
            pinnedNotesResult,
          ] =
            await Promise.all([
              countRows(
                'sessions',
                campaignId,
              ),
              countRows(
                'characters',
                campaignId,
              ),
              countRows(
                'npcs',
                campaignId,
              ),
              countRows(
                'locations',
                campaignId,
              ),
              countRows(
                'quests',
                campaignId,
              ),
              countRows(
                'items',
                campaignId,
              ),
              countRows(
                'notes',
                campaignId,
              ),
              supabase
                .from(
                  'sessions',
                )
                .select(
                  `
                    id,
                    session_number,
                    title,
                    session_date,
                    summary
                  `,
                )
                .eq(
                  'campaign_id',
                  campaignId,
                )
                .order(
                  'session_number',
                  {
                    ascending: false,
                    nullsFirst: false,
                  },
                )
                .order(
                  'created_at',
                  {
                    ascending: false,
                  },
                )
                .limit(1)
                .maybeSingle(),
              supabase
                .from(
                  'quests',
                )
                .select(
                  `
                    id,
                    title,
                    status,
                    description
                  `,
                )
                .eq(
                  'campaign_id',
                  campaignId,
                )
                .eq(
                  'status',
                  'active',
                )
                .order(
                  'created_at',
                  {
                    ascending: false,
                  },
                )
                .limit(3),
              supabase
                .from(
                  'notes',
                )
                .select(
                  `
                    id,
                    title,
                    body,
                    category
                  `,
                )
                .eq(
                  'campaign_id',
                  campaignId,
                )
                .eq(
                  'is_pinned',
                  true,
                )
                .order(
                  'created_at',
                  {
                    ascending: false,
                  },
                )
                .limit(3),
            ])

          if (
            latestSessionResult.error
          ) {
            throw latestSessionResult.error
          }

          if (
            activeQuestsResult.error
          ) {
            throw activeQuestsResult.error
          }

          if (
            pinnedNotesResult.error
          ) {
            throw pinnedNotesResult.error
          }

          setCounts({
            sessions:
              sessionsCount,
            characters:
              charactersCount,
            npcs:
              npcsCount,
            locations:
              locationsCount,
            quests:
              questsCount,
            items:
              itemsCount,
            notes:
              notesCount,
          })

          setLatestSession(
            latestSessionResult.data as RecentSession | null,
          )

          setActiveQuests(
            (activeQuestsResult.data ??
              []) as ActiveQuest[],
          )

          setPinnedNotes(
            (pinnedNotesResult.data ??
              []) as PinnedNote[],
          )
        } catch (error) {
          console.error(
            'Error al cargar el overview:',
            error,
          )

          setErrorMessage(
            t.loadError,
          )
        } finally {
          setLoading(false)
        }
      }

    void loadOverview()
  }, [
    campaignId,
    t.loadError,
  ])

  const stats = [
    {
      label:
        t.sessions,
      target: 'sessions' as const,
      value:
        counts.sessions,
      icon:
        LuCalendarDays,
    },
    {
      label:
        t.characters,
      target: 'characters' as const,
      value:
        counts.characters,
      icon:
        LuUserRound,
    },
    {
      label:
        t.npcs,
      target: 'npcs' as const,
      value:
        counts.npcs,
      icon:
        LuUsers,
    },
    {
      label:
        t.locations,
      target: 'locations' as const,
      value:
        counts.locations,
      icon:
        LuMap,
    },
    {
      label:
        t.quests,
      target: 'quests' as const,
      value:
        counts.quests,
      icon:
        LuSwords,
    },
    {
      label:
        t.items,
      target: 'items' as const,
      value:
        counts.items,
      icon:
        LuBox,
    },
    {
      label:
        t.notes,
      target: 'notes' as const,
      value:
        counts.notes,
      icon:
        LuNotebookPen,
    },
  ]

  return (
    <section className="campaign-overview">
      <div className="campaign-overview-heading">
        <p className="campaign-overview-eyebrow">
          {t.eyebrow}
        </p>

        <h2>
          {campaignName}
        </h2>
      </div>

      <div className="campaign-overview-welcome">
        <LuBookOpen />

        <div>
          <h3>
            {t.archive}
          </h3>

          <p>
            {t.archiveText}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div
          className="session-message session-message-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="sessions-loading">
          <div className="app-loading-symbol" />

          <span>
            {t.loading}
          </span>
        </div>
      ) : (
        <>
          <div className="campaign-overview-grid">
            <article>
              <LuGamepad2 />

              <span>
                {t.system}
              </span>

              <strong>
                {system ||
                  t.notSpecified}
              </strong>
            </article>

            <article>
              <LuUsers />

              <span>
                {t.party}
              </span>

              <strong>
                {partyName ||
                  t.notSpecified}
              </strong>
            </article>

            <article className="campaign-overview-description">
              <LuBookOpen />

              <span>
                {t.description}
              </span>

              <strong>
                {description ||
                  t.noDescription}
              </strong>
            </article>
          </div>

          <div className="campaign-overview-grid">
            {stats.map(
              (
                stat,
              ) => {
                const Icon =
                  stat.icon

                return (
                  <button
                    className="campaign-overview-stat-card"
                    key={
                      stat.label
                    }
                    type="button"
                    onClick={() =>
                      onNavigate(
                        stat.target,
                      )
                    }
                  >
                    <Icon />

                    <span>
                      {
                        stat.label
                      }
                    </span>

                    <strong>
                      {
                        stat.value
                      }
                    </strong>
                  </button>
                )
              },
            )}
          </div>

          <div className="sessions-list">
            <article className="session-card">
              <div className="session-card-top">
                <div className="session-card-meta">
                  <span className="session-card-number">
                    <LuCalendarDays />

                    {t.latestSession}
                  </span>
                </div>
              </div>

              {latestSession ? (
                <>
                  <h3>
                    {latestSession.session_number
                      ? `${t.session} ${latestSession.session_number}: ${latestSession.title}`
                      : latestSession.title}
                  </h3>

                  {latestSession.session_date && (
                    <p>
                      {formatDate(
                        latestSession.session_date,
                        language,
                      )}
                    </p>
                  )}

                  <p>
                    {latestSession.summary ||
                      t.noSummary}
                  </p>
                </>
              ) : (
                <p>
                  {t.noSessions}
                </p>
              )}
            </article>

            <article className="session-card">
              <div className="session-card-top">
                <div className="session-card-meta">
                  <span className="session-card-number">
                    <LuSwords />

                    {t.activeQuests}
                  </span>
                </div>
              </div>

              {activeQuests.length >
              0 ? (
                activeQuests.map(
                  (
                    quest,
                  ) => (
                    <div
                      className="session-card-notes"
                      key={
                        quest.id
                      }
                    >
                      <LuScrollText />

                      <span>
                        <strong>
                          {
                            quest.title
                          }
                        </strong>

                        {quest.description
                          ? ` — ${quest.description}`
                          : ''}
                      </span>
                    </div>
                  ),
                )
              ) : (
                <p>
                  {
                    t.noActiveQuests
                  }
                </p>
              )}
            </article>

            <article className="session-card">
              <div className="session-card-top">
                <div className="session-card-meta">
                  <span className="session-card-number">
                    <LuNotebookPen />

                    {t.pinnedNotes}
                  </span>
                </div>
              </div>

              {pinnedNotes.length >
              0 ? (
                pinnedNotes.map(
                  (
                    note,
                  ) => (
                    <div
                      className="session-card-notes"
                      key={
                        note.id
                      }
                    >
                      <LuNotebookPen />

                      <span>
                        <strong>
                          {
                            note.title
                          }
                        </strong>

                        {note.category
                          ? ` · ${note.category}`
                          : ` · ${t.uncategorized}`}

                        {note.body
                          ? ` — ${note.body}`
                          : ''}
                      </span>
                    </div>
                  ),
                )
              ) : (
                <p>
                  {
                    t.noPinnedNotes
                  }
                </p>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  )
}

async function countRows(
  table:
    | 'sessions'
    | 'characters'
    | 'npcs'
    | 'locations'
    | 'quests'
    | 'items'
    | 'notes',
  campaignId: string,
) {
  const {
    count,
    error,
  } =
    await supabase
      .from(table)
      .select(
        '*',
        {
          count: 'exact',
          head: true,
        },
      )
      .eq(
        'campaign_id',
        campaignId,
      )

  if (error) {
    throw error
  }

  return count ?? 0
}

function formatDate(
  value: string,
  language: Language,
) {
  const date =
    new Date(
      `${value}T00:00:00`,
    )

  return new Intl.DateTimeFormat(
    language ===
      'es'
      ? 'es-AR'
      : 'en-US',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(date)
}

export default OverviewSection
