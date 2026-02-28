import type { ObjectState } from './types';
import type { HeroTileSet } from './hero-tiles';
import type { GumbaTileSet } from './gumba-tiles';
import type { Level } from './types';
import type { TileSet } from './tiles';

export type Direction = 'right' | 'left';

export type RisingCoin = {
  col: number;
  row: number;
  startTime: number;
};

export type HeroState = ObjectState & {
  acceleration: number;
  jumpStart: number;
  runStart: number;
};

export type GumbaState = ObjectState & {
  direction: Direction;
  alive: boolean;
};

export type GameOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  level: Level;
  initialLevelItems: Level['items'];
  tiles: TileSet;
  heroTiles: HeroTileSet;
  gumbaTiles: GumbaTileSet;
  speed: number;
  timeStamp: number;
  formerTimeStamp: number;
  abortSignal: AbortSignal;
  direction: Direction;
  hero: HeroState;
  gumbas: GumbaState[];
  risingCoins: RisingCoin[];
  animation: boolean;
  isFalling: boolean;
  hitTop: boolean;
  hitTopTimeStamp?: number;
};

export type GameContext = GameOptions & {
  levelId: number;
  maxOffset: number;
  width: number;
  height: number;
  delta: number;
  beaten: boolean;
  fellOff: boolean;
  movedVertically: boolean;
  renderX: number;
  scrollOffset: number;
};

export function createInitialGameOptions() {
  return {
    speed: 10,
    timeStamp: 0,
    formerTimeStamp: 0,
    direction: 'right' as Direction,
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
    hitTop: false,
  };
}
