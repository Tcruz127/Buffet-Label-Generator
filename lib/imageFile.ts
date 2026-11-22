// Browser-only helpers for logo uploads (menus, signs).

export const LOGO_MAX_PIXELS = 1200;
export const LOGO_MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/** Downscales any browser-readable image to a PNG data URL (keeps transparency). */
export async function imageFileToPngDataUrl(file: File, maxPixels = LOGO_MAX_PIXELS): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("unreadable"));
      image.src = url;
    });
    const width = img.naturalWidth || maxPixels;
    const height = img.naturalHeight || maxPixels;
    const scale = Math.min(1, maxPixels / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Validates a chosen file before upload; returns an error message or null. */
export function logoFileError(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Please choose an image file (PNG, JPG or SVG).";
  if (file.size > LOGO_MAX_UPLOAD_BYTES) return "That image is over 15 MB. Please use a smaller file.";
  return null;
}
