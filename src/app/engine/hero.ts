import { flip } from '../shared/flip';
import { addTransparency } from './color-utils';
import { Palette, SIZE } from './palettes';

export type HeroTileSet = {
  stand: ImageBitmap;
  standLeft: ImageBitmap;
  run0: ImageBitmap;
  run0Left: ImageBitmap;
  run1: ImageBitmap;
  run1Left: ImageBitmap;
  run2: ImageBitmap;
  run2Left: ImageBitmap;
};

async function getHeroTile(
  bitmap: ImageBitmap,
  p: Palette,
  row: number,
  col: number
) {
  const image = await createImageBitmap(
    bitmap,
    p.x + row * (SIZE + 2),
    p.y + col * (SIZE + 2),
    SIZE,
    SIZE
  );

  return image;
}

async function loadHeroTiles(bitmap: ImageBitmap) {
  const idlePalette: Palette = {
    x: 0,
    y: 8,
  };

  const runPalette: Palette = {
    x: 20,
    y: 8,
  };

  const tilePromises = {
    stand: getHeroTile(bitmap, idlePalette, 0, 0),

    run1: getHeroTile(bitmap, runPalette, 0, 0),
    run2: getHeroTile(bitmap, runPalette, 1, 0),
    run0: getHeroTile(bitmap, runPalette, 2, 0),

    standLeft: flip(getHeroTile(bitmap, idlePalette, 0, 0)),
    run1Left: flip(getHeroTile(bitmap, runPalette, 0, 0)),
    run2Left: flip(getHeroTile(bitmap, runPalette, 1, 0)),
    run0Left: flip(getHeroTile(bitmap, runPalette, 2, 0)),
  };

  const tiles = await Promise.all(Object.values(tilePromises)).then(
    (resolvedTiles) => {
      const tileNames = Object.keys(tilePromises);
      return Object.fromEntries(
        tileNames.map((name, index) => [name, resolvedTiles[index]])
      ) as HeroTileSet;
    }
  );
  return tiles;
}

export async function extractHeroTiles(tilesMap: Blob) {
  const bitmap = await createImageBitmap(tilesMap);
  const correctedBitmap = await addTransparency(bitmap, '#9290ff');
  const tiles = await loadHeroTiles(correctedBitmap);
  return tiles;
}
