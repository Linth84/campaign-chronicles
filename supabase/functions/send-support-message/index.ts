// Supabase Edge Function: send-support-message
// Runtime: Deno

import { Resend } from 'npm:resend@6.0.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://campaign-chronicles.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const supportToEmail = Deno.env.get('SUPPORT_TO_EMAIL')

    if (!resendApiKey || !supportToEmail) {
      console.error('Faltan RESEND_API_KEY o SUPPORT_TO_EMAIL.')
      return jsonResponse({ error: 'Support email is not configured.' }, 500)
    }

    const body = await request.json()

    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const subject = String(body?.subject ?? '').trim()
    const message = String(body?.message ?? '').trim()
    const website = String(body?.website ?? '').trim()

    // Honeypot: los bots suelen completar este campo invisible.
    if (website) {
      return jsonResponse({ ok: true })
    }

    if (
      name.length < 1 ||
      name.length > 80 ||
      email.length < 3 ||
      email.length > 160 ||
      subject.length < 1 ||
      subject.length > 120 ||
      message.length < 10 ||
      message.length > 3000 ||
      !isValidEmail(email)
    ) {
      return jsonResponse({ error: 'Invalid form data.' }, 400)
    }

    const resend = new Resend(resendApiKey)

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br />')

    const { data, error } = await resend.emails.send({
      from: 'Campaign Chronicles Support <support@campaign-chronicles.com>',
      to: [supportToEmail],
      replyTo: email,
      subject: `[Campaign Chronicles] ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#191919;">
          <h2>Nuevo mensaje de soporte</h2>
          <p><strong>Nombre:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Asunto:</strong> ${safeSubject}</p>
          <hr />
          <p style="line-height:1.6;">${safeMessage}</p>
          <hr />
          <p style="font-size:12px;color:#666;">Enviado desde el formulario de soporte de Campaign Chronicles.</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return jsonResponse({ error: 'Email provider rejected the message.' }, 502)
    }

    return jsonResponse({ ok: true, id: data?.id ?? null })
  } catch (error) {
    console.error('Support function error:', error)
    return jsonResponse({ error: 'Unexpected server error.' }, 500)
  }
})
