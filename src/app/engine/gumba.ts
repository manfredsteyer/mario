import { GUMBA_SPEED, HERO_PADDING } from './constants';
import type { GameState, GumbaState } from './game-state';
import type { Level } from './level';
import { SIZE } from './palettes';
import type { GumbaTileSet } from './gumba-tiles';
import { getGumbaTile } from './gumba-tiles';
import { calcMaxX, calcMinX } from './walls';

export function moveGumbas(
  gameState: GameState,
  level: Level,
  delta: number,
): void {
  for (const gumba of gameState.gumbas) {
    if (!gumba.alive) {
      continue;
    }
    moveGumba(gumba, level, delta);
  }
}

function moveGumba(gumba: GumbaState, level: Level, delta: number) {
  if (gumba.direction === 'left') {
    moveGumbaLeft(gumba, level, delta);
  } else {
    moveGumbaRight(gumba, level, delta);
  }
}

function moveGumbaRight(gumba: GumbaState, level: Level, delta: number) {
  
  const maxX = calcMaxX(gumba, level);
  const newX = gumba.position.x + GUMBA_SPEED * delta;
  
  if (newX >= maxX) {
    gumba.position.x = maxX;
    gumba.direction = 'left';
  } else {
    gumba.position.x = newX;
  }
}

function moveGumbaLeft(gumba: GumbaState, level: Level, delta: number) {
  
  const minX = calcMinX(gumba, level);
  const newX = gumba.position.x - GUMBA_SPEED * delta;

  if (newX <= minX) {
    gumba.position.x = minX;
    gumba.direction = 'right';
  } else {
    gumba.position.x = newX;
  }
}

export type HeroGumbaCollisionResult = 'none' | 'hero-dead' | 'gumba-stomped';

export function checkHeroGumbaCollision(
  gameState: GameState,
): HeroGumbaCollisionResult {
  const heroLeft = gameState.hero.position.x + HERO_PADDING;
  const heroRight = heroLeft + SIZE - HERO_PADDING;
  const heroTop = gameState.hero.position.y;
  const heroBottom = heroTop + SIZE;

  for (const gumba of gameState.gumbas) {
    if (!gumba.alive) {
      continue;
    }

    const gumbaLeft = gumba.position.x;
    const gumbaRight = gumbaLeft + SIZE;
    const gumbaTop = gumba.position.y;
    const gumbaBottom = gumbaTop + SIZE;

    const overlaps =
      heroRight > gumbaLeft &&
      heroLeft < gumbaRight &&
      heroBottom > gumbaTop &&
      heroTop < gumbaBottom;

    if (!overlaps) {
      continue;
    }

    const isStomp = gameState.isFalling;

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
  offset: number,
): void {
  for (const gumba of gameState.gumbas) {
    if (!gumba.alive) continue;
    const tile = getGumbaTile(timeStamp, gumbaTiles);
    const x = gumba.position.x + offset;
    const y = gumba.position.y;
    context.drawImage(tile, x, y);
  }
}
