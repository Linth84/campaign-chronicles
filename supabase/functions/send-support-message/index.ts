// Supabase Edge Function: send-support-message
// Runtime: Deno

import {
  Resend,
} from 'npm:resend@6.0.2'

const allowedOrigins = new Set([
  'https://campaign-chronicles.com',
  'https://www.campaign-chronicles.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

const getCorsHeaders = (
  request: Request,
) => {
  const origin =
    request.headers.get('origin') ?? ''

  const allowOrigin =
    allowedOrigins.has(origin)
      ? origin
      : 'https://campaign-chronicles.com'

  return {
    'Access-Control-Allow-Origin':
      allowOrigin,

    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',

    'Access-Control-Allow-Methods':
      'POST, OPTIONS',

    'Vary':
      'Origin',
  }
}

const jsonResponse = (
  request: Request,
  body: Record<string, unknown>,
  status = 200,
) =>
  new Response(
    JSON.stringify(body),
    {
      status,

      headers: {
        ...getCorsHeaders(request),
        'Content-Type':
          'application/json; charset=utf-8',
      },
    },
  )

const escapeHtml = (
  value: string,
) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const isValidEmail = (
  value: string,
) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  )

Deno.serve(
  async (
    request: Request,
  ): Promise<Response> => {
    if (
      request.method ===
      'OPTIONS'
    ) {
      return new Response(
        'ok',
        {
          headers:
            getCorsHeaders(request),
        },
      )
    }

    if (
      request.method !==
      'POST'
    ) {
      return jsonResponse(
        request,
        {
          error:
            'Method not allowed.',
        },
        405,
      )
    }

    try {
      const resendApiKey =
        Deno.env.get(
          'RESEND_API_KEY',
        )

      if (!resendApiKey) {
        console.error(
          'Falta RESEND_API_KEY.',
        )

        return jsonResponse(
          request,
          {
            error:
              'Support email is not configured.',
          },
          500,
        )
      }

      const body =
        await request.json()

      const name =
        String(
          body?.name ?? '',
        ).trim()

      const email =
        String(
          body?.email ?? '',
        ).trim()

      const subject =
        String(
          body?.subject ?? '',
        ).trim()

      const message =
        String(
          body?.message ?? '',
        ).trim()

      const website =
        String(
          body?.website ?? '',
        ).trim()

      // Honeypot para bots.
      if (website) {
        return jsonResponse(
          request,
          {
            ok: true,
          },
        )
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
        return jsonResponse(
          request,
          {
            error:
              'Invalid form data.',
          },
          400,
        )
      }

      const resend =
        new Resend(
          resendApiKey,
        )

      const safeName =
        escapeHtml(name)

      const safeEmail =
        escapeHtml(email)

      const safeSubject =
        escapeHtml(subject)

      const safeMessage =
        escapeHtml(message)
          .replaceAll(
            '\n',
            '<br />',
          )

      const {
        data,
        error,
      } =
        await resend.emails.send({
          from:
            'Campaign Chronicles Website <notifications@campaign-chronicles.com>',

          to: [
            'support@campaign-chronicles.com',
          ],

          replyTo:
            email,

          subject:
            `[Campaign Chronicles] ${subject}`,

          html: `
            <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#191919;">
              <h2>Nuevo mensaje de soporte</h2>

              <p>
                <strong>Nombre:</strong>
                ${safeName}
              </p>

              <p>
                <strong>Email:</strong>
                ${safeEmail}
              </p>

              <p>
                <strong>Asunto:</strong>
                ${safeSubject}
              </p>

              <hr />

              <p style="line-height:1.6;">
                ${safeMessage}
              </p>

              <hr />

              <p style="font-size:12px;color:#666;">
                Enviado desde el formulario de soporte de Campaign Chronicles.
              </p>
            </div>
          `,
        })

      if (error) {
        console.error(
          'Resend error:',
          error,
        )

        return jsonResponse(
          request,
          {
            error:
              'Email provider rejected the message.',
          },
          502,
        )
      }

      return jsonResponse(
        request,
        {
          ok: true,
          id:
            data?.id ?? null,
        },
      )
    } catch (error) {
      console.error(
        'Support function error:',
        error,
      )

      return jsonResponse(
        request,
        {
          error:
            'Unexpected server error.',
        },
        500,
      )
    }
  },
)
