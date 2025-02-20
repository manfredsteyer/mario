import { DrawOptions, drawTile, TileSet } from './tiles';

export type Level = {
  backgroundColor: string;
  items: Item[];
};

export type TileName = keyof TileSet;

export type Item = { tileKey: TileName } & DrawOptions;

export type AnimateOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
  abortSignal?: AbortSignal;
};

export function animate(options: AnimateOptions) {
  const { canvas, level, tiles } = options;

  const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

  if (!context) {
    throw new Error('canvas 2d expected!');
  }

  const abortSignal = options.abortSignal ?? new AbortController().signal;

  step({ canvas, context, level, tiles, offset: 0, speed: 2, abortSignal });
}

type StepOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  level: Level;
  tiles: TileSet;
  offset: number;
  speed: number;
  abortSignal: AbortSignal;
};

function step(options: StepOptions): void {
  const { canvas, context, level, tiles, offset, speed } = options;

  if (offset < -150) {
    return;
  }

  if (options.abortSignal.aborted) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;

  drawLevel({ level, offset, tiles, context, width, height });

  requestAnimationFrame(() => step({ ...options, offset: offset - speed }));
}

export type RenderOptions = {
  canvas: HTMLCanvasElement;
  level: Level;
  tiles: TileSet;
};

export function render(options: RenderOptions): void {
  const { canvas, level, tiles } = options;

  const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

  if (!context) {
    throw new Error('canvas 2d expected!');
  }

  const width = canvas.width;
  const height = canvas.height;

  drawLevel({ level, offset: 0, tiles, context, width, height });
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
