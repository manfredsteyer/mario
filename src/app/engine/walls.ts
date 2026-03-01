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
  hero: ObjectState,
  level: Level
): Item {

  // TODO 2: Find first solid item below hero

  return NULL_ITEM;
}

export function calcMaxY(hero: ObjectState, level: Level): number {
  const bottom = getBottomSolidOptimized(hero, level);
  if (bottom.tileKey === 'air') {
    return Infinity;
  }
  return toTop(bottom) - SIZE;
}

export function getAboveSolidOptimized(
  hero: ObjectState,
  level: Level
): Item {
  const { levelGrid, colCount } = level;

  const y = hero.position.y;
  const x = hero.position.x;

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

export function calcMinY(hero: ObjectState, level: Level): number {
  const above = getAboveSolidOptimized(hero, level);
  if (above.tileKey === 'air') {
    return -Infinity;
  }
  return toBottom(above);
}

export function getRightSolidOptimized(
  hero: ObjectState,
  level: Level
): Item {
  const { levelGrid, rowCount, colCount } = level;

  const y = hero.position.y;
  const x = hero.position.x;
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

export function calcMinX(hero: ObjectState, level: Level): number {
  const left = getLeftSolidOptimized(hero, level);
  if (left.tileKey === 'air') {
    return -Infinity;
  }
  return toRight(left);
}

export function getLeftSolidOptimized(
  hero: ObjectState,
  level: Level
): Item {
  const { levelGrid, rowCount, colCount } = level;

  const y = hero.position.y;
  const x = hero.position.x;

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

export function calcMaxX(hero: ObjectState, level: Level): number {
  const right = getRightSolidOptimized(hero, level);
  if (right.tileKey === 'air') {
    return Infinity;
  }
  return toLeft(right) - SIZE;
}
