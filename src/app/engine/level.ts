import { SCALE } from './constants';
import { checkCoinsCollision, resetLevelCoins } from './coins';
import {
  Direction,
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
import type { StepContext, StepOptions } from './step-context';
import { drawTile, TileSet } from './tiles';
import type { Item, Level, TileName } from './types';

export type { Item, Level, TileName };

const SCREEN_WIDTH = 340;

let abortController: AbortController | undefined;

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
  const gameState = getGameState();
  drawLevel({
    level,
    scrollOffset: offset,
    tiles,
    context,
    width,
    height,
    timeStamp: 0,
    gameState,
  } as StepContext);
}

export type AnimateOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
  heroTiles: HeroTileSet;
  gumbaTiles?: GumbaTileSet;
};

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

export function stopAnimation(): void {
  abortController?.abort();
}

function step(options: StepOptions): void {
  if (options.abortSignal.aborted) {
    return;
  }

  const ctx: StepContext = {
    ...options,
    gameState: getGameState(),
    width: options.canvas.width,
    height: options.canvas.height,
    delta: options.formerTimeStamp
      ? (options.timeStamp - options.formerTimeStamp) / options.speed
      : 0,
    beaten: false,
    fellOff: false,
    movedVertically: false,
    renderX: 0,
    scrollOffset: 0,
  };

  moveHero(ctx);
  moveGumbas(ctx);
  scrollLevel(ctx);
  drawLevel(ctx);
  drawHero(ctx);
  drawGumbas(ctx);
  checkCoinsCollision(ctx);
  checkHeroGumbaCollision(ctx);
  checkFellOff(ctx);

  if (!didHeroDie(ctx)) {
    updateGameState((state) => ({
      ...state,
      hero: ctx.gameState.hero,
      levelId: ctx.level.levelId,
      offset: ctx.scrollOffset,
      isFalling: ctx.gameState.isFalling,
    }));
  } else {
    resetLevelOnDeath(ctx);
  }

  requestAnimationFrame((newTimeStamp) => {
    step({
      ...options,
      formerTimeStamp: options.timeStamp,
      timeStamp: newTimeStamp,
    });
  });
}

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

function scrollLevel(ctx: StepContext): void {
  ctx.renderX = Math.min(ctx.gameState.hero.position.x, ctx.width / SCALE / 2 - SIZE);
  ctx.scrollOffset = -Math.max(0, ctx.gameState.hero.position.x - ctx.renderX);
}

function checkFellOff(ctx: StepContext): void {
  const bottom = ctx.height / SCALE;
  ctx.fellOff = ctx.gameState.hero.position.y > bottom;
}

function didHeroDie(ctx: StepContext): boolean {
  return ctx.fellOff || ctx.beaten;
}

function resetLevelOnDeath(ctx: StepContext): void {
  resetLevelCoins(ctx.level);
  resetGameState(ctx.level);
}

function drawLevel(ctx: StepContext): void {
  const { level, scrollOffset, tiles, context, width, height, timeStamp, gameState } = ctx;
  context.fillStyle = level.backgroundColor;
  context.fillRect(0, 0, width, height);

  drawRisingCoins(context, tiles, scrollOffset, timeStamp, gameState);

  for (const item of level.items) {
    if (item.tileKey === 'collected') continue;
    const tile = tiles[item.tileKey as keyof TileSet];
    drawTile(context, tile, scrollOffset, item);
  }
}
