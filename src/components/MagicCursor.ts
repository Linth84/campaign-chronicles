/* =========================================================
   CAMPAIGN CHRONICLES — CURSOR MÁGICO GLOBAL
   ========================================================= */

/*
   Este módulo se carga una sola vez desde App.tsx.
   No renderiza interfaz React: crea una capa visual global para el
   cursor y una estela breve de partículas. En pantallas táctiles
   permanece desactivado automáticamente.
*/

const MAGIC_CURSOR_ID =
  'campaign-chronicles-magic-cursor'

const MAGIC_PARTICLE_LAYER_ID =
  'campaign-chronicles-magic-particles'

const supportsFinePointer =
  window.matchMedia(
    '(pointer: fine)',
  ).matches

const reducedMotion =
  window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

if (
  supportsFinePointer &&
  !document.getElementById(
    MAGIC_CURSOR_ID,
  )
) {
  const cursor =
    document.createElement('div')

  cursor.id =
    MAGIC_CURSOR_ID

  cursor.className =
    'magic-cursor'

  cursor.setAttribute(
    'aria-hidden',
    'true',
  )

  const particleLayer =
    document.createElement('div')

  particleLayer.id =
    MAGIC_PARTICLE_LAYER_ID

  particleLayer.className =
    'magic-cursor-particles'

  particleLayer.setAttribute(
    'aria-hidden',
    'true',
  )

  document.body.append(
    particleLayer,
    cursor,
  )

  let lastParticleTime = 0
  let lastX = 0
  let lastY = 0
  let particleIndex = 0

  const interactiveSelector = [
    'a',
    'button',
    'label[for]',
    '[role="button"]',
    'select',
    'summary',
    '.campaign-overview-stat-card',
  ].join(',')

  const setInteractiveState =
    (
      target: EventTarget | null,
    ) => {
      if (
        !(target instanceof Element)
      ) {
        cursor.classList.remove(
          'magic-cursor-interactive',
        )

        return
      }

      cursor.classList.toggle(
        'magic-cursor-interactive',
        Boolean(
          target.closest(
            interactiveSelector,
          ),
        ),
      )
    }

  const createParticle =
    (
      x: number,
      y: number,
    ) => {
      if (reducedMotion) {
        return
      }

      const particle =
        document.createElement('span')

      const variants = [
        'spark',
        'dust',
        'diamond',
      ]

      const variant =
        variants[
          particleIndex %
            variants.length
        ]

      particleIndex += 1

      particle.className =
        `magic-cursor-particle magic-cursor-particle-${variant}`

      const offsetX =
        (Math.random() - 0.5) * 8

      const offsetY =
        (Math.random() - 0.5) * 8

      const driftX =
        (Math.random() - 0.5) * 18

      const driftY =
        -6 - Math.random() * 18

      particle.style.left =
        `${x + offsetX}px`

      particle.style.top =
        `${y + offsetY}px`

      particle.style.setProperty(
        '--magic-drift-x',
        `${driftX}px`,
      )

      particle.style.setProperty(
        '--magic-drift-y',
        `${driftY}px`,
      )

      particleLayer.appendChild(
        particle,
      )

      window.setTimeout(
        () => {
          particle.remove()
        },
        700,
      )
    }

  const handlePointerMove =
    (
      event: PointerEvent,
    ) => {
      cursor.style.transform =
        `translate3d(${event.clientX}px, ${event.clientY}px, 0)`

      cursor.classList.add(
        'magic-cursor-visible',
      )

      setInteractiveState(
        event.target,
      )

      const now =
        performance.now()

      const distance =
        Math.hypot(
          event.clientX - lastX,
          event.clientY - lastY,
        )

      if (
        now - lastParticleTime >
          34 &&
        distance > 4
      ) {
        createParticle(
          event.clientX,
          event.clientY,
        )

        lastParticleTime = now
        lastX = event.clientX
        lastY = event.clientY
      }
    }

  const handlePointerLeave =
    () => {
      cursor.classList.remove(
        'magic-cursor-visible',
      )
    }

  const handlePointerDown =
    () => {
      cursor.classList.add(
        'magic-cursor-pressed',
      )
    }

  const handlePointerUp =
    () => {
      cursor.classList.remove(
        'magic-cursor-pressed',
      )
    }

  window.addEventListener(
    'pointermove',
    handlePointerMove,
    {
      passive: true,
    },
  )

  document.documentElement.addEventListener(
    'mouseleave',
    handlePointerLeave,
  )

  window.addEventListener(
    'pointerdown',
    handlePointerDown,
    {
      passive: true,
    },
  )

  window.addEventListener(
    'pointerup',
    handlePointerUp,
    {
      passive: true,
    },
  )
}

export {}
