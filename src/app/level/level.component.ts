import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { TilesLoaderService } from './tiles.loader.service';

@Component({
  selector: 'app-level',
  imports: [],
  templateUrl: './level.component.html',
})
export class LevelComponent {
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  context = computed(() => this.canvas()?.nativeElement.getContext('2d'));

  tilesLoader = inject(TilesLoaderService);

  tilesResource = this.tilesLoader.getTilesResource();
  tilesMap = this.tilesResource.value;

  constructor() {
    effect(() => {
      console.log('tilesMap', this.tilesMap());
      console.log('canvas', this.canvas());

      const tilesMap = this.tilesMap();
      const context = this.context();

      const c = this.canvas();

      if (context && tilesMap) {
        render(context, tilesMap);
      }
    });
  }
}

const SIZE = 16;
type Palette = {
  x: number;
  y: number;
};

type PaletteOffset = {
  overworld: Palette;
  underworld: Palette;
  underwater: Palette;
  snow: Palette;
}

async function render(
  context: CanvasRenderingContext2D,
  tiles: Blob
): Promise<void> {
  const bitmap = await createImageBitmap(tiles);

  context.scale(3, 3);
  const p1Base: Palette = {
    x: 0,
    y: 16,
  };

  const p1Offset: PaletteOffset = {
    overworld: { x: 0, y: 0},
    underworld: { x: 8 * (SIZE+1) +11, y: 0},
    underwater: { x: 8 * (SIZE+1) +11, y: 4 * (SIZE+1) +16},
    snow: { x: 0, y: 4 * (SIZE+1) +16},
  }

  p1Base.x += p1Offset.snow.x;
  p1Base.y += p1Offset.snow.y;

  const p3Base: Palette = {
    x: 298,
    y: 78,
  };

  const p3Offset: PaletteOffset = {
    overworld: { x: 0, y: 0},
    underworld: { x: 5 * (SIZE+1) +11, y: 0},
    snow: { x: 5*2 * (SIZE+1) +11*2, y: 0},
    underwater: { x: 5*3 * (SIZE+1) +11*3, y: 0},
  }

  p3Base.x += p3Offset.snow.x;
  p3Base.y += p3Offset.snow.y;

  const p2Base: Palette = {
    x: 298,
    y: 78 - 62,
  };

  const p2Offset: PaletteOffset = {
    overworld: { x: 0, y: 0},
    underworld: { x: 5 * (SIZE+1) +11, y: 0},
    snow: { x: 5*2 * (SIZE+1) +11*2, y: 0},
    underwater: { x: 5*3 * (SIZE+1) +11*3, y: 0},
  }

  p2Base.x += p2Offset.underwater.x;
  p2Base.y += p2Offset.underwater.y;

  const p0Base: Palette = {
    x: 0,
    y: 12 * (SIZE + 1) - 8,
  };

  const p0Offset: PaletteOffset = {
    overworld: { x: 0, y: 0},
    underworld: { x: 9 * (SIZE+1) +11, y: 0},
    underwater: { x: 9 * (SIZE+1) +11, y: 4 * (SIZE+1) +16},
    snow: { x: 0, y: 4 * (SIZE+1) +16},
  }

  p0Base.x += p0Offset.snow.x;
  p0Base.y += p0Offset.snow.y;


  const cloudTopLeft = await getTile(bitmap, p2Base, 0, 0);
  const cloudTopMiddle = await getTile(bitmap, p2Base, 1, 0);
  const cloudTopRight = await getTile(bitmap, p2Base, 2, 0);
  const cloudBottomLeft = await getTile(bitmap, p2Base, 0, 1);
  const cloudBottomMiddle = await getTile(bitmap, p2Base, 1, 1);
  const cloudBottomRight = await getTile(bitmap, p2Base, 2, 1);
  const waves = await getTile(bitmap, p2Base, 3, 0);
  const water = await getTile(bitmap, p2Base, 3, 1);
  const floor = await getTile(bitmap, p1Base, 0, 0);
  const brick = await getTile(bitmap, p1Base, 1, 0);
  const stump = await getTile(bitmap, p1Base, 1, 3);
  const qm = await getTile(bitmap, p3Base, 0, 0);
  const coin = await getTile(bitmap, p3Base, 0, 1);
  const topLeft = await getTile(bitmap, p0Base, 0, 0);
  const topMiddle = await getTile(bitmap, p0Base, 1, 0);
  const topRight = await getTile(bitmap, p0Base, 2, 0);
  const bushLeft = await getTile(bitmap, p0Base, 0, 1);
  const bushMiddle = await getTile(bitmap, p0Base, 1, 1);
  const bushRight = await getTile(bitmap, p0Base, 2, 1);
  const hillLeft = await getTile(bitmap, p0Base, 0, 3);
  const hillInnerLeft = await getTile(bitmap, p0Base, 1, 3);
  const hillMiddle = await getTile(bitmap, p0Base, 2, 3);
  const hillInnerRight = await getTile(bitmap, p0Base, 3, 3);
  const hillRight = await getTile(bitmap, p0Base, 4, 3);
  const hillTop = await getTile(bitmap, p0Base, 2, 2);
  const pipeTopLeft = await getTile(bitmap, p0Base, 7, 0);
  const pipeLeft = await getTile(bitmap, p0Base, 7, 1);
  const pipeTopRight = await getTile(bitmap, p0Base, 8, 0);
  const pipeRight = await getTile(bitmap, p0Base, 8, 1);
  const treeTop = await getTile(bitmap, p0Base, 6, 0);
  const treeBottom = await getTile(bitmap, p0Base, 6, 1);

  const treeCrown = [[treeTop], [treeBottom]];

  const smallHill = [
    [null, null, hillTop, null, null],
    [null, hillLeft, hillMiddle, hillRight, null],
  ];

  const hill = [
    ...smallHill,
    [hillLeft, hillInnerLeft, hillMiddle, hillInnerRight, hillRight],
  ];

  const bush = [bushLeft, bushMiddle, bushRight];
  const top = [topLeft, topMiddle, topRight];

  const cloud = [
    [cloudTopLeft, cloudTopMiddle, cloudTopRight],
    [cloudBottomLeft, cloudBottomMiddle, cloudBottomRight],
  ];

  const pipeSegment = [[pipeLeft, pipeRight]];

  const pipeTop = [[pipeTopLeft, pipeTopRight], ...pipeSegment];

  // const brick = await createImageBitmap(bitmap, p1.x + SIZE+1, p1.y, SIZE, SIZE);

  // context.drawImage(floor, 0, 0);
  // context.drawImage(brick, SIZE, 0);
  // context.drawImage(qm, 2*SIZE, 0);
  // context.drawImage(coin, 3*SIZE, 0);
  // context.drawImage(topLeft, 4*SIZE, 0);
  // context.drawImage(topMiddle, 5*SIZE, 0);
  // context.drawImage(topRight, 6*SIZE, 0);
  // context.drawImage(pipeTopLeft, 7*SIZE, 0);
  // context.drawImage(pipeTopRight, 8*SIZE, 0);
  // context.drawImage(pipeLeft, 7*SIZE, SIZE);
  // context.drawImage(pipeRight, 8*SIZE, SIZE);

  // context.drawImage(bushLeft, 9*SIZE, 0);
  // context.drawImage(bushMiddle, 10*SIZE, 0);
  // context.drawImage(bushRight, 11*SIZE, 0);

  // context.drawImage(hillLeft, SIZE*1, SIZE*4);
  // context.drawImage(hillInnerLeft, SIZE*2, SIZE*4);
  // context.drawImage(hillMiddle, SIZE*3, SIZE*4);
  // context.drawImage(hillInnerRight, SIZE*4, SIZE*4);
  // context.drawImage(hillRight, SIZE*5, SIZE*4);

  // context.drawImage(hillLeft, SIZE*2, SIZE*3);
  // context.drawImage(hillMiddle, SIZE*3, SIZE*3);
  // context.drawImage(hillRight, SIZE*4, SIZE*3);

  // context.drawImage(hillTop, SIZE*3, SIZE*2);

  // context.drawImage(treeTop, SIZE*6, SIZE*2);
  // context.drawImage(treeBottom, SIZE*6, SIZE*3);
  // context.drawImage(stump, SIZE*6, SIZE*4);

  // context.drawImage(cloudTopLeft, SIZE*8, SIZE*3);
  // context.drawImage(cloudTopMiddle, SIZE*9, SIZE*3);
  // context.drawImage(cloudTopRight, SIZE*10, SIZE*3);
  // context.drawImage(cloudBottomLeft, SIZE*8, SIZE*4);
  // context.drawImage(cloudBottomMiddle, SIZE*9, SIZE*4);
  // context.drawImage(cloudBottomRight, SIZE*10, SIZE*4);

  // context.drawImage(waves, SIZE*12, SIZE*3);
  // context.drawImage(water, SIZE*12, SIZE*4);

  drawTile(context, cloud, {
    col: 0,
    row: 0,
    repeatCol: 2,
    repeatRow: 2,
  });

  drawTile(context, floor, {
    col: 0,
    row: 7,
    repeatCol: 20,
    repeatRow: 2,
  });

  drawTile(context, pipeTop, {
    col: 6,
    row: 3,
  });
  drawTile(context, pipeSegment, {
    col: 6,
    row: 5,
    repeatRow: 2,
  });

  drawTile(context, qm, {
    col: 0,
    row: 4,
    repeatRow: 1,
  });

}

type Tile = ImageBitmap | ImageBitmap[] | ImageBitmap[][];
type NormalizedTile = ImageBitmap[][];

type DrawTileOptions = {
  col: number;
  row: number;
  repeatCol?: number;
  repeatRow?: number;
};

type NormalizedDrawTileOptions = {
  col: number;
  row: number;
  repeatCol: number;
  repeatRow: number;
};

const defaultDrawTileOptions: NormalizedDrawTileOptions = {
  col: 0,
  row: 0,
  repeatCol: 1,
  repeatRow: 1,
};

type TileSize = {
  cols: number;
  rows: number;
};

function drawTile(
  context: CanvasRenderingContext2D,
  tile: Tile,
  options: DrawTileOptions
): void {
  const normOptions: NormalizedDrawTileOptions = {
    ...defaultDrawTileOptions,
    ...options,
  };
  const normTile = normalizeTile(tile);
  const size = getTileSize(normTile);

  for (let colRep = 0; colRep < normOptions.repeatCol; colRep++) {
    for (let rowRep = 0; rowRep < normOptions.repeatRow; rowRep++) {
      for (let colOffset = 0; colOffset < size.cols; colOffset++) {
        for (let rowOffset = 0; rowOffset < size.rows; rowOffset++) {
          const col = options.col + colOffset + colRep * size.cols;
          const row = options.row + rowOffset + rowRep * size.rows;
          const image = normTile[rowOffset][colOffset];
          context.drawImage(image, SIZE * col, SIZE * row);
        }
      }
    }
  }
}

function normalizeTile(tile: Tile): ImageBitmap[][] {
  if (!Array.isArray(tile)) {
    return [[tile]];
  }
  if (!Array.isArray(tile[0])) {
    return [tile] as ImageBitmap[][];
  }
  return tile as ImageBitmap[][];
}

function getTileSize(tile: NormalizedTile): TileSize {
  return {
    rows: tile.length,
    cols: tile[0].length,
  };
}

async function getTile(
  bitmap: ImageBitmap,
  p: Palette,
  row: number,
  col: number
) {
  return await createImageBitmap(
    bitmap,
    p.x + row * (SIZE + 1),
    p.y + col * (SIZE + 1),
    SIZE,
    SIZE
  );
}
