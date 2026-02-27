import { HERO_PADDING, VELOCITY_Y } from './constants';
import type { GameState, Position } from './game-state';
import { getHeroTile, type HeroTileSet } from './hero-tiles';
import { keyboard } from './keyboard';
import type { Level } from './level';
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
  const tile = getHeroTile(ctx.gameState, ctx.timeStamp, ctx.heroTiles, ctx.movedVertically);
  const { y } = ctx.gameState.hero.position;
  ctx.context.drawImage(tile, ctx.renderX, y);
}

export function moveHero(ctx: StepContext): void {
  let hitGround = false;
  let hitTop = false;
  const isJumping = keyboard.up && ctx.timeStamp - ctx.gameState.hero.jumpStart < 500;
  const initY = ctx.gameState.hero.position.y;

  if (!isJumping) {
    ctx.gameState.hero.jumpStart = 0;
    hitGround = applyGravity(ctx.gameState, ctx.level, ctx.delta);
  } else {
    hitTop = jump(ctx.gameState, ctx.level, ctx.delta, ctx.timeStamp);
  }

  if (keyboard.up && hitGround) {
    ctx.gameState.hero.jumpStart = ctx.timeStamp;
  }

  if (keyboard.left && !hitTop) goLeft(ctx.gameState, ctx.level, ctx.delta);
  else if (keyboard.right && !hitTop) goRight(ctx.gameState, ctx.level, ctx.delta);

  ctx.gameState.hero.runStart =
    (keyboard.left || keyboard.right) ? ctx.gameState.hero.runStart || ctx.timeStamp : 0;

  ctx.gameState.hero.position.x = Math.max(0, ctx.gameState.hero.position.x);
  ctx.gameState.isFalling = ctx.gameState.hero.position.y > initY;
  ctx.movedVertically = initY !== ctx.gameState.hero.position.y;
}

export function goRight(gameState: GameState, level: Level, delta: number): void {
  const hero = gameState.hero;
  const maxX = calcMaxX(hero, level);
  const candX = hero.position.x + 1 * delta;
  hero.position.x = Math.min(candX, maxX + HERO_PADDING);
  gameState.direction = 'right';
}

export function goLeft(gameState: GameState, level: Level, delta: number): void {
  const hero = gameState.hero;
  const minX = calcMinX(hero, level);
  const candX = hero.position.x - 1 * delta;
  hero.position.x = Math.max(candX, minX - HERO_PADDING);
  gameState.direction = 'left';
}

function jump(
  gameState: GameState,
  level: Level,
  delta: number,
  timeStamp: number
): boolean {
  const minY = calcMinY(gameState.hero, level);
  const candY = gameState.hero.position.y - 2 * delta;
  const newY = Math.max(candY, minY);

  gameState.hero.position.y = newY;

  if (newY === minY) {
    handleQuestionBlockHit(gameState, level, timeStamp);
    gameState.hero.jumpStart = 0;
    return true;
  }
  return false;
}

function handleQuestionBlockHit(
  gameState: GameState,
  level: Level,
  timeStamp: number
): void {
  const y = gameState.hero.position.y;
  const leftX = gameState.hero.position.x + SIZE - HERO_PADDING;
  const rightX = gameState.hero.position.x + HERO_PADDING;

  const block = level.items.find((item) => {
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
  if (gameState.hitQuestionBlocks.has(blockKey)) {
    return;
  }
  gameState.hitQuestionBlocks.add(blockKey);
  block.tileKey = 'empty';
  gameState.risingCoins.push({
    col: block.col,
    row: block.row,
    startTime: timeStamp,
  });
}

function applyGravity(
  gameState: GameState,
  level: Level,
  delta: number
): boolean {
  const maxY = calcMaxY(gameState.hero, level);
  const y = gameState.hero.position.y;
  const candY = y + VELOCITY_Y * delta;
  const newY = Math.min(maxY, candY);
  gameState.hero.position.y = newY;
  return newY === y;
}
