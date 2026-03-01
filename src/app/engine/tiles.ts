import { addTransparency } from './color-utils';
import type { LevelDrawContext } from './game-context';
import { getPalettes, Palette, Palettes, SIZE, Style } from './palettes';

export type Tile =
  | ImageBitmap
  | (ImageBitmap | null)[]
  | (ImageBitmap | null)[][];
type NormalizedTile = ImageBitmap[][];

type BaseTileSet = {
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
  empty: ImageBitmap;
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
  air: ImageBitmap;
  collected: ImageBitmap;
};

type TileCollections = {
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

export type DrawOptions = {
  col: number;
  row: number;
  repeatCol?: number;
  repeatRow?: number;
  pixelOffsetX?: number;
  pixelOffsetY?: number;
};

export type TileName = keyof TileSet;

export type Item = {
  tileKey: TileName;
  tile?: ImageBitmap;
} & DrawOptions;

export const NULL_ITEM: Item = {
  tileKey: 'air',
  tile: undefined,
  col: 0,
  row: 0,
};

export function isSolid(key: TileName): boolean {
  return (
    (key === 'floor' ||
      key === 'brick' ||
      key === 'solid' ||
      key.startsWith('pipe') ||
      key === 'questionMark' ||
      key === 'empty')
  );
}

type NormalizedDrawTileOptions = {
  col: number;
  row: number;
  repeatCol: number;
  repeatRow: number;
  pixelOffsetX: number;
  pixelOffsetY: number;
};

type TileSize = {
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

function createTransparentTile(): Promise<ImageBitmap> {
  const imageData = new ImageData(SIZE, SIZE);
  return createImageBitmap(imageData);
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
    empty: getTile(bitmap, palettes.p1, 3, 0),


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

    // Transparent (air / collected) – eine Tile für beide
    air: createTransparentTile(),
  };

  const tiles = await Promise.all(Object.values(tilePromises)).then(
    (resolvedTiles) => {
      const tileNames = Object.keys(tilePromises);
      const base = Object.fromEntries(
        tileNames.map((name, index) => [name, resolvedTiles[index]]),
      ) as BaseTileSet;
      base.collected = base.air;
      return base;
    },
  );
  return tiles;
}


export function drawTile(ctx: LevelDrawContext, item: Item): void {
  if (!item.tile) {
    return;
  }
  ctx.context.drawImage(
    item.tile,
    SIZE * item.col - ctx.scrollOffset,
    SIZE * item.row
  );
}

export function normalizeTile(tile: Tile): ImageBitmap[][] {
  if (!Array.isArray(tile)) {
    return [[tile]];
  }
  if (!Array.isArray(tile[0])) {
    return [tile] as ImageBitmap[][];
  }
  return tile as ImageBitmap[][];
}

export function getTileSize(tile: NormalizedTile): TileSize {
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

export async function extractTiles(tilesMap: Blob, style: Style) {
  const bitmap = await createImageBitmap(tilesMap);
  const correctedBitmap = await addTransparency(bitmap, '#9494ff');
  const palettes = getPalettes(style);
  const tiles = await loadTiles(correctedBitmap, palettes);
  return tiles;
}

