import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  LuShieldAlert,
  LuX,
} from 'react-icons/lu'
import '../styles/confirm-modal.css'

type ConfirmVariant =
  | 'danger'
  | 'gold'
  | 'neutral'

interface ConfirmOptions {
  message: string
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
}

type ConfirmFunction = (
  options: ConfirmOptions,
) => Promise<boolean>

interface DialogState extends ConfirmOptions {
  variant: ConfirmVariant
}

const ConfirmContext =
  createContext<ConfirmFunction | null>(
    null,
  )

export function ConfirmProvider({
  children,
}: {
  children: ReactNode
}) {
  const [dialog, setDialog] =
    useState<DialogState | null>(null)

  const resolverRef =
    useRef<((value: boolean) => void) | null>(
      null,
    )

  const confirm = useCallback<ConfirmFunction>(
    (options) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = resolve
        setDialog({
          ...options,
          variant:
            options.variant ?? 'danger',
        })
      }),
    [],
  )

  const finish = (result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setDialog(null)
  }

  const storedLanguage =
    localStorage.getItem(
      'campaign-chronicles-language',
    )
  const isSpanish =
    storedLanguage === 'es'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {dialog && (
        <div
          className="global-confirm-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              finish(false)
            }
          }}
        >
          <div
            className={`global-confirm-modal global-confirm-modal-${dialog.variant}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-confirm-title"
          >
            <button
              type="button"
              className="global-confirm-close"
              onClick={() => finish(false)}
              aria-label={
                isSpanish ? 'Cerrar' : 'Close'
              }
            >
              <LuX />
            </button>

            <div className="global-confirm-icon">
              <LuShieldAlert />
            </div>

            <h3 id="global-confirm-title">
              {dialog.title ??
                (isSpanish
                  ? 'Confirmar acción'
                  : 'Confirm action')}
            </h3>

            <p>{dialog.message}</p>

            <div className="global-confirm-actions">
              <button
                type="button"
                className="global-confirm-button global-confirm-cancel"
                onClick={() => finish(false)}
              >
                {dialog.cancelLabel ??
                  (isSpanish
                    ? 'Volver'
                    : 'Go back')}
              </button>

              <button
                type="button"
                className={`global-confirm-button global-confirm-accept global-confirm-accept-${dialog.variant}`}
                onClick={() => finish(true)}
              >
                {dialog.confirmLabel ??
                  (isSpanish
                    ? 'Confirmar'
                    : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(
    ConfirmContext,
  )

  if (!context) {
    throw new Error(
      'useConfirm must be used inside ConfirmProvider.',
    )
  }

  return context
}
