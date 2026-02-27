import { addTransparency } from './color-utils';
import { SIZE } from './palettes';

export type GumbaTileSet = [ImageBitmap, ImageBitmap];

async function loadGumbaTile(
  bitmap: ImageBitmap,
  col: number,
  row: number
): Promise<ImageBitmap> {
  return createImageBitmap(bitmap, col * SIZE + col*2, row * SIZE, SIZE, SIZE);
}

export async function extractGumbaTiles(enemiesMap: Blob): Promise<GumbaTileSet> {
  const bitmap = await createImageBitmap(enemiesMap);
  const correctedBitmap = await addTransparency(bitmap, '#9290ff');
  const tile0 = await loadGumbaTile(correctedBitmap, 0, 1);
  const tile1 = await loadGumbaTile(correctedBitmap, 1, 1);
  return [tile0, tile1];
}

export function getGumbaTile(
  timeStamp: number,
  gumbaTiles: GumbaTileSet
): ImageBitmap {
  const index = Math.floor(timeStamp / 120) % 2;
  return gumbaTiles[index];
}
