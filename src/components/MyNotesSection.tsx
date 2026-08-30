import PrivateNotesSection from './PrivateNotesSection'

type Language =
  | 'en'
  | 'es'

interface MyNotesSectionProps {
  language: Language
  campaignId: string
}

function MyNotesSection({
  language,
  campaignId,
}: MyNotesSectionProps) {
  return (
    <PrivateNotesSection
      language={language}
      campaignId={campaignId}
      mode="personal"
    />
  )
}

export default MyNotesSection
