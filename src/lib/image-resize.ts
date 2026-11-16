"use client";

/**
 * Ridimensiona e comprime una foto nel browser prima dell'upload
 * (lato lungo max 1600px, formato WebP). Le foto dal telefono passano
 * da ~5 MB a ~200-400 KB: upload più veloce e sito più leggero.
 */
export async function resizeImage(file: File, maxSize = 1600, quality = 0.85): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.type === "image/webp") return blob;
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (jpeg) return jpeg;
    throw new Error("encode");
  } catch {
    // Formato non leggibile dal browser: carica l'originale
    return file;
  }
}
