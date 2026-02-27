import {
  SCALE,
  TOLERANCE_LEFT,
  TOLERANCE_RIGHT,
  VELOCITY_Y,
} from './constants';
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
  BaseTileSet,
  DrawOptions,
  drawTile,
  TileCollections,
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
    //offset,
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
      // direction,
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
  const newX = Math.min(candX, maxX);
  gameState.hero.position.x = newX;
  gameState.direction = 'right';
}

function goLeft(gameState: GameState, level: Level, delta: number) {
  const minX = calcMinX(gameState, level);
  const candX = gameState.hero.position.x - 1 * delta;
  const newX = Math.max(candX, minX);
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

  const candY = gameState.hero.position.y + VELOCITY_Y * delta;
  const newY = Math.min(maxY, candY);
  const hitGround = newY === gameState.hero.position.y;
  gameState.hero.position.y = newY;

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
  const x = gameState.hero.position.x;

  const bottom = level.items.filter((item) => {
    return (
      toTop(item) > y &&
      toLeft(item, -TOLERANCE_LEFT) < x &&
      toRight(item, TOLERANCE_RIGHT) > x &&
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
  const blockY = gameState.hero.position.y / SIZE;
  const x = gameState.hero.position.x;

  const above = level.items.filter((item) => {
    return (
      item.row + 1 <= blockY &&
      item.col * SIZE < x + TOLERANCE_LEFT &&
      (item.col + (item.repeatCol || 1) + extraLength(item.tileKey)) * SIZE >
        x + TOLERANCE_RIGHT &&
      isSolid(item.tileKey)
    );
  });
  return above;
}

function calcMaxX(gameState: GameState, level: Level): number {
  const right = getRightSolids(gameState, level);

  let maxX = Infinity;
  if (right.length > 0) {
    const minCol = min(right, (b) => b.col);
    maxX = minCol * SIZE - SIZE + TOLERANCE_RIGHT;
  }

  return maxX;
}

function getRightSolids(gameState: GameState, level: Level) {
  const blockY = gameState.hero.position.y / SIZE;
  const x = gameState.hero.position.x;

  const right = level.items.filter((item) => {
    return (
      x <= item.col * SIZE &&
      blockY >= item.row &&
      blockY <= item.row + (item.repeatRow || 1) + extraHeight(item.tileKey) &&
      isSolid(item.tileKey)
    );
  });
  return right;
}

function calcMinX(gameState: GameState, level: Level): number {
  const below = getLeftSolids(gameState, level);

  let minX = -Infinity;
  if (below.length > 0) {
    const minCol = max(below, (b) => b.col + extraLength(b.tileKey));
    minX = (minCol + 1) * SIZE - TOLERANCE_RIGHT;
  }

  return minX;
}

function getLeftSolids(gameState: GameState, level: Level) {
  const blockY = gameState.hero.position.y / SIZE;
  const x = gameState.hero.position.x;

  const below = level.items.filter((item) => {
    return (
      x >= item.col * SIZE &&
      blockY >= item.row &&
      blockY <= item.row + (item.repeatRow || 1) + extraHeight(item.tileKey) &&
      isSolid(item.tileKey)
    );
  });
  return below;
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

function toLeft(item: Item, offset = 0): number {
  return item.col * SIZE + offset;
}

function toRight(item: Item, offset = 0): number {
  const repeat = item.repeatCol ?? 1;
  const blockWidth = getBlockWidth(item.tileKey);
  return (item.col + repeat * blockWidth) * SIZE - offset;
}

function toTop(item: Item, offset = 0): number {
  return item.row * SIZE + offset;
}

function toBottom(item: Item, offset = 0): number {
  const repeat = item.repeatRow ?? 1;
  const blockHeight = getBlockHeight(item.tileKey);
  return (item.row + repeat * blockHeight) * SIZE - offset;
}

function checkCoinsCollision(level: Level, gameState: GameState): void {
  const heroLeft = gameState.hero.position.x;
  const heroRight = heroLeft + SIZE;
  const heroTop = gameState.hero.position.y;
  const heroBottom = heroTop + SIZE;

  const offset = SIZE / 3;

  const collidingCoins = level.items.filter((item) => {
    if (item.tileKey !== 'coin') return false;

    return (
      heroRight > toLeft(item, offset) &&
      heroLeft < toRight(item, offset) &&
      heroBottom > toTop(item, offset) &&
      heroTop < toBottom(item, offset)
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

function extraLength(tileKey: TileName): number {
  if (tileKey === 'pipeTop') {
    return 1; // pipes are one tile wider
  }
  return 0;
}

function extraHeight(tileKey: TileName): number {
  if (tileKey === 'pipeTop') {
    return 2; // pipes are one tile higher
  }
  return 0;
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
