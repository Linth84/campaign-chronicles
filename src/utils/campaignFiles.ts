import {
  Document as DocxDocument,
  AlignmentType,
  BorderStyle,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'

import { jsPDF } from 'jspdf'

import * as mammoth from 'mammoth'

import * as pdfjsLib from 'pdfjs-dist'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

import { supabase } from './supabase'

/* =========================================================
   CONFIGURACIÓN DE PDF.JS
   ========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfWorker

/* =========================================================
   IDENTIDAD VISUAL PARA WORD / PDF
   ========================================================= */

const brandLetterheadUrl =
  `${import.meta.env.BASE_URL}images/campaign-chronicles-letterhead.png`

let brandImagePromise:
  Promise<ArrayBuffer> | null = null

const loadBrandImage = () => {
  if (!brandImagePromise) {
    brandImagePromise =
      fetch(brandLetterheadUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              'No se pudo cargar el membrete de Campaign Chronicles.',
            )
          }

          return response.arrayBuffer()
        })
  }

  return brandImagePromise
}

const createBrandHeader = async () => {
  const imageData =
    await loadBrandImage()

  return new Header({
    children: [
      new Paragraph({
        alignment:
          AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: imageData,
            transformation: {
              width: 190,
              height: 77,
            },
            type: 'png',
          }),
        ],
      }),
      new Paragraph({
        border: {
          bottom: {
            color: 'C7A76A',
            size: 5,
            style:
              BorderStyle.SINGLE,
          },
        },
        text: '',
      }),
    ],
  })
}

const getBrandImageDataUrl = async () => {
  const imageData =
    await loadBrandImage()

  const blob =
    new Blob(
      [imageData],
      { type: 'image/png' },
    )

  return await new Promise<string>(
    (resolve, reject) => {
      const reader =
        new FileReader()

      reader.onload = () =>
        resolve(
          reader.result as string,
        )

      reader.onerror = () =>
        reject(reader.error)

      reader.readAsDataURL(blob)
    },
  )
}


/* =========================================================
   FUENTES DE MARCA PARA WORD / PDF
   ========================================================= */

const brandFontUrls = {
  marcellus:
    `${import.meta.env.BASE_URL}fonts/Marcellus-Regular.ttf`,
  interRegular:
    `${import.meta.env.BASE_URL}fonts/Inter-Regular.ttf`,
  interMedium:
    `${import.meta.env.BASE_URL}fonts/Inter-Medium.ttf`,
  interSemiBold:
    `${import.meta.env.BASE_URL}fonts/Inter-SemiBold.ttf`,
  interBlack:
    `${import.meta.env.BASE_URL}fonts/Inter-Black.ttf`,
}

const fontArrayBufferCache =
  new Map<
    string,
    Promise<ArrayBuffer>
  >()

const loadFontArrayBuffer = (
  url: string,
) => {
  const cached =
    fontArrayBufferCache.get(
      url,
    )

  if (cached) {
    return cached
  }

  const request =
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `No se pudo cargar la fuente: ${url}`,
          )
        }

        return response.arrayBuffer()
      })

  fontArrayBufferCache.set(
    url,
    request,
  )

  return request
}

const arrayBufferToBase64 = (
  buffer: ArrayBuffer,
) => {
  const bytes =
    new Uint8Array(
      buffer,
    )

  const chunkSize =
    0x8000

  let binary = ''

  for (
    let index = 0;
    index < bytes.length;
    index += chunkSize
  ) {
    const chunk =
      bytes.subarray(
        index,
        Math.min(
          index + chunkSize,
          bytes.length,
        ),
      )

    binary +=
      String.fromCharCode(
        ...chunk,
      )
  }

  return btoa(binary)
}

const registerBrandPdfFonts =
  async (
    pdf: jsPDF,
  ) => {
    const [
      marcellus,
      interRegular,
      interMedium,
      interSemiBold,
      interBlack,
    ] =
      await Promise.all([
        loadFontArrayBuffer(
          brandFontUrls.marcellus,
        ),
        loadFontArrayBuffer(
          brandFontUrls.interRegular,
        ),
        loadFontArrayBuffer(
          brandFontUrls.interMedium,
        ),
        loadFontArrayBuffer(
          brandFontUrls.interSemiBold,
        ),
        loadFontArrayBuffer(
          brandFontUrls.interBlack,
        ),
      ])

    const fonts = [
      {
        fileName:
          'Marcellus-Regular.ttf',
        family:
          'Marcellus',
        style:
          'normal',
        data:
          marcellus,
      },
      {
        fileName:
          'Inter-Regular.ttf',
        family:
          'Inter',
        style:
          'normal',
        data:
          interRegular,
      },
      {
        fileName:
          'Inter-Medium.ttf',
        family:
          'Inter',
        style:
          'medium',
        data:
          interMedium,
      },
      {
        fileName:
          'Inter-SemiBold.ttf',
        family:
          'Inter',
        style:
          'semibold',
        data:
          interSemiBold,
      },
      {
        fileName:
          'Inter-Black.ttf',
        family:
          'Inter',
        style:
          'black',
        data:
          interBlack,
      },
    ]

    fonts.forEach(
      (font) => {
        pdf.addFileToVFS(
          font.fileName,
          arrayBufferToBase64(
            font.data,
          ),
        )

        pdf.addFont(
          font.fileName,
          font.family,
          font.style,
        )
      },
    )
  }

const brandDocxStyles = {
  default: {
    document: {
      run: {
        font: 'Inter',
        size: 20,
        color: 'D9D6CF',
      },
      paragraph: {
        spacing: {
          after: 120,
          line: 276,
        },
      },
    },
  },

  paragraphStyles: [
    {
      id: 'Title',
      name: 'Title',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Marcellus',
        size: 42,
        color: '8A6A32',
      },
      paragraph: {
        spacing: {
          before: 160,
          after: 220,
        },
      },
    },
    {
      id: 'Heading1',
      name: 'Heading 1',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Marcellus',
        size: 30,
        color: '8A6A32',
      },
      paragraph: {
        spacing: {
          before: 300,
          after: 120,
        },
        border: {
          bottom: {
            color: 'C7A76A',
            size: 4,
            style:
              BorderStyle.SINGLE,
          },
        },
      },
    },
    {
      id: 'Heading2',
      name: 'Heading 2',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Marcellus',
        size: 24,
        color: '4A4032',
      },
      paragraph: {
        spacing: {
          before: 200,
          after: 80,
        },
      },
    },
    {
      id: 'Heading3',
      name: 'Heading 3',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Inter',
        bold: true,
        size: 21,
        color: '5F513E',
      },
      paragraph: {
        spacing: {
          before: 140,
          after: 60,
        },
      },
    },
  ],
}

/* =========================================================
   TIPOS
   ========================================================= */

export interface CampaignBase {
  id: string
  name: string
  system: string | null
  party_name: string | null
  description: string | null
  start_date: string | null
}

interface SessionRow {
  id: string
  session_number: number | null
  title: string
  session_date: string | null
  summary: string | null
  notes: string | null
}

interface CharacterRow {
  id: string
  name: string
  player_name: string | null
  class_or_archetype: string | null
  ancestry: string | null
  status: string
  description: string | null
  notes: string | null
}

interface NpcRow {
  id: string
  name: string
  role: string | null
  faction: string | null
  status: string
  description: string | null
  notes: string | null
}

interface LocationRow {
  id: string
  name: string
  location_type: string | null
  description: string | null
  notes: string | null
}

interface QuestRow {
  id: string
  title: string
  status: string
  description: string | null
  reward: string | null
  notes: string | null
}

interface ItemRow {
  id: string
  name: string
  item_type: string | null
  rarity: string | null
  quantity: number
  description: string | null
  notes: string | null
}

interface NoteRow {
  id: string
  title: string
  body: string | null
  category: string | null
  is_pinned: boolean
}

interface TimelineEventRow {
  id: string
  title: string
  description: string | null
  event_date: string | null
  sort_order: number | null
}

interface TagRow {
  id: string
  name: string
  color: string | null
}

export interface CampaignArchive {
  format: 'campaign-chronicles-backup'
  version: number
  exported_at: string

  campaign: CampaignBase

  sessions: SessionRow[]
  characters: CharacterRow[]
  npcs: NpcRow[]
  locations: LocationRow[]
  quests: QuestRow[]
  items: ItemRow[]
  notes: NoteRow[]
  timeline_events: TimelineEventRow[]
  tags: TagRow[]
}

/* =========================================================
   CREAR NOMBRE SEGURO PARA ARCHIVOS
   ========================================================= */

const createSafeFileName = (
  name: string,
) => {
  const safeName =
    name
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        '',
      )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-',
      )
      .replace(
        /^-+|-+$/g,
        '',
      )

  return (
    safeName ||
    'campaign'
  )
}

/* =========================================================
   DESCARGAR BLOB
   ========================================================= */

const downloadBlob = (
  blob: Blob,
  fileName: string,
) => {
  const url =
    URL.createObjectURL(
      blob,
    )

  const link =
    document.createElement(
      'a',
    )

  link.href = url
  link.download = fileName

  document.body.appendChild(
    link,
  )

  link.click()

  link.remove()

  URL.revokeObjectURL(
    url,
  )
}

/* =========================================================
   CARGAR TODOS LOS DATOS DE UNA CAMPAÑA
   ========================================================= */

export const loadCampaignArchive =
  async (
    campaign: CampaignBase,
  ): Promise<CampaignArchive> => {
    const [
      sessionsResult,
      charactersResult,
      npcsResult,
      locationsResult,
      questsResult,
      itemsResult,
      notesResult,
      timelineResult,
      tagsResult,
    ] =
      await Promise.all([
        supabase
          .from('sessions')
          .select(
            `
              id,
              session_number,
              title,
              session_date,
              summary,
              notes
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'session_number',
            {
              ascending: true,
              nullsFirst: false,
            },
          ),

        supabase
          .from('characters')
          .select(
            `
              id,
              name,
              player_name,
              class_or_archetype,
              ancestry,
              status,
              description,
              notes
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'name',
            {
              ascending: true,
            },
          ),

        supabase
          .from('npcs')
          .select(
            `
              id,
              name,
              role,
              faction,
              status,
              description,
              notes
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'name',
            {
              ascending: true,
            },
          ),

        supabase
          .from('locations')
          .select(
            `
              id,
              name,
              location_type,
              description,
              notes
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'name',
            {
              ascending: true,
            },
          ),

        supabase
          .from('quests')
          .select(
            `
              id,
              title,
              status,
              description,
              reward,
              notes
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'created_at',
            {
              ascending: true,
            },
          ),

        supabase
          .from('items')
          .select(
            `
              id,
              name,
              item_type,
              rarity,
              quantity,
              description,
              notes
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'name',
            {
              ascending: true,
            },
          ),

        supabase
          .from('notes')
          .select(
            `
              id,
              title,
              body,
              category,
              is_pinned
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'created_at',
            {
              ascending: true,
            },
          ),

        supabase
          .from(
            'timeline_events',
          )
          .select(
            `
              id,
              title,
              description,
              event_date,
              sort_order
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'sort_order',
            {
              ascending: true,
              nullsFirst: false,
            },
          ),

        supabase
          .from('tags')
          .select(
            `
              id,
              name,
              color
            `,
          )
          .eq(
            'campaign_id',
            campaign.id,
          )
          .order(
            'name',
            {
              ascending: true,
            },
          ),
      ])

    const results = [
      sessionsResult,
      charactersResult,
      npcsResult,
      locationsResult,
      questsResult,
      itemsResult,
      notesResult,
      timelineResult,
      tagsResult,
    ]

    const failedResult =
      results.find(
        (result) =>
          result.error !==
          null,
      )

    if (
      failedResult?.error
    ) {
      throw failedResult.error
    }

    return {
      format:
        'campaign-chronicles-backup',

      version: 1,

      exported_at:
        new Date().toISOString(),

      campaign,

      sessions:
        (sessionsResult.data ??
          []) as SessionRow[],

      characters:
        (charactersResult.data ??
          []) as CharacterRow[],

      npcs:
        (npcsResult.data ??
          []) as NpcRow[],

      locations:
        (locationsResult.data ??
          []) as LocationRow[],

      quests:
        (questsResult.data ??
          []) as QuestRow[],

      items:
        (itemsResult.data ??
          []) as ItemRow[],

      notes:
        (notesResult.data ??
          []) as NoteRow[],

      timeline_events:
        (timelineResult.data ??
          []) as TimelineEventRow[],

      tags:
        (tagsResult.data ??
          []) as TagRow[],
    }
  }

/* =========================================================
   EXPORTAR BACKUP JSON
   ========================================================= */

export const exportCampaignJson =
  (
    archive: CampaignArchive,
  ) => {
    const fileContent =
      JSON.stringify(
        archive,
        null,
        2,
      )

    const blob =
      new Blob(
        [fileContent],
        {
          type:
            'application/json',
        },
      )

    downloadBlob(
      blob,
      `${createSafeFileName(
        archive.campaign.name,
      )}-backup.json`,
    )
  }

/* =========================================================
   HELPERS PARA WORD
   ========================================================= */

const createTextParagraphs = (
  text: string | null,
) => {
  if (!text) {
    return []
  }

  return text
    .split(/\n+/)
    .map(
      (line) =>
        line.trim(),
    )
    .filter(Boolean)
    .map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun(
              line,
            ),
          ],
        }),
    )
}

const createLabelParagraph = (
  label: string,
  value:
    | string
    | null
    | undefined,
) => {
  if (!value) {
    return null
  }

  return new Paragraph({
    children: [
      new TextRun({
        text:
          `${label}: `,
        bold: true,
        font: 'Inter',
        color: '5F513E',
      }),

      new TextRun({
        text: value,
      }),
    ],
  })
}

/* =========================================================
   EXPORTAR WORD
   ========================================================= */

export const exportCampaignDocx =
  async (
    archive: CampaignArchive,
  ) => {
    const paragraphs:
      Paragraph[] = []

    /* =====================================================
       PORTADA
       ===================================================== */

    paragraphs.push(
      new Paragraph({
        text:
          archive.campaign
            .name,

        heading:
          HeadingLevel.TITLE,
      }),
    )

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text:
              'Campaign Chronicles',
            italics: true,
          }),
        ],
      }),
    )

    const campaignMetadata =
      [
        createLabelParagraph(
          'System',
          archive.campaign
            .system,
        ),

        createLabelParagraph(
          'Party',
          archive.campaign
            .party_name,
        ),

        createLabelParagraph(
          'Start date',
          archive.campaign
            .start_date,
        ),
      ]

    campaignMetadata.forEach(
      (paragraph) => {
        if (paragraph) {
          paragraphs.push(
            paragraph,
          )
        }
      },
    )

    if (
      archive.campaign
        .description
    ) {
      paragraphs.push(
        new Paragraph({
          text: 'Description',
          heading:
            HeadingLevel.HEADING_1,
        }),
      )

      paragraphs.push(
        ...createTextParagraphs(
          archive.campaign
            .description,
        ),
      )
    }

    /* =====================================================
       SESIONES
       ===================================================== */

    paragraphs.push(
      new Paragraph({
        text: 'Sessions',
        heading:
          HeadingLevel.HEADING_1,
      }),
    )

    if (
      archive.sessions.length ===
      0
    ) {
      paragraphs.push(
        new Paragraph({
          text:
            'No sessions recorded.',
        }),
      )
    }

    archive.sessions.forEach(
      (session) => {
        const sessionTitle =
          session.session_number
            ? `Session ${session.session_number} — ${session.title}`
            : session.title

        paragraphs.push(
          new Paragraph({
            text:
              sessionTitle,

            heading:
              HeadingLevel.HEADING_2,
          }),
        )

        const dateParagraph =
          createLabelParagraph(
            'Date',
            session.session_date,
          )

        if (
          dateParagraph
        ) {
          paragraphs.push(
            dateParagraph,
          )
        }

        if (
          session.summary
        ) {
          paragraphs.push(
            new Paragraph({
              text: 'Summary',
              heading:
                HeadingLevel.HEADING_3,
            }),
          )

          paragraphs.push(
            ...createTextParagraphs(
              session.summary,
            ),
          )
        }

        if (
          session.notes
        ) {
          paragraphs.push(
            new Paragraph({
              text: 'Notes',
              heading:
                HeadingLevel.HEADING_3,
            }),
          )

          paragraphs.push(
            ...createTextParagraphs(
              session.notes,
            ),
          )
        }
      },
    )

    /* =====================================================
       PERSONAJES
       ===================================================== */

    paragraphs.push(
      new Paragraph({
        text: 'Characters',
        heading:
          HeadingLevel.HEADING_1,
      }),
    )

    if (
      archive.characters
        .length === 0
    ) {
      paragraphs.push(
        new Paragraph({
          text:
            'No characters recorded.',
        }),
      )
    }

    archive.characters.forEach(
      (character) => {
        paragraphs.push(
          new Paragraph({
            text:
              character.name,

            heading:
              HeadingLevel.HEADING_2,
          }),
        )

        const metadata = [
          createLabelParagraph(
            'Player',
            character.player_name,
          ),

          createLabelParagraph(
            'Class / Archetype',
            character.class_or_archetype,
          ),

          createLabelParagraph(
            'Ancestry',
            character.ancestry,
          ),

          createLabelParagraph(
            'Status',
            character.status,
          ),
        ]

        metadata.forEach(
          (paragraph) => {
            if (paragraph) {
              paragraphs.push(
                paragraph,
              )
            }
          },
        )

        paragraphs.push(
          ...createTextParagraphs(
            character.description,
          ),
        )

        paragraphs.push(
          ...createTextParagraphs(
            character.notes,
          ),
        )
      },
    )

    /* =====================================================
       NPCs
       ===================================================== */

    paragraphs.push(
      new Paragraph({
        text: 'NPCs',
        heading:
          HeadingLevel.HEADING_1,
      }),
    )

    if (
      archive.npcs.length ===
      0
    ) {
      paragraphs.push(
        new Paragraph({
          text:
            'No NPCs recorded.',
        }),
      )
    }

    archive.npcs.forEach(
      (npc) => {
        paragraphs.push(
          new Paragraph({
            text: npc.name,

            heading:
              HeadingLevel.HEADING_2,
          }),
        )

        const metadata = [
          createLabelParagraph(
            'Role',
            npc.role,
          ),

          createLabelParagraph(
            'Faction',
            npc.faction,
          ),

          createLabelParagraph(
            'Status',
            npc.status,
          ),
        ]

        metadata.forEach(
          (paragraph) => {
            if (paragraph) {
              paragraphs.push(
                paragraph,
              )
            }
          },
        )

        paragraphs.push(
          ...createTextParagraphs(
            npc.description,
          ),
        )

        paragraphs.push(
          ...createTextParagraphs(
            npc.notes,
          ),
        )
      },
    )

    /* =====================================================
       LUGARES
       ===================================================== */

    paragraphs.push(
      new Paragraph({
        text: 'Locations',
        heading:
          HeadingLevel.HEADING_1,
      }),
    )

    if (
      archive.locations
        .length === 0
    ) {
      paragraphs.push(
        new Paragraph({
          text:
            'No locations recorded.',
        }),
      )
    }

    archive.locations.forEach(
      (location) => {
        paragraphs.push(
          new Paragraph({
            text:
              location.name,

            heading:
              HeadingLevel.HEADING_2,
          }),
        )

        const typeParagraph =
          createLabelParagraph(
            'Type',
            location.location_type,
          )

        if (
          typeParagraph
        ) {
          paragraphs.push(
            typeParagraph,
          )
        }

        paragraphs.push(
          ...createTextParagraphs(
            location.description,
          ),
        )

        paragraphs.push(
          ...createTextParagraphs(
            location.notes,
          ),
        )
      },
    )

    /* =====================================================
       MISIONES
       ===================================================== */

    paragraphs.push(
      new Paragraph({
        text: 'Quests',
        heading:
          HeadingLevel.HEADING_1,
      }),
    )

    if (
      archive.quests.length ===
      0
    ) {
      paragraphs.push(
        new Paragraph({
          text:
            'No quests recorded.',
        }),
      )
    }

    archive.quests.forEach(
      (quest) => {
        paragraphs.push(
          new Paragraph({
            text:
              quest.title,

            heading:
              HeadingLevel.HEADING_2,
          }),
        )

        const metadata = [
          createLabelParagraph(
            'Status',
            quest.status,
          ),

          createLabelParagraph(
            'Reward',
            quest.reward,
          ),
        ]

        metadata.forEach(
          (paragraph) => {
            if (paragraph) {
              paragraphs.push(
                paragraph,
              )
            }
          },
        )

        paragraphs.push(
          ...createTextParagraphs(
            quest.description,
          ),
        )

        paragraphs.push(
          ...createTextParagraphs(
            quest.notes,
          ),
        )
      },
    )

    /* =====================================================
       OBJETOS
       ===================================================== */

    paragraphs.push(
      new Paragraph({
        text: 'Items',
        heading:
          HeadingLevel.HEADING_1,
      }),
    )

    if (
      archive.items.length ===
      0
    ) {
      paragraphs.push(
        new Paragraph({
          text:
            'No items recorded.',
        }),
      )
    }

    archive.items.forEach(
      (item) => {
        paragraphs.push(
          new Paragraph({
            text:
              item.name,

            heading:
              HeadingLevel.HEADING_2,
          }),
        )

        const metadata = [
          createLabelParagraph(
            'Type',
            item.item_type,
          ),

          createLabelParagraph(
            'Rarity',
            item.rarity,
          ),

          createLabelParagraph(
            'Quantity',
            String(
              item.quantity,
            ),
          ),
        ]

        metadata.forEach(
          (paragraph) => {
            if (paragraph) {
              paragraphs.push(
                paragraph,
              )
            }
          },
        )

        paragraphs.push(
          ...createTextParagraphs(
            item.description,
          ),
        )

        paragraphs.push(
          ...createTextParagraphs(
            item.notes,
          ),
        )
      },
    )

    /* =====================================================
       NOTAS
       ===================================================== */

    paragraphs.push(
      new Paragraph({
        text: 'Notes',
        heading:
          HeadingLevel.HEADING_1,
      }),
    )

    if (
      archive.notes.length ===
      0
    ) {
      paragraphs.push(
        new Paragraph({
          text:
            'No notes recorded.',
        }),
      )
    }

    archive.notes.forEach(
      (note) => {
        paragraphs.push(
          new Paragraph({
            text:
              note.title,

            heading:
              HeadingLevel.HEADING_2,
          }),
        )

        const categoryParagraph =
          createLabelParagraph(
            'Category',
            note.category,
          )

        if (
          categoryParagraph
        ) {
          paragraphs.push(
            categoryParagraph,
          )
        }

        paragraphs.push(
          ...createTextParagraphs(
            note.body,
          ),
        )
      },
    )

    /* =====================================================
       CREAR ARCHIVO
       ===================================================== */

    const doc =
      new DocxDocument({
        styles:
          brandDocxStyles,

        sections: [
          {
            headers: {
              default:
                await createBrandHeader(),
            },
            children:
              paragraphs,
          },
        ],
      })

    const blob =
      await Packer.toBlob(
        doc,
      )

    downloadBlob(
      blob,
      `${createSafeFileName(
        archive.campaign.name,
      )}.docx`,
    )
  }

/* =========================================================
   EXPORTAR PDF
   ========================================================= */

export const exportCampaignPdf =
  async (
    archive: CampaignArchive,
  ) => {
    const pdf =
      new jsPDF({
        unit: 'mm',
        format: 'a4',
      })

    await registerBrandPdfFonts(
      pdf,
    )

    const brandImage =
      await getBrandImageDataUrl()

    const leftMargin = 18
    const usableWidth = 174

    const drawLetterhead = () => {
      pdf.addImage(
        brandImage,
        'PNG',
        82,
        8,
        46,
        18.6,
      )

      pdf.setDrawColor(
        199,
        167,
        106,
      )
      pdf.setLineWidth(0.25)
      pdf.line(
        leftMargin,
        29,
        leftMargin + usableWidth,
        29,
      )
    }

    drawLetterhead()

    let currentY = 37

    const ensureSpace = (
      neededHeight = 10,
    ) => {
      if (
        currentY +
          neededHeight >
        278
      ) {
        pdf.addPage()
        drawLetterhead()

        currentY = 37
      }
    }

    const addHeading = (
      text: string,
      size = 16,
    ) => {
      ensureSpace(14)

      pdf.setFont(
        'Marcellus',
        'normal',
      )

      pdf.setTextColor(
        138,
        106,
        50,
      )

      pdf.setFontSize(size)

      const lines =
        pdf.splitTextToSize(
          text,
          usableWidth,
        ) as string[]

      lines.forEach(
        (line) => {
          ensureSpace(7)

          pdf.text(
            line,
            leftMargin,
            currentY,
          )

          currentY +=
            size * 0.45
        },
      )

      currentY += 4
    }

    const addParagraph = (
      text:
        | string
        | null
        | undefined,
    ) => {
      if (!text) {
        return
      }

      pdf.setFont(
        'Inter',
        'normal',
      )

      pdf.setTextColor(
        48,
        48,
        48,
      )

      pdf.setFontSize(10)

      const lines =
        pdf.splitTextToSize(
          text,
          usableWidth,
        ) as string[]

      lines.forEach(
        (line) => {
          ensureSpace(6)

          pdf.text(
            line,
            leftMargin,
            currentY,
          )

          currentY += 5
        },
      )

      currentY += 2
    }

    /* =====================================================
       CAMPAÑA
       ===================================================== */

    addHeading(
      archive.campaign.name,
      22,
    )

    addParagraph(
      'Campaign Chronicles',
    )

    if (
      archive.campaign.system
    ) {
      addParagraph(
        `System: ${archive.campaign.system}`,
      )
    }

    if (
      archive.campaign
        .party_name
    ) {
      addParagraph(
        `Party: ${archive.campaign.party_name}`,
      )
    }

    if (
      archive.campaign
        .start_date
    ) {
      addParagraph(
        `Start date: ${archive.campaign.start_date}`,
      )
    }

    if (
      archive.campaign
        .description
    ) {
      addHeading(
        'Description',
      )

      addParagraph(
        archive.campaign
          .description,
      )
    }

    /* =====================================================
       SESIONES
       ===================================================== */

    addHeading('Sessions')

    if (
      archive.sessions.length ===
      0
    ) {
      addParagraph(
        'No sessions recorded.',
      )
    }

    archive.sessions.forEach(
      (session) => {
        addHeading(
          session.session_number
            ? `Session ${session.session_number} - ${session.title}`
            : session.title,
          13,
        )

        if (
          session.session_date
        ) {
          addParagraph(
            `Date: ${session.session_date}`,
          )
        }

        addParagraph(
          session.summary,
        )

        addParagraph(
          session.notes,
        )
      },
    )

    /* =====================================================
       PERSONAJES
       ===================================================== */

    addHeading('Characters')

    if (
      archive.characters
        .length === 0
    ) {
      addParagraph(
        'No characters recorded.',
      )
    }

    archive.characters.forEach(
      (character) => {
        addHeading(
          character.name,
          13,
        )

        if (
          character.player_name
        ) {
          addParagraph(
            `Player: ${character.player_name}`,
          )
        }

        if (
          character.class_or_archetype
        ) {
          addParagraph(
            `Class / Archetype: ${character.class_or_archetype}`,
          )
        }

        if (
          character.ancestry
        ) {
          addParagraph(
            `Ancestry: ${character.ancestry}`,
          )
        }

        addParagraph(
          `Status: ${character.status}`,
        )

        addParagraph(
          character.description,
        )

        addParagraph(
          character.notes,
        )
      },
    )

    /* =====================================================
       NPCs
       ===================================================== */

    addHeading('NPCs')

    if (
      archive.npcs.length ===
      0
    ) {
      addParagraph(
        'No NPCs recorded.',
      )
    }

    archive.npcs.forEach(
      (npc) => {
        addHeading(
          npc.name,
          13,
        )

        if (npc.role) {
          addParagraph(
            `Role: ${npc.role}`,
          )
        }

        if (npc.faction) {
          addParagraph(
            `Faction: ${npc.faction}`,
          )
        }

        addParagraph(
          `Status: ${npc.status}`,
        )

        addParagraph(
          npc.description,
        )

        addParagraph(
          npc.notes,
        )
      },
    )

    /* =====================================================
       LUGARES
       ===================================================== */

    addHeading('Locations')

    if (
      archive.locations
        .length === 0
    ) {
      addParagraph(
        'No locations recorded.',
      )
    }

    archive.locations.forEach(
      (location) => {
        addHeading(
          location.name,
          13,
        )

        if (
          location.location_type
        ) {
          addParagraph(
            `Type: ${location.location_type}`,
          )
        }

        addParagraph(
          location.description,
        )

        addParagraph(
          location.notes,
        )
      },
    )

    /* =====================================================
       MISIONES
       ===================================================== */

    addHeading('Quests')

    if (
      archive.quests.length ===
      0
    ) {
      addParagraph(
        'No quests recorded.',
      )
    }

    archive.quests.forEach(
      (quest) => {
        addHeading(
          quest.title,
          13,
        )

        addParagraph(
          `Status: ${quest.status}`,
        )

        addParagraph(
          quest.description,
        )

        if (quest.reward) {
          addParagraph(
            `Reward: ${quest.reward}`,
          )
        }

        addParagraph(
          quest.notes,
        )
      },
    )

    /* =====================================================
       OBJETOS
       ===================================================== */

    addHeading('Items')

    if (
      archive.items.length ===
      0
    ) {
      addParagraph(
        'No items recorded.',
      )
    }

    archive.items.forEach(
      (item) => {
        addHeading(
          item.name,
          13,
        )

        if (
          item.item_type
        ) {
          addParagraph(
            `Type: ${item.item_type}`,
          )
        }

        if (item.rarity) {
          addParagraph(
            `Rarity: ${item.rarity}`,
          )
        }

        addParagraph(
          `Quantity: ${item.quantity}`,
        )

        addParagraph(
          item.description,
        )

        addParagraph(
          item.notes,
        )
      },
    )

    /* =====================================================
       NOTAS
       ===================================================== */

    addHeading('Notes')

    if (
      archive.notes.length ===
      0
    ) {
      addParagraph(
        'No notes recorded.',
      )
    }

    archive.notes.forEach(
      (note) => {
        addHeading(
          note.title,
          13,
        )

        addParagraph(
          note.body,
        )
      },
    )

    /* =====================================================
       DESCARGAR
       ===================================================== */

    pdf.save(
      `${createSafeFileName(
        archive.campaign.name,
      )}.pdf`,
    )
  }

/* =========================================================
   LEER TXT
   ========================================================= */

const readTxt =
  async (
    file: File,
  ) => {
    return file.text()
  }

/* =========================================================
   LEER DOCX
   ========================================================= */

const readDocx =
  async (
    file: File,
  ) => {
    const arrayBuffer =
      await file.arrayBuffer()

    const result =
      await mammoth.extractRawText(
        {
          arrayBuffer,
        },
      )

    return result.value
  }

/* =========================================================
   LEER PDF
   ========================================================= */

const readPdf =
  async (
    file: File,
  ) => {
    const arrayBuffer =
      await file.arrayBuffer()

    const pdfDocument =
      await pdfjsLib.getDocument(
        {
          data: arrayBuffer,
        },
      ).promise

    const pages:
      string[] = []

    for (
      let pageNumber = 1;
      pageNumber <=
      pdfDocument.numPages;
      pageNumber += 1
    ) {
      const page =
        await pdfDocument.getPage(
          pageNumber,
        )

      const content =
        await page.getTextContent()

      const pageText =
        content.items
          .map(
            (item) => {
              if (
                'str' in item
              ) {
                return item.str
              }

              return ''
            },
          )
          .join(' ')

      pages.push(
        pageText,
      )
    }

    return pages.join(
      '\n\n',
    )
  }

/* =========================================================
   LEER ARCHIVO DE CAMPAÑA
   ========================================================= */

export const readCampaignFile =
  async (
    file: File,
  ) => {
    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase()

    if (
      extension === 'txt'
    ) {
      return readTxt(file)
    }

    if (
      extension === 'docx'
    ) {
      return readDocx(file)
    }

    if (
      extension === 'pdf'
    ) {
      return readPdf(file)
    }

    throw new Error(
      'Unsupported file type.',
    )
  }

/* =========================================================
   PLANTILLAS DE IMPORTACIÓN
   ========================================================= */

type TemplateLanguage =
  | 'en'
  | 'es'

interface TemplateCopy {
  fileBase: string
  title: string
  subtitle: string
  instructions: string
  repeatHint: string
  campaignInfo: string
  campaignName: string
  system: string
  partyName: string
  startDate: string
  description: string
  characters: string
  character: string
  name: string
  player: string
  classArchetype: string
  ancestry: string
  status: string
  notes: string
  sessions: string
  session: string
  number: string
  sessionTitle: string
  date: string
  summary: string
  npcs: string
  npc: string
  role: string
  faction: string
  locations: string
  location: string
  type: string
  quests: string
  quest: string
  reward: string
  items: string
  item: string
  rarity: string
  quantity: string
  generalNotes: string
  note: string
  category: string
  content: string
}

const templateCopy: Record<
  TemplateLanguage,
  TemplateCopy
> = {
  en: {
    fileBase: 'campaign-chronicles-template',
    title: 'Campaign Chronicles',
    subtitle: 'Campaign Import Template',
    instructions:
      'Fill in the fields you need. Leave unused fields blank. You may duplicate CHARACTER, SESSION, NPC, LOCATION, QUEST, ITEM and NOTE blocks as many times as needed.',
    repeatHint:
      'Repeat this block for each entry.',
    campaignInfo: 'CAMPAIGN INFORMATION',
    campaignName: 'Campaign Name',
    system: 'Game System',
    partyName: 'Party Name',
    startDate: 'Start Date',
    description: 'Description',
    characters: 'CHARACTERS',
    character: 'CHARACTER',
    name: 'Name',
    player: 'Player',
    classArchetype: 'Class / Archetype',
    ancestry: 'Ancestry',
    status: 'Status',
    notes: 'Notes',
    sessions: 'SESSIONS',
    session: 'SESSION',
    number: 'Number',
    sessionTitle: 'Title',
    date: 'Date',
    summary: 'Summary',
    npcs: 'NPCS',
    npc: 'NPC',
    role: 'Role',
    faction: 'Faction',
    locations: 'LOCATIONS',
    location: 'LOCATION',
    type: 'Type',
    quests: 'QUESTS',
    quest: 'QUEST',
    reward: 'Reward',
    items: 'ITEMS',
    item: 'ITEM',
    rarity: 'Rarity',
    quantity: 'Quantity',
    generalNotes: 'GENERAL NOTES',
    note: 'NOTE',
    category: 'Category',
    content: 'Content',
  },

  es: {
    fileBase: 'campaign-chronicles-plantilla',
    title: 'Campaign Chronicles',
    subtitle: 'Plantilla de importación de campaña',
    instructions:
      'Completá los campos que necesites y dejá vacíos los que no uses. Podés duplicar los bloques PERSONAJE, SESIÓN, NPC, LUGAR, MISIÓN, OBJETO y NOTA todas las veces que necesites.',
    repeatHint:
      'Repetí este bloque para cada entrada.',
    campaignInfo: 'INFORMACIÓN DE LA CAMPAÑA',
    campaignName: 'Nombre de la campaña',
    system: 'Sistema de juego',
    partyName: 'Nombre del grupo',
    startDate: 'Fecha de inicio',
    description: 'Descripción',
    characters: 'PERSONAJES',
    character: 'PERSONAJE',
    name: 'Nombre',
    player: 'Jugador',
    classArchetype: 'Clase / Arquetipo',
    ancestry: 'Linaje / Ascendencia',
    status: 'Estado',
    notes: 'Notas',
    sessions: 'SESIONES',
    session: 'SESIÓN',
    number: 'Número',
    sessionTitle: 'Título',
    date: 'Fecha',
    summary: 'Resumen',
    npcs: 'NPCS',
    npc: 'NPC',
    role: 'Rol',
    faction: 'Facción',
    locations: 'LUGARES',
    location: 'LUGAR',
    type: 'Tipo',
    quests: 'MISIONES',
    quest: 'MISIÓN',
    reward: 'Recompensa',
    items: 'OBJETOS',
    item: 'OBJETO',
    rarity: 'Rareza',
    quantity: 'Cantidad',
    generalNotes: 'NOTAS GENERALES',
    note: 'NOTA',
    category: 'Categoría',
    content: 'Contenido',
  },
}

/* =========================================================
   HELPERS DE PLANTILLA WORD
   ========================================================= */

const createTemplateField = (
  label: string,
) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        font: 'Inter',
        color: '5F513E',
      }),
      new TextRun({
        text: '',
      }),
    ],
  })
}

const createTemplateBlockHeading = (
  text: string,
) => {
  return new Paragraph({
    text,
    heading:
      HeadingLevel.HEADING_2,
  })
}

/* =========================================================
   DESCARGAR PLANTILLA WORD
   ========================================================= */

export const downloadCampaignTemplateDocx =
  async (
    language: TemplateLanguage,
  ) => {
    const t =
      templateCopy[language]

    const paragraphs:
      Paragraph[] = [
        new Paragraph({
          children: [
            new TextRun({
              text: t.subtitle,
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          text: t.instructions,
        }),
        new Paragraph({
          text: '',
        }),

        new Paragraph({
          text: t.campaignInfo,
          heading:
            HeadingLevel.HEADING_1,
        }),
        createTemplateField(
          t.campaignName,
        ),
        createTemplateField(
          t.system,
        ),
        createTemplateField(
          t.partyName,
        ),
        createTemplateField(
          t.startDate,
        ),
        createTemplateField(
          t.description,
        ),

        new Paragraph({
          text: t.characters,
          heading:
            HeadingLevel.HEADING_1,
        }),
        createTemplateBlockHeading(
          t.character,
        ),
        createTemplateField(
          t.name,
        ),
        createTemplateField(
          t.player,
        ),
        createTemplateField(
          t.classArchetype,
        ),
        createTemplateField(
          t.ancestry,
        ),
        createTemplateField(
          t.status,
        ),
        createTemplateField(
          t.description,
        ),
        createTemplateField(
          t.notes,
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: t.repeatHint,
              italics: true,
            }),
          ],
        }),

        new Paragraph({
          text: t.sessions,
          heading:
            HeadingLevel.HEADING_1,
        }),
        createTemplateBlockHeading(
          t.session,
        ),
        createTemplateField(
          t.number,
        ),
        createTemplateField(
          t.sessionTitle,
        ),
        createTemplateField(
          t.date,
        ),
        createTemplateField(
          t.summary,
        ),
        createTemplateField(
          t.notes,
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: t.repeatHint,
              italics: true,
            }),
          ],
        }),

        new Paragraph({
          text: t.npcs,
          heading:
            HeadingLevel.HEADING_1,
        }),
        createTemplateBlockHeading(
          t.npc,
        ),
        createTemplateField(
          t.name,
        ),
        createTemplateField(
          t.role,
        ),
        createTemplateField(
          t.faction,
        ),
        createTemplateField(
          t.status,
        ),
        createTemplateField(
          t.description,
        ),
        createTemplateField(
          t.notes,
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: t.repeatHint,
              italics: true,
            }),
          ],
        }),

        new Paragraph({
          text: t.locations,
          heading:
            HeadingLevel.HEADING_1,
        }),
        createTemplateBlockHeading(
          t.location,
        ),
        createTemplateField(
          t.name,
        ),
        createTemplateField(
          t.type,
        ),
        createTemplateField(
          t.description,
        ),
        createTemplateField(
          t.notes,
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: t.repeatHint,
              italics: true,
            }),
          ],
        }),

        new Paragraph({
          text: t.quests,
          heading:
            HeadingLevel.HEADING_1,
        }),
        createTemplateBlockHeading(
          t.quest,
        ),
        createTemplateField(
          t.sessionTitle,
        ),
        createTemplateField(
          t.status,
        ),
        createTemplateField(
          t.description,
        ),
        createTemplateField(
          t.reward,
        ),
        createTemplateField(
          t.notes,
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: t.repeatHint,
              italics: true,
            }),
          ],
        }),

        new Paragraph({
          text: t.items,
          heading:
            HeadingLevel.HEADING_1,
        }),
        createTemplateBlockHeading(
          t.item,
        ),
        createTemplateField(
          t.name,
        ),
        createTemplateField(
          t.type,
        ),
        createTemplateField(
          t.rarity,
        ),
        createTemplateField(
          t.quantity,
        ),
        createTemplateField(
          t.description,
        ),
        createTemplateField(
          t.notes,
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: t.repeatHint,
              italics: true,
            }),
          ],
        }),

        new Paragraph({
          text: t.generalNotes,
          heading:
            HeadingLevel.HEADING_1,
        }),
        createTemplateBlockHeading(
          t.note,
        ),
        createTemplateField(
          t.sessionTitle,
        ),
        createTemplateField(
          t.category,
        ),
        createTemplateField(
          t.content,
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: t.repeatHint,
              italics: true,
            }),
          ],
        }),
      ]

    const doc =
      new DocxDocument({
        styles:
          brandDocxStyles,

        sections: [
          {
            headers: {
              default:
                await createBrandHeader(),
            },
            children:
              paragraphs,
          },
        ],
      })

    const blob =
      await Packer.toBlob(
        doc,
      )

    downloadBlob(
      blob,
      `${createSafeFileName(
        t.fileBase,
      )}.docx`,
    )
  }

/* =========================================================
   DESCARGAR PLANTILLA PDF
   ========================================================= */

export const downloadCampaignTemplatePdf =
  async (
    language: TemplateLanguage,
  ) => {
    const t =
      templateCopy[language]

    const pdf =
      new jsPDF({
        unit: 'mm',
        format: 'a4',
      })

    await registerBrandPdfFonts(
      pdf,
    )

    const brandImage =
      await getBrandImageDataUrl()

    const leftMargin = 18
    const usableWidth = 174

    const drawLetterhead = () => {
      pdf.addImage(
        brandImage,
        'PNG',
        82,
        8,
        46,
        18.6,
      )

      pdf.setDrawColor(
        199,
        167,
        106,
      )
      pdf.setLineWidth(0.25)
      pdf.line(
        leftMargin,
        29,
        leftMargin + usableWidth,
        29,
      )
    }

    drawLetterhead()

    let currentY = 37

    const ensureSpace = (
      neededHeight = 8,
    ) => {
      if (
        currentY +
          neededHeight >
        278
      ) {
        pdf.addPage()
        drawLetterhead()
        currentY = 37
      }
    }

    const addHeading = (
      text: string,
      size = 15,
    ) => {
      ensureSpace(12)

      pdf.setFont(
        'Marcellus',
        'normal',
      )

      pdf.setTextColor(
        138,
        106,
        50,
      )

      pdf.setFontSize(size)

      const lines =
        pdf.splitTextToSize(
          text,
          usableWidth,
        ) as string[]

      lines.forEach(
        (line) => {
          ensureSpace(7)

          pdf.text(
            line,
            leftMargin,
            currentY,
          )

          currentY +=
            size * 0.45
        },
      )

      currentY += 3
    }

    const addParagraph = (
      text: string,
    ) => {
      pdf.setFont(
        'Inter',
        'normal',
      )

      pdf.setTextColor(
        48,
        48,
        48,
      )

      pdf.setFontSize(9.5)

      const lines =
        pdf.splitTextToSize(
          text,
          usableWidth,
        ) as string[]

      lines.forEach(
        (line) => {
          ensureSpace(5)

          pdf.text(
            line,
            leftMargin,
            currentY,
          )

          currentY += 4.5
        },
      )

      currentY += 2
    }

    const addField = (
      label: string,
      lines = 1,
    ) => {
      ensureSpace(
        7 +
          Math.max(
            0,
            lines - 1,
          ) * 6,
      )

      pdf.setFont(
        'Inter',
        'semibold',
      )

      pdf.setTextColor(
        74,
        64,
        50,
      )

      pdf.setFontSize(9.5)

      pdf.text(
        `${label}:`,
        leftMargin,
        currentY,
      )

      const labelWidth =
        pdf.getTextWidth(
          `${label}: `,
        )

      pdf.line(
        leftMargin +
          labelWidth,
        currentY + 0.5,
        leftMargin +
          usableWidth,
        currentY + 0.5,
      )

      currentY += 6

      for (
        let line = 1;
        line < lines;
        line += 1
      ) {
        ensureSpace(6)

        pdf.line(
          leftMargin,
          currentY + 0.5,
          leftMargin +
            usableWidth,
          currentY + 0.5,
        )

        currentY += 6
      }

      currentY += 1
    }

    const addRepeatHint = () => {
      pdf.setFont(
        'Inter',
        'medium',
      )

      pdf.setTextColor(
        110,
        105,
        96,
      )

      pdf.setFontSize(8)

      addParagraph(
        t.repeatHint,
      )
    }
addHeading(
      t.subtitle,
      13,
    )

    addParagraph(
      t.instructions,
    )

    addHeading(
      t.campaignInfo,
    )
    addField(
      t.campaignName,
    )
    addField(
      t.system,
    )
    addField(
      t.partyName,
    )
    addField(
      t.startDate,
    )
    addField(
      t.description,
      3,
    )

    addHeading(
      t.characters,
    )
    addHeading(
      t.character,
      11,
    )
    addField(t.name)
    addField(t.player)
    addField(t.classArchetype)
    addField(t.ancestry)
    addField(t.status)
    addField(
      t.description,
      2,
    )
    addField(
      t.notes,
      2,
    )
    addRepeatHint()

    addHeading(
      t.sessions,
    )
    addHeading(
      t.session,
      11,
    )
    addField(t.number)
    addField(t.sessionTitle)
    addField(t.date)
    addField(
      t.summary,
      3,
    )
    addField(
      t.notes,
      2,
    )
    addRepeatHint()

    addHeading(t.npcs)
    addHeading(
      t.npc,
      11,
    )
    addField(t.name)
    addField(t.role)
    addField(t.faction)
    addField(t.status)
    addField(
      t.description,
      2,
    )
    addField(
      t.notes,
      2,
    )
    addRepeatHint()

    addHeading(
      t.locations,
    )
    addHeading(
      t.location,
      11,
    )
    addField(t.name)
    addField(t.type)
    addField(
      t.description,
      3,
    )
    addField(
      t.notes,
      2,
    )
    addRepeatHint()

    addHeading(t.quests)
    addHeading(
      t.quest,
      11,
    )
    addField(t.sessionTitle)
    addField(t.status)
    addField(
      t.description,
      3,
    )
    addField(t.reward)
    addField(
      t.notes,
      2,
    )
    addRepeatHint()

    addHeading(t.items)
    addHeading(
      t.item,
      11,
    )
    addField(t.name)
    addField(t.type)
    addField(t.rarity)
    addField(t.quantity)
    addField(
      t.description,
      2,
    )
    addField(
      t.notes,
      2,
    )
    addRepeatHint()

    addHeading(
      t.generalNotes,
    )
    addHeading(
      t.note,
      11,
    )
    addField(t.sessionTitle)
    addField(t.category)
    addField(
      t.content,
      4,
    )
    addRepeatHint()

    pdf.save(
      `${createSafeFileName(
        t.fileBase,
      )}.pdf`,
    )
  }



/* =========================================================
   PARSER DE PLANTILLA DE IMPORTACIÓN
   ========================================================= */

export interface ParsedCampaignImport {
  structured: boolean
  language:
    | TemplateLanguage
    | null
  campaign: {
    name: string
    system: string
    party_name: string
    start_date: string | null
    description: string
  }
  characters: Array<{
    name: string
    player_name: string | null
    class_or_archetype: string | null
    ancestry: string | null
    status: string | null
    description: string | null
    notes: string | null
  }>
  sessions: Array<{
    session_number: number | null
    title: string
    session_date: string | null
    summary: string | null
    notes: string | null
  }>
  npcs: Array<{
    name: string
    role: string | null
    faction: string | null
    status: string | null
    description: string | null
    notes: string | null
  }>
  locations: Array<{
    name: string
    location_type: string | null
    description: string | null
    notes: string | null
  }>
  quests: Array<{
    title: string
    status: string | null
    description: string | null
    reward: string | null
    notes: string | null
  }>
  items: Array<{
    name: string
    item_type: string | null
    rarity: string | null
    quantity: number | null
    description: string | null
    notes: string | null
  }>
  notes: Array<{
    title: string
    body: string | null
    category: string | null
    is_pinned: boolean
  }>
}

const escapeRegExp = (
  value: string,
) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

const normalizeImportText = (
  text: string,
) => {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const emptyToNull = (
  value: string,
) => {
  const cleaned =
    value.trim()

  return cleaned || null
}

const normalizeStatusValue = (
  value: string,
) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

const normalizeCharacterStatus = (
  value: string,
) => {
  const aliases: Record<string, string> = {
    active: 'active', activo: 'active', activa: 'active', alive: 'active', vivo: 'active', viva: 'active',
    inactive: 'inactive', inactivo: 'inactive', inactiva: 'inactive',
    missing: 'missing', perdido: 'missing', perdida: 'missing', desaparecido: 'missing', desaparecida: 'missing',
    dead: 'dead', muerto: 'dead', muerta: 'dead', deceased: 'dead',
    retired: 'retired', retirado: 'retired', retirada: 'retired',
  }

  return aliases[normalizeStatusValue(value)] ?? null
}

const normalizeNpcStatus = (
  value: string,
) => {
  const aliases: Record<string, string> = {
    unknown: 'unknown', desconocido: 'unknown', desconocida: 'unknown',
    alive: 'alive', vivo: 'alive', viva: 'alive',
    dead: 'dead', muerto: 'dead', muerta: 'dead', deceased: 'dead',
    missing: 'missing', perdido: 'missing', perdida: 'missing', desaparecido: 'missing', desaparecida: 'missing',
    hostile: 'hostile', hostil: 'hostile', enemy: 'hostile', enemigo: 'hostile', enemiga: 'hostile',
    friendly: 'friendly', amistoso: 'friendly', amistosa: 'friendly', friend: 'friendly', aliado: 'friendly', aliada: 'friendly',
  }

  return aliases[normalizeStatusValue(value)] ?? null
}

const normalizeQuestStatus = (
  value: string,
) => {
  const aliases: Record<string, string> = {
    active: 'active', activo: 'active', activa: 'active', incomplete: 'active', incompleta: 'active', incompleto: 'active', pending: 'active', pendiente: 'active', in_progress: 'active', en_progreso: 'active',
    completed: 'completed', complete: 'completed', completada: 'completed', completado: 'completed', finished: 'completed', finalizada: 'completed', finalizado: 'completed',
    failed: 'failed', fail: 'failed', fallida: 'failed', fallido: 'failed',
    on_hold: 'on_hold', paused: 'on_hold', pausada: 'on_hold', pausado: 'on_hold', en_espera: 'on_hold',
    abandoned: 'abandoned', abandonada: 'abandoned', abandonado: 'abandoned', cancelled: 'abandoned', canceled: 'abandoned', cancelada: 'abandoned', cancelado: 'abandoned',
  }

  return aliases[normalizeStatusValue(value)] ?? null
}

const normalizeImportedDate = (
  value: string,
) => {
  const cleaned =
    value.trim()

  if (!cleaned) {
    return null
  }

  const isoMatch =
    cleaned.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    )

  if (isoMatch) {
    const [, year, month, day] =
      isoMatch

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const localMatch =
    cleaned.match(
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
    )

  if (localMatch) {
    const [, day, month, year] =
      localMatch

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  return null
}

const getSection = (
  text: string,
  startHeading: string,
  endHeading:
    | string
    | null,
) => {
  const startIndex =
    text.indexOf(
      startHeading,
    )

  if (startIndex < 0) {
    return ''
  }

  const contentStart =
    startIndex +
    startHeading.length

  if (!endHeading) {
    return text
      .slice(contentStart)
      .trim()
  }

  const endIndex =
    text.indexOf(
      endHeading,
      contentStart,
    )

  if (endIndex < 0) {
    return text
      .slice(contentStart)
      .trim()
  }

  return text
    .slice(
      contentStart,
      endIndex,
    )
    .trim()
}

const getField = (
  block: string,
  label: string,
  nextLabels: string[],
  repeatHint: string,
) => {
  const startPattern =
    `${escapeRegExp(label)}\\s*:\\s*`

  const nextPattern =
    nextLabels.length > 0
      ? `(?=${nextLabels
          .map(
            (nextLabel) =>
              `${escapeRegExp(nextLabel)}\\s*:`,
          )
          .join('|')}|$)`
      : '$'

  const regex =
    new RegExp(
      `${startPattern}([\\s\\S]*?)${nextPattern}`,
    )

  const match =
    block.match(regex)

  if (!match) {
    return ''
  }

  return match[1]
    .replace(
      new RegExp(
        `${escapeRegExp(repeatHint)}\\s*$`,
      ),
      '',
    )
    .trim()
}

const splitTemplateBlocks = (
  section: string,
  blockHeading: string,
  firstLabel: string,
) => {
  if (!section) {
    return []
  }

  const marker =
    '__CC_IMPORT_BLOCK__'

  const regex =
    new RegExp(
      `(?:^|\\s)${escapeRegExp(blockHeading)}\\s+(?=${escapeRegExp(firstLabel)}\\s*:)`,
      'g',
    )

  return section
    .replace(
      regex,
      ` ${marker} `,
    )
    .split(marker)
    .map(
      (block) =>
        block.trim(),
    )
    .filter(Boolean)
}

const detectTemplateLanguage = (
  text: string,
):
  | TemplateLanguage
  | null => {
  if (
    text.includes(
      templateCopy.es
        .campaignInfo,
    )
  ) {
    return 'es'
  }

  if (
    text.includes(
      templateCopy.en
        .campaignInfo,
    )
  ) {
    return 'en'
  }

  return null
}

export const parseCampaignImportTemplate = (
  sourceText: string,
): ParsedCampaignImport => {
  const text =
    normalizeImportText(
      sourceText,
    )

  const language =
    detectTemplateLanguage(
      text,
    )

  const emptyResult: ParsedCampaignImport = {
    structured: false,
    language: null,
    campaign: {
      name: '',
      system: '',
      party_name: '',
      start_date: null,
      description: '',
    },
    characters: [],
    sessions: [],
    npcs: [],
    locations: [],
    quests: [],
    items: [],
    notes: [],
  }

  if (!language) {
    return emptyResult
  }

  const t =
    templateCopy[language]

  const campaignSection =
    getSection(
      text,
      t.campaignInfo,
      t.characters,
    )

  const campaignName =
    getField(
      campaignSection,
      t.campaignName,
      [
        t.system,
        t.partyName,
        t.startDate,
        t.description,
      ],
      t.repeatHint,
    )

  const campaignSystem =
    getField(
      campaignSection,
      t.system,
      [
        t.partyName,
        t.startDate,
        t.description,
      ],
      t.repeatHint,
    )

  const partyName =
    getField(
      campaignSection,
      t.partyName,
      [
        t.startDate,
        t.description,
      ],
      t.repeatHint,
    )

  const startDate =
    getField(
      campaignSection,
      t.startDate,
      [t.description],
      t.repeatHint,
    )

  const campaignDescription =
    getField(
      campaignSection,
      t.description,
      [],
      t.repeatHint,
    )

  const characterSection =
    getSection(
      text,
      t.characters,
      t.sessions,
    )

  const characters =
    splitTemplateBlocks(
      characterSection,
      t.character,
      t.name,
    )
      .map((block) => {
        const name =
          getField(
            block,
            t.name,
            [
              t.player,
              t.classArchetype,
              t.ancestry,
              t.status,
              t.description,
              t.notes,
            ],
            t.repeatHint,
          )

        return {
          name,
          player_name:
            emptyToNull(
              getField(
                block,
                t.player,
                [
                  t.classArchetype,
                  t.ancestry,
                  t.status,
                  t.description,
                  t.notes,
                ],
                t.repeatHint,
              ),
            ),
          class_or_archetype:
            emptyToNull(
              getField(
                block,
                t.classArchetype,
                [
                  t.ancestry,
                  t.status,
                  t.description,
                  t.notes,
                ],
                t.repeatHint,
              ),
            ),
          ancestry:
            emptyToNull(
              getField(
                block,
                t.ancestry,
                [
                  t.status,
                  t.description,
                  t.notes,
                ],
                t.repeatHint,
              ),
            ),
          status:
            normalizeCharacterStatus(
              getField(
                block,
                t.status,
                [
                  t.description,
                  t.notes,
                ],
                t.repeatHint,
              ),
            ),
          description:
            emptyToNull(
              getField(
                block,
                t.description,
                [t.notes],
                t.repeatHint,
              ),
            ),
          notes:
            emptyToNull(
              getField(
                block,
                t.notes,
                [],
                t.repeatHint,
              ),
            ),
        }
      })
      .filter(
        (character) =>
          Boolean(
            character.name,
          ),
      )

  const sessionSection =
    getSection(
      text,
      t.sessions,
      t.npcs,
    )

  const sessions =
    splitTemplateBlocks(
      sessionSection,
      t.session,
      t.number,
    )
      .map((block) => {
        const numberText =
          getField(
            block,
            t.number,
            [
              t.sessionTitle,
              t.date,
              t.summary,
              t.notes,
            ],
            t.repeatHint,
          )

        const parsedNumber =
          Number.parseInt(
            numberText,
            10,
          )

        const sessionNumber =
          Number.isFinite(
            parsedNumber,
          ) && parsedNumber > 0
            ? parsedNumber
            : null

        const title =
          getField(
            block,
            t.sessionTitle,
            [
              t.date,
              t.summary,
              t.notes,
            ],
            t.repeatHint,
          )

        const summary =
          emptyToNull(
            getField(
              block,
              t.summary,
              [t.notes],
              t.repeatHint,
            ),
          )

        const notes =
          emptyToNull(
            getField(
              block,
              t.notes,
              [],
              t.repeatHint,
            ),
          )

        const hasContent =
          Boolean(
            title ||
              summary ||
              notes ||
              sessionNumber !==
                null,
          )

        return {
          session_number:
            sessionNumber,
          title:
            title ||
            (sessionNumber !== null
              ? `${t.session} ${sessionNumber}`
              : t.session),
          session_date:
            normalizeImportedDate(
              getField(
                block,
                t.date,
                [
                  t.summary,
                  t.notes,
                ],
                t.repeatHint,
              ),
            ),
          summary,
          notes,
          hasContent,
        }
      })
      .filter(
        (session) =>
          session.hasContent,
      )
      .map(
        ({ hasContent: _hasContent, ...session }) =>
          session,
      )

  const npcSection =
    getSection(
      text,
      t.npcs,
      t.locations,
    )

  const npcs =
    splitTemplateBlocks(
      npcSection,
      t.npc,
      t.name,
    )
      .map((block) => ({
        name:
          getField(
            block,
            t.name,
            [
              t.role,
              t.faction,
              t.status,
              t.description,
              t.notes,
            ],
            t.repeatHint,
          ),
        role:
          emptyToNull(
            getField(
              block,
              t.role,
              [
                t.faction,
                t.status,
                t.description,
                t.notes,
              ],
              t.repeatHint,
            ),
          ),
        faction:
          emptyToNull(
            getField(
              block,
              t.faction,
              [
                t.status,
                t.description,
                t.notes,
              ],
              t.repeatHint,
            ),
          ),
        status:
          normalizeNpcStatus(
            getField(
              block,
              t.status,
              [
                t.description,
                t.notes,
              ],
              t.repeatHint,
            ),
          ),
        description:
          emptyToNull(
            getField(
              block,
              t.description,
              [t.notes],
              t.repeatHint,
            ),
          ),
        notes:
          emptyToNull(
            getField(
              block,
              t.notes,
              [],
              t.repeatHint,
            ),
          ),
      }))
      .filter(
        (npc) =>
          Boolean(npc.name),
      )

  const locationSection =
    getSection(
      text,
      t.locations,
      t.quests,
    )

  const locations =
    splitTemplateBlocks(
      locationSection,
      t.location,
      t.name,
    )
      .map((block) => ({
        name:
          getField(
            block,
            t.name,
            [
              t.type,
              t.description,
              t.notes,
            ],
            t.repeatHint,
          ),
        location_type:
          emptyToNull(
            getField(
              block,
              t.type,
              [
                t.description,
                t.notes,
              ],
              t.repeatHint,
            ),
          ),
        description:
          emptyToNull(
            getField(
              block,
              t.description,
              [t.notes],
              t.repeatHint,
            ),
          ),
        notes:
          emptyToNull(
            getField(
              block,
              t.notes,
              [],
              t.repeatHint,
            ),
          ),
      }))
      .filter(
        (location) =>
          Boolean(
            location.name,
          ),
      )

  const questSection =
    getSection(
      text,
      t.quests,
      t.items,
    )

  const quests =
    splitTemplateBlocks(
      questSection,
      t.quest,
      t.sessionTitle,
    )
      .map((block) => ({
        title:
          getField(
            block,
            t.sessionTitle,
            [
              t.status,
              t.description,
              t.reward,
              t.notes,
            ],
            t.repeatHint,
          ),
        status:
          normalizeQuestStatus(
            getField(
              block,
              t.status,
              [
                t.description,
                t.reward,
                t.notes,
              ],
              t.repeatHint,
            ),
          ),
        description:
          emptyToNull(
            getField(
              block,
              t.description,
              [
                t.reward,
                t.notes,
              ],
              t.repeatHint,
            ),
          ),
        reward:
          emptyToNull(
            getField(
              block,
              t.reward,
              [t.notes],
              t.repeatHint,
            ),
          ),
        notes:
          emptyToNull(
            getField(
              block,
              t.notes,
              [],
              t.repeatHint,
            ),
          ),
      }))
      .filter(
        (quest) =>
          Boolean(
            quest.title,
          ),
      )

  const itemSection =
    getSection(
      text,
      t.items,
      t.generalNotes,
    )

  const items =
    splitTemplateBlocks(
      itemSection,
      t.item,
      t.name,
    )
      .map((block) => {
        const quantityText =
          getField(
            block,
            t.quantity,
            [
              t.description,
              t.notes,
            ],
            t.repeatHint,
          )

        const parsedQuantity =
          Number.parseInt(
            quantityText,
            10,
          )

        return {
          name:
            getField(
              block,
              t.name,
              [
                t.type,
                t.rarity,
                t.quantity,
                t.description,
                t.notes,
              ],
              t.repeatHint,
            ),
          item_type:
            emptyToNull(
              getField(
                block,
                t.type,
                [
                  t.rarity,
                  t.quantity,
                  t.description,
                  t.notes,
                ],
                t.repeatHint,
              ),
            ),
          rarity:
            emptyToNull(
              getField(
                block,
                t.rarity,
                [
                  t.quantity,
                  t.description,
                  t.notes,
                ],
                t.repeatHint,
              ),
            ),
          quantity:
            Number.isFinite(
              parsedQuantity,
            ) && parsedQuantity > 0
              ? parsedQuantity
              : null,
          description:
            emptyToNull(
              getField(
                block,
                t.description,
                [t.notes],
                t.repeatHint,
              ),
            ),
          notes:
            emptyToNull(
              getField(
                block,
                t.notes,
                [],
                t.repeatHint,
              ),
            ),
        }
      })
      .filter(
        (item) =>
          Boolean(item.name),
      )

  const notesSection =
    getSection(
      text,
      t.generalNotes,
      null,
    )

  const notes =
    splitTemplateBlocks(
      notesSection,
      t.note,
      t.sessionTitle,
    )
      .map((block) => {
        const title =
          getField(
            block,
            t.sessionTitle,
            [
              t.category,
              t.content,
            ],
            t.repeatHint,
          )

        const body =
          emptyToNull(
            getField(
              block,
              t.content,
              [],
              t.repeatHint,
            ),
          )

        return {
          title:
            title ||
            (language === 'es'
              ? 'Nota importada'
              : 'Imported Note'),
          body,
          category:
            emptyToNull(
              getField(
                block,
                t.category,
                [t.content],
                t.repeatHint,
              ),
            ),
          is_pinned: false,
          hasContent:
            Boolean(
              title || body,
            ),
        }
      })
      .filter(
        (note) =>
          note.hasContent,
      )
      .map(
        ({ hasContent: _hasContent, ...note }) =>
          note,
      )

  return {
    structured: true,
    language,
    campaign: {
      name:
        campaignName,
      system:
        campaignSystem,
      party_name:
        partyName,
      start_date:
        normalizeImportedDate(
          startDate,
        ),
      description:
        campaignDescription,
    },
    characters,
    sessions,
    npcs,
    locations,
    quests,
    items,
    notes,
  }
}