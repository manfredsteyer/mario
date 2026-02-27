import type { DrawOptions, TileSet } from './tiles';

export type GumbaStart = { col: number; row: number };

export type TileName = keyof TileSet | 'collected';

export type Item = { tileKey: TileName } & DrawOptions;

export type Level = {
  levelId: number;
  backgroundColor: string;
  items: Item[];
  gumbas: GumbaStart[];
};
