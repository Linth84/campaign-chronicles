import { useConfirm } from './ConfirmProvider'
import {
  useEffect,
  useState,
} from 'react'

import type {
  FormEvent,
} from 'react'

import {
  LuBox,
  LuFilePenLine,
  LuPlus,
  LuSave,
  LuTrash2,
  LuX,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

type Language =
  | 'en'
  | 'es'

interface ItemsSectionProps {
  language: Language
  campaignId: string
}

interface CampaignItem {
  id: string
  campaign_id: string
  name: string
  item_type: string | null
  rarity: string | null
  quantity: number
  description: string | null
  notes: string | null
  created_at: string
}

interface ItemForm {
  name: string
  itemType: string
  rarity: string
  quantity: string
  description: string
  notes: string
}

const emptyItemForm: ItemForm = {
  name: '',
  itemType: '',
  rarity: '',
  quantity: '1',
  description: '',
  notes: '',
}

const translations = {
  en: {
    eyebrow: 'Treasures & Gear',
    title: 'Items',
    description:
      'Track notable equipment, treasures, documents and campaign objects.',
    newItem: 'New Item',
    createItem: 'Create Item',
    editItem: 'Edit Item',
    saveItem: 'Save Item',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading items...',
    noItemsTitle: 'No items recorded yet.',
    noItemsText:
      'Add the first important object found by the party.',
    name: 'Name',
    type: 'Type',
    rarity: 'Rarity',
    quantity: 'Quantity',
    descriptionLabel: 'Description',
    notes: 'Notes',
    nameRequired:
      'Give the item a name before saving.',
    quantityInvalid:
      'Quantity must be greater than zero.',
    loadError:
      'We could not load the items.',
    saveError:
      'We could not save this item.',
    deleteError:
      'We could not delete this item.',
    deleteConfirm:
      'Delete this item? This action cannot be undone.',
    created: 'Item created.',
    updated: 'Item updated.',
    noDescription:
      'No description has been written for this item yet.',
  },

  es: {
    eyebrow: 'Tesoros y equipo',
    title: 'Objetos',
    description:
      'Registrá equipo importante, tesoros, documentos y objetos de campaña.',
    newItem: 'Nuevo objeto',
    createItem: 'Crear objeto',
    editItem: 'Editar objeto',
    saveItem: 'Guardar objeto',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando objetos...',
    noItemsTitle: 'Todavía no hay objetos registrados.',
    noItemsText:
      'Agregá el primer objeto importante encontrado por el grupo.',
    name: 'Nombre',
    type: 'Tipo',
    rarity: 'Rareza',
    quantity: 'Cantidad',
    descriptionLabel: 'Descripción',
    notes: 'Notas',
    nameRequired:
      'Escribí un nombre para el objeto antes de guardarlo.',
    quantityInvalid:
      'La cantidad debe ser mayor que cero.',
    loadError:
      'No pudimos cargar los objetos.',
    saveError:
      'No pudimos guardar este objeto.',
    deleteError:
      'No pudimos eliminar este objeto.',
    deleteConfirm:
      '¿Eliminar este objeto? Esta acción no se puede deshacer.',
    created: 'Objeto creado.',
    updated: 'Objeto actualizado.',
    noDescription:
      'Todavía no hay una descripción para este objeto.',
  },
}

function ItemsSection({
  language,
  campaignId,
}: ItemsSectionProps) {
  const confirmAction = useConfirm()
  const t =
    translations[language]

  const [
    items,
    setItems,
  ] =
    useState<CampaignItem[]>(
      [],
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    editorOpen,
    setEditorOpen,
  ] =
    useState(false)

  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    form,
    setForm,
  ] =
    useState<ItemForm>({
      ...emptyItemForm,
    })

  const [
    saving,
    setSaving,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState('')

  useEffect(() => {
    const loadItems =
      async () => {
        setLoading(true)
        setErrorMessage('')

        try {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'items',
              )
              .select(
                `
                  id,
                  campaign_id,
                  name,
                  item_type,
                  rarity,
                  quantity,
                  description,
                  notes,
                  created_at
                `,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .order(
                'name',
                {
                  ascending: true,
                },
              )

          if (error) {
            throw error
          }

          setItems(
            (data ??
              []) as CampaignItem[],
          )
        } catch (error) {
          console.error(
            'Error al cargar objetos:',
            error,
          )

          setErrorMessage(
            t.loadError,
          )
        } finally {
          setLoading(false)
        }
      }

    void loadItems()
  }, [
    campaignId,
    t.loadError,
  ])

  const openNewItem =
    () => {
      setEditingId(null)

      setForm({
        ...emptyItemForm,
      })

      setErrorMessage('')
      setSuccessMessage('')
      setEditorOpen(true)
    }

  const openEditItem =
    (
      item:
        CampaignItem,
    ) => {
      setEditingId(
        item.id,
      )

      setForm({
        name:
          item.name,
        itemType:
          item.item_type ??
          '',
        rarity:
          item.rarity ??
          '',
        quantity:
          String(
            item.quantity,
          ),
        description:
          item.description ??
          '',
        notes:
          item.notes ??
          '',
      })

      setErrorMessage('')
      setSuccessMessage('')
      setEditorOpen(true)
    }

  const closeEditor =
    () => {
      setEditorOpen(false)
      setEditingId(null)

      setForm({
        ...emptyItemForm,
      })

      setErrorMessage('')
    }

  const handleSave =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault()

      if (
        !form.name.trim()
      ) {
        setErrorMessage(
          t.nameRequired,
        )

        return
      }

      const quantity =
        Number(
          form.quantity,
        )

      if (
        !Number.isFinite(
          quantity,
        ) ||
        quantity <= 0
      ) {
        setErrorMessage(
          t.quantityInvalid,
        )

        return
      }

      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      const itemData = {
        campaign_id:
          campaignId,
        name:
          form.name.trim(),
        item_type:
          form.itemType.trim() ||
          null,
        rarity:
          form.rarity.trim() ||
          null,
        quantity,
        description:
          form.description.trim() ||
          null,
        notes:
          form.notes.trim() ||
          null,
      }

      try {
        if (editingId) {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'items',
              )
              .update(
                itemData,
              )
              .eq(
                'id',
                editingId,
              )
              .eq(
                'campaign_id',
                campaignId,
              )
              .select()
              .single()

          if (error) {
            throw error
          }

          setItems(
            (
              current,
            ) =>
              current
                .map(
                  (
                    item,
                  ) =>
                    item.id ===
                    editingId
                      ? (data as CampaignItem)
                      : item,
                )
                .sort(
                  sortItems,
                ),
          )

          setSuccessMessage(
            t.updated,
          )
        } else {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                'items',
              )
              .insert(
                itemData,
              )
              .select()
              .single()

          if (error) {
            throw error
          }

          setItems(
            (
              current,
            ) =>
              [
                ...current,
                data as CampaignItem,
              ].sort(
                sortItems,
              ),
          )

          setSuccessMessage(
            t.created,
          )
        }

        setEditorOpen(false)
        setEditingId(null)

        setForm({
          ...emptyItemForm,
        })
      } catch (error) {
        console.error(
          'Error al guardar objeto:',
          error,
        )

        setErrorMessage(
          t.saveError,
        )
      } finally {
        setSaving(false)
      }
    }

  const handleDelete =
    async (
      itemId:
        string,
    ) => {
      if (
        !(await confirmAction({ message: t.deleteConfirm, variant: 'danger' }))
      ) {
        return
      }

      setErrorMessage('')
      setSuccessMessage('')

      try {
        const {
          error,
        } =
          await supabase
            .from(
              'items',
            )
            .delete()
            .eq(
              'id',
              itemId,
            )
            .eq(
              'campaign_id',
              campaignId,
            )

        if (error) {
          throw error
        }

        setItems(
          (
            current,
          ) =>
            current.filter(
              (
                item,
              ) =>
                item.id !==
                itemId,
            ),
        )
      } catch (error) {
        console.error(
          'Error al eliminar objeto:',
          error,
        )

        setErrorMessage(
          t.deleteError,
        )
      }
    }

  return (
    <section className="campaign-sessions">
      <div className="campaign-sessions-header">
        <div>
          <p className="campaign-sessions-eyebrow">
            {t.eyebrow}
          </p>

          <h2>
            {t.title}
          </h2>

          <p className="campaign-sessions-description">
            {t.description}
          </p>
        </div>

        {!editorOpen &&
          items.length >
            0 && (
          <button
            type="button"
            className="session-new-button"
            onClick={
              openNewItem
            }
          >
            <LuPlus />
            <span>
              {t.newItem}
            </span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div
          className="session-message session-message-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="session-message session-message-success">
          {successMessage}
        </div>
      )}

      {editorOpen && (
        <form
          className="session-editor"
          onSubmit={
            handleSave
          }
        >
          <div className="session-editor-heading">
            <div>
              <p>
                {editingId
                  ? t.editItem
                  : t.createItem}
              </p>

              <h3>
                {form.name.trim() ||
                  t.newItem}
              </h3>
            </div>

            <button
              type="button"
              className="session-editor-close"
              onClick={
                closeEditor
              }
              aria-label={
                t.cancel
              }
            >
              <LuX />
            </button>
          </div>

          <div className="session-editor-grid">
            <label>
              <span>
                {t.name}
              </span>

              <input
                type="text"
                value={
                  form.name
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      name:
                        event.target.value,
                    }),
                  )
                }
                required
              />
            </label>

            <label>
              <span>
                {t.type}
              </span>

              <input
                type="text"
                value={
                  form.itemType
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      itemType:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label>
              <span>
                {t.rarity}
              </span>

              <input
                type="text"
                value={
                  form.rarity
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      rarity:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label>
              <span>
                {t.quantity}
              </span>

              <input
                type="number"
                min="1"
                step="1"
                value={
                  form.quantity
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      quantity:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label className="session-editor-full">
              <span>
                {t.descriptionLabel}
              </span>

              <textarea
                value={
                  form.description
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      description:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>

            <label className="session-editor-full">
              <span>
                {t.notes}
              </span>

              <textarea
                value={
                  form.notes
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      notes:
                        event.target.value,
                    }),
                  )
                }
              />
            </label>
          </div>

          <div className="session-editor-actions">
            <button
              type="button"
              className="session-cancel-button"
              onClick={
                closeEditor
              }
              disabled={
                saving
              }
            >
              <LuX />
              <span>
                {t.cancel}
              </span>
            </button>

            <button
              type="submit"
              className="session-save-button"
              disabled={
                saving
              }
            >
              <LuSave />
              <span>
                {saving
                  ? t.saving
                  : t.saveItem}
              </span>
            </button>
          </div>
        </form>
      )}

      {!editorOpen &&
        loading && (
        <div className="sessions-loading">
          <div className="app-loading-symbol" />

          <span>
            {t.loading}
          </span>
        </div>
      )}

      {!editorOpen &&
        !loading &&
        items.length ===
          0 && (
        <div className="sessions-empty">
          <LuBox />

          <h3>
            {t.noItemsTitle}
          </h3>

          <p>
            {t.noItemsText}
          </p>

          <button
            type="button"
            onClick={
              openNewItem
            }
          >
            <LuPlus />
            <span>
              {t.newItem}
            </span>
          </button>
        </div>
      )}

      {!editorOpen &&
        !loading &&
        items.length >
          0 && (
        <div className="sessions-list">
          {items.map(
            (
              item,
            ) => (
              <article
                className="session-card"
                key={
                  item.id
                }
              >
                <div className="session-card-top">
                  <div className="session-card-meta">
                    {item.item_type && (
                      <span className="session-card-number">
                        {item.item_type}
                      </span>
                    )}

                    {item.rarity && (
                      <span className="session-card-date">
                        {item.rarity}
                      </span>
                    )}

                    <span className="session-card-date">
                      {t.quantity}:{' '}
                      {item.quantity}
                    </span>
                  </div>

                  <div className="session-card-actions">
                    <button
                      type="button"
                      onClick={() =>
                        openEditItem(
                          item,
                        )
                      }
                      title={
                        t.edit
                      }
                      aria-label={
                        t.edit
                      }
                    >
                      <LuFilePenLine />
                    </button>

                    <button
                      type="button"
                      className="session-delete-button"
                      onClick={() =>
                        void handleDelete(
                          item.id,
                        )
                      }
                      title={
                        t.delete
                      }
                      aria-label={
                        t.delete
                      }
                    >
                      <LuTrash2 />
                    </button>
                  </div>
                </div>

                <h3>
                  {item.name}
                </h3>

                <p>
                  {item.description ||
                    t.noDescription}
                </p>

                {item.notes && (
                  <div className="session-card-notes">
                    <LuBox />

                    <span>
                      {item.notes}
                    </span>
                  </div>
                )}
              </article>
            ),
          )}
        </div>
      )}
    </section>
  )
}

function sortItems(
  first:
    CampaignItem,
  second:
    CampaignItem,
) {
  return first.name.localeCompare(
    second.name,
  )
}

export default ItemsSection
