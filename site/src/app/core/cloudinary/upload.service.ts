import { Injectable } from '@angular/core';

import { cloudinaryConfig, projectFolder, uploadUrl } from './cloudinary.config';

/** What Cloudinary returns that we actually store (04 §6). */
export interface UploadResult {
  readonly url: string;
  readonly publicId: string;
}

/**
 * Direct browser → Cloudinary upload (06 §3.2, 05 §3.4, §4).
 *
 * ─── No secret, by construction ──────────────────────────────────────────────
 * Uses the UNSIGNED preset, so the request carries only the cloud name and the
 * preset name — both public identifiers. There is no API secret in this file,
 * in the bundle, or in any environment variable Angular reads. What an uploader
 * is allowed to do is configured on the preset in the Cloudinary console, not
 * enforced here, which is the right place for it: a client-side restriction is
 * a suggestion.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Bytes never touch Firebase. Firestore stores only `secureUrl` and `publicId`
 * (04 §6); the file itself goes straight from the browser to Cloudinary, so a
 * large screenshot never passes through anything we pay per-read for.
 *
 * `XMLHttpRequest` rather than `fetch`, deliberately: it is the only way to get
 * upload progress, and 05 §3.4 asks for multi-file drag-and-drop, where a
 * progress bar is the difference between "working" and "frozen".
 */
@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  /**
   * Uploads one image into the project's folder.
   *
   * @param onProgress 0–100, called as the upload streams.
   */
  upload(file: File, slug: string, onProgress?: (percent: number) => void): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const body = new FormData();
      body.append('file', file);
      body.append('upload_preset', cloudinaryConfig.uploadPreset);
      /**
       * Mirrors the per-project structure used in Firestore and locally
       * (06 §3.2), so an asset's location is derivable from its project rather
       * than needing a lookup.
       */
      body.append('folder', projectFolder(slug));

      const request = new XMLHttpRequest();
      request.open('POST', uploadUrl());

      request.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      request.onload = () => {
        if (request.status < 200 || request.status >= 300) {
          reject(new Error(`Cloudinary rejected the upload (${request.status}).`));
          return;
        }
        try {
          const parsed = JSON.parse(request.responseText) as {
            secure_url?: string;
            public_id?: string;
          };
          if (!parsed.secure_url || !parsed.public_id) {
            reject(new Error('Cloudinary response was missing secure_url or public_id.'));
            return;
          }
          /**
           * `public_id` is captured here because upload time is the ONLY moment
           * it is available. Without it the asset can never be deleted or
           * re-derived at another size — see 04 §6's accepted orphan gap.
           */
          resolve({ url: parsed.secure_url, publicId: parsed.public_id });
        } catch {
          reject(new Error('Could not parse the Cloudinary response.'));
        }
      };

      request.onerror = () => reject(new Error('Network error during upload.'));
      request.send(body);
    });
  }
}
