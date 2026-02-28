import { SIZE } from './palettes';
import type { Item, TileName } from './tiles';

export function getBlockWidth(tileKey: TileName): number {
  if (tileKey === 'pipeTop') {
    return 2;
  }
  return 1;
}

export function getBlockHeight(tileKey: TileName): number {
  if (tileKey === 'pipeTop') {
    return 3;
  }
  return 1;
}

export function toLeft(item: Item): number {
  return item.col * SIZE;
}

export function toRight(item: Item): number {
  const repeat = item.repeatCol ?? 1;
  const blockWidth = getBlockWidth(item.tileKey);
  return (item.col + repeat * blockWidth) * SIZE;
}

export function toTop(item: Item): number {
  return item.row * SIZE;
}

export function toBottom(item: Item): number {
  const repeat = item.repeatRow ?? 1;
  const blockHeight = getBlockHeight(item.tileKey);
  return (item.row + repeat * blockHeight) * SIZE;
}
