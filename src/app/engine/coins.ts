import { COIN_PADDING } from './constants';
import type { GameState } from './game-state';
import type { Level } from './level';
import { SIZE } from './palettes';
import { toBottom, toLeft, toRight, toTop } from './walls';

export function resetLevelCoins(level: Level): void {
  for (const item of level.items) {
    if (item.tileKey === 'collected') {
      item.tileKey = 'coin';
    }
  }
}

export function checkCoinsCollision(level: Level, gameState: GameState): void {
  const top = gameState.hero.position.y;
  const left = gameState.hero.position.x;
  const right = gameState.hero.position.x + SIZE;
  const bottom = gameState.hero.position.y + SIZE;

  const collidingCoins = level.items.filter((item) => {
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
