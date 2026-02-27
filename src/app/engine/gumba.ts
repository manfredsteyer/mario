import { GUMBA_SPEED, HERO_PADDING } from './constants';
import type { GumbaState } from './game-context';
import type { Level } from './level';
import { SIZE } from './palettes';
import type { GumbaTileSet } from './gumba-tiles';
import { getGumbaTile } from './gumba-tiles';
import type { GameContext } from './game-context';
import type { GumbaStart } from './types';
import { calcMaxX, calcMinX } from './walls';

export type { GumbaStart };

export function resetGumbas(level?: Level): GumbaState[] {
  if (level?.gumbas?.length) {
    return level.gumbas.map(({ col, row }) => ({
      position: { x: col * SIZE, y: row * SIZE },
      direction: 'left' as const,
      alive: true,
    }));
  }
  return [];
}

export function moveGumbas(ctx: GameContext): void {
  for (const gumba of ctx.gumbas) {
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

export function checkHeroGumbaCollision(ctx: GameContext): void {
  const heroLeft = ctx.hero.position.x + HERO_PADDING;
  const heroRight = heroLeft + SIZE - HERO_PADDING;
  const heroTop = ctx.hero.position.y;
  const heroBottom = heroTop + SIZE;

  for (const gumba of ctx.gumbas) {
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

    const isStomp = ctx.isFalling;

    if (isStomp) {
      gumba.alive = false;
      return;
    }

    ctx.beaten = true;
    return;
  }
}

export function drawGumbas(ctx: GameContext): void {
  if (!ctx.gumbas) {
    return;
  }

  for (const gumba of ctx.gumbas) {
    if (!gumba.alive) {
      continue;
    }
    const tile = getGumbaTile(ctx.timeStamp, ctx.gumbaTiles);
    const x = gumba.position.x + ctx.scrollOffset;
    const y = gumba.position.y;
    ctx.context.drawImage(tile, x, y);
  }
}
