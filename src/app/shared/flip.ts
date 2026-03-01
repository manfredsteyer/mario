export async function flip(bitmapPromise: Promise<ImageBitmap>): Promise<ImageBitmap> {
  const bitmap = await bitmapPromise;
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context not supported");
  }

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(bitmap, 0, 0);

  return await createImageBitmap(canvas);
}
