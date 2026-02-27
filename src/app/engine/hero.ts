import { HERO_PADDING, VELOCITY_Y } from './constants';
import type { Position } from './game-state';
import { getHeroTile, type HeroTileSet } from './hero-tiles';
import { keyboard } from './keyboard';
import { SIZE } from './palettes';
import type { StepContext } from './step-context';
import {
  calcMaxX,
  calcMaxY,
  calcMinX,
  calcMinY,
  toBottom,
  toLeft,
  toRight,
} from './walls';

export function drawHero(ctx: StepContext): void {
  const tile = getHeroTile(
    ctx,
    ctx.timeStamp,
    ctx.heroTiles,
    ctx.movedVertically,
    ctx.direction,
  );
  const { y } = ctx.hero.position;
  ctx.context.drawImage(tile, ctx.renderX, y);
}

export function moveHero(ctx: StepContext): void {
  let hitGround = false;
  let hitTop = false;
  const isJumping = keyboard.up && ctx.timeStamp - ctx.hero.jumpStart < 500;
  const initY = ctx.hero.position.y;

  if (!isJumping) {
    ctx.hero.jumpStart = 0;
    hitGround = applyGravity(ctx);
  } else {
    hitTop = jump(ctx, ctx.delta, ctx.timeStamp);
  }

  if (keyboard.up && hitGround) {
    ctx.hero.jumpStart = ctx.timeStamp;
  }

  if (keyboard.left && !hitTop) goLeft(ctx);
  else if (keyboard.right && !hitTop) goRight(ctx);

  ctx.hero.runStart =
    (keyboard.left || keyboard.right) ? ctx.hero.runStart || ctx.timeStamp : 0;

  ctx.hero.position.x = Math.max(0, ctx.hero.position.x);
  ctx.isFalling = ctx.hero.position.y > initY;
  ctx.movedVertically = initY !== ctx.hero.position.y;
}

export function goRight(ctx: StepContext): void {
  const hero = ctx.hero;
  const maxX = calcMaxX(hero, ctx.level);
  const candX = hero.position.x + 1 * ctx.delta;
  hero.position.x = Math.min(candX, maxX + HERO_PADDING);
  ctx.direction = 'right';
}

export function goLeft(ctx: StepContext): void {
  const hero = ctx.hero;
  const minX = calcMinX(hero, ctx.level);
  const candX = hero.position.x - 1 * ctx.delta;
  hero.position.x = Math.max(candX, minX - HERO_PADDING);
  ctx.direction = 'left';
}

function jump(ctx: StepContext, delta: number, timeStamp: number): boolean {
  const minY = calcMinY(ctx.hero, ctx.level);
  const candY = ctx.hero.position.y - 2 * delta;
  const newY = Math.max(candY, minY);

  ctx.hero.position.y = newY;

  if (newY === minY) {
    handleQuestionBlockHit(ctx, timeStamp);
    ctx.hero.jumpStart = 0;
    return true;
  }
  return false;
}

function handleQuestionBlockHit(ctx: StepContext, timeStamp: number): void {
  const y = ctx.hero.position.y;
  const leftX = ctx.hero.position.x + SIZE - HERO_PADDING;
  const rightX = ctx.hero.position.x + HERO_PADDING;

  const block = ctx.level.items.find((item) => {
    return (
      item.tileKey === 'questionMark' &&
      toBottom(item) === y &&
      toLeft(item) < leftX &&
      toRight(item) > rightX
    );
  });

  if (!block) {
    return;
  }

  const blockKey = `${block.col},${block.row}`;
  if (ctx.hitQuestionBlocks.has(blockKey)) {
    return;
  }
  ctx.hitQuestionBlocks.add(blockKey);
  block.tileKey = 'empty';
  ctx.risingCoins.push({
    col: block.col,
    row: block.row,
    startTime: timeStamp,
  });
}

function applyGravity(ctx: StepContext): boolean {
  const maxY = calcMaxY(ctx.hero, ctx.level);
  const y = ctx.hero.position.y;
  const candY = y + VELOCITY_Y * ctx.delta;
  const newY = Math.min(maxY, candY);
  ctx.hero.position.y = newY;
  return newY === y;
}
