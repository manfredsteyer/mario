import type { Direction, GameState } from './game-state';
import type { HeroTileSet } from './hero-tiles';
import type { GumbaTileSet } from './gumba-tiles';
import type { Level } from './types';
import type { TileSet } from './tiles';

export type StepOptions = {
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

export type StepContext = StepOptions & {
  gameState: GameState;
  width: number;
  height: number;
  delta: number;
  beaten: boolean;
  fellOff: boolean;
  movedVertically: boolean;
  renderX: number;
  scrollOffset: number;
};
