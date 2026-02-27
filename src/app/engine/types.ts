import type { Item, TileSet } from './tiles';

export type { Item, TileName } from './tiles';

export type GumbaStart = { col: number; row: number };

export type Level = {
  levelId: number;
  backgroundColor: string;
  items: Item[];
  gumbas: GumbaStart[];
};
