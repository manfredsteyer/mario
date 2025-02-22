import {
  Direction,
  getGameState,
  setGameState,
  updateGateState,
} from './game-state';
import { SIZE } from './palettes';
import { DrawOptions, drawTile, TileSet } from './tiles';

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
};

let abortController: AbortController | undefined;

export function stopAnimation(): void {
  abortController?.abort();
}

export function animateLevel(options: AnimateOptions) {
  const { canvas, level, tiles } = options;

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
    offset,
    speed,
    timeStamp,
    formerTimeStamp,
    maxOffset,
    direction,
  } = options;

  const newDirection = calcDirection(offset, maxOffset, direction);

  const directionFactor = direction === 'right' ? 1 : -1;

  if (options.abortSignal.aborted) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;

  const delta = formerTimeStamp ? (timeStamp - formerTimeStamp) / speed : 0;
  const newOffset = offset - delta * directionFactor;

  drawLevel({ level, offset, tiles, context, width, height });

  updateGateState((state) => ({
    ...state,
    levelId: level.levelId,
    offset,
    direction,
  }));

  requestAnimationFrame((newTimeStamp) => {
    step({
      ...options,
      offset: newOffset,
      formerTimeStamp: timeStamp,
      timeStamp: newTimeStamp,
      direction: newDirection,
    });
  });
}

export type RenderOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
};

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
