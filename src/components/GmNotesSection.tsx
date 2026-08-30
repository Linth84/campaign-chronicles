import PrivateNotesSection from './PrivateNotesSection'

type Language =
  | 'en'
  | 'es'

interface GmNotesSectionProps {
  language: Language
  campaignId: string
}

function GmNotesSection({
  language,
  campaignId,
}: GmNotesSectionProps) {
  return (
    <PrivateNotesSection
      language={language}
      campaignId={campaignId}
      mode="gm"
    />
  )
}

export default GmNotesSection
