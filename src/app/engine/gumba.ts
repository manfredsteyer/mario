import { GUMBA_SPEED } from './constants';
import type { GameState, GumbaState } from './game-state';
import type { Level } from './level';
import { SIZE } from './palettes';
import type { GumbaTileSet } from './gumba-tiles';
import { getGumbaTile } from './gumba-tiles';
import { calcMaxX, calcMinX } from './walls';

export function moveGumbas(
  gameState: GameState,
  level: Level,
  delta: number
): void {
  for (const gumba of gameState.gumbas) {
    if (!gumba.alive) continue;

    const fakeState: GameState = {
      ...gameState,
      hero: { ...gameState.hero, position: { ...gumba.position } },
    };
    const minX = calcMinX(fakeState, level);
    const maxX = calcMaxX(fakeState, level);

    if (gumba.direction === 'left') {
      const newX = gumba.position.x - GUMBA_SPEED * delta;
      if (newX <= minX) {
        gumba.position.x = minX;
        gumba.direction = 'right';
      } else {
        gumba.position.x = newX;
      }
    } else {
      const newX = gumba.position.x + GUMBA_SPEED * delta;
      if (newX >= maxX) {
        gumba.position.x = maxX;
        gumba.direction = 'left';
      } else {
        gumba.position.x = newX;
      }
    }
  }
}

export type HeroGumbaCollisionResult = 'none' | 'hero-dead' | 'gumba-stomped';

export function checkHeroGumbaCollision(
  gameState: GameState
): HeroGumbaCollisionResult {
  const heroLeft = gameState.hero.position.x;
  const heroRight = heroLeft + SIZE;
  const heroTop = gameState.hero.position.y;
  const heroBottom = heroTop + SIZE;

  for (const gumba of gameState.gumbas) {
    if (!gumba.alive) continue;

    const gumbaLeft = gumba.position.x;
    const gumbaRight = gumbaLeft + SIZE;
    const gumbaTop = gumba.position.y;
    const gumbaBottom = gumbaTop + SIZE;

    const overlaps =
      heroRight > gumbaLeft &&
      heroLeft < gumbaRight &&
      heroBottom > gumbaTop &&
      heroTop < gumbaBottom;

    if (!overlaps) continue;

    // Stomp nur, wenn der Hero von oben auf den Gumba fällt: Füße in der oberen Kante des Gumbas
    const stompMargin = SIZE / 3;
    const isStomp =
      heroBottom <= gumbaTop + stompMargin &&
      heroTop < gumbaBottom - stompMargin;

    if (isStomp) {
      gumba.alive = false;
      return 'gumba-stomped';
    }

    return 'hero-dead';
  }
  return 'none';
}

export function drawGumbas(
  context: CanvasRenderingContext2D,
  gameState: GameState,
  gumbaTiles: GumbaTileSet,
  timeStamp: number,
  offset: number
): void {
  for (const gumba of gameState.gumbas) {
    if (!gumba.alive) continue;
    const tile = getGumbaTile(timeStamp, gumbaTiles);
    const x = gumba.position.x + offset;
    const y = gumba.position.y;
    context.drawImage(tile, x, y);
  }
}
