export const SIZE = 16;

export type Palette = {
  x: number;
  y: number;
};

export type PaletteOffset = {
  overworld: Palette;
  underground: Palette;
  underwater: Palette;
  castle: Palette;
};

export type Style = keyof PaletteOffset;

//
//  This example is just using Palettes 0 to 3 from the
//  tile map, called p0 to p3 here
//

export type Palettes = {
  p0: Palette;
  p1: Palette;
  p2: Palette;
  p3: Palette;
};

const p1Base: Palette = {
  x: 0,
  y: 16,
};

const p1Offsets: PaletteOffset = {
  overworld: { x: 0, y: 0 },
  underground: { x: 8 * (SIZE + 1) + 11, y: 0 },
  underwater: { x: 8 * (SIZE + 1) + 11, y: 4 * (SIZE + 1) + 16 },
  castle: { x: 0, y: 4 * (SIZE + 1) + 16 },
};

const p3Base: Palette = {
  x: 298,
  y: 78,
};

const p3Offsets: PaletteOffset = {
  overworld: { x: 0, y: 0 },
  underground: { x: 5 * (SIZE + 1) + 11, y: 0 },
  castle: { x: 5 * 2 * (SIZE + 1) + 11 * 2, y: 0 },
  underwater: { x: 5 * 3 * (SIZE + 1) + 11 * 3, y: 0 },
};

const p2Base: Palette = {
  x: 298,
  y: 78 - 62,
};

const p2Offsets: PaletteOffset = {
  overworld: { x: 0, y: 0 },
  underground: { x: 5 * (SIZE + 1) + 11, y: 0 },
  castle: { x: 5 * 2 * (SIZE + 1) + 11 * 2, y: 0 },
  underwater: { x: 5 * 3 * (SIZE + 1) + 11 * 3, y: 0 },
};

const p0Base: Palette = {
  x: 0,
  y: 12 * (SIZE + 1) - 8,
};

const p0Offsets: PaletteOffset = {
  overworld: { x: 0, y: 0 },
  underground: { x: 9 * (SIZE + 1) + 11, y: 0 },
  underwater: { x: 9 * (SIZE + 1) + 11, y: 4 * (SIZE + 1) + 16 },
  castle: { x: 0, y: 4 * (SIZE + 1) + 16 },
};

function addOffset(p: Palette, offset: Palette): Palette {
  return {
    x: p.x + offset.x,
    y: p.y + offset.y,
  };
}

export function getPalettes(theme: Style): Palettes {
  const p0Offset = p0Offsets[theme];
  const p1Offset = p1Offsets[theme];
  const p2Offset = p2Offsets[theme];
  const p3Offset = p3Offsets[theme];

  return {
    p0: addOffset(p0Base, p0Offset),
    p1: addOffset(p1Base, p1Offset),
    p2: addOffset(p2Base, p2Offset),
    p3: addOffset(p3Base, p3Offset),
  };
}
