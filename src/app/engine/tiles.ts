import { flip } from '../shared/flip';
import { addTransparency } from './color-utils';
import { getPalettes, Palette, Palettes, SIZE, Style } from './palettes';

export type Tile =
  | ImageBitmap
  | (ImageBitmap | null)[]
  | (ImageBitmap | null)[][];
export type NormalizedTile = ImageBitmap[][];

export type BaseTileSet = {
  cloudTopLeft: ImageBitmap;
  cloudTopMiddle: ImageBitmap;
  cloudTopRight: ImageBitmap;
  cloudBottomLeft: ImageBitmap;
  cloudBottomMiddle: ImageBitmap;
  cloudBottomRight: ImageBitmap;
  waves: ImageBitmap;
  water: ImageBitmap;
  floor: ImageBitmap;
  solid: ImageBitmap;
  brick: ImageBitmap;
  stump: ImageBitmap;
  questionMark: ImageBitmap;
  coin: ImageBitmap;
  topLeft: ImageBitmap;
  topMiddle: ImageBitmap;
  topRight: ImageBitmap;
  bushLeft: ImageBitmap;
  bushMiddle: ImageBitmap;
  bushRight: ImageBitmap;
  hillLeft: ImageBitmap;
  hillInnerLeft: ImageBitmap;
  hillMiddle: ImageBitmap;
  hillInnerRight: ImageBitmap;
  hillRight: ImageBitmap;
  hillTop: ImageBitmap;
  pipeTopLeft: ImageBitmap;
  pipeLeft: ImageBitmap;
  pipeTopRight: ImageBitmap;
  pipeRight: ImageBitmap;
  treeTop: ImageBitmap;
  treeBottom: ImageBitmap;
};

export type TileCollections = {
  treeCrown: Tile;
  smallHill: Tile;
  hill: Tile;
  bush: Tile;
  top: Tile;
  cloud: Tile;
  pipeSegment: Tile;
  pipeTop: Tile;
};

export type TileSet = BaseTileSet & TileCollections;

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

export type DrawOptions = {
  col: number;
  row: number;
  repeatCol?: number;
  repeatRow?: number;
};

type NormalizedDrawTileOptions = {
  col: number;
  row: number;
  repeatCol: number;
  repeatRow: number;
};

export const defaultDrawTileOptions: NormalizedDrawTileOptions = {
  col: 0,
  row: 0,
  repeatCol: 1,
  repeatRow: 1,
};

export type TileSize = {
  cols: number;
  rows: number;
};

export async function loadTiles(
  bitmap: ImageBitmap,
  palettes: Palettes,
): Promise<TileSet> {
  const tiles = await createTiles(bitmap, palettes);
  const collections = createCollections(tiles);
  return { ...tiles, ...collections };
}

function createCollections(tiles: BaseTileSet): TileCollections {
  return {
    treeCrown: [[tiles.treeTop], [tiles.treeBottom]],
    smallHill: [
      [null, null, tiles.hillTop, null, null],
      [null, tiles.hillLeft, tiles.hillInnerLeft, tiles.hillRight, null],
    ],
    hill: [
      [null, null, tiles.hillTop, null, null],
      [null, tiles.hillLeft, tiles.hillMiddle, tiles.hillRight, null],
      [
        tiles.hillLeft,
        tiles.hillInnerLeft,
        tiles.hillMiddle,
        tiles.hillInnerRight,
        tiles.hillRight,
      ],
    ],
    bush: [tiles.bushLeft, tiles.bushMiddle, tiles.bushRight],
    top: [tiles.topLeft, tiles.topMiddle, tiles.topRight],
    cloud: [
      [tiles.cloudTopLeft, tiles.cloudTopMiddle, tiles.cloudTopRight],
      [tiles.cloudBottomLeft, tiles.cloudBottomMiddle, tiles.cloudBottomRight],
    ],
    pipeSegment: [[tiles.pipeLeft, tiles.pipeRight]],
    pipeTop: [
      [tiles.pipeTopLeft, tiles.pipeTopRight],
      [tiles.pipeLeft, tiles.pipeRight],
    ],
  };
}

async function createTiles(bitmap: ImageBitmap, palettes: Palettes) {
  const tilePromises = {
    // Cloud tiles
    cloudTopLeft: getTile(bitmap, palettes.p2, 0, 0),
    cloudTopMiddle: getTile(bitmap, palettes.p2, 1, 0),
    cloudTopRight: getTile(bitmap, palettes.p2, 2, 0),
    cloudBottomLeft: getTile(bitmap, palettes.p2, 0, 1),
    cloudBottomMiddle: getTile(bitmap, palettes.p2, 1, 1),
    cloudBottomRight: getTile(bitmap, palettes.p2, 2, 1),

    // Nature tiles
    waves: getTile(bitmap, palettes.p2, 3, 0),
    water: getTile(bitmap, palettes.p2, 3, 1),

    // Ground tiles
    floor: getTile(bitmap, palettes.p1, 0, 0),
    brick: getTile(bitmap, palettes.p1, 2, 0),
    solid: getTile(bitmap, palettes.p1, 0, 1),
    stump: getTile(bitmap, palettes.p1, 1, 3),

    // Interactive tiles
    questionMark: getTile(bitmap, palettes.p3, 0, 0),
    coin: getTile(bitmap, palettes.p3, 0, 1),

    // Scenery top tiles
    topLeft: getTile(bitmap, palettes.p0, 0, 0),
    topMiddle: getTile(bitmap, palettes.p0, 1, 0),
    topRight: getTile(bitmap, palettes.p0, 2, 0),

    // Bush tiles
    bushLeft: getTile(bitmap, palettes.p0, 0, 1),
    bushMiddle: getTile(bitmap, palettes.p0, 1, 1),
    bushRight: getTile(bitmap, palettes.p0, 2, 1),

    // Hill tiles
    hillLeft: getTile(bitmap, palettes.p0, 0, 3),
    hillInnerLeft: getTile(bitmap, palettes.p0, 1, 3),
    hillMiddle: getTile(bitmap, palettes.p0, 2, 3),
    hillInnerRight: getTile(bitmap, palettes.p0, 3, 3),
    hillRight: getTile(bitmap, palettes.p0, 4, 3),
    hillTop: getTile(bitmap, palettes.p0, 2, 2),

    // Pipe tiles
    pipeTopLeft: getTile(bitmap, palettes.p0, 7, 0),
    pipeLeft: getTile(bitmap, palettes.p0, 7, 1),
    pipeTopRight: getTile(bitmap, palettes.p0, 8, 0),
    pipeRight: getTile(bitmap, palettes.p0, 8, 1),

    // Tree tiles
    treeTop: getTile(bitmap, palettes.p0, 6, 0),
    treeBottom: getTile(bitmap, palettes.p0, 6, 1),
  };

  const tiles = await Promise.all(Object.values(tilePromises)).then(
    (resolvedTiles) => {
      const tileNames = Object.keys(tilePromises);
      return Object.fromEntries(
        tileNames.map((name, index) => [name, resolvedTiles[index]]),
      ) as BaseTileSet;
    },
  );
  return tiles;
}

export function drawTile(
  context: CanvasRenderingContext2D,
  tile: Tile,
  offset: number,
  options: DrawOptions,
): void {
  const normOptions: NormalizedDrawTileOptions = {
    ...defaultDrawTileOptions,
    ...options,
  };

  const normTile = normalizeTile(tile);
  const size = getTileSize(normTile);

  for (let colRep = 0; colRep < normOptions.repeatCol; colRep++) {
    for (let rowRep = 0; rowRep < normOptions.repeatRow; rowRep++) {
      for (let colOffset = 0; colOffset < size.cols; colOffset++) {
        for (let rowOffset = 0; rowOffset < size.rows; rowOffset++) {
          const col = options.col + colOffset + colRep * size.cols;
          const row = options.row + rowOffset + rowRep * size.rows;
          const image = normTile[rowOffset][colOffset];
          if (image) {
            context.drawImage(image, SIZE * col + offset, SIZE * row);
          }
        }
      }
    }
  }
}

function normalizeTile(tile: Tile): ImageBitmap[][] {
  if (!Array.isArray(tile)) {
    return [[tile]];
  }
  if (!Array.isArray(tile[0])) {
    return [tile] as ImageBitmap[][];
  }
  return tile as ImageBitmap[][];
}

function getTileSize(tile: NormalizedTile): TileSize {
  return {
    rows: tile.length,
    cols: tile[0].length,
  };
}

async function getTile(
  bitmap: ImageBitmap,
  p: Palette,
  row: number,
  col: number,
) {
  const image = await createImageBitmap(
    bitmap,
    p.x + row * (SIZE + 1),
    p.y + col * (SIZE + 1),
    SIZE,
    SIZE,
  );

  return image;
}


async function getHeroTile(
  bitmap: ImageBitmap,
  p: Palette,
  row: number,
  col: number,
) {
  const image = await createImageBitmap(
    bitmap,
    p.x + row * (SIZE + 2),
    p.y + col * (SIZE + 2),
    SIZE,
    SIZE,
  );

  return image;
}

export async function extractTiles(tilesMap: Blob, style: Style) {
  const bitmap = await createImageBitmap(tilesMap);
  const correctedBitmap = await addTransparency(bitmap, '#9494ff');
  const palettes = getPalettes(style);
  console.log('palettes', palettes);
  const tiles = await loadTiles(correctedBitmap, palettes);
  return tiles;
}


async function loadHeroTiles(bitmap: ImageBitmap) {

  const idlePalette: Palette = {
     x: 0, y: 8
  };

  const runPalette: Palette = {
     x: 20, y: 8
  };


  const tilePromises = {
    stand: getHeroTile(bitmap, idlePalette, 0, 0),

    run1: getHeroTile(bitmap, runPalette, 0, 0),
    run2: getHeroTile(bitmap, runPalette, 1, 0),
    run0: getHeroTile(bitmap, runPalette, 2, 0),

    standLeft: flip(getTile(bitmap, idlePalette, 0, 0)),
    run1Left: flip(getHeroTile(bitmap, runPalette, 0, 0)),
    run2Left: flip(getHeroTile(bitmap, runPalette, 1, 0)),
    run0Left: flip(getHeroTile(bitmap, runPalette, 2, 0)),
  };

  const tiles = await Promise.all(Object.values(tilePromises)).then(
    (resolvedTiles) => {
      const tileNames = Object.keys(tilePromises);
      return Object.fromEntries(
        tileNames.map((name, index) => [name, resolvedTiles[index]]),
      ) as HeroTileSet;
    },
  );
  return tiles;
}

export async function extractHeroTiles(tilesMap: Blob) {
  const bitmap = await createImageBitmap(tilesMap);
  const correctedBitmap = await addTransparency(bitmap, '#9290ff');
  const tiles = await loadHeroTiles(correctedBitmap);
  return tiles;
}