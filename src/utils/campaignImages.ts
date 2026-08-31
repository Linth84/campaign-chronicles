import { supabase } from './supabase'

export const CAMPAIGN_IMAGE_BUCKET = 'campaign-images'

const MAX_IMAGE_SIDE = 1200
const WEBP_QUALITY = 0.82

export async function compressCampaignImage(
  file: File,
): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('INVALID_IMAGE')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    MAX_IMAGE_SIDE / bitmap.width,
    MAX_IMAGE_SIDE / bitmap.height,
  )

  const width = Math.max(
    1,
    Math.round(bitmap.width * scale),
  )
  const height = Math.max(
    1,
    Math.round(bitmap.height * scale),
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('CANVAS_UNAVAILABLE')
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('IMAGE_COMPRESSION_FAILED'))
        }
      },
      'image/webp',
      WEBP_QUALITY,
    )
  })
}

export async function uploadCampaignPortrait({
  campaignId,
  entityType,
  entityId,
  file,
}: {
  campaignId: string
  entityType: 'characters' | 'npcs' | 'organizations'
  entityId: string
  file: File
}): Promise<string> {
  const blob = await compressCampaignImage(file)
  const path =
    `${campaignId}/${entityType}/${entityId}.webp`

  const { error } = await supabase.storage
    .from(CAMPAIGN_IMAGE_BUCKET)
    .upload(path, blob, {
      contentType: 'image/webp',
      upsert: true,
      cacheControl: '3600',
    })

  if (error) {
    throw error
  }

  return path
}

export async function removeCampaignPortrait(
  path: string | null | undefined,
) {
  if (
    !path ||
    /^https?:\/\//i.test(path) ||
    path.startsWith('/')
  ) {
    return
  }

  const { error } = await supabase.storage
    .from(CAMPAIGN_IMAGE_BUCKET)
    .remove([path])

  if (error) {
    throw error
  }
}

export async function resolveCampaignImageUrl(
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) {
    return null
  }

  if (
    /^https?:\/\//i.test(path) ||
    path.startsWith('/')
  ) {
    return path
  }

  const { data, error } = await supabase.storage
    .from(CAMPAIGN_IMAGE_BUCKET)
    .createSignedUrl(path, 60 * 60)

  if (error) {
    console.error(
      'Error al firmar imagen de campaña:',
      error,
    )
    return null
  }

  return data.signedUrl
}
