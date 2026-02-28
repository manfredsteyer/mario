import {
  toBottom,
  toLeft,
  toRight,
  toTop,
} from './coordinates';
import { HERO_PADDING } from './constants';
import { SIZE } from './palettes';
import { isSolid, NULL_ITEM, type Item } from './tiles';
import type { Level, ObjectState } from './types';

export function getBottomSolidOptimized(
  entity: ObjectState,
  level: Level
): Item {
  const { levelGrid, rowCount, colCount } = level;

  const y = entity.position.y;
  const x = entity.position.x;
  const firstRow = Math.floor(y / SIZE) + 1;
  const minCol = Math.max(0, Math.floor(x / SIZE));
  const maxColIndex = Math.min(colCount - 1, Math.ceil(x / SIZE));

  const boxLeft = x + HERO_PADDING;
  const boxRight = x + SIZE - HERO_PADDING;

  for (let row = firstRow; row < rowCount; row++) {
    for (let col = minCol; col <= maxColIndex; col++) {
      const cell = levelGrid[row]?.[col];
      if (
        isSolid(cell.tileKey) &&
        toLeft(cell) < boxRight &&
        toRight(cell) > boxLeft
      ) {
        return cell;
      }
    }
  }
  return NULL_ITEM;
}

export function getAboveSolidOptimized(
  entity: ObjectState,
  level: Level
): Item {
  const { levelGrid, colCount } = level;

  const y = entity.position.y;
  const x = entity.position.x;
  const lastRowAbove = Math.floor(y / SIZE) - 1;
  const minCol = Math.max(0, Math.floor(x / SIZE));
  const maxColIndex = Math.min(colCount - 1, Math.ceil(x / SIZE));

  const boxLeft = x + HERO_PADDING;
  const boxRight = x + SIZE - HERO_PADDING;

  for (let row = lastRowAbove; row >= 0; row--) {
    for (let col = minCol; col <= maxColIndex; col++) {
      const cell = levelGrid[row]?.[col];
      if (
        isSolid(cell.tileKey) &&
        toBottom(cell) <= y &&
        toLeft(cell) < boxRight &&
        toRight(cell) > boxLeft
      ) {
        return cell;
      }
    }
  }
  return NULL_ITEM;
}

export function getRightSolidOptimized(
  entity: ObjectState,
  level: Level
): Item {
  const { levelGrid, rowCount, colCount } = level;

  const y = entity.position.y;
  const x = entity.position.x;
  const firstCol = Math.min(colCount - 1, Math.ceil(x / SIZE));
  const minRow = Math.max(0, Math.floor(y / SIZE));
  const maxRowIndex = Math.min(
    rowCount - 1,
    Math.floor((y + SIZE - 1) / SIZE)
  );

  const boxTop = y;
  const boxBottom = y + SIZE;

  for (let col = firstCol; col < colCount; col++) {
    for (let row = minRow; row <= maxRowIndex; row++) {
      const cell = levelGrid[row]?.[col];
      if (
        isSolid(cell.tileKey) &&
        toLeft(cell) >= x &&
        toTop(cell) < boxBottom &&
        toBottom(cell) > boxTop
      ) {
        return cell;
      }
    }
  }
  return NULL_ITEM;
}

export function getLeftSolidOptimized(
  entity: ObjectState,
  level: Level
): Item {
  const { levelGrid, rowCount } = level;

  const y = entity.position.y;
  const x = entity.position.x;
  const maxCol = Math.max(0, Math.floor((x + HERO_PADDING) / SIZE));
  const minRow = Math.max(0, Math.floor(y / SIZE));
  const maxRowIndex = Math.min(
    rowCount - 1,
    Math.floor((y + SIZE - 1) / SIZE)
  );

  const boxTop = y;
  const boxBottom = y + SIZE;

  /** Bei mehrspaltigen Blöcken (z. B. pipeTop) die Zelle mit dem größten toRight nehmen. */
  let best: Item = NULL_ITEM;
  let bestRight = -1;

  for (let col = maxCol; col >= 0; col--) {
    for (let row = minRow; row <= maxRowIndex; row++) {
      const cell = levelGrid[row]?.[col];
      if (
        isSolid(cell.tileKey) &&
        toRight(cell) >= x + HERO_PADDING &&
        toTop(cell) < boxBottom &&
        toBottom(cell) > boxTop
      ) {
        const cellRight = toRight(cell);
        if (cellRight > bestRight) {
          bestRight = cellRight;
          best = cell;
        }
      }
    }
  }
  return best;
}

export function calcMaxY(entity: ObjectState, level: Level): number {
  const bottom = getBottomSolidOptimized(entity, level);
  if (bottom.tileKey === 'air') return Infinity;
  return toTop(bottom) - SIZE;
}

export function calcMinY(entity: ObjectState, level: Level): number {
  const above = getAboveSolidOptimized(entity, level);
  if (above.tileKey === 'air') return -Infinity;
  return toBottom(above);
}

export function calcMaxX(entity: ObjectState, level: Level): number {
  const right = getRightSolidOptimized(entity, level);
  if (right.tileKey === 'air') return Infinity;
  return toLeft(right) - SIZE;
}

export function calcMinX(entity: ObjectState, level: Level): number {
  const left = getLeftSolidOptimized(entity, level);
  if (left.tileKey === 'air') return -Infinity;
  return toRight(left);
}
