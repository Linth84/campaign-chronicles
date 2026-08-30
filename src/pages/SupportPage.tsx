import { useState } from 'react'
  import type { FormEvent } from 'react'
  import {
  LuArrowLeft,
  LuMail,
  LuSend,
} from 'react-icons/lu'

type Language = 'en' | 'es'
interface PublicInfoPageProps { language: Language }

function SupportPage({ language }: PublicInfoPageProps) {
  const es = language === 'es'
  const [notice, setNotice] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(es ? 'El envío del formulario se conectará en el próximo paso.' : 'Support sending will be connected in the next step.')
  }
  return (
    <main className="public-info-page">
      <button
        type="button"
        className="public-back-button"
        onClick={() => window.history.back()}
      >
        <LuArrowLeft />
        <span>{language === 'es' ? 'Volver' : 'Back'}</span>
      </button>
      <section className="public-info-hero">
        <span className="public-info-eyebrow"><LuMail /> {es ? 'Soporte' : 'Support'}</span>
        <h1>{es ? '¿Necesitás ayuda?' : 'Need a hand?'}</h1>
        <p>{es
          ? 'Mandanos tu consulta o contanos qué salió mal. Tu mensaje irá directamente al soporte de Campaign Chronicles.'
          : 'Send us your question or tell us what went wrong. Your message will go directly to Campaign Chronicles support.'}</p>
      </section>
      <section className="public-support-card">
        <form onSubmit={submit}>
          <div className="public-support-row">
            <label><span>{es ? 'Nombre' : 'Name'}</span><input name="name" required maxLength={80} /></label>
            <label><span>Email</span><input name="email" type="email" required maxLength={160} /></label>
          </div>
          <label><span>{es ? 'Asunto' : 'Subject'}</span><input name="subject" required maxLength={120} /></label>
          <label><span>{es ? '¿Cómo podemos ayudarte?' : 'How can we help?'}</span><textarea name="message" required maxLength={3000} rows={7} /></label>
          {notice && <p className="public-support-notice">{notice}</p>}
          <button className="primary-button" type="submit"><LuSend /> {es ? 'Enviar mensaje' : 'Send message'}</button>
        </form>
      </section>
    </main>
  )
}
export default SupportPage
