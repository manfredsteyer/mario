import {
  toBottom,
  toLeft,
  toRight,
  toTop,
} from './coordinates';
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

  const startRow = Math.floor(y / SIZE) + 1;
  const leftCol = Math.max(0, Math.floor(x / SIZE));
  const rightCol = Math.min(colCount - 1, Math.ceil(x  / SIZE));

  for (let row = startRow; row < rowCount; row++) {
    for (let col = leftCol; col <= rightCol; col++) {
      const cell = levelGrid[row][col];
      if (isSolid(cell.tileKey)) {
        return cell;
      }
    }
  }
  return NULL_ITEM;
}

export function calcMaxY(entity: ObjectState, level: Level): number {
  const bottom = getBottomSolidOptimized(entity, level);
  if (bottom.tileKey === 'air') {
    return Infinity;
  }
  return toTop(bottom) - SIZE;
}

export function getAboveSolidOptimized(
  entity: ObjectState,
  level: Level
): Item {
  const { levelGrid, colCount } = level;

  const y = entity.position.y;
  const x = entity.position.x;

  const startRow = Math.floor(y / SIZE) - 1;
  const leftCol = Math.max(0, Math.floor(x / SIZE));
  const rightCol = Math.min(
    colCount - 1,
    Math.ceil(x  / SIZE)
  );

  for (let row = startRow; row >= 0; row--) {
    for (let col = leftCol; col <= rightCol; col++) {
      const cell = levelGrid[row][col];
      if (isSolid(cell.tileKey)) {
        return cell;
      }
    }
  }
  return NULL_ITEM;
}

export function calcMinY(entity: ObjectState, level: Level): number {
  const above = getAboveSolidOptimized(entity, level);
  if (above.tileKey === 'air') {
    return -Infinity;
  }
  return toBottom(above);
}

export function getRightSolidOptimized(
  entity: ObjectState,
  level: Level
): Item {
  const { levelGrid, rowCount, colCount } = level;

  const y = entity.position.y;
  const x = entity.position.x;
  const startCol = Math.min(colCount - 1, Math.ceil(x / SIZE));
  const upperRow = Math.max(0, Math.floor(y / SIZE));
  const lowerRow = Math.min(rowCount - 1, Math.ceil(y / SIZE));

  for (let col = startCol; col < colCount; col++) {
    for (let row = upperRow; row <= lowerRow; row++) {
      const cell = levelGrid[row][col];
      if (isSolid(cell.tileKey)) {
        return cell;
      }
    }
  }
  return NULL_ITEM;
}

export function calcMinX(entity: ObjectState, level: Level): number {
  const left = getLeftSolidOptimized(entity, level);
  if (left.tileKey === 'air') {
    return -Infinity;
  }
  return toRight(left);
}

export function getLeftSolidOptimized(
  entity: ObjectState,
  level: Level
): Item {
  const { levelGrid, rowCount, colCount } = level;

  const y = entity.position.y;
  const x = entity.position.x;

  const startCol = Math.min(colCount - 1, Math.max(0, Math.floor(x / SIZE)));
  const upperRow = Math.max(0, Math.floor(y / SIZE));
  const lowerRow = Math.min(
    rowCount - 1,
    Math.ceil(y / SIZE)
  );

  for (let col = startCol; col >= 0; col--) {
    for (let row = upperRow; row <= lowerRow; row++) {
      const cell = levelGrid[row][col];
      if (isSolid(cell.tileKey)) {
        return cell;
      }
    }
  }
  return NULL_ITEM;
}

export function calcMaxX(entity: ObjectState, level: Level): number {
  const right = getRightSolidOptimized(entity, level);
  if (right.tileKey === 'air') {
    return Infinity;
  }
  return toLeft(right) - SIZE;
}
