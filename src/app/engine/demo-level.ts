import { Level } from './level';

export const demoLevel: Level = {
  levelId: 0,
  backgroundColor: '#9494ff',
  items: [
    {
      tileKey: 'cloud',
      col: 0,
      row: 0,
      repeatCol: 2,
      repeatRow: 2,
    },
    {
      tileKey: 'floor',
      col: 0,
      row: 7,
      repeatCol: 20,
      repeatRow: 2,
    },
    {
      tileKey: 'pipeTop',
      col: 6,
      row: 3,
    },
    {
      tileKey: 'pipeSegment',
      col: 6,
      row: 5,
      repeatRow: 2,
    },
    {
      tileKey: 'questionMark',
      col: 0,
      row: 4,
      repeatRow: 1,
    },
    { tileKey: 'coin', col: 2, row: 6 },
    { tileKey: 'coin', col: 4, row: 6 },
    { tileKey: 'coin', col: 5, row: 5 },
    { tileKey: 'coin', col: 8, row: 6 },
    { tileKey: 'coin', col: 10, row: 6 },
  ],
};
