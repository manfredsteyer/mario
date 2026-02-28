import { SCALE } from './constants';
import { checkCoinsCollision, resetLevelCoins } from './coins';
import type { GumbaState, HeroState, RisingCoin } from './game-context';
import { drawHero, moveHero } from './hero';
import { HeroTileSet } from './hero-tiles';
import type { GumbaTileSet } from './gumba-tiles';
import { drawGumbas, checkHeroGumbaCollision, moveGumbas, resetGumbas } from './gumba';
import { drawRisingCoins } from './questionMark';
import { SIZE } from './palettes';
import {
  createInitialGameOptions,
  type GameContext,
  type GameOptions,
} from './game-context';
import { drawTile, type TileSet } from './tiles';
import type { Item, TileName } from './tiles';
import type { Level } from './types';

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
  drawLevel({
    ...getInitialState(),
    level,
    scrollOffset: offset,
    tiles,
    context,
    width,
    height,
    timeStamp: 0,
  } as unknown as GameContext);
}

export type AnimateOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
  heroTiles: HeroTileSet;
  gumbaTiles: GumbaTileSet;
};

export function playLevel(options: AnimateOptions) {
  const { canvas, level } = options;

  const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

  if (!context) {
    throw new Error('canvas 2d expected!');
  }

  stopAnimation();

  abortController = new AbortController();
  const abortSignal = abortController.signal;

  const gameOptions: GameOptions = {
    ...createInitialGameOptions(),
    ...options,
    canvas,
    abortSignal,
    context,
    direction: 'right',
  };
  gameOptions.gumbas = resetGumbas(level);

  runGameLoop(gameOptions);
}

export function stopAnimation(): void {
  abortController?.abort();
}

function runGameLoop(gameOptions: GameOptions): void {
  if (gameOptions.abortSignal.aborted) {
    return;
  }

  const ctx: GameContext = {
    ...createGameContext(gameOptions),
    levelId: gameOptions.level.levelId,
    maxOffset: getMaxOffset(gameOptions.level),
    width: gameOptions.canvas.width,
    height: gameOptions.canvas.height,
    delta: gameOptions.formerTimeStamp
      ? (gameOptions.timeStamp - gameOptions.formerTimeStamp) / gameOptions.speed
      : 0,
    beaten: false,
    fellOff: false,
    movedVertically: false,
    renderX: 0,
    scrollOffset: 0,
  };

  console.log('delta', ctx.delta);

  moveHero(ctx);
  moveGumbas(ctx);
  scrollLevel(ctx);
  drawLevel(ctx);
  drawHero(ctx);
  drawGumbas(ctx);
  checkCoinsCollision(ctx);
  checkHeroGumbaCollision(ctx);
  checkFellOff(ctx);

  if (didHeroDie(ctx)) {
    resetLevelOnDeath(ctx);
  }

  requestAnimationFrame((newTimeStamp) => {
    runGameLoop({
      ...gameOptions,
      ...ctx,
      formerTimeStamp: gameOptions.timeStamp,
      timeStamp: newTimeStamp,
    });
  });
}

function getInitialState(): {
  hero: HeroState;
  gumbas: GumbaState[];
  risingCoins: RisingCoin[];
  animation: boolean;
  isFalling: boolean;
} {
  return {
    hero: {
      position: { x: 16, y: 0 },
      acceleration: 0,
      jumpStart: 0,
      runStart: 0,
    },
    gumbas: [] as GumbaState[],
    risingCoins: [] as RisingCoin[],
    animation: false,
    isFalling: false,
  };
}

function createGameContext(gameOptions: GameOptions): GameContext {
  return {
    ...gameOptions,
    levelId: gameOptions.level.levelId,
    maxOffset: getMaxOffset(gameOptions.level),
    width: gameOptions.canvas.width,
    height: gameOptions.canvas.height,
    delta: gameOptions.formerTimeStamp
      ? (gameOptions.timeStamp - gameOptions.formerTimeStamp) / gameOptions.speed
      : 0,
    beaten: false,
    fellOff: false,
    movedVertically: false,
    renderX: 0,
    scrollOffset: 0,
  };
}

function getMaxOffset(level: Level): number {
  const levelWidth =
    level.items
      .map((i) => i.col + (i.repeatCol || 1) - 1)
      .reduce((prev, curr) => Math.max(prev, curr), 0) * SIZE;
  return levelWidth - SCREEN_WIDTH;
}

function getOffset(_level: Level): number {
  return 0;
}

function scrollLevel(ctx: GameContext): void {
  const center = ctx.width / SCALE / 2;
  ctx.renderX = Math.min(ctx.hero.position.x, center - SIZE);
  ctx.scrollOffset = -1 * (ctx.hero.position.x - ctx.renderX);
}

function checkFellOff(ctx: GameContext): void {
  const bottom = ctx.height / SCALE;
  ctx.fellOff = ctx.hero.position.y > bottom;
}

function didHeroDie(ctx: GameContext): boolean {
  return ctx.fellOff || ctx.beaten;
}

function resetLevelOnDeath(ctx: GameContext): void {
  resetLevelCoins(ctx.level);
  const state = getInitialState();
  state.gumbas = resetGumbas(ctx.level);
  ctx.hero = state.hero;
  ctx.gumbas = state.gumbas;
  ctx.risingCoins = state.risingCoins;
  ctx.animation = state.animation;
  ctx.isFalling = state.isFalling;
}

function drawLevel(ctx: GameContext): void {
  const { level, context, width, height } = ctx;
  context.fillStyle = level.backgroundColor;
  context.fillRect(0, 0, width, height);

  drawRisingCoins(ctx);

  for (const item of level.items) {
    drawTile(ctx, item);
  }
}
