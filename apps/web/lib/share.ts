export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

/*
 * Share via the platform's native share sheet (Web Share API) when available,
 * falling back to writing the formatted text + URL to the clipboard. Returns
 * the outcome so the calling UI can decide what feedback to show:
 *
 *   "shared"    — handed off to the OS share sheet
 *   "copied"    — written to clipboard (no share sheet available)
 *   "cancelled" — user dismissed the share sheet without picking a target
 *   "failed"    — both share and clipboard rejected (or unavailable)
 *
 * navigator.share availability differs by browser/context: works on most
 * mobile browsers and Safari; not available in some desktop Chrome/Firefox,
 * which is why the clipboard fallback exists. navigator.share also requires
 * a user-activation context — fine for click handlers, would fail in effects.
 */
export async function shareOrCopy(data: ShareData): Promise<ShareResult> {
  if (typeof navigator === "undefined") return "failed";

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: data.title, text: data.text, url: data.url });
      return "shared";
    } catch (err) {
      const e = err as Error;
      if (e.name === "AbortError") return "cancelled";
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${data.text}\n\n${data.url}`);
      return "copied";
    } catch {
      // fall through
    }
  }

  return "failed";
}

export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
