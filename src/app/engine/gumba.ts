import { GUMBA_SPEED, HERO_PADDING } from './constants';
import type { GameState, GumbaState } from './game-state';
import type { Level } from './level';
import { SIZE } from './palettes';
import type { GumbaTileSet } from './gumba-tiles';
import { getGumbaTile } from './gumba-tiles';
import { calcMaxX, calcMinX } from './walls';

export type MoveGumbasContext = {
  gameState: GameState;
  level: Level;
  delta: number;
};

export function moveGumbas(ctx: MoveGumbasContext): void {
  for (const gumba of ctx.gameState.gumbas) {
    if (!gumba.alive) {
      continue;
    }
    moveGumba(gumba, ctx.level, ctx.delta);
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

export type CheckHeroGumbaCollisionContext = {
  gameState: GameState;
  beaten: boolean;
};

export function checkHeroGumbaCollision(
  ctx: CheckHeroGumbaCollisionContext,
): void {
  const heroLeft = ctx.gameState.hero.position.x + HERO_PADDING;
  const heroRight = heroLeft + SIZE - HERO_PADDING;
  const heroTop = ctx.gameState.hero.position.y;
  const heroBottom = heroTop + SIZE;

  for (const gumba of ctx.gameState.gumbas) {
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

    const isStomp = ctx.gameState.isFalling;

    if (isStomp) {
      gumba.alive = false;
      return;
    }

    ctx.beaten = true;
    return;
  }
}

export type DrawGumbasContext = {
  context: CanvasRenderingContext2D;
  gameState: GameState;
  gumbaTiles?: GumbaTileSet;
  timeStamp: number;
  scrollOffset: number;
};

export function drawGumbas(ctx: DrawGumbasContext): void {
  if (!ctx.gumbaTiles || !ctx.gameState.gumbas) {
    return;
  }

  for (const gumba of ctx.gameState.gumbas) {
    if (!gumba.alive) {
      continue;
    }
    const tile = getGumbaTile(ctx.timeStamp, ctx.gumbaTiles);
    const x = gumba.position.x + ctx.scrollOffset;
    const y = gumba.position.y;
    ctx.context.drawImage(tile, x, y);
  }
}
