import { SCALE, TOLERANCE_LEFT, TOLERANCE_RIGHT, VELOCITY_Y } from './constants';
import {
  Direction,
  GameState,
  getGameState,
  initHeroState,
  Position,
  resetGameState,
  setGameState,
  updateGameState,
} from './game-state';
import { keyboard } from './keyboard';
import { SIZE } from './palettes';
import { BaseTileSet, DrawOptions, drawTile, HeroTileSet, Tile, TileCollections, TileSet } from './tiles';

const SCREEN_WIDTH = 340;

export type Level = {
  levelId: number;
  backgroundColor: string;
  items: Item[];
};

export type TileName = keyof TileSet;

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

export function animateLevel(options: AnimateOptions) {
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
    offset,
    speed,
    timeStamp,
    formerTimeStamp,
    maxOffset,
    direction,
  } = options;

  // const newDirection = calcDirection(offset, maxOffset, direction);

  // const directionFactor = direction === 'right' ? 1 : -1;

  if (options.abortSignal.aborted) {
    return;
  }

  const gameState = getGameState();

  const width = canvas.width;
  const height = canvas.height;

  const delta = formerTimeStamp ? (timeStamp - formerTimeStamp) / speed : 0;
  // const newOffset = offset - delta * directionFactor;

  moveHero(timeStamp, gameState, level, delta);

  drawLevel({ level, offset, tiles, context, width, height });

  drawHero({
    tile: heroTiles.stand,
    position: gameState.hero.position,
    context,
  })

  if (!lostLife(height, gameState)) {
    updateGameState((state) => ({
      ...state,
      hero: gameState.hero,
      levelId: level.levelId,
      offset,
      direction,
    }));
  }
  else {
    resetGameState();
  }

  requestAnimationFrame((newTimeStamp) => {
    step({
      ...options,
      // offset: newOffset,
      formerTimeStamp: timeStamp,
      timeStamp: newTimeStamp,
      // direction: newDirection,
    });
  });
}

export type RenderOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
};

function moveHero(timeStamp: number, gameState: GameState, level: Level, delta: number) {
  let hitGround = false;
  let hitTop = false;
  const isJumping = keyboard.up && timeStamp - gameState.hero.jumpStart < 500;

  if (!isJumping) {
    gameState.hero.jumpStart = 0;
    hitGround = applyGravity(gameState, level, delta);
  }
  else {
    hitTop = jump(gameState, level, delta);
  }

  if (keyboard.up && hitGround) {
    gameState.hero.jumpStart = timeStamp;
  }

  if (keyboard.left && !hitTop) {
    goLeft(gameState, level, delta);
  }
  else if (keyboard.right && !hitTop) {
    goRight(gameState, level, delta);
  }
}

function goRight(gameState: GameState, level: Level, delta: number) {
  const maxX = calcMaxX(gameState, level);
  const candX = gameState.hero.position.x + 1 * delta;
  const newX = Math.min(candX, maxX);
  gameState.hero.position.x = newX;
}

function goLeft(gameState: GameState, level: Level, delta: number) {
  const minX = calcMinX(gameState, level);
  const candX = gameState.hero.position.x - 1 * delta;
  const newX = Math.max(candX, minX);
  gameState.hero.position.x = newX;
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
  return (gameState.hero.position.y > bottom);
}

function applyGravity(gameState: GameState, level: Level, delta: number): boolean {
  const maxY = calcMaxY(gameState, level);

  const candY = gameState.hero.position.y + VELOCITY_Y * delta;
  const newY = Math.min(maxY, candY);
  const hitGround = newY === gameState.hero.position.y;
  gameState.hero.position.y = newY;

  return hitGround;
}

function calcMaxY(gameState: GameState, level: Level) {
  const blockY = gameState.hero.position.y / SIZE;
  const x = gameState.hero.position.x;

  const below = level.items.filter((item) => {
    return (
      item.row > blockY &&
      ((item.col) * SIZE) < x + TOLERANCE_LEFT &&
      ((item.col + (item.repeatCol || 1) + extraLength(item.tileKey)) * SIZE) > x + TOLERANCE_RIGHT &&
      isSolid(item.tileKey)
    );
  });

  let maxY = Infinity;
  if (below.length > 0) {
    const minRow = Math.min(...below.map(b => b.row));
    maxY = minRow * SIZE - SIZE;
  }
  return maxY;
}

function isSolid(key: keyof BaseTileSet | keyof TileCollections): boolean {
  return key === 'floor' 
    || key === 'brick' 
    || key.startsWith('pipe') 
    || key === 'questionMark';
}

function calcMinY(gameState: GameState, level: Level): number {
  const blockY = gameState.hero.position.y / SIZE;
  const x = gameState.hero.position.x;

  const below = level.items.filter((item) => {
    return (
      item.row + 1 <= blockY  &&
      ((item.col) * SIZE) < x + TOLERANCE_LEFT &&
      ((item.col + (item.repeatCol || 1) + extraLength(item.tileKey)) * SIZE) > x + TOLERANCE_RIGHT &&
      isSolid(item.tileKey)
    );
  });

  let minY = -Infinity;
  if (below.length > 0) {
    const minRow = Math.max(...below.map(b => b.row));
    minY = minRow * SIZE + SIZE;
  }

  return minY;
}

function calcMaxX(gameState: GameState, level: Level): number {
  const blockY = gameState.hero.position.y / SIZE;
  const x = gameState.hero.position.x;

  const below = level.items.filter((item) => {
    return (
      x <= (item.col) * SIZE &&
      blockY > item.row &&
      blockY <= item.row + (item.repeatRow || 1) &&
      isSolid(item.tileKey)
    );
  });

  let maxX = Infinity;
  if (below.length > 0) {
    console.log('below', below);
    const minCol = Math.min(...below.map(b => b.col));
    maxX = minCol * SIZE - SIZE + TOLERANCE_RIGHT;
  }

  return maxX;
}

function calcMinX(gameState: GameState, level: Level): number {
  const blockY = gameState.hero.position.y / SIZE;
  const x = gameState.hero.position.x;

  const below = level.items.filter((item) => {
    return (
      x >= (item.col) * SIZE &&
      blockY > item.row &&
      blockY <= item.row + (item.repeatRow || 1) &&
      isSolid(item.tileKey)
    );
  });

  let minX = -Infinity;
  if (below.length > 0) {
    console.log('below', below);
    const minCol = Math.max(...below.map(b => b.col + extraLength(b.tileKey)));
    minX = (minCol + 1) * SIZE - TOLERANCE_RIGHT;
  }

  return minX;
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
    const tile = tiles[item.tileKey];
    drawTile(context, tile, offset, item);
  }
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

function calcDirection(
  offset: number,
  maxOffset: number,
  currentDirection: Direction,
): Direction {
  if (offset < -maxOffset) {
    return 'left';
  }

  if (offset >= 0) {
    return 'right';
  }

  return currentDirection;
}

function extraLength(tileKey: string): number {
  if (tileKey.startsWith('pipe')) {
    return 1; // pipes are one tile wider
  }
  return 0;
}


