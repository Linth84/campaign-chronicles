import {
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuArrowLeft,
  LuLoaderCircle,
  LuMail,
  LuSend,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

type Language =
  | 'en'
  | 'es'

interface PublicInfoPageProps {
  language: Language
}

function SupportPage({
  language,
}: PublicInfoPageProps) {
  const es =
    language === 'es'

  const [
    notice,
    setNotice,
  ] =
    useState('')

  const [
    noticeType,
    setNoticeType,
  ] =
    useState<
      'success' |
      'error' |
      ''
    >('')

  const [
    sending,
    setSending,
  ] =
    useState(false)

  const submit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (sending) {
      return
    }

    const form =
      event.currentTarget

    const formData =
      new FormData(form)

    const payload = {
      name:
        String(
          formData.get('name') ?? '',
        ).trim(),

      email:
        String(
          formData.get('email') ?? '',
        ).trim(),

      subject:
        String(
          formData.get('subject') ?? '',
        ).trim(),

      message:
        String(
          formData.get('message') ?? '',
        ).trim(),

      website:
        String(
          formData.get('website') ?? '',
        ).trim(),
    }

    setSending(true)
    setNotice('')
    setNoticeType('')

    try {
      const {
        error,
      } =
        await supabase.functions.invoke(
          'send-support-message',
          {
            body: payload,
          },
        )

      if (error) {
        throw error
      }

      setNoticeType('success')
      setNotice(
        es
          ? 'Tu mensaje fue enviado. Te responderemos lo antes posible.'
          : 'Your message was sent. We will get back to you as soon as possible.',
      )

      form.reset()
    } catch (error) {
      console.error(
        'Error al enviar el mensaje de soporte:',
        error,
      )

      setNoticeType('error')
      setNotice(
        es
          ? 'No pudimos enviar tu mensaje. Intentá nuevamente en unos minutos.'
          : 'We could not send your message. Please try again in a few minutes.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="public-info-page">
      <button
        type="button"
        className="public-back-button"
        onClick={() =>
          window.history.back()
        }
      >
        <LuArrowLeft />

        <span>
          {es
            ? 'Volver'
            : 'Back'}
        </span>
      </button>

      <section className="public-info-hero">
        <span className="public-info-eyebrow">
          <LuMail />

          {es
            ? 'Soporte'
            : 'Support'}
        </span>

        <h1>
          {es
            ? '¿Necesitás ayuda?'
            : 'Need a hand?'}
        </h1>

        <p>
          {es
            ? 'Mandanos tu consulta o contanos qué salió mal. Tu mensaje irá directamente al soporte de Campaign Chronicles.'
            : 'Send us your question or tell us what went wrong. Your message will go directly to Campaign Chronicles support.'}
        </p>
      </section>

      <section className="public-support-card">
        <form
          onSubmit={submit}
        >
          {/* Campo honeypot invisible para bots. */}
          <label
            className="support-honeypot"
            aria-hidden="true"
          >
            <span>
              Website
            </span>

            <input
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>

          <div className="public-support-row">
            <label>
              <span>
                {es
                  ? 'Nombre'
                  : 'Name'}
              </span>

              <input
                name="name"
                required
                maxLength={80}
                disabled={sending}
                autoComplete="name"
              />
            </label>

            <label>
              <span>
                Email
              </span>

              <input
                name="email"
                type="email"
                required
                maxLength={160}
                disabled={sending}
                autoComplete="email"
              />
            </label>
          </div>

          <label>
            <span>
              {es
                ? 'Asunto'
                : 'Subject'}
            </span>

            <input
              name="subject"
              required
              maxLength={120}
              disabled={sending}
            />
          </label>

          <label>
            <span>
              {es
                ? '¿Cómo podemos ayudarte?'
                : 'How can we help?'}
            </span>

            <textarea
              name="message"
              required
              minLength={10}
              maxLength={3000}
              rows={7}
              disabled={sending}
            />
          </label>

          {notice && (
            <p
              className={`public-support-notice public-support-notice-${noticeType}`}
              role={
                noticeType === 'error'
                  ? 'alert'
                  : 'status'
              }
            >
              {notice}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={sending}
          >
            {sending
              ? (
                <LuLoaderCircle
                  className="support-submit-spinner"
                  aria-hidden="true"
                />
              )
              : (
                <LuSend
                  aria-hidden="true"
                />
              )}

            {sending
              ? (
                es
                  ? 'Enviando...'
                  : 'Sending...'
              )
              : (
                es
                  ? 'Enviar mensaje'
                  : 'Send message'
              )}
          </button>
        </form>
      </section>
    </main>
  )
}

export default SupportPage
