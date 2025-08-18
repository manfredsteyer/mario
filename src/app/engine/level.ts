import { SCALE, TOLERANCE_LEFT, TOLERANCE_RIGHT, VELOCITY_Y } from './constants';
import {
  Direction,
  GameState,
  getGameState,
  initHeroState,
  Position,
  setGameState,
  updateGameState,
} from './game-state';
import { SIZE } from './palettes';
import { DrawOptions, drawTile, HeroTileSet, Tile, TileSet } from './tiles';

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

  drawLevel({ level, offset, tiles, context, width, height });

  applyGravity(gameState, level, delta);
  checkBottom(height, gameState);

  drawHero({
    tile: heroTiles.stand,
    position: gameState.hero.position,
    context,
  })

  updateGameState((state) => ({
    ...state,
    hero: gameState.hero,
    levelId: level.levelId,
    offset,
    direction,
  }));

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

function checkBottom(height: number, gameState: GameState) {
  const bottom = height / SCALE;
  // Game over?
  if (gameState.hero.position.y > bottom) {
    const newY = initHeroState.position.y;
    gameState.hero.position.y = newY;
  }
}

function applyGravity(gameState: GameState, level: Level, delta: number) {
  const blockY = gameState.hero.position.y / SIZE;
  const x = gameState.hero.position.x;

  const below = level.items.filter((item) => {
    return (
      item.row > blockY  &&
      ((item.col) * SIZE) < x + TOLERANCE_LEFT &&
      ((item.col + (item.repeatCol || 1)) * SIZE) > x + TOLERANCE_RIGHT &&
      (item.tileKey === 'floor' || item.tileKey === 'brick')
    );
  });

  let maxY = Infinity;
  if (below.length > 0) {
    const minRow = Math.min(...below.map(b => b.row));
    maxY = minRow * SIZE - SIZE;
  }

  const candY = gameState.hero.position.y + VELOCITY_Y * delta;
  const newY = Math.min(maxY, candY);
  gameState.hero.position.y = newY;
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
