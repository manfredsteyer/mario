import type {
  Direction,
  HeroState,
  GumbaState,
  RisingCoin,
} from './game-state';
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
  gumbaTiles: GumbaTileSet;
  speed: number;
  timeStamp: number;
  formerTimeStamp: number;
  abortSignal: AbortSignal;
  direction: Direction;
  hero: HeroState;
  gumbas: GumbaState[];
  risingCoins: RisingCoin[];
  hitQuestionBlocks: Set<string>;
  animation: boolean;
  isFalling: boolean;
};

export type StepContext = StepOptions & {
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

export function createInitialStepOptions() {
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
    hitQuestionBlocks: new Set<string>(),
    animation: false,
    isFalling: false,
  };
}
