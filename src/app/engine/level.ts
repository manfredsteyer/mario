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
import { getHeroTile, HeroTileSet } from './hero-tiles';
import type { GumbaTileSet } from './gumba-tiles';
import { drawGumbas, checkHeroGumbaCollision, moveGumbas } from './gumba';
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

export type TileName = keyof TileSet | 'collected';

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

  const width = canvas.width;
  const height = canvas.height;

  const delta = formerTimeStamp ? (timeStamp - formerTimeStamp) / speed : 0;

  const previousHeroY = gameState.hero.position.y;
  const movedVertically = moveHero(timeStamp, gameState, level, delta);
  const isFalling = gameState.hero.position.y > previousHeroY;
  gameState.isFalling = isFalling;

  checkCoinsCollision(level, gameState);

  if (gumbaTiles?.length) {
    moveGumbas(gameState, level, delta);
    const collision = checkHeroGumbaCollision(gameState);
    if (collision === 'hero-dead') {
      resetLevelCoins(level);
      resetGameState(level);
      requestAnimationFrame((newTimeStamp) => {
        step({
          ...options,
          formerTimeStamp: timeStamp,
          timeStamp: newTimeStamp,
        });
      });
      return;
    }
  }

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

  if (gumbaTiles?.length) {
    drawGumbas(context, gameState, gumbaTiles, timeStamp, offset);
  }

  if (!lostLife(height, gameState)) {
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

function lostLife(height: number, gameState: GameState): boolean {
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


