import { cloudinaryConfig, uploadUrl } from './cloudinary.config';

export interface UploadedAsset {
  readonly url: string;
  readonly publicId: string;
}

/**
 * Uploads one file straight to Cloudinary's unsigned endpoint (06 §5).
 *
 * ─── Why this replaced the Upload Widget (2026-09-20) ───────────────────────
 * The widget was adopted to get cropping, and cropping turned out to be the
 * problem rather than the feature: every upload became a modal, a crop step
 * and a round trip through Cloudinary's own UI, so adding six screenshots
 * meant six passes through a dialog that had nothing to do with the task.
 * Screenshots are already the shape they should be — they are captures of a
 * real interface, and cropping them to 16:9 cuts information out of the thing
 * the case study exists to show.
 *
 * Direct upload is also less code, not more: no third-party script injected at
 * runtime, no global to wait for, no external window to hand control to. A
 * plain multipart POST is the whole mechanism.
 *
 * Unsigned, with the preset doing the restricting — the same trade the widget
 * made. 05 §6 accepts it for a single-admin tool behind an auth guard: the
 * preset caps what can be uploaded and where it lands, and no API secret ever
 * reaches the browser.
 */
export async function uploadToCloudinary(file: File, folder: string): Promise<UploadedAsset> {
  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', cloudinaryConfig.uploadPreset);
  body.append('folder', folder);

  const response = await fetch(uploadUrl(), { method: 'POST', body });

  if (!response.ok) {
    /**
     * Cloudinary returns its reason as JSON, and surfacing it matters: the
     * common failures here are an unsigned preset being disabled or a file
     * over the size limit, and "Upload failed" would send someone looking in
     * the wrong place for either.
     */
    const detail = await response
      .json()
      .then((body: { error?: { message?: string } }) => body?.error?.message)
      .catch(() => null);
    throw new Error(detail ?? `Upload failed (${response.status}).`);
  }

  const result = (await response.json()) as { secure_url: string; public_id: string };
  return { url: result.secure_url, publicId: result.public_id };
}
