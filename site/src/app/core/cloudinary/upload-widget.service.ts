import { Injectable } from '@angular/core';

import { cloudinaryConfig, projectFolder } from './cloudinary.config';

/** What Cloudinary's widget returns that we actually store (04 §6). */
export interface WidgetUploadResult {
  readonly url: string;
  readonly publicId: string;
}

/**
 * Minimal typing for the piece of the global `cloudinary` object this app
 * actually calls. The widget is loaded from Cloudinary's own CDN at runtime
 * (see `ensureScript` below), not installed as a package, so there is no
 * first-party type package to import instead.
 */
interface CloudinaryWidgetGlobal {
  createUploadWidget(
    options: Record<string, unknown>,
    callback: (error: unknown, result: CloudinaryWidgetEvent) => void,
  ): { open(): void };
}

interface CloudinaryWidgetEvent {
  readonly event: string;
  readonly info?: { readonly secure_url: string; readonly public_id: string };
}

declare global {
  interface Window {
    cloudinary?: CloudinaryWidgetGlobal;
  }
}

const WIDGET_SCRIPT_URL = 'https://upload-widget.cloudinary.com/latest/global/all.js';

/**
 * Cloudinary's own Upload Widget (05 §3.4, replacing a custom XHR uploader —
 * Muhammed's manual-testing report: cropping screenshots needs an interactive
 * crop tool, and building one is redundant when Cloudinary already ships one).
 *
 * ─── Loaded at runtime, not bundled ────────────────────────────────────────
 * The widget script is fetched via a `<script>` tag injected on first use, not
 * imported as a module. That means it never appears in `ng build`'s stats at
 * all — not even in the admin's already-separate lazy chunk (05 §7) — because
 * Angular's bundler never sees it. The public site's bundle is untouched by
 * construction, not by care.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * `cropping: true` with a 16:9 default matches the laptop-screenshot use case
 * this project mostly uploads; `showSkipCropButton` is on by default, so a
 * screenshot that isn't 16:9 is one click away from uploading uncropped.
 */
@Injectable({ providedIn: 'root' })
export class CloudinaryWidgetService {
  private scriptPromise: Promise<void> | null = null;

  /**
   * Opens the widget for a project's folder. `onUpload` fires once per file —
   * the widget supports multi-file selection (`multiple: true`), matching the
   * old drop-zone's behaviour.
   */
  async openWidget(slug: string, onUpload: (result: WidgetUploadResult) => void): Promise<void> {
    await this.ensureScript();
    const cloudinary = window.cloudinary;
    if (!cloudinary) throw new Error('Cloudinary widget failed to load.');

    const widget = cloudinary.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        folder: projectFolder(slug),
        multiple: true,
        sources: ['local'],
        cropping: true,
        croppingAspectRatio: 16 / 9,
        clientAllowedFormats: ['image'],
      },
      (error, result) => {
        if (error || !result || result.event !== 'success' || !result.info) return;
        onUpload({ url: result.info.secure_url, publicId: result.info.public_id });
      },
    );
    widget.open();
  }

  private ensureScript(): Promise<void> {
    if (window.cloudinary) return Promise.resolve();
    if (this.scriptPromise) return this.scriptPromise;

    this.scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = WIDGET_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load the Cloudinary upload widget.'));
      document.head.appendChild(script);
    });
    return this.scriptPromise;
  }
}
