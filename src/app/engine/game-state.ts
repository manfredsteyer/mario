export type Direction = 'right' | 'left';

export type ObjectState = {
  position: Position;
};

export type HeroState = ObjectState & {
  position: Position;
  acceleration: number;
  jumpStart: number;
  runStart: number;
};

export type GumbaState = ObjectState & {
  direction: Direction;
  alive: boolean;
};
export type Position = {
  x: number;
  y: number;
};

export type RisingCoin = {
  col: number;
  row: number;
  startTime: number;
};
