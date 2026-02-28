import type { Item } from './tiles';

export type Position = {
  x: number;
  y: number;
};

export type ObjectState = {
  position: Position;
};

export type GumbaStart = { col: number; row: number };

export type Level = {
  levelId: number;
  backgroundColor: string;
  items: Item[];
  gumbas: GumbaStart[];
  levelGrid: Item[][];
  rowCount: number;
  colCount: number;
};
