import type { Item } from './tiles';

export type GumbaStart = { col: number; row: number };

export type Level = {
  levelId: number;
  backgroundColor: string;
  items: Item[];
  gumbas: GumbaStart[];
};
