import { toBottom, toLeft, toRight, toTop } from './coordinates';
import { HERO_PADDING } from './constants';
import { SIZE } from './palettes';
import type { Item, TileName } from './tiles';
import type { Level } from './types';

export type Position = {
  x: number;
  y: number;
};

export type ObjectState = {
  position: Position;
};

function isSolid(key: TileName): boolean {
  return (
    key === 'floor' ||
    key === 'brick' ||
    key === 'solid' ||
    key.startsWith('pipe') ||
    key === 'questionMark' ||
    key === 'empty'
  );
}

export function getBottomSolids(entity: ObjectState, level: Level): Item[] {
  const y = entity.position.y;
  const leftX = entity.position.x + SIZE - HERO_PADDING;
  const rightX = entity.position.x + HERO_PADDING;

  return level.items.filter((item) => {
    return (
      toTop(item) > y &&
      toLeft(item) < leftX &&
      toRight(item) > rightX &&
      isSolid(item.tileKey)
    );
  });
}

export function getAboveSolids(entity: ObjectState, level: Level): Item[] {
  const y = entity.position.y;
  const leftX = entity.position.x + SIZE - HERO_PADDING;
  const rightX = entity.position.x + HERO_PADDING;

  return level.items.filter((item) => {
    return (
      toBottom(item) <= y &&
      toLeft(item) < leftX &&
      toRight(item) > rightX &&
      isSolid(item.tileKey)
    );
  });
}

export function getRightSolids(entity: ObjectState, level: Level): Item[] {
  const y = entity.position.y;
  const x = entity.position.x;

  return level.items.filter((item) => {
    return (
      toLeft(item) >= x &&
      toTop(item) <= y &&
      toBottom(item) >= y &&
      isSolid(item.tileKey)
    );
  });
}

export function getLeftSolids(entity: ObjectState, level: Level): Item[] {
  const y = entity.position.y;
  const x = entity.position.x;

  return level.items.filter((item) => {
    return (
      toRight(item) <= x + HERO_PADDING &&
      toTop(item) <= y &&
      toBottom(item) >= y &&
      isSolid(item.tileKey)
    );
  });
}

export function calcMaxY(entity: ObjectState, level: Level): number {
  const bottom = getBottomSolids(entity, level);

  let maxY = Infinity;
  if (bottom.length > 0) {
    const minRow = min(bottom, (item) => item.row);
    maxY = minRow * SIZE - SIZE;
  }
  return maxY;
}

export function calcMinY(entity: ObjectState, level: Level): number {
  const above = getAboveSolids(entity, level);

  let minY = -Infinity;
  if (above.length > 0) {
    const minRow = max(above, (b) => b.row);
    minY = minRow * SIZE + SIZE;
  }
  return minY;
}

export function calcMaxX(entity: ObjectState, level: Level): number {
  const right = getRightSolids(entity, level);

  let maxX = Infinity;
  if (right.length > 0) {
    const minCol = min(right, (b) => toLeft(b));
    maxX = minCol - SIZE;
  }
  return maxX;
}

export function calcMinX(entity: ObjectState, level: Level): number {
  const left = getLeftSolids(entity, level);
  let minX = -Infinity;
  if (left.length > 0) {
    minX = max(left, (b) => toRight(b));
  }
  return minX;
}

function min(items: Item[], pick: (b: Item) => number): number {
  return Math.min(...items.map(pick));
}

function max(items: Item[], pick: (b: Item) => number): number {
  return Math.max(...items.map(pick));
}