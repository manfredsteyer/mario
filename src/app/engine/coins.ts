import { COIN_PADDING } from './constants';
import type { Level } from './level';
import type { GameContext } from './game-context';
import { SIZE } from './palettes';
import { toBottom, toLeft, toRight, toTop } from './walls';

export function resetLevelCoins(level: Level): void {
  for (const item of level.items) {
    if (item.tileKey === 'collected') {
      item.tileKey = 'coin';
    }
  }
}

export function checkCoinsCollision(ctx: GameContext): void {
  const top = ctx.hero.position.y;
  const left = ctx.hero.position.x;
  const right = ctx.hero.position.x + SIZE;
  const bottom = ctx.hero.position.y + SIZE;

  const collidingCoins = ctx.level.items.filter((item) => {
    if (item.tileKey !== 'coin') {
      return false;
    }
    return (
      right > toLeft(item) + COIN_PADDING &&
      left < toRight(item) - COIN_PADDING &&
      bottom > toTop(item) + COIN_PADDING &&
      top < toBottom(item) - COIN_PADDING
    );
  });

  collidingCoins.forEach((item) => (item.tileKey = 'collected'));
}

