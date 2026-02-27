import { SCALE, HERO_PADDING, VELOCITY_Y, COIN_PADDING } from './constants';
import {
  Direction,
  GameState,
  getGameState,
  Position,
  resetGameState,
  updateGameState,
} from './game-state';
import { HeroTileSet } from './hero';
import { keyboard } from './keyboard';
import { SIZE } from './palettes';
import {
  DrawOptions,
  drawTile,
  TileSet,
} from './tiles';

const SCREEN_WIDTH = 340;

export type Level = {
  levelId: number;
  backgroundColor: string;
  items: Item[];
};

export type TileName = keyof TileSet | 'collected';

export type Item = { tileKey: TileName } & DrawOptions;

export type AnimateOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
  heroTiles: HeroTileSet;
};

let abortController: AbortController | undefined;

export function stopAnimation(): void {
  abortController?.abort();
}

export function playLevel(options: AnimateOptions) {
  const { canvas, level, tiles, heroTiles } = options;

  const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

  if (!context) {
    throw new Error('canvas 2d expected!');
  }

  stopAnimation();

  abortController = new AbortController();
  const abortSignal = abortController.signal;

  const levelWidth =
    level.items
      .map((i) => i.col + (i.repeatCol || 1) - 1)
      .reduce((prev, curr) => Math.max(prev, curr), 0) * SIZE;

  const maxOffset = levelWidth - SCREEN_WIDTH;

  const offset = getOffset(level);
  const direction = getDirection(level);

  if (needReset(level)) {
    resetGameState();
  }

  step({
    canvas,
    context,
    level,
    tiles,
    heroTiles,
    offset,
    speed: 10,
    abortSignal,
    timeStamp: 0,
    formerTimeStamp: 0,
    maxOffset,
    direction,
  });
}

type StepOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  level: Level;
  tiles: TileSet;
  heroTiles: HeroTileSet;
  offset: number;
  speed: number;
  timeStamp: number;
  formerTimeStamp: number;
  abortSignal: AbortSignal;
  maxOffset: number;
  direction: Direction;
};

function getOffset(level: Level): number {
  const state = getGameState();
  const offset = level.levelId === state.levelId ? state.offset : 0;
  return offset;
}

function needReset(level: Level): boolean {
  const state = getGameState();
  return level.levelId !== state.levelId;
}

function getDirection(level: Level): Direction {
  const state = getGameState();
  const offset = level.levelId === state.levelId ? state.direction : 'right';
  return offset;
}

function step(options: StepOptions): void {
  const {
    canvas,
    context,
    level,
    tiles,
    heroTiles,
    speed,
    timeStamp,
    formerTimeStamp,
  } = options;

  if (options.abortSignal.aborted) {
    return;
  }

  const gameState = getGameState();

  const width = canvas.width;
  const height = canvas.height;

  const delta = formerTimeStamp ? (timeStamp - formerTimeStamp) / speed : 0;

  const movedVertically = moveHero(timeStamp, gameState, level, delta);

  checkCoinsCollision(level, gameState);

  gameState.hero.position.x = Math.max(0, gameState.hero.position.x);

  const renderX = Math.min(gameState.hero.position.x, width / SCALE / 2 - SIZE);
  const offset = -Math.max(0, gameState.hero.position.x - renderX);

  drawLevel({ level, offset, tiles, context, width, height });

  const heroTile = getHeroTile(
    gameState,
    timeStamp,
    heroTiles,
    movedVertically,
  );

  drawHero({
    tile: heroTile,
    position: { ...gameState.hero.position, x: renderX },
    context,
  });

  if (!lostLife(height, gameState)) {
    updateGameState((state) => ({
      ...state,
      hero: gameState.hero,
      levelId: level.levelId,
      offset,
    }));
  } else {
    resetLevelCoins(level);
    resetGameState();
  }

  requestAnimationFrame((newTimeStamp) => {
    step({
      ...options,
      formerTimeStamp: timeStamp,
      timeStamp: newTimeStamp,
    });
  });
}

export type RenderOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
};

function getHeroTile(
  gameState: GameState,
  timeStamp: number,
  heroTiles: HeroTileSet,
  movedVertically: boolean,
) {
  let heroTileKey: keyof HeroTileSet = 'stand';

  if (gameState.hero.runStart > 0 && !movedVertically) {
    const runDelta = timeStamp - gameState.hero.runStart;
    heroTileKey = 'run' + (Math.floor(runDelta / 100) % 3);
  }

  if (gameState.direction === 'left') {
    heroTileKey = heroTileKey + 'Left';
  }

  const heroTile = heroTiles[heroTileKey as keyof HeroTileSet];
  return heroTile;
}

function moveHero(
  timeStamp: number,
  gameState: GameState,
  level: Level,
  delta: number,
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

function goRight(gameState: GameState, level: Level, delta: number) {
  const maxX = calcMaxX(gameState, level);
  const candX = gameState.hero.position.x + 1 * delta;
  const newX = Math.min(candX, maxX + HERO_PADDING);
  gameState.hero.position.x = newX;
  gameState.direction = 'right';
}

function goLeft(gameState: GameState, level: Level, delta: number) {
  const minX = calcMinX(gameState, level);
  const candX = gameState.hero.position.x - 1 * delta;
  const newX = Math.max(candX, minX - HERO_PADDING);
  gameState.hero.position.x = newX;
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

function lostLife(height: number, gameState: GameState): boolean {
  const bottom = height / SCALE;
  return gameState.hero.position.y > bottom;
}

function applyGravity(
  gameState: GameState,
  level: Level,
  delta: number,
): boolean {
  const maxY = calcMaxY(gameState, level);

  const y = gameState.hero.position.y;
  const candY = y + VELOCITY_Y * delta;
  const newY = Math.min(maxY, candY);
  gameState.hero.position.y = newY;

  const hitGround = newY === y;
  return hitGround;
}

function calcMaxY(gameState: GameState, level: Level) {
  const bottom = getBottomSolids(gameState, level);

  let maxY = Infinity;
  if (bottom.length > 0) {
    const minRow = min(bottom, (item) => item.row);
    maxY = minRow * SIZE - SIZE;
  }
  return maxY;
}

function getBottomSolids(gameState: GameState, level: Level) {
  const y = gameState.hero.position.y;
  const leftX = gameState.hero.position.x + SIZE - HERO_PADDING;
  const rightX = gameState.hero.position.x + HERO_PADDING;

  const bottom = level.items.filter((item) => {
    return (
      toTop(item) > y &&
      toLeft(item) < leftX &&
      toRight(item) > rightX &&
      isSolid(item.tileKey)
    );
  });
  return bottom;
}

function min(right: Item[], c: (b: Item) => number) {
  return Math.min(...right.map(c));
}

function max(right: Item[], c: (b: Item) => number) {
  return Math.max(...right.map(c));
}

function isSolid(key: TileName): boolean {
  return (
    key === 'floor' ||
    key === 'brick' ||
    key === 'solid' ||
    key.startsWith('pipe') ||
    key === 'questionMark'
  );
}

function calcMinY(gameState: GameState, level: Level): number {
  const above = getAboveSolids(gameState, level);

  let minY = -Infinity;
  if (above.length > 0) {
    const minRow = max(above, (b) => b.row);
    minY = minRow * SIZE + SIZE;
  }
  return minY;
}

function getAboveSolids(gameState: GameState, level: Level) {
  const y = gameState.hero.position.y;
  const leftX = gameState.hero.position.x + SIZE - HERO_PADDING;
  const rightX = gameState.hero.position.x + HERO_PADDING;

  const above = level.items.filter((item) => {
    return (
      toBottom(item) <= y &&
      toLeft(item) < leftX &&
      toRight(item) > rightX &&
      isSolid(item.tileKey)
    );
  });
  return above;
}

function calcMaxX(gameState: GameState, level: Level): number {
  const right = getRightSolids(gameState, level);

  let maxX = Infinity;
  if (right.length > 0) {
    const minCol = min(right, (b) => toLeft(b));
    maxX = minCol - SIZE;
  }

  return maxX;
}

function getRightSolids(gameState: GameState, level: Level) {
  const y = gameState.hero.position.y;
  const x = gameState.hero.position.x;

  const right = level.items.filter((item) => {
    return (
      toLeft(item) >= x &&
      toTop(item) <= y &&
      toBottom(item) >= y &&
      isSolid(item.tileKey)
    );
  });
  return right;
}

function calcMinX(gameState: GameState, level: Level): number {
  const left = getLeftSolids(gameState, level);
  let minX = -Infinity;
  if (left.length > 0) {
    minX = max(left, (b) => toRight(b));
  }
  return minX;
}

function getLeftSolids(gameState: GameState, level: Level) {
  const y = gameState.hero.position.y;
  const x = gameState.hero.position.x;

  const left = level.items.filter((item) => {
    return (
      toRight(item) <= x + HERO_PADDING &&
      toTop(item) <= y &&
      toBottom(item) >= y &&
      isSolid(item.tileKey)
    );
  });
  return left;
}

export function renderLevel(options: RenderOptions): void {
  const { canvas, level, tiles } = options;

  const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

  if (!context) {
    throw new Error('canvas 2d expected!');
  }

  const width = canvas.width;
  const height = canvas.height;
  const offset = getOffset(level);

  stopAnimation();
  drawLevel({ level, offset, tiles, context, width, height });
}

type DrawLevelOptions = {
  level: Level;
  offset: number;
  tiles: TileSet;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
};

function drawLevel(options: DrawLevelOptions) {
  const { level, offset, tiles, context, width, height } = options;
  context.fillStyle = level.backgroundColor;
  context.fillRect(0, 0, width, height);

  for (const item of level.items) {
    if (item.tileKey === 'collected') continue;
    const tile = tiles[item.tileKey as keyof TileSet];
    drawTile(context, tile, offset, item);
  }
}

function resetLevelCoins(level: Level): void {
  for (const item of level.items) {
    if (item.tileKey === 'collected') {
      item.tileKey = 'coin';
    }
  }
}

function toLeft(item: Item): number {
  return item.col * SIZE;
}

function toRight(item: Item): number {
  const repeat = item.repeatCol ?? 1;
  const blockWidth = getBlockWidth(item.tileKey);
  return (item.col + repeat * blockWidth) * SIZE;
}

function toTop(item: Item): number {
  return item.row * SIZE;
}

function toBottom(item: Item): number {
  const repeat = item.repeatRow ?? 1;
  const blockHeight = getBlockHeight(item.tileKey);
  return (item.row + repeat * blockHeight) * SIZE;
}

function checkCoinsCollision(level: Level, gameState: GameState): void {
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

type DrawHeroOptions = {
  tile: ImageBitmap;
  position: Position;
  context: CanvasRenderingContext2D;
};

function drawHero(options: DrawHeroOptions): void {
  const { tile, position, context } = options;
  const { x, y } = options.position;
  context.drawImage(tile, x, y);
}

function getBlockWidth(tileKey: TileName): number {
  if (tileKey === 'pipeTop') {
    return 2;
  }
  return 1;
}

function getBlockHeight(tileKey: TileName): number {
  if (tileKey === 'pipeTop') {
    return 3;
  }
  return 1;
}
