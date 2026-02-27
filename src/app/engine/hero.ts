import { HERO_PADDING, VELOCITY_Y } from './constants';
import type { GameState, Position } from './game-state';
import { getHeroTile, type HeroTileSet } from './hero-tiles';
import { keyboard } from './keyboard';
import type { Level } from './level';
import { SIZE } from './palettes';
import {
  calcMaxX,
  calcMaxY,
  calcMinX,
  calcMinY,
  toBottom,
  toLeft,
  toRight,
} from './walls';

export type DrawHeroOptions = {
  gameState: GameState;
  timeStamp: number;
  heroTiles: HeroTileSet;
  movedVertically: boolean;
  position: Position;
  context: CanvasRenderingContext2D;
};

export function drawHero(options: DrawHeroOptions): void {
  const { gameState, timeStamp, heroTiles, movedVertically, position, context } =
    options;
  const tile = getHeroTile(gameState, timeStamp, heroTiles, movedVertically);
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
    hitTop = jump(gameState, level, delta, timeStamp);
  }

  if (keyboard.up && hitGround) {
    gameState.hero.jumpStart = timeStamp;
  }

  if (keyboard.left && !hitTop) goLeft(gameState, level, delta);
  else if (keyboard.right && !hitTop) goRight(gameState, level, delta);

  gameState.hero.runStart =
    (keyboard.left || keyboard.right) ? gameState.hero.runStart || timeStamp : 0;

  gameState.hero.position.x = Math.max(0, gameState.hero.position.x);
  gameState.isFalling = gameState.hero.position.y > initY;
  return initY !== gameState.hero.position.y;
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
