import { SCALE } from './constants';
import { checkCoinsCollision, resetLevelCoins } from './coins';
import {
  Direction,
  GameState,
  getGameState,
  resetGameState,
  updateGameState,
} from './game-state';
import { drawHero, moveHero } from './hero';
import { HeroTileSet } from './hero-tiles';
import type { GumbaTileSet } from './gumba-tiles';
import { drawGumbas, checkHeroGumbaCollision, moveGumbas } from './gumba';
import { drawRisingCoins } from './questionMark';
import { SIZE } from './palettes';
import { DrawOptions, drawTile, TileSet } from './tiles';

const SCREEN_WIDTH = 340;

export type GumbaStart = { col: number; row: number };

export type Level = {
  levelId: number;
  backgroundColor: string;
  items: Item[];
  gumbas?: GumbaStart[];
};

export type TileName = keyof TileSet | 'collected' | 'empty';

export type Item = { tileKey: TileName } & DrawOptions;

export type AnimateOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
  heroTiles: HeroTileSet;
  gumbaTiles?: GumbaTileSet;
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
    resetGameState(level);
  }

  step({
    canvas,
    context,
    level,
    tiles,
    heroTiles,
    gumbaTiles: options.gumbaTiles,
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
  gumbaTiles?: GumbaTileSet;
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
    gumbaTiles,
    speed,
    timeStamp,
    formerTimeStamp,
  } = options;

  if (options.abortSignal.aborted) {
    return;
  }

  const gameState = getGameState();
  let beaten = false;
  const width = canvas.width;
  const height = canvas.height;
  const delta = formerTimeStamp ? (timeStamp - formerTimeStamp) / speed : 0;

  const movedVertically = moveHero(timeStamp, gameState, level, delta);

  if (gumbaTiles) {
    moveGumbas(gameState, level, delta);
  }

  const { renderX, offset } = scrollLevel(width, gameState.hero.position.x);

  drawLevel({
    level,
    offset,
    tiles,
    context,
    width,
    height,
    timeStamp,
    gameState,
  });

  drawHero({
    gameState,
    timeStamp,
    heroTiles,
    movedVertically,
    position: { ...gameState.hero.position, x: renderX },
    context,
  });

  if (gumbaTiles) {
    drawGumbas(context, gameState, gumbaTiles, timeStamp, offset);
  }

  checkCoinsCollision(level, gameState);

  if (gumbaTiles) {
    const collision = checkHeroGumbaCollision(gameState);
    if (collision === 'hero-dead') beaten = true;
  }

  const didFellOff = fellOff(height, gameState);

  if (!didFellOff && !beaten) {
    updateGameState((state) => ({
      ...state,
      hero: gameState.hero,
      levelId: level.levelId,
      offset,
      isFalling: gameState.isFalling,
    }));
  } else {
    resetLevelCoins(level);
    resetGameState(level);
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

function scrollLevel(width: number, heroX: number): { renderX: number; offset: number } {
  const renderX = Math.min(heroX, width / SCALE / 2 - SIZE);
  const offset = -Math.max(0, heroX - renderX);
  return { renderX, offset };
}

function fellOff(height: number, gameState: GameState): boolean {
  const bottom = height / SCALE;
  return gameState.hero.position.y > bottom;
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
  const gameState = getGameState();
  drawLevel({
    level,
    offset,
    tiles,
    context,
    width,
    height,
    timeStamp: 0,
    gameState,
  });
}

type DrawLevelOptions = {
  level: Level;
  offset: number;
  tiles: TileSet;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  timeStamp: number;
  gameState: GameState;
};

function drawLevel(options: DrawLevelOptions) {
  const { level, offset, tiles, context, width, height, timeStamp, gameState } =
    options;
  context.fillStyle = level.backgroundColor;
  context.fillRect(0, 0, width, height);

  drawRisingCoins(context, tiles, offset, timeStamp, gameState);

  for (const item of level.items) {
    if (item.tileKey === 'collected') continue;
    const tile = tiles[item.tileKey as keyof TileSet];
    drawTile(context, tile, offset, item);
  }
}


