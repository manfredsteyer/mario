import { normalizeTile, getTileSize, type Item, type TileName, type TileSet, Tile } from './tiles';
import type { Level } from './types';

export function buildLevelGrid(level: Level, tiles: TileSet): Item[][] {
  const { items } = level;

  const rows =
    Math.max(...items.map((item) => item.row + (item.repeatRow ?? 1))) + 1;
  const cols =
    Math.max(...items.map((item) => item.col + (item.repeatCol ?? 1))) + 1;

  const grid: Item[][] = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      tileKey: 'air' as TileName,
      tile: tiles.air,
      col,
      row,
    }))
  );

  for (const item of items) {
    const tile = tiles[item.tileKey as keyof TileSet];
    if (!tile) {
      continue;
    }
    addTileToGrid(tile, item, grid);
  }
  return grid;
}


function addTileToGrid(tile: Tile, item: Item, grid: Item[][]) {
  const normTile = normalizeTile(tile);
  const size = getTileSize(normTile);

  const repeatCol = item.repeatCol ?? 1;
  const repeatRow = item.repeatRow ?? 1;

  // This deep nesting is a deliberate decision 
  // Reasons are: strong logical connection between the loops
  // and readability
  for (let colRep = 0; colRep < repeatCol; colRep++) {
    for (let rowRep = 0; rowRep < repeatRow; rowRep++) {
      for (let colOffset = 0; colOffset < size.cols; colOffset++) {
        for (let rowOffset = 0; rowOffset < size.rows; rowOffset++) {
          const col = item.col + colOffset + colRep * size.cols;
          const row = item.row + rowOffset + rowRep * size.rows;
          const image = normTile[rowOffset]?.[colOffset];
          if (grid[row]?.[col]?.tileKey === 'air' && image) {
            grid[row][col] = {
              tileKey: item.tileKey,
              tile: image,
              col,
              row,
              repeatCol: 1,
              repeatRow: 1,
            };
          }
        }
      }
    }
  }
}

export function initLevel(level: Level, tiles: TileSet): void {
  level.levelGrid = buildLevelGrid(level, tiles);
  level.rowCount = level.levelGrid.length;
  level.colCount = level.levelGrid[0]?.length ?? 0;
}
