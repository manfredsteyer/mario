import { getBlockHeight, getBlockWidth } from './coordinates';
import { SCALE } from './constants';
import { checkCoinsCollision, resetLevelCoins } from './coins';
import type { GumbaState, HeroState, RisingCoin } from './game-context';
import { checkHitQuestionMark, drawHero, moveHero } from './hero';
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
import {
  defaultDrawTileOptions,
  drawTile,
  getKeyCollections,
  getTileCell,
  getTileSize,
  normalizeTile,
  type KeyTileCollections,
  type TileSet,
} from './tiles';
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

  level.levelGrid = buildLevelGrid(level, options.tiles);
  level.rowCount = level.levelGrid.length;
  level.colCount = level.levelGrid[0]?.length ?? 0;
  const gameOptions: GameOptions = {
    ...createInitialGameOptions(),
    ...options,
    canvas,
    abortSignal,
    context,
    direction: 'right',
    initialLevelItems: level.items.map((item) => ({ ...item })),
  };
  gameOptions.gumbas = resetGumbas(level);

  // For debugging
  (window as any).game = gameOptions;
  
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


  moveHero(ctx);
  moveGumbas(ctx);
  scrollLevel(ctx);

  checkCoinsCollision(ctx);
  checkHeroGumbaCollision(ctx);
  checkFellOff(ctx);
  checkHitQuestionMark(ctx);
  
  drawLevelOptimized(ctx);
  drawHero(ctx);
  drawGumbas(ctx);

  drawGrid(ctx);

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

function to2DKeys(
  keys: (string | null)[] | (string | null)[][]
): (string | null)[][] {
  if (!keys.length) return [];
  return Array.isArray(keys[0])
    ? (keys as (string | null)[][])
    : [keys as (string | null)[]];
}

function getPlacementSize(
  item: Item,
  keyCollections: KeyTileCollections
): { cols: number; rows: number } {
  const keyTemplate = keyCollections[item.tileKey as keyof KeyTileCollections];
  const repeatCol = item.repeatCol ?? 1;
  const repeatRow = item.repeatRow ?? 1;
  if (keyTemplate) {
    const shape = to2DKeys(keyTemplate);
    const keyRows = shape.length;
    const keyCols = shape[0]?.length ?? 0;
    return {
      cols: repeatCol * keyCols,
      rows: repeatRow * keyRows,
    };
  }
  return {
    cols: repeatCol * getBlockWidth(item.tileKey),
    rows: repeatRow * getBlockHeight(item.tileKey),
  };
}

function buildLevelGrid(level: Level, tiles: TileSet): Item[][] {
  const { items } = level;


  const rows = Math.max(...items.map((item) => item.row + (item.repeatRow ?? 1))) + 1;
  const cols = Math.max(...items.map((item) => item.col + (item.repeatCol ?? 1))) + 1;

  const grid: Item[][] = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      tileKey: 'air' as TileName,
      tile: tiles.air,
      col,
      row,
    }))
  );

  for (const item of items) {
 
    const tile = tiles[item.tileKey];
    const normTile = normalizeTile(tile);
    const size = getTileSize(normTile);

    const repeatCol = item.repeatCol ?? 1;
    const repeatRow = item.repeatRow ?? 1;
    
    for (let colRep = 0; colRep < repeatCol; colRep++) {
      for (let rowRep = 0; rowRep < repeatRow; rowRep++) {
        for (let colOffset = 0; colOffset < size.cols; colOffset++) {
          for (let rowOffset = 0; rowOffset < size.rows; rowOffset++) {
            const col = item.col + colOffset + colRep * size.cols;
            const row = item.row + rowOffset + rowRep * size.rows;
            const image = normTile[rowOffset][colOffset];
            if (grid[row]?.[col]?.tileKey === 'air') {
              grid[row][col] = {
                tileKey: item.tileKey,
                tile: image,
                col,
                row,
                repeatCol: 1,
                repeatRow: 1,
              };
            }
          }
        }
      }
    }

  }
  return grid;
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
  ctx.level.items.splice(
    0,
    ctx.level.items.length,
    ...ctx.initialLevelItems.map((item) => ({ ...item }))
  );
  ctx.level.levelGrid = buildLevelGrid(ctx.level, ctx.tiles);
  ctx.level.rowCount = ctx.level.levelGrid.length;
  ctx.level.colCount = ctx.level.levelGrid[0]?.length ?? 0;
  const state = getInitialState();
  state.gumbas = resetGumbas(ctx.level);
  ctx.hero = state.hero;
  ctx.gumbas = state.gumbas;
  ctx.risingCoins = state.risingCoins;
  ctx.animation = state.animation;
  ctx.isFalling = state.isFalling;
}

export function drawGrid(ctx: GameContext): void {
  const { context, width, height, scrollOffset } = ctx;
  const firstCol = Math.floor(-scrollOffset / SIZE);
  const lastCol = Math.ceil((width - scrollOffset) / SIZE);
  const lastRow = Math.ceil(height / SIZE);

  context.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  context.lineWidth = 1;

  for (let col = firstCol; col <= lastCol; col++) {
    const x = col * SIZE + scrollOffset;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let row = 0; row <= lastRow; row++) {
    const y = row * SIZE;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
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

function drawLevelOptimized(ctx: GameContext): void {
  const { level, context, width, height, scrollOffset } = ctx;
  const { levelGrid, rowCount, colCount } = level;

  context.fillStyle = level.backgroundColor;
  context.fillRect(0, 0, width, height);

  drawRisingCoins(ctx);

  const firstCol = Math.max(0, Math.floor(-scrollOffset / SIZE) - 1);
  const lastCol = Math.min(
    colCount - 1,
    Math.ceil((width - scrollOffset) / SIZE) + 1
  );
  const lastRow = Math.min(
    rowCount - 1,
    Math.ceil(height / SIZE) - 1
  );

  if (rowCount === 0 || colCount === 0 || firstCol > lastCol) {
    return;
  }

  for (let row = 0; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const cell = levelGrid[row]?.[col];
      if (cell) {
        drawTile(ctx, cell);
      }
    }
  }
}

