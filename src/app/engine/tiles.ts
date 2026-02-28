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
  /** Transparent tile for empty cells and collected state */
  air: ImageBitmap;
  collected: ImageBitmap;
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
  /** Tile for drawing; set on grid cells, optional on placement items (then resolved via tileKey) */
  tile?: Tile | null;
} & DrawOptions;

export const NULL_ITEM: Item = {
  tileKey: 'air',
  tile: null,
  col: 0,
  row: 0,
};

/** Same shape as TileCollections but values are 2D arrays of cell keys (string | null). */
export type KeyTileCollections = {
  [K in keyof TileCollections]: (string | null)[][];
};

const keyBaseTileSet = {
  cloudTopLeft: 'cloudTopLeft',
  cloudTopMiddle: 'cloudTopMiddle',
  cloudTopRight: 'cloudTopRight',
  cloudBottomLeft: 'cloudBottomLeft',
  cloudBottomMiddle: 'cloudBottomMiddle',
  cloudBottomRight: 'cloudBottomRight',
  waves: 'waves',
  water: 'water',
  floor: 'floor',
  solid: 'solid',
  empty: 'empty',
  brick: 'brick',
  stump: 'stump',
  questionMark: 'questionMark',
  coin: 'coin',
  topLeft: 'topLeft',
  topMiddle: 'topMiddle',
  topRight: 'topRight',
  bushLeft: 'bushLeft',
  bushMiddle: 'bushMiddle',
  bushRight: 'bushRight',
  hillLeft: 'hillLeft',
  hillInnerLeft: 'hillInnerLeft',
  hillMiddle: 'hillMiddle',
  hillInnerRight: 'hillInnerRight',
  hillRight: 'hillRight',
  hillTop: 'hillTop',
  pipeTopLeft: 'pipeTopLeft',
  pipeLeft: 'pipeLeft',
  pipeTopRight: 'pipeTopRight',
  pipeRight: 'pipeRight',
  treeTop: 'treeTop',
  treeBottom: 'treeBottom',
  air: 'air',
  collected: 'collected',
} as unknown as BaseTileSet;

/** One-time key collections: name → 2D array of cell keys (null = air). Use as single source for tile/collection names. */
export function getKeyCollections(): KeyTileCollections {
  return createCollections(keyBaseTileSet) as unknown as KeyTileCollections;
}

export function isSolid(key: TileName): boolean {
  return (
    key !== 'air' &&
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

export const defaultDrawTileOptions: NormalizedDrawTileOptions = {
  col: 0,
  row: 0,
  repeatCol: 1,
  repeatRow: 1,
  pixelOffsetX: 0,
  pixelOffsetY: 0,
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

export function createCollections(tiles: BaseTileSet): TileCollections {
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

export type DrawTileContext = {
  context: CanvasRenderingContext2D;
  tiles: TileSet;
  scrollOffset: number;
};

export function drawTile(ctx: DrawTileContext, item: Item): void {
  const tile = item.tile;
  if (!tile) {
    return;
  }

  const { tileKey: _tileKey, tile: _tile, ...options } = item;
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
            ctx.context.drawImage(
              image,
              SIZE * col + ctx.scrollOffset + normOptions.pixelOffsetX,
              SIZE * row + normOptions.pixelOffsetY
            );
          }
        }
      }
    }
  }
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

/** Get a single cell from a tile (for grid building). */
export function getTileCell(
  tile: Tile,
  row: number,
  col: number
): ImageBitmap | null {
  const norm = normalizeTile(tile);
  const cell = norm[row]?.[col];
  return cell ?? null;
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
  console.log('palettes', palettes);
  const tiles = await loadTiles(correctedBitmap, palettes);
  return tiles;
}

