import { HERO_PADDING, VELOCITY_Y } from './constants';
import type { GameState, Position } from './game-state';
import { keyboard } from './keyboard';
import type { Level } from './level';
import { calcMaxX, calcMaxY, calcMinX, calcMinY } from './walls';

export type DrawHeroOptions = {
  tile: ImageBitmap;
  position: Position;
  context: CanvasRenderingContext2D;
};

export function drawHero(options: DrawHeroOptions): void {
  const { tile, position, context } = options;
  const { x, y } = position;
  context.drawImage(tile, x, y);
}

export function moveHero(
  timeStamp: number,
  gameState: GameState,
  level: Level,
  delta: number
): boolean {
  let hitGround = false;
  let hitTop = false;
  const isJumping = keyboard.up && timeStamp - gameState.hero.jumpStart < 500;
  const initY = gameState.hero.position.y;

  if (!isJumping) {
    gameState.hero.jumpStart = 0;
    hitGround = applyGravity(gameState, level, delta);
  } else {
    hitTop = jump(gameState, level, delta);
  }

  if (keyboard.up && hitGround) {
    gameState.hero.jumpStart = timeStamp;
  }

  if (keyboard.left && !hitTop) {
    goLeft(gameState, level, delta);
  } else if (keyboard.right && !hitTop) {
    goRight(gameState, level, delta);
  }

  if (keyboard.left || keyboard.right) {
    gameState.hero.runStart = gameState.hero.runStart || timeStamp;
  } else {
    gameState.hero.runStart = 0;
  }

  return initY !== gameState.hero.position.y;
}

export function goRight(gameState: GameState, level: Level, delta: number): void {
  const maxX = calcMaxX(gameState, level);
  const candX = gameState.hero.position.x + 1 * delta;
  gameState.hero.position.x = Math.min(candX, maxX + HERO_PADDING);
  gameState.direction = 'right';
}

export function goLeft(gameState: GameState, level: Level, delta: number): void {
  const minX = calcMinX(gameState, level);
  const candX = gameState.hero.position.x - 1 * delta;
  gameState.hero.position.x = Math.max(candX, minX - HERO_PADDING);
  gameState.direction = 'left';
}

function jump(gameState: GameState, level: Level, delta: number): boolean {
  const minY = calcMinY(gameState, level);
  const candY = gameState.hero.position.y - 2 * delta;
  const newY = Math.max(candY, minY);

  gameState.hero.position.y = newY;

  if (newY === minY) {
    gameState.hero.jumpStart = 0;
    return true;
  }
  return false;
}

function applyGravity(
  gameState: GameState,
  level: Level,
  delta: number
): boolean {
  const maxY = calcMaxY(gameState, level);
  const y = gameState.hero.position.y;
  const candY = y + VELOCITY_Y * delta;
  const newY = Math.min(maxY, candY);
  gameState.hero.position.y = newY;
  return newY === y;
}
