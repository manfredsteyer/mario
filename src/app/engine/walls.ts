import {
  toBottom,
  toLeft,
  toRight,
  toTop,
} from './coordinates';
import { SIZE } from './palettes';
import { isSolid, NULL_ITEM, type Item } from './tiles';
import type { Level, ObjectState } from './types';

export function getBottomSolid(
  hero: ObjectState,
  level: Level
): Item {
  // row <--> y       col <--> x       

  // TODO 2: Find first solid item below hero
  //   + call calcMaxY in hero.ts

  return NULL_ITEM;
}

export function calcMaxY(hero: ObjectState, level: Level): number {
  const bottom = getBottomSolid(hero, level);
  if (bottom === NULL_ITEM) {
    return Infinity;
  }
  return toTop(bottom) - SIZE;
}

export function getAboveSolid(
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
  const above = getAboveSolid(hero, level);
  if (above === NULL_ITEM) {
    return -Infinity;
  }
  return toBottom(above);
}

export function getRightSolid(
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
  const left = getLeftSolid(hero, level);
  if (left === NULL_ITEM) {
    return -Infinity;
  }
  return toRight(left);
}

export function getLeftSolid(
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
  const right = getRightSolid(hero, level);
  if (right === NULL_ITEM) {
    return Infinity;
  }
  return toLeft(right) - SIZE;
}
